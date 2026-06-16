"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { AppFrame } from "@/components/AppFrame";
import { Icon } from "@/components/Icon";
import { ChildAvatar } from "@/components/ChildAvatar";
import { cx } from "@/lib/utils";
import type { Family } from "@/lib/types";

function FamilyInner() {
  const router = useRouter();
  const family = useStore((s) => s.family)!;
  const updateFamily = useStore((s) => s.updateFamily);
  const reset = useStore((s) => s.reset);
  const loadDemo = useStore((s) => s.loadDemo);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="px-6 pt-8">
      {/* Family header */}
      <div className="card overflow-hidden">
        <div className="bg-forest px-5 py-6 text-parchment">
          <h1 className="font-display text-2xl font-black">{family.surname}</h1>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-parchment/80">
            <Icon name="MapPin" size={14} /> {family.homeBase}
          </p>
        </div>
        <div className="flex items-center gap-3 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-sunset/15 text-sunset">
            <Icon name="UserRound" size={24} />
          </span>
          <div>
            <p className="text-xs text-ink/50">Adventure leader</p>
            <p className="font-display text-lg font-semibold">{family.parentName}</p>
          </div>
        </div>
      </div>

      {/* Children */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-bold">The crew</h2>
        <div className="mt-3 space-y-3">
          {family.children.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-center gap-3">
                <ChildAvatar child={c} size={44} />
                <div>
                  <p className="font-display text-lg font-semibold leading-tight">{c.name}</p>
                  <p className="text-xs text-ink/50">{c.age} years old</p>
                </div>
              </div>
              {c.interests.length > 0 && (
                <div className="mt-3">
                  <p className="label">Loves</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.interests.map((i) => (
                      <span key={i} className="chip border-forest/25 bg-forest/10 text-forest">{i}</span>
                    ))}
                  </div>
                </div>
              )}
              {c.dislikes.length > 0 && (
                <div className="mt-3">
                  <p className="label">Avoids</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.dislikes.map((i) => (
                      <span key={i} className="chip border-clay/25 bg-clay/10 text-clay">{i}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Adventure preferences */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-bold">Adventure preferences</h2>
        <div className="card mt-3 space-y-4 p-4">
          <div>
            <p className="label">Budget comfort</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as Family["budgetPreference"][]).map((b) => (
                <button
                  key={b}
                  onClick={() => updateFamily({ budgetPreference: b })}
                  className={cx(
                    "rounded-xl border px-2 py-2 text-sm font-semibold capitalize",
                    family.budgetPreference === b
                      ? "border-forest bg-forest text-parchment"
                      : "border-ink/15"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label">
              Max drive · {Math.round((family.maxTravelMinutes / 60) * 10) / 10}h
            </p>
            <input
              type="range"
              min={30}
              max={360}
              step={15}
              value={family.maxTravelMinutes}
              onChange={(e) => updateFamily({ maxTravelMinutes: Number(e.target.value) })}
              className="mt-3 w-full accent-forest"
            />
          </div>
        </div>
      </section>

      {/* Data controls */}
      <section className="mt-6 space-y-2">
        <button onClick={loadDemo} className="btn-ghost w-full">
          <Icon name="Sparkles" size={15} /> Load Martinez demo data
        </button>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="btn w-full border border-clay/40 text-clay"
          >
            <Icon name="RotateCcw" size={15} /> Reset everything
          </button>
        ) : (
          <div className="card border-clay/40 p-4 text-center">
            <p className="text-sm font-semibold text-clay">Erase your whole family story?</p>
            <p className="mt-1 text-xs text-ink/55">This clears all missions, photos & badges.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="btn-ghost flex-1">
                Keep it
              </button>
              <button
                onClick={() => {
                  reset();
                  router.replace("/welcome");
                }}
                className="btn flex-1 bg-clay text-parchment"
              >
                Erase
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="mt-6 pb-4 text-center text-[11px] text-ink/40">
        Adventure Dad · create memories on purpose
      </p>
    </div>
  );
}

export default function FamilyPage() {
  return (
    <AppFrame>
      <FamilyInner />
    </AppFrame>
  );
}
