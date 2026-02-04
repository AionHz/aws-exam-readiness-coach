"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cardBase, cardHover, linkReset } from "./lib/ui";
import LinkButton from "./components/ui/LinkButton";
import { PremiumButton } from "./components/PremiumButton";
import SurfaceShell from "./components/SurfaceShell";
import ReadinessGauge from "./components/ReadinessGauge";
import { getPracticeStats, subscribe } from "./lib/progressStore";
import { MIN_PRACTICE_SCORED } from "./lib/readiness";

export default function Home() {
  const [progress, setProgress] = useState<object | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const [practiceStats, setPracticeStats] = useState({
    attempts: 0,
    correct: 0,
    byDomain: {
      "Cloud Concepts": { attempts: 0, correct: 0 },
      Security: { attempts: 0, correct: 0 },
      Technology: { attempts: 0, correct: 0 },
      "Billing & Pricing": { attempts: 0, correct: 0 },
    },
    lastUpdated: null as number | null,
  });

  useEffect(() => {
    try {
      const rawProgress = localStorage.getItem("aws-exam-readiness-progress-v1");
      const parsedProgress = rawProgress ? (JSON.parse(rawProgress) as object) : null;
      setProgress(parsedProgress);

      const rawWrong = localStorage.getItem("aws-exam-readiness-quiz-wrong-v1");
      const parsedWrong = rawWrong ? (JSON.parse(rawWrong) as string[]) : [];
      if (Array.isArray(parsedWrong)) {
        setWrongCount(parsedWrong.length);
      } else if (!rawWrong) {
        const legacyRaw = localStorage.getItem("aws-exam-readiness-quiz-missed-v1");
        const legacyParsed = legacyRaw ? (JSON.parse(legacyRaw) as string[]) : [];
        if (Array.isArray(legacyParsed)) {
          localStorage.setItem("aws-exam-readiness-quiz-wrong-v1", JSON.stringify(legacyParsed));
          setWrongCount(legacyParsed.length);
        } else {
          setWrongCount(0);
        }
      } else {
        setWrongCount(0);
      }
      setPracticeStats(getPracticeStats());
    } catch {
      setProgress(null);
      setWrongCount(0);
      setPracticeStats(getPracticeStats());
    }
  }, []);

  useEffect(() => {
    setPracticeStats(getPracticeStats());
    const unsubscribe = subscribe(() => {
      setPracticeStats(getPracticeStats());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, []);

  const readiness =
    practiceStats.attempts === 0
      ? 0
      : Math.round((practiceStats.correct / practiceStats.attempts) * 100);
  const [displayReadiness, setDisplayReadiness] = useState(0);
  const confidenceLabel =
    readiness < 40
      ? "Low confidence"
      : readiness < 60
        ? "Building confidence"
        : readiness < 75
          ? "Moderate confidence"
          : readiness < 90
            ? "High confidence"
            : "Exam ready";
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

  const weakestHref = weakestDomain
    ? `/quiz?domain=${encodeURIComponent(weakestDomain)}`
    : "/dashboard";

  useEffect(() => {
    const duration = 600;
    const start = performance.now();
    const from = 0;
    const to = readiness;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayReadiness(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [readiness]);
  const donationCards = [
    { id: "btc", label: "Bitcoin", address: "bc1qYOURADDRESSHERE" },
    { id: "eth", label: "Ethereum", address: "0xYOURADDRESSHERE" },
    { id: "sol", label: "Solana", address: "YOURSOLANAADDRESS" },
  ];

  function handleCopy(id: string, address: string) {
    if (!navigator?.clipboard?.writeText) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopiedId(id);
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedId(null);
        copyTimeoutRef.current = null;
      }, 1200);
    });
  }

  return (
    <SurfaceShell variant="hero">
      <div className="relative mx-auto max-w-5xl px-6 pb-10 pt-10">
          <div className="text-center cursor-default">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white">
            AWS Exam{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              Readiness
            </span>{" "}
            Coach
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80 sm:text-base leading-relaxed">
            Adaptive practice for the AWS Certified Cloud Practitioner (CLF-C02). Drill smart.
            Track weaknesses. Know when you’re truly ready.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/quiz" variant="primary" size="md">
              Practice
            </LinkButton>
          </div>

          <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white/15 bg-[linear-gradient(145deg,rgba(15,23,42,0.82),rgba(17,45,67,0.72))] p-[1px] shadow-[0_20px_40px_rgba(3,8,20,0.35)]">
            <div className={`rounded-[22px] p-5 text-left ${cardBase} ${cardHover}`}>
              <div className="grid items-center gap-6 md:grid-cols-[1fr_220px]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300/90" />
                    Snapshot
                  </div>
                  <div className="mt-3 text-sm text-white/85">
                    A quick pulse on your overall readiness. Practice to push this higher.
                  </div>

                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-300/80 via-sky-300/75 to-emerald-300/70"
                      style={{ width: `${Math.max(0, Math.min(100, displayReadiness))}%` }}
                    />
                  </div>

                  {wrongCount > 0 && (
                    <div className="mt-3">
                      <LinkButton href="/quiz?review=wrong" variant="ghost" size="md">
                        Review Wrong ({wrongCount})
                      </LinkButton>
                    </div>
                  )}
                </div>

                <Link
                  href="/dashboard"
                  className={`flex flex-col items-center justify-center ${linkReset}`}
                >
                  <ReadinessGauge percent={displayReadiness} label={confidenceLabel} />
                </Link>
              </div>
              <div className="mt-3 text-xs text-white/50">
                Estimate based on your practice history. The real exam uses scaled scoring (100–1000)
                with 700 to pass.
              </div>
            </div>
          </div>
          </div>

        <div className="mt-12">
          <div className="text-sm font-semibold text-white/90">Quick Actions</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Link
              href="/quiz"
              className={`transform-gpu cursor-pointer p-5 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 ${cardBase} ${cardHover} ${linkReset}`}
              aria-label="Continue Practice"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm font-semibold">Continue Practice</div>
                <div className="text-white/60">→</div>
              </div>
              <div className="mt-1 text-sm text-white/70">
                Jump back into your next set of questions.
              </div>
            </Link>

            <Link
              href={weakestHref}
              className={`transform-gpu cursor-pointer p-5 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 ${cardBase} ${cardHover} ${linkReset}`}
              aria-label="Practice Weakest Area"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm font-semibold">Practice Weakest Area</div>
                <div className="text-white/60">→</div>
              </div>
              <div className="mt-1 text-sm text-white/70">
                {weakestDomain ? `Focus on ${weakestDomain}.` : "Open Dashboard to find your focus."}
              </div>
            </Link>

            <Link
              href="/quiz?mode=exam"
              className={`transform-gpu cursor-pointer p-5 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 ${cardBase} ${cardHover} ${linkReset}`}
              aria-label="Start Full Exam"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm font-semibold">Start Full Exam</div>
                <div className="text-white/60">→</div>
              </div>
              <div className="mt-1 text-sm text-white/70">
                Take a 65‑question exam‑style session.
              </div>
            </Link>
          </div>
        </div>

        <section className={`mt-12 p-6 ${cardBase} ${cardHover} cursor-default`}>
          <div className="text-lg font-semibold">Support the Project</div>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            This tool is free and independently built. If it helped you prepare for the AWS
            exam, you can support continued development and future features.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {donationCards.map((card) => (
              <div
                key={card.id}
                className={`donation-card p-4 ${cardBase} ${cardHover} cursor-default`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {card.id === "btc" && (
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[15px] font-extrabold leading-none text-slate-950"
                      aria-hidden="true"
                    >
                      ₿
                    </span>
                  )}
                  {card.id === "eth" && (
                    <svg
                      viewBox="0 0 256 417"
                      fill="currentColor"
                      className="h-6 w-6 text-white/80"
                      aria-hidden="true"
                    >
                      <path d="M127.9 0L124.7 10.8v270.5l3.2 3.2 127.9-75.5z" />
                      <path d="M127.9 0L0 209l127.9 75.5V0z" />
                      <path d="M127.9 309.2l-1.8 2.2v102.6l1.8 5.2 128-180.2z" />
                      <path d="M127.9 419.2V309.2L0 239z" />
                    </svg>
                  )}
                  {card.id === "sol" && (
                    <svg viewBox="0 0 397 311" className="h-6 w-6" aria-hidden="true">
                      <linearGradient id={`sol-${card.id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#9945FF" />
                        <stop offset="100%" stopColor="#14F195" />
                      </linearGradient>
                      <path
                        fill={`url(#sol-${card.id})`}
                        d="M64 0h333l-64 64H0zM64 123h333l-64 64H0zM64 247h333l-64 64H0z"
                      />
                    </svg>
                  )}
                  <span className="text-sm">{card.label}</span>
                </div>
                <div className="mt-2 break-all text-xs text-white/70">{card.address}</div>
                <PremiumButton
                  type="button"
                  size="sm"
                  variant="neutral"
                  onClick={() => handleCopy(card.id, card.address)}
                  className="mt-4"
                >
                  {copiedId === card.id ? "Copied!" : "Copy address"}
                </PremiumButton>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-white/50">100% optional • No ads • No tracking</div>
        </section>
      </div>
    </SurfaceShell>
  );
}
