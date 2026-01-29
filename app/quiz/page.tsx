"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { QUESTION_BANK, ALL_DOMAINS, ALL_DIFFICULTIES } from "../lib/questionBank";
import { fallbackWhyWrong, getCoaching } from "../lib/coaching";
import { computeUnlockedBadges, type BadgeId } from "../lib/achievements";
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
  unlockedBadges: BadgeId[];
};

const STORAGE_KEY = "aws-exam-readiness-progress-v1";
const QUIZ_SCORE_KEY = "aws-exam-readiness-quiz-score-v1";
const QUIZ_MISSED_KEY = "aws-exam-readiness-quiz-missed-v1";
const QUIZ_FLAGGED_KEY = "aws-exam-readiness-quiz-flagged-v1";
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
    unlockedBadges: [],
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
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
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
  const [selectedAnswer, setSelectedAnswer] = useState<ChoiceId | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [reviewMissed, setReviewMissed] = useState(false);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [showStreakBanner, setShowStreakBanner] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const domainParam = searchParams.get("domain");
  const difficultyParam = searchParams.get("difficulty");
  const batchParam = searchParams.get("batch");
  const shuffleParam = searchParams.get("shuffle");
  const reviewParam = searchParams.get("review");

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

  const reviewFlagged = reviewParam === "flagged";

  const poolQuestions = useMemo(() => {
    if (reviewFlagged && flaggedIds.length > 0) {
      let list = QUESTION_BANK.filter((q) => flaggedIds.includes(q.id));

      if (activeDomain) list = list.filter((q) => q.domain === activeDomain);
      if (activeDifficulty) list = list.filter((q) => q.difficulty === activeDifficulty);

      if (list.length > 0) return list;
    }

    if (reviewMissed && missedIds.length > 0) {
      let list = QUESTION_BANK.filter((q) => missedIds.includes(q.id));

      if (activeDomain) list = list.filter((q) => q.domain === activeDomain);
      if (activeDifficulty) list = list.filter((q) => q.difficulty === activeDifficulty);

      if (list.length > 0) return list;
    }

    return filteredAll;
  }, [
    reviewFlagged,
    flaggedIds,
    reviewMissed,
    missedIds,
    activeDomain,
    activeDifficulty,
    filteredAll,
  ]);

  // Apply a stable ordering (id) before batching/shuffling
  const baseOrdered = useMemo(() => {
    const sorted = [...poolQuestions].sort((a, b) => a.id.localeCompare(b.id));
    if (!shuffleOn) return sorted;

    const seedKey = `batch=${activeBatch}|domain=${activeDomain ?? "ALL"}|difficulty=${
      activeDifficulty ?? "ALL"
    }|size=${sorted.length}`;
    return seededShuffle(sorted, seedKey);
  }, [poolQuestions, shuffleOn, activeBatch, activeDomain, activeDifficulty]);

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
  const [submitted, setSubmitted] = useState(false);

  const [examMode, setExamMode] = useState(false);
  const [examSessionStarted, setExamSessionStarted] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(EXAM_SECONDS);

  const [progress, setProgress] = useState<StoredProgress | null>(null);

  const tickRef = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const selectedRef = useRef<ChoiceId | null>(null);
  const submitRef = useRef<() => void>(() => {});
  const nextRef = useRef<() => void>(() => {});

  const finished = idxInBatch >= batchQuestions.length;
  const currentQuestion =
    batchQuestions[Math.min(idxInBatch, Math.max(0, batchQuestions.length - 1))];

  const isCorrect = submitted && selectedAnswer === currentQuestion.answerId;

  // load progress once (client only)
  useEffect(() => {
    setProgress(readProgress());
  }, []);

  useEffect(() => {
    try {
      const rawScore = localStorage.getItem(QUIZ_SCORE_KEY);
      const parsedScore = rawScore ? Number(JSON.parse(rawScore)) : 0;
      setScore(Number.isFinite(parsedScore) ? parsedScore : 0);

      const rawMissed = localStorage.getItem(QUIZ_MISSED_KEY);
      const parsedMissed = rawMissed ? (JSON.parse(rawMissed) as string[]) : [];
      setMissedIds(Array.isArray(parsedMissed) ? parsedMissed : []);

      const rawFlagged = localStorage.getItem(QUIZ_FLAGGED_KEY);
      const parsedFlagged = rawFlagged ? (JSON.parse(rawFlagged) as string[]) : [];
      setFlaggedIds(Array.isArray(parsedFlagged) ? parsedFlagged : []);
    } catch {
      setScore(0);
      setMissedIds([]);
      setFlaggedIds([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_SCORE_KEY, String(score));
      localStorage.setItem(QUIZ_MISSED_KEY, JSON.stringify(missedIds));
      localStorage.setItem(QUIZ_FLAGGED_KEY, JSON.stringify(flaggedIds));
    } catch {
      // ignore (private mode / quota)
    }
  }, [score, missedIds, flaggedIds]);

  useEffect(() => {
    if (reviewMissed && missedIds.length === 0) {
      setReviewMissed(false);
      setIdxInBatch(0);
      setSelectedAnswer(null);
      setSubmitted(false);
      setShowExplanation(false);
    }
  }, [reviewMissed, missedIds.length]);

  useEffect(() => {
    if (reviewParam === "missed" && missedIds.length > 0) {
      setReviewMissed(true);
    }
  }, [reviewParam, missedIds.length]);

  useEffect(() => {
    if (examMode && finished) {
      setExamSessionStarted(false);
    }
  }, [examMode, finished]);

  useEffect(() => {
    setIdxInBatch(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  }, [reviewMissed]);

  useEffect(() => {
    if (idxInBatch > batchQuestions.length) {
      setIdxInBatch(batchQuestions.length);
    }
  }, [idxInBatch, batchQuestions.length]);

  // reset question index when filters/batch changes
  useEffect(() => {
    setIdxInBatch(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  }, [activeDomain, activeDifficulty, clampedBatch, shuffleOn]);

  useEffect(() => {
    submittedRef.current = submitted;
    selectedRef.current = selectedAnswer;
  }, [submitted, selectedAnswer]);

  useEffect(() => {
    if (!examMode || !examSessionStarted) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [examMode, examSessionStarted]);

  useEffect(() => {
    submitRef.current = submit;
    nextRef.current = next;
  }, [submit, next]);

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
    next.unlockedBadges = computeUnlockedBadges(next);

    setProgress(next);
    writeProgress(next);
  }

  function submit() {
    if (!selectedAnswer) return;
    if (submitted) return;
    if (examMode && !examSessionStarted) setExamSessionStarted(true);
    const isCorrect = selectedAnswer === currentQuestion.answerId;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setMissedIds((prev) => prev.filter((x) => x !== currentQuestion.id));
    } else {
      const id = currentQuestion.id;
      setMissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
    setSubmitted(true);
    setShowExplanation(true);
    recordAttempt(currentQuestion, selectedAnswer);
  }

  function next() {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIdxInBatch((prev) => Math.min(prev + 1, batchQuestions.length));
    setSubmitted(false);
  }

  function resetTimer() {
    setTimerRemaining(EXAM_SECONDS);
    setTimerOn(false);
  }

  const handleNavClick = (e: MouseEvent) => {
    if (!examMode || !examSessionStarted) return;
    const ok = window.confirm("Leave exam mode? Your current exam session will end.");
    if (!ok) {
      e.preventDefault();
      return;
    }
    setExamMode(false);
    setExamSessionStarted(false);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const isEnter = e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter";
      if (!submittedRef.current && (key === "a" || key === "b" || key === "c" || key === "d")) {
        const choice = key.toUpperCase() as ChoiceId;
        handleAnswerSelect(choice);
        return;
      }

      if (!submittedRef.current && selectedRef.current && isEnter) {
        e.preventDefault();
        e.stopPropagation();
        submitRef.current();
        return;
      }

      if (submittedRef.current && key === "n") {
        e.preventDefault();
        e.stopPropagation();
        nextRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, []);

  const pill =
    "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs";

  function choiceClass(cId: ChoiceId) {
    const base =
      "w-full rounded-xl border px-4 py-2.5 text-left transition-colors";

    if (!submitted) {
      if (selectedAnswer === cId) {
        return `${base} border-indigo-400 bg-indigo-500/10 ring-1 ring-indigo-400/20`;
      }
      return `${base} border-white/10 bg-black/20 hover:bg-white/5`;
    }

    const isAnswer = cId === currentQuestion.answerId;
    const isUserPick = cId === selectedAnswer;

    if (isAnswer) return `${base} border-emerald-400 bg-emerald-500/10`;
    if (isUserPick && !isAnswer) return `${base} border-rose-400 bg-rose-500/10`;
    return `${base} border-white/10 bg-black/10 opacity-70`;
  }

  const correctId = currentQuestion.answerId;
  const correctText = getChoiceText(currentQuestion, correctId);

  const attemptsTotal = progress?.attemptsTotal ?? 0;
  const correctTotal = progress?.correctTotal ?? 0;
  const streakCorrect = progress?.streakCorrect ?? 0;
  const streak = streakCorrect;
  const streakMilestone = streakCorrect === 3 || streakCorrect === 5 || streakCorrect === 10;

  useEffect(() => {
    if (!streakMilestone) return;
    setShowStreakBanner(true);
    const t = window.setTimeout(() => setShowStreakBanner(false), 2000);
    return () => window.clearTimeout(t);
  }, [streakMilestone]);
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

  function handleAnswerSelect(answer: ChoiceId) {
    if (submitted) return;
    setSelectedAnswer(answer);
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Top toolbar */}
        <div className="sticky top-0 z-20 -mx-4 mb-6 rounded-xl border border-white/10 bg-[#0b1020]/70 px-4 py-3 backdrop-blur">
          {examMode ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-[220px]">
                <div className="text-sm font-semibold">
                  Question {Math.min(idxInBatch + 1, Math.max(1, batchQuestions.length))}/
                  {Math.max(1, batchQuestions.length)}
                </div>
                <div className="mt-2 h-1 w-40 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-indigo-500/60"
                    style={{
                      width: `${
                        (Math.min(idxInBatch + 1, Math.max(1, batchQuestions.length)) /
                          Math.max(1, batchQuestions.length)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className={`h-9 rounded-lg border px-3 text-sm ${
                    timerOn
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                  onClick={() => setTimerOn(!timerOn)}
                >
                  Timer {timerOn ? "ON" : "OFF"}
                </button>
                <span className="text-sm text-white/80">⏱ {formatTime(timerRemaining)}</span>
                <button
                  className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={resetTimer}
                  disabled={timerRemaining === EXAM_SECONDS && timerOn === false}
                >
                  Reset
                </button>
                <button
                  className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 hover:bg-white/10"
                  onClick={() => {
                    setExamMode(false);
                    setExamSessionStarted(false);
                  }}
                >
                  Exit Exam
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-[220px]">
                <div className="text-sm font-semibold">
                  Question {Math.min(idxInBatch + 1, Math.max(1, batchQuestions.length))}/
                  {Math.max(1, batchQuestions.length)}
                </div>
                <div className="text-xs text-white/60">
                  {currentQuestion.domain} • {currentQuestion.difficulty}
                </div>
                <div className="mt-2 h-1 w-40 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-indigo-500/60"
                    style={{
                      width: `${
                        (Math.min(idxInBatch + 1, Math.max(1, batchQuestions.length)) /
                          Math.max(1, batchQuestions.length)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="text-xs text-white/70">
                Attempts {attemptsTotal} • Acc {accuracy}% • Streak {streak} • Missed{" "}
                {missedIds.length}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className={`h-9 rounded-lg border px-3 text-sm ${
                    timerOn
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                  onClick={() => setTimerOn(!timerOn)}
                >
                  ⏱ {formatTime(timerRemaining)}
                </button>
                <button
                  className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={resetTimer}
                  disabled={timerRemaining === EXAM_SECONDS && timerOn === false}
                >
                  Reset
                </button>
                <button
                  className={`h-9 rounded-lg border px-3 text-sm ${
                    examMode
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                  onClick={() => {
                    if (examMode) {
                      setExamMode(false);
                      setExamSessionStarted(false);
                    } else {
                      setExamMode(true);
                    }
                  }}
                >
                  Exam Mode
                </button>
                <button
                  className={`h-9 rounded-lg border px-3 text-sm ${
                    reviewMissed
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  } ${missedIds.length === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (missedIds.length === 0) return;
                    setReviewMissed(!reviewMissed);
                  }}
                  disabled={missedIds.length === 0}
                  title={missedIds.length === 0 ? "Answer questions incorrectly to enable" : undefined}
                >
                  Review Missed
                </button>
                <button
                  className={`h-9 rounded-lg border px-3 text-sm ${
                    settingsOpen
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                  onClick={() => setSettingsOpen(!settingsOpen)}
                >
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {!examMode && settingsOpen && (
          <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 hover:bg-white/10"
                href={shuffleHref(!shuffleOn)}
                title="Toggle stable shuffle"
                onClick={handleNavClick}
              >
                Shuffle: {shuffleOn ? "ON" : "OFF"}
              </Link>

              {/* Difficulty filter */}
              <span className="text-xs text-white/60">Difficulty:</span>

              <Link
                className={`h-9 rounded-lg border px-3 text-sm ${
                  !activeDifficulty
                    ? "border-indigo-400 bg-indigo-500/20 text-white"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
                href={`/quiz?${activeDomain ? `domain=${encodeURIComponent(activeDomain)}&` : ""}batch=1&shuffle=${
                  shuffleOn ? "1" : "0"
                }`}
                onClick={handleNavClick}
              >
                All
              </Link>

              {ALL_DIFFICULTIES.map((dif) => (
                <Link
                  key={dif}
                  className={`h-9 rounded-lg border px-3 text-sm ${
                    activeDifficulty === dif
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                  href={`/quiz?${activeDomain ? `domain=${encodeURIComponent(activeDomain)}&` : ""}difficulty=${encodeURIComponent(
                    dif
                  )}&batch=1&shuffle=${shuffleOn ? "1" : "0"}`}
                  onClick={handleNavClick}
                >
                  {dif}
                </Link>
              ))}
              {showingAnyFilter && (
                <Link
                  className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 hover:bg-white/10"
                  href={clearFiltersHref()}
                  title="Clear filters"
                  onClick={handleNavClick}
                >
                  Clear Filters
                </Link>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 hover:bg-white/10"
                href={batchHref(clampedBatch - 1)}
                aria-disabled={clampedBatch <= 1}
                onClick={handleNavClick}
              >
                ← Prev Batch
              </Link>
              <Link
                className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 hover:bg-white/10"
                href={batchHref(clampedBatch + 1)}
                aria-disabled={clampedBatch >= batchCount}
                onClick={handleNavClick}
              >
                Next Batch →
              </Link>
              <span className="text-xs text-white/60 self-center ml-2">
                Tip: if you grow the bank to 100, you’ll see Batch 1..7 (15 each, last batch smaller).
              </span>
            </div>

            <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
              <summary className="cursor-pointer select-none text-sm font-semibold text-white/90">
                Question Bank Inspector
                <span className="ml-2 text-xs text-white/50">(debug)</span>
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
                    <div className="text-xs font-semibold text-white/70 mb-2">By Domain</div>
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
                    <div className="text-xs font-semibold text-white/70 mb-2">By Difficulty</div>
                    <ul className="text-sm text-white/80 space-y-1">
                      {ALL_DIFFICULTIES.map((dif) => (
                        <li key={dif} className="flex justify-between">
                          <span>{dif}</span>
                          <span className="text-white/90 font-semibold">
                            {bankStats.byDifficulty[dif]}
                          </span>
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
          </div>
        )}


        {/* Quiz Card */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
          <div className="mb-4 flex flex-wrap gap-2 text-xs text-white/70">
            <span className={pill}>{currentQuestion.domain}</span>
            <span className={pill}>Difficulty: {currentQuestion.difficulty}</span>
            <button
              className={pill}
              onClick={() => {
                const id = currentQuestion.id;
                setFlaggedIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                );
              }}
            >
              {flaggedIds.includes(currentQuestion.id) ? "★ Flagged" : "☆ Flag"}
            </button>
            <span className={pill}>
              Batch progress:{" "}
              {Math.min(idxInBatch + 1, Math.max(1, batchQuestions.length))}/
              {Math.max(1, batchQuestions.length)}
            </span>
          </div>

          <div className="mb-3">
            <div className="text-xs text-white/70">
              Question {Math.min(idxInBatch + 1, Math.max(1, batchQuestions.length))} of{" "}
              {Math.max(1, batchQuestions.length)}
            </div>
            <div className="mt-2 h-1 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-indigo-500/60"
                style={{
                  width: `${
                    (Math.min(idxInBatch + 1, Math.max(1, batchQuestions.length)) /
                      Math.max(1, batchQuestions.length)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <h2 className="mb-4 text-lg font-semibold">{currentQuestion.prompt}</h2>

          {reviewMissed && missedIds.length === 0 && (
            <div>No missed questions yet — answer some questions first.</div>
          )}

          {finished && (
            <div>Batch complete — Score: {score} / {batchQuestions.length}</div>
          )}

          <div className="space-y-3">
            {currentQuestion.choices.map((c) => (
              <button
                key={c.id}
                disabled={submitted}
                onClick={() => handleAnswerSelect(c.id)}
                className={choiceClass(c.id)}
                aria-pressed={selectedAnswer === c.id}
              >
                <strong className="mr-2">{c.id}</strong> {c.text}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-white/50">
            Shortcuts:{" "}
            <code className="font-mono text-white/70">A–D</code> select •{" "}
            <code className="font-mono text-white/70">Enter</code> submit •{" "}
            <code className="font-mono text-white/70">N</code> next
          </div>

          {submitted && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              {!examMode && streakMilestone && showStreakBanner && (
                <div className="mb-3 inline-block rounded-lg bg-indigo-500/20 px-3 py-1 text-sm text-white">
                  {streakCorrect === 3 && "🔥 3-question streak!"}
                  {streakCorrect === 5 && "🚀 5-question streak!"}
                  {streakCorrect === 10 &&
                    "🏆 10-question streak — exam-ready momentum!"}
                </div>
              )}
              {examMode ? (
                <div className="text-sm text-white/85">
                  <div className="mb-1 font-medium">
                    {isCorrect ? "Correct" : "Incorrect"}
                  </div>
                  <div>
                    <span className="text-white/70">Correct answer:</span>{" "}
                    <span className="font-semibold">{correctId}</span>
                  </div>
                </div>
              ) : (
                <>
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

                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 font-semibold text-indigo-200">
                        Coaching
                      </div>

                      <div className="mb-3 text-sm text-white/85">
                        <div className="mb-1 text-white/70">Exam tip</div>
                        <div>💡 {getCoaching(currentQuestion)}</div>{" "}
                      </div>
                      {selectedAnswer && selectedAnswer !== currentQuestion.answerId && (
                        <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/5 p-4">
                          <div className="mb-2 font-semibold text-rose-300">
                            Why your answer was incorrect
                          </div>

                          <div className="text-sm text-white/85 leading-relaxed">
                            {fallbackWhyWrong(currentQuestion, selectedAnswer)}
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
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            {!submitted ? (
              <button
                onClick={submit}
                disabled={!selectedAnswer}
                className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                  selectedAnswer
                    ? "bg-indigo-500 hover:bg-indigo-400"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={next}
                disabled={finished}
                className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/15 transition-colors"
              >
                {finished ? "Done" : "Next"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
