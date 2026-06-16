import type { Achievement, Mission } from "./types";

// Achievement catalog. Each has a predicate over mission history. The store
// stamps `earnedAt` the first time a predicate flips true, so unlocking feels
// like a moment.
interface AchievementDef extends Omit<Achievement, "earnedAt"> {
  test: (missions: Mission[]) => boolean;
}

const completed = (m: Mission[]) => m.filter((x) => x.status === "completed");

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_mission",
    title: "First Mission",
    description: "Complete your very first adventure.",
    icon: "Flag",
    test: (m) => completed(m).length >= 1,
  },
  {
    id: "first_road_trip",
    title: "First Road Trip",
    description: "Complete a road trip mission.",
    icon: "Car",
    test: (m) => completed(m).some((x) => x.category === "road_trip"),
  },
  {
    id: "first_state",
    title: "First State Visited",
    description: "Pin your first state on the map.",
    icon: "MapPin",
    test: (m) => new Set(completed(m).map((x) => x.state)).size >= 1,
  },
  {
    id: "ten_missions",
    title: "10 Missions Completed",
    description: "Reach ten completed adventures.",
    icon: "Medal",
    test: (m) => completed(m).length >= 10,
  },
  {
    id: "mountain_explorer",
    title: "Mountain Explorer",
    description: "Conquer a mountain mission.",
    icon: "Mountain",
    test: (m) => completed(m).some((x) => x.category === "mountains"),
  },
  {
    id: "space_explorer",
    title: "Space Explorer",
    description: "Reach for the stars on a space mission.",
    icon: "Rocket",
    test: (m) => completed(m).some((x) => x.category === "space"),
  },
  {
    id: "history_hunter",
    title: "History Hunter",
    description: "Travel back in time on a history mission.",
    icon: "Castle",
    test: (m) => completed(m).some((x) => x.category === "history"),
  },
  {
    id: "animal_tracker",
    title: "Animal Tracker",
    description: "Track down the wildlife on an animals mission.",
    icon: "PawPrint",
    test: (m) => completed(m).some((x) => x.category === "animals"),
  },
  {
    id: "adventure_streak",
    title: "Adventure Streak",
    description: "Adventure two weeks in a row.",
    icon: "Flame",
    test: (m) => {
      const weeks = new Set(
        completed(m)
          .filter((x) => x.completedAt)
          .map((x) => Math.floor(new Date(x.completedAt!).getTime() / (7 * 86400000)))
      );
      return weeks.size >= 2;
    },
  },
  {
    id: "three_states",
    title: "State Collector",
    description: "Visit three different states.",
    icon: "Map",
    test: (m) => new Set(completed(m).map((x) => x.state)).size >= 3,
  },
  {
    id: "summer_champion",
    title: "Summer Champion",
    description: "Complete 3 missions in June, July, or August.",
    icon: "Sun",
    test: (m) =>
      completed(m).filter((x) => {
        if (!x.completedAt) return false;
        const mo = new Date(x.completedAt).getMonth();
        return mo >= 5 && mo <= 7;
      }).length >= 3,
  },
  {
    id: "shutterbug",
    title: "Family Shutterbug",
    description: "Capture 25 family photos across your missions.",
    icon: "Camera",
    test: (m) => completed(m).reduce((s, x) => s + x.photos.length, 0) >= 25,
  },
];

/** Recompute achievements, preserving earned timestamps and stamping new ones. */
export function evaluateAchievements(
  missions: Mission[],
  existing: Achievement[]
): { achievements: Achievement[]; newlyEarned: Achievement[] } {
  const prior = new Map(existing.map((a) => [a.id, a]));
  const newlyEarned: Achievement[] = [];

  const achievements = ACHIEVEMENTS.map((def) => {
    const was = prior.get(def.id);
    const earned = def.test(missions);
    const earnedAt = was?.earnedAt ?? (earned ? new Date().toISOString() : undefined);
    const a: Achievement = {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      earnedAt,
    };
    if (earned && !was?.earnedAt) newlyEarned.push(a);
    return a;
  });

  return { achievements, newlyEarned };
}
