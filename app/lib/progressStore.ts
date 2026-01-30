const PROGRESS_KEY = "aws-exam-readiness-progress-v1";
const QUIZ_SCORE_KEY = "aws-exam-readiness-quiz-score-v1";
const FLAGGED_KEY = "awsCoach.flaggedIds";
const LEGACY_FLAGS_KEY = "clfc02_flags_v1";
const WRONG_KEY = "awsCoach.wrongIds";
const LEGACY_MISSED_KEY = "awsCoach.missedIds";
const STREAK_KEY = "awsCoach.streak";
const ATTEMPTS_KEY = "awsCoach.attempts";
const PRACTICE_STATS_KEY = "awsCoach.practiceStats";
const EXAM_STATS_KEY = "awsCoach.examStats";
const LAST_EXAM_SCORE_KEY = "awsCoach.lastExamScaledScore";
const LAST_EXAM_RAW_KEY = "awsCoach.lastExamRawPct";
const LAST_EXAM_COMPLETED_KEY = "awsCoach.lastExamCompletedAt";

type DomainName = "Cloud Concepts" | "Security" | "Technology" | "Billing & Pricing";

export type ReadinessStats = {
  attempts: number;
  correct: number;
  byDomain: Record<DomainName, { attempts: number; correct: number }>;
  lastUpdated: number | null;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private mode / quota)
  }
}

const listeners = new Set<() => void>();
function emit() {
  for (const cb of listeners) cb();
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function makeEmptyStats(): ReadinessStats {
  return {
    attempts: 0,
    correct: 0,
    byDomain: {
      "Cloud Concepts": { attempts: 0, correct: 0 },
      Security: { attempts: 0, correct: 0 },
      Technology: { attempts: 0, correct: 0 },
      "Billing & Pricing": { attempts: 0, correct: 0 },
    },
    lastUpdated: null,
  };
}

export function getPracticeStats(): ReadinessStats {
  const stats = readJson<ReadinessStats | null>(PRACTICE_STATS_KEY, null);
  if (!stats) return makeEmptyStats();
  return { ...makeEmptyStats(), ...stats, byDomain: { ...makeEmptyStats().byDomain, ...stats.byDomain } };
}

export function setPracticeStats(partial: Partial<ReadinessStats>): ReadinessStats {
  const current = getPracticeStats();
  const next: ReadinessStats = {
    ...current,
    ...partial,
    byDomain: { ...current.byDomain, ...(partial.byDomain ?? {}) },
    lastUpdated: Date.now(),
  };
  writeJson(PRACTICE_STATS_KEY, next);
  emit();
  return next;
}

export function resetPractice() {
  writeJson(PRACTICE_STATS_KEY, makeEmptyStats());
  emit();
}

export function getExamStats(): ReadinessStats {
  const stats = readJson<ReadinessStats | null>(EXAM_STATS_KEY, null);
  if (!stats) return makeEmptyStats();
  return { ...makeEmptyStats(), ...stats, byDomain: { ...makeEmptyStats().byDomain, ...stats.byDomain } };
}

export function setExamStats(partial: Partial<ReadinessStats>): ReadinessStats {
  const current = getExamStats();
  const next: ReadinessStats = {
    ...current,
    ...partial,
    byDomain: { ...current.byDomain, ...(partial.byDomain ?? {}) },
    lastUpdated: Date.now(),
  };
  writeJson(EXAM_STATS_KEY, next);
  emit();
  return next;
}

export function resetExam() {
  writeJson(EXAM_STATS_KEY, makeEmptyStats());
  writeJson(LAST_EXAM_SCORE_KEY, 0);
  writeJson(LAST_EXAM_RAW_KEY, 0);
  writeJson(LAST_EXAM_COMPLETED_KEY, null);
  emit();
}

export function getLastExamScaledScore(): number {
  const n = readJson<number>(LAST_EXAM_SCORE_KEY, 0);
  return Number.isFinite(n) ? n : 0;
}

export function setLastExamScaledScore(score: number) {
  const clamped = Math.max(0, Math.min(1000, Math.round(score)));
  writeJson(LAST_EXAM_SCORE_KEY, clamped);
  emit();
}

export function getLastExamRawPct(): number {
  const n = readJson<number>(LAST_EXAM_RAW_KEY, 0);
  return Number.isFinite(n) ? n : 0;
}

export function setLastExamRawPct(pct: number) {
  const clamped = Math.max(0, Math.min(1, pct));
  writeJson(LAST_EXAM_RAW_KEY, clamped);
  emit();
}

export function getLastExamCompletedAt(): number | null {
  const n = readJson<number | null>(LAST_EXAM_COMPLETED_KEY, null);
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

export function setLastExamCompletedAt(ts: number | null) {
  writeJson(LAST_EXAM_COMPLETED_KEY, ts);
  emit();
}

export function getWrongIds(): string[] {
  const list = readJson<string[]>(WRONG_KEY, []);
  const normalized = Array.isArray(list) ? list.map((x) => String(x)) : [];
  if (normalized.length > 0) return normalized;
  const legacy = readJson<string[]>(LEGACY_MISSED_KEY, []);
  const legacyNormalized = Array.isArray(legacy) ? legacy.map((x) => String(x)) : [];
  if (legacyNormalized.length > 0) {
    writeJson(WRONG_KEY, legacyNormalized);
    emit();
    return legacyNormalized;
  }
  return normalized;
}

export function setWrongIds(ids: string[]) {
  writeJson(WRONG_KEY, ids);
  emit();
}

export function addWrongId(id: string): string[] {
  const prev = getWrongIds();
  const next = prev.includes(id) ? prev : [...prev, id];
  setWrongIds(next);
  return next;
}

export function removeWrongId(id: string): string[] {
  const next = getWrongIds().filter((x) => x !== id);
  setWrongIds(next);
  return next;
}

export function getFlaggedIds(): string[] {
  const list = readJson<string[]>(FLAGGED_KEY, []);
  const normalized = Array.isArray(list) ? list.map((x) => String(x)) : [];
  if (normalized.length > 0) return normalized;
  const legacy = readJson<string[]>(LEGACY_FLAGS_KEY, []);
  const legacyNormalized = Array.isArray(legacy) ? legacy.map((x) => String(x)) : [];
  if (legacyNormalized.length > 0) {
    writeJson(FLAGGED_KEY, legacyNormalized);
    emit();
    return legacyNormalized;
  }
  return [];
}

export function setFlaggedIds(ids: string[]) {
  writeJson(FLAGGED_KEY, ids);
  emit();
}

export function toggleFlaggedId(id: string): string[] {
  const prev = getFlaggedIds();
  const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
  setFlaggedIds(next);
  return next;
}

export function getStreak(): number {
  const n = readJson<number>(STREAK_KEY, 0);
  return Number.isFinite(n) ? n : 0;
}

export function setStreak(n: number) {
  writeJson(STREAK_KEY, Number.isFinite(n) ? n : 0);
  emit();
}

export function getAttempts(): number {
  const n = readJson<number>(ATTEMPTS_KEY, 0);
  return Number.isFinite(n) ? n : 0;
}

export function setAttempts(n: number) {
  writeJson(ATTEMPTS_KEY, Number.isFinite(n) ? n : 0);
  emit();
}

export function resetAllProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
    window.localStorage.removeItem(QUIZ_SCORE_KEY);
    window.localStorage.removeItem(WRONG_KEY);
    window.localStorage.removeItem(LEGACY_MISSED_KEY);
    window.localStorage.removeItem(FLAGGED_KEY);
    window.localStorage.removeItem(STREAK_KEY);
    window.localStorage.removeItem(ATTEMPTS_KEY);
    window.localStorage.removeItem(PRACTICE_STATS_KEY);
    window.localStorage.removeItem(EXAM_STATS_KEY);
    window.localStorage.removeItem(LAST_EXAM_SCORE_KEY);
    window.localStorage.removeItem(LAST_EXAM_RAW_KEY);
    window.localStorage.removeItem(LAST_EXAM_COMPLETED_KEY);
    emit();
  } catch {
    // ignore
  }
}

export {
  PROGRESS_KEY,
  QUIZ_SCORE_KEY,
  FLAGGED_KEY,
  LEGACY_FLAGS_KEY,
  WRONG_KEY,
  LEGACY_MISSED_KEY,
  STREAK_KEY,
  ATTEMPTS_KEY,
  PRACTICE_STATS_KEY,
  EXAM_STATS_KEY,
  LAST_EXAM_SCORE_KEY,
  LAST_EXAM_RAW_KEY,
  LAST_EXAM_COMPLETED_KEY,
};
