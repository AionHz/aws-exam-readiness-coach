export const MIN_PRACTICE_SCORED = 10;
export const MIN_EXAM_SCORED = 10;

export function computeReadinessPercent(attempts: number, correct: number) {
  if (attempts === 0) return null;
  const acc = (correct / attempts) * 100;
  return Math.max(0, Math.min(100, Math.round(acc)));
}

export function estimateScaledScoreFromAccuracy(pct: number | null) {
  if (pct === null) return null;
  const clamped = Math.max(0, Math.min(100, pct));
  return Math.round(100 + (clamped / 100) * 900);
}
