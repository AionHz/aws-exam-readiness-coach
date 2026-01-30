export default function AuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          WebkitMaskImage:
            "radial-gradient(circle at 50% 25%, #000 0%, #000 45%, transparent 75%)",
          maskImage:
            "radial-gradient(circle at 50% 25%, #000 0%, #000 45%, transparent 75%)",
        }}
      >
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-indigo-500/30 blur-[120px]" />
        <div className="absolute -top-16 -right-20 h-[480px] w-[480px] rounded-full bg-sky-400/25 blur-[120px]" />
        <div className="absolute top-24 left-1/3 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[140px]" />
        <div className="absolute bottom-[-80px] left-1/4 h-[520px] w-[520px] rounded-full bg-emerald-400/18 blur-[140px]" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_20%,transparent_0%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.65)_100%)]" />

      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0 1px, transparent 1px 3px)",
        }}
      />
    </div>
  );
}
