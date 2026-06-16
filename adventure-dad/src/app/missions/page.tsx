"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { AppFrame } from "@/components/AppFrame";
import { MissionCard } from "@/components/MissionCard";
import { Icon } from "@/components/Icon";
import { categoryMeta } from "@/lib/categories";
import { COLOR_HEX, formatDate, cx } from "@/lib/utils";

type View = "timeline" | "grid";

function MissionsInner() {
  const missions = useStore((s) => s.missions);
  const [view, setView] = useState<View>("timeline");

  const ordered = useMemo(
    () =>
      [...missions].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [missions]
  );

  return (
    <div className="px-6 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black">Mission Log</h1>
        <div className="flex rounded-full border border-ink/15 p-0.5">
          {(["timeline", "grid"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cx(
                "rounded-full p-2 transition",
                view === v ? "bg-forest text-parchment" : "text-ink/50"
              )}
              aria-label={v}
            >
              <Icon name={v === "timeline" ? "GitCommitVertical" : "LayoutGrid"} size={16} />
            </button>
          ))}
        </div>
      </div>

      {ordered.length === 0 ? (
        <EmptyState />
      ) : view === "timeline" ? (
        <Timeline />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3">
          {[...ordered].reverse().map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </div>
      )}

      <Link
        href="/missions/new"
        className="btn-sun fixed bottom-20 left-1/2 z-20 -translate-x-1/2 shadow-lift"
      >
        <Icon name="Plus" size={18} /> New mission
      </Link>
    </div>
  );
}

function Timeline() {
  const missions = useStore((s) => s.missions);
  const ordered = [...missions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="relative mt-6 pl-8">
      {/* the story thread */}
      <div className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-gradient-to-b from-sunset via-gold to-forest" />
      <div className="space-y-5">
        {ordered.map((m) => {
          const meta = categoryMeta(m.category);
          const accent = COLOR_HEX[meta.accent];
          const done = m.status === "completed";
          return (
            <Link key={m.id} href={`/missions/${m.id}`} className="relative block">
              <span
                className="absolute -left-[29px] top-1 grid h-6 w-6 place-items-center rounded-full ring-4 ring-parchment"
                style={{ backgroundColor: done ? accent : "#FBF6EC", borderColor: accent, border: done ? "none" : `2px solid ${accent}` }}
              >
                <Icon
                  name={done ? "Check" : meta.icon}
                  size={done ? 13 : 12}
                  color={done ? "#FBF6EC" : accent}
                  strokeWidth={2.4}
                />
              </span>
              <div className="card p-4 transition hover:shadow-lift active:scale-[0.99]">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
                  {m.code}
                  <span style={{ color: accent }}>· {meta.label}</span>
                </div>
                <h3 className="mt-0.5 font-display text-lg font-semibold leading-tight">
                  {m.title}
                </h3>
                <div className="mt-1 flex items-center justify-between">
                  <p className="flex items-center gap-1 text-xs text-ink/55">
                    <Icon name="MapPin" size={12} /> {m.location}
                  </p>
                  {done && typeof m.rating === "number" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-gold">
                      <Icon name="Star" size={12} className="fill-gold" />
                      {m.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="chip text-[10px]">{m.status}</span>
                  )}
                </div>
                {done && (
                  <p className="mt-1 text-[11px] text-ink/40">
                    {formatDate(m.completedAt)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-center text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-sunset/15 text-sunset">
        <Icon name="Map" size={36} />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold">Your story starts here</h2>
      <p className="mt-1 max-w-xs text-sm text-ink/60">
        Plan your first mission and watch your family timeline come to life.
      </p>
      <Link href="/missions/new" className="btn-sun mt-6">
        <Icon name="Sparkles" size={16} /> Plan first mission
      </Link>
    </div>
  );
}

export default function MissionsPage() {
  return (
    <AppFrame>
      <MissionsInner />
    </AppFrame>
  );
}
