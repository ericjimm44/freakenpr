import type {
  Child,
  Family,
  Mission,
  MissionCategory,
  Challenge,
  FamilyLore,
} from "./types";
import { categoryMeta } from "./categories";
import { uid } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// AI Mission Architect (local engine)
//
// This is a deterministic, offline stand-in for the OpenAI-backed engine. It
// implements the same interface the production engine exposes (see
// /src/lib/ai/README in docs), so the UI never changes when you swap in
// `/api/ai/*` routes that call OpenAI. It already does the *reasoning the spec
// asks for*: weight by interests, avoid repetition, respect dislikes, budget,
// travel radius and ages.
// ─────────────────────────────────────────────────────────────────────────────

// A small idea bank keyed by category. In production these become AI-generated
// + Mapbox/Places-grounded. Coordinates are real so the Adventure Map renders.
interface Idea {
  title: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
  cost: string;
  driveMinutes: number;
  minAge: number;
  needsDeepWater?: boolean;
}

const IDEAS: Record<MissionCategory, Idea[]> = {
  space: [
    { title: "Kennedy Space Center", location: "Merritt Island, FL", state: "FL", lat: 28.524, lng: -80.681, description: "Stand beneath a real Saturn V, touch a moon rock, and feel a launch in your chest.", cost: "$$", driveMinutes: 55, minAge: 4 },
    { title: "Planetarium Night Sky Show", location: "Orlando Science Center, FL", state: "FL", lat: 28.572, lng: -81.367, description: "Recline under a dome of stars and chase constellations across the galaxy.", cost: "$", driveMinutes: 20, minAge: 5 },
  ],
  history: [
    { title: "Castillo de San Marcos", location: "St. Augustine, FL", state: "FL", lat: 29.898, lng: -81.311, description: "Explore the oldest masonry fort in the country and find the coolest cannon on the wall.", cost: "$", driveMinutes: 90, minAge: 5 },
    { title: "The Castle Adventure", location: "Solomon's Castle, Ona, FL", state: "FL", lat: 27.45, lng: -81.93, description: "A hand-built castle made from recycled treasure, hidden deep in the countryside.", cost: "$", driveMinutes: 75, minAge: 6 },
  ],
  animals: [
    { title: "Wild Florida Safari", location: "Kenansville, FL", state: "FL", lat: 27.95, lng: -81.08, description: "Airboat past gators, meet a sloth, and count how many animals you can spot.", cost: "$$", driveMinutes: 60, minAge: 4 },
    { title: "Manatee Spotting", location: "Blue Spring State Park, FL", state: "FL", lat: 28.948, lng: -81.339, description: "Watch gentle manatees drift through crystal spring water from the boardwalk.", cost: "$", driveMinutes: 45, minAge: 3 },
  ],
  nature: [
    { title: "Crystal Springs Hike", location: "Wekiwa Springs State Park, FL", state: "FL", lat: 28.712, lng: -81.46, description: "Follow shaded trails to a bubbling spring and look for turtles sunning on logs.", cost: "$", driveMinutes: 35, minAge: 4, needsDeepWater: false },
    { title: "Sunset Boardwalk Walk", location: "Lake Apopka Loop, FL", state: "FL", lat: 28.62, lng: -81.62, description: "A golden-hour ramble past birds, big skies, and the best sunset in the county.", cost: "Free", driveMinutes: 30, minAge: 2 },
  ],
  road_trip: [
    { title: "Buc-ee's Legendary Pit Stop", location: "Daytona Beach, FL", state: "FL", lat: 29.18, lng: -81.07, description: "The greatest road-trip stop ever built — snacks, brisket, and a 50-stall adventure.", cost: "$", driveMinutes: 70, minAge: 1 },
    { title: "Two-State Road Trip", location: "Florida → Georgia line", state: "GA", lat: 30.75, lng: -82.0, description: "Cross a state line, snap a 'we were here' photo, and start a new state pin.", cost: "$$", driveMinutes: 150, minAge: 3 },
  ],
  beach: [
    { title: "Beach Mission: Tide Pools", location: "Canaveral National Seashore, FL", state: "FL", lat: 28.76, lng: -80.74, description: "Hunt for shells, build a fortress, and dare the waves to knock it down.", cost: "$", driveMinutes: 65, minAge: 2, needsDeepWater: false },
    { title: "Sandbar Sunrise", location: "New Smyrna Beach, FL", state: "FL", lat: 29.026, lng: -80.927, description: "Beat the sun out of bed for a quiet, golden beach all to yourselves.", cost: "Free", driveMinutes: 60, minAge: 3, needsDeepWater: false },
  ],
  mountains: [
    { title: "Mountain Mission: Blue Ridge", location: "Blue Ridge, GA", state: "GA", lat: 34.864, lng: -84.324, description: "Ride a scenic railway through the mountains and breathe the cool air at the overlook.", cost: "$$$", driveMinutes: 280, minAge: 5 },
    { title: "Waterfall Summit Hike", location: "Amicalola Falls, GA", state: "GA", lat: 34.563, lng: -84.247, description: "Climb beside the tallest waterfall in the Southeast and earn the view at the top.", cost: "$", driveMinutes: 300, minAge: 7 },
  ],
  food: [
    { title: "Donut Quest", location: "The Donut Experiment, FL", state: "FL", lat: 28.42, lng: -81.31, description: "Design your own ridiculous donut and rate each other's flavor experiments.", cost: "$", driveMinutes: 25, minAge: 2 },
    { title: "Taco Trail", location: "Local taqueria crawl", state: "FL", lat: 28.54, lng: -81.38, description: "Three stops, one mission: find the family's official favorite taco.", cost: "$$", driveMinutes: 20, minAge: 3 },
  ],
  sports: [
    { title: "Minor League Ball Game", location: "Daytona Tortugas, FL", state: "FL", lat: 29.21, lng: -81.01, description: "Hot dogs, foul balls, and a seventh-inning sing-along under the lights.", cost: "$$", driveMinutes: 70, minAge: 4 },
    { title: "Family Bike Sprint", location: "West Orange Trail, FL", state: "FL", lat: 28.55, lng: -81.6, description: "A flat, breezy ride with a finish-line ice cream reward.", cost: "$", driveMinutes: 25, minAge: 6 },
  ],
  hidden_gems: [
    { title: "Secret Mermaid Show", location: "Weeki Wachee Springs, FL", state: "FL", lat: 28.517, lng: -82.573, description: "An underwater theater from 1947 where real 'mermaids' still perform.", cost: "$$", driveMinutes: 110, minAge: 4 },
    { title: "The Tiny Town", location: "Cassadaga, FL", state: "FL", lat: 28.98, lng: -81.33, description: "A mysterious little village full of stories — and the best small-town ice cream.", cost: "$", driveMinutes: 40, minAge: 5 },
  ],
  learning: [
    { title: "Science Center Discovery", location: "Orlando Science Center, FL", state: "FL", lat: 28.572, lng: -81.367, description: "Four floors of hands-on experiments, dinosaurs, and a giant lab.", cost: "$$", driveMinutes: 20, minAge: 3 },
    { title: "Aviation Museum", location: "Fantasy of Flight, FL", state: "FL", lat: 28.04, lng: -81.78, description: "Climb into cockpits and learn one weird fact about every plane.", cost: "$$", driveMinutes: 50, minAge: 5 },
  ],
  camping: [
    { title: "First Tent Campout", location: "Wekiwa Springs Campground, FL", state: "FL", lat: 28.711, lng: -81.459, description: "Pitch a tent, toast marshmallows, and stay up for the stars.", cost: "$", driveMinutes: 35, minAge: 4 },
    { title: "Lakeside Overnight", location: "Lake Louisa State Park, FL", state: "FL", lat: 28.46, lng: -81.72, description: "A calm lake, a campfire, and a sunrise paddle to remember.", cost: "$$", driveMinutes: 45, minAge: 5 },
  ],
  seasonal: [
    { title: "Strawberry Festival", location: "Plant City, FL", state: "FL", lat: 28.014, lng: -82.114, description: "Fresh strawberry shortcake, rides, and a only-this-time-of-year buzz.", cost: "$$", driveMinutes: 80, minAge: 2 },
    { title: "Holiday Lights Drive", location: "Local light spectacular", state: "FL", lat: 28.54, lng: -81.38, description: "Pajamas, hot cocoa, and a slow cruise through a million twinkling lights.", cost: "$", driveMinutes: 25, minAge: 1 },
  ],
};

// ── Challenge bank ───────────────────────────────────────────────────────────
const PARENT_CHALLENGES: Record<string, string[]> = {
  history: ["Find the coolest cannon and pose for a photo.", "Discover who built this place and why."],
  space: ["Find the biggest rocket and stand for scale.", "Explain how a rocket reaches orbit in one sentence."],
  animals: ["Spot the rarest animal here.", "Capture a perfect action shot of a creature."],
  default: ["Take the best photo of the day.", "Find something here older than you."],
};
const CHILD_CHALLENGES: Record<string, string[]> = {
  animals: ["Spot 5 different animals.", "Make an animal noise until someone laughs."],
  space: ["Count how many rockets you can find.", "Learn the name of one planet you didn't know."],
  history: ["Find a secret hiding spot in the fort.", "Imagine who stood here 200 years ago."],
  nature: ["Collect one cool leaf or rock to keep.", "Find a heart shape in nature."],
  default: ["Learn one weird fact and teach it to everyone.", "Find something the color of your favorite color."],
};
const BONUS_CHALLENGES = [
  "Capture one photo nobody will believe.",
  "Find a stranger doing something kind.",
  "Invent a new family inside joke today.",
  "Collect one tiny memory to bring home.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function interestMatchScore(idea: Idea, category: MissionCategory, family: Family): number {
  const allInterests = family.children.flatMap((c) => c.interests.map((i) => i.toLowerCase()));
  const text = `${idea.title} ${idea.description} ${category}`.toLowerCase();
  let score = 0;
  for (const interest of allInterests) {
    if (text.includes(interest)) score += 3;
    if (category.includes(interest) || interest.includes(category)) score += 2;
  }
  return score;
}

export interface MissionSuggestion extends Idea {
  category: MissionCategory;
  reason: string;
}

/**
 * Recommend fresh categories the family hasn't worn out, weighted by interests,
 * travel radius, budget and ages — explicitly avoiding repetition.
 */
export function suggestMissions(
  family: Family,
  history: Mission[],
  count = 3
): MissionSuggestion[] {
  const recentCats = history
    .filter((m) => m.status === "completed")
    .slice(-4)
    .map((m) => m.category);

  const youngest = Math.min(...family.children.map((c) => c.age), 99);
  const avoidDeepWater = family.children.some((c) =>
    c.dislikes.map((d) => d.toLowerCase()).some((d) => d.includes("deep water") || d.includes("water"))
  );
  const budgetCeil = { low: 1, medium: 2, high: 3 }[family.budgetPreference];
  const costRank = (c: string) => (c === "Free" ? 0 : c.length); // "$"=1 ...

  const scored: { s: MissionSuggestion; score: number }[] = [];

  (Object.keys(IDEAS) as MissionCategory[]).forEach((cat, ci) => {
    IDEAS[cat].forEach((idea, ii) => {
      let score = 10;
      // Avoid repetition — strongly penalize recently-done categories.
      if (recentCats.includes(cat)) score -= 8;
      // Interest match.
      score += interestMatchScore(idea, cat, family);
      // Age fit.
      if (youngest < idea.minAge) score -= 6;
      // Travel radius.
      if (idea.driveMinutes > family.maxTravelMinutes) score -= 5;
      else score += 2;
      // Budget.
      if (costRank(idea.cost) > budgetCeil) score -= 4;
      // Dislikes (e.g. deep water).
      if (avoidDeepWater && idea.needsDeepWater) score -= 10;
      // Slight novelty jitter so suggestions feel fresh.
      score += ((ci * 7 + ii * 3) % 5) * 0.4;

      const reasonBits: string[] = [];
      const matched = family.children.find((c) =>
        c.interests.some((i) => `${idea.description} ${cat}`.toLowerCase().includes(i.toLowerCase()))
      );
      if (matched) reasonBits.push(`${matched.name} loves this`);
      if (!recentCats.includes(cat)) reasonBits.push("something new for the family");
      if (idea.driveMinutes <= family.maxTravelMinutes) reasonBits.push("within your travel range");

      scored.push({
        s: {
          ...idea,
          category: cat,
          reason: reasonBits.slice(0, 2).join(" · ") || "a great fit for your crew",
        },
        score,
      });
    });
  });

  scored.sort((a, b) => b.score - a.score);

  // De-dupe by category to keep variety in the top picks.
  const out: MissionSuggestion[] = [];
  const usedCats = new Set<MissionCategory>();
  for (const { s } of scored) {
    if (usedCats.has(s.category)) continue;
    usedCats.add(s.category);
    out.push(s);
    if (out.length >= count) break;
  }
  return out;
}

/** Build personalized parent / child / bonus challenges for a mission. */
export function generateChallenges(category: MissionCategory, family: Family): Challenge[] {
  const seed = category.length + family.children.length;
  const challenges: Challenge[] = [
    {
      id: uid(),
      audience: "parent",
      text: pick(PARENT_CHALLENGES[category] ?? PARENT_CHALLENGES.default, seed),
      done: false,
    },
  ];
  family.children.forEach((child, i) => {
    const bank = CHILD_CHALLENGES[category] ?? CHILD_CHALLENGES.default;
    // Personalize toward a child's interest when we can.
    const interestLine = child.interests.length
      ? `${child.name}, ${pick(bank, seed + i)}`
      : pick(bank, seed + i);
    challenges.push({
      id: uid(),
      audience: "child",
      assignedChildId: child.id,
      text: interestLine,
      done: false,
    });
  });
  challenges.push({
    id: uid(),
    audience: "bonus",
    text: pick(BONUS_CHALLENGES, seed + 13),
    done: false,
  });
  return challenges;
}

/** Generate the AI Mission Recap from the captured debrief. */
export function generateRecap(mission: Mission, family: Family): string {
  const kids = family.children;
  const ratingLine =
    typeof mission.rating === "number" ? `Family rating: ${mission.rating.toFixed(1)}` : "";
  const childBits = mission.childRatings
    .map((cr) => {
      const child = kids.find((k) => k.id === cr.childId);
      return child ? `${child.name} gave it ${cr.rating}` : null;
    })
    .filter(Boolean);

  const fav = mission.debrief?.favoriteMoment;
  const funny = mission.debrief?.funniestMoment;

  const parts = [`${mission.code} complete — ${mission.title}.`];
  if (fav) parts.push(`The highlight: ${fav.trim().replace(/\.$/, "")}.`);
  if (funny) parts.push(`Funniest moment? ${funny.trim().replace(/\.$/, "")}.`);
  if (childBits.length) parts.push(`${childBits.join(", ")}.`);
  if (ratingLine) parts.push(ratingLine + ".");
  return parts.join(" ");
}

/** Build the evolving Family Lore narrative from all history. */
export function generateLore(family: Family, missions: Mission[]): FamilyLore {
  const completed = missions.filter((m) => m.status === "completed");
  const states = Array.from(new Set(completed.map((m) => m.state).filter(Boolean)));

  const topMission = [...completed].sort(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
  )[0];

  // Each child's favorite (their highest personal rating).
  const childFavorites = family.children
    .map((child) => {
      let best: { mission: Mission; rating: number } | null = null;
      for (const m of completed) {
        const r = m.childRatings.find((cr) => cr.childId === child.id);
        if (r && (!best || r.rating > best.rating)) best = { mission: m, rating: r.rating };
      }
      return best ? `${child.name}'s favorite mission was ${best.mission.title}.` : null;
    })
    .filter(Boolean) as string[];

  const foodStop = [...completed]
    .filter((m) => m.category === "food" || m.category === "road_trip")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];

  const headline =
    completed.length === 0
      ? `${family.surname} is about to begin their story.`
      : `${family.surname} has completed ${completed.length} mission${
          completed.length === 1 ? "" : "s"
        } across ${states.length} state${states.length === 1 ? "" : "s"}.`;

  const paragraphs: string[] = [];
  if (childFavorites.length) paragraphs.push(childFavorites.join(" "));
  if (topMission)
    paragraphs.push(
      `Their highest-rated adventure so far was ${topMission.title} (${(
        topMission.rating ?? 0
      ).toFixed(1)}/10).`
    );
  if (foodStop)
    paragraphs.push(`The family's favorite stop along the way was ${foodStop.location}.`);
  if (completed.length === 0)
    paragraphs.push(
      "Complete your first mission to start writing the legend of your family."
    );

  const stats = [
    { label: "Missions", value: String(completed.length) },
    { label: "States", value: String(states.length) },
    {
      label: "Photos",
      value: String(completed.reduce((s, m) => s + m.photos.length, 0)),
    },
    {
      label: "Avg Rating",
      value:
        completed.filter((m) => m.rating).length === 0
          ? "—"
          : (
              completed.reduce((s, m) => s + (m.rating ?? 0), 0) /
              completed.filter((m) => m.rating).length
            ).toFixed(1),
    },
  ];

  // Running jokes are seeded from funniest moments captured at debrief.
  const runningJokes = completed
    .map((m) => m.debrief?.funniestMoment)
    .filter((x): x is string => Boolean(x))
    .slice(-4);

  return { headline, paragraphs, stats, runningJokes };
}

export interface AnnualRecap {
  year: number;
  headline: string;
  highlights: string[];
  topMissionTitle?: string;
  missionCount: number;
  stateCount: number;
  photoCount: number;
}

/** "Year in Adventures" — an annual family recap (Phase 3). */
export function generateAnnualRecap(
  family: Family,
  missions: Mission[],
  year: number
): AnnualRecap {
  const inYear = missions.filter(
    (m) =>
      m.status === "completed" &&
      m.completedAt &&
      new Date(m.completedAt).getFullYear() === year
  );
  const states = Array.from(new Set(inYear.map((m) => m.state).filter(Boolean)));
  const photoCount = inYear.reduce((s, m) => s + m.photos.length, 0);
  const top = [...inYear].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];

  const highlights: string[] = [];
  if (top)
    highlights.push(
      `Your top adventure was ${top.title} (${(top.rating ?? 0).toFixed(1)}/10).`
    );
  family.children.forEach((child) => {
    let best: { title: string; rating: number } | null = null;
    for (const m of inYear) {
      const r = m.childRatings.find((cr) => cr.childId === child.id);
      if (r && (!best || r.rating > best.rating)) best = { title: m.title, rating: r.rating };
    }
    if (best) highlights.push(`${child.name}'s favorite was ${best.title}.`);
  });
  const funniest = inYear.map((m) => m.debrief?.funniestMoment).find(Boolean);
  if (funniest) highlights.push(`The laugh of the year: ${funniest}`);

  return {
    year,
    headline:
      inYear.length === 0
        ? `${year} is a blank page — time to start writing it.`
        : `In ${year}, ${family.surname} completed ${inYear.length} mission${
            inYear.length === 1 ? "" : "s"
          } across ${states.length} state${states.length === 1 ? "" : "s"}.`,
    highlights,
    topMissionTitle: top?.title,
    missionCount: inYear.length,
    stateCount: states.length,
    photoCount,
  };
}

/** Anticipation teaser for the next mission, shown on the dashboard. */
export function teaseNextMission(suggestion: MissionSuggestion | undefined): string {
  if (!suggestion) return "Your next adventure is being charted…";
  const meta = categoryMeta(suggestion.category);
  return `Next up could be a ${meta.label} mission: “${suggestion.title}.” ${suggestion.reason}.`;
}
