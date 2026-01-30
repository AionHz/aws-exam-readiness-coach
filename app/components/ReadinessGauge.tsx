import { useId } from "react";

type ReadinessGaugeProps = {
  percent: number | null;
  label: string;
  score?: number;
  passMark?: number;
  size?: number;
};

export default function ReadinessGauge({
  percent,
  label,
  score,
  passMark,
  size = 168,
}: ReadinessGaugeProps) {
  const id = useId();
  const clamped = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const track = 8;
  const progress = 10;
  const r = (size - progress) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);

  const ticks = [0, 25, 50, 75, 100];
  const center = size / 2;
  const tickOuter = r + progress * 0.6;
  const tickInner = r + progress * 0.2;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={percent === null ? "Readiness not enough data" : `Readiness ${clamped} percent`}
        className="drop-shadow-[0_0_18px_rgba(99,102,241,0.22)]"
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <radialGradient id={`${id}-glass`} cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="100%" stopColor="rgba(11,16,32,0.78)" />
          </radialGradient>
        </defs>

        {ticks.map((t) => {
          const angle = (t / 100) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = center + Math.cos(rad) * tickInner;
          const y1 = center + Math.sin(rad) * tickInner;
          const x2 = center + Math.cos(rad) * tickOuter;
          const y2 = center + Math.sin(rad) * tickOuter;
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        <circle
          cx={center}
          cy={center}
          r={r}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={track}
          fill="none"
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          stroke={`url(#${id}-grad)`}
          strokeWidth={progress}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />

        <circle cx={center} cy={center} r={r - progress * 0.9} fill={`url(#${id}-glass)`} />

        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          className="readiness-figure"
        >
          {percent === null ? "—" : `${clamped}%`}
        </text>
      </svg>

      <div className="mt-2 text-[11px] uppercase tracking-widest text-white/50">Readiness</div>
      <div className="mt-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
        {label}
      </div>
      {(score !== undefined || passMark !== undefined) && (
        <div className="mt-2 text-center text-xs text-white/70 leading-relaxed">
          {score !== undefined && <div>Est. score {score}/1000</div>}
          {passMark !== undefined && <div>Pass mark {passMark}</div>}
        </div>
      )}
    </div>
  );
}
