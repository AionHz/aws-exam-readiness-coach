export default function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[#070A14]" aria-hidden="true">
      <div className="absolute inset-0 premium-vignette" />

      <div className="absolute -top-28 left-[-12%] h-[640px] w-[640px] rounded-full bg-gradient-to-br from-indigo-500/55 via-sky-500/45 to-transparent blur-3xl opacity-55 premium-float premium-float-1" />
      <div className="absolute top-[-160px] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-fuchsia-500/45 via-indigo-500/40 to-transparent blur-3xl opacity-50 premium-float premium-float-2" />
      <div className="absolute top-[10%] left-[26%] h-[680px] w-[680px] rounded-full bg-gradient-to-br from-emerald-400/35 via-cyan-400/35 to-transparent blur-3xl opacity-45 premium-float premium-float-3" />
      <div className="absolute bottom-[-220px] left-[8%] h-[620px] w-[620px] rounded-full bg-gradient-to-br from-sky-400/40 via-indigo-400/35 to-transparent blur-3xl opacity-40 premium-float premium-float-4" />

      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(420px circle at 50% 20%, rgba(99,102,241,0.28), transparent 65%)",
        }}
      />

      <div className="absolute inset-0 premium-noise" />
    </div>
  );
}
