"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type BadgeId } from "../lib/achievements";
import SurfaceShell from "../components/SurfaceShell";
import { cardBase, cardHover, linkReset } from "../lib/ui";
import LinkButton from "../components/ui/LinkButton";
import Button from "../components/ui/Button";
import { PremiumButton } from "../components/PremiumButton";
import {
  resetAllProgress,
  getFlaggedIds,
  getWrongIds,
  FLAGGED_KEY,
  WRONG_KEY,
  LEGACY_MISSED_KEY,
  subscribe,
  getLastExamScaledScore,
} from "../lib/progressStore";
import { DOMAIN_WEIGHTS } from "../lib/examScoring";

/**
 * IMPORTANT:
 * This dashboard now reads from the SAME localStorage key your /quiz page writes:
 *   aws-exam-readiness-progress-v1
 *
 * That means: practice on /quiz -> dashboard updates automatically (on focus / refresh).
 */

type Difficulty = "Easy" | "Medium" | "Hard";
type Domain = "Cloud Concepts" | "Security" | "Technology" | "Billing & Pricing";
type ChoiceId = "A" | "B" | "C" | "D";

type StoredAttempt = {
  questionId: string;
  domain: Domain;
  difficulty: Difficulty;
  selectedId: ChoiceId;
  correct: boolean;
  ts: number;
};

type StoredProgress = {
  version: 1;
  attemptsTotal: number;
  correctTotal: number;
  streakCorrect: number;
  byDomain: Record<Domain, { attempts: number; correct: number }>;
  byDifficulty: Record<Difficulty, { attempts: number; correct: number }>;
  history: StoredAttempt[];
  unlockedBadges: BadgeId[];
};

const QUIZ_PROGRESS_KEY = "aws-exam-readiness-progress-v1";

const ALL_DOMAINS: Domain[] = [
  "Cloud Concepts",
  "Security",
  "Technology",
  "Billing & Pricing",
];

type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: (p: StoredProgress, ctx: AchievementContext) => boolean;
  progressText?: (p: StoredProgress, ctx: AchievementContext) => string;
  progressPct?: (p: StoredProgress, ctx: AchievementContext) => number;
};

type AchievementContext = {
  attemptsTotal: number;
  accuracyPct: number;
  streakCorrect: number;
  domainMasteryCount: number;
  distinctDays: number;
};

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "attempts-1",
    title: "First Steps",
    description: "Complete your first question.",
    icon: "👣",
    isUnlocked: (p) => p.attemptsTotal >= 1,
    progressText: (p) => `${Math.min(p.attemptsTotal, 1)}/1`,
    progressPct: (p) => Math.min(p.attemptsTotal / 1, 1) * 100,
  },
  {
    id: "attempts-10",
    title: "Warm Up",
    description: "Reach 10 total attempts.",
    icon: "🔥",
    isUnlocked: (p) => p.attemptsTotal >= 10,
    progressText: (p) => `${Math.min(p.attemptsTotal, 10)}/10`,
    progressPct: (p) => Math.min(p.attemptsTotal / 10, 1) * 100,
  },
  {
    id: "attempts-25",
    title: "In the Zone",
    description: "Reach 25 total attempts.",
    icon: "⚡",
    isUnlocked: (p) => p.attemptsTotal >= 25,
    progressText: (p) => `${Math.min(p.attemptsTotal, 25)}/25`,
    progressPct: (p) => Math.min(p.attemptsTotal / 25, 1) * 100,
  },
  {
    id: "attempts-50",
    title: "Momentum",
    description: "Reach 50 total attempts.",
    icon: "🏁",
    isUnlocked: (p) => p.attemptsTotal >= 50,
    progressText: (p) => `${Math.min(p.attemptsTotal, 50)}/50`,
    progressPct: (p) => Math.min(p.attemptsTotal / 50, 1) * 100,
  },
  {
    id: "acc-60",
    title: "Solid Accuracy",
    description: "60%+ overall accuracy (min 10 attempts).",
    icon: "🎯",
    isUnlocked: (_p, ctx) => ctx.attemptsTotal >= 10 && ctx.accuracyPct >= 60,
    progressText: (_p, ctx) => `${Math.min(ctx.accuracyPct, 60)}% / 60%`,
    progressPct: (_p, ctx) => Math.min(ctx.accuracyPct / 60, 1) * 100,
  },
  {
    id: "acc-70",
    title: "Above Average",
    description: "70%+ overall accuracy (min 10 attempts).",
    icon: "📈",
    isUnlocked: (_p, ctx) => ctx.attemptsTotal >= 10 && ctx.accuracyPct >= 70,
    progressText: (_p, ctx) => `${Math.min(ctx.accuracyPct, 70)}% / 70%`,
    progressPct: (_p, ctx) => Math.min(ctx.accuracyPct / 70, 1) * 100,
  },
  {
    id: "acc-80",
    title: "Exam Ready Pace",
    description: "80%+ overall accuracy (min 10 attempts).",
    icon: "🏆",
    isUnlocked: (_p, ctx) => ctx.attemptsTotal >= 10 && ctx.accuracyPct >= 80,
    progressText: (_p, ctx) => `${Math.min(ctx.accuracyPct, 80)}% / 80%`,
    progressPct: (_p, ctx) => Math.min(ctx.accuracyPct / 80, 1) * 100,
  },
  {
    id: "streak-3",
    title: "Streak Starter",
    description: "3 correct in a row.",
    icon: "✨",
    isUnlocked: (_p, ctx) => ctx.streakCorrect >= 3,
    progressText: (_p, ctx) => `${Math.min(ctx.streakCorrect, 3)}/3`,
    progressPct: (_p, ctx) => Math.min(ctx.streakCorrect / 3, 1) * 100,
  },
  {
    id: "streak-5",
    title: "Hot Streak",
    description: "5 correct in a row.",
    icon: "🚀",
    isUnlocked: (_p, ctx) => ctx.streakCorrect >= 5,
    progressText: (_p, ctx) => `${Math.min(ctx.streakCorrect, 5)}/5`,
    progressPct: (_p, ctx) => Math.min(ctx.streakCorrect / 5, 1) * 100,
  },
  {
    id: "streak-10",
    title: "Unstoppable",
    description: "10 correct in a row.",
    icon: "💫",
    isUnlocked: (_p, ctx) => ctx.streakCorrect >= 10,
    progressText: (_p, ctx) => `${Math.min(ctx.streakCorrect, 10)}/10`,
    progressPct: (_p, ctx) => Math.min(ctx.streakCorrect / 10, 1) * 100,
  },
  {
    id: "domain-master",
    title: "Domain Mastery",
    description: "80%+ in any domain with 10+ attempts.",
    icon: "🛡️",
    isUnlocked: (_p, ctx) => ctx.domainMasteryCount > 0,
    progressText: (_p, ctx) =>
      ctx.domainMasteryCount > 0 ? "Unlocked" : "0/1",
    progressPct: (_p, ctx) => (ctx.domainMasteryCount > 0 ? 100 : 0),
  },
  {
    id: "consistency",
    title: "Consistency",
    description: "Practice on 3 different days.",
    icon: "📆",
    isUnlocked: (_p, ctx) => ctx.distinctDays >= 3,
    progressText: (_p, ctx) => `${Math.min(ctx.distinctDays, 3)}/3`,
    progressPct: (_p, ctx) => Math.min(ctx.distinctDays / 3, 1) * 100,
  },
];

function makeEmptyProgress(): StoredProgress {
  const byDomain = {} as StoredProgress["byDomain"];
  for (const d of ALL_DOMAINS) byDomain[d] = { attempts: 0, correct: 0 };

  const byDifficulty = {} as StoredProgress["byDifficulty"];
  byDifficulty.Easy = { attempts: 0, correct: 0 };
  byDifficulty.Medium = { attempts: 0, correct: 0 };
  byDifficulty.Hard = { attempts: 0, correct: 0 };

  return {
    version: 1,
    attemptsTotal: 0,
    correctTotal: 0,
    streakCorrect: 0,
    byDomain,
    byDifficulty,
    history: [],
    unlockedBadges: [],
  };
}

function loadQuizProgress(): StoredProgress {
  if (typeof window === "undefined") return makeEmptyProgress();
  try {
    const raw = window.localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!raw) return makeEmptyProgress();
    const parsed = JSON.parse(raw) as StoredProgress;
    if (!parsed || parsed.version !== 1) return makeEmptyProgress();

    const base = makeEmptyProgress();
    return {
      ...base,
      ...parsed,
      byDomain: { ...base.byDomain, ...(parsed.byDomain ?? {}) },
      byDifficulty: { ...base.byDifficulty, ...(parsed.byDifficulty ?? {}) },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
    };
  } catch {
    return makeEmptyProgress();
  }
}

function clearQuizProgress() {
  if (typeof window === "undefined") return;
  resetAllProgress();
}

function readWrongCount(): number {
  try {
    return getWrongIds().length;
  } catch {
    return 0;
  }
}

function readFlaggedCount(): number {
  try {
    return getFlaggedIds().length;
  } catch {
    return 0;
  }
}

function readAchievementsExpanded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("dashboard:achievementsExpanded") === "1";
  } catch {
    return false;
  }
}

function formatRelative(ts: number): string {
  const diffMs = Date.now() - ts;
  const s = Math.max(0, Math.floor(diffMs / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);

  // Single source of truth: quiz progress
  const [progress, setProgress] = useState<StoredProgress>(makeEmptyProgress());

  const [wrongCount, setWrongCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [lastExamScaledScore, setLastExamScaledScoreState] = useState(0);
  const [achievementsExpanded, setAchievementsExpanded] = useState(() => readAchievementsExpanded());
  const [recentActivityExpanded, setRecentActivityExpanded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setProgress(loadQuizProgress());
      setWrongCount(readWrongCount());
      setFlaggedCount(readFlaggedCount());
      setLastExamScaledScoreState(getLastExamScaledScore());
    };

    const unsubscribe = subscribe(refresh);

    // Note: storage event only fires across tabs/windows, not same-tab updates.
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === QUIZ_PROGRESS_KEY ||
        e.key === WRONG_KEY ||
        e.key === LEGACY_MISSED_KEY ||
        e.key === FLAGGED_KEY
      ) {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);

    // This makes the dashboard update when you come back from /quiz in the same tab.
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    queueMicrotask(() => {
      refresh();
      setHydrated(true);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dashboard:achievementsExpanded", achievementsExpanded ? "1" : "0");
    } catch {
      // ignore
    }
  }, [achievementsExpanded]);

  const attemptsTotal = progress.attemptsTotal ?? 0;
  const correctTotal = progress.correctTotal ?? 0;
  const accuracyPct =
    attemptsTotal > 0 ? Math.round((correctTotal / attemptsTotal) * 100) : 0;

  const examProgressPct = Math.max(0, Math.min(100, ((lastExamScaledScore - 100) / 900) * 100));
  const examBandLabel =
    lastExamScaledScore >= 850
      ? "Excellent"
      : lastExamScaledScore >= 700
        ? "Passing range"
        : lastExamScaledScore >= 600
          ? "Close"
          : "Needs work";

  const domainRows = useMemo(() => {
    const rows = ALL_DOMAINS.map((domain) => {
      const v = progress.byDomain?.[domain] ?? { attempts: 0, correct: 0 };
      const answered = Number(v.attempts) || 0;
      const correct = Number(v.correct) || 0;
      const acc = answered ? Math.round((correct / answered) * 100) : 0;
      const wrong = Math.max(0, answered - correct);
      return { domain, answered, correct, acc, wrong };
    });

    const withMin = rows.filter((r) => r.answered >= 3);
    const focus =
      (withMin.length
        ? [...withMin].sort((a, b) => a.acc - b.acc || b.answered - a.answered)[0]
        : [...rows].sort((a, b) => b.answered - a.answered)[0]) || null;

    rows.sort((a, b) => b.answered - a.answered || a.acc - b.acc);

    return { rows, focus };
  }, [progress.byDomain]);

  function getNextFocusDomain(
    rows: { domain: Domain; answered: number; correct: number; acc: number; wrong: number }[]
  ) {
    const candidates = rows.filter((r) => r.answered > 0);
    if (candidates.length === 0) return null;
    const scored = candidates.map((r) => {
      const accuracy = r.answered > 0 ? r.correct / r.answered : 0;
      const gap = 1 - accuracy;
      const confidence = Math.min(1, r.answered / 10);
      const weight = DOMAIN_WEIGHTS[r.domain];
      const priority = weight * gap * confidence;
      return { ...r, priority, accuracy };
    });
    scored.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.wrong !== a.wrong) return b.wrong - a.wrong;
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.answered - a.answered;
    });
    return scored[0]?.domain ?? null;
  }

  const nextFocusDomain = useMemo(() => {
    return getNextFocusDomain(domainRows.rows);
  }, [domainRows.rows]);

  function getWeakestDomain(rows: { domain: Domain; answered: number; correct: number; acc: number; wrong: number }[]) {
    const candidates = rows.filter((r) => r.wrong > 0);
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      if (b.wrong !== a.wrong) return b.wrong - a.wrong;
      const aWrongRate = a.answered > 0 ? a.wrong / a.answered : 0;
      const bWrongRate = b.answered > 0 ? b.wrong / b.answered : 0;
      if (aWrongRate !== bWrongRate) return aWrongRate - bWrongRate;
      return b.answered - a.answered;
    });
    return candidates[0]?.domain ?? null;
  }

  const weakestDomain = useMemo(() => {
    return getWeakestDomain(domainRows.rows);
  }, [domainRows.rows]);

  const focusHref = useMemo(() => {
    if (!nextFocusDomain) return "/quiz?batch=1";
    const d = encodeURIComponent(nextFocusDomain);
    return `/quiz?mode=domain&domain=${d}&batch=1`;
  }, [nextFocusDomain]);

  const recentActivity = useMemo(() => {
    // derive from quiz history (already has domain + correct + ts)
    const list = Array.isArray(progress.history) ? progress.history : [];
    return list.slice(0, 10);
  }, [progress.history]);

  const lastTen = useMemo(() => {
    const list = Array.isArray(progress.history) ? progress.history : [];
    return list.slice(0, 10);
  }, [progress.history]);

  const lastTenCorrect = useMemo(() => {
    return lastTen.reduce((acc, item) => acc + (item.correct ? 1 : 0), 0);
  }, [lastTen]);

  const distinctDays = useMemo(() => {
    const history = Array.isArray(progress.history) ? progress.history : [];
    const days = new Set<string>();
    for (const item of history) {
      const day = new Date(item.ts).toISOString().slice(0, 10);
      days.add(day);
    }
    return days.size;
  }, [progress.history]);

  const domainMasteryCount = useMemo(() => {
    let count = 0;
    for (const d of ALL_DOMAINS) {
      const { attempts, correct } = progress.byDomain[d];
      if (attempts >= 10) {
        const acc = Math.round((correct / attempts) * 100);
        if (acc >= 80) count += 1;
      }
    }
    return count;
  }, [progress.byDomain]);

  const achievementCtx = useMemo<AchievementContext>(
    () => ({
      attemptsTotal,
      accuracyPct,
      streakCorrect: progress.streakCorrect ?? 0,
      domainMasteryCount,
      distinctDays,
    }),
    [attemptsTotal, accuracyPct, progress.streakCorrect, domainMasteryCount, distinctDays]
  );

  const achievementUnlocked = useMemo(() => {
    return ACHIEVEMENTS.map((a) => a.isUnlocked(progress, achievementCtx));
  }, [progress, achievementCtx]);

  function resetProgress() {
    clearQuizProgress();
    setProgress(makeEmptyProgress());
    setWrongCount(0);
    setFlaggedCount(0);
  }

  function clearActivityOnly() {
    // We only have activity because quiz history exists.
    // Clearing "activity" means clearing history but leaving aggregates can get weird,
    // so we do a full reset. Keep this simple for now.
    resetProgress();
  }

  if (!hydrated) {
    return (
      <SurfaceShell variant="hero">
        <div className="max-w-5xl mx-auto px-4 pb-6">
          <div className="text-sm text-zinc-400">Loading dashboard…</div>
        </div>
      </SurfaceShell>
    );
  }

  const lastUpdatedISO =
    progress.history?.[0]?.ts ? new Date(progress.history[0].ts).toISOString() : undefined;

  const formatTime = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <SurfaceShell variant="hero">
      <div className="max-w-5xl mx-auto px-4 pb-6 pt-10">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-100">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            Your local progress summary. This updates as you practice in /quiz.
          </p>

          <div className="mt-4 flex items-center justify-center">
            <LinkButton href="/quiz" variant="primary" size="md" className="cursor-pointer">
              Continue Practice
            </LinkButton>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/60">
            <div className="flex flex-wrap items-center gap-2">
              <LinkButton href={focusHref} variant="ghost" size="sm" className="cursor-pointer">
                <span title={domainRows.focus?.domain ? `Practice: ${domainRows.focus.domain}` : "Practice"}>
                  ⚡ Weakest Area
                </span>
              </LinkButton>
              {wrongCount > 0 && (
                <LinkButton href="/quiz?mode=wrong" variant="ghost" size="sm" className="cursor-pointer">
                  🧯 Wrong ({wrongCount})
                </LinkButton>
              )}
              {flaggedCount > 0 && (
                <LinkButton href="/quiz?mode=flagged" variant="ghost" size="sm" className="cursor-pointer">
                  🏷 Flagged ({flaggedCount})
                </LinkButton>
              )}
              <Button
                onClick={resetProgress}
                variant="outline"
                size="sm"
                type="button"
                className="cursor-pointer border-rose-400/30 text-rose-200 hover:bg-rose-500/10"
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500">
            Last updated: {formatTime(lastUpdatedISO)}
          </div>
        </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className={`relative overflow-hidden p-5 select-none ${cardBase} ${cardHover} cursor-default`}>
          <div className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-widest text-white/50">Exam Score</div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/75">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
              Pass mark 700
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[112px_1fr] items-center gap-4">
            <div className="relative mx-auto h-28 w-28 rounded-full p-[6px] [background:conic-gradient(rgba(52,211,153,0.9)_0_var(--score),rgba(99,102,241,0.75)_var(--score),rgba(255,255,255,0.12)_var(--score)_100%)]" style={{ "--score": `${examProgressPct}%` } as React.CSSProperties}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/10 bg-[#0a1224]/90">
                <div
                  className={`text-3xl font-semibold tracking-tight ${
                    lastExamScaledScore >= 700 ? "text-emerald-300" : "text-white"
                  }`}
                >
                  {lastExamScaledScore}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-widest text-white/55">Scaled</div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/80">
                {examBandLabel}
              </div>
              <div className="mt-2 text-[11px] text-white/55">Range: 100–1000 • 65 questions • 90 minutes</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative h-2.5 w-full rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-colors ${
                  lastExamScaledScore >= 700 ? "bg-emerald-400/80" : "bg-indigo-400/70"
                }`}
                style={{
                  width: `${examProgressPct}%`,
                }}
              />
              <div
                className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-white/35"
                style={{ left: `${((700 - 100) / 900) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-white/55">Progress to score ceiling</div>
        </div>

        <div className={`relative overflow-hidden p-5 select-none ${cardBase} ${cardHover} cursor-default`}>
          <div className="pointer-events-none absolute -top-12 right-1/4 h-36 w-36 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70">
                <span className="text-base">📊</span>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-white/50">Performance Summary</div>
                <div className="mt-1 text-xs text-white/45">
                  Last updated: {formatTime(lastUpdatedISO)}
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              <span aria-hidden="true">📈</span>
              Last 10: {lastTen.length > 0 ? `${lastTenCorrect}/${lastTen.length}` : "—"}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-xs text-white/50">Attempts</div>
              <div className="mt-1 text-xl font-semibold text-white">{attemptsTotal}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-xs text-white/50">Streak</div>
              <div className="mt-1 text-xl font-semibold text-white">{progress.streakCorrect ?? 0}</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Accuracy</span>
              <span>
                {attemptsTotal > 0
                  ? `${accuracyPct}% • ${correctTotal}/${attemptsTotal}`
                  : "—"}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400/70"
                style={{ width: `${accuracyPct}%` }}
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span aria-hidden="true">🎯</span>
                Weakest Area
              </div>
              {weakestDomain ? (
                <Link href={`/quiz?domain=${encodeURIComponent(weakestDomain)}`} className={linkReset}>
                  <PremiumButton
                    variant="neutral"
                    size="sm"
                    className="h-7 px-3 text-[11px]"
                  >
                    {weakestDomain}
                  </PremiumButton>
                </Link>
              ) : (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  None yet
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Domain Breakdown */}
      <div className={`mt-8 p-5 ${cardBase} ${cardHover}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-200">Domain Breakdown</div>
            <div className="mt-1 text-xs text-zinc-500">Attempts and accuracy by domain</div>
          </div>
          <div className="flex gap-2">
            <LinkButton href="/flags" variant="ghost" size="sm">
              Flags
            </LinkButton>
          </div>
        </div>

        {domainRows.rows.every((r) => r.answered === 0) ? (
          <div className="mt-4 text-sm text-zinc-400">
            No domain stats yet. Answer a few questions in{" "}
            <span className="text-zinc-200">Practice</span>.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-3">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="py-2 pr-4">Domain</th>
                  <th className="py-2 pr-4">Attempts</th>
                  <th className="py-2 pr-4">Correct</th>
                  <th className="py-2 pr-4">Accuracy</th>
                </tr>
              </thead>
              <tbody className="text-zinc-200">
                {domainRows.rows.map((r) => (
                  <tr key={r.domain} className="border-t border-white/5">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span>{r.domain}</span>
                        <Link
                          href={`/quiz?domain=${encodeURIComponent(r.domain)}`}
                          className={`text-xs text-indigo-300 hover:text-indigo-200 ${linkReset}`}
                        >
                          <span title={`Practice ${r.domain}`}>Practice</span>
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{r.answered}</td>
                    <td className="py-3 pr-4">{r.correct}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-2 rounded-full bg-black/30 overflow-hidden">
                          <div className="h-full bg-emerald-500/70" style={{ width: `${r.acc}%` }} />
                        </div>
                        <span className="text-zinc-300">{r.acc}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className={`mt-8 p-5 ${cardBase} ${cardHover} cursor-default`}>
        <PremiumButton
          type="button"
          variant="neutral"
          size="md"
          onClick={() => setRecentActivityExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
        >
          <div>
            <div className="text-sm font-semibold text-zinc-200">Recent Activity</div>
            <div className="mt-1 text-xs text-zinc-500">Last 10 answers (from quiz history)</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-white/60">
              {recentActivity.length}/10
            </div>
            <span
              className={`transition-transform ${
                recentActivityExpanded ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-white/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
        </PremiumButton>

        {recentActivityExpanded && (
          <div className="mt-4">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={clearActivityOnly}
                variant="ghost"
                size="sm"
                title="Clears progress (including history) for now"
                className="cursor-pointer"
              >
                Clear
              </Button>
            </div>

            {recentActivity.length === 0 ? (
              <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 p-4 ${cardBase} ${cardHover}`}>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <span className="text-lg">🧭</span>
                  <span>No recent activity yet. Start a quick practice set to populate this list.</span>
                </div>
                <LinkButton href="/quiz" variant="ghost" size="sm" className="cursor-pointer">
                  Practice
                </LinkButton>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto cursor-default">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="py-2 pr-4">Result</th>
                      <th className="py-2 pr-4">Domain</th>
                      <th className="py-2 pr-4">When</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-200">
                    {recentActivity.map((a) => (
                      <tr key={`${a.ts}-${a.questionId}`} className="border-t border-white/5">
                        <td className="py-3 pr-4">
                          {a.correct ? (
                            <span className="inline-flex items-center gap-2 text-emerald-300">
                              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                              Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-rose-300">
                              <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                              Wrong
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">{a.domain || "Uncategorized"}</td>
                        <td className="py-3 pr-4 text-zinc-400">{formatRelative(a.ts)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`mt-8 p-5 ${cardBase} ${cardHover} cursor-default`}>
        <PremiumButton
          type="button"
          variant="neutral"
          size="md"
          onClick={() => setAchievementsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
        >
          <div>
            <div className="text-sm font-semibold text-zinc-200">Achievements</div>
            <div className="mt-1 text-xs text-zinc-500">Badge gallery tied to your progress.</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-white/60">
              {achievementUnlocked.filter(Boolean).length}/{ACHIEVEMENTS.length} unlocked
            </div>
            <div className="hidden h-1.5 w-28 rounded-full bg-black/30 overflow-hidden sm:block">
              <div
                className="h-full rounded-full bg-emerald-400/70"
                style={{
                  width: `${Math.round(
                    (achievementUnlocked.filter(Boolean).length / ACHIEVEMENTS.length) * 100
                  )}%`,
                }}
              />
            </div>
            <span
              className={`transition-transform ${
                achievementsExpanded ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-white/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
        </PremiumButton>
        {achievementsExpanded && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 transition-opacity duration-200">
            {ACHIEVEMENTS.map((ach, idx) => {
              const unlocked = achievementUnlocked[idx];
              const progressText = ach.progressText?.(progress, achievementCtx);
              const progressPct = ach.progressPct?.(progress, achievementCtx);
              return (
                <div
                  key={ach.id}
                  className={`rounded-2xl border p-3 transition-all ${
                    unlocked
                      ? "border-emerald-400/30 bg-emerald-500/5 hover:-translate-y-0.5"
                      : "border-white/10 bg-black/20 hover:-translate-y-0.5 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="text-lg">{ach.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-200">{ach.title}</div>
                        <div className="mt-1 text-xs text-zinc-400">{ach.description}</div>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        unlocked
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-white/5 text-white/50"
                      }`}
                    >
                      {unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                  {!unlocked && (
                    <div className="mt-3">
                      {typeof progressPct === "number" ? (
                        <div className="h-1.5 w-full rounded-full bg-black/30 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-400/60"
                            style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
                          />
                        </div>
                      ) : null}
                      {progressText ? (
                        <div className="mt-1 text-[11px] text-white/55">{progressText}</div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-zinc-500">
        Local-only • No external APIs • Progress stored in your browser
      </div>
      </div>
    </SurfaceShell>
  );
}
