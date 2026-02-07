"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import SurfaceShell from "../components/SurfaceShell";
import { PremiumButton } from "../components/PremiumButton";
import { cardBase, cardHover, inputBase, linkReset } from "../lib/ui";

type FlowMode = "normal" | "spike" | "degraded";
type ComputePlane = "ec2" | "lambda" | "fargate";
type PricingModel = "ondemand" | "savings" | "spot";
type BlueprintId = "threeTier" | "serverlessApi" | "eventDriven";

type FlowNode = {
  id: string;
  title: string;
  sub: string;
  purpose: string;
  examCue: string;
};

type ScenarioPreset = {
  id: string;
  label: string;
  blueprint: BlueprintId;
  mode: FlowMode;
  traffic: number;
  azAOutage: boolean;
  compute: ComputePlane;
  cacheEnabled: boolean;
  s3Enabled: boolean;
  rdsEnabled: boolean;
  wafEnabled: boolean;
  kmsEnabled: boolean;
  vpcEndpointEnabled: boolean;
  pricing: PricingModel;
};

type RuntimeConfig = Omit<ScenarioPreset, "id" | "label" | "blueprint">;

type DeploymentBlueprint = {
  id: BlueprintId;
  label: string;
  pattern: string;
  description: string;
  services: string[];
  examCue: string;
  config: RuntimeConfig;
};

type FeatureItem = {
  id:
    | "ec2"
    | "lambda"
    | "fargate"
    | "cloudfront"
    | "s3"
    | "rds"
    | "waf"
    | "kms"
    | "vpce"
    | "pricing";
  label: string;
  domain: string;
  useWhen: string;
  examCue: string;
  tradeoff: string;
};

const FLOW_NODES_BASE: Omit<FlowNode, "id">[] = [
  {
    title: "Users",
    sub: "Global traffic",
    purpose: "Request sources from browsers, mobile apps, and API consumers.",
    examCue: "Bursty traffic + global users means edge caching and elasticity matter.",
  },
  {
    title: "Route 53",
    sub: "DNS + health checks",
    purpose: "Routes to healthy endpoints using DNS policies and checks.",
    examCue: "DNS failover and health-based routing point to Route 53.",
  },
  {
    title: "CloudFront",
    sub: "Edge acceleration",
    purpose: "Caches responses near users to reduce origin load and latency.",
    examCue: "Global low-latency static/media delivery means CloudFront.",
  },
  {
    title: "ALB",
    sub: "Traffic distribution",
    purpose: "Balances HTTP(S) traffic across healthy targets and zones.",
    examCue: "Path-based routing and health checks map to ALB.",
  },
  {
    title: "Compute",
    sub: "Elastic execution",
    purpose: "Runs workloads and scales with traffic profile.",
    examCue: "Choose EC2, Lambda, or Fargate based on control vs ops needs.",
  },
  {
    title: "Data Layer",
    sub: "State + objects",
    purpose: "Stores transaction state and durable object data.",
    examCue: "Transactional data often maps to RDS; assets/logs/backups to S3.",
  },
];

const FEATURE_LIBRARY: FeatureItem[] = [
  {
    id: "ec2",
    label: "EC2 ASG",
    domain: "Technology",
    useWhen: "You need deep OS/runtime control with autoscaling over instances.",
    examCue: "Custom runtime, host-level access, and scaling policies.",
    tradeoff: "More operational responsibility (patching, AMIs, capacity tuning).",
  },
  {
    id: "lambda",
    label: "Lambda",
    domain: "Technology",
    useWhen: "Event-driven workloads with short execution and minimal ops overhead.",
    examCue: "Run code without managing servers.",
    tradeoff: "Execution limits and cold-start considerations for some patterns.",
  },
  {
    id: "fargate",
    label: "Fargate",
    domain: "Technology",
    useWhen: "Containerized workloads without managing EC2 worker nodes.",
    examCue: "Containers + no server management.",
    tradeoff: "Less host-level control than self-managed container nodes.",
  },
  {
    id: "cloudfront",
    label: "CloudFront",
    domain: "Technology",
    useWhen: "Global users need fast delivery and origin offload.",
    examCue: "Low-latency content via edge locations.",
    tradeoff: "Cache behavior and invalidation strategy must be designed carefully.",
  },
  {
    id: "s3",
    label: "Amazon S3",
    domain: "Technology",
    useWhen: "Object storage for assets, logs, backup, and static content.",
    examCue: "Durable object storage at scale.",
    tradeoff: "Not a low-latency block or relational transactional store.",
  },
  {
    id: "rds",
    label: "Amazon RDS",
    domain: "Technology",
    useWhen: "Managed relational workloads with backups and patching automation.",
    examCue: "Managed relational database service.",
    tradeoff: "Schema/query design still matters for performance and cost.",
  },
  {
    id: "waf",
    label: "AWS WAF",
    domain: "Security",
    useWhen: "You need L7 filtering for SQLi/XSS and custom request rules.",
    examCue: "Block common web exploits before app origin.",
    tradeoff: "Rules must be tuned to reduce false positives.",
  },
  {
    id: "kms",
    label: "AWS KMS",
    domain: "Security",
    useWhen: "Centralized encryption key governance, rotation, and audit trails.",
    examCue: "Managed key lifecycle + policy control.",
    tradeoff: "Adds policy design complexity and key access governance.",
  },
  {
    id: "vpce",
    label: "VPC Endpoint",
    domain: "Security",
    useWhen: "Private connectivity to AWS services without public internet paths.",
    examCue: "Private subnet to AWS service without NAT/IGW exposure.",
    tradeoff: "Requires route/policy planning and endpoint scope control.",
  },
  {
    id: "pricing",
    label: "Pricing Model",
    domain: "Billing",
    useWhen: "Match spend model to demand profile: flexible, committed, or interruptible.",
    examCue: "On-Demand vs Savings vs Spot decision pattern.",
    tradeoff: "Cheaper models usually trade flexibility or interruption risk.",
  },
];

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "steady",
    label: "Steady SaaS",
    blueprint: "threeTier",
    mode: "normal",
    traffic: 42,
    azAOutage: false,
    compute: "ec2",
    cacheEnabled: true,
    s3Enabled: true,
    rdsEnabled: true,
    wafEnabled: true,
    kmsEnabled: true,
    vpcEndpointEnabled: true,
    pricing: "savings",
  },
  {
    id: "launch",
    label: "Product Launch",
    blueprint: "serverlessApi",
    mode: "spike",
    traffic: 90,
    azAOutage: false,
    compute: "lambda",
    cacheEnabled: true,
    s3Enabled: true,
    rdsEnabled: true,
    wafEnabled: true,
    kmsEnabled: true,
    vpcEndpointEnabled: false,
    pricing: "ondemand",
  },
  {
    id: "incident",
    label: "Incident Drill",
    blueprint: "eventDriven",
    mode: "degraded",
    traffic: 72,
    azAOutage: true,
    compute: "fargate",
    cacheEnabled: false,
    s3Enabled: true,
    rdsEnabled: true,
    wafEnabled: true,
    kmsEnabled: true,
    vpcEndpointEnabled: true,
    pricing: "ondemand",
  },
  {
    id: "batch",
    label: "Batch + Cost",
    blueprint: "eventDriven",
    mode: "normal",
    traffic: 30,
    azAOutage: false,
    compute: "ec2",
    cacheEnabled: false,
    s3Enabled: true,
    rdsEnabled: false,
    wafEnabled: false,
    kmsEnabled: true,
    vpcEndpointEnabled: false,
    pricing: "spot",
  },
];

const DEPLOYMENT_BLUEPRINTS: DeploymentBlueprint[] = [
  {
    id: "threeTier",
    label: "3-Tier Web App",
    pattern: "Route 53 -> CloudFront -> ALB -> EC2 ASG -> RDS + S3",
    description:
      "Classic web architecture with load-balanced EC2 instances, managed relational data, and object storage.",
    services: ["Route 53", "CloudFront", "ALB", "EC2 ASG", "RDS Multi-AZ", "S3", "WAF", "KMS"],
    examCue: "Highly available web app with layered routing, caching, and managed persistence.",
    config: {
      mode: "normal",
      traffic: 48,
      azAOutage: false,
      compute: "ec2",
      cacheEnabled: true,
      s3Enabled: true,
      rdsEnabled: true,
      wafEnabled: true,
      kmsEnabled: true,
      vpcEndpointEnabled: true,
      pricing: "savings",
    },
  },
  {
    id: "serverlessApi",
    label: "Serverless API",
    pattern: "Route 53 -> API Gateway -> Lambda -> S3/RDS",
    description:
      "API-first model for bursty traffic where managed endpoints and Lambda reduce operational overhead.",
    services: ["Route 53", "API Gateway", "Lambda", "S3", "KMS", "WAF"],
    examCue: "Event-driven endpoints, variable traffic, and minimal server management point to serverless.",
    config: {
      mode: "spike",
      traffic: 78,
      azAOutage: false,
      compute: "lambda",
      cacheEnabled: true,
      s3Enabled: true,
      rdsEnabled: false,
      wafEnabled: true,
      kmsEnabled: true,
      vpcEndpointEnabled: false,
      pricing: "ondemand",
    },
  },
  {
    id: "eventDriven",
    label: "Event-Driven Pipeline",
    pattern: "Producers -> EventBridge -> SQS -> Lambda/Fargate -> S3/RDS",
    description:
      "Decoupled consumers process asynchronous workloads with buffering to absorb spikes and failures.",
    services: ["EventBridge", "SQS", "Lambda/Fargate", "S3", "RDS", "VPC Endpoint", "KMS"],
    examCue: "Need loose coupling, retry tolerance, and resilient async processing.",
    config: {
      mode: "degraded",
      traffic: 65,
      azAOutage: false,
      compute: "fargate",
      cacheEnabled: false,
      s3Enabled: true,
      rdsEnabled: true,
      wafEnabled: false,
      kmsEnabled: true,
      vpcEndpointEnabled: true,
      pricing: "spot",
    },
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildSparklinePath(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function metricTrendSeries(base: number, variance: number, points = 30): number[] {
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(i / 3.4) * variance;
    const micro = Math.cos(i / 1.9) * variance * 0.35;
    return Math.max(0, base + wave + micro);
  });
}

function FlowModeButton({
  mode,
  activeMode,
  onClick,
  label,
}: {
  mode: FlowMode;
  activeMode: FlowMode;
  onClick: (mode: FlowMode) => void;
  label: string;
}) {
  const isActive = mode === activeMode;
  return (
    <button
      type="button"
      onClick={() => onClick(mode)}
      className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
        isActive
          ? "border-sky-300/70 bg-sky-400/15 text-sky-100"
          : "border-white/10 bg-black/35 text-white/75 hover:bg-black/55"
      }`}
    >
      {label}
    </button>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "sky",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "sky" | "emerald" | "violet" | "cyan" | "rose";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "violet"
        ? "text-violet-200"
        : tone === "cyan"
          ? "text-cyan-200"
          : tone === "rose"
            ? "text-rose-200"
            : "text-sky-200";

  return (
    <div className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-4`}>
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-xs text-white/60">{detail}</div>
    </div>
  );
}

function SparklineCard({
  title,
  values,
  color,
  unit,
}: {
  title: string;
  values: number[];
  color: string;
  unit: string;
}) {
  const width = 460;
  const height = 90;
  const path = buildSparklinePath(values, width, height);
  const latest = values[values.length - 1] ?? 0;

  return (
    <div className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-4`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">{title}</div>
        <div className="text-sm font-semibold text-white/85">
          {latest.toFixed(0)} {unit}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full">
        <defs>
          <linearGradient id={`grad-${title.replace(/\s+/g, "-").toLowerCase()}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L ${width},${height} L 0,${height} Z`}
          fill={`url(#grad-${title.replace(/\s+/g, "-").toLowerCase()})`}
          opacity="0.35"
        />
        <path d={path} fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function HandsOnClient() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<BlueprintId>("threeTier");
  const [mode, setMode] = useState<FlowMode>("normal");
  const [traffic, setTraffic] = useState(48);
  const [azAOutage, setAzAOutage] = useState(false);
  const [computePlane, setComputePlane] = useState<ComputePlane>("ec2");
  const [pricingModel, setPricingModel] = useState<PricingModel>("savings");

  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [s3Enabled, setS3Enabled] = useState(true);
  const [rdsEnabled, setRdsEnabled] = useState(true);
  const [wafEnabled, setWafEnabled] = useState(true);
  const [kmsEnabled, setKmsEnabled] = useState(true);
  const [vpcEndpointEnabled, setVpcEndpointEnabled] = useState(true);

  const [selectedFeatureId, setSelectedFeatureId] = useState<FeatureItem["id"]>("ec2");

  const selectedFeature =
    FEATURE_LIBRARY.find((feature) => feature.id === selectedFeatureId) ?? FEATURE_LIBRARY[0];
  const activeBlueprint =
    DEPLOYMENT_BLUEPRINTS.find((blueprint) => blueprint.id === selectedBlueprintId) ?? DEPLOYMENT_BLUEPRINTS[0];

  const computeNodeLabel =
    computePlane === "ec2" ? "EC2 ASG" : computePlane === "lambda" ? "Lambda" : "Fargate";
  const capacityResourceLabel =
    computePlane === "ec2" ? "EC2 instance" : computePlane === "lambda" ? "Lambda worker" : "Fargate task";

  const flowNodes: FlowNode[] = useMemo(
    () =>
      FLOW_NODES_BASE.map((node, idx) => {
        if (idx === 0 && selectedBlueprintId === "eventDriven") {
          return {
            id: "ingress",
            ...node,
            title: "Producers",
            sub: "Apps + services",
          };
        }

        if (idx === 4) {
          return {
            id: "compute",
            ...node,
            title: selectedBlueprintId === "eventDriven" ? `${computeNodeLabel} workers` : computeNodeLabel,
            sub:
              computePlane === "ec2"
                ? "Elastic instances"
                : computePlane === "lambda"
                  ? "Event compute"
                  : "Container compute",
          };
        }

        if (idx === 2) {
          if (selectedBlueprintId === "eventDriven") {
            return {
              id: "event-bus",
              ...node,
              title: "EventBridge",
              sub: "Rules + fan-out",
            };
          }

          return {
            id: "edge",
            ...node,
            sub: cacheEnabled ? "Edge caching on" : "Pass-through",
          };
        }

        if (idx === 3) {
          if (selectedBlueprintId === "serverlessApi") {
            return {
              id: "apigw",
              ...node,
              title: "API Gateway",
              sub: "Managed API front door",
            };
          }

          if (selectedBlueprintId === "eventDriven") {
            return {
              id: "queue",
              ...node,
              title: "SQS",
              sub: "Back-pressure buffer",
            };
          }
        }

        if (idx === 5) {
          if (selectedBlueprintId === "serverlessApi") {
            return {
              id: "data",
              ...node,
              sub: s3Enabled ? "Dynamo-style + S3" : "Dynamo-style store",
            };
          }

          const dataParts = [rdsEnabled ? "RDS" : null, s3Enabled ? "S3" : null]
            .filter(Boolean)
            .join(" + ");
          return {
            id: "data",
            ...node,
            sub: dataParts || "No active store",
          };
        }

        return { id: `node-${idx}`, ...node };
      }),
    [selectedBlueprintId, computeNodeLabel, computePlane, cacheEnabled, rdsEnabled, s3Enabled]
  );

  const modeLabel =
    mode === "normal"
      ? "Balanced traffic profile."
      : mode === "spike"
        ? "Burst profile with aggressive scale pressure."
        : "Degraded profile with slower upstream services.";

  const desiredCapacity = useMemo(() => {
    const base = Math.max(2, Math.ceil(traffic / 18));
    const computeAdj = computePlane === "lambda" ? -1 : computePlane === "fargate" ? 0 : 1;
    const modeAdj = mode === "spike" ? 2 : mode === "degraded" ? 1 : 0;
    const outageAdj = azAOutage ? 2 : 0;
    return clamp(base + computeAdj + modeAdj + outageAdj, 2, 12);
  }, [traffic, computePlane, mode, azAOutage]);

  const availability = useMemo(() => {
    const base = 99.97;
    const modePenalty = mode === "degraded" ? 0.6 : mode === "spike" ? 0.23 : 0.08;
    const outagePenalty = azAOutage ? 0.31 : 0;
    const securityPenalty = wafEnabled && vpcEndpointEnabled ? 0.03 : 0.12;
    return clamp(Number((base - modePenalty - outagePenalty - securityPenalty).toFixed(2)), 97.4, 99.99);
  }, [mode, azAOutage, wafEnabled, vpcEndpointEnabled]);

  const cacheHitRate = useMemo(() => {
    if (!cacheEnabled || !s3Enabled) return 0;
    const base = mode === "spike" ? 74 : mode === "degraded" ? 54 : 67;
    const trafficAdj = traffic > 80 ? -6 : traffic < 35 ? 5 : 0;
    return clamp(base + trafficAdj, 0, 95);
  }, [cacheEnabled, s3Enabled, mode, traffic]);

  const p95Latency = useMemo(() => {
    const modeBase = mode === "normal" ? 78 : mode === "spike" ? 121 : 195;
    const computeAdj = computePlane === "lambda" ? 12 : computePlane === "fargate" ? 6 : -3;
    const cacheAdj = cacheEnabled ? -18 : 20;
    const dataAdj = rdsEnabled ? 8 : -12;
    const privateAdj = vpcEndpointEnabled ? -5 : 7;
    const outageAdj = azAOutage ? 38 : 0;
    return clamp(Math.round(modeBase + computeAdj + cacheAdj + dataAdj + privateAdj + outageAdj), 32, 390);
  }, [mode, computePlane, cacheEnabled, rdsEnabled, vpcEndpointEnabled, azAOutage]);

  const requestsPerMin = useMemo(() => {
    const base = (traffic / 100) * 12000;
    const modeAdj = mode === "spike" ? 3800 : mode === "degraded" ? -1300 : 0;
    return Math.max(600, Math.round(base + modeAdj));
  }, [traffic, mode]);

  const blockedRate = useMemo(() => {
    if (!wafEnabled) return 0;
    const base = mode === "spike" ? 2.8 : mode === "degraded" ? 2.0 : 1.2;
    return Number(base.toFixed(1));
  }, [mode, wafEnabled]);

  const errorRate = useMemo(() => {
    const base = mode === "degraded" ? 1.9 : mode === "spike" ? 0.82 : 0.24;
    const outagePenalty = azAOutage ? 1.0 : 0;
    const securityAdj = wafEnabled ? -0.2 : 0.35;
    const spotPenalty = pricingModel === "spot" && mode !== "normal" ? 0.42 : 0;
    return clamp(Number((base + outagePenalty + securityAdj + spotPenalty).toFixed(2)), 0.03, 5.0);
  }, [mode, azAOutage, wafEnabled, pricingModel]);

  const securityScore = useMemo(() => {
    let score = 60;
    if (wafEnabled) score += 12;
    if (kmsEnabled) score += 14;
    if (vpcEndpointEnabled) score += 8;
    if (!rdsEnabled) score -= 3;
    if (mode === "degraded") score -= 4;
    return clamp(score, 35, 100);
  }, [wafEnabled, kmsEnabled, vpcEndpointEnabled, rdsEnabled, mode]);

  const costPerHour = useMemo(() => {
    const computeBase =
      computePlane === "ec2"
        ? desiredCapacity * 0.085
        : computePlane === "fargate"
          ? desiredCapacity * 0.074
          : 0.018 + requestsPerMin / 650000;

    const dataBase = (s3Enabled ? 0.018 : 0) + (rdsEnabled ? 0.155 : 0);
    const edgeBase = cacheEnabled ? 0.032 : 0;
    const securityBase = (wafEnabled ? 0.02 : 0) + (kmsEnabled ? 0.01 : 0) + (vpcEndpointEnabled ? 0.017 : 0);

    const preDiscount = computeBase + dataBase + edgeBase + securityBase;
    const discount =
      pricingModel === "ondemand" ? 1 : pricingModel === "savings" ? 0.74 : computePlane === "lambda" ? 1 : 0.46;

    return Number((preDiscount * discount).toFixed(2));
  }, [
    computePlane,
    desiredCapacity,
    requestsPerMin,
    s3Enabled,
    rdsEnabled,
    cacheEnabled,
    wafEnabled,
    kmsEnabled,
    vpcEndpointEnabled,
    pricingModel,
  ]);

  const monthlyCost = useMemo(() => Number((costPerHour * 730).toFixed(0)), [costPerHour]);

  const flowDuration = mode === "spike" ? 2.05 : mode === "degraded" ? 4.8 : 3.15;
  const pulseOpacity = mode === "degraded" ? 0.56 : 0.9;

  const flowStyle = {
    "--flow-travel": "calc(100% - 2rem)",
    "--flow-duration": `${flowDuration}s`,
    "--flow-opacity": pulseOpacity,
  } as CSSProperties;

  const runtimeSummary = azAOutage
    ? "AZ-A outage active. Traffic reroutes and capacity buffers up to preserve availability."
    : "All zones healthy. Balanced traffic and policy-driven autoscaling are active.";

  const activeFeatureState = useMemo(() => {
    switch (selectedFeature.id) {
      case "ec2":
        return computePlane === "ec2" ? "Active" : "Standby";
      case "lambda":
        return computePlane === "lambda" ? "Active" : "Standby";
      case "fargate":
        return computePlane === "fargate" ? "Active" : "Standby";
      case "cloudfront":
        return cacheEnabled ? "Enabled" : "Disabled";
      case "s3":
        return s3Enabled ? "Enabled" : "Disabled";
      case "rds":
        return rdsEnabled ? "Enabled" : "Disabled";
      case "waf":
        return wafEnabled ? "Enabled" : "Disabled";
      case "kms":
        return kmsEnabled ? "Enabled" : "Disabled";
      case "vpce":
        return vpcEndpointEnabled ? "Enabled" : "Disabled";
      case "pricing":
        return pricingModel === "ondemand"
          ? "On-Demand"
          : pricingModel === "savings"
            ? "Savings"
            : "Spot";
      default:
        return "Active";
    }
  }, [
    selectedFeature,
    computePlane,
    cacheEnabled,
    s3Enabled,
    rdsEnabled,
    wafEnabled,
    kmsEnabled,
    vpcEndpointEnabled,
    pricingModel,
  ]);

  const latencySeries = useMemo(() => metricTrendSeries(p95Latency, 24), [p95Latency]);
  const costSeries = useMemo(() => metricTrendSeries(costPerHour * 100, 6), [costPerHour]);

  const liveEvents = useMemo(() => {
    const events: string[] = [];
    const routingLayer =
      selectedBlueprintId === "serverlessApi"
        ? "API Gateway"
        : selectedBlueprintId === "eventDriven"
          ? "EventBridge + SQS"
          : "ALB";
    events.push(`Deployment blueprint: ${activeBlueprint.label} (${activeBlueprint.pattern}).`);
    events.push(`Route 53 health: ${azAOutage ? "AZ-A degraded" : "all targets healthy"}.`);
    events.push(`${routingLayer} currently handling ${requestsPerMin.toLocaleString()} req/min.`);
    events.push(`Compute plane: ${computeNodeLabel} with desired capacity at ${desiredCapacity}.`);
    events.push(`CloudFront cache hit rate is ${cacheHitRate}% under current profile.`);
    events.push(
      `Security posture: score ${securityScore}/100 (${wafEnabled ? `WAF on, blocking ~${blockedRate}%` : "WAF off"}, ${kmsEnabled ? "KMS on" : "KMS off"}).`
    );
    events.push(
      `Pricing model ${pricingModel.toUpperCase()} gives projected monthly cost around $${monthlyCost}.`
    );
    events.push(`Observed error rate ${errorRate}% and p95 latency ${p95Latency} ms.`);
    return events;
  }, [
    activeBlueprint,
    selectedBlueprintId,
    azAOutage,
    requestsPerMin,
    computeNodeLabel,
    desiredCapacity,
    cacheHitRate,
    securityScore,
    blockedRate,
    wafEnabled,
    kmsEnabled,
    pricingModel,
    monthlyCost,
    errorRate,
    p95Latency,
  ]);

  function applyRuntimeConfig(config: RuntimeConfig) {
    setMode(config.mode);
    setTraffic(config.traffic);
    setAzAOutage(config.azAOutage);
    setComputePlane(config.compute);
    setCacheEnabled(config.cacheEnabled);
    setS3Enabled(config.s3Enabled);
    setRdsEnabled(config.rdsEnabled);
    setWafEnabled(config.wafEnabled);
    setKmsEnabled(config.kmsEnabled);
    setVpcEndpointEnabled(config.vpcEndpointEnabled);
    setPricingModel(config.pricing);
    setSelectedFeatureId(config.compute);
  }

  function applyPreset(preset: ScenarioPreset) {
    setSelectedBlueprintId(preset.blueprint);
    applyRuntimeConfig({
      mode: preset.mode,
      traffic: preset.traffic,
      azAOutage: preset.azAOutage,
      compute: preset.compute,
      cacheEnabled: preset.cacheEnabled,
      s3Enabled: preset.s3Enabled,
      rdsEnabled: preset.rdsEnabled,
      wafEnabled: preset.wafEnabled,
      kmsEnabled: preset.kmsEnabled,
      vpcEndpointEnabled: preset.vpcEndpointEnabled,
      pricing: preset.pricing,
    });
  }

  function applyBlueprint(blueprint: DeploymentBlueprint) {
    setSelectedBlueprintId(blueprint.id);
    applyRuntimeConfig(blueprint.config);
  }

  function toggleFeature(id: FeatureItem["id"]) {
    setSelectedFeatureId(id);
    switch (id) {
      case "ec2":
        setComputePlane("ec2");
        break;
      case "lambda":
        setComputePlane("lambda");
        break;
      case "fargate":
        setComputePlane("fargate");
        break;
      case "cloudfront":
        setCacheEnabled((v) => !v);
        break;
      case "s3":
        setS3Enabled((v) => !v);
        break;
      case "rds":
        setRdsEnabled((v) => !v);
        break;
      case "waf":
        setWafEnabled((v) => !v);
        break;
      case "kms":
        setKmsEnabled((v) => !v);
        break;
      case "vpce":
        setVpcEndpointEnabled((v) => !v);
        break;
      default:
        break;
    }
  }

  const featureState = {
    ec2: computePlane === "ec2",
    lambda: computePlane === "lambda",
    fargate: computePlane === "fargate",
    cloudfront: cacheEnabled,
    s3: s3Enabled,
    rds: rdsEnabled,
    waf: wafEnabled,
    kms: kmsEnabled,
    vpce: vpcEndpointEnabled,
    pricing: true,
  } as Record<FeatureItem["id"], boolean>;

  return (
    <SurfaceShell variant="hero">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        <section
          className={`relative overflow-hidden rounded-3xl border border-white/15 bg-[linear-gradient(145deg,rgba(8,15,32,0.9),rgba(8,23,44,0.78))] p-6 shadow-[0_28px_64px_rgba(3,8,20,0.48)] md:p-8 ${cardHover}`}
        >
          <div className="absolute inset-0 opacity-35 [background:radial-gradient(circle_at_15%_20%,rgba(125,211,252,0.22),transparent_42%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.2),transparent_45%)]" />
          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100">
              Interactive Cockpit
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Hands-on Cloud Fundamentals
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75 md:text-base">
              Click services, inject faults, and switch pricing modes to see how architecture and
              outcomes shift in real time.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/quiz" className={linkReset}>
                <PremiumButton variant="indigo" size="sm">
                  Practice Now
                </PremiumButton>
              </Link>
              <Link href="/tips" className={linkReset}>
                <PremiumButton variant="neutral" size="sm">
                  Open Tips
                </PremiumButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className={`${cardBase} rounded-2xl border-white/15 bg-black/45 p-5 lg:sticky lg:top-[126px] lg:h-fit`}>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Mission Control</div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">Scenario presets</div>
              <div className="mt-2 grid gap-2">
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-white/75 transition hover:border-sky-300/45 hover:bg-sky-400/10 hover:text-sky-100"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">Traffic shape</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <FlowModeButton mode="normal" activeMode={mode} onClick={setMode} label="Normal" />
                <FlowModeButton mode="spike" activeMode={mode} onClick={setMode} label="Spike" />
                <FlowModeButton mode="degraded" activeMode={mode} onClick={setMode} label="Degraded" />
              </div>
              <div className="mt-2 text-xs text-sky-100/80">{modeLabel}</div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-white/50">
                <span>Incoming traffic</span>
                <span className="text-sky-100">{traffic}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={traffic}
                onChange={(e) => setTraffic(Number(e.target.value))}
                className={`${inputBase} mt-2 h-9 w-full cursor-pointer appearance-none bg-black/45 accent-sky-300`}
                aria-label="Traffic percentage"
              />
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Runtime summary</div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{runtimeSummary}</p>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="Availability"
                value={`${availability.toFixed(2)}%`}
                detail="Estimated reliability trend"
                tone="emerald"
              />
              <MetricCard label="P95 Latency" value={`${p95Latency} ms`} detail="User-perceived response speed" tone="sky" />
              <MetricCard label="Cache hit" value={`${cacheHitRate}%`} detail="Edge offload from origin" tone="cyan" />
              <MetricCard
                label="Error rate"
                value={`${errorRate}%`}
                detail="Current request failure ratio"
                tone="rose"
              />
              <MetricCard
                label="Security posture"
                value={`${securityScore}/100`}
                detail="Controls enabled vs exposure"
                tone="violet"
              />
              <MetricCard
                label="Cost / hr"
                value={`$${costPerHour}`}
                detail={`~$${monthlyCost}/month`}
                tone="sky"
              />
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-5`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Reference Deployments</h2>
                  <p className="text-sm text-white/70">
                    Common AWS architecture patterns mapped to CLF-C02 style decision cues.
                  </p>
                </div>
                <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
                  Active: {activeBlueprint.label}
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-3">
                {DEPLOYMENT_BLUEPRINTS.map((blueprint) => {
                  const selected = blueprint.id === selectedBlueprintId;
                  return (
                    <button
                      key={blueprint.id}
                      type="button"
                      onClick={() => applyBlueprint(blueprint)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-sky-300/60 bg-sky-400/15"
                          : "border-white/10 bg-black/45 hover:border-sky-300/35 hover:bg-black/55"
                      }`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">Blueprint</div>
                      <div className="mt-1 text-sm font-semibold text-white">{blueprint.label}</div>
                      <div className="mt-2 text-xs text-white/65">{blueprint.description}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/45 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-200">{activeBlueprint.pattern}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {activeBlueprint.services.map((service, idx) => (
                    <span
                      key={`${service}-${idx}`}
                      className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/80"
                    >
                      {service}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/65">Exam cue: {activeBlueprint.examCue}</p>
              </div>
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-5`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Service Cockpit</h2>
                  <p className="text-sm text-white/70">
                    Every toggle has impact. Select a service to enable/disable and inspect when to use it.
                  </p>
                </div>
                <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
                  {requestsPerMin.toLocaleString()} req/min • {computeNodeLabel}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {FEATURE_LIBRARY.map((feature) => {
                  const active = featureState[feature.id];
                  const selected = selectedFeature.id === feature.id;
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggleFeature(feature.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-sky-300/60 bg-sky-400/15"
                          : active
                            ? "border-cyan-300/45 bg-cyan-400/10"
                            : "border-white/10 bg-black/45 hover:border-sky-300/30"
                      }`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">
                        {feature.domain}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">{feature.label}</div>
                      <div className="mt-1 text-xs text-white/65">{active ? "Enabled" : "Disabled"}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-200">
                      {selectedFeature.label}
                    </div>
                    <p className="mt-1 text-sm text-white/80">{selectedFeature.useWhen}</p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs text-white/70">
                    {activeFeatureState}
                  </div>
                </div>
                <p className="mt-2 text-xs text-white/65">Exam cue: {selectedFeature.examCue}</p>
                <p className="mt-1 text-xs text-white/60">Tradeoff: {selectedFeature.tradeoff}</p>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Pricing model</div>
                <div className="flex flex-wrap gap-2">
                  {([
                    ["ondemand", "On-Demand"],
                    ["savings", "Savings"],
                    ["spot", "Spot"],
                  ] as Array<[PricingModel, string]>).map(([id, label]) => {
                    const active = pricingModel === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setPricingModel(id);
                          setSelectedFeatureId("pricing");
                        }}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                          active
                            ? "border-sky-300/60 bg-sky-400/15 text-sky-100"
                            : "border-white/10 bg-black/35 text-white/70 hover:bg-black/55"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-5`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Request Flow Simulator</h2>
                  <p className="text-sm text-white/70">
                    Live packet flow through routing, edge, compute, and data services.
                  </p>
                </div>
                <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
                  loop {flowDuration.toFixed(1)}s
                </div>
              </div>

              <div className="hands-flow-wrap relative overflow-hidden rounded-xl border border-white/10 bg-black/55 p-4" style={flowStyle}>
                <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-sky-300/0 via-sky-300/60 to-sky-300/0" />
                <div className="hands-flow-dot" />
                <div className="hands-flow-dot hands-flow-dot-2" />

                <div className="relative grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  {flowNodes.map((node) => (
                    <div key={node.id} className="rounded-lg border border-white/10 bg-black/50 p-3 text-center">
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-100">{node.title}</div>
                      <div className="mt-1 text-[11px] text-white/60">{node.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <SparklineCard title="Latency timeline" values={latencySeries} color="#7dd3fc" unit="ms" />
              <SparklineCard title="Cost pressure" values={costSeries} color="#c4b5fd" unit="pts" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <article className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-5`}>
                <h3 className="text-base font-semibold text-white">Resilience + Capacity</h3>
                <p className="mt-1 text-sm text-white/70">Load distribution and autoscaling state under current scenario.</p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/45 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">AZ-A</span>
                      <button
                        type="button"
                        onClick={() => setAzAOutage((v) => !v)}
                        className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          azAOutage
                            ? "border-rose-300/70 bg-rose-400/15 text-rose-100"
                            : "border-emerald-300/60 bg-emerald-400/15 text-emerald-100"
                        }`}
                      >
                        {azAOutage ? "Down" : "Healthy"}
                      </button>
                    </div>
                    <div className="mt-3 h-24 rounded-lg border border-white/10 bg-black/45 p-2">
                      <div className="h-full rounded bg-gradient-to-t from-sky-500/50 to-sky-300/80 transition-all duration-500" style={{ height: `${azAOutage ? 0 : clamp(Math.round(traffic * 0.52), 8, 84)}%` }} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/45 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">AZ-B</span>
                      <span className="text-xs font-semibold text-emerald-300">Healthy</span>
                    </div>
                    <div className="mt-3 h-24 rounded-lg border border-white/10 bg-black/45 p-2">
                      <div className="h-full rounded bg-gradient-to-t from-indigo-500/50 to-cyan-300/80 transition-all duration-500" style={{ height: `${clamp(Math.round(traffic * (azAOutage ? 1.12 : 0.48)), 12, 96)}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const active = i < desiredCapacity;
                    return (
                      <div key={`inst-${i}`} className={`rounded-lg border p-2 text-center transition ${active ? "border-sky-300/50 bg-sky-400/15 text-sky-100" : "border-white/10 bg-black/45 text-white/45"}`}>
                        <div className="text-[10px] uppercase tracking-[0.08em]">{capacityResourceLabel}</div>
                        <div className="mt-0.5 text-[10px] text-white/55">#{String(i + 1).padStart(2, "0")}</div>
                        <div className="mt-1 text-xs font-semibold">{active ? "Online" : "Standby"}</div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className={`${cardBase} rounded-2xl border-white/15 bg-black/40 p-5`}>
                <h3 className="text-base font-semibold text-white">Live Event Feed</h3>
                <div className="mt-3 space-y-2">
                  {liveEvents.map((event, idx) => (
                    <div key={`${event}-${idx}`} className="rounded-lg border border-white/10 bg-black/45 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-200">event {String(idx + 1).padStart(2, "0")}</div>
                      <p className="mt-1 text-xs leading-relaxed text-white/75">{event}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>

      <style jsx>{`
        .hands-flow-wrap {
          --flow-travel: calc(100% - 2rem);
          --flow-duration: 3.6s;
          --flow-opacity: 0.9;
        }

        .hands-flow-dot {
          position: absolute;
          top: 50%;
          left: 1rem;
          width: 0.64rem;
          height: 0.64rem;
          border-radius: 999px;
          background: #93c5fd;
          box-shadow:
            0 0 0.35rem rgba(147, 197, 253, 0.8),
            0 0 0.9rem rgba(56, 189, 248, 0.7);
          opacity: var(--flow-opacity);
          transform: translate3d(0, -50%, 0);
          animation: handsFlow var(--flow-duration) linear infinite;
        }

        .hands-flow-dot-2 {
          width: 0.46rem;
          height: 0.46rem;
          opacity: 0.56;
          animation-delay: calc(var(--flow-duration) * -0.5);
        }

        @keyframes handsFlow {
          from {
            transform: translate3d(0, -50%, 0);
          }
          to {
            transform: translate3d(var(--flow-travel), -50%, 0);
          }
        }
      `}</style>
    </SurfaceShell>
  );
}
