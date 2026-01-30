export const DOMAIN_WEIGHTS = {
  "Cloud Concepts": 0.24,
  Security: 0.3,
  Technology: 0.34,
  "Billing & Pricing": 0.12,
} as const;

export type DomainName = keyof typeof DOMAIN_WEIGHTS;

export type AttemptLike = {
  domain: DomainName;
  correct: boolean;
};

export type DomainStats = Record<
  DomainName,
  { correct: number; total: number; accuracy: number }
>;

export function computeDomainStats(attempts: AttemptLike[]): DomainStats {
  const stats = Object.keys(DOMAIN_WEIGHTS).reduce((acc, domain) => {
    acc[domain as DomainName] = { correct: 0, total: 0, accuracy: 0 };
    return acc;
  }, {} as DomainStats);

  for (const a of attempts) {
    if (!(a.domain in stats)) continue;
    stats[a.domain].total += 1;
    stats[a.domain].correct += a.correct ? 1 : 0;
  }

  for (const domain of Object.keys(stats) as DomainName[]) {
    const entry = stats[domain];
    entry.accuracy = entry.total > 0 ? entry.correct / entry.total : 0;
  }

  return stats;
}

export function computeWeightedAccuracy(stats: DomainStats): number {
  let total = 0;
  for (const domain of Object.keys(DOMAIN_WEIGHTS) as DomainName[]) {
    total += stats[domain].accuracy * DOMAIN_WEIGHTS[domain];
  }
  return Math.max(0, Math.min(1, total));
}

export function estimateScaledScore(weightedAccuracy: number): number {
  const clamped = Math.max(0, Math.min(1, weightedAccuracy));
  const score = Math.round(100 + clamped * 900);
  return Math.max(100, Math.min(1000, score));
}

export function estimatePassProbability(score: number): number {
  const pct = (score - 500) / 300;
  return Math.max(0, Math.min(1, pct));
}

export function readinessPercentFromScore(score: number): number {
  const pct = score / 700;
  return Math.round(Math.max(0, Math.min(1, pct)) * 100);
}

