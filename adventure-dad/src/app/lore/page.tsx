"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { AppFrame } from "@/components/AppFrame";
import { Icon } from "@/components/Icon";
import { generateLore } from "@/lib/aiEngine";
import { cx, formatDate } from "@/lib/utils";

function LoreInner() {
  const family = useStore((s) => s.family)!;
  const missions = useStore((s) => s.missions);
  const achievements = useStore((s) => s.achievements);

  const lore = useMemo(() => generateLore(family, missions), [family, missions]);
  const earned = achievements.filter((a) => a.earnedAt);
  const locked = achievements.filter((a) => !a.earnedAt);

  return (
    <div className="px-6 pt-8">
      <h1 className="font-display text-3xl font-black">Family Lore</h1>
      <p className="mt-1 text-sm text-ink/60">The growing legend of {family.surname}.</p>

      {/* The story card — feels like an open journal */}
      <div className="relative mt-5 overflow-hidden rounded-3xl border border-ink/10 bg-cream p-6 shadow-card">
        <div className="absolute -right-8 -top-8 opacity-[0.06]">
          <Icon name="BookOpen" size={160} />
        </div>
        <p className="font-display text-xl font-bold leading-snug text-ink">
          {lore.headline}
        </p>
        {lore.paragraphs.map((p, i) => (
          <p key={i} className="mt-3 text-sm leading-relaxed text-ink/75">
            {p}
          </p>
        ))}

        <div className="mt-5 grid grid-cols-4 gap-2">
          {lore.stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-parchment/70 py-2 text-center">
              <p className="font-display text-xl font-black text-forest">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-ink/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Running jokes */}
      {lore.runningJokes.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-lg font-bold">Running jokes & moments</h2>
          <div className="mt-3 space-y-2">
            {lore.runningJokes.map((j, i) => (
              <div key={i} className="card flex items-start gap-3 p-3">
                <Icon name="Laugh" size={18} className="mt-0.5 shrink-0 text-gold" />
                <p className="text-sm text-ink/80">{j}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      <section className="mt-7">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">Achievements</h2>
          <span className="text-xs font-semibold text-ink/50">
            {earned.length}/{achievements.length}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {[...earned, ...locked].map((a) => {
            const isEarned = Boolean(a.earnedAt);
            return (
              <div
                key={a.id}
                className={cx(
                  "card flex flex-col items-center p-3 text-center transition",
                  isEarned ? "border-gold/40" : "opacity-55"
                )}
                title={a.description}
              >
                <span
                  className={cx(
                    "grid h-12 w-12 place-items-center rounded-full",
                    isEarned ? "bg-gold/20 text-clay" : "bg-ink/8 text-ink/40"
                  )}
                >
                  <Icon name={isEarned ? a.icon : "Lock"} size={22} />
                </span>
                <p className="mt-2 text-[11px] font-bold leading-tight">{a.title}</p>
                {isEarned ? (
                  <p className="mt-0.5 text-[9px] text-ink/45">{formatDate(a.earnedAt)}</p>
                ) : (
                  <p className="mt-0.5 text-[9px] leading-tight text-ink/40">{a.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function LorePage() {
  return (
    <AppFrame>
      <LoreInner />
    </AppFrame>
  );
}
