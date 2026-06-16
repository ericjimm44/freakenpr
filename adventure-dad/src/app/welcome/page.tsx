"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Icon } from "@/components/Icon";
import { uid, AVATAR_COLORS, cx } from "@/lib/utils";
import type { Child, Family } from "@/lib/types";

const INTEREST_BANK = [
  "Animals", "Outdoors", "Photography", "Swimming", "Exploring", "Space",
  "Dinosaurs", "History", "Art", "Sports", "Building", "Cooking",
  "Music", "Science", "Reading", "Cars",
];
const DISLIKE_BANK = ["Deep Water", "Long Drives", "Big Crowds", "Heights", "Bugs", "Spicy Food"];

function ChipToggle({
  options,
  selected,
  onToggle,
  tone = "forest",
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  tone?: "forest" | "clay";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={cx(
              "chip transition active:scale-95",
              on
                ? tone === "forest"
                  ? "border-forest bg-forest text-parchment"
                  : "border-clay bg-clay text-parchment"
                : "hover:border-ink/30"
            )}
          >
            {on && <Icon name="Check" size={12} />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const { hydrated, onboarded, createFamily, loadDemo } = useStore();
  const [step, setStep] = useState(0);

  // family fields
  const [parentName, setParentName] = useState("");
  const [surname, setSurname] = useState("");
  const [homeBase, setHomeBase] = useState("");
  const [budget, setBudget] = useState<Family["budgetPreference"]>("medium");
  const [travel, setTravel] = useState(120);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (hydrated && onboarded) router.replace("/");
  }, [hydrated, onboarded, router]);

  const addChild = () =>
    setChildren((c) => [
      ...c,
      {
        id: uid(),
        name: "",
        age: 8,
        interests: [],
        dislikes: [],
        avatarColor: AVATAR_COLORS[c.length % AVATAR_COLORS.length],
      },
    ]);

  const patchChild = (id: string, patch: Partial<Child>) =>
    setChildren((c) => c.map((k) => (k.id === id ? { ...k, ...patch } : k)));

  const removeChild = (id: string) =>
    setChildren((c) => c.filter((k) => k.id !== id));

  const finish = () => {
    const family: Family = {
      id: uid(),
      surname: surname.trim() || `${parentName.split(" ")[0] || "Our"}'s Family`,
      parentName: parentName.trim() || "Parent",
      homeBase: homeBase.trim() || "Home",
      budgetPreference: budget,
      maxTravelMinutes: travel,
      createdAt: new Date().toISOString(),
      children: children
        .filter((c) => c.name.trim())
        .map((c) => ({ ...c, name: c.name.trim() })),
    };
    createFamily(family);
    router.replace("/");
  };

  const canContinueStep1 = parentName.trim().length > 0;
  const canFinish = children.some((c) => c.name.trim());

  // ── Intro ──────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="flex min-h-screen flex-col px-6 py-10">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-forest/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-forest">
            <Icon name="Compass" size={14} /> Adventure Dad
          </div>
          <h1 className="font-display text-5xl font-black leading-[1.05] text-ink">
            Create memories
            <br />
            <span className="text-sunset">on purpose.</span>
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-ink/70">
            Turn free weekends into a story your kids will never forget.
            Mission-based family adventures, personalized by AI, remembered
            forever.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              ["Sparkles", "AI plans the perfect next mission"],
              ["Trophy", "Earn badges, streaks & a Family Memory Score"],
              ["BookOpen", "Build your family's growing legend"],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink/80">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/20 text-clay">
                  <Icon name={icon} size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 pt-8">
          <button className="btn-sun w-full" onClick={() => setStep(1)}>
            Start your first adventure <Icon name="ArrowRight" size={16} />
          </button>
          <button
            className="btn-ghost w-full"
            onClick={() => {
              loadDemo();
              router.replace("/");
            }}
          >
            Explore the Martinez family demo
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: parent + logistics ─────────────────────────────────────────
  if (step === 1) {
    return (
      <OnboardStep
        title="Tell us about you"
        subtitle="The AI uses this to plan adventures within reach."
        onBack={() => setStep(0)}
        onNext={() => canContinueStep1 && setStep(2)}
        nextDisabled={!canContinueStep1}
        nextLabel="Add the crew"
      >
        <div>
          <label className="label">Your name</label>
          <input
            className="input mt-1"
            placeholder="Jimmy"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Family name</label>
          <input
            className="input mt-1"
            placeholder="The Martinez Family"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Home base</label>
          <input
            className="input mt-1"
            placeholder="Orlando, FL"
            value={homeBase}
            onChange={(e) => setHomeBase(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Budget comfort</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                className={cx(
                  "rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition",
                  budget === b
                    ? "border-forest bg-forest text-parchment"
                    : "border-ink/15 hover:border-ink/30"
                )}
              >
                {b === "low" ? "$" : b === "medium" ? "$$" : "$$$"}
                <span className="ml-1">{b}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">
            How far will you drive? · {Math.round(travel / 60 * 10) / 10}h max
          </label>
          <input
            type="range"
            min={30}
            max={360}
            step={15}
            value={travel}
            onChange={(e) => setTravel(Number(e.target.value))}
            className="mt-3 w-full accent-forest"
          />
        </div>
      </OnboardStep>
    );
  }

  // ── Step 2: children ───────────────────────────────────────────────────
  return (
    <OnboardStep
      title="Who's on the team?"
      subtitle="Interests power every personalized mission & challenge."
      onBack={() => setStep(1)}
      onNext={() => canFinish && finish()}
      nextDisabled={!canFinish}
      nextLabel="Begin the adventure"
    >
      <div className="space-y-4">
        {children.map((child, i) => (
          <div key={child.id} className="card space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="label">Child {i + 1}</span>
              <button
                onClick={() => removeChild(child.id)}
                className="text-ink/40 hover:text-clay"
                aria-label="Remove child"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="flex gap-3">
              <input
                className="input flex-1"
                placeholder="Name"
                value={child.name}
                onChange={(e) => patchChild(child.id, { name: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={18}
                  className="input w-20 text-center"
                  value={child.age}
                  onChange={(e) =>
                    patchChild(child.id, { age: Number(e.target.value) })
                  }
                />
                <span className="text-xs text-ink/50">yrs</span>
              </div>
            </div>
            <div>
              <span className="label">Loves</span>
              <div className="mt-2">
                <ChipToggle
                  options={INTEREST_BANK}
                  selected={child.interests}
                  onToggle={(v) =>
                    patchChild(child.id, {
                      interests: child.interests.includes(v)
                        ? child.interests.filter((x) => x !== v)
                        : [...child.interests, v],
                    })
                  }
                />
              </div>
            </div>
            <div>
              <span className="label">Avoid</span>
              <div className="mt-2">
                <ChipToggle
                  tone="clay"
                  options={DISLIKE_BANK}
                  selected={child.dislikes}
                  onToggle={(v) =>
                    patchChild(child.id, {
                      dislikes: child.dislikes.includes(v)
                        ? child.dislikes.filter((x) => x !== v)
                        : [...child.dislikes, v],
                    })
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <button className="btn-ghost w-full border-dashed" onClick={addChild}>
          <Icon name="Plus" size={16} /> Add a child
        </button>
      </div>
    </OnboardStep>
  );
}

function OnboardStep({
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel: string;
}) {
  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <button onClick={onBack} className="mb-4 flex items-center gap-1 text-sm text-ink/50">
        <Icon name="ChevronLeft" size={18} /> Back
      </button>
      <h1 className="font-display text-3xl font-black text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
      <div className="mt-6 flex-1 space-y-4 overflow-y-auto">{children}</div>
      <button className="btn-sun mt-6 w-full" disabled={nextDisabled} onClick={onNext}>
        {nextLabel} <Icon name="ArrowRight" size={16} />
      </button>
    </div>
  );
}
