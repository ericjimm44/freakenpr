"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { AppFrame } from "@/components/AppFrame";
import { ScoreRing } from "@/components/ScoreRing";
import { MissionCard } from "@/components/MissionCard";
import { Icon } from "@/components/Icon";
import { ChildAvatar } from "@/components/ChildAvatar";
import { computeMemoryScore } from "@/lib/memoryScore";
import { suggestMissions, teaseNextMission } from "@/lib/aiEngine";
import { categoryMeta } from "@/lib/categories";
import { COLOR_HEX } from "@/lib/utils";

function HomeInner() {
  const family = useStore((s) => s.family)!;
  const missions = useStore((s) => s.missions);
  const achievements = useStore((s) => s.achievements);

  const score = useMemo(() => computeMemoryScore(missions, family), [missions, family]);
  const suggestions = useMemo(
    () => suggestMissions(family, missions, 3),
    [family, missions]
  );
  const upcoming = missions.find((m) => m.status === "planned" || m.status === "active");
  const completed = missions.filter((m) => m.status === "completed");
  const recent = [...completed].reverse().slice(0, 3);
  const earnedCount = achievements.filter((a) => a.earnedAt).length;

  const tease = teaseNextMission(suggestions[0]);

  return (
    <div>
      {/* Header */}
      <header className="bg-forest px-6 pb-20 pt-8 text-parchment">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-parchment/60">
              Welcome back
            </p>
            <h1 className="font-display text-2xl font-black">{family.surname}</h1>
          </div>
          <div className="flex -space-x-2">
            {family.children.map((c) => (
              <ChildAvatar key={c.id} child={c} size={36} />
            ))}
          </div>
        </div>
        {score.streak.weeks > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-parchment/15 px-3 py-1 text-sm font-semibold">
            <Icon name="Flame" size={15} className="text-gold-light" />
            {score.streak.weeks}-week adventure streak
          </div>
        )}
      </header>

      {/* Score card floating over the header */}
      <div className="-mt-14 px-6">
        <Link
          href="/score"
          className="card flex items-center gap-4 p-5 transition hover:shadow-lift"
        >
          <ScoreRing total={score.total} size={120} />
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <MiniStat icon="Flag" label="Missions" value={score.completedMissions.count} />
              <MiniStat icon="Map" label="States" value={score.states.count} />
              <MiniStat icon="Camera" label="Photos" value={score.photos.count} />
              <MiniStat icon="Star" label="Avg" value={score.ratings.avg || "—"} />
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-forest">
              See the breakdown <Icon name="ArrowRight" size={13} />
            </p>
          </div>
        </Link>
      </div>

      {/* Anticipation: next mission tease */}
      <section className="px-6 pt-6">
        <div className="card relative overflow-hidden p-5">
          <div className="absolute -right-6 -top-6 opacity-10">
            <Icon name="Sparkles" size={120} className="text-sunset" />
          </div>
          <p className="label flex items-center gap-1 text-sunset">
            <Icon name="Sparkles" size={13} /> AI Mission Architect
          </p>
          <p className="mt-2 font-display text-lg font-semibold leading-snug">
            {tease}
          </p>
          <Link href="/missions/new" className="btn-sun mt-4">
            Plan this mission <Icon name="ArrowRight" size={15} />
          </Link>
        </div>
      </section>

      {/* Active / planned mission */}
      {upcoming && (
        <section className="px-6 pt-6">
          <SectionTitle title="Your next mission" href="/missions" />
          <div className="mt-3">
            <MissionCard mission={upcoming} />
          </div>
        </section>
      )}

      {/* Suggestion rail */}
      <section className="pt-6">
        <div className="px-6">
          <SectionTitle title="Recommended for your crew" />
        </div>
        <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-6 pb-1">
          {suggestions.map((s, i) => {
            const meta = categoryMeta(s.category);
            const accent = COLOR_HEX[meta.accent];
            return (
              <Link
                key={i}
                href="/missions/new"
                className="card w-60 shrink-0 snap-start p-4"
              >
                <span className="chip" style={{ color: accent }}>
                  <Icon name={meta.icon} size={13} /> {meta.label}
                </span>
                <h3 className="mt-2 font-display text-base font-semibold leading-tight">
                  {s.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-ink/60">{s.description}</p>
                <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-forest">
                  <Icon name="Sparkles" size={12} /> {s.reason}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent memories */}
      {recent.length > 0 && (
        <section className="px-6 pt-6">
          <SectionTitle title="Recent memories" href="/missions" />
          <div className="mt-3 space-y-3">
            {recent.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </div>
        </section>
      )}

      {/* Achievements teaser */}
      <section className="px-6 py-6">
        <Link href="/lore" className="card flex items-center gap-4 p-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-clay">
            <Icon name="Trophy" size={22} />
          </span>
          <div className="flex-1">
            <p className="font-display font-semibold">{earnedCount} badges earned</p>
            <p className="text-xs text-ink/55">Tap to see your family lore & milestones</p>
          </div>
          <Icon name="ChevronRight" size={20} className="text-ink/30" />
        </Link>
      </section>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} size={15} className="text-ink/40" />
      <span className="font-display text-lg font-bold leading-none">{value}</span>
      <span className="text-[11px] text-ink/50">{label}</span>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-semibold text-forest">
          See all
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <AppFrame>
      <HomeInner />
    </AppFrame>
  );
}
