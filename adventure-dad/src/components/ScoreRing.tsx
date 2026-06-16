import { scoreRank } from "@/lib/memoryScore";

export function ScoreRing({
  total,
  size = 168,
}: {
  total: number;
  size?: number;
}) {
  const { title, next } = scoreRank(total);
  const pct = next > 0 ? Math.min(1, total / next) : 1;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(44,38,32,0.10)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DA6A3C" />
            <stop offset="100%" stopColor="#E0A951" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="label">Memory Score</span>
        <span className="font-display text-4xl font-black leading-none text-ink">
          {total.toLocaleString()}
        </span>
        <span className="mt-1 text-xs font-semibold text-sunset">{title}</span>
      </div>
    </div>
  );
}
