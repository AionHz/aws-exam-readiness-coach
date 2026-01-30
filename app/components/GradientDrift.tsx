"use client";

type GradientDriftProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GradientDrift({ children, className }: GradientDriftProps) {
  return (
    <div
      className={`relative isolate ${className ? className : ""}`}
      aria-hidden={false}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 driftA driftAnim" />
        <div className="absolute inset-0 driftB driftAnim" />
        <div className="absolute inset-0 driftC driftAnim" />
        <div className="absolute inset-0 driftVignette" />
        <div className="absolute inset-0 driftNoise" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
