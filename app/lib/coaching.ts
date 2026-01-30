// app/lib/coaching.ts

export type Difficulty = "Easy" | "Medium" | "Hard";
export type ChoiceId = "A" | "B" | "C" | "D";

export type Choice = { id: ChoiceId; text: string };

export type Question = {
  id: string;
  domain: string;
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
  verified?: boolean;
};

/**
 * Returns a safe explanation for why a particular selected option is wrong.
 */
export function fallbackWhyWrong(q: Question, id: ChoiceId) {
  const generic =
    "This option doesn't align with the requirement. Re-read the stem and choose the option that most directly matches it.";

  if (q.verified !== true) {
    return `${generic} Tip: This explanation is not yet source-verified.`;
  }

  const specific = q.whyWrong?.[id];
  if (specific) return specific;

  return generic;
}
/**
 * Returns a coaching "exam tip" string.
 * Uses q.coaching if it's already good; otherwise generates a smarter fallback.
 */
export function getCoaching(q: Question) {
  if (q.coaching && q.coaching.trim().length > 0) return q.coaching;

  const concepts = (q.testedConcepts ?? [])
    .map((c) => c.trim())
    .filter(Boolean);
  const hasKbPlaceholder = concepts.some((c) =>
    c.toLowerCase().includes("not in knowledge base yet")
  );

  if (concepts.length > 0 && !hasKbPlaceholder) {
    const list = concepts.slice(0, 3).join(", ");
    return `Exam tip: focus on ${list}.`;
  }

  return "Exam tip: match the question's requirement to the closest AWS concept and eliminate mismatches.";
}
