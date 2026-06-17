import { describe, it, expect } from "vitest";
import { computeMemoryScore, computeStreakWeeks, scoreRank } from "@/lib/memoryScore";
import {
  suggestMissions,
  generateChallenges,
  generateRecap,
  generateLore,
  generateAnnualRecap,
} from "@/lib/aiEngine";
import { evaluateAchievements } from "@/lib/achievements";
import { demoState } from "@/data/seed";
import type { Family, Mission } from "@/lib/types";

const { family, missions } = demoState();

function mk(partial: Partial<Mission>): Mission {
  return {
    id: Math.random().toString(36).slice(2),
    code: "Mission X",
    title: "Test",
    description: "",
    category: "history",
    location: "Somewhere, FL",
    lat: 28,
    lng: -81,
    state: "FL",
    status: "completed",
    challenges: [],
    photos: [],
    childRatings: [],
    completedAt: "2026-05-01T12:00:00.000Z",
    createdAt: "2026-05-01T12:00:00.000Z",
    ...partial,
  };
}

describe("memoryScore", () => {
  it("rewards completed missions, photos and states", () => {
    const s = computeMemoryScore(missions, family);
    expect(s.completedMissions.count).toBe(3);
    expect(s.total).toBeGreaterThan(0);
    expect(s.photos.count).toBeGreaterThan(0);
    expect(s.states.count).toBe(1); // all FL in demo
  });

  it("is zero for an empty history", () => {
    const s = computeMemoryScore([], family);
    expect(s.total).toBe(0);
    expect(s.completedMissions.count).toBe(0);
  });

  it("counts distinct states", () => {
    const ms = [mk({ state: "FL" }), mk({ state: "GA" }), mk({ state: "GA" })];
    expect(computeMemoryScore(ms, family).states.count).toBe(2);
  });

  it("computes child participation percentage", () => {
    const s = computeMemoryScore(missions, family);
    expect(s.participation.pct).toBe(100); // both kids rated every demo mission
  });

  it("ranks climb with score", () => {
    expect(scoreRank(0).title).toBe("Weekend Explorers");
    expect(scoreRank(99999).title).toBe("Adventure Royalty");
  });

  it("measures consecutive-week streaks", () => {
    const weekMs = 7 * 86400000;
    const base = Date.parse("2026-05-06T12:00:00.000Z");
    const ms = [
      mk({ completedAt: new Date(base).toISOString() }),
      mk({ completedAt: new Date(base - weekMs).toISOString() }),
      mk({ completedAt: new Date(base - 2 * weekMs).toISOString() }),
    ];
    expect(computeStreakWeeks(ms)).toBe(3);
  });
});

describe("AI mission architect", () => {
  it("avoids recently-completed categories", () => {
    const recent: Mission[] = [
      mk({ category: "space" }),
      mk({ category: "history" }),
      mk({ category: "beach" }),
    ];
    const out = suggestMissions(family, recent, 6).map((s) => s.category);
    // none of the top picks should repeat the recent three
    expect(out).not.toContain("space");
    expect(out).not.toContain("history");
    expect(out).not.toContain("beach");
  });

  it("respects a deep-water dislike", () => {
    const fearful: Family = {
      ...family,
      children: [{ ...family.children[1], dislikes: ["Deep Water"] }],
    };
    const out = suggestMissions(fearful, [], 13);
    expect(out.every((s) => !("needsDeepWater" in s && s.needsDeepWater))).toBe(true);
  });

  it("returns variety (distinct categories)", () => {
    const out = suggestMissions(family, [], 5);
    const cats = new Set(out.map((s) => s.category));
    expect(cats.size).toBe(out.length);
  });
});

describe("challenges", () => {
  it("creates parent + one-per-child + bonus", () => {
    const ch = generateChallenges("animals", family);
    expect(ch.filter((c) => c.audience === "parent")).toHaveLength(1);
    expect(ch.filter((c) => c.audience === "child")).toHaveLength(family.children.length);
    expect(ch.filter((c) => c.audience === "bonus")).toHaveLength(1);
  });

  it("personalizes child challenges by name", () => {
    const ch = generateChallenges("animals", family);
    const childCh = ch.find((c) => c.audience === "child");
    expect(childCh?.text).toContain(family.children[0].name);
  });
});

describe("recap & lore", () => {
  it("recap mentions the mission and rating", () => {
    const r = generateRecap(missions[0], family);
    expect(r).toContain(missions[0].title);
    expect(r).toMatch(/9\.4/);
  });

  it("lore summarizes mission and state counts", () => {
    const lore = generateLore(family, missions);
    expect(lore.headline).toContain("3 missions");
    expect(lore.stats.find((s) => s.label === "Missions")?.value).toBe("3");
  });

  it("annual recap scopes to the year", () => {
    const a = generateAnnualRecap(family, missions, 2026);
    expect(a.missionCount).toBe(3);
    expect(generateAnnualRecap(family, missions, 2020).missionCount).toBe(0);
  });
});

describe("achievements", () => {
  it("unlocks first-mission and preserves earned timestamps", () => {
    const { achievements, newlyEarned } = evaluateAchievements(missions, []);
    const first = achievements.find((a) => a.id === "first_mission");
    expect(first?.earnedAt).toBeTruthy();
    expect(newlyEarned.map((a) => a.id)).toContain("first_mission");

    // Re-evaluating should not re-earn (no new unlocks, timestamp preserved).
    const second = evaluateAchievements(missions, achievements);
    expect(second.newlyEarned.find((a) => a.id === "first_mission")).toBeUndefined();
    expect(second.achievements.find((a) => a.id === "first_mission")?.earnedAt).toBe(
      first?.earnedAt
    );
  });

  it("does not unlock space explorer without a space mission", () => {
    const noSpace = missions.filter((m) => m.category !== "space");
    const { achievements } = evaluateAchievements(noSpace, []);
    expect(achievements.find((a) => a.id === "space_explorer")?.earnedAt).toBeFalsy();
  });
});
