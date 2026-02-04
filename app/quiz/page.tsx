"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type MouseEvent,
  type CSSProperties,
} from "react";
import {
  QUESTION_BANK,
  ALL_DOMAINS,
  ALL_DIFFICULTIES,
  isVerifiedQuestion,
  getVerificationIssues,
} from "../lib/questionBank";
import { fallbackWhyWrong, getCoaching } from "../lib/coaching";
import { computeUnlockedBadges, type BadgeId } from "../lib/achievements";
import {
  addWrongId,
  getAttempts,
  getFlaggedIds,
  getWrongIds,
  getStreak,
  getPracticeStats,
  getExamStats,
  setPracticeStats,
  setExamStats,
  getLastExamScaledScore,
  setLastExamScaledScore,
  setLastExamRawPct,
  setLastExamCompletedAt,
  removeWrongId,
  subscribe,
  setAttempts,
  setStreak,
  toggleFlaggedId,
} from "../lib/progressStore";
import SurfaceShell from "../components/SurfaceShell";
import { btnBase, btnGhost, btnPrimary, cardBase, cardHover, linkReset, pillBase } from "../lib/ui";
import { PremiumButton } from "../components/PremiumButton";
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
  explanation?: string;
  coaching: string;
  whyCorrect: string;
  whyWrong?: Partial<Record<ChoiceId, string>>;
  memoryHook?: string;
  testedConcepts?: string[];
  sources?: { title: string; url: string }[];
  verified?: boolean;
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

type ExamStatus = "idle" | "active" | "finished";
type ExamSnapshot = {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  scaledScore: number;
  finishedAt: number;
  timeRemaining: number;
};

const STORAGE_KEY = "aws-exam-readiness-progress-v1";
const QUIZ_SCORE_KEY = "aws-exam-readiness-quiz-score-v1";
const EXAM_STATUS_KEY = "awsCoach.examStatus";
const EXAM_SNAPSHOT_KEY = "awsCoach.examSnapshot";
const EXAM_SECONDS = 90 * 60;
const LS_SETTINGS = "awscoach.settings.v1";

type PracticeSettings = {
  includeVerified: boolean;
  includeUnverified: boolean;
  difficulty: "all" | "easy" | "medium" | "hard";
  shuffle: boolean;
};

const DEFAULT_SETTINGS: PracticeSettings = {
  includeVerified: true,
  includeUnverified: true,
  difficulty: "all",
  shuffle: false,
};

function normalizeDifficulty(value: unknown): PracticeSettings["difficulty"] {
  if (value === "easy" || value === "medium" || value === "hard" || value === "all") {
    return value;
  }
  return DEFAULT_SETTINGS.difficulty;
}

function normalizeSettings(value: unknown): PracticeSettings {
  const raw = (value && typeof value === "object" ? (value as Partial<PracticeSettings>) : {}) as Partial<PracticeSettings>;
  return {
    includeVerified:
      typeof raw.includeVerified === "boolean" ? raw.includeVerified : DEFAULT_SETTINGS.includeVerified,
    includeUnverified:
      typeof raw.includeUnverified === "boolean"
        ? raw.includeUnverified
        : DEFAULT_SETTINGS.includeUnverified,
    difficulty: normalizeDifficulty(raw.difficulty),
    shuffle: typeof raw.shuffle === "boolean" ? raw.shuffle : DEFAULT_SETTINGS.shuffle,
  };
}

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

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildExamSet(pool: Question[], size = 65) {
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(size, shuffled.length)).map((q) => q.id);
}

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedAnswer, setSelectedAnswer] = useState<ChoiceId | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  type Feed = "main" | "wrong" | "flagged";
  const [feed, setFeed] = useState<Feed>("main");
  const [feedKey, setFeedKey] = useState(0);
  const bumpFeedKey = useCallback(() => setFeedKey((k) => k + 1), []);
  const [reviewQuestionIds, setReviewQuestionIds] = useState<string[] | null>(null);
  const [showStreakBanner, setShowStreakBanner] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<PracticeSettings>(DEFAULT_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState<Partial<PracticeSettings>>(DEFAULT_SETTINGS);
  const [didHydrateSettings, setDidHydrateSettings] = useState(false);
  const [examMode, setExamMode] = useState(false);
  const [examStatus, setExamStatus] = useState<ExamStatus>("idle");
  const [examSnapshot, setExamSnapshot] = useState<ExamSnapshot | null>(null);
  const [examSessionStarted, setExamSessionStarted] = useState(false);
  const [examQueue, setExamQueue] = useState<string[] | null>(null);
  const [examIndex, setExamIndex] = useState(0);
  const [examComplete, setExamComplete] = useState(false);
  const [examWarning, setExamWarning] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [timerOn, setTimerOn] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(EXAM_SECONDS);
  const [progressVersion, setProgressVersion] = useState(0);
  const autoAdvancedRef = useRef(false);
  const autoAdvanceCanceledRef = useRef(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const autoAdvanceIntervalRef = useRef<number | null>(null);
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(3);
  const autoExamStartRef = useRef(false);
  const listsLoadedRef = useRef(false);
  const reviewMode: "none" | "wrong" | "flagged" = feed === "main" ? "none" : feed;
  const settingsDraftResolved: PracticeSettings = { ...DEFAULT_SETTINGS, ...settingsDraft };

  const resetReviewUI = useCallback(() => {
    setIdxInBatch(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  }, []);

  const domainParam = searchParams.get("domain");
  const batchParam = searchParams.get("batch");
  const shuffleParam = searchParams.get("shuffle");
  const modeParam = searchParams.get("mode");
  const reviewParam = searchParams.get("review");
  const examParam = searchParams.get("exam");
  const shuffleOn = shuffleParam === "1";
  const searchParamsString = searchParams.toString();
  const normalizedReviewParam = useMemo(() => {
    if (reviewParam === "missed") return "wrong";
    if (reviewParam === "wrong" || reviewParam === "flagged") return reviewParam;
    return null;
  }, [reviewParam]);

  const activeDomain: Domain | null = isDomain(domainParam) ? domainParam : null;

  const activeBatch = Math.max(1, parsePositiveInt(batchParam, 1));
  const batchFilter =
    batchParam === "wrong" ? "wrong" : batchParam === "flagged" ? "flagged" : null;

  const goToBatch = useCallback(
    (batch: "wrong" | "flagged") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("batch", batch);
      params.delete("review");
      params.delete("q");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

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

    if (!examMode) {
      if (settings.difficulty !== "all") {
        const target = settings.difficulty.toLowerCase();
        list = list.filter((q) => q.difficulty.toLowerCase() === target);
      }
      if (!settings.includeVerified && !settings.includeUnverified) return [];
      if (settings.includeVerified && !settings.includeUnverified) {
        list = list.filter((q) => q.verified === true);
      } else if (!settings.includeVerified && settings.includeUnverified) {
        list = list.filter((q) => q.verified === false);
      }
    }

    // If empty (early app), fall back to whole bank
    return list.length > 0 ? list : QUESTION_BANK;
  }, [activeDomain, examMode, settings]);

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of QUESTION_BANK) map.set(q.id, q);
    return map;
  }, []);

  const reviewQuestions = useMemo(() => {
    if (reviewMode === "none" || !reviewQuestionIds || reviewQuestionIds.length === 0) return null;
    return reviewQuestionIds.map((id) => questionMap.get(id)).filter(Boolean) as Question[];
  }, [reviewMode, reviewQuestionIds, questionMap]);

  const verifiedPool = useMemo(
    () => QUESTION_BANK.filter((q) => isVerifiedQuestion(q)),
    [isVerifiedQuestion]
  );

  const poolQuestions = useMemo(() => {
    if (reviewQuestions) return reviewQuestions;
    return filteredAll;
  }, [reviewQuestions, filteredAll]);

  const [questionOrder, setQuestionOrder] = useState<Question[]>([]);

  const reshuffle = useCallback(() => {
    if (examMode || reviewMode !== "none") return;
    const shuffled = shuffleArray(poolQuestions);
    setQuestionOrder(shuffled);
    setIdxInBatch(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  }, [examMode, reviewMode, poolQuestions]);

  useEffect(() => {
    if (examMode || reviewMode !== "none") return;
    reshuffle();
  }, [examMode, reviewMode, reshuffle]);

  const baseOrdered = reviewQuestions ?? (questionOrder.length > 0 ? questionOrder : poolQuestions);

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

  const [progress, setProgress] = useState<StoredProgress | null>(null);

  const tickRef = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const selectedRef = useRef<ChoiceId | null>(null);
  const submitRef = useRef<() => void>(() => {});
  const nextRef = useRef<() => void>(() => {});

  const examQuestions = useMemo(() => {
    if (!examQueue || examQueue.length === 0) return [];
    return examQueue.map((id) => questionMap.get(id)).filter(Boolean) as Question[];
  }, [examQueue, questionMap]);

  const batchFilterQuestions = useMemo(() => {
    if (!batchFilter) return null;
    const ids = batchFilter === "wrong" ? wrongIds : flaggedIds;
    return ids.map((id) => questionMap.get(id)).filter(Boolean) as Question[];
  }, [batchFilter, flaggedIds, questionMap, wrongIds]);

  const activeQuestions =
    examMode && examQueue
      ? examQuestions
      : reviewQuestions
        ? reviewQuestions
        : batchFilterQuestions ?? batchQuestions;

  const hasQuestions = activeQuestions.length > 0;
  const totalQuestions = hasQuestions ? activeQuestions.length : 0;
  const activeIndex = examMode
    ? Math.min(examIndex, Math.max(0, totalQuestions - 1))
    : Math.min(idxInBatch, Math.max(0, totalQuestions - 1));
  const isReviewBatch = reviewMode !== "none" || batchFilter !== null;
  const finished =
    examMode
      ? examStatus === "finished" || examComplete
      : isReviewBatch
        ? false
        : idxInBatch >= activeQuestions.length;
  const currentQuestion = hasQuestions ? activeQuestions[activeIndex] : null;
  const reviewWrongMode = reviewMode === "wrong";
  const reviewFlaggedMode = reviewMode === "flagged";

  const isCorrect = submitted && !!currentQuestion && selectedAnswer === currentQuestion.answerId;

  // load progress once (client only)
  useEffect(() => {
    const loaded = readProgress();
    setProgress(loaded);
    if (loaded) {
      setAttempts(loaded.attemptsTotal ?? getAttempts());
      setStreak(loaded.streakCorrect ?? getStreak());
    }
  }, []);

  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem(EXAM_STATUS_KEY);
      const storedSnapshot = localStorage.getItem(EXAM_SNAPSHOT_KEY);
      if (storedStatus === "finished" && storedSnapshot) {
        const parsed = JSON.parse(storedSnapshot) as ExamSnapshot;
        setExamStatus("finished");
        setExamSnapshot(parsed);
        setExamMode(true);
        setExamComplete(true);
        setExamIndex(0);
        setExamQueue(null);
        setTimerOn(false);
        if (typeof parsed?.timeRemaining === "number") {
          setTimerRemaining(parsed.timeRemaining);
        }
      }
    } catch {
      // ignore (private mode / quota)
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(LS_SETTINGS);
      const parsed = raw ? JSON.parse(raw) : null;

      const hydrated = normalizeSettings(parsed);

      setSettings(hydrated);
      setSettingsDraft(hydrated);
    } catch {
      const fallback = normalizeSettings(null);
      setSettings(fallback);
      setSettingsDraft(fallback);
    } finally {
      setDidHydrateSettings(true);
    }
  }, []);

  useEffect(() => {
    if (!didHydrateSettings) return;
    if (typeof window === "undefined") return;

    window.localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }, [settings, didHydrateSettings]);

  useEffect(() => {
    try {
      const rawScore = localStorage.getItem(QUIZ_SCORE_KEY);
      const parsedScore = rawScore ? Number(JSON.parse(rawScore)) : 0;
      setScore(Number.isFinite(parsedScore) ? parsedScore : 0);
      setWrongIds(getWrongIds());
      setFlaggedIds(getFlaggedIds());
      listsLoadedRef.current = true;
    } catch {
      setScore(0);
      setWrongIds([]);
      setFlaggedIds([]);
      listsLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setProgressVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!listsLoadedRef.current) return;
    setWrongIds(getWrongIds());
    setFlaggedIds(getFlaggedIds());
  }, [progressVersion]);

  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_SCORE_KEY, String(score));
    } catch {
      // ignore (private mode / quota)
    }
  }, [score]);

  const exitReviewToPractice = useCallback(() => {
    const params = new URLSearchParams(searchParamsString);
    params.delete("review");
    router.replace(`/quiz?${params.toString()}`, { scroll: false });
  }, [router, searchParamsString]);

  const exitExam = useCallback(() => {
    setExamMode(false);
    setExamSessionStarted(false);
    setExamQueue(null);
    setExamIndex(0);
    setExamComplete(false);
    if (examStatus !== "finished") {
      setExamStatus("idle");
    }
    setExamWarning(null);
    setIdxInBatch(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  }, [examStatus]);

  useEffect(() => {
    const nextFeed =
      normalizedReviewParam === "wrong"
        ? "wrong"
        : normalizedReviewParam === "flagged"
        ? "flagged"
        : "main";
    if (nextFeed !== feed) {
      setFeed(nextFeed);
      bumpFeedKey();
      resetReviewUI();
    }
  }, [normalizedReviewParam, feed, bumpFeedKey, resetReviewUI]);

  useEffect(() => {
    if (feed === "main") {
      if (reviewQuestionIds !== null) setReviewQuestionIds(null);
      if (reviewNotice !== null) setReviewNotice(null);
      return;
    }
    if (examMode) exitExam();
    const source = feed === "wrong" ? wrongIds : flaggedIds;
    if (source.length === 0) {
      if (reviewNotice !== `No ${feed} questions yet.`) {
        setReviewNotice(`No ${feed} questions yet.`);
      }
      if (reviewQuestionIds !== null) setReviewQuestionIds(null);
      return;
    }
    if (reviewNotice !== null) setReviewNotice(null);
    setReviewQuestionIds(source);
    setIdxInBatch(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  }, [feed, feedKey, wrongIds, flaggedIds, reviewQuestionIds, reviewNotice, examMode, exitExam]);

  useEffect(() => {
    if (examMode && finished) {
      if (examQueue && examQueue.length === 65) {
        const pct = examQueue.length > 0 ? score / examQueue.length : 0;
        const scaled = Math.round(100 + pct * 900);
        const clamped = Math.max(100, Math.min(1000, scaled));
        setLastExamScaledScore(clamped);
        setLastExamRawPct(pct);
        setLastExamCompletedAt(Date.now());
      }
      setExamSessionStarted(false);
    }
  }, [examMode, finished, examQueue, score, setLastExamScaledScore, setLastExamRawPct, setLastExamCompletedAt]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      closeSettings();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  useEffect(() => {
    if (idxInBatch > activeQuestions.length) {
      const maxIndex = isReviewBatch
        ? Math.max(0, activeQuestions.length - 1)
        : activeQuestions.length;
      setIdxInBatch(maxIndex);
    }
  }, [idxInBatch, activeQuestions.length, isReviewBatch]);

  // reset question index when filters/batch changes
  useEffect(() => {
    if (examMode || reviewMode !== "none") return;
    setIdxInBatch(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  }, [
    examMode,
    reviewMode,
    activeDomain,
    settings.difficulty,
    clampedBatch,
    shuffleOn,
    settings.includeVerified,
    settings.includeUnverified,
  ]);

  useEffect(() => {
    submittedRef.current = submitted;
    selectedRef.current = selectedAnswer;
  }, [submitted, selectedAnswer]);

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
    const isExamAttempt = examMode && reviewMode === "none";

    if (isExamAttempt) {
      const exam = getExamStats();
      const next = {
        attempts: exam.attempts + 1,
        correct: exam.correct + (correct ? 1 : 0),
        byDomain: {
          ...exam.byDomain,
          [q.domain]: {
            attempts: exam.byDomain[q.domain].attempts + 1,
            correct: exam.byDomain[q.domain].correct + (correct ? 1 : 0),
          },
        },
      };
      setExamStats(next);
    } else if (!examMode && reviewMode === "none") {
      const practice = getPracticeStats();
      const next = {
        attempts: practice.attempts + 1,
        correct: practice.correct + (correct ? 1 : 0),
        byDomain: {
          ...practice.byDomain,
          [q.domain]: {
            attempts: practice.byDomain[q.domain].attempts + 1,
            correct: practice.byDomain[q.domain].correct + (correct ? 1 : 0),
          },
        },
      };
      setPracticeStats(next);
    }

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
    setAttempts(next.attemptsTotal);
    setStreak(next.streakCorrect);
  }

  const finalizeExam = useCallback(
    (finalCorrect: number) => {
      if (examStatus === "finished") return;
      const total = 65;
      const clampedCorrect = Math.max(0, Math.min(total, finalCorrect));
      const wrong = Math.max(0, total - clampedCorrect);
      const accuracyPct = total > 0 ? Math.round((clampedCorrect / total) * 100) : 0;
      const pct = total > 0 ? clampedCorrect / total : 0;
      const scaled = Math.round(100 + pct * 900);
      const scaledScore = Math.max(100, Math.min(1000, scaled));
      const snapshot: ExamSnapshot = {
        total,
        correct: clampedCorrect,
        wrong,
        accuracy: accuracyPct,
        scaledScore,
        finishedAt: Date.now(),
        timeRemaining: timerRemaining,
      };
      setExamSnapshot(snapshot);
      setExamStatus("finished");
      setExamComplete(true);
      setTimerOn(false);
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      try {
        localStorage.setItem(EXAM_STATUS_KEY, "finished");
        localStorage.setItem(EXAM_SNAPSHOT_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    },
    [examStatus, timerRemaining]
  );

  function submit() {
    if (!selectedAnswer) return;
    if (submitted) return;
    if (!currentQuestion) return;
    if (examStatus === "finished") return;
    if (examMode && !examSessionStarted) setExamSessionStarted(true);
    const isCorrect = selectedAnswer === currentQuestion.answerId;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (reviewMode === "wrong") {
        const next = removeWrongId(currentQuestion.id);
        setWrongIds(next);
      }
    } else {
      const id = currentQuestion.id;
      const next = addWrongId(id);
      setWrongIds(next);
    }
    setSubmitted(true);
    setShowExplanation(true);
    recordAttempt(currentQuestion, selectedAnswer);

    if (examMode && examIndex >= 64) {
      const finalCorrect = isCorrect ? score + 1 : score;
      finalizeExam(finalCorrect);
    }
  }

  function next() {
    if (examStatus === "finished") return;
    if (!examMode && isReviewBatch && activeIndex >= Math.max(0, totalQuestions - 1)) return;
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (examMode) {
      const queueLength = examQueue?.length ?? 0;
      console.log("[ExamAdvance] before", {
        mode: "exam",
        examIndex,
        examQueueLength: queueLength,
        currentQuestionId: currentQuestion?.id,
      });
      if (examIndex >= 64) {
        setExamComplete(true);
        console.log("[ExamAdvance] after", {
          mode: "exam",
          examIndex,
          examQueueLength: queueLength,
          currentQuestionId: currentQuestion?.id,
        });
      } else {
        setExamIndex((prev) => {
          const nextIndex = Math.min(prev + 1, 64);
          console.log("[ExamAdvance] after", {
            mode: "exam",
            examIndex: nextIndex,
            examQueueLength: queueLength,
            currentQuestionId: examQueue?.[nextIndex] ?? null,
          });
          return nextIndex;
        });
      }
    } else {
      const maxIndex = isReviewBatch
        ? Math.max(0, activeQuestions.length - 1)
        : activeQuestions.length;
      setIdxInBatch((prev) => Math.min(prev + 1, maxIndex));
    }
    setSubmitted(false);
  }

  function prev() {
    if (examStatus === "finished") return;
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (examMode) {
      setExamIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else {
      setIdxInBatch((prevIndex) => Math.max(prevIndex - 1, 0));
    }
    setSubmitted(false);
  }

  function resetTimer() {
    setTimerRemaining(EXAM_SECONDS);
    setTimerOn(false);
  }

  function openSettings() {
    setSettingsDraft(settings);
    setSettingsOpen(true);
  }

  function closeSettings() {
    setSettingsDraft(settings);
    setSettingsOpen(false);
  }

  function saveSettings() {
    const nextSettings: PracticeSettings = { ...DEFAULT_SETTINGS, ...settingsDraft };
    setSettings(nextSettings);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_SETTINGS, JSON.stringify(nextSettings));
    }
    setSettingsOpen(false);
  }

  function goToWrongReview() {
    if ((wrongIds?.length ?? 0) === 0) return;
    if (reviewParam === "wrong") return;
    const params = new URLSearchParams(searchParamsString);
    params.set("review", "wrong");
    router.replace(`/quiz?${params.toString()}`, { scroll: false });
  }

  function goToFlaggedReview() {
    if ((flaggedIds?.length ?? 0) === 0) return;
    if (reviewParam === "flagged") return;
    const params = new URLSearchParams(searchParamsString);
    params.set("review", "flagged");
    router.replace(`/quiz?${params.toString()}`, { scroll: false });
  }

  const beginExam = useCallback(() => {
    if (verifiedPool.length < 65) {
      setExamWarning(
        `Exam Mode needs 65 verified questions, but only ${verifiedPool.length} are available.`
      );
      setExamMode(false);
      setExamStatus("idle");
      setExamQueue(null);
      setExamIndex(0);
      setExamComplete(false);
      return;
    }
    const ids = buildExamSet(verifiedPool, 65);
    setExamQueue(ids);
    setExamIndex(0);
    setExamComplete(false);
    setExamStatus("active");
    setExamSnapshot(null);
    setExamWarning(null);
    setExamMode(true);
    setExamSessionStarted(false);
    setFeed("main");
    bumpFeedKey();
    setReviewQuestionIds(null);
    setReviewNotice(null);
    setIdxInBatch(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
    try {
      localStorage.removeItem(EXAM_STATUS_KEY);
      localStorage.removeItem(EXAM_SNAPSHOT_KEY);
    } catch {
      // ignore
    }
  }, [verifiedPool]);

  const startExam = useCallback(() => {
    if (examStatus === "finished") {
      setExamMode(true);
      return;
    }
    beginExam();
  }, [examStatus, beginExam]);

  const startNewExam = useCallback(() => {
    setScore(0);
    setExamSnapshot(null);
    setExamStatus("idle");
    setTimerRemaining(EXAM_SECONDS);
    setTimerOn(false);
    try {
      localStorage.removeItem(EXAM_STATUS_KEY);
      localStorage.removeItem(EXAM_SNAPSHOT_KEY);
    } catch {
      // ignore
    }
    beginExam();
  }, [beginExam]);

  useEffect(() => {
    const shouldStartExam = modeParam === "exam" || examParam === "1";
    if (shouldStartExam) {
      if (autoExamStartRef.current) return;
      autoExamStartRef.current = true;
      startExam();
      return;
    }
    autoExamStartRef.current = false;
  }, [modeParam, examParam, startExam]);

  const confirmExamExit = useCallback(() => {
    if (!examMode || !examSessionStarted) return true;
    const ok = window.confirm("Leave exam mode? Your current exam session will end.");
    if (!ok) return false;
    exitExam();
    return true;
  }, [examMode, examSessionStarted, exitExam]);

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
  }, [examMode, examSessionStarted, exitExam]);

  const handleNavClick = (e: MouseEvent) => {
    if (!confirmExamExit()) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (examStatus === "finished") return;
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

      if (e.key !== "Escape") return;
      if (reviewMode === "none") return;
      e.preventDefault();
      e.stopPropagation();
      exitReviewToPractice();
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [reviewMode, exitReviewToPractice, examStatus]);

  const pill = `${pillBase} cursor-default`;
  const toolbarBtnGhost = `${btnBase} ${btnGhost} h-9 px-3 text-sm`;
  const toolbarBtnActive = `${btnBase} h-9 px-3 text-sm border border-indigo-400 bg-indigo-500/20 text-white`;

  function choiceClass(cId: ChoiceId) {
    const base =
      "w-full rounded-xl border px-4 py-2.5 text-left transition-colors";

    if (!currentQuestion) {
      return `${base} border-white/10 bg-black/10 opacity-70`;
    }

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

  const correctId = currentQuestion?.answerId ?? "A";
  const correctText = currentQuestion ? getChoiceText(currentQuestion, correctId) : "";
  const currentNumber = examMode
    ? Math.min(examIndex + 1, totalQuestions)
    : Math.min(idxInBatch + 1, totalQuestions);
  const displayTotal =
    examMode && examStatus === "finished" && examSnapshot
      ? examSnapshot.total
      : totalQuestions;
  const displayNumber =
    examMode && examStatus === "finished" && examSnapshot
      ? examSnapshot.total
      : currentNumber;
  const progressPct = displayTotal > 0 ? (displayNumber / displayTotal) * 100 : 0;
  const currentMeta = currentQuestion
    ? `${currentQuestion.domain} • ${currentQuestion.difficulty}`
    : "No questions available";
  const showExamComplete = examMode && examStatus === "finished";
  const finalSnapshot =
    examSnapshot ??
    (examMode
      ? {
          total: 65,
          correct: Math.max(0, Math.min(65, score)),
          wrong: Math.max(0, 65 - score),
          accuracy: Math.round((Math.max(0, Math.min(65, score)) / 65) * 100),
          scaledScore: Math.max(100, Math.min(1000, Math.round(100 + (score / 65) * 900))),
          finishedAt: Date.now(),
          timeRemaining: timerRemaining,
        }
      : null);

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

  const qParamBase =
    `${activeDomain ? `domain=${encodeURIComponent(activeDomain)}&` : ""}` +
    `${shuffleOn ? "shuffle=1&" : ""}`;

  const batchHref = (b: number) => {
    const safe = Math.min(Math.max(1, b), batchCount);
    return `/quiz?${qParamBase}batch=${safe}`;
  };

  function formatRelativeDate(ts: number) {
    const diff = Date.now() - ts;
    if (!Number.isFinite(diff)) return "Just now";
    const mins = Math.max(0, Math.round(diff / 60000));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  }

  const nextBatch = useCallback(() => {
    if (examMode || reviewMode !== "none") return;
    if (clampedBatch >= batchCount) return;
    if (!confirmExamExit()) return;
    router.push(batchHref(clampedBatch + 1));
  }, [examMode, reviewMode, batchCount, clampedBatch, confirmExamExit, router, batchHref]);

  function handleAnswerSelect(answer: ChoiceId) {
    if (submitted) return;
    if (examStatus === "finished") return;
    setSelectedAnswer(answer);
  }

  const isBatchComplete = finished;
  const isAtLastQuestion = totalQuestions > 0 && activeIndex >= totalQuestions - 1;

  useEffect(() => {
    if (examMode || reviewMode !== "none" || batchFilter !== null) return;
    if (!isBatchComplete) {
      autoAdvancedRef.current = false;
      autoAdvanceCanceledRef.current = false;
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      if (autoAdvanceIntervalRef.current !== null) {
        window.clearInterval(autoAdvanceIntervalRef.current);
        autoAdvanceIntervalRef.current = null;
      }
      setAutoAdvanceSeconds(3);
      return;
    }
    if (autoAdvancedRef.current) return;
    autoAdvancedRef.current = true;
    autoAdvanceCanceledRef.current = false;
    setAutoAdvanceSeconds(3);

    autoAdvanceIntervalRef.current = window.setInterval(() => {
      setAutoAdvanceSeconds((s) => Math.max(0, s - 1));
    }, 1000);

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      if (autoAdvanceCanceledRef.current) return;
      nextBatch();
    }, 3000);

    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      if (autoAdvanceIntervalRef.current !== null) {
        window.clearInterval(autoAdvanceIntervalRef.current);
        autoAdvanceIntervalRef.current = null;
      }
    };
  }, [examMode, reviewMode, batchFilter, isBatchComplete, nextBatch]);

  const timerProgressPct = Math.max(
    0,
    Math.min(100, ((EXAM_SECONDS - timerRemaining) / EXAM_SECONDS) * 100)
  );

const timerRow = (
  <div className="relative">
    {/* subtle divider line between timer and dock */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

    <div className="flex items-center justify-center px-3 py-6 sm:py-7">
      <div className="relative flex flex-col items-center">
        <div className="pointer-events-none select-none absolute left-1/2 top-[-70px] z-0 -translate-x-1/2 opacity-20 blur-[0.5px] drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:opacity-25">
          <Image
            src="/overlays/cloud.png"
            alt="Cloud overlay"
            width={700}
            height={700}
            priority
            className="h-auto w-[220px] sm:w-[300px] md:w-[360px]"
          />
        </div>

        {/* Premium timer shell */}
        <button
          type="button"
          onClick={() => setTimerOn(!timerOn)}
          aria-label="Toggle timer (pause/resume)"
          title="Click to pause/resume"
          className="group relative z-10 w-[min(92vw,390px)] select-none rounded-[28px] p-[1px]
                     bg-[linear-gradient(130deg,rgba(129,140,248,0.55),rgba(56,189,248,0.32),rgba(16,185,129,0.35))]
                     shadow-[0_20px_45px_rgba(3,8,20,0.45)]
                     transition hover:scale-[1.01] active:scale-[0.99]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="relative block rounded-[27px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(15,23,42,0.62))] px-5 py-4 backdrop-blur">
            <span className="pointer-events-none absolute inset-0 rounded-[27px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_62%)]" />
            <span className="relative flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/65">
              <span>Exam Timer</span>
              <span className={`rounded-full px-2 py-0.5 tracking-[0.12em] ${timerOn ? "bg-emerald-500/18 text-emerald-200" : "bg-amber-500/16 text-amber-200"}`}>
                {timerOn ? "Running" : "Paused"}
              </span>
            </span>

            <span className="relative mt-2 block text-center tabular-nums text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              {formatTime(timerRemaining)}
            </span>

            <span className="relative mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-indigo-300/80 via-sky-300/75 to-emerald-300/70 transition-all duration-500"
                style={{ width: `${timerProgressPct}%` }}
              />
            </span>
          </span>
        </button>
      </div>
    </div>
  </div>
);

  const dockRow = (
    <div className="mt-6 flex w-full justify-center">
      <div className="ios-dock-surface grid w-full max-w-[720px] grid-cols-2 gap-2 rounded-3xl bg-white/8 px-3 py-3 shadow-lg ring-1 ring-white/15 backdrop-blur sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 sm:rounded-full sm:px-4">
        <PremiumButton
          variant="indigo"
          size="sm"
          onClick={prev}
          disabled={activeIndex <= 0}
          className="ios-dock-btn ios-dock-btn-indigo h-9 w-full px-3 text-xs bg-indigo-500/32 ring-indigo-300/45 hover:bg-indigo-500/42 text-indigo-50 sm:h-8 sm:w-auto"
        >
          ← Prev Question
        </PremiumButton>
        <PremiumButton
          variant="indigo"
          size="sm"
          onClick={next}
          disabled={activeIndex >= totalQuestions - 1}
          className="ios-dock-btn ios-dock-btn-indigo h-9 w-full px-3 text-xs bg-indigo-500/32 ring-indigo-300/45 hover:bg-indigo-500/42 text-indigo-50 sm:h-8 sm:w-auto"
        >
          Next Question →
        </PremiumButton>
        <PremiumButton
          variant="neutral"
          size="sm"
          title="Randomize question order"
          onClick={reshuffle}
          className="ios-dock-btn ios-dock-btn-neutral h-9 w-full px-3 text-xs bg-slate-400/18 ring-slate-200/35 hover:bg-slate-400/28 text-white sm:h-8 sm:w-auto"
        >
          Shuffle
        </PremiumButton>
        <PremiumButton
          variant="neutral"
          size="sm"
          onClick={resetTimer}
          disabled={timerRemaining === EXAM_SECONDS && timerOn === false}
          className="ios-dock-btn ios-dock-btn-neutral h-9 w-full px-3 text-xs bg-slate-400/18 ring-slate-200/35 hover:bg-slate-400/28 text-white sm:h-8 sm:w-auto"
        >
          Timer Reset
        </PremiumButton>
        <PremiumButton
          variant="green"
          size="sm"
          onClick={() => {
            if (examMode) {
              exitExam();
            } else {
              startExam();
            }
          }}
          className="ios-dock-btn ios-dock-btn-green h-9 w-full px-3 text-xs bg-emerald-500/30 ring-emerald-300/45 hover:bg-emerald-500/40 text-emerald-50 sm:h-8 sm:w-auto"
        >
          {examMode ? "Exit Exam Mode" : "Exam Mode"}
        </PremiumButton>
        <PremiumButton
          variant="orange"
          size="sm"
          onClick={() => (settingsOpen ? closeSettings() : openSettings())}
          aria-label="Settings"
          title="Settings"
          className="ios-dock-btn ios-dock-btn-orange col-span-2 h-9 w-full px-3 text-xs bg-amber-500/30 ring-amber-300/45 hover:bg-amber-500/40 text-amber-50 sm:col-auto sm:h-8 sm:w-auto"
        >
          Settings
        </PremiumButton>
      </div>
    </div>
  );

  const questionCard = (() => {
    if (showExamComplete) {
      return (
        <div className={`relative overflow-hidden p-6 shadow-lg shadow-black/30 ${cardBase} ${cardHover}`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="confetti-layer">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={`confetti-${i}`}
                  className="confetti-piece"
                  style={{ "--x": String(Math.random()) } as CSSProperties}
                />
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              ✅ Exam Complete
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">Exam Complete</h2>
            <p className="mt-1 text-sm text-white/70">
              You finished {finalSnapshot?.total ?? 65} questions.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-widest text-white/50">
                  Score Summary
                </div>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Correct</span>
                    <span className="font-semibold text-white">
                      {finalSnapshot?.correct ?? score}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Wrong</span>
                    <span className="font-semibold text-white">
                      {finalSnapshot?.wrong ?? Math.max(0, 65 - score)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Accuracy</span>
                    <span className="font-semibold text-white">
                      {finalSnapshot?.accuracy ?? Math.round((score / 65) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Scaled score</span>
                    <span className="font-semibold text-white">
                      {finalSnapshot?.scaledScore ?? getLastExamScaledScore()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-widest text-white/50">
                  Session
                </div>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Time remaining</span>
                    <span className="font-semibold text-white">
                      {formatTime(finalSnapshot?.timeRemaining ?? timerRemaining)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Finished</span>
                    <span className="font-semibold text-white">
                      {finalSnapshot?.finishedAt
                        ? formatRelativeDate(finalSnapshot.finishedAt)
                        : "Just now"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Link
                href="/dashboard"
                className={linkReset}
              >
                <PremiumButton variant="neutral" size="md">
                  Back to Dashboard
                </PremiumButton>
              </Link>
              {wrongIds.length > 0 && (
                <Link
                  href="/quiz?review=wrong"
                  onClick={(e) => {
                    exitExam();
                    handleNavClick(e);
                  }}
                  className={linkReset}
                >
                  <PremiumButton variant="red" size="md">
                    Review Wrong
                  </PremiumButton>
                </Link>
              )}
              <PremiumButton variant="green" size="md" onClick={startNewExam}>
                Start New Exam
              </PremiumButton>
            </div>
          </div>
          <style jsx>{`
            .confetti-layer {
              position: absolute;
              inset: 0;
              overflow: hidden;
              pointer-events: none;
            }
            .confetti-piece {
              position: absolute;
              top: -10px;
              left: calc(5% + 90% * var(--x, 0.5));
              width: 6px;
              height: 12px;
              opacity: 0.8;
              background: linear-gradient(180deg, #a5b4fc, #34d399);
              border-radius: 2px;
              animation: confetti-fall 1.4s ease-out forwards;
            }
            .confetti-piece:nth-child(odd) {
              background: linear-gradient(180deg, #fcd34d, #f472b6);
            }
            @keyframes confetti-fall {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
              }
              20% {
                opacity: 1;
              }
              100% {
                transform: translateY(260px) rotate(160deg);
                opacity: 0;
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .confetti-piece {
                animation: none;
              }
            }
          `}</style>
        </div>
      );
    }

    if (!currentQuestion) {
      return (
        <div className={`p-6 shadow-lg shadow-black/30 ${cardBase} ${cardHover}`}>
          <div className="text-sm text-white/80">
            No questions match your current settings. Update your filters to continue.
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            {reviewMode !== "none" ? (
              <PremiumButton variant="neutral" size="sm" onClick={exitReviewToPractice}>
                Exit Review
              </PremiumButton>
            ) : (
              <PremiumButton
                variant="orange"
                size="sm"
                onClick={() => (settingsOpen ? closeSettings() : openSettings())}
              >
                Open Settings
              </PremiumButton>
            )}
          </div>
        </div>
      );
    }

    return (
        <div className={`p-6 shadow-lg shadow-black/30 ${cardBase} ${cardHover}`}>
          <div className="mb-4 text-xs text-white/70">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className={pill}>{currentQuestion.domain}</span>
              <span className={pill}>
                <span className="sm:hidden">{currentQuestion.difficulty}</span>
                <span className="hidden sm:inline">Difficulty: {currentQuestion.difficulty}</span>
              </span>
              <span className={pill}>
                <span className="sm:hidden">
                  {reviewWrongMode
                    ? `Wrong ${currentNumber}/${totalQuestions}`
                    : reviewFlaggedMode
                      ? `Flagged ${currentNumber}/${totalQuestions}`
                      : `Progress ${currentNumber}/${totalQuestions}`}
                </span>
                <span className="hidden sm:inline">
                  {reviewWrongMode
                    ? `Wrong set: ${currentNumber}/${totalQuestions}`
                    : reviewFlaggedMode
                      ? `Flagged set: ${currentNumber}/${totalQuestions}`
                      : `Batch progress: ${currentNumber}/${totalQuestions}`}
                </span>
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isVerifiedQuestion(currentQuestion)
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-yellow-500/20 text-yellow-200"
                }`}
              >
                {isVerifiedQuestion(currentQuestion) ? "Verified" : "Unverified"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
              <button
                type="button"
                disabled={wrongIds.length === 0}
                onClick={() => {
                  if (wrongIds.length > 0) goToBatch("wrong");
                }}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                  wrongIds.length > 0
                    ? "bg-red-500/20 text-red-300 ring-red-500/30 hover:bg-red-500/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400/40"
                    : "bg-red-500/10 text-red-300/40 ring-red-500/10 cursor-default opacity-50",
                ].join(" ")}
                aria-disabled={wrongIds.length === 0}
                title={wrongIds.length === 0 ? "No wrong questions" : "Go to wrong questions batch"}
              >
                Wrong {wrongIds.length}
              </button>
              <button
                type="button"
                disabled={flaggedIds.length === 0}
                onClick={() => {
                  if (flaggedIds.length > 0) goToBatch("flagged");
                }}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                  flaggedIds.length > 0
                    ? "bg-red-500/20 text-red-300 ring-red-500/30 hover:bg-red-500/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400/40"
                    : "bg-red-500/10 text-red-300/40 ring-red-500/10 cursor-default opacity-50",
                ].join(" ")}
                aria-disabled={flaggedIds.length === 0}
                title={flaggedIds.length === 0 ? "No flagged questions" : "Go to flagged questions batch"}
              >
                Flagged {flaggedIds.length}
              </button>
            </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-white/70">
              Question {currentNumber} of {totalQuestions}
            </div>
            <div className="mt-2 h-1 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-indigo-500/60"
                style={{
                  width: `${progressPct}%`,
                }}
              />
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{currentQuestion.prompt}</h2>
              </div>
              <button
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  flaggedIds.includes(currentQuestion.id)
                    ? "bg-indigo-500/90 text-white hover:bg-indigo-500"
                    : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
                onClick={() => {
                  const id = currentQuestion.id;
                  const next = toggleFlaggedId(id);
                  setFlaggedIds(next);
                }}
                aria-pressed={flaggedIds.includes(currentQuestion.id)}
              >
                {flaggedIds.includes(currentQuestion.id) ? "★ Flagged" : "☆ Flag"}
              </button>
            </div>
            {!isVerifiedQuestion(currentQuestion) && (
              <div className="text-xs text-yellow-200/80">
                Unverified: {getVerificationIssues(currentQuestion).join(", ")}
              </div>
            )}
          </div>

          {reviewMode === "wrong" && wrongIds.length === 0 && (
            <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 p-4 ${cardBase}`}>
              <div className="text-sm text-white/80">
                No wrong questions yet — answer a few to unlock review mode.
              </div>
              <Link
                href="/quiz"
                onClick={(e) => {
                  exitReviewToPractice();
                  handleNavClick(e);
                }}
                className={linkReset}
              >
                <PremiumButton variant="neutral" size="sm">
                  Back to Practice
                </PremiumButton>
              </Link>
            </div>
          )}
          {reviewMode === "flagged" && flaggedIds.length === 0 && (
            <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 p-4 ${cardBase}`}>
              <div className="text-sm text-white/80">
                No flagged questions yet — flag a few to review them later.
              </div>
              <Link
                href="/quiz"
                onClick={(e) => {
                  exitReviewToPractice();
                  handleNavClick(e);
                }}
                className={linkReset}
              >
                <PremiumButton variant="neutral" size="sm">
                  Back to Practice
                </PremiumButton>
              </Link>
            </div>
          )}

          {finished && (
            <div>
              {reviewMode !== "none"
                ? `End of ${reviewMode === "wrong" ? "wrong" : "flagged"} review`
                : examMode
                  ? "Exam complete"
                  : "Batch complete"}{" "}
              {reviewMode === "none" && (
                <>
                  — Score: {score} / {activeQuestions.length}
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            {currentQuestion.choices.map((c) => (
              <button
                key={c.id}
                disabled={submitted || examStatus === "finished"}
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
            <div className={`coach-feedback-shell mt-6 p-4 ${cardBase}`}>
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

                    <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(145deg,rgba(16,23,39,0.94),rgba(18,33,52,0.86))] shadow-[0_16px_36px_rgba(3,8,20,0.4)]">
                      <div className="border-b border-white/10 bg-gradient-to-r from-indigo-500/15 via-sky-400/10 to-transparent px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <div className="rounded-full border border-indigo-300/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-indigo-100">
                            Coach Mode
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">
                            Exam Tip
                          </div>
                          <div className="text-sm leading-relaxed text-white/90">
                            <span className="mr-1">💡</span>
                            {getCoaching(currentQuestion)}
                          </div>
                        </div>

                        {currentQuestion.memoryHook && (
                          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                            <span className="text-indigo-200">Memory hook</span>
                            <span className="text-white/90">{currentQuestion.memoryHook}</span>
                          </div>
                        )}

                        {selectedAnswer && selectedAnswer !== currentQuestion.answerId && (
                          <div className="rounded-xl border border-rose-300/30 bg-[linear-gradient(160deg,rgba(244,63,94,0.12),rgba(244,63,94,0.04))] p-4">
                            <div className="mb-2 text-sm font-semibold text-rose-200">
                              Why your answer was incorrect
                            </div>
                            <div className="text-sm leading-relaxed text-white/90">
                              {currentQuestion.whyWrong?.[selectedAnswer] ??
                                fallbackWhyWrong(currentQuestion, selectedAnswer)}
                            </div>
                          </div>
                        )}

                        <div className="rounded-xl border border-emerald-300/30 bg-[linear-gradient(160deg,rgba(16,185,129,0.12),rgba(16,185,129,0.04))] p-4">
                          <div className="mb-2 text-sm font-semibold text-emerald-200">
                            Why the correct answer works
                          </div>
                          <div className="text-sm leading-relaxed text-white/90">
                            {currentQuestion.whyCorrect}
                          </div>
                          {currentQuestion.sources && currentQuestion.sources.length > 0 && (
                            <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/70">
                              <div className="mb-1 font-semibold uppercase tracking-wider text-white/60">
                                Sources
                              </div>
                              <div className="space-y-1.5">
                                {currentQuestion.sources.map((s) => (
                                  <div key={s.url}>
                                    <a
                                      href={s.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-indigo-200 transition hover:text-indigo-100"
                                    >
                                      {s.title}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
              <PremiumButton
                variant="indigo"
                size="md"
                onClick={submit}
                disabled={!selectedAnswer || examStatus === "finished"}
                className="h-11 min-w-[116px] font-semibold"
              >
                Submit
              </PremiumButton>
            ) : (
              <PremiumButton
                variant={finished ? "green" : "indigo"}
                size="md"
                onClick={finished ? nextBatch : next}
                disabled={!finished && isReviewBatch && isAtLastQuestion}
                className="h-11 min-w-[116px] font-semibold"
              >
                {finished ? "Done" : "Next"}
              </PremiumButton>
            )}
          </div>
        </div>
      );
  })();

  return (
    <SurfaceShell>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {!examMode && examWarning && (
          <div className={`mb-4 p-3 text-sm text-yellow-200/90 ${cardBase}`}>
            {examWarning}
          </div>
        )}
        {!examMode && reviewNotice && (
          <div className={`mb-4 p-3 text-sm text-yellow-200/90 ${cardBase}`}>
            {reviewNotice}
          </div>
        )}
        {!examMode && reviewMode === "none" && !settings.includeVerified && !settings.includeUnverified && (
          <div className={`mb-4 p-3 text-sm text-amber-200/90 ${cardBase}`}>
            No questions match your current settings.
          </div>
        )}
        {reviewMode !== "none" && finished && (
          <div className={`mb-4 p-3 text-sm text-white/80 ${cardBase}`}>
            End of {reviewMode === "wrong" ? "wrong" : "flagged"} review.
          </div>
        )}

        {!examMode && settingsOpen && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
            onClick={closeSettings}
          >
            <div
              className="w-full max-w-[520px] rounded-2xl bg-gradient-to-b from-white/8 to-white/3 ring-1 ring-white/12 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur p-6"
              onClick={(e) => e.stopPropagation()}
              data-no-advance
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">Settings</div>
                  <div className="mt-1 text-xs text-white/60">
                    Customize your practice session
                  </div>
                </div>
                <PremiumButton
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={closeSettings}
                  aria-label="Close settings"
                  className="px-2.5 py-1.5"
                >
                  ✕
                </PremiumButton>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-white/50">
                    Practice behavior
                  </div>
                  <div className="mt-4">
                    <div className="text-[11px] uppercase tracking-widest text-white/50">
                      Question Source
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <PremiumButton
                        type="button"
                        size="sm"
                        variant={settingsDraftResolved.includeVerified ? "indigo" : "neutral"}
                        onClick={() =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            includeVerified: !settingsDraftResolved.includeVerified,
                          }))
                        }
                        aria-pressed={settingsDraftResolved.includeVerified}
                        className={settingsDraftResolved.includeVerified ? "" : "opacity-80"}
                      >
                        {settingsDraftResolved.includeVerified ? "✔" : "✕"} Include verified questions
                      </PremiumButton>
                      <PremiumButton
                        type="button"
                        size="sm"
                        variant={settingsDraftResolved.includeUnverified ? "indigo" : "neutral"}
                        onClick={() =>
                          setSettingsDraft((prev) => ({
                            ...prev,
                            includeUnverified: !settingsDraftResolved.includeUnverified,
                          }))
                        }
                        aria-pressed={settingsDraftResolved.includeUnverified}
                        className={settingsDraftResolved.includeUnverified ? "" : "opacity-80"}
                      >
                        {settingsDraftResolved.includeUnverified ? "✔" : "✕"} Include unverified questions
                      </PremiumButton>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div>
                  <div className="text-[11px] uppercase tracking-widest text-white/50">
                    Difficulty filter
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <PremiumButton
                      type="button"
                      size="sm"
                      variant={settingsDraftResolved.difficulty === "all" ? "indigo" : "neutral"}
                      className={settingsDraftResolved.difficulty === "all" ? "" : "opacity-80"}
                      onClick={() =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          difficulty: "all",
                        }))
                      }
                    >
                      All
                    </PremiumButton>
                    <PremiumButton
                      type="button"
                      size="sm"
                      variant={settingsDraftResolved.difficulty === "easy" ? "indigo" : "neutral"}
                      className={settingsDraftResolved.difficulty === "easy" ? "" : "opacity-80"}
                      onClick={() =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          difficulty: "easy",
                        }))
                      }
                    >
                      Easy
                    </PremiumButton>
                    <PremiumButton
                      type="button"
                      size="sm"
                      variant={settingsDraftResolved.difficulty === "medium" ? "indigo" : "neutral"}
                      className={settingsDraftResolved.difficulty === "medium" ? "" : "opacity-80"}
                      onClick={() =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          difficulty: "medium",
                        }))
                      }
                    >
                      Medium
                    </PremiumButton>
                    <PremiumButton
                      type="button"
                      size="sm"
                      variant={settingsDraftResolved.difficulty === "hard" ? "indigo" : "neutral"}
                      className={settingsDraftResolved.difficulty === "hard" ? "" : "opacity-80"}
                      onClick={() =>
                        setSettingsDraft((prev) => ({
                          ...prev,
                          difficulty: "hard",
                        }))
                      }
                    >
                      Hard
                    </PremiumButton>
                  </div>
                </div>

                <div className="h-px bg-white/5" />
                <details className={`mt-2 p-5 ${cardBase}`}>
                  <summary className="cursor-pointer select-none">
                    <PremiumButton type="button" variant="neutral" size="sm">
                      Question Bank Inspector{" "}
                      <span className="ml-2 text-xs text-white/50">(debug)</span>
                      <span className="ml-2 text-xs text-white/60">(expand/collapse)</span>
                    </PremiumButton>
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

                <div className="mt-4 flex items-center justify-end gap-2">
                  <PremiumButton variant="neutral" size="sm" onClick={closeSettings}>
                    Cancel
                  </PremiumButton>
                  <PremiumButton variant="indigo" size="sm" onClick={saveSettings}>
                    Save
                  </PremiumButton>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4" data-no-advance>
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            {/* 1) TIMER BAR */}
            <section className="px-0">
              <div className="grid w-full place-items-center">
                {timerRow}
              </div>
            </section>

            {/* 2) EXAM BAR / TOOLKIT DOCK */}
            {examMode ? (
              <div className="mt-4 w-full">
                <div className="relative w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                  <div className="h-14" />
                  <div className="absolute inset-0 grid place-items-center">
                    <PremiumButton
                      variant="green"
                      size="sm"
                      onClick={exitExam}
                      className="h-8 px-3 text-xs bg-emerald-500/15 border-emerald-300/20 hover:bg-emerald-500/22 text-emerald-50"
                    >
                      Exit Exam Mode
                    </PremiumButton>
                  </div>
                </div>
              </div>
            ) : (
              <section className="w-full">
                {dockRow}
              </section>
            )}
          </div>

          {/* 3) QUESTION CARD */}
          <section className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-6 backdrop-blur">
            {questionCard}
          </section>
        </div>
        {!examMode && reviewMode === "none" && batchFilter === null && isBatchComplete && (
          <div className="fixed bottom-4 left-1/2 z-30 w-[min(960px,92vw)] -translate-x-1/2 rounded-xl border border-white/10 bg-black/80 p-4 backdrop-blur shadow-lg shadow-black/40">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/85">
              <div>
                Batch complete — next batch starts in{" "}
                <span className="font-semibold text-white">{autoAdvanceSeconds}s</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <PremiumButton variant="indigo" size="md" onClick={nextBatch}>
                  Start next batch now
                </PremiumButton>
                <button
                  onClick={() => {
                    autoAdvanceCanceledRef.current = true;
                    if (autoAdvanceTimerRef.current !== null) {
                      window.clearTimeout(autoAdvanceTimerRef.current);
                      autoAdvanceTimerRef.current = null;
                    }
                    if (autoAdvanceIntervalRef.current !== null) {
                      window.clearInterval(autoAdvanceIntervalRef.current);
                      autoAdvanceIntervalRef.current = null;
                    }
                    setAutoAdvanceSeconds(0);
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Review this batch
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </SurfaceShell>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizPageContent />
    </Suspense>
  );
}
