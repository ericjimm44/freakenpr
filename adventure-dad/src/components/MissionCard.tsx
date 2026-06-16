import Link from "next/link";
import type { Mission } from "@/lib/types";
import { categoryMeta } from "@/lib/categories";
import { Icon } from "./Icon";
import { COLOR_HEX, formatDate, cx } from "@/lib/utils";

const STATUS_LABEL: Record<Mission["status"], string> = {
  suggested: "Suggested",
  planned: "Planned",
  active: "In progress",
  completed: "Completed",
};

export function MissionCard({ mission }: { mission: Mission }) {
  const meta = categoryMeta(mission.category);
  const accent = COLOR_HEX[meta.accent] ?? COLOR_HEX.forest;
  const cover = mission.photos[0]?.url;

  return (
    <Link
      href={`/missions/${mission.id}`}
      className="card block overflow-hidden transition hover:shadow-lift active:scale-[0.99]"
    >
      <div className="relative h-28 w-full" style={{ backgroundColor: `${accent}22` }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon name={meta.icon} size={40} color={accent} strokeWidth={1.6} />
          </div>
        )}
        <span
          className="absolute left-3 top-3 chip bg-parchment/90 backdrop-blur"
          style={{ color: accent }}
        >
          <Icon name={meta.icon} size={13} /> {meta.label}
        </span>
        {mission.status === "completed" && typeof mission.rating === "number" && (
          <span className="absolute right-3 top-3 chip bg-ink/85 text-parchment">
            <Icon name="Star" size={12} className="fill-gold text-gold" />
            {mission.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
          <span>{mission.code}</span>
          <span
            className={cx(
              "rounded-full px-2 py-0.5",
              mission.status === "completed"
                ? "bg-forest/12 text-forest"
                : "bg-sunset/12 text-sunset"
            )}
          >
            {STATUS_LABEL[mission.status]}
          </span>
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold leading-tight">
          {mission.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink/55">
          <Icon name="MapPin" size={13} /> {mission.location}
        </p>
        {mission.status === "completed" ? (
          <p className="mt-1 text-[11px] text-ink/40">
            {formatDate(mission.completedAt)}
          </p>
        ) : mission.scheduledFor ? (
          <p className="mt-1 text-[11px] text-ink/40">
            Scheduled · {formatDate(mission.scheduledFor)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
