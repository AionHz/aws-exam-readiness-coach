"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTION_BANK, ALL_DOMAINS, ALL_DIFFICULTIES } from "../lib/questionBank";
import { fallbackWhyWrong, getCoaching } from "../lib/coaching";
type Difficulty = "Easy" | "Medium" | "Hard";

type ChoiceId = "A" | "B" | "C" | "D";
type Choice = { id: ChoiceId; text: string };

type Domain = "Cloud Concepts" | "Security" | "Technology" | "Billing & Pricing";

type Question = {
  id: string;
  domain: Domain;
  difficulty: Difficulty;
  prompt: string;
  choices: Choice[];
  answerId: ChoiceId;
  explanation: string;
  coaching: string;
  whyWrong?: Partial<Record<ChoiceId, string>>;
};

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
};

const STORAGE_KEY = "aws-exam-readiness-progress-v1";
const EXAM_SECONDS = 90 * 60;

// How many questions per batch (your “15 at a time” request).
const BATCH_SIZE = 15;




function isDomain(x: string | null | undefined): x is Domain {
  if (!x) return false;
  return (ALL_DOMAINS as string[]).includes(x);
}
function isDifficulty(x: string | null | undefined): x is Difficulty {
  if (!x) return false;
  return (ALL_DIFFICULTIES as string[]).includes(x);
}

function parsePositiveInt(x: string | null, fallback: number) {
  const n = Number(x);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i > 0 ? i : fallback;
}

function makeEmptyProgress(): StoredProgress {
  const byDomain = {} as StoredProgress["byDomain"];
  for (const d of ALL_DOMAINS) byDomain[d] = { attempts: 0, correct: 0 };

  const byDifficulty = {} as StoredProgress["byDifficulty"];
  for (const dif of ALL_DIFFICULTIES) byDifficulty[dif] = { attempts: 0, correct: 0 };

  return {
    version: 1,
    attemptsTotal: 0,
    correctTotal: 0,
    streakCorrect: 0,
    byDomain,
    byDifficulty,
    history: [],
  };
}

function readProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    };
  } catch {
    return makeEmptyProgress();
  }
}

function writeProgress(p: StoredProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore (private mode / quota)
  }
}

function formatTime(sec: number) {
  const s = Math.max(0, Math.trunc(sec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const hh = Math.floor(mm / 60);
  const m2 = mm % 60;
  return hh > 0
    ? `${hh}:${String(m2).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${m2}:${String(ss).padStart(2, "0")}`;
}

function getChoiceText(q: Question, id: ChoiceId) {
  return q.choices.find((c) => c.id === id)?.text ?? "";
}

/**
 * Seeded shuffle so "Batch 1" feels consistent (and doesn't jump around on refresh),
 * but you can change batches to get a different slice/order.
 */
function hashStringToUint32(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seedKey: string) {
  const seed = hashStringToUint32(seedKey);
  const rand = mulberry32(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function QuizPage() {
  const searchParams = useSearchParams();

  const domainParam = searchParams.get("domain");
  const difficultyParam = searchParams.get("difficulty");
  const batchParam = searchParams.get("batch");
  const shuffleParam = searchParams.get("shuffle");

  const activeDomain: Domain | null = isDomain(domainParam) ? domainParam : null;
  const activeDifficulty: Difficulty | null = isDifficulty(difficultyParam)
    ? difficultyParam
    : null;

  const activeBatch = Math.max(1, parsePositiveInt(batchParam, 1));
  const shuffleOn = shuffleParam === "1";

  // --- BANK INSPECTION / HEALTH CHECKS ---
  const bankStats = useMemo(() => {
    const total = QUESTION_BANK.length;

    const byDomain: Record<Domain, number> = {
      "Cloud Concepts": 0,
      Security: 0,
      Technology: 0,
      "Billing & Pricing": 0,
    };

    const byDifficulty: Record<Difficulty, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    const seenIds = new Set<string>();
    const dupIds: string[] = [];

    const seenPrompts = new Set<string>();
    const dupPrompts: string[] = [];

    for (const q of QUESTION_BANK) {
      byDomain[q.domain] += 1;
      byDifficulty[q.difficulty] += 1;

      if (seenIds.has(q.id)) dupIds.push(q.id);
      seenIds.add(q.id);

      // prompt dup check (normalized)
      const norm = q.prompt.trim().toLowerCase().replace(/\s+/g, " ");
      if (seenPrompts.has(norm)) dupPrompts.push(q.id);
      seenPrompts.add(norm);
    }

    return { total, byDomain, byDifficulty, dupIds, dupPrompts };
  }, []);

  const filteredAll = useMemo(() => {
    let list = QUESTION_BANK;

    if (activeDomain) list = list.filter((q) => q.domain === activeDomain);
    if (activeDifficulty) list = list.filter((q) => q.difficulty === activeDifficulty);

    // If empty (early app), fall back to whole bank
    return list.length > 0 ? list : QUESTION_BANK;
  }, [activeDomain, activeDifficulty]);

  // Apply a stable ordering (id) before batching/shuffling
  const baseOrdered = useMemo(() => {
    const sorted = [...filteredAll].sort((a, b) => a.id.localeCompare(b.id));
    if (!shuffleOn) return sorted;

    const seedKey = `batch=${activeBatch}|domain=${activeDomain ?? "ALL"}|difficulty=${
      activeDifficulty ?? "ALL"
    }|size=${sorted.length}`;
    return seededShuffle(sorted, seedKey);
  }, [filteredAll, shuffleOn, activeBatch, activeDomain, activeDifficulty]);

  const totalInPool = baseOrdered.length;
  const batchCount = Math.max(1, Math.ceil(totalInPool / BATCH_SIZE));
  const clampedBatch = Math.min(activeBatch, batchCount);

  const batchStart = (clampedBatch - 1) * BATCH_SIZE;
  const batchEnd = Math.min(batchStart + BATCH_SIZE, totalInPool);

  const batchQuestions = useMemo(() => {
    return baseOrdered.slice(batchStart, batchEnd);
  }, [baseOrdered, batchStart, batchEnd]);

  // Track within-batch "seen" so you don’t bounce around oddly if you add more later
  const [idxInBatch, setIdxInBatch] = useState(0);
  const [selected, setSelected] = useState<ChoiceId | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [examMode, setExamMode] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(EXAM_SECONDS);

  const [progress, setProgress] = useState<StoredProgress | null>(null);

  const tickRef = useRef<number | null>(null);

  const currentQuestion =
    batchQuestions[idxInBatch % Math.max(1, batchQuestions.length)];

  const isCorrect = submitted && selected === currentQuestion.answerId;

  // load progress once (client only)
  useEffect(() => {
    setProgress(readProgress());
  }, []);

  // reset question index when filters/batch changes
  useEffect(() => {
    setIdxInBatch(0);
    setSelected(null);
    setSubmitted(false);
  }, [activeDomain, activeDifficulty, clampedBatch, shuffleOn]);

  // timer
  useEffect(() => {
    if (!timerOn) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    if (tickRef.current) clearInterval(tickRef.current);

    tickRef.current = window.setInterval(() => {
      setTimerRemaining((t) => {
        const next = t - 1;
        return next <= 0 ? 0 : next;
      });
    }, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [timerOn]);

  useEffect(() => {
    if (timerOn && timerRemaining <= 0) setTimerOn(false);
  }, [timerOn, timerRemaining]);

  function recordAttempt(q: Question, selectedId: ChoiceId) {
    const correct = selectedId === q.answerId;

    const next = progress ? { ...progress } : makeEmptyProgress();
    next.attemptsTotal += 1;
    next.correctTotal += correct ? 1 : 0;
    next.streakCorrect = correct ? next.streakCorrect + 1 : 0;

    next.byDomain[q.domain].attempts += 1;
    next.byDomain[q.domain].correct += correct ? 1 : 0;

    next.byDifficulty[q.difficulty].attempts += 1;
    next.byDifficulty[q.difficulty].correct += correct ? 1 : 0;

    next.history = [...next.history];
    next.history.unshift({
      questionId: q.id,
      domain: q.domain,
      difficulty: q.difficulty,
      selectedId,
      correct,
      ts: Date.now(),
    });
    next.history = next.history.slice(0, 200);

    setProgress(next);
    writeProgress(next);
  }

  function submit() {
    if (!selected) return;
    if (submitted) return;
    setSubmitted(true);
    recordAttempt(currentQuestion, selected);
  }

  function next() {
    setIdxInBatch((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  }

  const pill =
    "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs";

  function choiceClass(cId: ChoiceId) {
    const base =
      "w-full rounded-xl border px-4 py-3 text-left transition-colors";

    if (!submitted) {
      if (selected === cId) {
        return `${base} border-indigo-400 bg-indigo-500/15 ring-1 ring-indigo-400/30`;
      }
      return `${base} border-white/10 bg-black/20 hover:bg-white/5`;
    }

    const isAnswer = cId === currentQuestion.answerId;
    const isUserPick = cId === selected;

    if (isAnswer) return `${base} border-emerald-400 bg-emerald-500/10`;
    if (isUserPick && !isAnswer) return `${base} border-rose-400 bg-rose-500/10`;
    return `${base} border-white/10 bg-black/10 opacity-70`;
  }

  const correctId = currentQuestion.answerId;
  const correctText = getChoiceText(currentQuestion, correctId);

  const attemptsTotal = progress?.attemptsTotal ?? 0;
  const correctTotal = progress?.correctTotal ?? 0;
  const streak = progress?.streakCorrect ?? 0;
  const accuracy =
    attemptsTotal > 0 ? Math.round((correctTotal / attemptsTotal) * 100) : 0;

  const showingDomainFilter = Boolean(activeDomain);
  const showingDifficultyFilter = Boolean(activeDifficulty);
  const showingAnyFilter = showingDomainFilter || showingDifficultyFilter;

  const qParamBase =
    `${activeDomain ? `domain=${encodeURIComponent(activeDomain)}&` : ""}` +
    `${activeDifficulty ? `difficulty=${encodeURIComponent(activeDifficulty)}&` : ""}`;

  const shuffleHref = (on: boolean) => {
    const s = on ? "1" : "0";
    return `/quiz?${qParamBase}batch=${clampedBatch}&shuffle=${s}`;
  };

  const batchHref = (b: number) => {
    const safe = Math.min(Math.max(1, b), batchCount);
    return `/quiz?${qParamBase}batch=${safe}&shuffle=${shuffleOn ? "1" : "0"}`;
  };

  const clearFiltersHref = () => `/quiz?batch=1&shuffle=${shuffleOn ? "1" : "0"}`;

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Top controls */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button className={pill} onClick={() => setExamMode(!examMode)}>
            Exam Mode: {examMode ? "ON" : "OFF"}
          </button>

          <button className={pill} onClick={() => setTimerOn(!timerOn)}>
            Timer {timerOn ? "ON" : "OFF"}
          </button>

          <span className={pill}>⏱ {formatTime(timerRemaining)}</span>

          <span className={pill}>
            Attempts: <span className="text-white/90">{attemptsTotal}</span>
          </span>
          <span className={pill}>
            Accuracy: <span className="text-white/90">{accuracy}%</span>
          </span>
          <span className={pill}>
            Streak: <span className="text-white/90">{streak}</span>
          </span>

          <Link className={pill} href="/dashboard">
            Dashboard
          </Link>

          <span className={pill}>
            Bank Total: <span className="text-white/90">{bankStats.total}</span>
          </span>

          <span className={pill}>
            Pool: <span className="text-white/90">{totalInPool}</span>
          </span>

          <span className={pill}>
            Batch:{" "}
            <span className="text-white/90">
              {clampedBatch}/{batchCount}
            </span>{" "}
            <span className="text-white/60">
              ({batchStart + 1}-{batchEnd})
            </span>
          </span>

          <Link className={pill} href={shuffleHref(!shuffleOn)} title="Toggle stable shuffle">
            Shuffle: {shuffleOn ? "ON" : "OFF"}
          </Link>
{/* Difficulty filter */}
<span className={pill}>Difficulty:</span>

<Link
  className={`${pill} ${!activeDifficulty ? "border-indigo-400 bg-indigo-500/15" : ""}`}
  href={`/quiz?${activeDomain ? `domain=${encodeURIComponent(activeDomain)}&` : ""}batch=1&shuffle=${
    shuffleOn ? "1" : "0"
  }`}
>
  All
</Link>

{ALL_DIFFICULTIES.map((dif) => (
  <Link
    key={dif}
    className={`${pill} ${activeDifficulty === dif ? "border-indigo-400 bg-indigo-500/15" : ""}`}
    href={`/quiz?${activeDomain ? `domain=${encodeURIComponent(activeDomain)}&` : ""}difficulty=${encodeURIComponent(
      dif
    )}&batch=1&shuffle=${shuffleOn ? "1" : "0"}`}
  >
    {dif}
  </Link>
))}
          {showingAnyFilter && (
            <>
              {showingDomainFilter && <span className={pill}>Domain: {activeDomain}</span>}
              {showingDifficultyFilter && (
                <span className={pill}>Difficulty: {activeDifficulty}</span>
              )}
              <Link className={pill} href={clearFiltersHref()} title="Clear filters">
                Clear Filters
              </Link>
              
            </>
          )}
        </div>

        {/* Batch navigation */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link className={pill} href={batchHref(clampedBatch - 1)} aria-disabled={clampedBatch <= 1}>
            ← Prev Batch
          </Link>
          <Link className={pill} href={batchHref(clampedBatch + 1)} aria-disabled={clampedBatch >= batchCount}>
            Next Batch →
          </Link>

          <span className="text-xs text-white/60 self-center ml-2">
            Tip: if you grow the bank to 100, you’ll see Batch 1..7 (15 each, last batch smaller).
          </span>
        </div>

        {/* Bank Inspector (visual reference) */}
        <details className="mb-6 rounded-2xl border border-white/10 bg-black/20 p-5" open>
          <summary className="cursor-pointer select-none text-sm font-semibold text-white/90">
            Question Bank Inspector
            <span className="ml-2 text-xs text-white/60">(expand/collapse)</span>
          </summary>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white/90">Counts</div>
              <div className="mt-3 text-sm text-white/80 space-y-2">
                <div>
                  <span className="text-white/60">Total questions:</span>{" "}
                  <span className="font-semibold">{bankStats.total}</span>
                </div>
                <div>
                  <span className="text-white/60">Current pool (after filters):</span>{" "}
                  <span className="font-semibold">{totalInPool}</span>
                </div>
                <div>
                  <span className="text-white/60">Batch size:</span>{" "}
                  <span className="font-semibold">{BATCH_SIZE}</span>{" "}
                  <span className="text-white/60">
                    → batches: <span className="font-semibold">{batchCount}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-white/70 mb-2">
                  By Domain
                </div>
                <ul className="text-sm text-white/80 space-y-1">
                  {ALL_DOMAINS.map((d) => (
                    <li key={d} className="flex justify-between">
                      <span>{d}</span>
                      <span className="text-white/90 font-semibold">{bankStats.byDomain[d]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-white/70 mb-2">
                  By Difficulty
                </div>
                <ul className="text-sm text-white/80 space-y-1">
                  {ALL_DIFFICULTIES.map((dif) => (
                    <li key={dif} className="flex justify-between">
                      <span>{dif}</span>
                      <span className="text-white/90 font-semibold">{bankStats.byDifficulty[dif]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white/90">Quality checks</div>

              <div className="mt-3 text-sm text-white/80 space-y-2">
                <div>
                  <span className="text-white/60">Duplicate IDs:</span>{" "}
                  {bankStats.dupIds.length === 0 ? (
                    <span className="text-emerald-300 font-semibold">None</span>
                  ) : (
                    <span className="text-rose-300 font-semibold">
                      {bankStats.dupIds.join(", ")}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-white/60">Duplicate prompts (approx):</span>{" "}
                  {bankStats.dupPrompts.length === 0 ? (
                    <span className="text-emerald-300 font-semibold">None</span>
                  ) : (
                    <span className="text-rose-300 font-semibold">
                      {bankStats.dupPrompts.join(", ")}
                    </span>
                  )}
                </div>

                <div className="text-xs text-white/60">
                  When you add new questions, keep IDs unique and avoid reusing the same prompt text.
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-white/70 mb-2">
                  This batch’s question IDs ({batchQuestions.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {batchQuestions.map((q) => (
                    <span
                      key={q.id}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80"
                      title={q.prompt}
                    >
                      {q.id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* Quiz Card */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
          <div className="mb-4 flex flex-wrap gap-2 text-xs text-white/70">
            <span className={pill}>{currentQuestion.domain}</span>
            <span className={pill}>Difficulty: {currentQuestion.difficulty}</span>
            <span className={pill}>
              Batch progress:{" "}
              {Math.min(idxInBatch + 1, Math.max(1, batchQuestions.length))}/
              {Math.max(1, batchQuestions.length)}
            </span>
          </div>

          <h2 className="mb-4 text-lg font-semibold">{currentQuestion.prompt}</h2>

          <div className="space-y-3">
            {currentQuestion.choices.map((c) => (
              <button
                key={c.id}
                disabled={submitted}
                onClick={() => setSelected(c.id)}
                className={choiceClass(c.id)}
                aria-pressed={selected === c.id}
              >
                <strong className="mr-2">{c.id}</strong> {c.text}
              </button>
            ))}
          </div>

          {submitted && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-medium">
                {isCorrect ? "✅ Correct" : "❌ Not quite"}
              </div>

              <div className="text-sm text-white/85">
                <div className="mb-2">
                  <span className="text-white/70">Correct answer:</span>{" "}
                  <span className="font-semibold">
                    {correctId} — {correctText}
                  </span>
                </div>

                {!examMode && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-2 font-semibold text-indigo-200">
                      Coaching
                    </div>

                    <div className="mb-3 text-sm text-white/85">
                      <div className="mb-1 text-white/70">Exam tip</div>
                      <div>💡 {getCoaching(currentQuestion)}</div>                    </div>
                    {selected && selected !== currentQuestion.answerId && (
  <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/5 p-4">
    <div className="mb-2 font-semibold text-rose-300">
      Why your answer was incorrect
    </div>

    <div className="text-sm text-white/85 leading-relaxed">
      {fallbackWhyWrong(currentQuestion, selected)}
    </div>
  </div>
)}

<div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-4">
  <div className="mb-2 font-semibold text-emerald-300">
    Why the correct answer works
  </div>

  <div className="text-sm text-white/85 leading-relaxed">
    {currentQuestion.explanation}
  </div>
</div>
                    
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            {!submitted ? (
              <button
                onClick={submit}
                disabled={!selected}
                className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                  selected
                    ? "bg-indigo-500 hover:bg-indigo-400"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={next}
                className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/15 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}