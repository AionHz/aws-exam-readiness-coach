"use client";

import { useMemo, useState } from "react";

type Consistency = "strong" | "steady" | "lumpy";

type Industry = {
  id: string;
  name: string;
  favor: number;
  headline: string;
  uses: string[];
  revenueMoves: string[];
};

const industries: Industry[] = [
  {
    id: "restaurant",
    name: "Restaurant / QSR",
    favor: 8,
    headline: "Fast inventory turns make a short-term advance easier to defend.",
    uses: [
      "Bulk-buy proteins, liquor, disposables, or seasonal ingredients before price spikes.",
      "Launch a catering push with paid local ads, menu inserts, and delivery-platform promos.",
      "Repair refrigeration, hood systems, POS, or patio seating before peak weekends.",
    ],
    revenueMoves: [
      "Push prepaid catering deposits to bring cash in before the event labor hits.",
      "Pair the advance with a weekly special that uses high-margin items, not just discounts.",
    ],
  },
  {
    id: "contractor",
    name: "Contractor / Construction",
    favor: 7,
    headline: "Good for mobilizing jobs when signed work is waiting on materials or labor.",
    uses: [
      "Put deposits on materials so crews are not sitting idle waiting on supplier credit.",
      "Cover payroll for a crew expansion tied to a signed job or subcontract.",
      "Rent equipment for a short window instead of delaying a profitable project.",
    ],
    revenueMoves: [
      "Use funds only against scheduled work, then collect progress payments faster.",
      "Turn one large job into two crews running at once if the calendar supports it.",
    ],
  },
  {
    id: "trucking",
    name: "Trucking / Logistics",
    favor: 6,
    headline: "Works when receivables are real and repairs unlock trucks that already have lanes.",
    uses: [
      "Repair a down truck or trailer when the load board opportunity is immediate.",
      "Bridge fuel, insurance, permits, or driver payroll before broker invoices settle.",
      "Add a leased truck for a dedicated route instead of random spot-market risk.",
    ],
    revenueMoves: [
      "Prioritize lanes with fast-paying brokers or factoring already in place.",
      "Use the advance to keep assets moving, not to cover chronically weak margins.",
    ],
  },
  {
    id: "auto",
    name: "Auto Repair / Tire",
    favor: 8,
    headline: "Strong MCA fit when bays are busy and parts availability is the bottleneck.",
    uses: [
      "Stock high-turn tires, brake kits, batteries, and fluids before demand hits.",
      "Repair lifts, compressors, alignment machines, or diagnostic equipment.",
      "Market fleet maintenance packages to local delivery, taxi, or trade businesses.",
    ],
    revenueMoves: [
      "Bundle diagnostics with same-day repair approvals to raise ticket size.",
      "Use financing to reduce parts delays that cause customers to shop elsewhere.",
    ],
  },
  {
    id: "medical",
    name: "Medical / Dental",
    favor: 8,
    headline: "Recurring patient flow and high ticket size can support clean offers.",
    uses: [
      "Upgrade treatment rooms, imaging, sterilization, or patient financing promotions.",
      "Add paid search for high-intent procedures instead of broad brand campaigns.",
      "Bridge insurance reimbursement timing while keeping schedule capacity full.",
    ],
    revenueMoves: [
      "Fund a specific procedure campaign with tracked consults and booked cases.",
      "Use capital to remove operational constraints, not just decorate the office.",
    ],
  },
  {
    id: "retail",
    name: "Retail / E-commerce",
    favor: 7,
    headline: "Inventory discipline matters: capital should chase proven SKUs.",
    uses: [
      "Buy proven products deeper before a season, holiday, or supplier discount window.",
      "Fund packaging, fulfillment labor, or ad spend for products with known conversion.",
      "Open a pop-up or local event table when prior sell-through is proven.",
    ],
    revenueMoves: [
      "Reorder winners first; do not use expensive money to test unproven inventory.",
      "Tie the term to inventory turnover so the payback matches the cash cycle.",
    ],
  },
  {
    id: "salon",
    name: "Salon / Med Spa",
    favor: 7,
    headline: "Upsellable services and memberships can make smaller advances productive.",
    uses: [
      "Buy product inventory with strong retail margin and repeat demand.",
      "Add equipment for booked services such as laser, facial, massage, or injectables.",
      "Run a reactivation campaign to prior clients with limited appointment blocks.",
    ],
    revenueMoves: [
      "Sell packages or memberships before spending heavily on new-client ads.",
      "Use capital to fill unused chair or room capacity, not just expand fixed overhead.",
    ],
  },
  {
    id: "home-services",
    name: "HVAC / Plumbing / Home Services",
    favor: 8,
    headline: "Emergency-demand businesses can turn speed into booked revenue.",
    uses: [
      "Stock parts for the most common repairs during weather-driven demand spikes.",
      "Add a service vehicle wrap, lead-response system, or dispatcher coverage.",
      "Fund technician payroll while a backlog of booked calls is being completed.",
    ],
    revenueMoves: [
      "Aim funds at faster response time, because speed often wins the call.",
      "Push maintenance plans to convert one-time jobs into repeat revenue.",
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing / Wholesale",
    favor: 6,
    headline: "Good when purchase orders or repeat buyers support the cash cycle.",
    uses: [
      "Buy raw materials for a confirmed order without exhausting operating cash.",
      "Cover overtime or temp labor to ship a profitable batch on time.",
      "Repair production equipment that is blocking completed sales.",
    ],
    revenueMoves: [
      "Tie funding to purchase orders, not speculative production.",
      "Ask suppliers for early-pay discounts while using the advance for timing.",
    ],
  },
  {
    id: "liquor",
    name: "Liquor / Convenience",
    favor: 8,
    headline: "Frequent deposits and fast inventory cycles are attractive when balances stay clean.",
    uses: [
      "Stock high-velocity alcohol, tobacco, lottery-adjacent goods, or convenience items.",
      "Upgrade coolers, signage, security, or POS to improve throughput.",
      "Buy ahead for holidays, events, or local seasonal demand.",
    ],
    revenueMoves: [
      "Use capital for inventory that turns weekly, not slow novelty items.",
      "Create bundle pricing that raises average ticket without discounting the whole basket.",
    ],
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatMoney(value: number) {
  return currency.format(Math.round(value));
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getTier(score: number) {
  if (score >= 82) return "A file";
  if (score >= 68) return "B file";
  if (score >= 52) return "C file";
  return "High-risk file";
}

export default function Home() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(125000);
  const [dailyBalance, setDailyBalance] = useState(14500);
  const [creditScore, setCreditScore] = useState(665);
  const [timeInBusiness, setTimeInBusiness] = useState(36);
  const [nsfs, setNsfs] = useState(1);
  const [negativeDays, setNegativeDays] = useState(0);
  const [existingDailyPayments, setExistingDailyPayments] = useState(425);
  const [consistency, setConsistency] = useState<Consistency>("steady");
  const [industryId, setIndustryId] = useState("restaurant");
  const [requestedAmount, setRequestedAmount] = useState(100000);
  const [termWeeks, setTermWeeks] = useState(36);

  const selectedIndustry =
    industries.find((industry) => industry.id === industryId) ?? industries[0];

  const underwriting = useMemo(() => {
    const dailyRevenue = monthlyRevenue / 21.5;
    const balanceCoverage = dailyBalance / Math.max(dailyRevenue, 1);
    const creditPoints = clamp((creditScore - 500) / 2.8, 0, 60);
    const revenuePoints = clamp((monthlyRevenue - 25000) / 2500, 0, 35);
    const balancePoints = clamp(balanceCoverage * 28, 0, 24);
    const timePoints = clamp(timeInBusiness / 2, 0, 18);
    const industryPoints = selectedIndustry.favor;
    const consistencyPoints =
      consistency === "strong" ? 8 : consistency === "steady" ? 4 : -6;
    const nsfPenalty = nsfs * 4;
    const negativePenalty = negativeDays * 2.2;
    const debitPenalty = clamp(existingDailyPayments / Math.max(dailyRevenue, 1), 0, 0.4) * 35;
    const rawScore =
      24 +
      creditPoints +
      revenuePoints +
      balancePoints +
      timePoints +
      industryPoints +
      consistencyPoints -
      nsfPenalty -
      negativePenalty -
      debitPenalty;
    const score = clamp(Math.round(rawScore), 18, 96);
    const tier = getTier(score);
    const riskPremium = clamp((82 - score) / 100, 0, 0.34);
    const revenueMultiplier =
      score >= 82 ? 1.28 : score >= 68 ? 1.02 : score >= 52 ? 0.72 : 0.42;
    const dailyPaymentCapacity = Math.max(
      0,
      Math.min(dailyRevenue * 0.14, dailyBalance * 0.32) -
        existingDailyPayments,
    );
    const standardFactor = 1.22 + riskPremium;
    const standardTermDays = 36 * 5;
    const cashFlowCap =
      (dailyPaymentCapacity * standardTermDays) / standardFactor;
    const revenueCap = monthlyRevenue * revenueMultiplier;
    const maxApproval = Math.max(
      5000,
      Math.min(revenueCap, cashFlowCap, monthlyRevenue * 1.45),
    );

    return {
      balanceCoverage,
      dailyPaymentCapacity,
      dailyRevenue,
      maxApproval,
      score,
      tier,
    };
  }, [
    creditScore,
    dailyBalance,
    existingDailyPayments,
    monthlyRevenue,
    negativeDays,
    nsfs,
    selectedIndustry.favor,
    timeInBusiness,
    consistency,
  ]);

  const offer = useMemo(() => {
    const amount = clamp(requestedAmount, 5000, underwriting.maxApproval);
    const amountPressure = amount / Math.max(underwriting.maxApproval, 1);
    const termPressure = (termWeeks - 24) / 52;
    const scoreDiscount = clamp((underwriting.score - 70) / 260, -0.05, 0.05);
    const factor = clamp(
      1.18 + amountPressure * 0.09 + termPressure * 0.1 - scoreDiscount,
      1.15,
      1.49,
    );
    const payback = amount * factor;
    const termDays = termWeeks * 5;
    const dailyPayment = payback / termDays;
    const holdback = dailyPayment / Math.max(underwriting.dailyRevenue, 1);
    const marginToCapacity =
      underwriting.dailyPaymentCapacity - dailyPayment;

    return {
      amount,
      dailyPayment,
      factor,
      holdback,
      marginToCapacity,
      payback,
      termDays,
    };
  }, [requestedAmount, termWeeks, underwriting]);

  const maxAmount = Math.max(5000, Math.round(underwriting.maxApproval / 1000) * 1000);
  const amountValue = clamp(requestedAmount, 5000, maxAmount);

  function updateMaxAwareAmount(value: number) {
    setRequestedAmount(clamp(value, 5000, maxAmount));
  }

  const redFlags = [
    negativeDays > 5
      ? "Too many negative days: expect stips, lower approval, or decline pressure."
      : "Negative-day pattern is workable.",
    nsfs > 3
      ? "NSF count is high; sell the file around recent clean activity if available."
      : "NSF count is not the main objection.",
    existingDailyPayments > underwriting.dailyRevenue * 0.12
      ? "Existing daily debits are already eating capacity; position payoff or consolidation."
      : "Existing daily debits leave room for a new payment.",
    underwriting.balanceCoverage < 1.2
      ? "Average balance is thin compared with daily revenue; keep payment conservative."
      : "Average balance gives the underwriter comfort that daily ACH can clear.",
  ];

  const approvalUse = amountValue / Math.max(maxAmount, 1);
  const paymentUtilization =
    offer.dailyPayment / Math.max(underwriting.dailyPaymentCapacity, 1);
  const payoffPerDollar = offer.payback / Math.max(offer.amount, 1);
  const offerModes = [
    {
      label: "Conservative",
      amount: underwriting.maxApproval * 0.72,
      term: 44,
      note: "Easiest payment conversation.",
    },
    {
      label: "Balanced",
      amount: underwriting.maxApproval * 0.88,
      term: 36,
      note: "Best starting point for most calls.",
    },
    {
      label: "Stretch",
      amount: underwriting.maxApproval,
      term: 30,
      note: "Use when merchant pushes for max cash.",
    },
  ];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">BC</span>
          <div>
            <strong>Broker Club</strong>
            <small>MCA sales engine</small>
          </div>
        </div>
        <div className="call-flow" aria-label="Call workflow">
          <span>1. Qualify</span>
          <span>2. Size</span>
          <span>3. Price</span>
          <span>4. Close</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Live offer desk</p>
          <h1>Turn bank-statement signals into a cleaner phone offer.</h1>
          <p>
            Enter the few details that actually move MCA underwriting, then
            adjust amount and term while the approval, payment, and close angle
            update in real time.
          </p>
        </div>
        <div className="hero-card" aria-label="Current approval snapshot">
          <span className="status-pill">{underwriting.tier}</span>
          <small>Estimated max approval</small>
          <strong>{formatMoney(underwriting.maxApproval)}</strong>
          <div className="approval-bar">
            <i style={{ width: `${clamp(approvalUse * 100, 0, 100)}%` }} />
          </div>
          <em>
            Current ask uses {formatPercent(approvalUse)} of calculated capacity
          </em>
        </div>
      </section>

      <section className="summary-grid" aria-label="Deal snapshot">
        <div className="snapshot-card accent">
          <span>Offer amount</span>
          <strong>{formatMoney(amountValue)}</strong>
          <small>{termWeeks} week term</small>
        </div>
        <div className="snapshot-card">
          <span>Daily ACH</span>
          <strong>{formatMoney(offer.dailyPayment)}</strong>
          <small>{formatPercent(paymentUtilization)} of payment room</small>
        </div>
        <div className="snapshot-card">
          <span>Factor</span>
          <strong>{offer.factor.toFixed(2)}</strong>
          <small>{payoffPerDollar.toFixed(2)} payback per $1</small>
        </div>
        <div className="snapshot-card">
          <span>Holdback</span>
          <strong>{formatPercent(offer.holdback)}</strong>
          <small>{formatMoney(underwriting.dailyRevenue)} est. daily rev</small>
        </div>
      </section>

      <section className="deal-desk">
        <aside className="panel input-panel">
          <div className="panel-heading">
            <span>Inputs</span>
            <h2>Merchant profile</h2>
            <p>Grouped the way an underwriter thinks: revenue, cash cushion, and stress signals.</p>
          </div>

          <div className="input-group">
            <h3>Revenue & Cushion</h3>
            <div className="field-grid">
              <label>
                Monthly gross deposits
                <input
                  type="number"
                  min="0"
                  value={monthlyRevenue}
                  onChange={(event) =>
                    setMonthlyRevenue(Number(event.target.value))
                  }
                />
              </label>
              <label>
                Average daily balance
                <input
                  type="number"
                  min="0"
                  value={dailyBalance}
                  onChange={(event) =>
                    setDailyBalance(Number(event.target.value))
                  }
                />
              </label>
              <label>
                Existing daily MCA/loan debits
                <input
                  type="number"
                  min="0"
                  value={existingDailyPayments}
                  onChange={(event) =>
                    setExistingDailyPayments(Number(event.target.value))
                  }
                />
              </label>
              <label>
                Deposit pattern
                <select
                  value={consistency}
                  onChange={(event) =>
                    setConsistency(event.target.value as Consistency)
                  }
                >
                  <option value="strong">Strong daily/weekly deposits</option>
                  <option value="steady">Steady with normal swings</option>
                  <option value="lumpy">Lumpy / transfer-heavy</option>
                </select>
              </label>
            </div>
          </div>

          <div className="input-group">
            <h3>Risk & Eligibility</h3>
            <div className="field-grid">
              <label>
                Owner credit score
                <input
                  type="number"
                  min="450"
                  max="850"
                  value={creditScore}
                  onChange={(event) =>
                    setCreditScore(Number(event.target.value))
                  }
                />
              </label>
              <label>
                Months in business
                <input
                  type="number"
                  min="0"
                  value={timeInBusiness}
                  onChange={(event) =>
                    setTimeInBusiness(Number(event.target.value))
                  }
                />
              </label>
              <label>
                NSFs in last 90 days
                <input
                  type="number"
                  min="0"
                  value={nsfs}
                  onChange={(event) => setNsfs(Number(event.target.value))}
                />
              </label>
              <label>
                Negative days in 90 days
                <input
                  type="number"
                  min="0"
                  value={negativeDays}
                  onChange={(event) =>
                    setNegativeDays(Number(event.target.value))
                  }
                />
              </label>
            </div>
          </div>
        </aside>

        <section className="panel offer-panel">
          <div className="panel-heading horizontal">
            <div>
              <span>Offer</span>
              <h2>Approval builder</h2>
            </div>
            <div className="score-badge">
              <b>{underwriting.score}</b>
              <small>{underwriting.tier}</small>
            </div>
          </div>

          <div className="underwriting-strip">
            <div>
              <span>Daily revenue</span>
              <b>{formatMoney(underwriting.dailyRevenue)}</b>
            </div>
            <div>
              <span>Payment room</span>
              <b>{formatMoney(underwriting.dailyPaymentCapacity)}</b>
            </div>
            <div>
              <span>Balance coverage</span>
              <b>{underwriting.balanceCoverage.toFixed(1)}x</b>
            </div>
          </div>

          <div className="slider-card">
            <label className="slider-row">
              <span>
                Funding amount <b>{formatMoney(amountValue)}</b>
              </span>
              <input
                type="range"
                min="5000"
                max={maxAmount}
                step="1000"
                value={amountValue}
                onChange={(event) =>
                  updateMaxAwareAmount(Number(event.target.value))
                }
              />
            </label>
            <label className="slider-row">
              <span>
                Term <b>{termWeeks} weeks</b>
              </span>
              <input
                type="range"
                min="12"
                max="72"
                step="2"
                value={termWeeks}
                onChange={(event) => setTermWeeks(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="numbers-grid">
            <div>
              <span>Total payback</span>
              <strong>{formatMoney(offer.payback)}</strong>
            </div>
            <div>
              <span>Daily ACH</span>
              <strong>{formatMoney(offer.dailyPayment)}</strong>
            </div>
            <div>
              <span>Factor</span>
              <strong>{offer.factor.toFixed(2)}</strong>
            </div>
            <div>
              <span>Term days</span>
              <strong>{offer.termDays}</strong>
            </div>
          </div>

          <div
            className={
              offer.marginToCapacity >= 0 ? "capacity good" : "capacity bad"
            }
          >
            <b>{offer.marginToCapacity >= 0 ? "Payment fits" : "Payment pressure"}</b>
            <span>
              {offer.marginToCapacity >= 0
                ? `${formatMoney(
                    offer.marginToCapacity,
                  )} cushion under estimated daily capacity.`
                : `${formatMoney(
                    Math.abs(offer.marginToCapacity),
                  )} over capacity. Lower amount, extend term, or position payoff.`}
            </span>
          </div>

          <div className="scenario-grid">
            {offerModes.map((mode) => (
              <button
                type="button"
                key={mode.label}
                onClick={() => {
                  updateMaxAwareAmount(Math.round(mode.amount / 1000) * 1000);
                  setTermWeeks(mode.term);
                }}
              >
                <b>{mode.label}</b>
                <span>{formatMoney(mode.amount)}</span>
                <small>{mode.note}</small>
              </button>
            ))}
          </div>
        </section>
      </section>

      <section className="close-zone">
        <div className="panel read-panel">
          <div className="panel-heading">
            <span>Underwriter read</span>
            <h2>Say the objection before they do.</h2>
          </div>
          <ul className="signal-list">
            {redFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
          <div className="talk-track">
            <span>Phone line</span>
            <p>
              “I would not just quote this as ‘how much is 100K.’ Based on the
              deposits and balance, I’d frame <b>{formatMoney(amountValue)}</b>{" "}
              around <b>{formatMoney(offer.dailyPayment)}</b> daily. If that
              payment feels tight, we tune the term now before underwriting
              cuts it for us.”
            </p>
          </div>
        </div>

        <div className="panel industry-panel">
          <div className="panel-heading horizontal">
            <div>
              <span>Industry close</span>
              <h2>Make the capital feel specific.</h2>
            </div>
            <label className="industry-select">
              Merchant industry
              <select
                value={industryId}
                onChange={(event) => setIndustryId(event.target.value)}
              >
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <h3>{selectedIndustry.headline}</h3>
          <div className="use-grid">
            <div>
              <span>Use the funds for</span>
              <ul>
                {selectedIndustry.uses.map((use) => (
                  <li key={use}>{use}</li>
                ))}
              </ul>
            </div>
            <div>
              <span>Revenue angle</span>
              <ul>
                {selectedIndustry.revenueMoves.map((move) => (
                  <li key={move}>{move}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="reference-strip" aria-label="Underwriting basis">
        <strong>Underwriting basis</strong>
        <span>monthly deposits</span>
        <span>average daily balance</span>
        <span>NSFs / negative days</span>
        <span>existing ACH debits</span>
        <span>time in business</span>
        <span>credit</span>
        <span>industry risk</span>
      </section>
    </main>
  );
}
