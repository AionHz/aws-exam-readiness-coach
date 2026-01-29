export type BadgeId =
  | "FIRST_STEPS"
  | "STREAK_5"
  | "ACCURACY_70"
  | "DOMAIN_MASTER"
  | "REVIEW_CLEAN";

export const BADGES: {
  id: BadgeId;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "FIRST_STEPS",
    title: "First Steps",
    description: "Record your first attempt.",
    icon: "✨",
  },
  {
    id: "STREAK_5",
    title: "Streak 5",
    description: "Reach a 5-question correct streak.",
    icon: "🔥",
  },
  {
    id: "ACCURACY_70",
    title: "Accuracy 70%",
    description: "Score 70%+ with at least 20 attempts.",
    icon: "🎯",
  },
  {
    id: "DOMAIN_MASTER",
    title: "Domain Master",
    description: "80%+ in any domain (10+ attempts).",
    icon: "🏅",
  },
  {
    id: "REVIEW_CLEAN",
    title: "Clean Slate",
    description: "Clear your missed list after 10 attempts.",
    icon: "✅",
  },
];

type StoredProgressLike = {
  attemptsTotal: number;
  correctTotal: number;
  streakCorrect: number;
  byDomain: Record<string, { attempts: number; correct: number }>;
};

const QUIZ_MISSED_KEY = "aws-exam-readiness-quiz-missed-v1";

export function computeUnlockedBadges(progress: StoredProgressLike): BadgeId[] {
  const unlocked = new Set<BadgeId>();
  const attempts = Number(progress.attemptsTotal ?? 0);
  const correct = Number(progress.correctTotal ?? 0);
  const streak = Number(progress.streakCorrect ?? 0);

  if (attempts >= 1) unlocked.add("FIRST_STEPS");
  if (streak >= 5) unlocked.add("STREAK_5");

  if (attempts >= 20) {
    const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;
    if (accuracy >= 70) unlocked.add("ACCURACY_70");
  }

  for (const v of Object.values(progress.byDomain ?? {})) {
    const domainAttempts = Number(v?.attempts ?? 0);
    if (domainAttempts < 10) continue;
    const domainCorrect = Number(v?.correct ?? 0);
    const domainAcc = domainAttempts > 0 ? (domainCorrect / domainAttempts) * 100 : 0;
    if (domainAcc >= 80) {
      unlocked.add("DOMAIN_MASTER");
      break;
    }
  }

  if (attempts >= 10) {
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(QUIZ_MISSED_KEY);
        const parsed = raw ? (JSON.parse(raw) as string[]) : [];
        if (Array.isArray(parsed) && parsed.length === 0) {
          unlocked.add("REVIEW_CLEAN");
        }
      }
    } catch {
      // ignore
    }
  }

  return Array.from(unlocked);
}
