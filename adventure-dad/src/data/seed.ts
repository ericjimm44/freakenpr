import type { AppState, Family, Mission } from "@/lib/types";
import { evaluateAchievements } from "@/lib/achievements";

// Demo family straight from the product spec — used by "Load the Martinez demo"
// so a first-time visitor instantly sees a living family story.
const family: Family = {
  id: "fam_demo",
  surname: "The Martinez Family",
  parentName: "Jimmy",
  homeBase: "Orlando, FL",
  budgetPreference: "medium",
  maxTravelMinutes: 180,
  createdAt: "2026-01-04T12:00:00.000Z",
  children: [
    {
      id: "child_ana",
      name: "Ana",
      age: 12,
      interests: ["Photography", "Swimming", "Exploring"],
      dislikes: [],
      avatarColor: "sunset",
    },
    {
      id: "child_adriel",
      name: "Adriel",
      age: 8,
      interests: ["Animals", "Outdoors"],
      dislikes: ["Deep Water"],
      avatarColor: "forest",
    },
  ],
};

const missions: Mission[] = [
  {
    id: "m1",
    code: "Mission 001",
    title: "Kennedy Space Center",
    description:
      "Stand beneath a real Saturn V, touch a moon rock, and feel a launch in your chest.",
    category: "space",
    location: "Merritt Island, FL",
    lat: 28.524,
    lng: -80.681,
    state: "FL",
    status: "completed",
    rating: 9.4,
    estimatedCost: "$$",
    estimatedDriveMinutes: 55,
    challenges: [
      { id: "c1", audience: "parent", text: "Find the biggest rocket and stand for scale.", done: true },
      { id: "c2", audience: "child", assignedChildId: "child_ana", text: "Ana, take the best photo of the day.", done: true },
      { id: "c3", audience: "child", assignedChildId: "child_adriel", text: "Adriel, count how many rockets you can find.", done: true },
      { id: "c4", audience: "bonus", text: "Learn one weird space fact and teach it to everyone.", done: true },
    ],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&q=70", caption: "Under the Saturn V" },
      { id: "p2", url: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=70", caption: "Liftoff!" },
    ],
    childRatings: [
      { childId: "child_ana", rating: 10 },
      { childId: "child_adriel", rating: 9 },
    ],
    debrief: {
      favoriteMoment: "Ana loved seeing the real rockets up close.",
      funniestMoment: "Adriel insisted he could fit in the astronaut suit.",
      surprise: "How LOUD the launch simulator was.",
      recommend: true,
      nextMissionWish: "Something with animals!",
    },
    aiSummary:
      "Mission 001 complete — Kennedy Space Center. The highlight: Ana loved seeing the real rockets up close. Funniest moment? Adriel insisted he could fit in the astronaut suit. Ana gave it 10, Adriel gave it 9. Family rating: 9.4.",
    scheduledFor: "2026-01-10",
    completedAt: "2026-01-10T16:00:00.000Z",
    createdAt: "2026-01-04T12:30:00.000Z",
  },
  {
    id: "m2",
    code: "Mission 002",
    title: "Castillo de San Marcos",
    description:
      "Explore the oldest masonry fort in the country and find the coolest cannon on the wall.",
    category: "history",
    location: "St. Augustine, FL",
    lat: 29.898,
    lng: -81.311,
    state: "FL",
    status: "completed",
    rating: 8.7,
    estimatedCost: "$",
    estimatedDriveMinutes: 90,
    challenges: [
      { id: "c5", audience: "parent", text: "Find the coolest cannon and pose for a photo.", done: true },
      { id: "c6", audience: "child", assignedChildId: "child_ana", text: "Ana, find a secret hiding spot in the fort.", done: true },
      { id: "c7", audience: "child", assignedChildId: "child_adriel", text: "Adriel, imagine who stood here 200 years ago.", done: true },
      { id: "c8", audience: "bonus", text: "Invent a new family inside joke today.", done: true },
    ],
    photos: [
      { id: "p3", url: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=70", caption: "On the fort walls" },
    ],
    childRatings: [
      { childId: "child_ana", rating: 8 },
      { childId: "child_adriel", rating: 9 },
    ],
    debrief: {
      favoriteMoment: "Ana loved exploring the fort walls.",
      funniestMoment: "Adriel declared himself 'General Adriel' and gave orders all day.",
      surprise: "The cannons are way bigger up close.",
      recommend: true,
      nextMissionWish: "The beach!",
    },
    aiSummary:
      "Mission 002 complete — Castillo de San Marcos. The highlight: Ana loved exploring the fort walls. Funniest moment? Adriel declared himself 'General Adriel.' Family rating: 8.7.",
    scheduledFor: "2026-02-14",
    completedAt: "2026-02-14T15:00:00.000Z",
    createdAt: "2026-02-01T12:30:00.000Z",
  },
  {
    id: "m3",
    code: "Mission 003",
    title: "Wild Florida Safari",
    description:
      "Airboat past gators, meet a sloth, and count how many animals you can spot.",
    category: "animals",
    location: "Kenansville, FL",
    lat: 27.95,
    lng: -81.08,
    state: "FL",
    status: "completed",
    rating: 9.1,
    estimatedCost: "$$",
    estimatedDriveMinutes: 60,
    challenges: [
      { id: "c9", audience: "parent", text: "Capture a perfect action shot of a creature.", done: true },
      { id: "c10", audience: "child", assignedChildId: "child_ana", text: "Ana, spot 5 different animals.", done: true },
      { id: "c11", audience: "child", assignedChildId: "child_adriel", text: "Adriel, make an animal noise until someone laughs.", done: true },
      { id: "c12", audience: "bonus", text: "Capture one photo nobody will believe.", done: false },
    ],
    photos: [
      { id: "p4", url: "https://images.unsplash.com/photo-1504173010664-32509aeebb62?w=800&q=70", caption: "Gator spotting" },
    ],
    childRatings: [
      { childId: "child_ana", rating: 9 },
      { childId: "child_adriel", rating: 10 },
    ],
    debrief: {
      favoriteMoment: "Adriel got to hold a baby alligator.",
      funniestMoment: "The sloth moved so slowly Adriel narrated it like a sports announcer.",
      surprise: "Manatees in the canal on the drive in.",
      recommend: true,
      nextMissionWish: "Mountains!",
    },
    aiSummary:
      "Mission 003 complete — Wild Florida Safari. The highlight: Adriel got to hold a baby alligator. Family rating: 9.1.",
    scheduledFor: "2026-03-21",
    completedAt: "2026-03-21T14:00:00.000Z",
    createdAt: "2026-03-08T12:30:00.000Z",
  },
];

export function demoState(): AppState {
  const { achievements } = evaluateAchievements(missions, []);
  return {
    family,
    missions,
    achievements,
    onboarded: true,
  };
}

export function emptyState(): AppState {
  const { achievements } = evaluateAchievements([], []);
  return { family: null, missions: [], achievements, onboarded: false };
}
