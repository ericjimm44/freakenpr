-- ════════════════════════════════════════════════════════════════════════════
-- Adventure Dad — Supabase / Postgres schema
--
-- Mirrors the TypeScript domain in /src/lib/types.ts. Row-Level Security scopes
-- every row to the owning family so a parent only ever sees their own story.
-- Auth is provided by Clerk; `families.owner_id` stores the Clerk user id.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────────────
create type mission_category as enum (
  'space','history','animals','nature','road_trip','beach','mountains',
  'food','sports','hidden_gems','learning','camping','seasonal'
);
create type mission_status   as enum ('suggested','planned','active','completed');
create type challenge_audience as enum ('parent','child','bonus');
create type budget_pref      as enum ('low','medium','high');

-- ── Families ────────────────────────────────────────────────────────────────
create table families (
  id                uuid primary key default gen_random_uuid(),
  owner_id          text not null,                       -- Clerk user id
  surname           text not null,
  parent_name       text not null,
  home_base         text,
  budget_preference budget_pref not null default 'medium',
  max_travel_minutes int not null default 120,
  created_at        timestamptz not null default now()
);
create index families_owner_idx on families(owner_id);

-- ── Children ────────────────────────────────────────────────────────────────
create table children (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references families(id) on delete cascade,
  name         text not null,
  age          int  not null check (age between 0 and 25),
  interests    text[] not null default '{}',
  dislikes     text[] not null default '{}',
  avatar_color text not null default 'sunset',
  created_at   timestamptz not null default now()
);
create index children_family_idx on children(family_id);

-- ── Missions ────────────────────────────────────────────────────────────────
create table missions (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  code          text not null,                           -- "Mission 001"
  title         text not null,
  description   text,
  category      mission_category not null,
  location      text,
  lat           double precision,
  lng           double precision,
  state         text,                                    -- 2-letter code
  status        mission_status not null default 'planned',
  rating        numeric(3,1) check (rating between 0 and 10),
  ai_summary    text,
  favorite_moment text,
  funniest_moment text,
  surprise        text,
  recommend       boolean,
  next_mission_wish text,
  estimated_cost  text,
  estimated_drive_minutes int,
  scheduled_for timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index missions_family_idx on missions(family_id);
create index missions_status_idx on missions(family_id, status);

-- ── Challenges ──────────────────────────────────────────────────────────────
create table challenges (
  id          uuid primary key default gen_random_uuid(),
  mission_id  uuid not null references missions(id) on delete cascade,
  audience    challenge_audience not null,
  child_id    uuid references children(id) on delete set null,
  text        text not null,
  done        boolean not null default false
);
create index challenges_mission_idx on challenges(mission_id);

-- ── Photos (path into Supabase Storage bucket `mission-photos`) ──────────────
create table photos (
  id          uuid primary key default gen_random_uuid(),
  mission_id  uuid not null references missions(id) on delete cascade,
  storage_path text not null,
  caption     text,
  created_at  timestamptz not null default now()
);
create index photos_mission_idx on photos(mission_id);

-- ── Per-child mission ratings (powers Child Participation) ───────────────────
create table child_ratings (
  mission_id uuid not null references missions(id) on delete cascade,
  child_id   uuid not null references children(id) on delete cascade,
  rating     int  not null check (rating between 1 and 10),
  primary key (mission_id, child_id)
);

-- ── Achievements (unlocked badges per family) ───────────────────────────────
create table achievements (
  family_id   uuid not null references families(id) on delete cascade,
  achievement_id text not null,                          -- catalog key
  earned_at   timestamptz not null default now(),
  primary key (family_id, achievement_id)
);

-- ── Family lore snapshots (generated narrative cache) ───────────────────────
create table lore_snapshots (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  headline    text,
  body        jsonb,                                     -- paragraphs, jokes, stats
  generated_at timestamptz not null default now()
);

-- ── Family Memory Score view (the North Star, computed live) ─────────────────
create view family_memory_score as
select
  f.id as family_id,
  count(m.*) filter (where m.status = 'completed') as completed_missions,
  coalesce(avg(m.rating) filter (where m.status = 'completed'), 0) as avg_rating,
  (select count(*) from photos p join missions mm on mm.id = p.mission_id
     where mm.family_id = f.id and mm.status = 'completed') as photo_count,
  count(distinct m.state) filter (where m.status = 'completed') as states_visited
from families f
left join missions m on m.family_id = f.id
group by f.id;

-- ════════════════════════════════════════════════════════════════════════════
-- Row-Level Security — every table scoped to the requesting Clerk user.
-- Assumes a JWT claim `sub` = Clerk user id exposed via auth.jwt()->>'sub'.
-- ════════════════════════════════════════════════════════════════════════════
alter table families     enable row level security;
alter table children     enable row level security;
alter table missions     enable row level security;
alter table challenges   enable row level security;
alter table photos       enable row level security;
alter table child_ratings enable row level security;
alter table achievements enable row level security;
alter table lore_snapshots enable row level security;

create policy "own family" on families
  for all using (owner_id = auth.jwt()->>'sub')
  with check (owner_id = auth.jwt()->>'sub');

-- Helper: a row belongs to me if its family is mine.
create or replace function owns_family(fid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from families f
    where f.id = fid and f.owner_id = auth.jwt()->>'sub'
  );
$$;

create policy "own children"      on children      for all using (owns_family(family_id)) with check (owns_family(family_id));
create policy "own missions"      on missions      for all using (owns_family(family_id)) with check (owns_family(family_id));
create policy "own achievements"  on achievements  for all using (owns_family(family_id)) with check (owns_family(family_id));
create policy "own lore"          on lore_snapshots for all using (owns_family(family_id)) with check (owns_family(family_id));

create policy "own challenges" on challenges for all using (
  exists (select 1 from missions m where m.id = mission_id and owns_family(m.family_id))
);
create policy "own photos" on photos for all using (
  exists (select 1 from missions m where m.id = mission_id and owns_family(m.family_id))
);
create policy "own child_ratings" on child_ratings for all using (
  exists (select 1 from missions m where m.id = mission_id and owns_family(m.family_id))
);
