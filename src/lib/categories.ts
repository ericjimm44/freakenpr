import type { MissionCategory } from "./types";

export interface CategoryMeta {
  key: MissionCategory;
  label: string;
  icon: string; // lucide icon name
  blurb: string;
  accent: string; // tailwind text/border color class root
}

// Mission categories from the product spec. Order roughly by family appeal.
export const CATEGORIES: CategoryMeta[] = [
  { key: "space", label: "Space", icon: "Rocket", blurb: "Launch pads, planetariums, the cosmos", accent: "sky" },
  { key: "history", label: "History", icon: "Castle", blurb: "Forts, castles, time machines", accent: "clay" },
  { key: "animals", label: "Animals", icon: "PawPrint", blurb: "Wildlife, zoos, safaris", accent: "forest" },
  { key: "nature", label: "Nature", icon: "Trees", blurb: "Trails, springs, big skies", accent: "forest" },
  { key: "road_trip", label: "Road Trip", icon: "Car", blurb: "Windows down, snacks loaded", accent: "sunset" },
  { key: "beach", label: "Beach", icon: "Waves", blurb: "Sand, surf, and shells", accent: "sky" },
  { key: "mountains", label: "Mountains", icon: "Mountain", blurb: "Peaks, overlooks, fresh air", accent: "forest" },
  { key: "food", label: "Food", icon: "UtensilsCrossed", blurb: "Legendary stops & local bites", accent: "sunset" },
  { key: "sports", label: "Sports", icon: "Trophy", blurb: "Games, courts, big crowds", accent: "gold" },
  { key: "hidden_gems", label: "Hidden Gems", icon: "Gem", blurb: "The places only locals know", accent: "gold" },
  { key: "learning", label: "Learning", icon: "GraduationCap", blurb: "Museums, science, discovery", accent: "sky" },
  { key: "camping", label: "Camping", icon: "Tent", blurb: "Tents, fires, and stars", accent: "forest" },
  { key: "seasonal", label: "Seasonal", icon: "Sparkles", blurb: "Festivals, holidays, once-a-year", accent: "gold" },
];

export const categoryMeta = (key: MissionCategory): CategoryMeta =>
  CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
