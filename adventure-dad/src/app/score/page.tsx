"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { AppFrame } from "@/components/AppFrame";
import { ScoreRing } from "@/components/ScoreRing";
import { Icon } from "@/components/Icon";
import { computeMemoryScore, scoreRank } from "@/lib/memoryScore";
import { COLOR_HEX } from "@/lib/utils";

function ScoreInner() {
  const router = useRouter();
  const family = useStore((s) => s.family)!;
  const missions = useStore((s) => s.missions);
  const score = useMemo(() => computeMemoryScore(missions, family), [missions, family]);
  const rank = scoreRank(score.total);
  const toNext = Math.max(0, rank.next - score.total);

  const rows = [
    { icon: "Flag", label: "Completed missions", detail: `${score.completedMissions.count} × 100`, points: score.completedMissions.points, color: "forest" },
    { icon: "Star", label: "Mission ratings", detail: `avg ${score.ratings.avg || "—"}/10`, points: score.ratings.points, color: "gold" },
    { icon: "Camera", label: "Family photos", detail: `${score.photos.count} captured`, points: score.photos.points, color: "sky" },
    { icon: "Flame", label: "Adventure streak", detail: `${score.streak.weeks} week${score.streak.weeks === 1 ? "" : "s"}`, points: score.streak.points, color: "sunset" },
    { icon: "Map", label: "States visited", detail: `${score.states.count} pinned`, points: score.states.points, color: "clay" },
    { icon: "Users", label: "Child participation", detail: `${score.participation.pct}% involved`, points: score.participation.points, color: "forest" },
  ];

  return (
    <div className="px-6 pt-8">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-ink/50">
        <Icon name="ChevronLeft" size={18} /> Back
      </button>
      <h1 className="font-display text-3xl font-black">Family Memory Score</h1>
      <p className="mt-1 text-sm text-ink/60">
        The one number that matters — every adventure makes it grow.
      </p>

      <div className="mt-6 flex flex-col items-center">
        <ScoreRing total={score.total} size={200} />
        <p className="mt-4 text-center text-sm text-ink/70">
          {toNext > 0 ? (
            <>
              <span className="font-bold text-sunset">{toNext.toLocaleString()}</span> points to{" "}
              <span className="font-semibold">{scoreRank(rank.next).title}</span>
            </>
          ) : (
            "You've reached the top rank — legendary!"
          )}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="card flex items-center gap-3 p-4">
            <span
              className="grid h-11 w-11 place-items-center rounded-xl"
              style={{ backgroundColor: `${COLOR_HEX[r.color]}22`, color: COLOR_HEX[r.color] }}
            >
              <Icon name={r.icon} size={20} />
            </span>
            <div className="flex-1">
              <p className="font-display font-semibold leading-tight">{r.label}</p>
              <p className="text-xs text-ink/55">{r.detail}</p>
            </div>
            <span className="font-display text-lg font-black text-ink">
              +{r.points.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-forest/8 p-4 text-center">
        <p className="text-sm text-ink/70">
          Total Family Memory Score
        </p>
        <p className="font-display text-4xl font-black text-forest">
          {score.total.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function ScorePage() {
  return (
    <AppFrame nav={false}>
      <ScoreInner />
    </AppFrame>
  );
}
