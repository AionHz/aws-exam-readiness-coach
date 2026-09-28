"use client";

import { useMemo, useState } from "react";

type DepositPattern = "strong" | "steady" | "lumpy";
type BankHealth = "clean" | "workable" | "stressed";
type PaymentFrequency = "daily" | "weekly";

type Industry = {
  id: string;
  name: string;
  favor: number;
  headline: string;
  mirror: string;
  uses: string[];
  revenueMoves: string[];
  playbook: {
    title: string;
    detail: string;
  }[];
  lift: number;
};

const industries: Industry[] = [
  {
    id: "restaurant",
    name: "Restaurant / QSR",
    favor: 8,
    headline: "Fast inventory turns make a short-term advance easier to defend.",
    mirror:
      "They are not short on effort; they are usually short on timing: inventory, staff, repairs, and weekend demand all hit before the cash from the rush settles.",
    uses: [
      "Pre-buy the 15-20 highest-turn food, liquor, and disposable items before supplier prices or weekend volume spike.",
      "Fix the bottleneck that blocks covers: cooler, hood, POS, patio seating, signage, or delivery packaging.",
      "Fund a catering push with deposits due upfront, not a broad discount campaign.",
    ],
    revenueMoves: [
      "Turn slow weekdays into prepaid catering and office lunch orders.",
      "Use limited specials around high-margin items instead of discounting the full menu.",
    ],
    playbook: [
      {
        title: "Weekend capacity",
        detail: "Add staff or repair equipment so peak nights stop leaving money on the table.",
      },
      {
        title: "Catering deposits",
        detail: "Sell larger orders with deposits before food and labor costs hit.",
      },
      {
        title: "Margin menu",
        detail: "Push three profitable items hard for 30 days and track ticket lift.",
      },
    ],
    lift: 0.14,
  },
  {
    id: "contractor",
    name: "Contractor / Construction",
    favor: 7,
    headline: "Good for mobilizing jobs when signed work is waiting on materials or labor.",
    mirror:
      "A contractor can have money on the calendar and still miss revenue because materials, payroll, or equipment deposits have to be paid before draws clear.",
    uses: [
      "Put deposits on materials for jobs that are already signed, scoped, and scheduled.",
      "Cover crew payroll for a second team when the calendar has enough booked work.",
      "Rent equipment for a specific job window instead of delaying completion.",
    ],
    revenueMoves: [
      "Convert backlog into completed invoices faster.",
      "Negotiate progress payments earlier because mobilization is no longer the excuse.",
    ],
    playbook: [
      {
        title: "Mobilize faster",
        detail: "Start the next job while waiting on the last draw.",
      },
      {
        title: "Add a crew",
        detail: "Only add labor tied to signed work, not hope.",
      },
      {
        title: "Finish sooner",
        detail: "Rent the equipment that gets the invoice out this week.",
      },
    ],
    lift: 0.16,
  },
  {
    id: "trucking",
    name: "Trucking / Logistics",
    favor: 6,
    headline: "Works when receivables are real and repairs unlock trucks that already have lanes.",
    mirror:
      "Most trucking files are not missing demand; the issue is cash timing between repairs, fuel, insurance, payroll, and broker payments.",
    uses: [
      "Get one truck back on the road when a repair is stopping weekly gross.",
      "Bridge fuel, tolls, insurance, and driver payroll until broker invoices settle.",
      "Add a lease or trailer only when a dedicated lane or repeat shipper is lined up.",
    ],
    revenueMoves: [
      "Prioritize faster-paying lanes and reduce deadhead miles.",
      "Keep working assets moving instead of using capital to cover weak-margin loads.",
    ],
    playbook: [
      {
        title: "Repair to revenue",
        detail: "Tie the money to a truck that can produce immediately after repair.",
      },
      {
        title: "Fuel bridge",
        detail: "Bridge the gap between load completion and payment.",
      },
      {
        title: "Lane discipline",
        detail: "Chase repeat lanes, not random high-gross low-margin work.",
      },
    ],
    lift: 0.11,
  },
  {
    id: "auto",
    name: "Auto Repair / Tire",
    favor: 8,
    headline: "Strong MCA fit when bays are busy and parts availability is the bottleneck.",
    mirror:
      "Auto shops lose money when a car is in the bay but parts, tires, or equipment slow down same-day completion.",
    uses: [
      "Stock the tires, brake kits, batteries, and fluids that sell every week.",
      "Repair the lift, compressor, alignment rack, or scanner that slows tickets.",
      "Build a local fleet offer for vans, rideshare, delivery, and trades.",
    ],
    revenueMoves: [
      "Convert diagnostics into same-day approvals while the car is already there.",
      "Reduce parts delays so customers do not price-shop the job elsewhere.",
    ],
    playbook: [
      {
        title: "Same-day close",
        detail: "Have common parts ready so diagnosis turns into repair today.",
      },
      {
        title: "Fleet accounts",
        detail: "Sell recurring maintenance to businesses with vehicles.",
      },
      {
        title: "Bay speed",
        detail: "Fix the equipment bottleneck that limits cars per day.",
      },
    ],
    lift: 0.13,
  },
  {
    id: "medical",
    name: "Medical / Dental",
    favor: 8,
    headline: "Recurring patient flow and high ticket size can support clean offers.",
    mirror:
      "Practices often have demand, but cash is tied up in reimbursements, equipment, or patient acquisition before the case is completed.",
    uses: [
      "Promote one profitable procedure: implants, whitening, ortho, med-spa packages, or imaging.",
      "Upgrade the room or equipment that increases completed cases per day.",
      "Bridge reimbursement timing without slowing patient scheduling.",
    ],
    revenueMoves: [
      "Track consults, booked cases, and collected revenue from one procedure campaign.",
      "Use capital to increase case acceptance, not just office appearance.",
    ],
    playbook: [
      {
        title: "Procedure campaign",
        detail: "Promote one high-value service and measure booked consults.",
      },
      {
        title: "Case acceptance",
        detail: "Pair marketing with patient financing and follow-up calls.",
      },
      {
        title: "Schedule capacity",
        detail: "Remove the equipment or staffing limit that blocks completed visits.",
      },
    ],
    lift: 0.12,
  },
  {
    id: "retail",
    name: "Retail / E-commerce",
    favor: 7,
    headline: "Inventory discipline matters: capital should chase proven SKUs.",
    mirror:
      "Retail owners usually do not need random inventory; they need enough of the winners before the season, event, or ad campaign hits.",
    uses: [
      "Buy deeper on the top-selling SKUs that already turn, not experimental items.",
      "Fund packaging, fulfillment labor, or ad spend only for products with conversion history.",
      "Pre-load inventory for a holiday, event, or supplier discount window.",
    ],
    revenueMoves: [
      "Reorder winners first and use slower items for bundles.",
      "Match the advance term to how quickly the inventory turns into cash.",
    ],
    playbook: [
      {
        title: "Double down",
        detail: "Put capital behind the 20% of products already driving most sales.",
      },
      {
        title: "Bundle slow stock",
        detail: "Use winners to move stale inventory without killing margin.",
      },
      {
        title: "Fulfillment speed",
        detail: "Ship faster so ad spend turns into repeat orders.",
      },
    ],
    lift: 0.15,
  },
  {
    id: "salon",
    name: "Salon / Med Spa",
    favor: 7,
    headline: "Upsellable services and memberships can make smaller advances productive.",
    mirror:
      "Salons and med spas usually have underused rooms, chairs, or client lists. The money should turn those into appointments.",
    uses: [
      "Run a reactivation campaign to past clients with limited booking windows.",
      "Buy product inventory that stylists or techs can sell at checkout.",
      "Add equipment only for services that can be pre-sold or quickly booked.",
    ],
    revenueMoves: [
      "Sell packages, memberships, or prepaid sessions before broad ad spend.",
      "Fill idle chair or room capacity first; expansion comes after utilization.",
    ],
    playbook: [
      {
        title: "Reactivate",
        detail: "Text prior clients with a limited booking offer.",
      },
      {
        title: "Pre-sell packages",
        detail: "Collect cash upfront on bundles or memberships.",
      },
      {
        title: "Retail attach",
        detail: "Train staff to add product sales to every appointment.",
      },
    ],
    lift: 0.12,
  },
  {
    id: "home-services",
    name: "HVAC / Plumbing / Home Services",
    favor: 8,
    headline: "Emergency-demand businesses can turn speed into booked revenue.",
    mirror:
      "Home service companies win when they answer faster, arrive faster, and have the parts to finish the job on the first visit.",
    uses: [
      "Stock the parts that close the most common emergency calls same day.",
      "Fund dispatch coverage, lead response, or technician payroll during demand spikes.",
      "Wrap or equip a vehicle only if it helps book or complete more calls.",
    ],
    revenueMoves: [
      "Speed wins the call; first-visit completion wins the margin.",
      "Turn emergency jobs into maintenance plans for repeat revenue.",
    ],
    playbook: [
      {
        title: "Answer faster",
        detail: "Pay for dispatch or lead response so calls are not missed.",
      },
      {
        title: "Finish first visit",
        detail: "Stock common parts so jobs do not require a second trip.",
      },
      {
        title: "Convert to plans",
        detail: "Offer maintenance plans after every repair.",
      },
    ],
    lift: 0.16,
  },
  {
    id: "manufacturing",
    name: "Manufacturing / Wholesale",
    favor: 6,
    headline: "Good when purchase orders or repeat buyers support the cash cycle.",
    mirror:
      "Manufacturers and wholesalers get squeezed when a confirmed order needs materials, labor, or machine time before the buyer pays.",
    uses: [
      "Buy raw materials tied to confirmed orders or repeat buyers.",
      "Cover overtime or temp labor to ship a profitable batch on time.",
      "Repair the machine or tool that is blocking completed shipments.",
    ],
    revenueMoves: [
      "Tie the advance to purchase orders, not speculative production.",
      "Ask suppliers for early-pay discounts and faster material release.",
    ],
    playbook: [
      {
        title: "Fund the PO",
        detail: "Use the money on confirmed demand, not inventory guesses.",
      },
      {
        title: "Ship sooner",
        detail: "Pay overtime if it moves invoices out faster.",
      },
      {
        title: "Supplier leverage",
        detail: "Use cash timing to negotiate discounts or priority supply.",
      },
    ],
    lift: 0.1,
  },
  {
    id: "liquor",
    name: "Liquor / Convenience",
    favor: 8,
    headline: "Frequent deposits and fast inventory cycles are attractive when balances stay clean.",
    mirror:
      "Convenience and liquor stores are about shelf velocity. The capital should keep the fastest-moving shelves full when demand is predictable.",
    uses: [
      "Stock the high-velocity alcohol, tobacco, drinks, and convenience items that sell weekly.",
      "Upgrade coolers, signage, POS, or security when it improves ticket size or checkout speed.",
      "Buy ahead for holidays, local events, and seasonal demand before suppliers tighten terms.",
    ],
    revenueMoves: [
      "Use capital for weekly-turn inventory, not slow novelty items.",
      "Bundle items to raise average ticket without discounting the entire basket.",
    ],
    playbook: [
      {
        title: "Keep winners stocked",
        detail: "Avoid empty shelves on the products customers already come in for.",
      },
      {
        title: "Raise ticket size",
        detail: "Bundle common add-ons near checkout.",
      },
      {
        title: "Seasonal buy",
        detail: "Buy ahead before holidays or local events drive demand.",
      },
    ],
    lift: 0.13,
  },
];

const bankHealthProfiles: Record<
  BankHealth,
  {
    label: string;
    nsfs: number;
    negativeDays: number;
    consistency: DepositPattern;
    summary: string;
  }
> = {
  clean: {
    label: "Clean bank activity",
    nsfs: 0,
    negativeDays: 0,
    consistency: "strong",
    summary: "Clean bank pattern gives room to lead with the approval.",
  },
  workable: {
    label: "Normal swings",
    nsfs: 1,
    negativeDays: 2,
    consistency: "steady",
    summary: "Normal bank swings; keep payment language realistic.",
  },
  stressed: {
    label: "Stressed activity",
    nsfs: 5,
    negativeDays: 8,
    consistency: "lumpy",
    summary: "Bank activity is stressed; expect a tighter underwriter read.",
  },
};

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
  const [existingDailyPayments, setExistingDailyPayments] = useState(425);
  const [bankHealth, setBankHealth] = useState<BankHealth>("workable");
  const [industryId, setIndustryId] = useState("restaurant");
  const [offerPercent, setOfferPercent] = useState(1);
  const [termMonths, setTermMonths] = useState(12);
  const [paymentFrequency, setPaymentFrequency] =
    useState<PaymentFrequency>("daily");

  const selectedIndustry =
    industries.find((industry) => industry.id === industryId) ?? industries[0];
  const bankProfile = bankHealthProfiles[bankHealth];
  const timeInBusiness = 36;

  const underwriting = useMemo(() => {
    const dailyRevenue = monthlyRevenue / 21.5;
    const balanceCoverage = dailyBalance / Math.max(dailyRevenue, 1);
    const creditPoints = clamp((creditScore - 500) / 2.8, 0, 60);
    const revenuePoints = clamp((monthlyRevenue - 25000) / 2500, 0, 35);
    const balancePoints = clamp(balanceCoverage * 28, 0, 24);
    const timePoints = clamp(timeInBusiness / 2, 0, 18);
    const industryPoints = selectedIndustry.favor;
    const consistencyPoints =
      bankProfile.consistency === "strong"
        ? 8
        : bankProfile.consistency === "steady"
          ? 4
          : -6;
    const nsfPenalty = bankProfile.nsfs * 4;
    const negativePenalty = bankProfile.negativeDays * 2.2;
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
    const standardTermDays = 12 * 21.5;
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
    bankProfile,
    selectedIndustry.favor,
    timeInBusiness,
  ]);

  const maxAmount = Math.max(
    5000,
    Math.round(underwriting.maxApproval / 1000) * 1000,
  );
  const amountValue = Math.max(
    5000,
    Math.round((maxAmount * offerPercent) / 1000) * 1000,
  );

  const offer = useMemo(() => {
    const amount = clamp(amountValue, 5000, maxAmount);
    const amountPressure = amount / Math.max(underwriting.maxApproval, 1);
    const termPressure = (termMonths - 12) / 24;
    const scoreDiscount = clamp((underwriting.score - 70) / 260, -0.05, 0.05);
    const factor = clamp(
      1.18 + amountPressure * 0.09 + termPressure * 0.1 - scoreDiscount,
      1.1,
      1.49,
    );
    const payback = amount * factor;
    const termDays = Math.round(termMonths * 21.5);
    const dailyPayment = payback / termDays;
    const termPaymentWeeks = termMonths * 4.3;
    const weeklyPayment = payback / termPaymentWeeks;
    const paymentAmount =
      paymentFrequency === "daily" ? dailyPayment : weeklyPayment;
    const paymentCapacity =
      paymentFrequency === "daily"
        ? underwriting.dailyPaymentCapacity
        : underwriting.dailyPaymentCapacity * 5;
    const holdback = dailyPayment / Math.max(underwriting.dailyRevenue, 1);
    const marginToCapacity = paymentCapacity - paymentAmount;

    return {
      amount,
      dailyPayment,
      factor,
      holdback,
      marginToCapacity,
      paymentAmount,
      paymentCapacity,
      payback,
      termDays,
      weeklyPayment,
    };
  }, [amountValue, maxAmount, paymentFrequency, termMonths, underwriting]);

  function updateMaxAwareAmount(value: number) {
    setOfferPercent(clamp(value / Math.max(maxAmount, 1), 5000 / maxAmount, 1));
  }

  const redFlags = [
    bankProfile.negativeDays > 5
      ? "Too many negative days: expect stips, lower approval, or decline pressure."
      : "Negative-day pattern is workable.",
    bankProfile.nsfs > 3
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
    offer.paymentAmount / Math.max(offer.paymentCapacity, 1);
  const payoffPerDollar = offer.payback / Math.max(offer.amount, 1);
  const paymentLabel = paymentFrequency === "daily" ? "Daily ACH" : "Weekly ACH";
  const paymentCadence = paymentFrequency === "daily" ? "daily" : "weekly";
  const paymentRoomLabel =
    paymentFrequency === "daily" ? "daily payment room" : "weekly payment room";
  const maxEarlyPayoffMonths = Math.min(5, termMonths);
  const earlyPayoffSchedule = Array.from(
    { length: maxEarlyPayoffMonths },
    (_, index) => {
      const month = index + 1;
      const discountRate = [0.18, 0.14, 0.1, 0.07, 0.05][index];
      const collectedToDate =
        paymentFrequency === "daily"
          ? offer.dailyPayment * 21.5 * month
          : offer.weeklyPayment * 4.3 * month;
      const remainingBalance = Math.max(offer.payback - collectedToDate, 0);
      const discountedBalance = remainingBalance * (1 - discountRate);
      const principalFloor = Math.max(0, offer.amount - collectedToDate);
      const payoffQuote = Math.max(discountedBalance, principalFloor);

      return {
        discountRate,
        month,
        label: `${month} ${month === 1 ? "month" : "months"}`,
        payoffQuote,
        savings: remainingBalance - payoffQuote,
      };
    },
  );
  const offerModes = [
    {
      label: "Conservative",
      amount: underwriting.maxApproval * 0.72,
      term: 18,
      note: "Easiest payment conversation.",
    },
    {
      label: "Balanced",
      amount: underwriting.maxApproval * 0.88,
      term: 12,
      note: "Best starting point for most calls.",
    },
    {
      label: "Stretch",
      amount: underwriting.maxApproval,
      term: 9,
      note: "Use when merchant pushes for max cash.",
    },
  ];
  const growthLift = selectedIndustry.lift;
  const growthProjection = [
    { label: "Now", value: monthlyRevenue },
    { label: "30d", value: monthlyRevenue * (1 + growthLift * 0.32) },
    { label: "60d", value: monthlyRevenue * (1 + growthLift * 0.68) },
    { label: "90d", value: monthlyRevenue * (1 + growthLift) },
  ];
  const maxProjectedRevenue = Math.max(
    ...growthProjection.map((item) => item.value),
  );
  const monthlyAchEstimate =
    paymentFrequency === "daily" ? offer.dailyPayment * 21.5 : offer.weeklyPayment * 4.3;
  const projectedLiftDollars =
    growthProjection[growthProjection.length - 1].value - monthlyRevenue;
  const netAfterDailyPayment = projectedLiftDollars - monthlyAchEstimate;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span>Matrix offer desk</span>
          <h1>Broker Club</h1>
        </div>
        <div className="market-stamp">
          <span>{underwriting.tier}</span>
          <strong>Live Offer</strong>
        </div>
      </header>

      <section className="market-tape" aria-label="Workflow">
        <span>Profile</span>
        <span>Offer</span>
        <span>Payoff</span>
        <span>Close</span>
      </section>

      <section className="summary-grid" aria-label="Deal snapshot">
        <div className="snapshot-card offer-card">
          <span>Offer</span>
          <strong>{formatMoney(amountValue)}</strong>
          <small>Max approval · {underwriting.tier}</small>
        </div>
        <div className="snapshot-card payment-card">
          <span>{paymentLabel}</span>
          <strong>{formatMoney(offer.paymentAmount)}</strong>
          <small>{formatPercent(paymentUtilization)} of payment room</small>
        </div>
        <div className="snapshot-card approval-card">
          <span>Total payback</span>
          <strong>{formatMoney(offer.payback)}</strong>
          <small>{termMonths} months · {offer.termDays} ACH days</small>
        </div>
        <div className="snapshot-card pricing-card">
          <span>Factor</span>
          <strong>{offer.factor.toFixed(2)}</strong>
          <small>{payoffPerDollar.toFixed(2)} payback per $1</small>
        </div>
      </section>

      <section className="deal-desk">
        <aside className="panel input-panel section-blue">
          <div className="panel-heading">
            <span>Inputs</span>
            <h2>Merchant profile</h2>
          </div>

          <div className="input-group">
            <h3>Quick offer inputs</h3>
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
                Bank activity
                <select
                  value={bankHealth}
                  onChange={(event) =>
                    setBankHealth(event.target.value as BankHealth)
                  }
                >
                  <option value="clean">Clean</option>
                  <option value="workable">Normal swings</option>
                  <option value="stressed">Stressed</option>
                </select>
              </label>
            </div>
          </div>

          <div className="input-note">
            <b>{bankHealthProfiles[bankHealth].label}</b>
            <span>{bankProfile.summary}</span>
          </div>
        </aside>

        <section className="panel offer-panel section-green">
          <div className="panel-heading horizontal">
            <div>
              <span>Offer</span>
              <h2>Approval desk</h2>
            </div>
            <div className="score-badge">
              <b>{underwriting.score}</b>
              <small>{underwriting.tier}</small>
            </div>
          </div>

          <div className="offer-focus-grid">
            <div className="offer-focus">
              <span>Offer</span>
              <strong>{formatMoney(amountValue)}</strong>
              <small>Starts at max approval, then tune it live.</small>
            </div>
            <div className="payment-focus">
              <span>{paymentLabel}</span>
              <strong>{formatMoney(offer.paymentAmount)}</strong>
              <small>{formatPercent(offer.holdback)} holdback</small>
            </div>
          </div>

          <div className="slider-card">
            <div className="frequency-control" aria-label="Payment frequency">
              <span>Payment option</span>
              <div>
                <button
                  type="button"
                  className={paymentFrequency === "daily" ? "is-active" : ""}
                  onClick={() => setPaymentFrequency("daily")}
                >
                  Daily
                </button>
                <button
                  type="button"
                  className={paymentFrequency === "weekly" ? "is-active" : ""}
                  onClick={() => setPaymentFrequency("weekly")}
                >
                  Weekly
                </button>
              </div>
            </div>
            <label className="slider-row">
              <span>
                Offer amount <b>{formatMoney(amountValue)}</b>
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
              <small>{formatPercent(approvalUse)} of approval</small>
            </label>
            <label className="slider-row">
              <span>
                Term <b>{termMonths} months</b>
              </span>
              <input
                type="range"
                min="3"
                max="36"
                step="1"
                value={termMonths}
                onChange={(event) => setTermMonths(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="underwriting-strip">
            <div>
              <span>Daily revenue</span>
              <b>{formatMoney(underwriting.dailyRevenue)}</b>
            </div>
            <div>
              <span>Payment room</span>
              <b>{formatMoney(offer.paymentCapacity)}</b>
            </div>
            <div>
              <span>Balance coverage</span>
              <b>{underwriting.balanceCoverage.toFixed(1)}x</b>
            </div>
          </div>

          <div className="numbers-grid">
            <div>
              <span>Total payback</span>
              <strong>{formatMoney(offer.payback)}</strong>
            </div>
            <div>
              <span>Daily option</span>
              <strong>{formatMoney(offer.dailyPayment)}</strong>
            </div>
            <div>
              <span>Weekly option</span>
              <strong>{formatMoney(offer.weeklyPayment)}</strong>
            </div>
            <div>
              <span>Factor</span>
              <strong>{offer.factor.toFixed(2)}</strong>
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
                  )} cushion under estimated ${paymentRoomLabel}.`
                : `${formatMoney(
                    Math.abs(offer.marginToCapacity),
                  )} over ${paymentRoomLabel}. Lower amount, extend term, or position payoff.`}
            </span>
          </div>

          <div className="payoff-card">
            <div className="payoff-header">
              <div>
                <span>Early payoff</span>
                <h3>Discount window</h3>
              </div>
              <strong>{maxEarlyPayoffMonths} months</strong>
            </div>
            <div className="payoff-grid">
              {earlyPayoffSchedule.map((payoff) => (
                <div key={payoff.month}>
                  <span>{payoff.label}</span>
                  <strong>{formatMoney(payoff.payoffQuote)}</strong>
                  <small>
                    {formatPercent(payoff.discountRate)} off remaining · save{" "}
                    {formatMoney(payoff.savings)}
                  </small>
                </div>
              ))}
            </div>
          </div>

          <div className="scenario-grid">
            {offerModes.map((mode) => (
              <button
                type="button"
                key={mode.label}
                onClick={() => {
                  updateMaxAwareAmount(Math.round(mode.amount / 1000) * 1000);
                  setTermMonths(mode.term);
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
        <div className="panel read-panel section-amber">
          <div className="panel-heading">
            <span>Read</span>
            <h2>Underwriter notes</h2>
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
              around <b>{formatMoney(offer.paymentAmount)}</b> {paymentCadence}. If that
              payment feels tight, we tune the term now before underwriting
              cuts it for us.”
            </p>
          </div>
        </div>

        <div className="panel industry-panel section-purple">
          <div className="panel-heading horizontal">
            <div>
              <span>Close</span>
              <h2>Industry angle</h2>
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
              <span>Use of funds</span>
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

          <div className="growth-card" aria-label="Merchant growth snapshot">
            <div className="growth-header">
              <div>
                <span>Show merchant</span>
                <h3>90-day revenue path</h3>
              </div>
              <strong>+{formatPercent(growthLift)}</strong>
            </div>

            <p className="mirror-line">{selectedIndustry.mirror}</p>

            <div className="bar-chart" aria-label="Projected revenue chart">
              {growthProjection.map((item) => (
                <div className="bar-column" key={item.label}>
                  <span>{formatMoney(item.value)}</span>
                  <i
                    style={{
                      height: `${clamp(
                        (item.value / maxProjectedRevenue) * 100,
                        12,
                        100,
                      )}%`,
                    }}
                  />
                  <b>{item.label}</b>
                </div>
              ))}
            </div>

            <div className="growth-math">
              <div>
                <span>Monthly lift target</span>
                <strong>{formatMoney(projectedLiftDollars)}</strong>
              </div>
              <div>
                <span>Est. monthly ACH drag</span>
                <strong>{formatMoney(monthlyAchEstimate)}</strong>
              </div>
              <div className={netAfterDailyPayment >= 0 ? "good" : "bad"}>
                <span>Room after payment</span>
                <strong>{formatMoney(netAfterDailyPayment)}</strong>
              </div>
            </div>

            <div className="playbook-grid">
              {selectedIndustry.playbook.map((item, index) => (
                <article key={item.title}>
                  <span>{index + 1}</span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="reference-strip" aria-label="Underwriting basis">
        <strong>Basis</strong>
        <span>deposits</span>
        <span>balance</span>
        <span>bank activity</span>
        <span>daily debits</span>
        <span>credit</span>
      </section>
    </main>
  );
}
