"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { AppFrame } from "@/components/AppFrame";
import { Icon } from "@/components/Icon";
import { CATEGORIES, categoryMeta } from "@/lib/categories";
import { suggestMissions, type MissionSuggestion } from "@/lib/aiEngine";
import { COLOR_HEX, cx } from "@/lib/utils";
import type { MissionCategory } from "@/lib/types";

function NewMissionInner() {
  const router = useRouter();
  const family = useStore((s) => s.family)!;
  const missions = useStore((s) => s.missions);
  const addFromSuggestion = useStore((s) => s.addMissionFromSuggestion);
  const addCustom = useStore((s) => s.addCustomMission);

  const [tab, setTab] = useState<"ai" | "category" | "custom">("ai");
  const [filterCat, setFilterCat] = useState<MissionCategory | null>(null);
  const [thinking, setThinking] = useState(false);
  const [seed, setSeed] = useState(0);

  const suggestions = useMemo(() => {
    // `seed` lets "regenerate" reshuffle by appending a throwaway history item.
    void seed;
    return suggestMissions(family, missions, 6);
  }, [family, missions, seed]);

  const filtered = filterCat
    ? suggestions.filter((s) => s.category === filterCat)
    : suggestions;

  const plan = (s: MissionSuggestion) => {
    const m = addFromSuggestion(s, { status: "planned" });
    router.push(`/missions/${m.id}`);
  };

  const regenerate = () => {
    setThinking(true);
    setTimeout(() => {
      setSeed((x) => x + 1);
      setThinking(false);
    }, 650);
  };

  return (
    <div className="px-6 pt-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-ink/50"
      >
        <Icon name="ChevronLeft" size={18} /> Back
      </button>
      <h1 className="font-display text-3xl font-black">Plan a mission</h1>
      <p className="mt-1 text-sm text-ink/60">
        The AI Mission Architect weighs your kids&apos; interests, budget, travel
        range &amp; past adventures.
      </p>

      {/* tabs */}
      <div className="mt-5 flex gap-2">
        {([
          ["ai", "For us", "Sparkles"],
          ["category", "By type", "LayoutGrid"],
          ["custom", "Custom", "PenLine"],
        ] as const).map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cx(
              "chip flex-1 justify-center py-2",
              tab === key ? "border-forest bg-forest text-parchment" : ""
            )}
          >
            <Icon name={icon} size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === "ai" && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="label">{filtered.length} ideas for you</p>
            <button
              onClick={regenerate}
              className="flex items-center gap-1 text-xs font-semibold text-sunset"
            >
              <Icon name="RefreshCw" size={13} className={thinking ? "animate-spin" : ""} />
              Regenerate
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {thinking
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.map((s, i) => (
                  <SuggestionCard key={i} s={s} onPlan={() => plan(s)} />
                ))}
          </div>
        </div>
      )}

      {tab === "category" && (
        <div className="mt-5">
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => {
              const accent = COLOR_HEX[c.accent];
              const active = filterCat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => {
                    setFilterCat(c.key);
                    setTab("ai");
                  }}
                  className={cx(
                    "card flex flex-col items-start gap-1 p-4 text-left transition hover:shadow-lift",
                    active && "ring-2 ring-forest"
                  )}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{ backgroundColor: `${accent}22`, color: accent }}
                  >
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span className="font-display font-semibold">{c.label}</span>
                  <span className="text-[11px] leading-tight text-ink/55">{c.blurb}</span>
                </button>
              );
            })}
          </div>
          {filterCat && (
            <button
              onClick={() => setFilterCat(null)}
              className="btn-ghost mt-4 w-full"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {tab === "custom" && (
        <CustomMissionForm
          onCreate={(data) => {
            const m = addCustom(data);
            router.push(`/missions/${m.id}`);
          }}
        />
      )}
    </div>
  );
}

function SuggestionCard({ s, onPlan }: { s: MissionSuggestion; onPlan: () => void }) {
  const meta = categoryMeta(s.category);
  const accent = COLOR_HEX[meta.accent];
  return (
    <div className="card animate-slide-up p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="chip" style={{ color: accent }}>
            <Icon name={meta.icon} size={13} /> {meta.label}
          </span>
          <h3 className="mt-2 font-display text-lg font-semibold leading-tight">
            {s.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink/55">
            <Icon name="MapPin" size={12} /> {s.location}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm text-ink/70">{s.description}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <span className="chip"><Icon name="Wallet" size={12} /> {s.cost}</span>
        <span className="chip"><Icon name="Clock" size={12} /> {s.driveMinutes}m drive</span>
        <span className="chip"><Icon name="MapPinned" size={12} /> {s.state}</span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-forest/8 px-3 py-2">
        <Icon name="Sparkles" size={14} className="shrink-0 text-forest" />
        <p className="text-xs font-medium text-forest">Why: {s.reason}</p>
      </div>
      <button onClick={onPlan} className="btn-primary mt-3 w-full">
        Add to missions <Icon name="ArrowRight" size={15} />
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card relative overflow-hidden p-4">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-ink/10" />
        <div className="h-5 w-3/4 rounded bg-ink/10" />
        <div className="h-3 w-full rounded bg-ink/10" />
        <div className="h-9 w-full rounded-full bg-ink/10" />
      </div>
    </div>
  );
}

function CustomMissionForm({
  onCreate,
}: {
  onCreate: (data: {
    title: string;
    description: string;
    category: MissionCategory;
    location: string;
    lat: number;
    lng: number;
    state: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState<MissionCategory>("hidden_gems");

  const valid = title.trim() && location.trim();

  return (
    <div className="mt-5 space-y-4">
      <div>
        <label className="label">Mission title</label>
        <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Secret Waterfall" />
      </div>
      <div>
        <label className="label">Where is it?</label>
        <input className="input mt-1" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Town, ST" />
      </div>
      <div>
        <label className="label">State code</label>
        <input
          className="input mt-1 uppercase"
          maxLength={2}
          value={state}
          onChange={(e) => setState(e.target.value.toUpperCase())}
          placeholder="FL"
        />
      </div>
      <div>
        <label className="label">Category</label>
        <div className="no-scrollbar mt-1 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cx(
                "chip shrink-0",
                category === c.key ? "border-forest bg-forest text-parchment" : ""
              )}
            >
              <Icon name={c.icon} size={13} /> {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input mt-1 min-h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What makes this adventure special?"
        />
      </div>
      <button
        disabled={!valid}
        onClick={() =>
          onCreate({
            title: title.trim(),
            description: description.trim() || "A custom family adventure.",
            category,
            location: location.trim(),
            state: state.trim() || "FL",
            // Approx. Florida center when no geocode; production geocodes via Mapbox.
            lat: 28.5 + (Math.random() - 0.5),
            lng: -81.4 + (Math.random() - 0.5),
          })
        }
        className="btn-primary w-full"
      >
        Create mission <Icon name="Check" size={16} />
      </button>
    </div>
  );
}

export default function NewMissionPage() {
  return (
    <AppFrame nav={false}>
      <NewMissionInner />
    </AppFrame>
  );
}
