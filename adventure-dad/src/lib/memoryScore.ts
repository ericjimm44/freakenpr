import type { Mission, Family } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Family Memory Score — the North Star metric.
//
//   Family Memory Score = f(
//     Completed Missions, Mission Ratings, Family Photos,
//     Adventure Streaks, States Visited, Child Participation
//   )
//
// Every term maps to a concrete, visible behavior so the UI can show families
// exactly how each adventure moved the number. The whole product is tuned to
// make this go up.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  total: number;
  completedMissions: { count: number; points: number };
  ratings: { avg: number; points: number };
  photos: { count: number; points: number };
  streak: { weeks: number; points: number };
  states: { count: number; points: number };
  participation: { pct: number; points: number };
}

const POINTS = {
  perMission: 100,
  perRatingPoint: 6, // up to 60 per mission, averaged
  perPhoto: 8,
  perStreakWeek: 40,
  perState: 75,
  participationMax: 150,
};

/** Weeks of consecutive adventuring, counted backward from the latest mission. */
export function computeStreakWeeks(missions: Mission[]): number {
  const completed = missions
    .filter((m) => m.status === "completed" && m.completedAt)
    .map((m) => new Date(m.completedAt!))
    .sort((a, b) => b.getTime() - a.getTime());
  if (completed.length === 0) return 0;

  const weekKey = (d: Date) => {
    const ms = d.getTime() - d.getDay() * 86400000;
    return Math.floor(ms / (7 * 86400000));
  };

  const weeks = Array.from(new Set(completed.map(weekKey))).sort((a, b) => b - a);
  let streak = 1;
  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i] === weeks[i - 1] - 1) streak++;
    else break;
  }
  return streak;
}

export function computeMemoryScore(
  missions: Mission[],
  family: Family | null
): ScoreBreakdown {
  const completed = missions.filter((m) => m.status === "completed");

  const completedPoints = completed.length * POINTS.perMission;

  const rated = completed.filter((m) => typeof m.rating === "number");
  const avgRating =
    rated.length === 0
      ? 0
      : rated.reduce((s, m) => s + (m.rating ?? 0), 0) / rated.length;
  // (avg rating × points) awarded per rated mission.
  const ratingPointsTotal = Math.round(avgRating * POINTS.perRatingPoint) * rated.length;

  const photoCount = completed.reduce((s, m) => s + m.photos.length, 0);
  const photoPoints = photoCount * POINTS.perPhoto;

  const streakWeeks = computeStreakWeeks(missions);
  const streakPoints = streakWeeks * POINTS.perStreakWeek;

  const states = new Set(completed.map((m) => m.state).filter(Boolean));
  const statePoints = states.size * POINTS.perState;

  // Child participation = share of kids who rated completed missions, on avg.
  const childCount = family?.children.length ?? 0;
  let participationPct = 0;
  if (childCount > 0 && completed.length > 0) {
    const ratios = completed.map(
      (m) => new Set(m.childRatings.map((r) => r.childId)).size / childCount
    );
    participationPct = ratios.reduce((s, r) => s + r, 0) / ratios.length;
  }
  const participationPoints = Math.round(participationPct * POINTS.participationMax);

  const total =
    completedPoints +
    ratingPointsTotal +
    photoPoints +
    streakPoints +
    statePoints +
    participationPoints;

  return {
    total,
    completedMissions: { count: completed.length, points: completedPoints },
    ratings: { avg: Number(avgRating.toFixed(1)), points: ratingPointsTotal },
    photos: { count: photoCount, points: photoPoints },
    streak: { weeks: streakWeeks, points: streakPoints },
    states: { count: states.size, points: statePoints },
    participation: {
      pct: Math.round(participationPct * 100),
      points: participationPoints,
    },
  };
}

/** A playful rank tied to the score, for emotional progression. */
export function scoreRank(total: number): { title: string; next: number } {
  const ranks = [
    { title: "Weekend Explorers", min: 0 },
    { title: "Trailblazers", min: 400 },
    { title: "Memory Makers", min: 900 },
    { title: "Legend Hunters", min: 1600 },
    { title: "Adventure Royalty", min: 2600 },
  ];
  let current = ranks[0];
  let next = ranks[1]?.min ?? total;
  for (let i = 0; i < ranks.length; i++) {
    if (total >= ranks[i].min) {
      current = ranks[i];
      next = ranks[i + 1]?.min ?? ranks[i].min;
    }
  }
  return { title: current.title, next };
}
