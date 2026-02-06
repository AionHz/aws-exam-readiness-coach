"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SurfaceShell from "../components/SurfaceShell";
import { cardBase, cardHover, inputBase } from "../lib/ui";

type StudyDomain =
  | "Cloud Concepts"
  | "Security and Compliance"
  | "Cloud Technology and Services"
  | "Billing, Pricing, and Support";
type DomainFilter = "All" | StudyDomain;
type TabId = "models" | "phrases" | "keywords" | "checklist";

type ExamFact = {
  label: string;
  value: string;
  detail: string;
};

type MentalModel = {
  id: string;
  concept: string;
  metaphor: string;
  whyItWorks: string;
  examHook: string;
  domain: StudyDomain;
};

type PhraseItem = {
  phrase: string;
  think: string;
  metaphor: string;
  why: string;
  domain: StudyDomain;
};

type KeywordItem = {
  term: string;
  short: string;
  detail: string;
  metaphor: string;
  whyBuiltThisWay: string;
  domain: StudyDomain;
};

type ChecklistItem = {
  id: string;
  label: string;
  note: string;
};

const tabItems: Array<{ id: TabId; label: string }> = [
  { id: "models", label: "Mental Models" },
  { id: "phrases", label: "Phrase Decoder" },
  { id: "keywords", label: "Keyword Atlas" },
  { id: "checklist", label: "Final Checklist" },
];

const domainFilters: DomainFilter[] = [
  "All",
  "Cloud Technology and Services",
  "Security and Compliance",
  "Cloud Concepts",
  "Billing, Pricing, and Support",
];

const examFacts: ExamFact[] = [
  { label: "Questions", value: "65", detail: "Includes scored and unscored items." },
  { label: "Time", value: "90 min", detail: "Average pace is about 1m 23s per question." },
  { label: "Pass mark", value: "700/1000", detail: "Consistency usually beats risky guessing." },
  {
    label: "High-weight domains",
    value: "64%",
    detail: "Technology + Security domains are your biggest score drivers.",
  },
];

const mentalModels: MentalModel[] = [
  {
    id: "sg-nacl",
    concept: "Security Group vs NACL",
    metaphor:
      "Imagine a business campus: a Security Group is the guard at each office door who checks who may enter that exact room and remembers established conversations; a NACL is the checkpoint at the campus gate that applies a strict pass list to every car entering or leaving the whole neighborhood.",
    whyItWorks: "Instance-level control needs context/state; subnet edge filtering needs broad stateless rules.",
    examHook: "Door-level protection -> SG. Subnet boundary filtering -> NACL.",
    domain: "Cloud Technology and Services",
  },
  {
    id: "cloudwatch-cloudtrail",
    concept: "CloudWatch vs CloudTrail",
    metaphor:
      "Think of a hospital control room: CloudWatch is the live monitor wall showing heart rate and alarm beeps in real time, while CloudTrail is the audit record that says which doctor opened which medicine cabinet at 2:14 AM.",
    whyItWorks: "Operations need live metrics/alarms; governance needs historical audit records.",
    examHook: "Performance alert -> CloudWatch. Who did what -> CloudTrail.",
    domain: "Security and Compliance",
  },
  {
    id: "s3-ebs-efs",
    concept: "S3 vs EBS vs EFS",
    metaphor:
      "Picture a media company: S3 is the giant archive warehouse of labeled boxes, EBS is the local high-performance drive bolted into one editing workstation, and EFS is the shared file cabinet that many editors open at the same time.",
    whyItWorks: "AWS separates object, block, and shared file patterns for scale and performance tradeoffs.",
    examHook: "Object content -> S3, single-instance block -> EBS, multi-instance file share -> EFS.",
    domain: "Cloud Technology and Services",
  },
  {
    id: "lambda-ec2",
    concept: "Lambda vs EC2",
    metaphor:
      "Lambda is like requesting a ride only when you need to travel, where someone else maintains the vehicle and driver; EC2 is owning the car fleet yourself, so you control every detail but also handle maintenance, parking, and fuel.",
    whyItWorks: "Event workloads benefit from no server management. Persistent control needs owned compute.",
    examHook: "Event-driven + low ops -> Lambda. Full OS/runtime control -> EC2.",
    domain: "Cloud Technology and Services",
  },
  {
    id: "multi-az",
    concept: "Multi-AZ resilience",
    metaphor:
      "Imagine running emergency clinics in two districts connected by coordinated procedures: if one district loses power, patients are still treated in the other without the entire healthcare service stopping.",
    whyItWorks: "Failure isolation by zone reduces blast radius while keeping the same region latency profile.",
    examHook: "High availability inside a region -> Multi-AZ.",
    domain: "Cloud Concepts",
  },
  {
    id: "elasticity",
    concept: "Elasticity",
    metaphor:
      "Think of a stadium with robotic seating rows that expand before a championship game and retract after the crowd leaves, so you are never paying for a full-capacity venue on quiet weekdays.",
    whyItWorks: "Cloud economics depend on matching capacity to real demand, not peak guesswork.",
    examHook: "Scale out and in automatically -> Elasticity.",
    domain: "Cloud Concepts",
  },
  {
    id: "iam-role",
    concept: "IAM Role",
    metaphor:
      "A role is like a time-limited backstage badge issued to a contractor for one shift: it opens only the rooms needed for that task and expires after the job, unlike a permanent all-access key hidden in a desk drawer.",
    whyItWorks: "Short-lived credentials reduce long-term secret exposure risk.",
    examHook: "Workload permissions without static keys -> IAM Role.",
    domain: "Security and Compliance",
  },
  {
    id: "kms",
    concept: "KMS",
    metaphor:
      "KMS is a central bank vault for encryption keys where every checkout is logged, access is policy-controlled, and key rotation is managed centrally instead of each team hiding their own copies in separate drawers.",
    whyItWorks: "Centralized key management enforces consistent encryption governance.",
    examHook: "Need managed key lifecycle + policy control -> KMS.",
    domain: "Security and Compliance",
  },
  {
    id: "vpc-endpoint",
    concept: "VPC Endpoint",
    metaphor:
      "A VPC endpoint is an interior corridor between secure buildings on the same campus, so staff can reach critical services without walking onto public streets where traffic is harder to monitor and control.",
    whyItWorks: "Private traffic paths reduce exposure and simplify security controls.",
    examHook: "Private subnet to AWS service without public internet -> VPC Endpoint.",
    domain: "Cloud Technology and Services",
  },
  {
    id: "pricing-models",
    concept: "Pricing models",
    metaphor:
      "Pricing is like travel planning: On-Demand is buying tickets day-of for maximum flexibility, Savings or Reserved is purchasing a commuter pass when you know the route, and Spot is taking deeply discounted standby seats when schedule interruptions are acceptable.",
    whyItWorks: "Different commitment levels trade flexibility for discount depth.",
    examHook: "Stable usage -> Savings/Reserved. Interruptible -> Spot. Uncertain -> On-Demand.",
    domain: "Billing, Pricing, and Support",
  },
];

const phraseBank: PhraseItem[] = [
  {
    phrase: "Who performed this API action?",
    think: "AWS CloudTrail",
    metaphor:
      "A tamper-resistant security camera timeline that records who entered which room, with identity, timestamp, and action details for investigations.",
    why: "Audit trails are about recorded identity events, not live metrics.",
    domain: "Security and Compliance",
  },
  {
    phrase: "Set alert when CPU exceeds threshold",
    think: "CloudWatch Alarm",
    metaphor:
      "A hospital bedside monitor that watches vital signs continuously and triggers an immediate alarm when a threshold is crossed.",
    why: "Metric threshold monitoring is an operations telemetry task.",
    domain: "Cloud Technology and Services",
  },
  {
    phrase: "Run code without managing servers",
    think: "AWS Lambda",
    metaphor:
      "Calling a certified technician only when a specific repair event happens, then paying for just that job instead of staffing a full-time maintenance crew.",
    why: "Serverless removes provisioning overhead for event-based execution.",
    domain: "Cloud Technology and Services",
  },
  {
    phrase: "Store static assets, logs, and backups",
    think: "Amazon S3",
    metaphor:
      "A global climate-controlled warehouse of labeled bins where items are easy to retrieve, massively scalable, and built to survive local facility failures.",
    why: "Object storage is optimized for scale, durability, and broad access patterns.",
    domain: "Cloud Technology and Services",
  },
  {
    phrase: "Multiple instances require same files",
    think: "Amazon EFS",
    metaphor:
      "A shared office drive where every employee workstation can read and update the same folders without making private copies per desk.",
    why: "EFS provides concurrent file access semantics across compute resources.",
    domain: "Cloud Technology and Services",
  },
  {
    phrase: "Lowest compute cost and interruption is acceptable",
    think: "Spot Instances",
    metaphor:
      "An airline standby ticket: dramatically cheaper than regular fare, but you may be bumped and need a plan to continue the journey.",
    why: "Spare capacity pricing is cheap because availability is not guaranteed.",
    domain: "Billing, Pricing, and Support",
  },
  {
    phrase: "Need to stay in private subnet path",
    think: "VPC Endpoint",
    metaphor:
      "A secure internal hallway between buildings where staff never step onto open public sidewalks to reach critical internal services.",
    why: "Private connectivity avoids public internet exposure.",
    domain: "Cloud Technology and Services",
  },
  {
    phrase: "Protect web app from common web attacks",
    think: "AWS WAF",
    metaphor:
      "An airport security checkpoint that scans each carry-on request for suspicious patterns before allowing it into the secure area.",
    why: "WAF inspects layer-7 request patterns and blocks known bad signatures.",
    domain: "Security and Compliance",
  },
  {
    phrase: "Notify before budget overrun",
    think: "AWS Budgets",
    metaphor:
      "A dashboard speed-warning system that flashes before you cross the monthly spending limit, so you can brake before penalties hit.",
    why: "Budgets are alert controls, not analytics reports.",
    domain: "Billing, Pricing, and Support",
  },
  {
    phrase: "Design for uptime when one zone fails",
    think: "Multi-AZ architecture",
    metaphor:
      "Two independent power stations in separate districts feeding the same city grid, so one station outage does not black out the whole city.",
    why: "Independent zones reduce single failure domain risk.",
    domain: "Cloud Concepts",
  },
];

const keywordBank: KeywordItem[] = [
  {
    term: "Elasticity",
    short: "Scale up and down with demand.",
    detail: "The key is shrinking when demand drops, not only growing.",
    metaphor:
      "A concert venue that expands seating for sold-out nights and shrinks to a smaller hall on weekdays, so capacity follows real attendance instead of peak assumptions.",
    whyBuiltThisWay: "Paying only for needed capacity is core cloud economics.",
    domain: "Cloud Concepts",
  },
  {
    term: "High Availability",
    short: "Keep service running despite failures.",
    detail: "Implemented using redundancy and health-based failover patterns.",
    metaphor:
      "A hospital with redundant power lines, backup generators, and failover procedures so critical operations continue when one component fails.",
    whyBuiltThisWay: "User trust depends on uptime, so failure isolation is a first-class design goal.",
    domain: "Cloud Concepts",
  },
  {
    term: "Shared Responsibility Model",
    short: "AWS and customer split security duties.",
    detail: "AWS secures infrastructure; customer secures identity, data, and configuration.",
    metaphor:
      "In an apartment complex, the landlord secures the building structure and locks, while each tenant is responsible for what they leave visible, who they invite in, and how they organize their unit.",
    whyBuiltThisWay: "Managed infrastructure still needs customer intent and data governance.",
    domain: "Cloud Concepts",
  },
  {
    term: "IAM Role",
    short: "Temporary permissions identity.",
    detail: "Use roles for workloads to avoid long-lived credentials.",
    metaphor:
      "A timed visitor badge issued at reception for a specific project area, automatically expiring when the shift ends instead of granting permanent facility access.",
    whyBuiltThisWay: "Short-lived credentials reduce leaked-secret blast radius.",
    domain: "Security and Compliance",
  },
  {
    term: "Least Privilege",
    short: "Grant only required permissions.",
    detail: "Scope actions and resources tightly.",
    metaphor:
      "Giving a contractor one room key and one task window, not the master keyring to every floor, storage room, and security panel in the building.",
    whyBuiltThisWay: "Smaller permission scope limits compromise impact.",
    domain: "Security and Compliance",
  },
  {
    term: "KMS",
    short: "Managed encryption key service.",
    detail: "Centralized key lifecycle, policy, rotation, and usage control.",
    metaphor:
      "A central high-security key desk where every key checkout is logged, policies decide who can borrow which key, and old keys can be rotated on schedule.",
    whyBuiltThisWay: "Encryption at scale needs auditable, consistent key governance.",
    domain: "Security and Compliance",
  },
  {
    term: "CloudTrail",
    short: "Account/API activity history.",
    detail: "Tracks who did what and when in the account.",
    metaphor:
      "A flight data recorder that captures who touched which control and when, so investigators can reconstruct exactly what happened after an incident.",
    whyBuiltThisWay: "Security and compliance require immutable audit evidence.",
    domain: "Security and Compliance",
  },
  {
    term: "EC2",
    short: "Virtual server with full OS control.",
    detail: "Choose when runtime/OS customization is needed.",
    metaphor:
      "Owning a full restaurant kitchen where you choose every appliance, recipe, and workflow, but you also clean, patch, secure, and maintain everything yourself.",
    whyBuiltThisWay: "Some workloads need deep control over host behavior.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "Lambda",
    short: "Serverless event-triggered compute.",
    detail: "Good for short-lived tasks with minimal ops overhead.",
    metaphor:
      "Calling a specialist only when an exact event occurs, paying only for active work time while someone else manages tools, scheduling, and facility overhead.",
    whyBuiltThisWay: "Event workloads should not require permanent server ownership.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "S3",
    short: "Durable object storage.",
    detail: "Great for backups, logs, static content, and large data sets.",
    metaphor:
      "A globally distributed warehouse system with labeled shelves and strong durability guarantees, ideal for storing huge volumes of boxes you retrieve by label.",
    whyBuiltThisWay: "Object storage optimizes cost and scale for unstructured data.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "EBS",
    short: "Persistent block storage for EC2.",
    detail: "Best for low-latency instance-attached storage.",
    metaphor:
      "A high-performance internal SSD mounted directly into one server chassis, optimized for that machine’s workload and latency expectations.",
    whyBuiltThisWay: "Block storage gives predictable performance for host-bound workloads.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "EFS",
    short: "Managed shared file storage.",
    detail: "Multiple compute nodes mount the same file system.",
    metaphor:
      "A shared network drive in a design studio where multiple creators open and edit files from different desks without copying local versions.",
    whyBuiltThisWay: "Distributed apps often need one shared file namespace.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "VPC",
    short: "Isolated virtual network boundary.",
    detail: "Contains subnets, routes, gateways, and network policy controls.",
    metaphor:
      "A private corporate campus with internal roads, gated entrances, and zoned buildings, where traffic paths and access boundaries are planned deliberately.",
    whyBuiltThisWay: "Network isolation is foundational for security and architecture control.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "Security Group",
    short: "Stateful instance-level firewall.",
    detail: "Allows return traffic automatically for established connections.",
    metaphor:
      "A smart door guard who checks allowed visitors per room and remembers established conversations, so response traffic for approved sessions is handled automatically.",
    whyBuiltThisWay: "Instance context simplifies policy for common app traffic patterns.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "NACL",
    short: "Stateless subnet-level filter.",
    detail: "Evaluates inbound/outbound rules independently at subnet boundary.",
    metaphor:
      "A perimeter checkpoint with a fixed inbound and outbound rulebook, scanning each direction separately for every vehicle crossing the subnet boundary.",
    whyBuiltThisWay: "Subnet-wide coarse controls provide an additional security layer.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "Auto Scaling",
    short: "Automatic capacity adjustment.",
    detail: "Scales resources out and in based on policies and demand.",
    metaphor:
      "A climate-control thermostat that adds heating units during cold spikes and powers them down when conditions normalize to avoid waste.",
    whyBuiltThisWay: "Demand variability should not require manual capacity operations.",
    domain: "Cloud Technology and Services",
  },
  {
    term: "On-Demand Pricing",
    short: "Pay as you use, no commitment.",
    detail: "Best for variable, uncertain, or short-lived workloads.",
    metaphor:
      "Booking transportation one trip at a time with no long-term contract, ideal for uncertain travel frequency but typically pricier per use.",
    whyBuiltThisWay: "Flexibility has premium pricing.",
    domain: "Billing, Pricing, and Support",
  },
  {
    term: "Savings Plans",
    short: "Commitment discount model.",
    detail: "Lower cost for predictable long-term compute usage.",
    metaphor:
      "Committing to a monthly gym membership because you train consistently; you lose some flexibility but gain a significantly lower effective price.",
    whyBuiltThisWay: "Commitments allow AWS to offer better pricing predictability.",
    domain: "Billing, Pricing, and Support",
  },
  {
    term: "Spot Instances",
    short: "Discounted spare compute capacity.",
    detail: "Can be interrupted; use for fault-tolerant workloads.",
    metaphor:
      "Standing in a standby ticket lane where prices are very low, but you can be bumped at any moment and must be ready with a fallback plan.",
    whyBuiltThisWay: "Unused capacity is sold cheaply with interruption tradeoff.",
    domain: "Billing, Pricing, and Support",
  },
  {
    term: "Cost Explorer",
    short: "Spend and usage analytics.",
    detail: "Use for trend analysis and cost breakdowns.",
    metaphor:
      "A finance operations dashboard that shows where spending is trending, which teams consume what, and where optimization opportunities are emerging.",
    whyBuiltThisWay: "Optimization needs visibility before action.",
    domain: "Billing, Pricing, and Support",
  },
  {
    term: "AWS Budgets",
    short: "Threshold-based cost/usage alerts.",
    detail: "Notifies when spending approaches or exceeds limits.",
    metaphor:
      "A speed-limit warning system that alerts before you cross a risky threshold, helping you correct course before major overspend damage occurs.",
    whyBuiltThisWay: "Guardrails prevent surprise bills.",
    domain: "Billing, Pricing, and Support",
  },
];

const checklist: ChecklistItem[] = [
  {
    id: "pace",
    label: "I will keep a steady pace and avoid getting stuck early.",
    note: "Target around Q25 by minute 35 and Q50 by minute 70.",
  },
  {
    id: "hook",
    label: "I will map each scenario phrase to the right service mental model.",
    note: "Use phrase cues before reading every option deeply.",
  },
  {
    id: "managed",
    label: "I will prefer managed services unless control requirements force otherwise.",
    note: "Lower operational burden is frequently the intended answer path.",
  },
  {
    id: "security",
    label: "I will apply least privilege and shared-responsibility logic first.",
    note: "Many distractors fail security fundamentals.",
  },
  {
    id: "cost",
    label: "I will pick pricing based on usage shape, not only headline discount.",
    note: "Stable, bursty, and interruptible patterns map to different pricing answers.",
  },
  {
    id: "change",
    label: "I will only change an answer if I found a concrete technical mismatch.",
    note: "Random switching near the end usually lowers score.",
  },
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function filterByDomain<T extends { domain: StudyDomain }>(items: T[], domain: DomainFilter): T[] {
  if (domain === "All") return items;
  return items.filter((item) => item.domain === domain);
}

function tabButtonClass(isActive: boolean): string {
  if (isActive) {
    return "tips-active-pill border-cyan-300/60 bg-cyan-500/15 text-cyan-50 shadow-[inset_0_1px_0_rgba(186,230,253,0.32),0_1px_0_rgba(0,0,0,0.45)]";
  }
  return "border-white/10 bg-slate-900/80 text-slate-200 hover:bg-slate-900";
}

function filterButtonClass(isActive: boolean): string {
  if (isActive) {
    return "tips-active-pill-soft border-cyan-300/60 bg-cyan-500/15 text-cyan-100";
  }
  return "border-white/10 bg-slate-900/75 text-slate-300 hover:bg-slate-900";
}

function MatrixRainLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    let width = 0;
    let height = 0;
    let fontSize = 14;
    let columnGap = 14;
    let columns = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    let trails: number[] = [];
    let xPositions: number[] = [];

    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*@アイウエオカキクケコサシスセソタチツテトナニヌネノ";

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = width < 768 ? 12 : 14;
      columnGap = fontSize * 1.05;
      columns = Math.max(18, Math.ceil(width / columnGap) + 2);
      const rows = height / fontSize;
      // Start streams at mixed positions to avoid a top-heavy band.
      drops = Array.from({ length: columns }, () => Math.random() * rows * 1.2 - rows * 0.2);
      speeds = Array.from({ length: columns }, () => 0.55 + Math.random() * 1.2);
      trails = Array.from({ length: columns }, () => 12 + Math.floor(Math.random() * 16));
      xPositions = Array.from(
        { length: columns },
        (_, i) => i * columnGap + (Math.random() - 0.5) * 1.6
      );
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, width, height);
    };

    const draw = (t: number) => {
      if (t - last < 33) {
        raf = window.requestAnimationFrame(draw);
        return;
      }
      last = t;

      // Soft fade keeps the trail effect while preserving movement continuity.
      ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
      ctx.fillRect(0, 0, width, height);

      ctx.textBaseline = "top";
      ctx.font = `700 ${fontSize}px "JetBrains Mono", "IBM Plex Mono", monospace`;
      for (let i = 0; i < columns; i++) {
        const x = xPositions[i];
        const headRow = drops[i];
        const trail = trails[i];

        for (let j = trail; j >= 0; j--) {
          const row = headRow - j;
          const y = row * fontSize;
          if (y < -fontSize || y > height + fontSize) continue;

          const text = chars[Math.floor(Math.random() * chars.length)];
          if (j === 0) {
            // Bright lead glyph for classic matrix look.
            ctx.fillStyle = "#dcffe8";
            ctx.shadowColor = "rgba(187, 247, 208, 0.85)";
            ctx.shadowBlur = 7;
          } else {
            const alpha = Math.max(0.05, (1 - j / (trail + 1)) * 0.5);
            ctx.fillStyle = `rgba(34, 197, 94, ${alpha.toFixed(3)})`;
            ctx.shadowBlur = 0;
          }
          ctx.fillText(text, x, y);
        }

        drops[i] += speeds[i];
        // Re-seed above viewport once the full trail exits below.
        if ((drops[i] - trail) * fontSize > height + fontSize * 2) {
          drops[i] = -Math.random() * ((height / fontSize) * 0.55 + 10);
          speeds[i] = 0.55 + Math.random() * 1.2;
          trails[i] = 12 + Math.floor(Math.random() * 16);
        }
      }
      ctx.shadowBlur = 0;

      raf = window.requestAnimationFrame(draw);
    };

    setSize();
    window.addEventListener("resize", setSize);
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", setSize);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas className="tips-matrix-canvas" ref={canvasRef} />;
}

export default function TipsClient() {
  const [activeTab, setActiveTab] = useState<TabId>("models");
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("All");
  const [query, setQuery] = useState("");
  const [expandedModel, setExpandedModel] = useState<string | null>(mentalModels[0]?.id ?? null);
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [drillPhrase, setDrillPhrase] = useState<PhraseItem>(phraseBank[0]);

  const normalizedQuery = normalize(query);

  const filteredModels = useMemo(() => {
    const scoped = filterByDomain(mentalModels, domainFilter);
    if (!normalizedQuery) return scoped;
    return scoped.filter((item) => {
      const haystack = normalize(
        `${item.concept} ${item.metaphor} ${item.whyItWorks} ${item.examHook} ${item.domain}`
      );
      return haystack.includes(normalizedQuery);
    });
  }, [domainFilter, normalizedQuery]);

  const filteredPhrases = useMemo(() => {
    const scoped = filterByDomain(phraseBank, domainFilter);
    if (!normalizedQuery) return scoped;
    return scoped.filter((item) => {
      const haystack = normalize(
        `${item.phrase} ${item.think} ${item.metaphor} ${item.why} ${item.domain}`
      );
      return haystack.includes(normalizedQuery);
    });
  }, [domainFilter, normalizedQuery]);

  const filteredKeywords = useMemo(() => {
    const scoped = filterByDomain(keywordBank, domainFilter);
    if (!normalizedQuery) return scoped;
    return scoped.filter((item) => {
      const haystack = normalize(
        `${item.term} ${item.short} ${item.detail} ${item.metaphor} ${item.whyBuiltThisWay} ${item.domain}`
      );
      return haystack.includes(normalizedQuery);
    });
  }, [domainFilter, normalizedQuery]);

  const checklistDoneCount = useMemo(
    () => checklist.filter((item) => checked[item.id]).length,
    [checked]
  );
  const checklistProgress = Math.round((checklistDoneCount / checklist.length) * 100);
  const activeTabLabel = tabItems.find((item) => item.id === activeTab)?.label ?? activeTab;
  const activeResultCount =
    activeTab === "models"
      ? filteredModels.length
      : activeTab === "phrases"
        ? filteredPhrases.length
        : activeTab === "keywords"
          ? filteredKeywords.length
          : checklist.length;
  const queryLabel = query.trim() ? `"${query.trim()}"` : "none";

  function toggleChecklist(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetChecklist() {
    setChecked({});
  }

  function pickRandomPhrase() {
    const pool = filteredPhrases.length > 0 ? filteredPhrases : phraseBank;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setDrillPhrase(next);
  }

  function renderMentalModelsTab() {
    return (
      <div className="tips-fade-in space-y-4">
        <p className="text-sm text-slate-100">
          Learn each concept as a metaphor first, then map it to exam wording.
        </p>
        <div className="tips-stagger-grid grid gap-3">
          {filteredModels.map((model) => {
            const isOpen = expandedModel === model.id;
            return (
              <article
                key={model.id}
                className={`tips-rs-card rounded-md border border-white/10 bg-black/45 p-4 ${cardHover}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedModel(isOpen ? null : model.id)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{model.concept}</p>
                    <p className="mt-1 text-sm text-slate-100">{model.metaphor}</p>
                  </div>
                  <span className="text-xs font-semibold text-cyan-100">
                    {isOpen ? "Hide" : "Why this way"}
                  </span>
                </button>

                {isOpen && (
                  <div className="tips-fade-in mt-3 grid gap-2 rounded-xl border border-white/12 bg-white/[0.04] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-200">
                      Why AWS designed it
                    </p>
                    <p className="text-sm text-slate-100">{model.whyItWorks}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100">
                      Exam hook
                    </p>
                    <p className="text-sm text-slate-100">{model.examHook}</p>
                    <p className="text-xs text-slate-200">{model.domain}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {filteredModels.length === 0 && (
          <div className="tips-rs-card rounded-md border border-white/15 bg-black/35 p-4 text-sm text-slate-200">
            No model matches your search/filter. Clear or switch domain.
          </div>
        )}
      </div>
    );
  }

  function renderPhrasesTab() {
    return (
      <div className="tips-fade-in space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className={`tips-rs-card rounded-md border border-white/15 bg-black/45 p-4 ${cardHover}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-200">
              Phrase drill
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-white">{drillPhrase.phrase}</p>
            <p className="mt-2 text-sm font-semibold text-cyan-100">{drillPhrase.think}</p>
            <p className="mt-2 text-xs text-slate-300">Metaphor: {drillPhrase.metaphor}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{drillPhrase.why}</p>
            <button
              type="button"
              onClick={pickRandomPhrase}
              className="tips-pop mt-3 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-200 hover:bg-white/[0.08]"
            >
              Next phrase
            </button>
          </div>

          <div className="tips-rs-card rounded-md border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-slate-300">
              Results: <span className="font-semibold text-white">{filteredPhrases.length}</span>
            </p>
            <p className="mt-1 text-xs text-cyan-200/75">
              Treat phrases as triggers. If you see the cue, jump to the matching service pattern.
            </p>
          </div>
        </div>

        <div className="tips-stagger-grid grid gap-3 md:grid-cols-2">
          {filteredPhrases.map((item) => (
            <button
              key={`${item.phrase}-${item.think}`}
              type="button"
              onClick={() => setDrillPhrase(item)}
              className={`tips-rs-card rounded-md border border-white/10 bg-black/45 p-4 text-left transition ${
                drillPhrase.phrase === item.phrase ? "border-cyan-300/65 bg-white/[0.05]" : ""
              } ${cardHover}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-200">
                Prompt cue
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-white">{item.phrase}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-100">
                Think
              </p>
              <p className="mt-1 text-sm font-bold text-cyan-100">{item.think}</p>
              <p className="mt-2 text-xs text-slate-300">Metaphor: {item.metaphor}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.why}</p>
              <p className="mt-2 text-xs text-slate-200">{item.domain}</p>
            </button>
          ))}
        </div>

        {filteredPhrases.length === 0 && (
          <div className="tips-rs-card rounded-md border border-white/15 bg-black/35 p-4 text-sm text-slate-200">
            No phrase matches your search/filter. Clear or switch domain.
          </div>
        )}
      </div>
    );
  }

  function renderKeywordsTab() {
    return (
      <div className="tips-fade-in space-y-3">
        <p className="text-sm text-slate-100">
          Open a keyword to see its metaphor and why it exists in AWS architecture.
        </p>
        <div className="tips-stagger-grid grid gap-3">
          {filteredKeywords.map((item) => {
            const id = `${item.domain}-${item.term}`;
            const isOpen = expandedKeyword === id;
            return (
              <article
                key={id}
                className={`tips-rs-card rounded-md border border-white/10 bg-black/45 p-4 ${cardHover}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedKeyword(isOpen ? null : id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{item.term}</p>
                    <p className="mt-1 text-sm text-slate-100">{item.short}</p>
                  </div>
                  <span className="text-xs font-semibold text-cyan-100">
                    {isOpen ? "Hide" : "Open"}
                  </span>
                </button>

                {isOpen && (
                  <div className="tips-fade-in mt-3 grid gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-sm leading-relaxed text-slate-100">{item.detail}</p>
                    <p className="text-xs text-slate-300">Metaphor: {item.metaphor}</p>
                    <p className="text-xs text-slate-300">Why this way: {item.whyBuiltThisWay}</p>
                    <p className="text-xs text-slate-200">{item.domain}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {filteredKeywords.length === 0 && (
          <div className="tips-rs-card rounded-md border border-white/15 bg-black/35 p-4 text-sm text-slate-200">
            No keyword matches your search/filter. Clear or switch domain.
          </div>
        )}
      </div>
    );
  }

  function renderChecklistTab() {
    return (
      <div className="tips-fade-in space-y-4">
        <div className="tips-rs-card rounded-md border border-white/15 bg-black/45 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Readiness progress</p>
            <p className="text-sm font-semibold text-cyan-200">{checklistProgress}%</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-900/80">
            <div className="tips-glow-strip h-full rounded-full" style={{ width: `${checklistProgress}%` }} />
          </div>
          <p className="mt-2 text-xs text-cyan-200/75">
            {checklistDoneCount} / {checklist.length} complete
          </p>
        </div>

        <div className="tips-stagger-grid grid gap-3">
          {checklist.map((item) => (
            <label
              key={item.id}
              className={`tips-rs-card rounded-md border border-white/10 bg-black/45 p-4 transition ${
                checked[item.id] ? "border-cyan-300/60 bg-white/[0.05]" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(checked[item.id])}
                  onChange={() => toggleChecklist(item.id)}
                  className="mt-1 h-4 w-4 rounded border-white/30 bg-slate-900"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.note}</p>
                </div>
              </div>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={resetChecklist}
          className="rounded-md border border-white/10 bg-black/45 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-100 hover:bg-slate-900"
        >
          Reset checklist
        </button>
      </div>
    );
  }

  return (
    <SurfaceShell variant="hero">
      <div aria-hidden className="tips-bg-canvas pointer-events-none fixed inset-0 z-0">
        <div className="tips-bg-gradient" />
        <div className="tips-bg-matrix">
          <MatrixRainLayer />
        </div>
        <div className="tips-bg-scanlines" />
      </div>

      <div className="tips-readable tips-rs-theme tips-rs-layout relative z-10 mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-6 md:pb-20">
        <section className="tips-rs-panel tips-rs-panel-large tips-rs-frame relative overflow-hidden rounded-xl border border-white/15 bg-[linear-gradient(145deg,rgba(6,10,22,0.96),rgba(8,20,36,0.88))] p-6 shadow-[0_24px_52px_rgba(1,6,20,0.64)] md:p-8">
          <div className="tips-hero-beam pointer-events-none absolute inset-x-0 bottom-0 h-px" />
          <div className="relative">
            <div className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
              CLF-C02 // Signal Mode
            </div>
            <h1 className="tips-title-glow mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Why AWS Concepts Work The Way They Do
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 md:text-base">
              This page teaches AWS exam topics using metaphors and system logic, so answers feel
              intuitive instead of memorized.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {examFacts.map((fact) => (
                <div key={fact.label} className="tips-rs-card rounded-md border border-white/10 bg-black/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-200">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">{fact.value}</p>
                  <p className="mt-1 text-xs text-slate-300">{fact.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/quiz?mode=exam" className="tips-rs-cta tips-rs-cta-primary">
                Start Timed Exam
              </Link>
              <Link href="/quiz" className="tips-rs-cta">
                Practice Questions
              </Link>
              <Link href="/dashboard" className="tips-rs-cta">
                Check Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className={`${cardBase} tips-rs-panel tips-rs-frame border-white/10 bg-black/40 p-4 md:p-5`}>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-wrap gap-2">
              {tabItems.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${tabButtonClass(
                      isActive
                    )}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search concepts, metaphors, or services"
                className={`${inputBase} tips-rs-input w-full border-white/10 bg-black/45 text-slate-100 placeholder:text-slate-400/55`}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {domainFilters.map((domain) => {
              const isActive = domain === domainFilter;
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setDomainFilter(domain)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${filterButtonClass(
                    isActive
                  )}`}
                >
                  {domain}
                </button>
              );
            })}
          </div>

          <div className="tips-status-strip mt-3">
            <span className="tips-status-chip">Panel: {activeTabLabel}</span>
            <span className="tips-status-chip">Filter: {domainFilter}</span>
            <span className="tips-status-chip">Search: {queryLabel}</span>
            <span className="tips-status-chip">Visible: {activeResultCount}</span>
          </div>
        </section>

        <section className={`${cardBase} tips-rs-panel tips-rs-frame tips-panel-shell border-white/10 bg-black/40 p-5 md:p-6`}>
          <div key={activeTab} className="tips-tab-stage">
            {activeTab === "models" && renderMentalModelsTab()}
            {activeTab === "phrases" && renderPhrasesTab()}
            {activeTab === "keywords" && renderKeywordsTab()}
            {activeTab === "checklist" && renderChecklistTab()}
          </div>
        </section>
      </div>
    </SurfaceShell>
  );
}
