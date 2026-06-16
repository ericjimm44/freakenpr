export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function missionCode(index: number): string {
  return `Mission ${String(index + 1).padStart(3, "0")}`;
}

/** Map a palette token to a usable hex for inline styles (avatars, pins). */
export const COLOR_HEX: Record<string, string> = {
  forest: "#2F5D45",
  sunset: "#DA6A3C",
  gold: "#E0A951",
  sky: "#5E8DB5",
  clay: "#A8543A",
};

export const AVATAR_COLORS = ["sunset", "forest", "sky", "gold", "clay"];
