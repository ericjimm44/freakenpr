"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { AppFrame } from "@/components/AppFrame";
import { Icon } from "@/components/Icon";
import { ChildAvatar } from "@/components/ChildAvatar";
import { DebriefSheet } from "@/components/DebriefSheet";
import { Celebration } from "@/components/Celebration";
import { categoryMeta } from "@/lib/categories";
import { computeMemoryScore } from "@/lib/memoryScore";
import { fetchRecap } from "@/lib/aiClient";
import { COLOR_HEX, formatDate, uid, cx } from "@/lib/utils";
import type { Achievement, MissionDebrief } from "@/lib/types";

function MissionDetailInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const family = useStore((s) => s.family)!;
  const missions = useStore((s) => s.missions);
  const mission = missions.find((m) => m.id === id);
  const toggleChallenge = useStore((s) => s.toggleChallenge);
  const addPhoto = useStore((s) => s.addPhoto);
  const removePhoto = useStore((s) => s.removePhoto);
  const completeMission = useStore((s) => s.completeMission);
  const updateMission = useStore((s) => s.updateMission);
  const startMission = useStore((s) => s.startMission);
  const deleteMission = useStore((s) => s.deleteMission);

  const [debriefOpen, setDebriefOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [celebrate, setCelebrate] = useState<{
    recap: string;
    gain: number;
    badges: Achievement[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!mission) {
    return (
      <div className="px-6 pt-20 text-center">
        <p className="text-ink/60">Mission not found.</p>
        <button onClick={() => router.push("/missions")} className="btn-ghost mt-4">
          Back to missions
        </button>
      </div>
    );
  }

  const meta = categoryMeta(mission.category);
  const accent = COLOR_HEX[meta.accent];
  const done = mission.status === "completed";
  const cover = mission.photos[0]?.url;

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        addPhoto(mission.id, { id: uid(), url: String(reader.result) });
      reader.readAsDataURL(file);
    });
  };

  const submitDebrief = (data: {
    rating: number;
    childRatings: { childId: string; rating: number }[];
    debrief: MissionDebrief;
  }) => {
    const before = computeMemoryScore(missions, family).total;
    const badges = completeMission(mission.id, data);
    const afterMissions = useStore.getState().missions;
    const after = computeMemoryScore(afterMissions, family).total;
    const completed = afterMissions.find((m) => m.id === mission.id);
    const recap = completed?.aiSummary ?? "";
    setDebriefOpen(false);
    setCelebrate({ recap, gain: Math.max(0, after - before), badges });

    // Upgrade the recap via the AI route (OpenAI when keyed; local fallback
    // otherwise). Non-blocking — the celebration already shows a recap.
    if (completed) {
      fetchRecap(completed, family).then((enhanced) => {
        if (enhanced && enhanced !== recap) {
          updateMission(mission.id, { aiSummary: enhanced });
          setCelebrate((c) => (c ? { ...c, recap: enhanced } : c));
        }
      });
    }
  };

  const childRatingFor = (childId: string) =>
    mission.childRatings.find((r) => r.childId === childId)?.rating;

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative h-56 w-full" style={{ backgroundColor: `${accent}26` }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center">
            <Icon name={meta.icon} size={64} color={accent} strokeWidth={1.4} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-5 grid h-9 w-9 place-items-center rounded-full bg-parchment/90 text-ink shadow-card"
        >
          <Icon name="ChevronLeft" size={18} />
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete mission"
          className="absolute right-4 top-5 grid h-9 w-9 place-items-center rounded-full bg-parchment/90 text-clay shadow-card"
        >
          <Icon name="Trash2" size={17} />
        </button>
        <div className="absolute bottom-4 left-5 right-5 text-parchment">
          <span className="chip bg-parchment/90 text-ink" style={{ color: accent }}>
            <Icon name={meta.icon} size={13} /> {meta.label}
          </span>
          <h1 className="mt-2 font-display text-3xl font-black leading-tight drop-shadow">
            {mission.title}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-parchment/90">
            <Icon name="MapPin" size={14} /> {mission.location}
          </p>
        </div>
      </div>

      <div className="space-y-6 px-6 pt-5">
        {/* status + meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip font-semibold">{mission.code}</span>
          {done && typeof mission.rating === "number" && (
            <span className="chip border-gold bg-gold/15 font-bold text-clay">
              <Icon name="Star" size={13} className="fill-gold text-gold" />
              {mission.rating.toFixed(1)} / 10
            </span>
          )}
          {mission.estimatedDriveMinutes && (
            <span className="chip"><Icon name="Clock" size={12} /> {mission.estimatedDriveMinutes}m</span>
          )}
          {mission.estimatedCost && (
            <span className="chip"><Icon name="Wallet" size={12} /> {mission.estimatedCost}</span>
          )}
          {done && (
            <span className="chip"><Icon name="Calendar" size={12} /> {formatDate(mission.completedAt)}</span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-ink/75">{mission.description}</p>

        {/* AI Recap */}
        {done && mission.aiSummary && (
          <div className="card border-forest/20 bg-forest/5 p-4">
            <p className="label flex items-center gap-1 text-forest">
              <Icon name="Sparkles" size={13} /> AI Mission Recap
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{mission.aiSummary}</p>
          </div>
        )}

        {/* Challenges */}
        <section>
          <h2 className="font-display text-lg font-bold">Mission Challenges</h2>
          <p className="text-xs text-ink/55">Personalized for everyone on the team.</p>
          <div className="mt-3 space-y-2">
            {mission.challenges.map((c) => {
              const child = family.children.find((k) => k.id === c.assignedChildId);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleChallenge(mission.id, c.id)}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                    c.done
                      ? "border-forest/30 bg-forest/8"
                      : "border-ink/10 bg-cream/60 hover:border-ink/20"
                  )}
                >
                  <span
                    className={cx(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition",
                      c.done ? "border-forest bg-forest text-parchment" : "border-ink/25"
                    )}
                  >
                    {c.done && <Icon name="Check" size={14} strokeWidth={3} />}
                  </span>
                  <div className="flex-1">
                    <span
                      className={cx(
                        "text-[10px] font-bold uppercase tracking-wide",
                        c.audience === "bonus" ? "text-gold" : c.audience === "parent" ? "text-sky" : "text-sunset"
                      )}
                    >
                      {c.audience === "parent"
                        ? "Parent challenge"
                        : c.audience === "bonus"
                        ? "Bonus challenge"
                        : `${child?.name ?? "Child"}'s challenge`}
                    </span>
                    <p className={cx("text-sm", c.done && "text-ink/50 line-through")}>{c.text}</p>
                  </div>
                  {child && <ChildAvatar child={child} size={28} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Photos */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Photos</h2>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 text-xs font-semibold text-sunset"
            >
              <Icon name="Plus" size={14} /> Add
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>
          {mission.photos.length === 0 ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 py-8 text-ink/45"
            >
              <Icon name="Camera" size={28} />
              <span className="text-sm font-semibold">Add your first photo</span>
            </button>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {mission.photos.map((p) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption ?? ""} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removePhoto(mission.id, p.id)}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-parchment opacity-0 transition group-hover:opacity-100"
                  >
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Child ratings (post-debrief) */}
        {done && mission.childRatings.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold">How the crew rated it</h2>
            <div className="mt-3 space-y-2">
              {family.children.map((c) => {
                const r = childRatingFor(c.id);
                if (r == null) return null;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <ChildAvatar child={c} size={32} />
                    <span className="w-16 text-sm font-semibold">{c.name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${r * 10}%` }} />
                    </div>
                    <span className="w-8 text-right font-display font-bold">{r}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Debrief highlights */}
        {done && mission.debrief && (
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold">Memories captured</h2>
            {mission.debrief.favoriteMoment && (
              <Memory icon="Star" label="Favorite moment" text={mission.debrief.favoriteMoment} />
            )}
            {mission.debrief.funniestMoment && (
              <Memory icon="Laugh" label="Funniest moment" text={mission.debrief.funniestMoment} />
            )}
            {mission.debrief.surprise && (
              <Memory icon="Sparkle" label="Biggest surprise" text={mission.debrief.surprise} />
            )}
            {mission.debrief.nextMissionWish && (
              <Memory icon="Wand2" label="Next mission wish" text={mission.debrief.nextMissionWish} />
            )}
          </section>
        )}
      </div>

      {/* Complete CTA */}
      {!done && (
        <div className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 gap-2 border-t border-ink/10 bg-parchment/95 p-4 backdrop-blur">
          {mission.status === "planned" && (
            <button
              onClick={() => startMission(mission.id)}
              className="btn-ghost shrink-0"
            >
              <Icon name="Play" size={15} /> Start
            </button>
          )}
          <button onClick={() => setDebriefOpen(true)} className="btn-sun flex-1">
            <Icon name="Flag" size={16} /> Complete &amp; debrief
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6 backdrop-blur-sm">
          <div className="card w-full max-w-xs animate-pop-in bg-parchment p-5 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-clay/15 text-clay">
              <Icon name="Trash2" size={22} />
            </span>
            <p className="mt-3 font-display text-lg font-bold">Delete {mission.code}?</p>
            <p className="mt-1 text-xs text-ink/55">
              This removes the mission and its memories. This can&apos;t be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1">
                Keep
              </button>
              <button
                onClick={() => {
                  deleteMission(mission.id);
                  router.replace("/missions");
                }}
                className="btn flex-1 bg-clay text-parchment"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {debriefOpen && (
        <DebriefSheet
          mission={mission}
          family={family}
          onClose={() => setDebriefOpen(false)}
          onSubmit={submitDebrief}
        />
      )}
      {celebrate && (
        <Celebration
          recap={celebrate.recap}
          scoreGain={celebrate.gain}
          newBadges={celebrate.badges}
          onClose={() => setCelebrate(null)}
        />
      )}
    </div>
  );
}

function Memory({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="card flex gap-3 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/20 text-clay">
        <Icon name={icon} size={16} />
      </span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink/45">{label}</p>
        <p className="text-sm text-ink/80">{text}</p>
      </div>
    </div>
  );
}

export default function MissionDetailPage() {
  return (
    <AppFrame nav={false}>
      <MissionDetailInner />
    </AppFrame>
  );
}
