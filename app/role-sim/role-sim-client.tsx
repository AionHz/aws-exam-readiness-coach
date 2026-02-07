"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SurfaceShell from "../components/SurfaceShell";
import { PremiumButton } from "../components/PremiumButton";
import { cardBase, cardHover, linkReset } from "../lib/ui";

type MetricKey = "reliability" | "security" | "cost" | "communication";
type ShiftRoleId = "cloud-support-associate";

type DecisionImpact = Record<MetricKey, number>;

type StepOption = {
  id: string;
  label: string;
  action: string;
  services: string[];
  examTie: string;
  coaching: string;
  isBest: boolean;
  impact: DecisionImpact;
};

type RoleStep = {
  id: string;
  time: string;
  title: string;
  domain: "Cloud Concepts" | "Security" | "Technology" | "Billing & Pricing";
  context: string;
  objective: string;
  options: StepOption[];
};

const ROLE_LABELS: Record<ShiftRoleId, string> = {
  "cloud-support-associate": "Cloud Support Associate (Entry-Level)",
};

const SHIFT_STEPS: RoleStep[] = [
  {
    id: "triage",
    time: "09:00",
    title: "Morning Triage",
    domain: "Technology",
    context:
      "CloudWatch shows elevated API latency in one region. Product asks if this is customer-visible.",
    objective: "Stabilize signal quality and establish incident context in the first 10 minutes.",
    options: [
      {
        id: "triage-a",
        label: "Correlate alarms and health checks before acting",
        action:
          "Check CloudWatch metrics, ALB target health, and Route 53 health checks. Open an incident channel with a clear summary.",
        services: ["CloudWatch", "ALB", "Route 53"],
        examTie: "Monitoring + high availability decision flow under pressure.",
        coaching:
          "Strong start. You validated blast radius first, then communicated quickly. This avoids random fixes and preserves uptime.",
        isBest: true,
        impact: { reliability: 2, security: 0, cost: 0, communication: 2 },
      },
      {
        id: "triage-b",
        label: "Restart compute fleet immediately",
        action: "Force restart app instances before checking metrics to quickly clear possible stale state.",
        services: ["EC2", "Auto Scaling"],
        examTie: "Reactive changes without diagnosis can amplify outages.",
        coaching:
          "Risky. Restarting first can hide root cause, cause cold starts, and create avoidable customer impact.",
        isBest: false,
        impact: { reliability: -2, security: 0, cost: -1, communication: -1 },
      },
      {
        id: "triage-c",
        label: "Wait for more data",
        action: "Do nothing for 30 minutes to avoid overreacting.",
        services: ["CloudWatch"],
        examTie: "Delayed response hurts MTTD/MTTR.",
        coaching:
          "Too passive for active degradation. Controlled verification is good, but waiting without communication creates risk.",
        isBest: false,
        impact: { reliability: -2, security: 0, cost: 0, communication: -2 },
      },
    ],
  },
  {
    id: "iam-request",
    time: "10:15",
    title: "Urgent Access Request",
    domain: "Security",
    context: "A developer needs temporary production access to inspect a failed deployment.",
    objective: "Grant access safely while preserving auditability and least privilege.",
    options: [
      {
        id: "iam-a",
        label: "Create temporary least-privilege role",
        action:
          "Grant scoped IAM role with session duration and MFA requirement, then log ticket reference in the change record.",
        services: ["IAM", "CloudTrail"],
        examTie: "Least privilege, temporary access, and auditable change control.",
        coaching:
          "Correct. You enabled delivery speed without sacrificing principle-of-least-privilege or traceability.",
        isBest: true,
        impact: { reliability: 1, security: 3, cost: 0, communication: 1 },
      },
      {
        id: "iam-b",
        label: "Share admin credentials",
        action: "Send a shared admin account password so they can move fast.",
        services: ["IAM"],
        examTie: "Violates IAM best practices and accountability.",
        coaching:
          "Critical anti-pattern. Shared credentials remove accountability and create high security risk.",
        isBest: false,
        impact: { reliability: -1, security: -4, cost: 0, communication: -1 },
      },
      {
        id: "iam-c",
        label: "Attach AdministratorAccess for one day",
        action: "Give broad access temporarily, plan to remove it tomorrow.",
        services: ["IAM"],
        examTie: "Overprivileged access is still a security gap even if temporary.",
        coaching:
          "Too broad. Better than shared credentials, but still violates least privilege and increases blast radius.",
        isBest: false,
        impact: { reliability: 0, security: -2, cost: 0, communication: 0 },
      },
    ],
  },
  {
    id: "cost-spike",
    time: "11:30",
    title: "Unexpected Cost Spike",
    domain: "Billing & Pricing",
    context: "Daily cost anomaly alert triggers after traffic increase and scaling events.",
    objective: "Find cause and reduce waste without harming reliability.",
    options: [
      {
        id: "cost-a",
        label: "Investigate by tag and service first",
        action:
          "Use Cost Explorer + usage reports by tag/service. Identify top drivers, then rightsize non-critical workloads.",
        services: ["Cost Explorer", "Budgets", "Compute Optimizer"],
        examTie: "Cost governance starts with attribution before optimization.",
        coaching:
          "Correct process. You diagnosed spend sources before action, which prevents cutting critical capacity blindly.",
        isBest: true,
        impact: { reliability: 1, security: 0, cost: 3, communication: 1 },
      },
      {
        id: "cost-b",
        label: "Buy Savings Plan immediately",
        action: "Commit spend right away to lower rates before confirming demand pattern.",
        services: ["Savings Plans"],
        examTie: "Commitment tools require stable baseline; premature commitments can waste budget.",
        coaching:
          "Premature. Savings Plans are powerful, but only after stable utilization analysis.",
        isBest: false,
        impact: { reliability: 0, security: 0, cost: -2, communication: 0 },
      },
      {
        id: "cost-c",
        label: "Ignore until month end",
        action: "Wait for finance review in the monthly meeting.",
        services: ["Budgets"],
        examTie: "Delayed response increases avoidable spend.",
        coaching:
          "Too late. Anomaly alerts exist so you can react during the spike, not weeks later.",
        isBest: false,
        impact: { reliability: 0, security: 0, cost: -3, communication: -1 },
      },
    ],
  },
  {
    id: "release",
    time: "13:15",
    title: "Midday Release Decision",
    domain: "Technology",
    context: "A hotfix is ready. PM asks for immediate production deployment.",
    objective: "Ship safely with rollback confidence.",
    options: [
      {
        id: "release-a",
        label: "Use staged deployment with rollback",
        action:
          "Deploy canary/blue-green, monitor health metrics, and set rollback trigger thresholds before full traffic cutover.",
        services: ["CodeDeploy", "CloudWatch", "ALB"],
        examTie: "Controlled rollout + health alarms protect availability.",
        coaching:
          "Best choice. Progressive exposure lowers risk and gives clear rollback conditions.",
        isBest: true,
        impact: { reliability: 3, security: 0, cost: 0, communication: 1 },
      },
      {
        id: "release-b",
        label: "Direct full production push",
        action: "Deploy to all targets at once to reduce release time.",
        services: ["EC2", "ALB"],
        examTie: "Big-bang deploys increase blast radius.",
        coaching:
          "Fast but fragile. Without staged validation, failures can affect all users instantly.",
        isBest: false,
        impact: { reliability: -3, security: 0, cost: 0, communication: -1 },
      },
      {
        id: "release-c",
        label: "Freeze all changes for one week",
        action: "Block deployment entirely regardless of severity.",
        services: ["Change Management"],
        examTie: "Over-conservative posture can prolong production issues.",
        coaching:
          "Safer than risky release, but too rigid for urgent fixes. Balanced rollout is better.",
        isBest: false,
        impact: { reliability: -1, security: 0, cost: -1, communication: -1 },
      },
    ],
  },
  {
    id: "data-resilience",
    time: "14:25",
    title: "Data Protection Check",
    domain: "Security",
    context: "Audit asks if critical data recovery objectives are currently covered.",
    objective: "Validate backup durability and recovery posture.",
    options: [
      {
        id: "data-a",
        label: "Verify managed backups + encryption posture",
        action:
          "Confirm RDS backups/snapshot retention, S3 versioning + lifecycle, and KMS key policy coverage.",
        services: ["RDS", "S3", "KMS"],
        examTie: "Durability, recovery planning, and encryption governance.",
        coaching:
          "Correct. You validated both recovery and encryption controls with managed services.",
        isBest: true,
        impact: { reliability: 2, security: 3, cost: 0, communication: 1 },
      },
      {
        id: "data-b",
        label: "Export manually to local machine",
        action: "Run ad-hoc dumps to a laptop for emergency backup.",
        services: ["RDS"],
        examTie: "Manual local backup is brittle and insecure.",
        coaching:
          "Not production-grade. Local backups weaken security and reliability.",
        isBest: false,
        impact: { reliability: -2, security: -3, cost: 0, communication: -1 },
      },
      {
        id: "data-c",
        label: "Disable backups to save cost",
        action: "Reduce backup retention to near zero for cost control.",
        services: ["RDS", "S3"],
        examTie: "Cost optimization must not remove core resilience controls.",
        coaching:
          "High-risk tradeoff. Savings are not worth catastrophic recovery gaps.",
        isBest: false,
        impact: { reliability: -4, security: -1, cost: 1, communication: -1 },
      },
    ],
  },
  {
    id: "private-connectivity",
    time: "15:20",
    title: "Private Service Access",
    domain: "Security",
    context: "Internal service needs private access to AWS services without internet exposure.",
    objective: "Enable secure private connectivity pattern.",
    options: [
      {
        id: "network-a",
        label: "Use VPC endpoints + least-privilege policies",
        action:
          "Create interface/gateway endpoints, tighten endpoint policy, and keep traffic off public internet.",
        services: ["VPC Endpoints", "Security Groups", "IAM Policies"],
        examTie: "PrivateLink and endpoint policies for secure private service access.",
        coaching:
          "Correct architecture. This reduces exposure while preserving service connectivity.",
        isBest: true,
        impact: { reliability: 1, security: 3, cost: 0, communication: 1 },
      },
      {
        id: "network-b",
        label: "Open public ingress broadly",
        action: "Allow 0.0.0.0/0 quickly and restrict later.",
        services: ["Security Groups"],
        examTie: "Overly permissive network rules are a common security failure.",
        coaching:
          "Dangerous shortcut. Broad ingress creates unnecessary external attack surface.",
        isBest: false,
        impact: { reliability: 0, security: -4, cost: 0, communication: -1 },
      },
      {
        id: "network-c",
        label: "Tunnel through a personal VPN",
        action: "Use temporary personal tooling until infra catches up.",
        services: ["VPN"],
        examTie: "Unmanaged paths reduce governance and observability.",
        coaching:
          "Not enterprise-safe. Temporary unmanaged tunnels break standard controls.",
        isBest: false,
        impact: { reliability: -1, security: -3, cost: 0, communication: -1 },
      },
    ],
  },
  {
    id: "stakeholder-update",
    time: "16:10",
    title: "Stakeholder Update",
    domain: "Cloud Concepts",
    context: "Leadership asks for a plain-language status update on today’s reliability and risk.",
    objective: "Communicate clearly with business stakeholders and engineers.",
    options: [
      {
        id: "status-a",
        label: "Send concise impact + mitigation update",
        action:
          "Provide impact summary, current state, mitigation steps, ETA, and next update time.",
        services: ["Incident Runbook"],
        examTie: "Clear communication is operationally critical in cloud environments.",
        coaching:
          "Best practice. Decision clarity and update cadence build trust and reduce escalation noise.",
        isBest: true,
        impact: { reliability: 1, security: 0, cost: 0, communication: 3 },
      },
      {
        id: "status-b",
        label: "Wait for complete root cause first",
        action: "Delay all communication until the issue is fully solved.",
        services: ["Incident Process"],
        examTie: "Delayed comms can worsen stakeholder response during incidents.",
        coaching:
          "Too slow. Interim updates are expected even before final root cause is known.",
        isBest: false,
        impact: { reliability: 0, security: 0, cost: 0, communication: -3 },
      },
      {
        id: "status-c",
        label: "Share raw technical logs only",
        action: "Post detailed logs without a summary.",
        services: ["CloudWatch Logs"],
        examTie: "Different audiences need tailored communication.",
        coaching:
          "Technically rich but operationally weak. Stakeholders need decisions and impact, not raw logs.",
        isBest: false,
        impact: { reliability: 0, security: 0, cost: 0, communication: -2 },
      },
    ],
  },
  {
    id: "handoff",
    time: "17:30",
    title: "End-of-Day Handoff",
    domain: "Cloud Concepts",
    context: "Shift is ending. Night support team needs continuity and open-risk context.",
    objective: "Leave a clean handoff with traceable action items.",
    options: [
      {
        id: "handoff-a",
        label: "Document, assign, and hand off clearly",
        action:
          "Update ticket timeline, known risks, rollback state, and explicit next actions for the incoming shift.",
        services: ["Ticketing", "Runbooks", "CloudTrail"],
        examTie: "Operational excellence includes repeatable handoffs and documentation.",
        coaching:
          "Excellent close. Good handoff quality prevents overnight incidents and duplicated effort.",
        isBest: true,
        impact: { reliability: 2, security: 1, cost: 0, communication: 3 },
      },
      {
        id: "handoff-b",
        label: "Close tickets without notes",
        action: "Mark everything resolved and go offline.",
        services: ["Ticketing"],
        examTie: "Missing audit trail and context harms continuity.",
        coaching:
          "Poor operational hygiene. Future responders lose context and risk grows.",
        isBest: false,
        impact: { reliability: -2, security: -1, cost: 0, communication: -4 },
      },
      {
        id: "handoff-c",
        label: "Keep notes privately",
        action: "Store details in personal notes, not shared systems.",
        services: ["Personal Docs"],
        examTie: "Knowledge silos are a reliability and governance risk.",
        coaching:
          "Not scalable. Shared systems are required for team continuity and compliance.",
        isBest: false,
        impact: { reliability: -1, security: -1, cost: 0, communication: -3 },
      },
    ],
  },
];

const METRIC_LABELS: Record<MetricKey, string> = {
  reliability: "Reliability",
  security: "Security",
  cost: "Cost Control",
  communication: "Communication",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getMetricTone(value: number): string {
  if (value >= 85) return "bg-emerald-300";
  if (value >= 70) return "bg-sky-300";
  if (value >= 55) return "bg-indigo-300";
  return "bg-rose-300";
}

export default function RoleSimClient() {
  const [roleId] = useState<ShiftRoleId>("cloud-support-associate");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const activeStep = SHIFT_STEPS[activeStepIndex];
  const selectedOptionId = answers[activeStep.id];
  const selectedOption = activeStep.options.find((option) => option.id === selectedOptionId) ?? null;

  const answeredCount = Object.keys(answers).length;
  const bestSelections = SHIFT_STEPS.reduce((sum, step) => {
    const chosenId = answers[step.id];
    if (!chosenId) return sum;
    const option = step.options.find((item) => item.id === chosenId);
    return option?.isBest ? sum + 1 : sum;
  }, 0);
  const decisionQuality = answeredCount === 0 ? 0 : Math.round((bestSelections / answeredCount) * 100);

  const metricScores = useMemo(() => {
    const base: Record<MetricKey, number> = {
      reliability: 55,
      security: 55,
      cost: 55,
      communication: 55,
    };

    SHIFT_STEPS.forEach((step) => {
      const selected = step.options.find((option) => option.id === answers[step.id]);
      if (!selected) return;
      (Object.keys(base) as MetricKey[]).forEach((metric) => {
        base[metric] = clamp(base[metric] + selected.impact[metric] * 5, 10, 100);
      });
    });

    return base;
  }, [answers]);

  const overallReadiness = useMemo(() => {
    const metricAvg = Math.round(
      ((metricScores.reliability + metricScores.security + metricScores.cost + metricScores.communication) / 4)
    );
    return Math.round(metricAvg * 0.6 + decisionQuality * 0.4);
  }, [metricScores, decisionQuality]);

  const dayVerdict =
    overallReadiness >= 85
      ? "Strong shift execution. You handled cloud operations with reliable judgment."
      : overallReadiness >= 70
        ? "Solid performance with a few risky decisions to tighten."
        : overallReadiness >= 55
          ? "Baseline operational awareness is forming, but decision quality needs improvement."
          : "High-risk shift outcome. Revisit runbooks and exam cues before advancing.";

  const timelineItems = SHIFT_STEPS.map((step, index) => {
    const chosen = answers[step.id];
    const selected = step.options.find((option) => option.id === chosen);
    const state = index === activeStepIndex ? "active" : chosen ? "done" : "pending";
    return { step, index, selected, state };
  });

  const recentEvents = SHIFT_STEPS.flatMap((step) => {
    const selected = step.options.find((option) => option.id === answers[step.id]);
    if (!selected) return [];
    return [
      {
        id: `${step.id}-${selected.id}`,
        text: `${step.time} • ${step.title}: ${selected.isBest ? "optimal decision" : "suboptimal decision"} (${selected.label}).`,
      },
    ];
  }).slice(-6);

  function selectOption(optionId: string) {
    setAnswers((prev) => ({ ...prev, [activeStep.id]: optionId }));
  }

  function resetDay() {
    setAnswers({});
    setActiveStepIndex(0);
  }

  function nextStep() {
    setActiveStepIndex((prev) => clamp(prev + 1, 0, SHIFT_STEPS.length - 1));
  }

  function prevStep() {
    setActiveStepIndex((prev) => clamp(prev - 1, 0, SHIFT_STEPS.length - 1));
  }

  return (
    <SurfaceShell variant="hero">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        <section
          className={`relative overflow-hidden rounded-3xl border border-white/15 bg-[linear-gradient(145deg,rgba(7,12,26,0.9),rgba(9,24,41,0.82))] p-6 shadow-[0_28px_64px_rgba(3,8,20,0.48)] md:p-8 ${cardHover}`}
        >
          <div className="absolute inset-0 opacity-45 [background:radial-gradient(circle_at_12%_20%,rgba(125,211,252,0.2),transparent_40%),radial-gradient(circle_at_85%_82%,rgba(129,140,248,0.2),transparent_44%)]" />
          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100">
              Job Role Simulation
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Day-in-the-Life: {ROLE_LABELS[roleId]}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75 md:text-base">
              Simulate a full shift from first alert to end-of-day handoff. Every decision updates
              reliability, security, cost, and communication outcomes.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/quiz" className={linkReset}>
                <PremiumButton variant="indigo" size="sm">
                  Practice Questions
                </PremiumButton>
              </Link>
              <Link href="/hands-on" className={linkReset}>
                <PremiumButton variant="neutral" size="sm">
                  Open Hands-on
                </PremiumButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-5`}>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Shift Timeline</div>
            <div className="mt-4 space-y-2">
              {timelineItems.map(({ step, index, selected, state }) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStepIndex(index)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    state === "active"
                      ? "border-sky-300/60 bg-sky-400/15"
                      : state === "done"
                        ? "border-emerald-300/35 bg-emerald-400/10"
                        : "border-white/10 bg-black/35 hover:border-sky-300/35"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">{step.time}</div>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        state === "active"
                          ? "bg-sky-300"
                          : state === "done"
                            ? selected?.isBest
                              ? "bg-emerald-300"
                              : "bg-amber-300"
                            : "bg-white/25"
                      }`}
                    />
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">{step.title}</div>
                  <div className="mt-1 text-[11px] text-white/55">{step.domain}</div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-3">
              <div className="text-[11px] uppercase tracking-[0.08em] text-white/60">Shift completion</div>
              <div className="mt-1 text-sm font-semibold text-white">
                {answeredCount} / {SHIFT_STEPS.length} decisions
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-300 to-indigo-300 transition-all duration-300"
                  style={{ width: `${Math.round((answeredCount / SHIFT_STEPS.length) * 100)}%` }}
                />
              </div>
            </div>
          </aside>

          <section className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-200">
                  Step {activeStepIndex + 1} • {activeStep.time}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-white">{activeStep.title}</h2>
              </div>
              <div className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs text-white/75">
                {activeStep.domain}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/45 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Context</div>
              <p className="mt-1 text-sm text-white/80">{activeStep.context}</p>
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Objective</div>
              <p className="mt-1 text-sm text-white/80">{activeStep.objective}</p>
            </div>

            <div className="mt-4 space-y-3">
              {activeStep.options.map((option) => {
                const isSelected = selectedOption?.id === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(option.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? option.isBest
                          ? "border-emerald-300/70 bg-emerald-400/15"
                          : "border-amber-300/70 bg-amber-400/15"
                        : "border-white/10 bg-black/45 hover:border-sky-300/35 hover:bg-black/55"
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">{option.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-white/75">{option.action}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {option.services.map((service, index) => (
                        <span
                          key={`${option.id}-${service}-${index}`}
                          className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white/70"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedOption ? (
              <div
                className={`mt-4 rounded-xl border p-4 ${
                  selectedOption.isBest
                    ? "border-emerald-300/55 bg-emerald-400/10"
                    : "border-amber-300/55 bg-amber-400/10"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                  {selectedOption.isBest ? "Correct operational move" : "Needs adjustment"}
                </div>
                <p className="mt-1 text-sm text-white/85">{selectedOption.coaching}</p>
                <p className="mt-2 text-xs text-white/70">Exam tie-in: {selectedOption.examTie}</p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-black/30 px-4 py-3 text-xs text-white/65">
                Select an action to continue the workflow.
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <PremiumButton
                  variant="neutral"
                  size="sm"
                  onClick={prevStep}
                  disabled={activeStepIndex === 0}
                >
                  Previous
                </PremiumButton>
                <PremiumButton
                  variant="indigo"
                  size="sm"
                  onClick={nextStep}
                  disabled={activeStepIndex === SHIFT_STEPS.length - 1}
                >
                  Next Step
                </PremiumButton>
              </div>
              <PremiumButton variant="neutral" size="sm" onClick={resetDay}>
                Reset Shift
              </PremiumButton>
            </div>
          </section>

          <aside className="space-y-4">
            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Mission Score</div>
              <div className="mt-2 text-3xl font-semibold text-sky-200">{overallReadiness}/100</div>
              <p className="mt-1 text-xs leading-relaxed text-white/70">{dayVerdict}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="role-sim-scorebeam h-full rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-emerald-300"
                  style={{ width: `${overallReadiness}%` }}
                />
              </div>
              <div className="mt-3 text-xs text-white/65">Decision quality: {decisionQuality}%</div>
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Operational Metrics</div>
              <div className="mt-3 space-y-2.5">
                {(Object.keys(metricScores) as MetricKey[]).map((metric) => {
                  const value = metricScores[metric];
                  return (
                    <div key={metric}>
                      <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                        <span>{METRIC_LABELS[metric]}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getMetricTone(value)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Live Event Feed</div>
              <div className="mt-3 space-y-2">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-xs text-white/75"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-200">
                        Event {String(index + 1).padStart(2, "0")}
                      </div>
                      <p className="mt-1 leading-relaxed">{event.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-white/20 bg-black/35 px-3 py-3 text-xs text-white/60">
                    No events yet. Start making decisions.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>

      <style jsx>{`
        .role-sim-scorebeam {
          background-size: 180% 100%;
          animation: roleSimSweep 2.8s linear infinite;
        }

        @keyframes roleSimSweep {
          from {
            background-position: 0% 0%;
          }
          to {
            background-position: 180% 0%;
          }
        }
      `}</style>
    </SurfaceShell>
  );
}

