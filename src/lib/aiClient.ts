import type { Mission, Family } from "./types";
import { generateRecap } from "./aiEngine";

// Calls the server AI route (which uses OpenAI when keyed, else the local
// engine). Always resolves to a usable recap — network/API failures fall back
// to the local engine so the UI is never blocked.
export async function fetchRecap(mission: Mission, family: Family): Promise<string> {
  try {
    const res = await fetch("/api/ai/recap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mission, family }),
    });
    if (!res.ok) throw new Error(`recap ${res.status}`);
    const data = (await res.json()) as { recap?: string };
    return data.recap?.trim() || generateRecap(mission, family);
  } catch {
    return generateRecap(mission, family);
  }
}
