import { NextResponse } from "next/server";
import { generateRecap } from "@/lib/aiEngine";
import type { Mission, Family } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/recap
//
// Demonstrates the production AI path. When OPENAI_API_KEY is present we ask the
// model for a warm, nostalgic recap; otherwise we fall back to the deterministic
// local engine so the app always works. The client calls the same endpoint
// either way — see /docs/AI_WORKFLOWS.md.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { mission, family } = (await req.json()) as {
    mission: Mission;
    family: Family;
  };

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({
      recap: generateRecap(mission, family),
      source: "local",
    });
  }

  try {
    const prompt = buildRecapPrompt(mission, family);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "You are the Family Lore Engine for Adventure Dad. Write warm, " +
              "nostalgic, concise recaps (2-3 sentences) that make a family feel " +
              "their memories matter. Reference children by name. Never invent facts.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await res.json();
    const recap: string =
      data?.choices?.[0]?.message?.content?.trim() ||
      generateRecap(mission, family);
    return NextResponse.json({ recap, source: "openai" });
  } catch {
    // Never block the user on an AI failure — degrade gracefully.
    return NextResponse.json({
      recap: generateRecap(mission, family),
      source: "local-fallback",
    });
  }
}

function buildRecapPrompt(mission: Mission, family: Family): string {
  const kids = family.children
    .map((c) => {
      const r = mission.childRatings.find((x) => x.childId === c.id);
      return `${c.name} (age ${c.age})${r ? ` rated it ${r.rating}/10` : ""}`;
    })
    .join("; ");
  return [
    `Family: ${family.surname}.`,
    `Mission: ${mission.title} — ${mission.location} (${mission.category}).`,
    `Children: ${kids}.`,
    `Overall rating: ${mission.rating ?? "n/a"}/10.`,
    `Favorite moment: ${mission.debrief?.favoriteMoment ?? "n/a"}.`,
    `Funniest moment: ${mission.debrief?.funniestMoment ?? "n/a"}.`,
    `Surprise: ${mission.debrief?.surprise ?? "n/a"}.`,
    "Write the recap.",
  ].join("\n");
}
