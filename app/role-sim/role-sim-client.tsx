"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import SurfaceShell from "../components/SurfaceShell";
import { PremiumButton } from "../components/PremiumButton";
import { cardBase, cardHover, linkReset } from "../lib/ui";

type MetricKey = "reliability" | "security" | "cost" | "communication";
type SimMode = "story" | "arcade";
type CharacterId = "you" | "ava" | "rex" | "mina" | "kai";

type SlideOption = {
  id: string;
  label: string;
  action: string;
  result: string;
  tools: string[];
  isBest: boolean;
  xp: number;
  impact: Record<MetricKey, number>;
};

type StorySlide = {
  id: string;
  time: string;
  chapter: string;
  title: string;
  location: string;
  narrator: CharacterId;
  teammate: CharacterId;
  sceneText: string;
  prompt: string;
  options: SlideOption[];
};

type StoryDay = {
  id: string;
  label: string;
  subtitle: string;
  theme: string;
  slides: StorySlide[];
};

type CharacterPalette = {
  accent: string;
  skin: string;
  hair: string;
  jacket: string;
  shirt: string;
};

const METRIC_LABELS: Record<MetricKey, string> = {
  reliability: "Reliability",
  security: "Security",
  cost: "Cost Control",
  communication: "Communication",
};

const CHARACTER_LABELS: Record<CharacterId, { name: string; role: string }> = {
  you: { name: "You", role: "Cloud Support Associate" },
  ava: { name: "Ava", role: "Mentor / Team Lead" },
  rex: { name: "Rex", role: "SRE" },
  mina: { name: "Mina", role: "Security Engineer" },
  kai: { name: "Kai", role: "FinOps Analyst" },
};

const CHARACTER_PALETTES: Record<CharacterId, CharacterPalette> = {
  you: {
    accent: "#38bdf8",
    skin: "#f4c7a1",
    hair: "#1f2937",
    jacket: "#0f4c78",
    shirt: "#93c5fd",
  },
  ava: {
    accent: "#818cf8",
    skin: "#f2c19c",
    hair: "#312e81",
    jacket: "#4338ca",
    shirt: "#c4b5fd",
  },
  rex: {
    accent: "#22d3ee",
    skin: "#d9a77f",
    hair: "#0f172a",
    jacket: "#075985",
    shirt: "#67e8f9",
  },
  mina: {
    accent: "#34d399",
    skin: "#f1c6a8",
    hair: "#064e3b",
    jacket: "#065f46",
    shirt: "#6ee7b7",
  },
  kai: {
    accent: "#f59e0b",
    skin: "#eab08f",
    hair: "#7c2d12",
    jacket: "#9a3412",
    shirt: "#fdba74",
  },
};

const MODE_CONFIG: Record<SimMode, { label: string; timeLimit: number; multiplier: number; hint: string }> = {
  story: {
    label: "Story",
    timeLimit: 65,
    multiplier: 1,
    hint: "More time to read dialogue and learn decisions.",
  },
  arcade: {
    label: "Arcade",
    timeLimit: 34,
    multiplier: 1.35,
    hint: "Fast-paced mode with tighter decision windows.",
  },
};

const STORY_DAYS: StoryDay[] = [
  {
    id: "day-1",
    label: "Day 1",
    subtitle: "First Shift",
    theme: "Onboarding + triage fundamentals",
    slides: [
      {
        id: "d1-c1",
        time: "09:00",
        chapter: "Chapter 1",
        title: "Desk Power-On",
        location: "Support Floor",
        narrator: "ava",
        teammate: "you",
        sceneText:
          "Ava walks you to the desk wall. Alarms are quiet, but queue volume is rising. She asks how you start your shift.",
        prompt: "How do you begin your first morning to avoid blind spots?",
        options: [
          {
            id: "d1-c1-a",
            label: "Open dashboards + handoff notes first",
            action:
              "Review overnight handoff, CloudWatch health, and open tickets before touching infrastructure.",
            result:
              "You quickly identify two unresolved warnings and avoid duplicate work.",
            tools: ["CloudWatch", "Ticketing", "Runbook"],
            isBest: true,
            xp: 110,
            impact: { reliability: 2, security: 1, cost: 0, communication: 2 },
          },
          {
            id: "d1-c1-b",
            label: "Jump straight into random open ticket",
            action: "Pick the first ticket and begin remediation without context.",
            result:
              "You spend 20 minutes on a non-critical issue while a P2 queue item waits.",
            tools: ["Ticketing"],
            isBest: false,
            xp: 40,
            impact: { reliability: -2, security: 0, cost: -1, communication: -1 },
          },
          {
            id: "d1-c1-c",
            label: "Wait for someone to assign tasks",
            action: "Sit idle for updates from the team lead.",
            result: "No progress in the queue; response times start slipping.",
            tools: ["Slack"],
            isBest: false,
            xp: 25,
            impact: { reliability: -2, security: 0, cost: 0, communication: -2 },
          },
        ],
      },
      {
        id: "d1-c2",
        time: "10:20",
        chapter: "Chapter 2",
        title: "Latency Spike",
        location: "NOC Wallboard",
        narrator: "rex",
        teammate: "you",
        sceneText:
          "Rex points to a graph: p95 latency jumped in one AZ. Product team pings support asking if users are impacted.",
        prompt: "What is your first tactical move?",
        options: [
          {
            id: "d1-c2-a",
            label: "Correlate ALB health + app metrics + recent deploys",
            action:
              "Cross-check ALB target health, app latency, and deployment timeline before action.",
            result: "You isolate impact to one target group and avoid full fleet disruption.",
            tools: ["ALB", "CloudWatch", "CodeDeploy"],
            isBest: true,
            xp: 120,
            impact: { reliability: 3, security: 0, cost: 0, communication: 1 },
          },
          {
            id: "d1-c2-b",
            label: "Restart all instances immediately",
            action: "Force restart ASG instances to clear possible stale state.",
            result: "Cold starts worsen response times and increase user-facing errors briefly.",
            tools: ["EC2 ASG"],
            isBest: false,
            xp: 45,
            impact: { reliability: -3, security: 0, cost: -1, communication: -1 },
          },
          {
            id: "d1-c2-c",
            label: "Tell product team to wait",
            action: "Delay action until the next metrics refresh cycle.",
            result: "Delayed response increases incident duration and escalations.",
            tools: ["Incident Chat"],
            isBest: false,
            xp: 30,
            impact: { reliability: -2, security: 0, cost: 0, communication: -2 },
          },
        ],
      },
      {
        id: "d1-c3",
        time: "16:45",
        chapter: "Chapter 3",
        title: "End-of-Day Relay",
        location: "War Room",
        narrator: "ava",
        teammate: "you",
        sceneText:
          "Shift handoff starts in five minutes. Night support asks for open risks, rollback status, and next actions.",
        prompt: "How do you close the day?",
        options: [
          {
            id: "d1-c3-a",
            label: "Write concise handoff with owners + ETA",
            action:
              "Document timeline, unresolved risks, and explicit owners in ticket + channel.",
            result: "Night shift starts with clarity and no duplicate triage.",
            tools: ["Runbook", "Ticketing", "CloudTrail"],
            isBest: true,
            xp: 105,
            impact: { reliability: 2, security: 1, cost: 0, communication: 3 },
          },
          {
            id: "d1-c3-b",
            label: "Leave raw logs only",
            action: "Drop CloudWatch logs without summary context.",
            result: "Night shift spends extra time reconstructing intent and status.",
            tools: ["CloudWatch Logs"],
            isBest: false,
            xp: 35,
            impact: { reliability: -1, security: 0, cost: 0, communication: -3 },
          },
          {
            id: "d1-c3-c",
            label: "Close all tickets as resolved",
            action: "Mark unresolved items complete to clear dashboard noise.",
            result: "Critical context disappears and escalation risk rises overnight.",
            tools: ["Ticketing"],
            isBest: false,
            xp: 15,
            impact: { reliability: -2, security: -1, cost: 0, communication: -3 },
          },
        ],
      },
    ],
  },
  {
    id: "day-2",
    label: "Day 2",
    subtitle: "Release Day",
    theme: "Deployments + rollback decisions",
    slides: [
      {
        id: "d2-c1",
        time: "09:30",
        chapter: "Chapter 1",
        title: "Pre-Deploy Brief",
        location: "Release Bridge",
        narrator: "rex",
        teammate: "you",
        sceneText:
          "A feature launch is scheduled in one hour. Rex asks for a final readiness check before traffic moves.",
        prompt: "Which pre-deploy approach is strongest?",
        options: [
          {
            id: "d2-c1-a",
            label: "Validate alarms + rollback gates + error budgets",
            action:
              "Confirm alarms, rollback thresholds, and synthetic checks are healthy.",
            result: "Release starts with guardrails and clear abort conditions.",
            tools: ["CloudWatch", "CodeDeploy", "Synthetics"],
            isBest: true,
            xp: 110,
            impact: { reliability: 3, security: 0, cost: 0, communication: 1 },
          },
          {
            id: "d2-c1-b",
            label: "Deploy first, monitor later",
            action: "Skip checks to save time.",
            result: "Hidden risks pass to production without controlled detection.",
            tools: ["CodeDeploy"],
            isBest: false,
            xp: 35,
            impact: { reliability: -3, security: 0, cost: 0, communication: -1 },
          },
          {
            id: "d2-c1-c",
            label: "Request full one-day delay",
            action: "Delay regardless of current readiness signals.",
            result: "Avoids immediate risk but disrupts planned release cadence.",
            tools: ["Change Calendar"],
            isBest: false,
            xp: 45,
            impact: { reliability: -1, security: 0, cost: -1, communication: -1 },
          },
        ],
      },
      {
        id: "d2-c2",
        time: "12:40",
        chapter: "Chapter 2",
        title: "Canary Alarm",
        location: "Deployment Floor",
        narrator: "rex",
        teammate: "you",
        sceneText:
          "5% canary traffic shows a rising error pattern. PM asks to continue because launch window is tight.",
        prompt: "What is the right call?",
        options: [
          {
            id: "d2-c2-a",
            label: "Pause rollout and investigate canary failure",
            action:
              "Freeze rollout at low exposure, inspect logs/traces, then decide rollback vs fix-forward.",
            result: "You contain blast radius and preserve confidence in release process.",
            tools: ["CodeDeploy", "X-Ray", "CloudWatch Logs"],
            isBest: true,
            xp: 130,
            impact: { reliability: 3, security: 0, cost: 0, communication: 2 },
          },
          {
            id: "d2-c2-b",
            label: "Continue rollout to 100%",
            action: "Ignore canary anomalies to hit launch window.",
            result: "Errors multiply across full user population.",
            tools: ["CodeDeploy"],
            isBest: false,
            xp: 20,
            impact: { reliability: -4, security: 0, cost: -1, communication: -1 },
          },
          {
            id: "d2-c2-c",
            label: "Blind rollback without diagnostics",
            action: "Rollback instantly and stop analysis.",
            result: "Service stabilizes but root cause remains unknown.",
            tools: ["CodeDeploy"],
            isBest: false,
            xp: 55,
            impact: { reliability: 0, security: 0, cost: -1, communication: 0 },
          },
        ],
      },
      {
        id: "d2-c3",
        time: "17:05",
        chapter: "Chapter 3",
        title: "Post-Release Debrief",
        location: "Incident Channel",
        narrator: "ava",
        teammate: "you",
        sceneText:
          "Leadership asks for a plain-language summary: impact, mitigation, and what changes tomorrow.",
        prompt: "How do you report the day?",
        options: [
          {
            id: "d2-c3-a",
            label: "Summarize impact + decisions + next controls",
            action:
              "Share what happened, why actions were taken, and exact follow-up controls.",
            result: "Stakeholders trust the process and engineering gets actionable follow-ups.",
            tools: ["Incident Template", "Runbook"],
            isBest: true,
            xp: 100,
            impact: { reliability: 1, security: 1, cost: 0, communication: 3 },
          },
          {
            id: "d2-c3-b",
            label: "Share only technical stack traces",
            action: "Post raw logs and no summary.",
            result: "Engineering can parse it, business stakeholders cannot.",
            tools: ["CloudWatch Logs"],
            isBest: false,
            xp: 35,
            impact: { reliability: 0, security: 0, cost: 0, communication: -3 },
          },
          {
            id: "d2-c3-c",
            label: "Avoid report to reduce noise",
            action: "No structured follow-up, assume everyone understood events live.",
            result: "Knowledge gaps create repeated mistakes in the next release.",
            tools: ["Incident Chat"],
            isBest: false,
            xp: 15,
            impact: { reliability: -1, security: 0, cost: 0, communication: -4 },
          },
        ],
      },
    ],
  },
  {
    id: "day-3",
    label: "Day 3",
    subtitle: "Security + FinOps",
    theme: "Risk control + spend control",
    slides: [
      {
        id: "d3-c1",
        time: "10:05",
        chapter: "Chapter 1",
        title: "Cost Anomaly Ping",
        location: "FinOps Desk",
        narrator: "kai",
        teammate: "you",
        sceneText:
          "Daily spend anomaly jumps above expected range. Kai asks whether to commit to savings now or investigate first.",
        prompt: "What is the smarter move?",
        options: [
          {
            id: "d3-c1-a",
            label: "Break down spend by tag/service first",
            action:
              "Use Cost Explorer attribution and identify root drivers before optimization action.",
            result: "You isolate one oversized workload and reduce waste safely.",
            tools: ["Cost Explorer", "Budgets", "Tags"],
            isBest: true,
            xp: 120,
            impact: { reliability: 1, security: 0, cost: 3, communication: 1 },
          },
          {
            id: "d3-c1-b",
            label: "Purchase savings plan immediately",
            action: "Commit spend before confirming utilization baseline.",
            result: "Potential long-term savings, but risk of mismatch is high.",
            tools: ["Savings Plans"],
            isBest: false,
            xp: 45,
            impact: { reliability: 0, security: 0, cost: -2, communication: 0 },
          },
          {
            id: "d3-c1-c",
            label: "Ignore alert until monthly review",
            action: "Defer investigation for later.",
            result: "Uncontrolled waste continues for weeks.",
            tools: ["Budget Reports"],
            isBest: false,
            xp: 15,
            impact: { reliability: 0, security: 0, cost: -3, communication: -1 },
          },
        ],
      },
      {
        id: "d3-c2",
        time: "13:10",
        chapter: "Chapter 2",
        title: "Public Access Finding",
        location: "Security Pod",
        narrator: "mina",
        teammate: "you",
        sceneText:
          "Security scan flags a storage path with broad read permissions. Mina asks you to triage without downtime.",
        prompt: "Which action balances urgency and safety?",
        options: [
          {
            id: "d3-c2-a",
            label: "Restrict policy, verify access logs, notify owners",
            action:
              "Tighten bucket policy, confirm access patterns, and communicate remediation timeline.",
            result: "Exposure is reduced quickly and owners stay aligned.",
            tools: ["S3", "IAM Policy", "CloudTrail"],
            isBest: true,
            xp: 130,
            impact: { reliability: 1, security: 3, cost: 0, communication: 2 },
          },
          {
            id: "d3-c2-b",
            label: "Disable bucket entirely",
            action: "Block all access immediately without impact assessment.",
            result: "Security improves but production app dependencies fail.",
            tools: ["S3"],
            isBest: false,
            xp: 40,
            impact: { reliability: -3, security: 1, cost: 0, communication: -1 },
          },
          {
            id: "d3-c2-c",
            label: "Leave as-is, open ticket for later",
            action: "Create backlog item only.",
            result: "Risk remains exposed and audit pressure grows.",
            tools: ["Ticketing"],
            isBest: false,
            xp: 10,
            impact: { reliability: 0, security: -4, cost: 0, communication: -1 },
          },
        ],
      },
      {
        id: "d3-c3",
        time: "16:35",
        chapter: "Chapter 3",
        title: "Private Connectivity Request",
        location: "Network Console",
        narrator: "mina",
        teammate: "you",
        sceneText:
          "A service in private subnets needs AWS API access without traversing public internet.",
        prompt: "Choose the right architecture pattern.",
        options: [
          {
            id: "d3-c3-a",
            label: "Use VPC endpoints with scoped policies",
            action:
              "Implement gateway/interface endpoints and constrain with policy + SG rules.",
            result: "Traffic stays private and compliance checks pass.",
            tools: ["VPC Endpoint", "SG", "IAM Policy"],
            isBest: true,
            xp: 120,
            impact: { reliability: 1, security: 3, cost: 0, communication: 1 },
          },
          {
            id: "d3-c3-b",
            label: "Open outbound internet broadly",
            action: "Allow unrestricted egress as a quick fix.",
            result: "It works fast but creates avoidable security surface.",
            tools: ["NAT Gateway", "Security Group"],
            isBest: false,
            xp: 30,
            impact: { reliability: 0, security: -4, cost: -1, communication: -1 },
          },
          {
            id: "d3-c3-c",
            label: "Use personal tunnel temporarily",
            action: "Route traffic through unmanaged personal tooling.",
            result: "Noncompliant path with poor observability.",
            tools: ["VPN"],
            isBest: false,
            xp: 15,
            impact: { reliability: -1, security: -3, cost: 0, communication: -1 },
          },
        ],
      },
    ],
  },
  {
    id: "day-4",
    label: "Day 4",
    subtitle: "Incident Storm",
    theme: "Major incident command",
    slides: [
      {
        id: "d4-c1",
        time: "09:25",
        chapter: "Chapter 1",
        title: "Region Health Degradation",
        location: "Incident Command Bridge",
        narrator: "ava",
        teammate: "rex",
        sceneText:
          "Two availability zones degrade at once. Traffic is climbing and leadership has joined the incident channel.",
        prompt: "What is your first command action?",
        options: [
          {
            id: "d4-c1-a",
            label: "Declare incident + assign owner lanes",
            action:
              "Start incident protocol, assign comms/mitigation/investigation lanes, and set update cadence.",
            result: "The room becomes coordinated and MTTR starts dropping.",
            tools: ["Incident Runbook", "CloudWatch", "Route 53"],
            isBest: true,
            xp: 140,
            impact: { reliability: 3, security: 0, cost: 0, communication: 3 },
          },
          {
            id: "d4-c1-b",
            label: "Start remediating silently",
            action: "Begin technical changes without formal incident structure.",
            result: "People duplicate work and comms fall behind.",
            tools: ["EC2", "ALB"],
            isBest: false,
            xp: 40,
            impact: { reliability: -2, security: 0, cost: 0, communication: -3 },
          },
          {
            id: "d4-c1-c",
            label: "Wait for manager approval",
            action: "Delay incident declaration while requesting approvals.",
            result: "Response window slips during active impact.",
            tools: ["Chat"],
            isBest: false,
            xp: 15,
            impact: { reliability: -3, security: 0, cost: 0, communication: -2 },
          },
        ],
      },
      {
        id: "d4-c2",
        time: "12:05",
        chapter: "Chapter 2",
        title: "Queue Backlog Surge",
        location: "Compute Ops Panel",
        narrator: "rex",
        teammate: "you",
        sceneText:
          "Queue depth doubles and consumers lag. Users are retrying aggressively.",
        prompt: "How do you stabilize processing?",
        options: [
          {
            id: "d4-c2-a",
            label: "Scale consumers + protect with back-pressure",
            action:
              "Increase consumer capacity, set alarms, and tune concurrency with queue age thresholds.",
            result: "Backlog drains predictably and retries taper off.",
            tools: ["SQS", "Lambda/Fargate", "CloudWatch"],
            isBest: true,
            xp: 135,
            impact: { reliability: 3, security: 0, cost: -1, communication: 1 },
          },
          {
            id: "d4-c2-b",
            label: "Purge queue to clear pressure",
            action: "Delete pending backlog to recover quickly.",
            result: "Service appears recovered but data loss risk is severe.",
            tools: ["SQS"],
            isBest: false,
            xp: 5,
            impact: { reliability: -4, security: -1, cost: 0, communication: -2 },
          },
          {
            id: "d4-c2-c",
            label: "Do nothing until retries slow down",
            action: "Wait for natural traffic decay.",
            result: "Backlog worsens and downstream SLAs fail.",
            tools: ["CloudWatch"],
            isBest: false,
            xp: 15,
            impact: { reliability: -3, security: 0, cost: 0, communication: -1 },
          },
        ],
      },
      {
        id: "d4-c3",
        time: "17:40",
        chapter: "Chapter 3",
        title: "Final Briefing",
        location: "Executive Debrief Room",
        narrator: "ava",
        teammate: "you",
        sceneText:
          "You close the week with leadership. They want concise truth: impact, controls improved, and what prevents recurrence.",
        prompt: "How do you finish the story mode run?",
        options: [
          {
            id: "d4-c3-a",
            label: "Present impact, root causes, and concrete prevention plan",
            action:
              "Deliver concise summary with metrics, action owners, and time-bound improvements.",
            result: "Confidence is restored and roadmap items get approved.",
            tools: ["Postmortem", "SLO Report", "Action Tracker"],
            isBest: true,
            xp: 150,
            impact: { reliability: 2, security: 1, cost: 1, communication: 4 },
          },
          {
            id: "d4-c3-b",
            label: "Minimize details to avoid concern",
            action: "Share only positive points and omit unresolved risks.",
            result: "Short-term calm, long-term trust damage.",
            tools: ["Status Email"],
            isBest: false,
            xp: 25,
            impact: { reliability: -1, security: 0, cost: 0, communication: -4 },
          },
          {
            id: "d4-c3-c",
            label: "Send raw technical dumps",
            action: "Provide deep logs without decision summary.",
            result: "Data is rich but not executive-usable.",
            tools: ["Logs"],
            isBest: false,
            xp: 35,
            impact: { reliability: 0, security: 0, cost: 0, communication: -3 },
          },
        ],
      },
    ],
  },
];

const SYSTEMS = [
  "Route 53",
  "CloudWatch",
  "IAM",
  "ALB",
  "EC2 ASG",
  "Lambda",
  "RDS",
  "S3",
  "KMS",
  "VPC Endpoint",
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function weightedImpact(option: SlideOption): number {
  return (
    option.impact.reliability * 1.4 +
    option.impact.security * 1.3 +
    option.impact.communication * 1.15 +
    option.impact.cost * 1
  );
}

function metricTone(value: number): string {
  if (value >= 85) return "bg-emerald-300";
  if (value >= 70) return "bg-sky-300";
  if (value >= 55) return "bg-indigo-300";
  return "bg-rose-300";
}

function StoryCharacter({
  id,
  side,
  speaking,
  stressed,
  spriteSrc,
}: {
  id: CharacterId;
  side: "left" | "right";
  speaking: boolean;
  stressed: boolean;
  spriteSrc?: string;
}) {
  const [spriteFailed, setSpriteFailed] = useState(false);
  const palette = CHARACTER_PALETTES[id];
  const person = CHARACTER_LABELS[id];
  const useSprite = Boolean(spriteSrc) && !spriteFailed;
  return (
    <div
      className={`story-char story-char-${side} ${speaking ? "story-char-speaking" : ""} ${
        stressed ? "story-char-stressed" : ""
      }`}
      style={
        {
          "--char-accent": palette.accent,
          "--char-skin": palette.skin,
          "--char-hair": palette.hair,
          "--char-jacket": palette.jacket,
          "--char-shirt": palette.shirt,
        } as CSSProperties
      }
    >
      <div className="story-char-aura" />
      {useSprite ? (
        <div className="story-char-sprite-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spriteSrc}
            alt={`${person.name} sprite`}
            className={`story-char-sprite ${side === "left" ? "story-char-sprite-left" : "story-char-sprite-right"}`}
            onError={() => setSpriteFailed(true)}
          />
        </div>
      ) : (
        <div className="story-char-body">
          <div className="story-char-head">
            <div className="story-char-hair" />
            <div className="story-char-face">
              <span className="story-char-eye story-char-eye-left" />
              <span className="story-char-eye story-char-eye-right" />
              <span className="story-char-mouth" />
            </div>
          </div>
          <div className="story-char-torso">
            <span className="story-char-badge" />
          </div>
          <span className="story-char-arm story-char-arm-left" />
          <span className="story-char-arm story-char-arm-right" />
          <span className="story-char-leg story-char-leg-left" />
          <span className="story-char-leg story-char-leg-right" />
        </div>
      )}
      <span className="story-char-label">{person.name}</span>
    </div>
  );
}

export default function RoleSimClient() {
  const [mode, setMode] = useState<SimMode>("story");
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeouts, setTimeouts] = useState<Record<string, boolean>>({});
  const [metrics, setMetrics] = useState<Record<MetricKey, number>>({
    reliability: 62,
    security: 62,
    cost: 62,
    communication: 62,
  });
  const [xp, setXp] = useState(0);
  const [credits, setCredits] = useState(120);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [comboGlow, setComboGlow] = useState(false);
  const [autoFails, setAutoFails] = useState(0);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(MODE_CONFIG.story.timeLimit);

  const modeCfg = MODE_CONFIG[mode];
  const activeDay = STORY_DAYS[activeDayIndex];
  const activeSlide = activeDay.slides[activeSlideIndex];
  const slideKey = `${activeDay.id}:${activeSlide.id}`;
  const selectedOptionId = answers[slideKey];
  const selectedOption = activeSlide.options.find((option) => option.id === selectedOptionId) ?? null;

  const totalSlides = STORY_DAYS.reduce((sum, day) => sum + day.slides.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalSlides) * 100);

  const completedByDay = STORY_DAYS.map((day) =>
    day.slides.every((slide) => Boolean(answers[`${day.id}:${slide.id}`]))
  );

  const unlockedDayCount = useMemo(() => {
    let count = 1;
    while (count < STORY_DAYS.length && completedByDay[count - 1]) count += 1;
    return count;
  }, [completedByDay]);

  const missionIntegrity = useMemo(() => {
    const avg =
      (metrics.reliability + metrics.security + metrics.cost + metrics.communication) / 4;
    return clamp(Math.round(avg), 0, 100);
  }, [metrics]);

  const decisionQuality = useMemo(() => {
    let best = 0;
    let total = 0;
    STORY_DAYS.forEach((day) => {
      day.slides.forEach((slide) => {
        const selected = answers[`${day.id}:${slide.id}`];
        if (!selected) return;
        total += 1;
        const option = slide.options.find((item) => item.id === selected);
        if (option?.isBest) best += 1;
      });
    });
    return total === 0 ? 0 : Math.round((best / total) * 100);
  }, [answers]);

  const score = useMemo(() => {
    const metricBoost = missionIntegrity * 4;
    const qualityBoost = decisionQuality * 3;
    const streakBoost = bestStreak * 25;
    const timeoutPenalty = autoFails * 45;
    return Math.max(0, Math.round(xp + metricBoost + qualityBoost + streakBoost - timeoutPenalty));
  }, [xp, missionIntegrity, decisionQuality, bestStreak, autoFails]);

  const threatLevel = clamp(
    Math.round((100 - missionIntegrity) * 0.6 + autoFails * 7 + (secondsLeft <= 8 ? 12 : 0)),
    0,
    100
  );
  const threatLabel =
    threatLevel >= 72 ? "Critical" : threatLevel >= 52 ? "Elevated" : threatLevel >= 32 ? "Guarded" : "Stable";

  const rank =
    score >= 2100 ? "Legend" : score >= 1650 ? "Elite" : score >= 1250 ? "Pro" : score >= 900 ? "Skilled" : "Rookie";

  const badges = useMemo(() => {
    const unlocked: string[] = [];
    if (bestStreak >= 4) unlocked.push("Hot Streak");
    if (metrics.security >= 86) unlocked.push("Security Sentinel");
    if (metrics.reliability >= 86) unlocked.push("Uptime Guardian");
    if (autoFails === 0 && answeredCount >= 8) unlocked.push("Clock Master");
    if (completedByDay[3]) unlocked.push("Story Cleared");
    if (score >= 1650) unlocked.push("Elite Operator");
    return unlocked;
  }, [bestStreak, metrics, autoFails, answeredCount, completedByDay, score]);

  const openDay = useCallback(
    (index: number) => {
      if (index >= unlockedDayCount) return;
      const targetDay = STORY_DAYS[index];
      const firstOpenIdx = targetDay.slides.findIndex(
        (slide) => !answers[`${targetDay.id}:${slide.id}`]
      );
      const nextSlideIdx = firstOpenIdx === -1 ? targetDay.slides.length - 1 : firstOpenIdx;
      setActiveDayIndex(index);
      setActiveSlideIndex(nextSlideIdx);
      setSecondsLeft(MODE_CONFIG[mode].timeLimit);
    },
    [unlockedDayCount, answers, mode]
  );

  const goToSlide = useCallback(
    (dayIndex: number, slideIndex: number) => {
      const clampedDay = clamp(dayIndex, 0, STORY_DAYS.length - 1);
      const maxSlide = STORY_DAYS[clampedDay].slides.length - 1;
      const clampedSlide = clamp(slideIndex, 0, maxSlide);
      setActiveDayIndex(clampedDay);
      setActiveSlideIndex(clampedSlide);
      setSecondsLeft(MODE_CONFIG[mode].timeLimit);
    },
    [mode]
  );

  const nextSlide = useCallback(() => {
    if (activeSlideIndex < activeDay.slides.length - 1) {
      goToSlide(activeDayIndex, activeSlideIndex + 1);
      return;
    }
    if (activeDayIndex + 1 < unlockedDayCount) {
      goToSlide(activeDayIndex + 1, 0);
    }
  }, [activeSlideIndex, activeDay, activeDayIndex, unlockedDayCount, goToSlide]);

  const prevSlide = useCallback(() => {
    if (activeSlideIndex > 0) {
      goToSlide(activeDayIndex, activeSlideIndex - 1);
      return;
    }
    if (activeDayIndex > 0) {
      const prevDay = activeDayIndex - 1;
      goToSlide(prevDay, STORY_DAYS[prevDay].slides.length - 1);
    }
  }, [activeSlideIndex, activeDayIndex, goToSlide]);

  const resolveChoice = useCallback(
    (optionId: string, timedOut = false) => {
      if (answers[slideKey]) return;
      const option = activeSlide.options.find((item) => item.id === optionId);
      if (!option) return;

      const speedBonus = timedOut
        ? -35
        : Math.round((secondsLeft / modeCfg.timeLimit) * 38);
      const base = option.xp + speedBonus;
      const streakBoost = option.isBest ? Math.round(Math.max(streak, 1) * 14) : 0;
      const totalGain = Math.round((base + streakBoost) * modeCfg.multiplier);

      setAnswers((prev) => ({ ...prev, [slideKey]: option.id }));
      if (timedOut) setTimeouts((prev) => ({ ...prev, [slideKey]: true }));
      setXp((prev) => Math.max(0, prev + totalGain));
      setCredits((prev) => Math.max(0, prev + (option.isBest ? 26 : 10) - (timedOut ? 14 : 0)));

      setMetrics((prev) => {
        const next = { ...prev };
        (Object.keys(next) as MetricKey[]).forEach((metric) => {
          next[metric] = clamp(next[metric] + option.impact[metric] * 6, 8, 100);
        });
        return next;
      });

      if (timedOut) {
        setAutoFails((prev) => prev + 1);
        setStreak(0);
      } else if (option.isBest) {
        setStreak((prev) => {
          const next = prev + 1;
          setBestStreak((best) => Math.max(best, next));
          setComboGlow(true);
          window.setTimeout(() => setComboGlow(false), 260);
          return next;
        });
      } else {
        setStreak(0);
      }

      setEventLog((prev) => {
        const outcome = timedOut
          ? "timeout auto-choice"
          : option.isBest
            ? "optimal choice"
            : "suboptimal choice";
        const line = `${activeDay.label} ${activeSlide.chapter} • ${activeSlide.title}: ${outcome}.`;
        return [line, ...prev].slice(0, 8);
      });
      setSecondsLeft(0);
    },
    [answers, slideKey, activeSlide, secondsLeft, modeCfg, streak, activeDay]
  );

  useEffect(() => {
    if (selectedOptionId) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        window.clearInterval(timer);
        const worst = [...activeSlide.options].sort((a, b) => weightedImpact(a) - weightedImpact(b))[0];
        resolveChoice(worst.id, true);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [selectedOptionId, activeSlide, resolveChoice]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextSlide();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevSlide();
      }
      if (event.key === "Enter" && selectedOptionId) {
        event.preventDefault();
        nextSlide();
      }
      if (event.key >= "1" && event.key <= "3" && !selectedOptionId) {
        event.preventDefault();
        const index = Number(event.key) - 1;
        const option = activeSlide.options[index];
        if (option) resolveChoice(option.id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSlide, selectedOptionId, nextSlide, prevSlide, resolveChoice]);

  function resetCampaign() {
    setAnswers({});
    setTimeouts({});
    setMetrics({
      reliability: 62,
      security: 62,
      cost: 62,
      communication: 62,
    });
    setXp(0);
    setCredits(120);
    setStreak(0);
    setBestStreak(0);
    setAutoFails(0);
    setEventLog([]);
    setActiveDayIndex(0);
    setActiveSlideIndex(0);
    setSecondsLeft(MODE_CONFIG[mode].timeLimit);
  }

  const narrator = CHARACTER_LABELS[activeSlide.narrator];
  const teammate = CHARACTER_LABELS[activeSlide.teammate];
  const leftCharacterId = activeSlide.narrator;
  const rightCharacterId = activeSlide.teammate;
  const beatFlip = secondsLeft % 6 < 3;
  const leftSpeaking = selectedOptionId ? Boolean(selectedOption?.isBest) : beatFlip;
  const rightSpeaking = selectedOptionId ? !Boolean(selectedOption?.isBest) : !beatFlip;

  return (
    <SurfaceShell variant="hero">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        <section
          className={`relative overflow-hidden rounded-3xl border border-white/15 bg-[linear-gradient(145deg,rgba(6,10,23,0.92),rgba(9,24,42,0.84))] p-6 shadow-[0_28px_64px_rgba(3,8,20,0.5)] md:p-8 ${cardHover}`}
        >
          <div className="absolute inset-0 opacity-45 [background:radial-gradient(circle_at_10%_18%,rgba(125,211,252,0.22),transparent_38%),radial-gradient(circle_at_90%_82%,rgba(129,140,248,0.22),transparent_46%)]" />
          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100">
              Story Mode Simulation
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Cloud Ops Story: Day 1 to Day 4
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75 md:text-base">
              Slide-by-slide decision game. Each chapter presents a new office scenario, you choose
              what to do, and your mission state evolves in real time.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-white/75">
                Score: <span className="font-semibold text-sky-200">{score}</span>
              </span>
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-white/75">
                Rank: <span className="font-semibold text-indigo-200">{rank}</span>
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-white/75 transition ${
                  comboGlow ? "border-emerald-300/60 bg-emerald-400/20" : "border-white/15 bg-black/30"
                }`}
              >
                Combo: <span className="font-semibold text-emerald-200">x{Math.max(streak, 1)}</span>
              </span>
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-white/75">
                Threat:{" "}
                <span className={threatLevel >= 60 ? "font-semibold text-rose-200" : "font-semibold text-sky-200"}>
                  {threatLabel}
                </span>
              </span>
            </div>
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

        <section className="mt-5 rounded-2xl border border-white/15 bg-black/35 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">
                Campaign Days
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {STORY_DAYS.map((day, index) => {
                  const locked = index >= unlockedDayCount;
                  const active = index === activeDayIndex;
                  const done = completedByDay[index];
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => openDay(index)}
                      disabled={locked}
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] transition ${
                        active
                          ? "border-sky-300/70 bg-sky-400/15 text-sky-100"
                          : locked
                            ? "border-white/10 bg-black/35 text-white/35"
                            : done
                              ? "border-emerald-300/45 bg-emerald-400/10 text-emerald-100"
                              : "border-white/10 bg-black/45 text-white/75 hover:border-sky-300/35"
                      }`}
                    >
                      {day.label} {locked ? "(Locked)" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="min-w-[260px] flex-1">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Campaign progress</span>
                <span>{answeredCount} / {totalSlides} chapters</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-300 to-indigo-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)_320px]">
          <aside className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
              {activeDay.label} Chapters
            </div>
            <div className="mt-3 space-y-2">
              {activeDay.slides.map((slide, index) => {
                const key = `${activeDay.id}:${slide.id}`;
                const selected = answers[key];
                const timedOut = timeouts[key];
                const active = index === activeSlideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(activeDayIndex, index)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-sky-300/65 bg-sky-400/15"
                        : selected
                          ? timedOut
                            ? "border-rose-300/35 bg-rose-400/10"
                            : "border-emerald-300/35 bg-emerald-400/10"
                          : "border-white/10 bg-black/40 hover:border-sky-300/35"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
                        {slide.time}
                      </div>
                      <div className={`h-2 w-2 rounded-full ${active ? "bg-sky-300" : selected ? "bg-emerald-300" : "bg-white/25"}`} />
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">{slide.title}</div>
                    <div className="mt-1 text-[11px] text-white/55">{slide.chapter}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-3 text-xs text-white/70">
              <div className="font-semibold uppercase tracking-[0.08em] text-white/55">Theme</div>
              <p className="mt-1">{activeDay.theme}</p>
              <p className="mt-1 text-white/55">{activeDay.subtitle}</p>
            </div>
          </aside>

          <section className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-200">
                  {activeDay.label} • {activeSlide.chapter} • {activeSlide.time}
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-white">{activeSlide.title}</h2>
                <div className="mt-1 text-xs uppercase tracking-[0.08em] text-white/55">{activeSlide.location}</div>
              </div>
              <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/70">
                {modeCfg.label} Mode
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/45 p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <div className="font-semibold uppercase tracking-[0.08em] text-white/60">Game Mode</div>
                <div className="text-white/60">{modeCfg.hint}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(MODE_CONFIG) as SimMode[]).map((key) => {
                  const active = key === mode;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMode(key);
                        setSecondsLeft(MODE_CONFIG[key].timeLimit);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                        active
                          ? "border-sky-300/70 bg-sky-400/15 text-sky-100"
                          : "border-white/10 bg-black/40 text-white/70 hover:bg-black/60"
                      }`}
                    >
                      {MODE_CONFIG[key].label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-lg border border-white/10 bg-black/50 p-3">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
                  <span>Chapter Timer</span>
                  <span className={secondsLeft <= 8 ? "text-rose-200" : "text-sky-200"}>{secondsLeft}s</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      secondsLeft <= 8
                        ? "bg-gradient-to-r from-rose-300 to-amber-300"
                        : "bg-gradient-to-r from-sky-300 to-indigo-300"
                    }`}
                    style={{ width: `${Math.round((secondsLeft / modeCfg.timeLimit) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/60">Keys: `1/2/3` choose, `Enter` next, arrows move slides.</p>
              </div>
            </div>

            <div className="story-stage mt-4 rounded-xl border border-white/10">
              <div className="story-stage-grid" />
              <div className="story-light-a" />
              <div className="story-light-b" />
              <div className="story-ceiling-lamp" />
              <div className="story-monitor story-monitor-left">
                <span className="story-monitor-line" />
                <span className="story-monitor-line story-monitor-line-b" />
              </div>
              <div className="story-monitor story-monitor-right">
                <span className="story-monitor-line" />
                <span className="story-monitor-line story-monitor-line-b" />
              </div>
              <div className="story-chair story-chair-left" />
              <div className="story-chair story-chair-right" />
              <div className="story-desk" />
              <StoryCharacter
                id={leftCharacterId}
                side="left"
                speaking={leftSpeaking}
                stressed={threatLevel >= 60}
                spriteSrc="/characters/left-stick.png"
              />
              <StoryCharacter
                id={rightCharacterId}
                side="right"
                speaking={rightSpeaking}
                stressed={threatLevel >= 60}
              />
              <div className="story-dialogue story-dialogue-left">
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-200">
                  {narrator.name} • {narrator.role}
                </div>
                <p className="mt-1 text-xs text-white/80">{activeSlide.sceneText}</p>
              </div>
              <div className="story-dialogue story-dialogue-right">
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-200">
                  {teammate.name} • {teammate.role}
                </div>
                <p className="mt-1 text-xs text-white/80">{activeSlide.prompt}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {activeSlide.options.map((option, idx) => {
                const selected = selectedOption?.id === option.id;
                const locked = Boolean(selectedOptionId);
                const projected = Math.round(
                  (option.xp + (option.isBest ? 24 : -8)) * modeCfg.multiplier
                );
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={locked}
                    onClick={() => resolveChoice(option.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? option.isBest
                          ? "border-emerald-300/65 bg-emerald-400/15"
                          : "border-amber-300/65 bg-amber-400/15"
                        : locked
                          ? "border-white/10 bg-black/35 opacity-60"
                          : "border-white/10 bg-black/45 hover:border-sky-300/35 hover:bg-black/55"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">
                        [{idx + 1}] {option.label}
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                        {projected >= 0 ? "+" : ""}
                        {projected} xp
                      </div>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-white/75">{option.action}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {option.tools.map((tool) => (
                        <span
                          key={`${option.id}-${tool}`}
                          className="rounded-full border border-white/10 bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white/70"
                        >
                          {tool}
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
                    ? "border-emerald-300/50 bg-emerald-400/10"
                    : "border-amber-300/50 bg-amber-400/10"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                  {timeouts[slideKey] ? "Timeout auto-response" : selectedOption.isBest ? "Great decision" : "Risky decision"}
                </div>
                <p className="mt-1 text-sm text-white/85">{selectedOption.result}</p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-black/35 px-4 py-3 text-xs text-white/65">
                Choose an action to continue the chapter.
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <PremiumButton variant="neutral" size="sm" onClick={prevSlide}>
                  Previous
                </PremiumButton>
                <PremiumButton variant="indigo" size="sm" onClick={nextSlide}>
                  Next
                </PremiumButton>
              </div>
              <PremiumButton variant="neutral" size="sm" onClick={resetCampaign}>
                Reset Campaign
              </PremiumButton>
            </div>
          </section>

          <aside className="space-y-4">
            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Mission HUD</div>
              <div className="mt-2 text-3xl font-semibold text-sky-200">{missionIntegrity}/100</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
                <div>XP: {xp}</div>
                <div>Credits: {credits}</div>
                <div>Best Streak: x{Math.max(1, bestStreak)}</div>
                <div>Timeouts: {autoFails}</div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    threatLevel >= 60
                      ? "bg-gradient-to-r from-rose-300 to-amber-300"
                      : "bg-gradient-to-r from-emerald-300 to-sky-300"
                  }`}
                  style={{ width: `${threatLevel}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-white/60">Threat {threatLabel}</div>
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Systems Grid</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SYSTEMS.map((node, index) => {
                  const pressure = clamp(
                    Math.round(
                      threatLevel * 0.42 +
                        (100 - missionIntegrity) * 0.3 +
                        (selectedOption?.isBest ? -10 : selectedOption ? 9 : 0) +
                        (index % 3 === 0 ? 6 : 0)
                    ),
                    5,
                    95
                  );
                  const status = pressure >= 70 ? "Degraded" : pressure >= 50 ? "Watching" : "Healthy";
                  return (
                    <div key={node} className="rounded-lg border border-white/10 bg-black/45 p-2">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70">
                        <span>{node}</span>
                        <span
                          className={
                            status === "Degraded"
                              ? "text-rose-200"
                              : status === "Watching"
                                ? "text-amber-200"
                                : "text-emerald-200"
                          }
                        >
                          {status}
                        </span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${
                            status === "Degraded"
                              ? "bg-rose-300"
                              : status === "Watching"
                                ? "bg-amber-300"
                                : "bg-emerald-300"
                          }`}
                          style={{ width: `${100 - pressure}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Operational Metrics</div>
              <div className="mt-3 space-y-2.5">
                {(Object.keys(metrics) as MetricKey[]).map((metric) => {
                  const value = metrics[metric];
                  return (
                    <div key={metric}>
                      <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                        <span>{METRIC_LABELS[metric]}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${metricTone(value)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-white/65">Decision quality: {decisionQuality}%</div>
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Achievements</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.length > 0 ? (
                  badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-emerald-300/35 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-100"
                    >
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65">
                    No badges yet
                  </span>
                )}
              </div>
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-4`}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Story Feed</div>
              <div className="mt-3 space-y-2">
                {eventLog.length > 0 ? (
                  eventLog.map((event, index) => (
                    <div key={`${event}-${index}`} className="rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-xs text-white/75">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-200">
                        Event {String(index + 1).padStart(2, "0")}
                      </div>
                      <p className="mt-1 leading-relaxed">{event}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-white/20 bg-black/35 px-3 py-3 text-xs text-white/60">
                    No events yet. Start your story run.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>

      <style jsx>{`
        .story-stage {
          position: relative;
          overflow: hidden;
          min-height: 330px;
          background:
            radial-gradient(circle at 12% 14%, rgba(125, 211, 252, 0.16), transparent 34%),
            radial-gradient(circle at 85% 88%, rgba(129, 140, 248, 0.15), transparent 40%),
            linear-gradient(160deg, rgba(2, 6, 18, 0.88), rgba(6, 16, 33, 0.88));
        }

        .story-stage-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.14;
        }

        .story-light-a,
        .story-light-b,
        .story-ceiling-lamp {
          position: absolute;
          border-radius: 999px;
          filter: blur(20px);
          animation: storyFloat 7.5s ease-in-out infinite;
        }

        .story-light-a {
          width: 180px;
          height: 180px;
          left: -32px;
          top: -34px;
          background: rgba(56, 189, 248, 0.28);
        }

        .story-light-b {
          width: 180px;
          height: 180px;
          right: -26px;
          bottom: -26px;
          background: rgba(99, 102, 241, 0.24);
          animation-delay: -2.6s;
        }

        .story-ceiling-lamp {
          width: 220px;
          height: 46px;
          left: 50%;
          top: -24px;
          transform: translateX(-50%);
          background: rgba(125, 211, 252, 0.34);
          animation-duration: 4.5s;
        }

        .story-monitor {
          position: absolute;
          width: 116px;
          height: 76px;
          bottom: 66px;
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: linear-gradient(165deg, rgba(2, 6, 23, 0.95), rgba(15, 23, 42, 0.8));
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.5);
          overflow: hidden;
        }

        .story-monitor-left {
          left: 8%;
        }

        .story-monitor-right {
          right: 8%;
        }

        .story-monitor-line {
          position: absolute;
          left: 10px;
          right: 10px;
          top: 20px;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.9));
          animation: storyScan 2.3s linear infinite;
        }

        .story-monitor-line-b {
          top: 34px;
          animation-delay: -1.1s;
          background: linear-gradient(90deg, rgba(129, 140, 248, 0.2), rgba(129, 140, 248, 0.9));
        }

        .story-chair {
          position: absolute;
          width: 54px;
          height: 48px;
          bottom: 48px;
          border-radius: 14px 14px 8px 8px;
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
          border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .story-chair-left {
          left: 28%;
        }

        .story-chair-right {
          right: 28%;
        }

        .story-desk {
          position: absolute;
          left: 9%;
          right: 9%;
          bottom: 26px;
          height: 24px;
          border-radius: 12px;
          background: linear-gradient(
            90deg,
            rgba(100, 116, 139, 0.35),
            rgba(71, 85, 105, 0.58),
            rgba(100, 116, 139, 0.35)
          );
          box-shadow: 0 0 20px rgba(15, 23, 42, 0.55);
        }

        .story-char {
          position: absolute;
          width: 112px;
          height: 182px;
          bottom: 36px;
          animation: storyBob 2.8s ease-in-out infinite;
          transform-origin: center bottom;
          z-index: 14;
        }

        .story-char-left {
          left: 30%;
        }

        .story-char-right {
          right: 30%;
          animation-delay: -1.4s;
        }

        .story-char-aura {
          position: absolute;
          left: 50%;
          bottom: 2px;
          width: 84px;
          height: 20px;
          border-radius: 999px;
          transform: translateX(-50%);
          background: radial-gradient(circle, color-mix(in oklab, var(--char-accent) 72%, transparent) 0%, transparent 70%);
          opacity: 0.5;
          z-index: 1;
        }

        .story-char-body {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 92px;
          height: 172px;
          transform: translateX(-50%);
          z-index: 2;
        }

        .story-char-head {
          position: absolute;
          left: 50%;
          top: 16px;
          width: 54px;
          height: 54px;
          border-radius: 999px;
          transform: translateX(-50%);
          background: var(--char-skin);
          box-shadow: inset 0 -4px 0 rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.2);
          overflow: hidden;
        }

        .story-char-hair {
          position: absolute;
          left: -2px;
          top: -1px;
          width: 58px;
          height: 26px;
          border-radius: 999px 999px 16px 16px;
          background: var(--char-hair);
          box-shadow: inset 0 -6px 0 rgba(255, 255, 255, 0.08);
        }

        .story-char-face {
          position: absolute;
          inset: 0;
        }

        .story-char-eye {
          position: absolute;
          top: 24px;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #111827;
          animation: storyBlink 4.8s ease-in-out infinite;
        }

        .story-char-eye-left {
          left: 16px;
        }

        .story-char-eye-right {
          right: 16px;
        }

        .story-char-mouth {
          position: absolute;
          left: 50%;
          bottom: 10px;
          width: 12px;
          height: 4px;
          border-radius: 999px;
          transform: translateX(-50%);
          background: rgba(17, 24, 39, 0.7);
          transition: all 140ms ease;
        }

        .story-char-torso {
          position: absolute;
          left: 50%;
          top: 66px;
          width: 62px;
          height: 76px;
          transform: translateX(-50%);
          border-radius: 14px 14px 16px 16px;
          background: linear-gradient(180deg, var(--char-jacket), color-mix(in oklab, var(--char-jacket) 72%, #020617));
          border: 1px solid rgba(148, 163, 184, 0.2);
          overflow: hidden;
        }

        .story-char-torso::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 10px;
          width: 24px;
          height: 60px;
          transform: translateX(-50%);
          border-radius: 10px;
          background: color-mix(in oklab, var(--char-shirt) 72%, #f8fafc);
          opacity: 0.9;
        }

        .story-char-badge {
          position: absolute;
          right: 8px;
          top: 8px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--char-accent);
          box-shadow: 0 0 6px color-mix(in oklab, var(--char-accent) 75%, transparent);
        }

        .story-char-arm {
          position: absolute;
          top: 78px;
          width: 14px;
          height: 56px;
          border-radius: 10px;
          background: linear-gradient(180deg, color-mix(in oklab, var(--char-jacket) 72%, #1e293b), #0f172a);
          transform-origin: top center;
          animation: storyArmSwing 2.2s ease-in-out infinite;
        }

        .story-char-arm-left {
          left: 8px;
        }

        .story-char-arm-right {
          right: 8px;
          animation-delay: -1.1s;
        }

        .story-char-leg {
          position: absolute;
          top: 136px;
          width: 14px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(180deg, #1e293b, #0f172a);
          transform-origin: top center;
          animation: storyLegWalk 1.8s ease-in-out infinite;
        }

        .story-char-leg-left {
          left: 30px;
        }

        .story-char-leg-right {
          right: 30px;
          animation-delay: -0.9s;
        }

        .story-char-sprite-wrap {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 126px;
          height: 180px;
          transform: translateX(-50%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 2;
        }

        .story-char-sprite-wrap::before {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 10px;
          width: 92px;
          height: 142px;
          transform: translateX(-50%);
          border-radius: 24px;
          background: radial-gradient(
            circle at 50% 40%,
            color-mix(in oklab, var(--char-accent) 35%, transparent) 0%,
            transparent 72%
          );
          opacity: 0.9;
          z-index: 0;
          pointer-events: none;
        }

        .story-char-sprite {
          width: 116px;
          height: 176px;
          object-fit: contain;
          filter:
            drop-shadow(0 8px 16px rgba(2, 6, 23, 0.65))
            drop-shadow(0 0 10px color-mix(in oklab, var(--char-accent) 36%, transparent));
          transform-origin: center bottom;
          animation: storySpriteIdle 2.4s ease-in-out infinite;
          position: relative;
          z-index: 2;
        }

        .story-char-sprite-left {
          filter:
            drop-shadow(0 0 1px rgba(255, 255, 255, 0.95))
            drop-shadow(0 0 8px rgba(125, 211, 252, 0.75))
            drop-shadow(0 8px 14px rgba(2, 6, 23, 0.7))
            invert(1)
            brightness(1.28);
        }

        .story-char-sprite-right {
          filter:
            drop-shadow(0 0 1px rgba(255, 255, 255, 0.65))
            drop-shadow(0 0 8px rgba(129, 140, 248, 0.5))
            drop-shadow(0 8px 14px rgba(2, 6, 23, 0.68));
        }

        .story-char-speaking .story-char-mouth {
          height: 8px;
          width: 13px;
          border-radius: 999px;
          animation: storyTalk 240ms ease-in-out infinite;
        }

        .story-char-speaking .story-char-aura {
          opacity: 0.75;
          animation: storyGlow 1.1s ease-in-out infinite;
        }

        .story-char-speaking .story-char-sprite {
          animation: storySpriteTalk 380ms ease-in-out infinite;
        }

        .story-char-stressed .story-char-body {
          animation: storyShake 0.45s ease-in-out infinite;
        }

        .story-char-stressed .story-char-sprite {
          animation: storySpriteStress 460ms ease-in-out infinite;
        }

        .story-char-label {
          position: absolute;
          left: 50%;
          bottom: -18px;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(224, 242, 254, 0.95);
          white-space: nowrap;
        }

        .story-dialogue {
          position: absolute;
          max-width: 280px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 12px;
          background: rgba(2, 6, 23, 0.76);
          padding: 10px;
          backdrop-filter: blur(4px);
          animation: storyFadeIn 220ms ease-out both;
          z-index: 20;
        }

        .story-dialogue-left {
          left: 12px;
          top: 12px;
        }

        .story-dialogue-right {
          right: 12px;
          top: 12px;
        }

        @keyframes storyBob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes storyFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(8px, -6px, 0);
          }
        }

        @keyframes storyScan {
          0% {
            transform: translateX(-20%);
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(22%);
            opacity: 0.45;
          }
        }

        @keyframes storyBlink {
          0%,
          46%,
          100% {
            transform: scaleY(1);
          }
          48%,
          50% {
            transform: scaleY(0.15);
          }
        }

        @keyframes storyTalk {
          0%,
          100% {
            transform: translateX(-50%) scaleY(1);
          }
          50% {
            transform: translateX(-50%) scaleY(1.4);
          }
        }

        @keyframes storyArmSwing {
          0%,
          100% {
            transform: rotate(9deg);
          }
          50% {
            transform: rotate(-7deg);
          }
        }

        @keyframes storyLegWalk {
          0%,
          100% {
            transform: rotate(8deg);
          }
          50% {
            transform: rotate(-10deg);
          }
        }

        @keyframes storySpriteIdle {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(-1deg);
          }
        }

        @keyframes storySpriteTalk {
          0%,
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-4px) rotate(-1.8deg) scale(1.02);
          }
        }

        @keyframes storySpriteStress {
          0%,
          100% {
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          25% {
            transform: translateX(1px) translateY(-2px) rotate(1.4deg);
          }
          50% {
            transform: translateX(-1px) translateY(0) rotate(-1.2deg);
          }
          75% {
            transform: translateX(1px) translateY(-1px) rotate(1deg);
          }
        }

        @keyframes storyGlow {
          0%,
          100% {
            transform: translateX(-50%) scale(1);
          }
          50% {
            transform: translateX(-50%) scale(1.18);
          }
        }

        @keyframes storyShake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(1px);
          }
          50% {
            transform: translateX(-1px);
          }
          75% {
            transform: translateX(1px);
          }
        }

        @keyframes storyFadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </SurfaceShell>
  );
}
