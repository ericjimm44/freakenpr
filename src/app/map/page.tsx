"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { AppFrame } from "@/components/AppFrame";
import { Icon } from "@/components/Icon";
import { categoryMeta } from "@/lib/categories";
import { COLOR_HEX } from "@/lib/utils";

const STATE_NAMES: Record<string, string> = {
  FL: "Florida", GA: "Georgia", AL: "Alabama", SC: "South Carolina",
  NC: "North Carolina", TN: "Tennessee", MS: "Mississippi", LA: "Louisiana",
};

function AtlasInner() {
  const missions = useStore((s) => s.missions);

  const plotted = missions.filter((m) => typeof m.lat === "number");
  const states = useMemo(
    () => Array.from(new Set(missions.filter((m) => m.status === "completed").map((m) => m.state))),
    [missions]
  );

  // Simple equirectangular projection over a southeast-US bounding box so pins
  // land in sensible relative positions. Production swaps in Mapbox GL.
  const BOX = { minLat: 25, maxLat: 36, minLng: -88, maxLng: -79 };
  const project = (lat: number, lng: number) => ({
    x: ((lng - BOX.minLng) / (BOX.maxLng - BOX.minLng)) * 100,
    y: (1 - (lat - BOX.minLat) / (BOX.maxLat - BOX.minLat)) * 100,
  });

  return (
    <div className="px-6 pt-8">
      <h1 className="font-display text-3xl font-black">Adventure Atlas</h1>
      <p className="mt-1 text-sm text-ink/60">
        Every pin is a memory. Watch your map fill up.
      </p>

      {/* Map canvas */}
      <div className="relative mt-5 aspect-[4/5] overflow-hidden rounded-3xl border border-ink/10 bg-sky/10">
        {/* decorative grid + water tone */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(47,93,69,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(47,93,69,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute left-3 top-3 chip bg-parchment/80 text-[10px]">
          <Icon name="Compass" size={12} /> Southeast US
        </div>

        {/* route lines connecting completed missions in order */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {plotted
            .filter((m) => m.status === "completed")
            .map((m, i, arr) => {
              if (i === 0) return null;
              const a = project(arr[i - 1].lat, arr[i - 1].lng);
              const b = project(m.lat, m.lng);
              return (
                <line
                  key={m.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={COLOR_HEX.sunset}
                  strokeWidth={0.5}
                  strokeDasharray="1.5 1.5"
                  opacity={0.6}
                />
              );
            })}
        </svg>

        {/* pins */}
        {plotted.map((m) => {
          const { x, y } = project(m.lat, m.lng);
          const meta = categoryMeta(m.category);
          const accent = COLOR_HEX[meta.accent];
          const done = m.status === "completed";
          return (
            <Link
              key={m.id}
              href={`/missions/${m.id}`}
              className="group absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-full ring-2 ring-parchment shadow-card transition group-hover:scale-110"
                style={{ backgroundColor: done ? accent : "#FBF6EC", border: done ? "none" : `2px solid ${accent}` }}
              >
                <Icon name={meta.icon} size={15} color={done ? "#FBF6EC" : accent} />
              </span>
              <span className="absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-0.5 text-[10px] font-semibold text-parchment group-hover:block">
                {m.title}
              </span>
            </Link>
          );
        })}

        {plotted.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-center text-ink/40">
            <div>
              <Icon name="MapPinned" size={32} />
              <p className="mt-2 text-sm">Plan a mission to drop your first pin</p>
            </div>
          </div>
        )}
      </div>

      {/* States visited */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-bold">
          States visited · {states.length}
        </h2>
        {states.length === 0 ? (
          <p className="mt-1 text-sm text-ink/55">Complete a mission to pin your first state.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {states.map((s) => (
              <span key={s} className="chip border-forest/30 bg-forest/10 text-forest">
                <Icon name="MapPin" size={13} /> {STATE_NAMES[s] ?? s}
              </span>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 rounded-xl bg-ink/5 p-3 text-center text-[11px] text-ink/45">
        Powered by a lightweight projection in the demo · drops into Mapbox GL in production.
      </p>
    </div>
  );
}

export default function MapPage() {
  return (
    <AppFrame>
      <AtlasInner />
    </AppFrame>
  );
}
