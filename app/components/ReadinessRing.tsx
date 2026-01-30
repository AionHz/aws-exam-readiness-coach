import { useId } from "react";

type ReadinessRingProps = {
  percent: number;
  label: string;
  size?: number;
};

export default function ReadinessRing({ percent, label, size = 160 }: ReadinessRingProps) {
  const id = useId();
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, percent)) / 100);

  return (
    <div className="relative flex flex-col items-center" role="img" aria-label={`Readiness ${percent} percent`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-[0_0_22px_rgba(99,102,241,0.28)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id}-grad)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - stroke * 0.7}
          fill="rgba(11,16,32,0.7)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />

        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="readiness-figure"
        >
          {percent}%
        </text>
      </svg>

      <div className="mt-2 text-xs font-semibold tracking-widest text-white/70 uppercase">
        {label}
      </div>
    </div>
  );
}
