"use client";

import { useState } from "react";
import type { Child } from "@/lib/types";
import { Icon } from "./Icon";
import { cx, uid, AVATAR_COLORS } from "@/lib/utils";

const INTEREST_BANK = [
  "Animals", "Outdoors", "Photography", "Swimming", "Exploring", "Space",
  "Dinosaurs", "History", "Art", "Sports", "Building", "Cooking",
  "Music", "Science", "Reading", "Cars",
];
const DISLIKE_BANK = ["Deep Water", "Long Drives", "Big Crowds", "Heights", "Bugs", "Spicy Food"];

// Add or edit a child. Shared by onboarding-adjacent flows and the Family page.
export function ChildEditorSheet({
  initial,
  index = 0,
  onClose,
  onSave,
}: {
  initial?: Child;
  index?: number;
  onClose: () => void;
  onSave: (child: Child) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age ?? 8);
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? []);
  const [dislikes, setDislikes] = useState<string[]>(initial?.dislikes ?? []);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string
  ) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? uid(),
      name: name.trim(),
      age,
      interests,
      dislikes,
      avatarColor: initial?.avatarColor ?? AVATAR_COLORS[index % AVATAR_COLORS.length],
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl bg-parchment p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black">
            {initial ? `Edit ${initial.name || "child"}` : "Add a child"}
          </h2>
          <button onClick={onClose} className="text-ink/40" aria-label="Close">
            <Icon name="X" size={22} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              className="input flex-1"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={18}
                className="input w-20 text-center"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
              <span className="text-xs text-ink/50">yrs</span>
            </div>
          </div>

          <div>
            <span className="label">Loves</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {INTEREST_BANK.map((o) => (
                <button
                  key={o}
                  onClick={() => toggle(interests, setInterests, o)}
                  className={cx("chip", interests.includes(o) && "border-forest bg-forest text-parchment")}
                >
                  {interests.includes(o) && <Icon name="Check" size={12} />} {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Avoid</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {DISLIKE_BANK.map((o) => (
                <button
                  key={o}
                  onClick={() => toggle(dislikes, setDislikes, o)}
                  className={cx("chip", dislikes.includes(o) && "border-clay bg-clay text-parchment")}
                >
                  {dislikes.includes(o) && <Icon name="Check" size={12} />} {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={save} disabled={!name.trim()} className="btn-primary mt-6 w-full">
          {initial ? "Save changes" : "Add child"} <Icon name="Check" size={16} />
        </button>
      </div>
    </div>
  );
}
