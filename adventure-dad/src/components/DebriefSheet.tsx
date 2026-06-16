"use client";

import { useState } from "react";
import type { Mission, Family, MissionDebrief } from "@/lib/types";
import { ChildAvatar } from "./ChildAvatar";
import { Icon } from "./Icon";
import { cx } from "@/lib/utils";

// The Mission Debrief — captured after every adventure. Drives the recap,
// memory score, child participation and family lore.
export function DebriefSheet({
  mission,
  family,
  onClose,
  onSubmit,
}: {
  mission: Mission;
  family: Family;
  onClose: () => void;
  onSubmit: (data: {
    rating: number;
    childRatings: { childId: string; rating: number }[];
    debrief: MissionDebrief;
  }) => void;
}) {
  const [favoriteMoment, setFav] = useState("");
  const [funniestMoment, setFunny] = useState("");
  const [surprise, setSurprise] = useState("");
  const [recommend, setRecommend] = useState<boolean | undefined>(undefined);
  const [nextMissionWish, setWish] = useState("");
  const [rating, setRating] = useState(8);
  const [childRatings, setChildRatings] = useState<Record<string, number>>(
    Object.fromEntries(family.children.map((c) => [c.id, 8]))
  );

  const submit = () =>
    onSubmit({
      rating,
      childRatings: family.children.map((c) => ({
        childId: c.id,
        rating: childRatings[c.id] ?? 8,
      })),
      debrief: { favoriteMoment, funniestMoment, surprise, recommend, nextMissionWish },
    });

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl bg-parchment p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black">Mission Debrief</h2>
          <button onClick={onClose} className="text-ink/40">
            <Icon name="X" size={22} />
          </button>
        </div>
        <p className="-mt-2 mb-5 text-sm text-ink/60">
          Capture the memories from {mission.title} while they&apos;re fresh.
        </p>

        <div className="space-y-5">
          <Prompt label="⭐ What was your favorite moment?">
            <textarea className="input min-h-20" value={favoriteMoment} onChange={(e) => setFav(e.target.value)} placeholder="The thing nobody will forget…" />
          </Prompt>
          <Prompt label="😂 What was funniest?">
            <textarea className="input min-h-16" value={funniestMoment} onChange={(e) => setFunny(e.target.value)} placeholder="A future family inside joke…" />
          </Prompt>
          <Prompt label="😮 What surprised you?">
            <input className="input" value={surprise} onChange={(e) => setSurprise(e.target.value)} placeholder="The unexpected highlight" />
          </Prompt>

          <Prompt label="Rate the mission">
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={10} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="flex-1 accent-sunset" />
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sunset font-display text-lg font-black text-parchment">
                {rating}
              </span>
            </div>
          </Prompt>

          <Prompt label="How did the kids rate it?">
            <div className="space-y-3">
              {family.children.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <ChildAvatar child={c} size={32} />
                  <span className="w-16 text-sm font-semibold">{c.name}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={childRatings[c.id]}
                    onChange={(e) =>
                      setChildRatings((r) => ({ ...r, [c.id]: Number(e.target.value) }))
                    }
                    className="flex-1 accent-forest"
                  />
                  <span className="w-6 text-right font-display font-bold">
                    {childRatings[c.id]}
                  </span>
                </div>
              ))}
            </div>
          </Prompt>

          <Prompt label="Would you recommend it?">
            <div className="flex gap-2">
              {[
                [true, "Yes!", "ThumbsUp"],
                [false, "Maybe not", "ThumbsDown"],
              ].map(([val, label, icon]) => (
                <button
                  key={String(val)}
                  onClick={() => setRecommend(val as boolean)}
                  className={cx(
                    "chip flex-1 justify-center py-2.5",
                    recommend === val ? "border-forest bg-forest text-parchment" : ""
                  )}
                >
                  <Icon name={icon as string} size={14} /> {label as string}
                </button>
              ))}
            </div>
          </Prompt>

          <Prompt label="🔮 What should the next mission be?">
            <input className="input" value={nextMissionWish} onChange={(e) => setWish(e.target.value)} placeholder="The kids' wish feeds the AI…" />
          </Prompt>
        </div>

        <button onClick={submit} className="btn-sun mt-6 w-full">
          Complete mission &amp; generate recap <Icon name="Sparkles" size={16} />
        </button>
      </div>
    </div>
  );
}

function Prompt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink/80">{label}</label>
      {children}
    </div>
  );
}
