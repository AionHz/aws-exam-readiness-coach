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
  explanation: string;
  coaching: string;
  whyWrong?: Partial<Record<ChoiceId, string>>;
};

type ServiceFact = {
  name: string;
  whatItDoes: string;
  bestFor: string[];
  notFor: string[];
  whyPeoplePick?: string; // <-- psychology layer
};

const SERVICE_FACTS: Record<string, ServiceFact> = {
  "AWS Budgets": {
    name: "AWS Budgets",
    whatItDoes: "Sets cost/usage budgets and sends alerts when thresholds are exceeded.",
    bestFor: ["budget thresholds", "cost/usage alerts", "forecast alerts"],
    notFor: ["auditing API calls", "security filtering", "log analytics"],
    whyPeoplePick: "Because it’s the only core service focused on thresholds + alerting for spend.",
  },
  "AWS Cost Explorer": {
    name: "AWS Cost Explorer",
    whatItDoes: "Analyzes historical spend with filtering, grouping, and forecasting.",
    bestFor: ["cost analysis", "spend trends", "forecasting"],
    notFor: ["budget alerts (Budgets does that)", "security protection", "auditing API calls"],
    whyPeoplePick: "Because it’s the primary ‘where is my money going?’ tool.",
  },
  "AWS Trusted Advisor": {
    name: "AWS Trusted Advisor",
    whatItDoes:
      "Best-practice checks across cost optimization, security, performance, fault tolerance, and service limits.",
    bestFor: ["recommendations", "cost optimization checks", "service limits checks"],
    notFor: ["budget thresholds", "detailed billing reports", "auditing API calls"],
    whyPeoplePick: "Because it literally provides recommendations, including cost optimization.",
  },
  "AWS Organizations": {
    name: "AWS Organizations",
    whatItDoes: "Central governance for multiple accounts (SCPs, consolidated billing, account management).",
    bestFor: ["multi-account governance", "SCP guardrails", "consolidated billing"],
    notFor: ["cost charts", "budget alerts", "auditing API calls"],
    whyPeoplePick: "Because consolidated billing is a big cost topic, but it’s governance—not alerting.",
  },
  "AWS CloudTrail": {
    name: "AWS CloudTrail",
    whatItDoes: "Records AWS API calls and account activity for auditing and investigations.",
    bestFor: ["auditing", "API history", "security investigations"],
    notFor: ["budget thresholds", "web filtering", "cost forecasting"],
    whyPeoplePick: "Because it’s the default ‘tracking’ service—people confuse tracking activity with tracking spend.",
  },
  "Amazon CloudWatch": {
    name: "Amazon CloudWatch",
    whatItDoes: "Operational monitoring with metrics, logs, dashboards, and alarms.",
    bestFor: ["monitoring", "metrics/alarms", "log collection"],
    notFor: ["budget thresholds", "auditing API calls"],
    whyPeoplePick: "Because it has alarms—candidates assume alarms = cost alerts (they’re not).",
  },
  "AWS WAF": {
    name: "AWS WAF",
    whatItDoes: "Web application firewall that filters/blocks HTTP(S) requests using rules.",
    bestFor: ["L7 web filtering", "SQLi/XSS protections", "bot rules"],
    notFor: ["cost alerts", "auditing API calls"],
    whyPeoplePick: "Because security services often appear as plausible distractors in non-security questions.",
  },
};

type PromptIntent = { match: RegExp; intent: string; expected?: string[] };

const PROMPT_INTENTS: PromptIntent[] = [
  {
    match: /\bbudget\b|\bthreshold\b|\balert\b|\bcost exceeds\b|\bforecast\b/i,
    intent: "cost alerts / budgets",
    expected: ["AWS Budgets"],
  },
  {
    match: /\bspend\b|\bcost over time\b|\bhistorical\b|\banaly(z|s)e\b|\bforecasting\b/i,
    intent: "cost analysis / reporting",
    expected: ["AWS Cost Explorer"],
  },
  {
    match: /\brecommendations\b|\bbest practice\b|\boptimi(z|s)e\b|\bimprove performance\b/i,
    intent: "best-practice recommendations",
    expected: ["AWS Trusted Advisor"],
  },
  {
    match: /\baudit\b|\bapi calls\b|\bwho did what\b|\bgovernance\b/i,
    intent: "auditing / API history",
    expected: ["AWS CloudTrail"],
  },
];

type ExamTrap = { match: RegExp; trap: string };

const EXAM_TRAPS: ExamTrap[] = [
  {
    match: /\bcloudwatch\b|\bmetrics\b|\blogs?\b|\balarm\b/i,
    trap: "Monitoring alarms ≠ billing alerts. CloudWatch alarms are operational signals, not cost guardrails.",
  },
  {
    match: /\bcloudtrail\b|\baudit\b|\bapi\b/i,
    trap: "Auditing answers ‘who did what’—not ‘how much did it cost’.",
  },
  {
    match: /\bwaf\b|\bfirewall\b|\battack\b|\bxss\b|\bsqli\b/i,
    trap: "Security controls are common distractors in cost questions.",
  },
];

function getChoiceText(q: Question, id: ChoiceId) {
  return q.choices.find((c) => c.id === id)?.text ?? "";
}

function findServiceFact(choiceText: string): ServiceFact | null {
  if (SERVICE_FACTS[choiceText]) return SERVICE_FACTS[choiceText];
  const normalized = choiceText.toLowerCase();
  const key = Object.keys(SERVICE_FACTS).find((k) => normalized.includes(k.toLowerCase()));
  return key ? SERVICE_FACTS[key] : null;
}

function inferIntent(prompt: string): PromptIntent | null {
  for (const r of PROMPT_INTENTS) if (r.match.test(prompt)) return r;
  return null;
}

function inferTrap(choiceText: string): string | null {
  const t = EXAM_TRAPS.find((x) => x.match.test(choiceText));
  return t ? t.trap : null;
}

/**
 * Returns a high-quality explanation for why a particular selected option is wrong.
 * Works for ALL questions, but gets even better when SERVICE_FACTS contains the option.
 */
export function fallbackWhyWrong(q: Question, id: ChoiceId) {
  // 1) Best: explicit per-choice explanation
  const specific = q.whyWrong?.[id];
  if (specific) return specific;

  const choiceText = getChoiceText(q, id);
  const correctId = q.answerId;
  const correctText = getChoiceText(q, correctId);

  const wrongFact = findServiceFact(choiceText);
  const correctFact = findServiceFact(correctText);
  const intent = inferIntent(q.prompt);
  const trap = inferTrap(choiceText);

  const parts: string[] = [];

  // A) Anchor what the wrong option actually is
  if (wrongFact) {
    parts.push(`"${wrongFact.name}" is mainly for ${wrongFact.bestFor.join(", ")}.`);
    if (wrongFact.whyPeoplePick) {
      parts.push(`Why people pick it: ${wrongFact.whyPeoplePick}`);
    }
  } else {
    parts.push(`This option sounds plausible, but it doesn’t match the requirement as directly as the correct answer.`);
  }

  // B) What the prompt is REALLY testing
  if (intent) {
    parts.push(`What the prompt is testing: ${intent.intent}.`);
    if (intent.expected?.length) parts.push(`Exam pattern: this usually maps to ${intent.expected.join(", ")}.`);
  }

  // C) Exam trap (optional)
  if (trap) parts.push(`Exam trap: ${trap}`);

  // D) Why correct is correct
  if (correctFact) {
    parts.push(`Correct (${correctId}) is "${correctFact.name}": ${correctFact.whatItDoes}`);
  } else if (q.explanation) {
    parts.push(`Correct (${correctId}) works because: ${q.explanation}`);
  } else {
    parts.push(`Correct answer is ${correctId} ("${correctText}").`);
  }

  // E) Difficulty-aware “depth”
  if (q.difficulty === "Hard") {
    parts.push(
      "Hard-mode note: This is a distinction question—multiple services are relevant, but only one satisfies the constraint with the least assumptions."
    );
  }

  parts.push(`Memory hook: ${getCoaching(q)}`);
  return parts.filter(Boolean).join(" ");
}
/**
 * Returns a coaching "exam tip" string.
 * Uses q.coaching if it's already good; otherwise generates a smarter fallback.
 */
export function getCoaching(q: Question) {
    // If you wrote a good one in the bank, keep it
    if (q.coaching && q.coaching.trim().length >= 30) return q.coaching;
  
    const p = q.prompt.toLowerCase();
  
    if (/\bbudget\b|\bthreshold\b|\bcost\b|\bspend\b|\bforecast\b/.test(p)) {
      return "Exam pattern: budgets/thresholds/alerts → AWS Budgets (alerts). Cost trends/forecasting charts → Cost Explorer (analysis). Choose based on whether the prompt asks for alerting vs analysis.";
    }
  
    if (/\brecommendations\b|\bbest practice\b|\boptimi(z|s)e\b|\bimprove performance\b/.test(p)) {
      return "Exam pattern: ‘recommendations’ + cost/performance/security checks usually points to Trusted Advisor (best-practice checks).";
    }
  
    if (/\baudit\b|\bapi\b|\bwho did\b|\binvestigation\b|\bgovernance\b/.test(p)) {
      return "Exam pattern: ‘who did what/when’ → CloudTrail (API history). CloudWatch is monitoring/metrics, not API auditing.";
    }
  
    if (/\bcompliance\b|\bdrift\b|\bconfiguration\b|\brule\b/.test(p)) {
      return "Exam pattern: compliance/config history/drift → AWS Config (resource timeline + rules).";
    }
  
    if (/\battack\b|\bthreat\b|\bmalicious\b|\bfindings\b/.test(p)) {
      return "Exam pattern: threat detection keywords → GuardDuty. Vulnerability/CVE scanning → Inspector. WAF is web request filtering.";
    }
  
    return "Exam tip: identify the intent keyword (alerts vs analysis vs audit vs compliance vs recommendations). Pick the service built specifically for that intent.";
  }