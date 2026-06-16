// ─────────────────────────────────────────────────────────────────────────────
// Adventure Dad — core domain types
// These mirror the Supabase schema in /supabase/schema.sql so the local mock
// store and a future real backend share one contract.
// ─────────────────────────────────────────────────────────────────────────────

export type MissionCategory =
  | "space"
  | "history"
  | "animals"
  | "nature"
  | "road_trip"
  | "beach"
  | "mountains"
  | "food"
  | "sports"
  | "hidden_gems"
  | "learning"
  | "camping"
  | "seasonal";

export type MissionStatus = "suggested" | "planned" | "active" | "completed";

export type ChallengeAudience = "parent" | "child" | "bonus";

export interface Child {
  id: string;
  name: string;
  age: number;
  interests: string[];
  dislikes: string[];
  avatarColor: string; // token name from the palette, e.g. "sunset"
}

export interface Family {
  id: string;
  surname: string; // "The Martinez Family"
  parentName: string;
  homeBase: string; // city/state used as a travel origin
  children: Child[];
  budgetPreference: "low" | "medium" | "high";
  maxTravelMinutes: number;
  createdAt: string;
}

export interface Challenge {
  id: string;
  audience: ChallengeAudience;
  assignedChildId?: string; // child challenges are personalized
  text: string;
  done: boolean;
}

export interface Photo {
  id: string;
  // In the mock app we store data URLs / remote URLs. In production this is a
  // Supabase Storage path.
  url: string;
  caption?: string;
}

export interface ChildRating {
  childId: string;
  rating: number; // 1–10
}

export interface MissionDebrief {
  favoriteMoment?: string;
  funniestMoment?: string;
  surprise?: string;
  recommend?: boolean;
  nextMissionWish?: string;
}

export interface Mission {
  id: string;
  code: string; // "Mission 001"
  title: string;
  description: string;
  category: MissionCategory;
  location: string;
  lat: number;
  lng: number;
  state: string; // two-letter state code, used for "States Visited"
  status: MissionStatus;
  rating?: number; // overall family rating 1–10
  challenges: Challenge[];
  photos: Photo[];
  childRatings: ChildRating[];
  debrief?: MissionDebrief;
  aiSummary?: string;
  estimatedCost?: string;
  estimatedDriveMinutes?: number;
  scheduledFor?: string; // ISO date
  completedAt?: string; // ISO date
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  earnedAt?: string;
}

export interface FamilyLore {
  headline: string;
  paragraphs: string[];
  stats: { label: string; value: string }[];
  runningJokes: string[];
}

// The single object persisted to localStorage / Supabase row set.
export interface AppState {
  family: Family | null;
  missions: Mission[];
  achievements: Achievement[];
  onboarded: boolean;
}
