"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [progress, setProgress] = useState<object | null>(null);
  const [missedCount, setMissedCount] = useState(0);

  useEffect(() => {
    try {
      const rawProgress = localStorage.getItem("aws-exam-readiness-progress-v1");
      setProgress(rawProgress ? (JSON.parse(rawProgress) as object) : null);

      const rawMissed = localStorage.getItem("aws-exam-readiness-quiz-missed-v1");
      const parsedMissed = rawMissed ? (JSON.parse(rawMissed) as string[]) : [];
      setMissedCount(Array.isArray(parsedMissed) ? parsedMissed.length : 0);
    } catch {
      setProgress(null);
      setMissedCount(0);
    }
  }, []);

  const attemptsTotal =
    typeof progress === "object" && progress && "attemptsTotal" in progress
      ? Number((progress as { attemptsTotal?: number }).attemptsTotal ?? 0)
      : 0;
  const correctTotal =
    typeof progress === "object" && progress && "correctTotal" in progress
      ? Number((progress as { correctTotal?: number }).correctTotal ?? 0)
      : 0;
  const streak =
    typeof progress === "object" && progress && "streakCorrect" in progress
      ? Number((progress as { streakCorrect?: number }).streakCorrect ?? 0)
      : 0;
  const accuracy =
    attemptsTotal > 0 ? Math.round((correctTotal / attemptsTotal) * 100) : 0;
  const coveredDomains = (() => {
    if (!progress || typeof progress !== "object" || !("byDomain" in progress)) return 0;
    const byDomain = (progress as { byDomain?: Record<string, { attempts?: number }> }).byDomain;
    if (!byDomain) return 0;
    return Object.values(byDomain).filter((v) => Number(v?.attempts ?? 0) > 0).length;
  })();
  const coveragePct = Math.round((coveredDomains / 4) * 100);
  const attemptsFactor = Math.min(1, attemptsTotal / 50);
  const readinessRaw =
    0.55 * accuracy + 0.25 * coveragePct + 0.2 * (attemptsFactor * 100);
  const readiness = Math.max(0, Math.min(100, Math.round(readinessRaw)));
  const readinessLabel =
    readiness < 40
      ? "Not Ready"
      : readiness < 60
        ? "Improving"
        : readiness < 80
          ? "Almost Ready"
          : "Exam Ready";
  const weakestDomain = (() => {
    if (!progress || typeof progress !== "object" || !("byDomain" in progress)) return null;
    const byDomain = (progress as { byDomain?: Record<string, { attempts?: number; correct?: number }> })
      .byDomain;
    if (!byDomain) return null;

    let weakest: { domain: string; acc: number } | null = null;
    for (const [domain, stats] of Object.entries(byDomain)) {
      const attempts = Number(stats?.attempts ?? 0);
      if (attempts <= 0) continue;
      const correct = Number(stats?.correct ?? 0);
      const acc = attempts > 0 ? correct / attempts : 0;
      if (!weakest || acc < weakest.acc) weakest = { domain, acc };
    }
    return weakest?.domain ?? null;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#050816] to-[#060b1f] text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            AWS Exam Readiness Coach
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
            Adaptive practice for the AWS Certified Cloud Practitioner (CLF-C02). Drill smart.
            Track weaknesses. Know when you’re truly ready.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/quiz"
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-400"
            >
              Practice
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-white/15"
            >
              Dashboard
            </Link>
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_220px]">
              <div>
                <div className="text-sm font-semibold text-white/90">Readiness snapshot</div>
                <div className="mt-2 text-sm text-white/80">
                  Attempts: {attemptsTotal} • Accuracy: {accuracy}% • Streak: {streak}
                </div>
                <div className="mt-2 text-xs text-white/60">
                  {weakestDomain
                    ? `Weakest domain: ${weakestDomain}`
                    : "No domain data yet — start practicing."}
                </div>
                {missedCount > 0 && (
                  <div className="mt-3">
                    <Link
                      href="/quiz?review=missed"
                      className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-white/15"
                    >
                      Review Missed ({missedCount})
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/dashboard" className="flex flex-col items-center justify-center">
                <div
                  className="relative grid h-40 w-40 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(from 270deg, #6366f1 0%, #22c55e ${readiness}%, rgba(255,255,255,0.10) ${readiness}%, rgba(255,255,255,0.10) 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-30"
                    style={{
                      background: `conic-gradient(from 270deg, #6366f1 0%, #22c55e ${readiness}%, rgba(255,255,255,0) ${readiness}%, rgba(255,255,255,0) 100%)`,
                    }}
                  />
                  <div className="relative grid h-[120px] w-[120px] place-items-center rounded-full border border-white/10 bg-[#0b1020] text-center shadow-inner">
                    <div className="text-3xl font-bold text-white">{readiness}%</div>
                    <div className="mt-1 text-sm text-white/70">{readinessLabel}</div>
                  </div>
                </div>
                <div className="mt-3 text-center text-xs text-white/60">
                  Based on accuracy, coverage, and volume
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Link
            href="/quiz"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/5 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            aria-label="Go to Practice"
          >
            <div className="flex items-start justify-between">
              <div className="text-sm font-semibold">Adaptive Drilling</div>
              <div className="text-white/60">→</div>
            </div>
            <div className="mt-1 text-sm text-white/70">
              The system focuses on weak areas so you improve faster.
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/5 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            aria-label="Go to Dashboard"
          >
            <div className="flex items-start justify-between">
              <div className="text-sm font-semibold">Readiness Score</div>
              <div className="text-white/60">→</div>
            </div>
            <div className="mt-1 text-sm text-white/70">
              A real-time score that shows when you’re exam-ready.
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/5 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            aria-label="Go to Dashboard"
          >
            <div className="flex items-start justify-between">
              <div className="text-sm font-semibold">Weakness Tracking</div>
              <div className="text-white/60">→</div>
            </div>
            <div className="mt-1 text-sm text-white/70">
              Automatically identifies topics holding you back.
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
