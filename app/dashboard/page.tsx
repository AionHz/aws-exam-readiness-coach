"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BADGES, type BadgeId } from "../lib/achievements";

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
const QUIZ_MISSED_KEY = "aws-exam-readiness-quiz-missed-v1";
const QUIZ_FLAGGED_KEY = "aws-exam-readiness-quiz-flagged-v1";

// Keep your existing flags page/key intact (if you built it already)
const LS_FLAGS_KEY = "clfc02_flags_v1";

const ALL_DOMAINS: Domain[] = [
  "Cloud Concepts",
  "Security",
  "Technology",
  "Billing & Pricing",
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
  window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
}

function loadFlagsCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(LS_FLAGS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
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

  const [flagCount, setFlagCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);

  useEffect(() => {
    setProgress(loadQuizProgress());
    setFlagCount(loadFlagsCount());
    try {
      const rawMissed = window.localStorage.getItem(QUIZ_MISSED_KEY);
      const parsedMissed = rawMissed ? (JSON.parse(rawMissed) as string[]) : [];
      setMissedCount(Array.isArray(parsedMissed) ? parsedMissed.length : 0);
    } catch {
      setMissedCount(0);
    }
    try {
      const rawFlagged = window.localStorage.getItem(QUIZ_FLAGGED_KEY);
      const parsedFlagged = rawFlagged ? (JSON.parse(rawFlagged) as string[]) : [];
      setFlaggedCount(Array.isArray(parsedFlagged) ? parsedFlagged.length : 0);
    } catch {
      setFlaggedCount(0);
    }
    setHydrated(true);

    // Note: storage event only fires across tabs/windows, not same-tab updates.
    const onStorage = (e: StorageEvent) => {
      if (e.key === QUIZ_PROGRESS_KEY) setProgress(loadQuizProgress());
      if (e.key === LS_FLAGS_KEY) setFlagCount(loadFlagsCount());
      if (e.key === QUIZ_MISSED_KEY) {
        try {
          const rawMissed = window.localStorage.getItem(QUIZ_MISSED_KEY);
          const parsedMissed = rawMissed ? (JSON.parse(rawMissed) as string[]) : [];
          setMissedCount(Array.isArray(parsedMissed) ? parsedMissed.length : 0);
        } catch {
          setMissedCount(0);
        }
      }
      if (e.key === QUIZ_FLAGGED_KEY) {
        try {
          const rawFlagged = window.localStorage.getItem(QUIZ_FLAGGED_KEY);
          const parsedFlagged = rawFlagged ? (JSON.parse(rawFlagged) as string[]) : [];
          setFlaggedCount(Array.isArray(parsedFlagged) ? parsedFlagged.length : 0);
        } catch {
          setFlaggedCount(0);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    // This makes the dashboard update when you come back from /quiz in the same tab.
    const onFocus = () => {
      setProgress(loadQuizProgress());
      setFlagCount(loadFlagsCount());
      try {
        const rawMissed = window.localStorage.getItem(QUIZ_MISSED_KEY);
        const parsedMissed = rawMissed ? (JSON.parse(rawMissed) as string[]) : [];
        setMissedCount(Array.isArray(parsedMissed) ? parsedMissed.length : 0);
      } catch {
        setMissedCount(0);
      }
      try {
        const rawFlagged = window.localStorage.getItem(QUIZ_FLAGGED_KEY);
        const parsedFlagged = rawFlagged ? (JSON.parse(rawFlagged) as string[]) : [];
        setFlaggedCount(Array.isArray(parsedFlagged) ? parsedFlagged.length : 0);
      } catch {
        setFlaggedCount(0);
      }
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const attemptsTotal = progress.attemptsTotal ?? 0;
  const correctTotal = progress.correctTotal ?? 0;

  const accuracyPct = useMemo(() => {
    if (!attemptsTotal) return 0;
    return Math.round((correctTotal / attemptsTotal) * 100);
  }, [attemptsTotal, correctTotal]);

  const readinessScore = useMemo(() => {
    // same logic you had: accuracy weighted by volume (caps at 50 attempts)
    const attemptsFactor = Math.min(attemptsTotal / 50, 1);
    const base = Math.round(accuracyPct * attemptsFactor);
    const streakBonus = Math.min(5, progress.streakCorrect ?? 0);
    const raw = base + streakBonus;
    return Math.max(0, Math.min(100, raw));
  }, [accuracyPct, attemptsTotal, progress.streakCorrect]);

  const readinessLabel =
    readinessScore < 40
      ? "Not Ready"
      : readinessScore < 60
        ? "Improving"
        : readinessScore < 75
          ? "Nearly Ready"
          : "Exam Ready";

  const readinessColor =
    readinessScore < 40
      ? "bg-rose-500/80"
      : readinessScore < 60
        ? "bg-amber-500/80"
        : readinessScore < 75
          ? "bg-sky-500/80"
          : "bg-emerald-500/80";

  const domainRows = useMemo(() => {
    const rows = ALL_DOMAINS.map((domain) => {
      const v = progress.byDomain?.[domain] ?? { attempts: 0, correct: 0 };
      const answered = Number(v.attempts) || 0;
      const correct = Number(v.correct) || 0;
      const acc = answered ? Math.round((correct / answered) * 100) : 0;
      return { domain, answered, correct, acc };
    });

    const withMin = rows.filter((r) => r.answered >= 3);
    const focus =
      (withMin.length
        ? [...withMin].sort((a, b) => a.acc - b.acc || b.answered - a.answered)[0]
        : [...rows].sort((a, b) => b.answered - a.answered)[0]) || null;

    rows.sort((a, b) => b.answered - a.answered || a.acc - b.acc);

    return { rows, focus };
  }, [progress.byDomain]);

  const weakestDomain = useMemo(() => {
    const rows = ALL_DOMAINS.map((domain) => {
      const v = progress.byDomain?.[domain] ?? { attempts: 0, correct: 0 };
      const attempts = Number(v.attempts) || 0;
      const correct = Number(v.correct) || 0;
      const acc = attempts > 0 ? correct / attempts : 1;
      return { domain, acc, attempts };
    }).filter((r) => r.attempts > 0);

    if (rows.length === 0) return null;
    rows.sort((a, b) => a.acc - b.acc);
    return rows[0]?.domain ?? null;
  }, [progress.byDomain]);

  const focusHref = useMemo(() => {
    if (!weakestDomain) return "/quiz?batch=1&shuffle=1";
    const d = encodeURIComponent(weakestDomain);
    return `/quiz?domain=${d}&batch=1&shuffle=1`;
  }, [weakestDomain]);

  const recentActivity = useMemo(() => {
    // derive from quiz history (already has domain + correct + ts)
    const list = Array.isArray(progress.history) ? progress.history : [];
    return list.slice(0, 10);
  }, [progress.history]);

  const unlockedSet = useMemo(() => {
    return new Set(progress.unlockedBadges ?? []);
  }, [progress.unlockedBadges]);

  function resetProgress() {
    clearQuizProgress();
    setProgress(makeEmptyProgress());
  }

  function clearActivityOnly() {
    // We only have activity because quiz history exists.
    // Clearing "activity" means clearing history but leaving aggregates can get weird,
    // so we do a full reset. Keep this simple for now.
    resetProgress();
  }

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-sm text-zinc-400">Loading dashboard…</div>
      </div>
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
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Your local progress summary. This updates as you practice in /quiz.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/quiz"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition"
          >
            Continue Practice
          </Link>
          {missedCount > 0 && (
            <Link
              href="/quiz?review=missed"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 transition"
            >
              Review Missed ({missedCount})
            </Link>
          )}
        </div>
        <div className="mt-2 text-xs text-white/60">
          Tip: Review Missed drills questions you previously answered incorrectly.
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={focusHref}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 transition"
            title={domainRows.focus?.domain ? `Practice: ${domainRows.focus.domain}` : "Practice"}
          >
            Practice Weakest Domain
          </Link>

          {missedCount > 0 && (
            <Link
              href="/quiz?review=missed"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 transition"
            >
              Review Missed ({missedCount})
            </Link>
          )}

          <Link
            href={flaggedCount > 0 ? "/quiz?review=flagged" : "/flags"}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 transition"
            title="Review your flagged questions"
          >
            Flagged ({flaggedCount})
          </Link>

          <button
            onClick={resetProgress}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 transition"
            type="button"
          >
            Reset Progress
          </button>
        </div>
        <div className="mt-2 text-xs text-white/60">
          Tip: Flag questions you want to revisit later.
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          Last updated: {formatTime(lastUpdatedISO)}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-zinc-200">Readiness Score</div>
          <div className="mt-3 flex items-end gap-2">
            <div>
              <div className="text-sm font-semibold text-zinc-200">{readinessLabel}</div>
              <div className="text-4xl font-semibold text-zinc-100">{readinessScore}</div>
            </div>
            <div className="text-sm text-zinc-400">/ 100</div>
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Accuracy {accuracyPct}% • Based on {attemptsTotal} attempts
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-black/30 overflow-hidden">
            <div
              className={`h-full rounded-full ${readinessColor}`}
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Focus on weak domains to reach the next zone.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-zinc-200">Total Attempts</div>
          <div className="mt-3 text-4xl font-semibold text-zinc-100">{attemptsTotal}</div>
          <div className="mt-2 text-sm text-zinc-400">Saved locally on this device</div>
          <div className="mt-4 text-xs text-zinc-500">
            Tip: do more practice runs to stabilize your domain accuracy.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-zinc-200">Focus Area</div>
          <div className="mt-3 text-lg font-semibold text-zinc-100">
            {domainRows.focus?.domain ?? "—"}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            {domainRows.focus
              ? `${domainRows.focus.acc}% accuracy • ${domainRows.focus.correct}/${domainRows.focus.answered} correct`
              : "Practice to reveal your weakest domain."}
          </div>
          <div className="mt-4 text-xs text-zinc-500">Next: we’ll make quiz filters actually work.</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-3">
          <div className="text-sm font-semibold text-zinc-200">Achievements</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {BADGES.map((badge) => {
              const unlocked = unlockedSet.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-3 ${
                    unlocked ? "" : "opacity-50"
                  }`}
                >
                  <div className="text-lg">{badge.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">{badge.title}</div>
                    <div className="mt-1 text-xs text-zinc-400">{badge.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-200">Recent Activity</div>
            <div className="mt-1 text-xs text-zinc-500">Last 10 answers (from quiz history)</div>
          </div>

          <button
            type="button"
            onClick={clearActivityOnly}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition"
            title="Clears progress (including history) for now"
          >
            Clear
          </button>
        </div>

        {recentActivity.length === 0 ? (
          <div className="mt-4 text-sm text-zinc-400">
            No recent activity yet. Answer a few questions in{" "}
            <span className="text-zinc-200">Practice</span>.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
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

      {/* Domain Breakdown */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-200">Domain Breakdown</div>
            <div className="mt-1 text-xs text-zinc-500">Attempts and accuracy by domain</div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/quiz"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition"
            >
              Practice
            </Link>
            <Link
              href="/flags"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition"
            >
              Flags
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition"
            >
              Home
            </Link>
          </div>
        </div>

        {domainRows.rows.every((r) => r.answered === 0) ? (
          <div className="mt-4 text-sm text-zinc-400">
            No domain stats yet. Answer a few questions in{" "}
            <span className="text-zinc-200">Practice</span>.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
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
                          className="text-xs text-indigo-300 hover:text-indigo-200 underline underline-offset-4"
                          title={`Practice ${r.domain}`}
                        >
                          Practice
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

      <div className="mt-8 text-center text-xs text-zinc-500">
        Local-only • No external APIs • Progress stored in your browser
      </div>
    </div>
  );
}
