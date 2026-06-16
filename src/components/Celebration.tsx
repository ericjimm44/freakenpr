"use client";

import { useEffect } from "react";
import type { Achievement } from "@/lib/types";
import { Icon } from "./Icon";

const CONFETTI = ["#DA6A3C", "#E0A951", "#2F5D45", "#5E8DB5", "#A8543A"];

export function Celebration({
  recap,
  scoreGain,
  newBadges,
  onClose,
}: {
  recap: string;
  scoreGain: number;
  newBadges: Achievement[];
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => {}, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm">
      {/* confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="absolute block h-2 w-2 rounded-sm"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `-5%`,
              backgroundColor: CONFETTI[i % CONFETTI.length],
              animation: `fall ${1.8 + (i % 5) * 0.3}s linear ${(i % 7) * 0.12}s forwards`,
              transform: `rotate(${i * 33}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-t-3xl bg-parchment p-6 pb-8">
        <div className="mx-auto -mt-12 mb-3 grid h-20 w-20 place-items-center rounded-full bg-gold text-ink shadow-lift animate-pop-in">
          <Icon name="PartyPopper" size={36} />
        </div>
        <h2 className="text-center font-display text-2xl font-black">Mission complete!</h2>
        <p className="mt-1 text-center text-sm font-semibold text-sunset">
          +{scoreGain.toLocaleString()} Memory Score
        </p>

        <div className="mt-4 rounded-2xl border border-ink/10 bg-cream/70 p-4">
          <p className="label flex items-center gap-1 text-forest">
            <Icon name="Sparkles" size={13} /> AI Mission Recap
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink/80">{recap}</p>
        </div>

        {newBadges.length > 0 && (
          <div className="mt-4">
            <p className="label">New badges unlocked</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {newBadges.map((b) => (
                <span key={b.id} className="chip border-gold bg-gold/20 text-clay animate-pop-in">
                  <Icon name={b.icon} size={14} /> {b.title}
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose} className="btn-primary mt-6 w-full">
          Continue the story <Icon name="ArrowRight" size={16} />
        </button>
      </div>

      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(540deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
