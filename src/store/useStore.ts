"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppState,
  Child,
  Family,
  Mission,
  MissionDebrief,
  Photo,
  Achievement,
} from "@/lib/types";
import { emptyState, demoState } from "@/data/seed";
import { evaluateAchievements } from "@/lib/achievements";
import {
  generateChallenges,
  generateRecap,
  type MissionSuggestion,
} from "@/lib/aiEngine";
import { uid, missionCode } from "@/lib/utils";

interface StoreActions {
  // lifecycle
  hydrated: boolean;
  setHydrated: () => void;
  loadDemo: () => void;
  reset: () => void;

  // family
  createFamily: (family: Family) => void;
  updateFamily: (patch: Partial<Family>) => void;
  addChild: (child: Child) => void;
  updateChild: (id: string, patch: Partial<Child>) => void;
  removeChild: (id: string) => void;

  // data portability (stand-in for cloud sync until Supabase is wired)
  exportData: () => string;
  importData: (json: string) => boolean;

  // missions
  addMissionFromSuggestion: (
    s: MissionSuggestion,
    opts?: { status?: Mission["status"]; scheduledFor?: string }
  ) => Mission;
  addCustomMission: (
    m: Omit<Mission, "id" | "code" | "challenges" | "photos" | "childRatings" | "createdAt" | "status"> &
      Partial<Pick<Mission, "status">>
  ) => Mission;
  updateMission: (id: string, patch: Partial<Mission>) => void;
  startMission: (id: string) => void;
  deleteMission: (id: string) => void;
  toggleChallenge: (missionId: string, challengeId: string) => void;
  addPhoto: (missionId: string, photo: Photo) => void;
  removePhoto: (missionId: string, photoId: string) => void;
  completeMission: (
    id: string,
    data: {
      rating: number;
      childRatings: { childId: string; rating: number }[];
      debrief: MissionDebrief;
    }
  ) => Achievement[]; // returns newly-earned achievements for the celebration
}

export type Store = AppState & StoreActions;

const recompute = (missions: Mission[], achievements: Achievement[]) =>
  evaluateAchievements(missions, achievements);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...emptyState(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      loadDemo: () => set({ ...demoState() }),
      reset: () => set({ ...emptyState() }),

      createFamily: (family) =>
        set({ family, onboarded: true }),

      updateFamily: (patch) =>
        set((s) => (s.family ? { family: { ...s.family, ...patch } } : {})),

      addChild: (child) =>
        set((s) =>
          s.family
            ? { family: { ...s.family, children: [...s.family.children, child] } }
            : {}
        ),

      updateChild: (id, patch) =>
        set((s) =>
          s.family
            ? {
                family: {
                  ...s.family,
                  children: s.family.children.map((c) =>
                    c.id === id ? { ...c, ...patch } : c
                  ),
                },
              }
            : {}
        ),

      removeChild: (id) =>
        set((s) =>
          s.family
            ? {
                family: {
                  ...s.family,
                  children: s.family.children.filter((c) => c.id !== id),
                },
              }
            : {}
        ),

      exportData: () => {
        const { family, missions, achievements, onboarded } = get();
        return JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), family, missions, achievements, onboarded },
          null,
          2
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data || typeof data !== "object" || !("missions" in data)) return false;
          const missions: Mission[] = Array.isArray(data.missions) ? data.missions : [];
          const { achievements } = recompute(missions, data.achievements ?? []);
          set({
            family: data.family ?? null,
            missions,
            achievements,
            onboarded: Boolean(data.family),
          });
          return true;
        } catch {
          return false;
        }
      },

      addMissionFromSuggestion: (sug, opts) => {
        const family = get().family;
        const idx = get().missions.length;
        const mission: Mission = {
          id: uid(),
          code: missionCode(idx),
          title: sug.title,
          description: sug.description,
          category: sug.category,
          location: sug.location,
          lat: sug.lat,
          lng: sug.lng,
          state: sug.state,
          status: opts?.status ?? "planned",
          challenges: family ? generateChallenges(sug.category, family) : [],
          photos: [],
          childRatings: [],
          estimatedCost: sug.cost,
          estimatedDriveMinutes: sug.driveMinutes,
          scheduledFor: opts?.scheduledFor,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ missions: [...s.missions, mission] }));
        return mission;
      },

      addCustomMission: (input) => {
        const family = get().family;
        const idx = get().missions.length;
        const mission: Mission = {
          id: uid(),
          code: missionCode(idx),
          status: input.status ?? "planned",
          challenges: family ? generateChallenges(input.category, family) : [],
          photos: [],
          childRatings: [],
          createdAt: new Date().toISOString(),
          ...input,
        } as Mission;
        set((s) => ({ missions: [...s.missions, mission] }));
        return mission;
      },

      updateMission: (id, patch) =>
        set((s) => ({
          missions: s.missions.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      startMission: (id) =>
        set((s) => ({
          missions: s.missions.map((m) =>
            m.id === id ? { ...m, status: "active" } : m
          ),
        })),

      deleteMission: (id) =>
        set((s) => {
          const missions = s.missions.filter((m) => m.id !== id);
          const { achievements } = recompute(missions, s.achievements);
          return { missions, achievements };
        }),

      toggleChallenge: (missionId, challengeId) =>
        set((s) => ({
          missions: s.missions.map((m) =>
            m.id === missionId
              ? {
                  ...m,
                  challenges: m.challenges.map((c) =>
                    c.id === challengeId ? { ...c, done: !c.done } : c
                  ),
                }
              : m
          ),
        })),

      addPhoto: (missionId, photo) =>
        set((s) => {
          const missions = s.missions.map((m) =>
            m.id === missionId ? { ...m, photos: [...m.photos, photo] } : m
          );
          const { achievements } = recompute(missions, s.achievements);
          return { missions, achievements };
        }),

      removePhoto: (missionId, photoId) =>
        set((s) => ({
          missions: s.missions.map((m) =>
            m.id === missionId
              ? { ...m, photos: m.photos.filter((p) => p.id !== photoId) }
              : m
          ),
        })),

      completeMission: (id, data) => {
        const family = get().family;
        let newly: Achievement[] = [];
        set((s) => {
          const missions = s.missions.map((m) => {
            if (m.id !== id) return m;
            const updated: Mission = {
              ...m,
              status: "completed",
              rating: data.rating,
              childRatings: data.childRatings,
              debrief: data.debrief,
              completedAt: new Date().toISOString(),
            };
            updated.aiSummary = family ? generateRecap(updated, family) : undefined;
            return updated;
          });
          const { achievements, newlyEarned } = recompute(missions, s.achievements);
          newly = newlyEarned;
          return { missions, achievements };
        });
        return newly;
      },
    }),
    {
      name: "adventure-dad-state-v1",
      partialize: (s) => ({
        family: s.family,
        missions: s.missions,
        achievements: s.achievements,
        onboarded: s.onboarded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
