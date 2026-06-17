// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "@/store/useStore";
import { suggestMissions } from "@/lib/aiEngine";
import { computeMemoryScore } from "@/lib/memoryScore";
import type { Family } from "@/lib/types";

const family: Family = {
  id: "f1",
  surname: "The Test Family",
  parentName: "Sam",
  homeBase: "Orlando, FL",
  budgetPreference: "medium",
  maxTravelMinutes: 180,
  createdAt: new Date().toISOString(),
  children: [
    { id: "k1", name: "Ana", age: 12, interests: ["Photography"], dislikes: [], avatarColor: "sunset" },
    { id: "k2", name: "Adriel", age: 8, interests: ["Animals"], dislikes: ["Deep Water"], avatarColor: "forest" },
  ],
};

beforeEach(() => {
  localStorage.clear();
  useStore.getState().reset();
});

describe("store — full core loop", () => {
  it("onboards a family", () => {
    useStore.getState().createFamily(family);
    expect(useStore.getState().family?.surname).toBe("The Test Family");
    expect(useStore.getState().onboarded).toBe(true);
  });

  it("plans a mission from an AI suggestion with generated challenges", () => {
    useStore.getState().createFamily(family);
    const sug = suggestMissions(family, [], 1)[0];
    const m = useStore.getState().addMissionFromSuggestion(sug, { status: "planned" });
    expect(m.code).toBe("Mission 001");
    expect(m.status).toBe("planned");
    // parent + one per child + bonus
    expect(m.challenges.filter((c) => c.audience === "child")).toHaveLength(2);
    expect(m.challenges.some((c) => c.audience === "parent")).toBe(true);
    expect(m.challenges.some((c) => c.audience === "bonus")).toBe(true);
  });

  it("completes a mission: recap, ratings, achievements and score", () => {
    const store = useStore.getState();
    store.createFamily(family);
    const sug = suggestMissions(family, [], 1)[0];
    const m = store.addMissionFromSuggestion(sug, { status: "planned" });

    const newBadges = useStore.getState().completeMission(m.id, {
      rating: 9,
      childRatings: [
        { childId: "k1", rating: 10 },
        { childId: "k2", rating: 8 },
      ],
      debrief: { favoriteMoment: "the whole thing", funniestMoment: "Adriel's dance", recommend: true },
    });

    const done = useStore.getState().missions.find((x) => x.id === m.id)!;
    expect(done.status).toBe("completed");
    expect(done.aiSummary).toContain(done.title);
    expect(done.completedAt).toBeTruthy();
    expect(newBadges.map((b) => b.id)).toContain("first_mission");

    const score = computeMemoryScore(useStore.getState().missions, family);
    expect(score.total).toBeGreaterThan(0);
    expect(score.participation.pct).toBe(100);
  });

  it("toggles challenges and adds/removes photos", () => {
    const store = useStore.getState();
    store.createFamily(family);
    const sug = suggestMissions(family, [], 1)[0];
    const m = store.addMissionFromSuggestion(sug);
    const ch = m.challenges[0];

    useStore.getState().toggleChallenge(m.id, ch.id);
    expect(
      useStore.getState().missions.find((x) => x.id === m.id)!.challenges.find((c) => c.id === ch.id)!.done
    ).toBe(true);

    useStore.getState().addPhoto(m.id, { id: "p1", url: "data:," });
    expect(useStore.getState().missions.find((x) => x.id === m.id)!.photos).toHaveLength(1);
    useStore.getState().removePhoto(m.id, "p1");
    expect(useStore.getState().missions.find((x) => x.id === m.id)!.photos).toHaveLength(0);
  });

  it("starts and deletes missions", () => {
    const store = useStore.getState();
    store.createFamily(family);
    const sug = suggestMissions(family, [], 1)[0];
    const m = store.addMissionFromSuggestion(sug, { status: "planned" });

    useStore.getState().startMission(m.id);
    expect(useStore.getState().missions.find((x) => x.id === m.id)!.status).toBe("active");

    useStore.getState().deleteMission(m.id);
    expect(useStore.getState().missions.find((x) => x.id === m.id)).toBeUndefined();
  });

  it("edits the family and its children", () => {
    const store = useStore.getState();
    store.createFamily(family);
    store.addChild({ id: "k3", name: "Mateo", age: 5, interests: ["Dinosaurs"], dislikes: [], avatarColor: "sky" });
    expect(useStore.getState().family!.children).toHaveLength(3);

    useStore.getState().updateChild("k3", { age: 6 });
    expect(useStore.getState().family!.children.find((c) => c.id === "k3")!.age).toBe(6);

    useStore.getState().removeChild("k3");
    expect(useStore.getState().family!.children).toHaveLength(2);

    useStore.getState().updateFamily({ budgetPreference: "high" });
    expect(useStore.getState().family!.budgetPreference).toBe("high");
  });

  it("exports and re-imports a family story (round trip)", () => {
    const store = useStore.getState();
    store.createFamily(family);
    const sug = suggestMissions(family, [], 1)[0];
    store.addMissionFromSuggestion(sug);
    const json = useStore.getState().exportData();

    useStore.getState().reset();
    expect(useStore.getState().family).toBeNull();

    const ok = useStore.getState().importData(json);
    expect(ok).toBe(true);
    expect(useStore.getState().family?.surname).toBe("The Test Family");
    expect(useStore.getState().missions).toHaveLength(1);
  });

  it("rejects malformed import data", () => {
    expect(useStore.getState().importData("not json")).toBe(false);
    expect(useStore.getState().importData('{"foo":1}')).toBe(false);
  });

  it("persists state to localStorage", () => {
    useStore.getState().createFamily(family);
    const raw = localStorage.getItem("adventure-dad-state-v1");
    expect(raw).toBeTruthy();
    expect(raw).toContain("The Test Family");
  });
});
