"use client";

import { type CSSProperties, useMemo, useState } from "react";

type DepositPattern = "strong" | "steady" | "lumpy";
type BankHealth = "clean" | "workable" | "stressed";
type PaymentFrequency = "daily" | "weekly";
type ActiveLens = "offer" | "close" | "growth" | "risk";

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

type FundAllocation = {
  label: string;
  percent: number;
  detail: string;
  proof: string;
};

type RevenueLever = {
  label: string;
  share: number;
  detail: string;
  math: string;
};

type Rebuttal = {
  objection: string;
  intent: string;
  opener: string;
  bridge: string;
  proof: string;
  close: string;
};

type SurfaceMetric = {
  label: string;
  value: string;
  detail: string;
  score: number;
  tone: "primary" | "cash" | "warning" | "risk";
};

type SurfaceMetricStyle = CSSProperties & {
  "--height": string;
  "--depth": string;
  "--delay": string;
};

type ConversionNode = {
  label: string;
  value: string;
  detail: string;
  weight: number;
  tone: "primary" | "cash" | "warning" | "risk";
};

type ConversionNodeStyle = CSSProperties & {
  "--weight": string;
  "--delay": string;
};

type IndustryIntelligence = {
  aliases: string[];
  capitalPlan: FundAllocation[];
  operatingSignal: string;
  targetMetric: string;
  revenueLevers: RevenueLever[];
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
  {
    id: "hotel",
    name: "Hotel / Motel",
    favor: 6,
    headline: "Hospitality files work best when capital is tied to occupancy, reviews, or booked events.",
    mirror:
      "Hotels can show solid deposits while still losing revenue to room downtime, slow housekeeping turns, weak OTA visibility, or deferred guest-facing repairs.",
    uses: [
      "Repair the rooms or amenities that are currently out of rentable inventory.",
      "Fund housekeeping, linens, maintenance, and supplies ahead of a booked seasonal or event window.",
      "Improve conversion on OTA listings with photos, review recovery, and targeted rate management.",
    ],
    revenueMoves: [
      "Turn unavailable rooms into sellable room nights before buying broad advertising.",
      "Protect average daily rate by fixing guest-experience issues that trigger discounting.",
    ],
    playbook: [
      {
        title: "Room recovery",
        detail: "Tie funding to rooms that can be back online inside the term window.",
      },
      {
        title: "Event calendar",
        detail: "Line up inventory, staffing, and pricing around local demand spikes.",
      },
      {
        title: "Review lift",
        detail: "Fix the complaint pattern that is suppressing direct bookings and ADR.",
      },
    ],
    lift: 0.09,
  },
  {
    id: "daycare",
    name: "Daycare / Childcare",
    favor: 7,
    headline: "Childcare can justify capital when it opens licensed capacity or stabilizes enrollment.",
    mirror:
      "A daycare does not need vague marketing money; it needs staffing, supplies, compliance, and classroom readiness that convert waitlist demand into active tuition.",
    uses: [
      "Prepare a classroom, playground, van, or safety upgrade needed for enrollment capacity.",
      "Bridge payroll while new enrollments convert from waitlist to recurring tuition.",
      "Fund parent acquisition only when tours, deposits, and open slots are tracked weekly.",
    ],
    revenueMoves: [
      "Convert waitlist families into paying enrollment with clear start dates.",
      "Raise collected tuition by reducing vacancy, late-pay drag, and classroom downtime.",
    ],
    playbook: [
      {
        title: "Open seats",
        detail: "Use funds where licensing and staffing turn empty seats into tuition.",
      },
      {
        title: "Tour pipeline",
        detail: "Track inquiries, tours, deposits, and start dates every week.",
      },
      {
        title: "Retention",
        detail: "Use parent communication and staffing stability to reduce churn.",
      },
    ],
    lift: 0.1,
  },
  {
    id: "laundromat",
    name: "Laundromat / Dry Cleaner",
    favor: 8,
    headline: "Strong when funds repair machines, add turns, or expand wash-and-fold volume.",
    mirror:
      "Laundry operators usually know exactly where revenue is stuck: broken machines, underused pickup routes, slow commercial accounts, or weak wash-and-fold staffing.",
    uses: [
      "Repair or replace revenue-producing washers, dryers, boilers, card readers, or folding tables.",
      "Fund pickup-and-delivery labor, bags, routing software, and local commercial outreach.",
      "Buy detergent, hangers, packaging, and supplies for known wash-and-fold volume.",
    ],
    revenueMoves: [
      "Increase machine uptime and turns per day before expanding square footage.",
      "Use pickup, delivery, and commercial accounts to add repeat revenue.",
    ],
    playbook: [
      {
        title: "Machine uptime",
        detail: "Rank repairs by weekly revenue blocked per machine.",
      },
      {
        title: "Route density",
        detail: "Build pickup clusters so delivery labor does not eat margin.",
      },
      {
        title: "Commercial repeat",
        detail: "Target salons, spas, gyms, restaurants, and clinics with weekly laundry.",
      },
    ],
    lift: 0.12,
  },
  {
    id: "landscaping",
    name: "Landscaping / Lawn Care",
    favor: 7,
    headline: "Seasonal service businesses need capital tied to route density and signed work.",
    mirror:
      "Landscapers often miss revenue because equipment, crews, fuel, or materials have to be paid before seasonal collections catch up.",
    uses: [
      "Repair mowers, trailers, blowers, plows, or irrigation equipment tied to scheduled jobs.",
      "Buy materials for signed install work rather than speculative inventory.",
      "Bridge crew payroll and fuel during spring ramp, storm cleanup, or snow season.",
    ],
    revenueMoves: [
      "Increase route density and completed stops per crew day.",
      "Convert one-off jobs into maintenance contracts or seasonal packages.",
    ],
    playbook: [
      {
        title: "Route density",
        detail: "Cluster jobs by geography before adding more leads.",
      },
      {
        title: "Signed installs",
        detail: "Use funds for materials only after deposit, scope, and schedule are clear.",
      },
      {
        title: "Seasonal contract",
        detail: "Turn spring cleanups or snow work into recurring packages.",
      },
    ],
    lift: 0.14,
  },
  {
    id: "grocery",
    name: "Grocery / Specialty Market",
    favor: 7,
    headline: "Capital should protect shelf availability and basket size without bloating spoilage.",
    mirror:
      "Markets win when core items stay in stock and perishables turn quickly. The risk is buying too broadly and trapping cash in slow or spoiled inventory.",
    uses: [
      "Stock staple SKUs and high-frequency perishables with proven weekly turns.",
      "Repair coolers, cases, POS, or signage that affects availability and checkout speed.",
      "Fund prepared foods, local products, or bundles only where basket data supports demand.",
    ],
    revenueMoves: [
      "Reduce out-of-stocks on traffic-driving items.",
      "Lift average basket with prepared food, bundles, and checkout add-ons.",
    ],
    playbook: [
      {
        title: "Shelf discipline",
        detail: "Buy depth on weekly movers, not breadth across slow categories.",
      },
      {
        title: "Fresh turn",
        detail: "Track spoilage and gross margin before increasing perishables.",
      },
      {
        title: "Basket lift",
        detail: "Pair staples with prepared or high-margin add-ons.",
      },
    ],
    lift: 0.11,
  },
  {
    id: "staffing",
    name: "Staffing / Recruiting",
    favor: 6,
    headline: "Staffing advances need verified receivables and tight payroll-cycle math.",
    mirror:
      "Staffing firms can grow fast and still run out of cash because payroll lands before clients pay. The file needs real receivables, not just headcount optimism.",
    uses: [
      "Bridge payroll for placed workers tied to signed client agreements and confirmed timecards.",
      "Fund recruiting only for open requisitions with client demand already documented.",
      "Cover onboarding, background checks, and compliance costs for starts that bill quickly.",
    ],
    revenueMoves: [
      "Increase billable headcount without letting payroll outrun collections.",
      "Shorten invoice cycle and prioritize clients with reliable payment history.",
    ],
    playbook: [
      {
        title: "Payroll bridge",
        detail: "Tie every dollar to timecards, invoices, and client pay history.",
      },
      {
        title: "Client quality",
        detail: "Grow with payers that do not stretch terms or dispute hours.",
      },
      {
        title: "Fill speed",
        detail: "Use recruiting spend against signed requisitions, not general awareness.",
      },
    ],
    lift: 0.1,
  },
  {
    id: "fitness",
    name: "Gym / Fitness Studio",
    favor: 6,
    headline: "Works when the money increases member capacity, retention, or prepaid packages.",
    mirror:
      "Gyms usually do not need a cosmetic refresh first; they need member acquisition, retention, equipment uptime, and classes that turn into recurring dues.",
    uses: [
      "Repair or add equipment that increases usable class or training capacity.",
      "Fund a local acquisition campaign tied to trial bookings, consultations, and membership close rate.",
      "Create prepaid transformation, personal training, or small-group packages.",
    ],
    revenueMoves: [
      "Convert trials into recurring memberships and prepaid training.",
      "Reduce churn by improving equipment uptime, scheduling, and member follow-up.",
    ],
    playbook: [
      {
        title: "Trial close",
        detail: "Track trials, consults, closes, and first-month attendance.",
      },
      {
        title: "Prepaid training",
        detail: "Sell packages that bring cash in before session delivery.",
      },
      {
        title: "Retention trigger",
        detail: "Follow up when attendance drops before cancellation hits.",
      },
    ],
    lift: 0.1,
  },
  {
    id: "professional",
    name: "Professional Services",
    favor: 6,
    headline: "Professional firms need capital tied to signed retainers, receivables, or billable capacity.",
    mirror:
      "Law, accounting, consulting, and agency files can look clean, but the real question is whether money creates billable capacity or just covers slow collections.",
    uses: [
      "Bridge receivables where invoices are issued to reliable clients but collections lag.",
      "Add contractor or specialist capacity for signed scopes with clear delivery dates.",
      "Fund a focused client acquisition push around a high-value service line.",
    ],
    revenueMoves: [
      "Turn backlog into billed work faster by removing delivery bottlenecks.",
      "Sell retainers or deposits before adding labor.",
    ],
    playbook: [
      {
        title: "Backlog to billings",
        detail: "Use funds to deliver signed work faster, not chase vague leads.",
      },
      {
        title: "Retainer push",
        detail: "Package recurring work so collections become more predictable.",
      },
      {
        title: "Specialist capacity",
        detail: "Add contractors only against scoped work with margin.",
      },
    ],
    lift: 0.09,
  },
];

const industryIntelligence: Record<string, IndustryIntelligence> = {
  restaurant: {
    aliases: ["food", "qsr", "cafe", "bar", "pizza", "deli"],
    operatingSignal:
      "Look for weekend deposits, delivery mix, supplier spend, and whether the owner can name the bottleneck stopping more covers.",
    targetMetric: "covers per peak shift + catering deposits",
    capitalPlan: [
      {
        label: "Fast-turn inventory",
        percent: 0.42,
        detail: "Core food, beverage, packaging, and high-margin menu items that can turn inside 14-21 days.",
        proof: "Supplier invoice, current par levels, weekly COGS.",
      },
      {
        label: "Capacity repair",
        percent: 0.34,
        detail: "Cooler, hood, POS, patio, signage, or delivery packaging that directly raises completed orders.",
        proof: "Repair quote and expected reopen/throughput date.",
      },
      {
        label: "Prepaid catering push",
        percent: 0.24,
        detail: "Office lunches and event catering with deposits collected before food and labor costs hit.",
        proof: "Catering menu, outreach list, deposit policy.",
      },
    ],
    revenueLevers: [
      {
        label: "Weekend throughput",
        share: 0.44,
        detail: "More completed covers on the busiest shifts because staffing/equipment stops capping volume.",
        math: "Extra peak orders x average ticket x 8-10 peak nights.",
      },
      {
        label: "Catering deposits",
        share: 0.34,
        detail: "Prepaid group orders add larger tickets without relying on discount traffic.",
        math: "Booked catering orders x average event ticket.",
      },
      {
        label: "Menu mix lift",
        share: 0.22,
        detail: "Promoting three profitable items raises ticket value without broad menu discounts.",
        math: "Ticket lift x monthly transaction count.",
      },
    ],
  },
  contractor: {
    aliases: ["construction", "roofing", "electrical", "general contractor", "plumber"],
    operatingSignal:
      "Underwrite the signed backlog first: job deposits, draw timing, material invoices, and whether labor is tied to scoped work.",
    targetMetric: "completed invoices released faster",
    capitalPlan: [
      {
        label: "Materials for signed jobs",
        percent: 0.46,
        detail: "Deposits on materials for jobs already signed, scoped, and scheduled.",
        proof: "Signed contract, material quote, job start date.",
      },
      {
        label: "Crew payroll bridge",
        percent: 0.32,
        detail: "Payroll for booked work while prior draws or receivables are still clearing.",
        proof: "Crew schedule, payroll run, expected draw date.",
      },
      {
        label: "Equipment rental",
        percent: 0.22,
        detail: "Short-term rental that gets a specific job completed and invoiced faster.",
        proof: "Rental quote tied to job window.",
      },
    ],
    revenueLevers: [
      {
        label: "Backlog conversion",
        share: 0.52,
        detail: "Moving signed jobs from backlog into completed invoices faster.",
        math: "Accelerated jobs x gross profit per job.",
      },
      {
        label: "Progress payments",
        share: 0.28,
        detail: "Earlier mobilization supports earlier draw requests and less downtime.",
        math: "Draw amount pulled forward x collection reliability.",
      },
      {
        label: "Crew utilization",
        share: 0.2,
        detail: "Keeping crew days billable instead of waiting on materials or equipment.",
        math: "Billable crew days recovered x daily gross margin.",
      },
    ],
  },
  trucking: {
    aliases: ["logistics", "transport", "freight", "carrier", "box truck"],
    operatingSignal:
      "Separate real receivables from low-margin miles: lanes, repair downtime, fuel bridge, insurance, and broker pay timing.",
    targetMetric: "productive truck weeks restored",
    capitalPlan: [
      {
        label: "Truck repair",
        percent: 0.44,
        detail: "Repair one revenue-producing unit that has lanes ready after it returns to service.",
        proof: "Repair order, truck number, lane or load history.",
      },
      {
        label: "Fuel and toll bridge",
        percent: 0.32,
        detail: "Fuel, tolls, insurance, and payroll until completed loads pay.",
        proof: "Load board, rate confirmations, broker payment terms.",
      },
      {
        label: "Dedicated lane setup",
        percent: 0.24,
        detail: "Trailer, permits, or onboarding costs only where a repeat shipper or lane is lined up.",
        proof: "Dedicated lane terms or shipper confirmation.",
      },
    ],
    revenueLevers: [
      {
        label: "Asset uptime",
        share: 0.48,
        detail: "A repaired truck returns weekly gross that was otherwise offline.",
        math: "Weekly gross per truck x active weeks recovered.",
      },
      {
        label: "Faster receivables",
        share: 0.27,
        detail: "Bridging fuel lets the carrier run profitable loads while waiting on broker pay.",
        math: "Load count preserved x average net per load.",
      },
      {
        label: "Lane discipline",
        share: 0.25,
        detail: "Repeat lanes reduce deadhead and random low-margin freight.",
        math: "Deadhead reduction + lane margin improvement.",
      },
    ],
  },
  auto: {
    aliases: ["mechanic", "tire", "auto shop", "body shop", "repair shop"],
    operatingSignal:
      "Busy bays matter more than gross revenue alone. Ask what parts or equipment stop same-day completion.",
    targetMetric: "same-day repair approvals",
    capitalPlan: [
      {
        label: "Common parts stock",
        percent: 0.38,
        detail: "Tires, brakes, batteries, filters, fluids, and high-frequency parts that sell weekly.",
        proof: "Parts history and current backorder list.",
      },
      {
        label: "Bay equipment",
        percent: 0.36,
        detail: "Lift, compressor, scanner, alignment, or tire equipment slowing completed tickets.",
        proof: "Equipment quote and estimated tickets unlocked.",
      },
      {
        label: "Fleet outreach",
        percent: 0.26,
        detail: "Local fleet campaign for vans, trades, rideshare, and delivery vehicles.",
        proof: "Target account list and maintenance offer.",
      },
    ],
    revenueLevers: [
      {
        label: "Same-day close rate",
        share: 0.46,
        detail: "More diagnostics become approved repairs before customers leave.",
        math: "Added approvals x average repair order.",
      },
      {
        label: "Bay throughput",
        share: 0.34,
        detail: "Fewer delays means more completed cars per day.",
        math: "Additional cars/day x ticket x open days.",
      },
      {
        label: "Fleet repeat",
        share: 0.2,
        detail: "Recurring local fleet maintenance stabilizes monthly deposits.",
        math: "Fleet vehicles x average monthly service.",
      },
    ],
  },
  medical: {
    aliases: ["dental", "doctor", "clinic", "med spa", "healthcare"],
    operatingSignal:
      "Focus on completed cases, reimbursement timing, and whether capital improves case acceptance or chair utilization.",
    targetMetric: "booked consults to collected cases",
    capitalPlan: [
      {
        label: "Procedure campaign",
        percent: 0.34,
        detail: "Marketing one high-value service such as implants, ortho, imaging, whitening, or med-spa packages.",
        proof: "Procedure margin, consult funnel, booking script.",
      },
      {
        label: "Room/equipment capacity",
        percent: 0.4,
        detail: "Equipment, room setup, or staffing that increases completed visits per day.",
        proof: "Equipment quote and schedule capacity impact.",
      },
      {
        label: "Reimbursement bridge",
        percent: 0.26,
        detail: "Bridge verified insurance or patient financing timing without slowing the calendar.",
        proof: "A/R aging, payer history, expected collection dates.",
      },
    ],
    revenueLevers: [
      {
        label: "Case acceptance",
        share: 0.42,
        detail: "More consults convert through financing, follow-up, and clear procedure offers.",
        math: "Incremental accepted cases x average collected case.",
      },
      {
        label: "Schedule capacity",
        share: 0.33,
        detail: "Room/equipment upgrades increase completed patient visits.",
        math: "Additional visits x collected revenue per visit.",
      },
      {
        label: "A/R bridge",
        share: 0.25,
        detail: "Practice keeps production moving while reimbursements settle.",
        math: "Appointments preserved during reimbursement lag.",
      },
    ],
  },
  retail: {
    aliases: ["ecommerce", "store", "boutique", "shop", "online store"],
    operatingSignal:
      "Inventory funding only works when SKU velocity is proven. Ask for top products, turns, margin, and conversion data.",
    targetMetric: "sell-through on proven SKUs",
    capitalPlan: [
      {
        label: "Winner SKU depth",
        percent: 0.5,
        detail: "Buy deeper on the products already moving fastest with healthy gross margin.",
        proof: "SKU sales report, margin, reorder cycle.",
      },
      {
        label: "Fulfillment speed",
        percent: 0.25,
        detail: "Packaging, shipping labor, or tools that shorten delivery time and reduce cancellations.",
        proof: "Order backlog and fulfillment bottleneck.",
      },
      {
        label: "Conversion spend",
        percent: 0.25,
        detail: "Ad spend or promotions only against products with known conversion history.",
        proof: "Campaign ROAS or conversion history.",
      },
    ],
    revenueLevers: [
      {
        label: "SKU availability",
        share: 0.46,
        detail: "Avoiding stockouts on winning SKUs preserves demand already being created.",
        math: "Lost-stockout units recovered x margin-adjusted price.",
      },
      {
        label: "Campaign conversion",
        share: 0.3,
        detail: "Ad dollars go behind products with proven conversion, not experiments.",
        math: "Spend x expected ROAS from past campaigns.",
      },
      {
        label: "Fulfillment repeat",
        share: 0.24,
        detail: "Faster delivery reduces cancellations and supports repeat orders.",
        math: "Cancellation reduction + repeat order lift.",
      },
    ],
  },
  salon: {
    aliases: ["spa", "beauty", "barber", "esthetician", "medspa"],
    operatingSignal:
      "Look for unused appointment capacity, reactivation list size, package close rate, and retail attach.",
    targetMetric: "booked appointments and prepaid packages",
    capitalPlan: [
      {
        label: "Client reactivation",
        percent: 0.3,
        detail: "Text/email campaigns to prior clients with narrow booking windows.",
        proof: "Client list size and last-visit segments.",
      },
      {
        label: "Retail inventory",
        percent: 0.28,
        detail: "Products staff can attach at checkout without adding appointment time.",
        proof: "Product margin and historical attach rate.",
      },
      {
        label: "Service equipment",
        percent: 0.42,
        detail: "Equipment or room setup for services that can be pre-sold or quickly booked.",
        proof: "Package price, booking capacity, equipment quote.",
      },
    ],
    revenueLevers: [
      {
        label: "Rebooked clients",
        share: 0.38,
        detail: "Past clients are cheaper to reactivate than cold ad traffic.",
        math: "Reactivated clients x average service ticket.",
      },
      {
        label: "Prepaid packages",
        share: 0.36,
        detail: "Packages pull cash forward and improve utilization.",
        math: "Packages sold x upfront package price.",
      },
      {
        label: "Retail attach",
        share: 0.26,
        detail: "Checkout product sales lift revenue without adding chair time.",
        math: "Appointments x attach rate x product ticket.",
      },
    ],
  },
  "home-services": {
    aliases: ["hvac", "plumbing", "electrician", "roofing", "home service"],
    operatingSignal:
      "Speed to answer, first-visit completion, truck stocking, and maintenance plan conversion drive the file.",
    targetMetric: "booked calls completed first visit",
    capitalPlan: [
      {
        label: "Truck stock",
        percent: 0.36,
        detail: "Common parts that let techs complete emergency calls on the first visit.",
        proof: "Top repair types and parts usage.",
      },
      {
        label: "Dispatch coverage",
        percent: 0.3,
        detail: "Call answering, scheduling, or lead response during demand windows.",
        proof: "Missed-call report and booked-call rate.",
      },
      {
        label: "Tech capacity",
        percent: 0.34,
        detail: "Payroll, tools, or vehicle readiness tied to booked jobs.",
        proof: "Schedule, payroll, and work order history.",
      },
    ],
    revenueLevers: [
      {
        label: "Answer rate",
        share: 0.3,
        detail: "More calls get booked before competitors answer.",
        math: "Recovered calls x booking rate x average ticket.",
      },
      {
        label: "First-visit close",
        share: 0.44,
        detail: "Stocked trucks convert more visits into completed invoices.",
        math: "Extra completed jobs x average invoice.",
      },
      {
        label: "Maintenance plans",
        share: 0.26,
        detail: "Emergency work converts into recurring service contracts.",
        math: "Plans sold x monthly plan revenue.",
      },
    ],
  },
  manufacturing: {
    aliases: ["wholesale", "manufacturer", "fabrication", "distribution"],
    operatingSignal:
      "Tie capital to purchase orders, repeat buyers, machine uptime, and batch margin.",
    targetMetric: "confirmed orders shipped sooner",
    capitalPlan: [
      {
        label: "Raw materials",
        percent: 0.48,
        detail: "Inputs tied to purchase orders or recurring buyer demand.",
        proof: "PO, buyer history, material quote.",
      },
      {
        label: "Overtime / temp labor",
        percent: 0.28,
        detail: "Labor that gets a profitable batch shipped on time.",
        proof: "Production schedule and batch margin.",
      },
      {
        label: "Machine repair",
        percent: 0.24,
        detail: "Repair the bottleneck blocking shipment or invoice release.",
        proof: "Repair quote and downtime impact.",
      },
    ],
    revenueLevers: [
      {
        label: "PO fulfillment",
        share: 0.52,
        detail: "Confirmed demand ships earlier and invoices sooner.",
        math: "PO value pulled forward x margin.",
      },
      {
        label: "Batch speed",
        share: 0.28,
        detail: "Overtime or temp labor clears profitable work faster.",
        math: "Additional batches x batch gross profit.",
      },
      {
        label: "Supplier leverage",
        share: 0.2,
        detail: "Cash timing can win discounts or priority materials.",
        math: "Discount captured + delay avoided.",
      },
    ],
  },
  liquor: {
    aliases: ["convenience", "c-store", "smoke shop", "market"],
    operatingSignal:
      "Watch deposit frequency, shelf velocity, tobacco/alcohol mix, supplier terms, and whether inventory turns weekly.",
    targetMetric: "shelf availability and basket lift",
    capitalPlan: [
      {
        label: "High-velocity inventory",
        percent: 0.52,
        detail: "Alcohol, tobacco, drinks, and convenience items with weekly turn.",
        proof: "POS category sales and reorder frequency.",
      },
      {
        label: "Coolers / POS",
        percent: 0.28,
        detail: "Equipment or checkout upgrades that raise speed, visibility, or ticket size.",
        proof: "Quote and expected impact on checkout or cold inventory.",
      },
      {
        label: "Event buy-ahead",
        percent: 0.2,
        detail: "Seasonal, holiday, or local event stock before demand spikes.",
        proof: "Prior event sales or seasonal comps.",
      },
    ],
    revenueLevers: [
      {
        label: "Stockout recovery",
        share: 0.42,
        detail: "Core items stay available when customers expect them.",
        math: "Recovered units x average margin.",
      },
      {
        label: "Basket lift",
        share: 0.34,
        detail: "Bundles and checkout add-ons raise average ticket.",
        math: "Ticket lift x monthly transactions.",
      },
      {
        label: "Seasonal demand",
        share: 0.24,
        detail: "Buy-ahead captures demand that would otherwise be missed.",
        math: "Seasonal volume lift x margin.",
      },
    ],
  },
  hotel: {
    aliases: ["motel", "hospitality", "inn", "lodging"],
    operatingSignal:
      "Ask how many rooms are unavailable, ADR trend, occupancy, OTA reviews, and local event calendar.",
    targetMetric: "available room nights x ADR",
    capitalPlan: [
      {
        label: "Room recovery",
        percent: 0.46,
        detail: "Repairs and supplies that return rooms to rentable inventory.",
        proof: "Out-of-order room count and repair quote.",
      },
      {
        label: "Event staffing",
        percent: 0.28,
        detail: "Housekeeping, linens, and maintenance before booked event demand.",
        proof: "Local calendar and occupancy forecast.",
      },
      {
        label: "OTA conversion",
        percent: 0.26,
        detail: "Photos, review recovery, and listing work that improves booking conversion.",
        proof: "Review themes, OTA ranking, booking report.",
      },
    ],
    revenueLevers: [
      {
        label: "Rooms back online",
        share: 0.5,
        detail: "Unavailable rooms become sellable nights.",
        math: "Rooms restored x nights sold x ADR.",
      },
      {
        label: "Event occupancy",
        share: 0.3,
        detail: "Staffing and supplies protect occupancy during demand spikes.",
        math: "Incremental occupied rooms x event ADR.",
      },
      {
        label: "Review/OTA lift",
        share: 0.2,
        detail: "Better listings and reviews improve direct and OTA conversion.",
        math: "Booking conversion lift x available nights.",
      },
    ],
  },
  daycare: {
    aliases: ["childcare", "preschool", "after school", "learning center"],
    operatingSignal:
      "The story should be waitlist, licensed seats, staffing ratio, deposits, and recurring tuition collections.",
    targetMetric: "active paid seats",
    capitalPlan: [
      {
        label: "Classroom readiness",
        percent: 0.42,
        detail: "Safety, supplies, furniture, playground, or room work needed to open capacity.",
        proof: "Licensed capacity and room readiness checklist.",
      },
      {
        label: "Payroll bridge",
        percent: 0.34,
        detail: "Staffing required before new tuition collections fully ramp.",
        proof: "Staff schedule and enrollment start dates.",
      },
      {
        label: "Tour conversion",
        percent: 0.24,
        detail: "Parent outreach tied to tours, deposits, and starts.",
        proof: "Waitlist, tours booked, enrollment pipeline.",
      },
    ],
    revenueLevers: [
      {
        label: "New paid seats",
        share: 0.56,
        detail: "Capacity turns into recurring tuition.",
        math: "New seats x monthly tuition.",
      },
      {
        label: "Deposit conversion",
        share: 0.24,
        detail: "Waitlist families convert when start dates are clear.",
        math: "Deposits collected + first-month tuition.",
      },
      {
        label: "Retention stability",
        share: 0.2,
        detail: "Staffing consistency reduces family churn.",
        math: "Avoided lost seats x tuition.",
      },
    ],
  },
  laundromat: {
    aliases: ["dry cleaner", "laundry", "wash and fold", "cleaners"],
    operatingSignal:
      "Machine uptime, turns per day, wash-and-fold tickets, and route density drive the funding story.",
    targetMetric: "machine turns + wash-and-fold volume",
    capitalPlan: [
      {
        label: "Machine uptime",
        percent: 0.48,
        detail: "Repair or replace machines directly tied to blocked revenue.",
        proof: "Out-of-service machines and repair quote.",
      },
      {
        label: "Wash-and-fold labor",
        percent: 0.28,
        detail: "Labor, supplies, and packaging for known order volume.",
        proof: "Order history and staffing schedule.",
      },
      {
        label: "Pickup route",
        percent: 0.24,
        detail: "Pickup/delivery bags, routing, and commercial outreach.",
        proof: "Route map and target account list.",
      },
    ],
    revenueLevers: [
      {
        label: "Washer/dryer uptime",
        share: 0.46,
        detail: "Broken machines return to daily revenue production.",
        math: "Machines restored x turns/day x vend price.",
      },
      {
        label: "Wash-and-fold",
        share: 0.34,
        detail: "Higher-ticket services use capacity beyond self-serve traffic.",
        math: "Pounds/month x price per pound.",
      },
      {
        label: "Commercial route",
        share: 0.2,
        detail: "Recurring accounts add predictable weekly volume.",
        math: "Accounts x weekly laundry ticket.",
      },
    ],
  },
  landscaping: {
    aliases: ["lawn", "snow", "irrigation", "yard", "grounds"],
    operatingSignal:
      "Route density, signed installs, seasonality, equipment uptime, and crew utilization are the important reads.",
    targetMetric: "completed stops per crew day",
    capitalPlan: [
      {
        label: "Equipment readiness",
        percent: 0.38,
        detail: "Mowers, trailers, plows, or irrigation equipment tied to scheduled work.",
        proof: "Repair quote and route/job schedule.",
      },
      {
        label: "Materials for installs",
        percent: 0.34,
        detail: "Plants, hardscape, mulch, sod, or parts for signed jobs.",
        proof: "Customer deposit, scope, material invoice.",
      },
      {
        label: "Crew/fuel bridge",
        percent: 0.28,
        detail: "Payroll and fuel during seasonal ramp or storm demand.",
        proof: "Crew schedule and route plan.",
      },
    ],
    revenueLevers: [
      {
        label: "Route density",
        share: 0.38,
        detail: "More stops completed per crew day through clustering.",
        math: "Added stops x average service ticket.",
      },
      {
        label: "Install completion",
        share: 0.42,
        detail: "Signed installs complete faster and invoice sooner.",
        math: "Install jobs completed x gross profit.",
      },
      {
        label: "Recurring packages",
        share: 0.2,
        detail: "One-off cleanups convert into seasonal contracts.",
        math: "Contracts added x monthly package value.",
      },
    ],
  },
  grocery: {
    aliases: ["market", "specialty food", "deli market", "produce"],
    operatingSignal:
      "Shelf availability, spoilage, basket size, cooler uptime, and category turns matter more than total inventory spend.",
    targetMetric: "basket size with controlled spoilage",
    capitalPlan: [
      {
        label: "Staple SKU stock",
        percent: 0.46,
        detail: "High-frequency items customers expect to find every trip.",
        proof: "POS movement and reorder cadence.",
      },
      {
        label: "Cold case / POS",
        percent: 0.3,
        detail: "Coolers, cases, checkout, or signage that protects availability and speed.",
        proof: "Equipment quote and outage impact.",
      },
      {
        label: "Prepared/bundle offer",
        percent: 0.24,
        detail: "Prepared food or bundles that raise basket size without spoilage creep.",
        proof: "Basket report and margin by category.",
      },
    ],
    revenueLevers: [
      {
        label: "Out-of-stock recovery",
        share: 0.42,
        detail: "Staples stay available and keep trips from leaking to competitors.",
        math: "Recovered trips x basket value.",
      },
      {
        label: "Prepared margin",
        share: 0.32,
        detail: "Prepared items add higher-margin revenue to existing foot traffic.",
        math: "Prepared units x gross margin.",
      },
      {
        label: "Checkout speed",
        share: 0.26,
        detail: "Faster checkout and displays lift transactions and add-ons.",
        math: "Transaction lift x average add-on.",
      },
    ],
  },
  staffing: {
    aliases: ["recruiting", "temp agency", "employment", "labor"],
    operatingSignal:
      "Payroll bridge only makes sense against verified timecards, invoices, client terms, and reliable payer history.",
    targetMetric: "billable hours funded before client pay",
    capitalPlan: [
      {
        label: "Payroll bridge",
        percent: 0.58,
        detail: "Payroll for placed workers already billing against client agreements.",
        proof: "Timecards, invoices, client contract.",
      },
      {
        label: "Recruiting for signed reqs",
        percent: 0.24,
        detail: "Recruiting spend tied to open roles with client demand already documented.",
        proof: "Open requisitions and fill deadline.",
      },
      {
        label: "Onboarding/compliance",
        percent: 0.18,
        detail: "Background checks, onboarding, and compliance needed to start billable workers.",
        proof: "Candidate pipeline and start dates.",
      },
    ],
    revenueLevers: [
      {
        label: "Billable headcount",
        share: 0.54,
        detail: "More placed workers stay active through payroll timing gaps.",
        math: "Billable hours x gross spread.",
      },
      {
        label: "Faster fills",
        share: 0.26,
        detail: "Signed requisitions fill sooner and begin billing.",
        math: "Roles filled x weekly gross spread.",
      },
      {
        label: "Client retention",
        share: 0.2,
        detail: "Payroll reliability protects client relationships.",
        math: "Avoided lost placements x monthly spread.",
      },
    ],
  },
  fitness: {
    aliases: ["gym", "studio", "pilates", "yoga", "training"],
    operatingSignal:
      "Look at active members, churn, trial close rate, class utilization, and prepaid training sales.",
    targetMetric: "recurring members + prepaid packages",
    capitalPlan: [
      {
        label: "Equipment uptime",
        percent: 0.36,
        detail: "Equipment that increases class capacity or prevents cancellation friction.",
        proof: "Equipment quote and class utilization.",
      },
      {
        label: "Trial acquisition",
        percent: 0.28,
        detail: "Local campaign tied to trials, consults, and membership close rate.",
        proof: "Trial funnel and close rate.",
      },
      {
        label: "Prepaid packages",
        percent: 0.36,
        detail: "Transformation, personal training, or small-group packages sold upfront.",
        proof: "Package price and coach capacity.",
      },
    ],
    revenueLevers: [
      {
        label: "Membership conversion",
        share: 0.38,
        detail: "Trials convert into recurring monthly dues.",
        math: "New members x monthly dues.",
      },
      {
        label: "Prepaid training",
        share: 0.4,
        detail: "Packages create cash now and improve member engagement.",
        math: "Packages sold x package price.",
      },
      {
        label: "Churn reduction",
        share: 0.22,
        detail: "Better equipment and follow-up keep members from cancelling.",
        math: "Saved members x monthly dues.",
      },
    ],
  },
  professional: {
    aliases: ["law", "accounting", "agency", "consulting", "marketing"],
    operatingSignal:
      "Signed scopes, retainer base, A/R aging, utilization, and delivery capacity tell the real story.",
    targetMetric: "billable work delivered and collected",
    capitalPlan: [
      {
        label: "Receivables bridge",
        percent: 0.36,
        detail: "Bridge reliable invoices while client collections lag.",
        proof: "A/R aging and client payment history.",
      },
      {
        label: "Specialist capacity",
        percent: 0.34,
        detail: "Contractor or expert help tied to scoped work.",
        proof: "Signed scope and delivery schedule.",
      },
      {
        label: "Retainer acquisition",
        percent: 0.3,
        detail: "Focused campaign around a profitable service line with retainer potential.",
        proof: "Offer, target list, close rate.",
      },
    ],
    revenueLevers: [
      {
        label: "Backlog billing",
        share: 0.42,
        detail: "Signed work gets delivered and billed faster.",
        math: "Backlog converted x gross margin.",
      },
      {
        label: "Retainer base",
        share: 0.34,
        detail: "Recurring retainers make future deposits more predictable.",
        math: "New retainers x monthly retainer value.",
      },
      {
        label: "Utilization lift",
        share: 0.24,
        detail: "Specialist capacity keeps senior staff on higher-value work.",
        math: "Recovered billable hours x rate.",
      },
    ],
  },
};

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

function updateNumberInput(
  value: string,
  setDisplayValue: (value: string) => void,
  setNumericValue: (value: number) => void,
) {
  setDisplayValue(value);

  if (value.trim() === "") {
    setNumericValue(0);
    return;
  }

  const parsedValue = Number(value);
  if (Number.isFinite(parsedValue)) {
    setNumericValue(parsedValue);
  }
}

function getTier(score: number) {
  if (score >= 82) return "A file";
  if (score >= 68) return "B file";
  if (score >= 52) return "C file";
  return "High-risk file";
}

export default function Home() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(125000);
  const [monthlyRevenueInput, setMonthlyRevenueInput] = useState("125000");
  const [dailyBalance, setDailyBalance] = useState(14500);
  const [dailyBalanceInput, setDailyBalanceInput] = useState("14500");
  const [creditScore, setCreditScore] = useState(665);
  const [creditScoreInput, setCreditScoreInput] = useState("665");
  const [lastFundedAmount, setLastFundedAmount] = useState(0);
  const [lastFundedAmountInput, setLastFundedAmountInput] = useState("");
  const [existingDailyPayments, setExistingDailyPayments] = useState(425);
  const [existingDailyPaymentsInput, setExistingDailyPaymentsInput] =
    useState("425");
  const [bankHealth, setBankHealth] = useState<BankHealth>("workable");
  const [industryId, setIndustryId] = useState("restaurant");
  const [industrySearch, setIndustrySearch] = useState("");
  const [rebuttalIndex, setRebuttalIndex] = useState(0);
  const [offerPercent, setOfferPercent] = useState(1);
  const [termMonths, setTermMonths] = useState(12);
  const [paymentFrequency, setPaymentFrequency] =
    useState<PaymentFrequency>("daily");
  const [activeLens, setActiveLens] = useState<ActiveLens>("offer");

  const selectedIndustryById =
    industries.find((industry) => industry.id === industryId) ?? industries[0];
  const filteredIndustries = useMemo(() => {
    const query = industrySearch.trim().toLowerCase();

    if (!query) return industries;

    return industries.filter((industry) => {
      const intelligence = industryIntelligence[industry.id];
      const searchable = [
        industry.name,
        industry.headline,
        ...intelligence.aliases,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [industrySearch]);
  const selectedIndustry =
    industrySearch.trim() && filteredIndustries.length === 1
      ? filteredIndustries[0]
      : selectedIndustryById;
  const selectedIntelligence = industryIntelligence[selectedIndustry.id];
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
    const lastDealRatio = lastFundedAmount / Math.max(monthlyRevenue, 1);
    const priorFundingPoints =
      lastFundedAmount <= 0
        ? 0
        : lastDealRatio <= 1.35
          ? 4
          : lastDealRatio <= 1.8
            ? 1
            : -5;
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
      priorFundingPoints +
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
    const renewalCeiling =
      lastFundedAmount > 0
        ? lastFundedAmount *
          (score >= 82 ? 1.28 : score >= 68 ? 1.18 : score >= 52 ? 1 : 0.78)
        : Number.POSITIVE_INFINITY;
    const maxApproval = Math.max(
      5000,
      Math.min(revenueCap, cashFlowCap, monthlyRevenue * 1.45, renewalCeiling),
    );

    return {
      balanceCoverage,
      dailyPaymentCapacity,
      dailyRevenue,
      maxApproval,
      priorFundingPoints,
      renewalCeiling:
        Number.isFinite(renewalCeiling) ? renewalCeiling : null,
      score,
      tier,
    };
  }, [
    creditScore,
    dailyBalance,
    existingDailyPayments,
    lastFundedAmount,
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
    const factor = Number(clamp(
      1.18 + amountPressure * 0.09 + termPressure * 0.1 - scoreDiscount,
      1.1,
      1.49,
    ).toFixed(2));
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
    lastFundedAmount > 0
      ? `Last funded deal was ${formatMoney(lastFundedAmount)}; renewal step-up is being capped against that prior approval.`
      : "Ask what the last funded deal was for; no renewal anchor is entered yet.",
  ];

  const approvalUse = amountValue / Math.max(maxAmount, 1);
  const paymentUtilization =
    offer.paymentAmount / Math.max(offer.paymentCapacity, 1);
  const payoffPerDollar = offer.payback / Math.max(offer.amount, 1);
  const paymentLabel = paymentFrequency === "daily" ? "Daily ACH" : "Weekly ACH";
  const paymentCadence = paymentFrequency === "daily" ? "daily" : "weekly";
  const renewalRead =
    lastFundedAmount > 0 && underwriting.renewalCeiling
      ? `Prior deal anchor: ${formatMoney(lastFundedAmount)}. This model allows up to ${formatMoney(
          underwriting.renewalCeiling,
        )} before current deposits and payment room cap the offer.`
      : "No last funded deal entered yet. Ask what the prior advance funded for so the offer can be framed as a renewal, step-up, or fresh money.";
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
      const savings = Math.max(0, remainingBalance - payoffQuote);

      return {
        discountRate,
        month,
        label: `${month} ${month === 1 ? "month" : "months"}`,
        payoffQuote,
        remainingBalance,
        savings,
      };
    },
  );
  const offerModes = [
    {
      label: "Conservative",
      amount: Math.round((underwriting.maxApproval * 0.72) / 1000) * 1000,
      term: 18,
      note: "Easiest payment conversation.",
    },
    {
      label: "Balanced",
      amount: Math.round((underwriting.maxApproval * 0.88) / 1000) * 1000,
      term: 12,
      note: "Best starting point for most calls.",
    },
    {
      label: "Stretch",
      amount: Math.round(underwriting.maxApproval / 1000) * 1000,
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
  const capitalPlan = selectedIntelligence.capitalPlan.map((item) => ({
    ...item,
    amount: offer.amount * item.percent,
  }));
  const revenueLevers = selectedIntelligence.revenueLevers.map((item) => ({
    ...item,
    amount: projectedLiftDollars * item.share,
  }));
  const revenuePath = [
    {
      label: "Now",
      value: monthlyRevenue,
      note: "current deposits",
    },
    {
      label: "30d",
      value: growthProjection[1].value,
      note: revenueLevers[0]?.label ?? "first lever",
    },
    {
      label: "60d",
      value: growthProjection[2].value,
      note: revenueLevers[1]?.label ?? "second lever",
    },
    {
      label: "90d",
      value: growthProjection[3].value,
      note: revenueLevers[2]?.label ?? "third lever",
    },
  ];
  const rebuttals: Rebuttal[] = [
    {
      objection: "I'm good",
      intent: "Agree without surrendering the call.",
      opener:
        "I hear you. I am not calling because the business sounds desperate.",
      bridge: `For ${selectedIndustry.name}, the question is whether ${selectedIntelligence.targetMetric} is already where you want it, or whether ${formatMoney(offer.amount)} can pull forward the next revenue move.`,
      proof: `${capitalPlan[0]?.label ?? "Use of funds"} and ${revenueLevers[0]?.label ?? "the first revenue lever"} are the two places I would look before I ever ask you to take money.`,
      close:
        "If there is no clear place to turn the capital, we should pass. If there is, I can show you the payment and the use case side by side.",
    },
    {
      objection: "I have enough money",
      intent: "Reframe from need to timing and opportunity cost.",
      opener:
        "That is usually the strongest type of file. Enough cash means you get to choose timing instead of borrowing from pressure.",
      bridge: `I would compare the cash you already have against the cost of using outside capital for ${capitalPlan[1]?.label.toLowerCase() ?? "the highest-return use"}.`,
      proof: `If the move can reasonably create about ${formatMoney(projectedLiftDollars)} in monthly lift, the decision is not 'do you have money'; it is whether keeping your own cash untouched is worth the fixed payback.`,
      close:
        "Let me price the conservative structure first. If the spread does not make sense, you should not use it.",
    },
    {
      objection: "My business is self funded",
      intent: "Respect pride, then position optional capital as control.",
      opener:
        "I respect that. Self-funded operators are usually more disciplined because every dollar has already been earned.",
      bridge: `This would not replace self-funding. It would be a short-term tool only if it protects cash while you execute ${capitalPlan[0]?.label.toLowerCase() ?? "a specific revenue move"}.`,
      proof: `${selectedIndustry.mirror} That is exactly why I would tie the offer to one measured outcome, not general spending.`,
      close:
        "Keep the business self-funded as the rule. Use this only if the numbers let you keep reserves and still move faster.",
    },
    {
      objection: "The rates are too high",
      intent: "Do not argue. Bring the call back to ROI, speed, and structure.",
      opener:
        "They can be high, and I would rather be upfront about that than pretend cheap money and fast money are the same thing.",
      bridge: `The right comparison is the fixed payback of ${offer.factor.toFixed(2)} against the revenue you can create or protect through ${revenueLevers[0]?.label.toLowerCase() ?? "the main revenue lever"}.`,
      proof: `At this structure, estimated monthly ACH drag is ${formatMoney(monthlyAchEstimate)}. The model target is ${formatMoney(projectedLiftDollars)} in monthly lift, so we should only keep talking if that spread feels believable for your operation.`,
      close:
        "If you want cheapest money, this may not be the product. If you want speed tied to a specific return, then we can size it responsibly.",
    },
    {
      objection: "The interest is too high",
      intent: "Clarify without sounding corrective or evasive.",
      opener:
        "I get what you mean on cost. Small correction: on this type of advance, we are not quoting compounding interest like a term loan.",
      bridge: `We are looking at a fixed payback/factor on the advance. For example, ${formatMoney(offer.amount)} at ${offer.factor.toFixed(2)} means the payback is known upfront: ${formatMoney(offer.payback)}.`,
      proof:
        "That does not automatically make it cheap. It just means we judge it differently: fixed cost, speed, payment fit, and whether the use of funds can outperform it.",
      close:
        "So I would not sell it as low-interest money. I would sell it only if the fixed cost is justified by the timing and the revenue plan.",
    },
  ];
  const activeRebuttal =
    rebuttals[((rebuttalIndex % rebuttals.length) + rebuttals.length) %
      rebuttals.length];
  const brokerPosture =
    paymentUtilization <= 0.72 && underwriting.score >= 68
      ? {
          label: "Press for signature",
          tone: "green",
          detail:
            "Payment room and score support a confident close. Lead with speed, then protect the approval from over-shopping.",
        }
      : paymentUtilization <= 0.95
        ? {
            label: "Sell the structure",
            tone: "amber",
            detail:
              "The file works, but the payment needs context. Anchor the cash use and keep the fallback ready.",
          }
        : {
            label: "Resize before submit",
            tone: "red",
            detail:
              "The ask is outrunning payment room. Downshift the amount, lengthen term, or make payoff part of the story.",
          };
  const firstAsk = Math.min(maxAmount, Math.round((offer.amount * 1.08) / 1000) * 1000);
  const hasRoomAboveOffer = firstAsk > offer.amount;
  const fallbackAmount = Math.max(5000, Math.round((offer.amount * 0.86) / 1000) * 1000);
  const fallbackTerm = Math.min(36, termMonths + 3);
  const fallbackFactor = Math.max(1.12, offer.factor - 0.03);
  const paymentFitScore = clamp(1 - paymentUtilization, 0, 1);
  const renewalScore =
    lastFundedAmount > 0
      ? clamp(offer.amount / Math.max(lastFundedAmount * 1.28, 1), 0, 1)
      : 0.52;
  const dealSurfaceMetrics: SurfaceMetric[] = [
    {
      label: "Capacity",
      value: formatPercent(paymentFitScore),
      detail:
        offer.marginToCapacity >= 0
          ? `${formatMoney(offer.marginToCapacity)} payment room`
          : `${formatMoney(Math.abs(offer.marginToCapacity))} over room`,
      score: paymentFitScore,
      tone: offer.marginToCapacity >= 0 ? "cash" : "risk",
    },
    {
      label: "Approval",
      value: formatPercent(approvalUse),
      detail: `${formatMoney(offer.amount)} of modeled max`,
      score: approvalUse,
      tone: "primary",
    },
    {
      label: "Growth",
      value: `+${formatPercent(growthLift)}`,
      detail: `${formatMoney(projectedLiftDollars)} 90-day target`,
      score: clamp(growthLift / 0.18, 0.12, 1),
      tone: "warning",
    },
    {
      label: "Renewal",
      value: lastFundedAmount > 0 ? formatPercent(renewalScore) : "Open",
      detail:
        lastFundedAmount > 0
          ? `${formatMoney(lastFundedAmount)} prior deal`
          : "Ask prior funding amount",
      score: renewalScore,
      tone: lastFundedAmount > 0 ? "primary" : "warning",
    },
  ];
  const dealSurfaceRead =
    paymentUtilization <= 0.78
      ? "Strong structure. The payment plane is below the capacity line, so lead with fit and speed."
      : paymentUtilization <= 1
        ? "Workable structure. Keep the use of funds tight and keep the fallback ready."
        : "Pressure structure. The offer is above payment room; resize, stretch term, or make payoff part of the story.";
  const primaryAllocation = capitalPlan[0];
  const primaryLever = revenueLevers[0];
  const liftCoverage = projectedLiftDollars / Math.max(monthlyAchEstimate, 1);
  const netSpreadWeight =
    netAfterDailyPayment >= 0
      ? clamp(netAfterDailyPayment / Math.max(projectedLiftDollars, 1), 0.12, 1)
      : 0.08;
  const conversionStatus =
    netAfterDailyPayment >= monthlyAchEstimate * 0.35
      ? "Spread supports pitch"
      : netAfterDailyPayment >= 0
        ? "Thin but workable"
        : "Payment eats lift";
  const conversionRead =
    netAfterDailyPayment >= 0
      ? `${formatMoney(projectedLiftDollars)} modeled monthly lift covers ${formatMoney(monthlyAchEstimate)} estimated ACH drag, leaving ${formatMoney(netAfterDailyPayment)} of room.`
      : `${formatMoney(monthlyAchEstimate)} estimated ACH drag is above the modeled ${formatMoney(projectedLiftDollars)} lift. Resize before making this the main pitch.`;
  const conversionNodes: ConversionNode[] = [
    {
      label: "Advance",
      value: formatMoney(offer.amount),
      detail: `${formatPercent(approvalUse)} of modeled approval`,
      weight: 1,
      tone: "primary",
    },
    {
      label: "First use",
      value: primaryAllocation ? formatMoney(primaryAllocation.amount) : "Map use",
      detail: primaryAllocation
        ? primaryAllocation.label
        : "Tie funds to one specific business move",
      weight: primaryAllocation ? clamp(primaryAllocation.percent / 0.46, 0.18, 1) : 0.4,
      tone: "warning",
    },
    {
      label: "Lift target",
      value: formatMoney(projectedLiftDollars),
      detail: primaryLever
        ? `${primaryLever.label} starts the proof`
        : "Modeled monthly revenue lift",
      weight: clamp(projectedLiftDollars / Math.max(offer.amount * 0.22, 1), 0.18, 1),
      tone: "cash",
    },
    {
      label: "ACH drag",
      value: formatMoney(monthlyAchEstimate),
      detail: `${formatPercent(clamp(monthlyAchEstimate / Math.max(projectedLiftDollars, 1), 0, 1))} of lift target`,
      weight: clamp(monthlyAchEstimate / Math.max(projectedLiftDollars, 1), 0.18, 1),
      tone: liftCoverage >= 1 ? "warning" : "risk",
    },
    {
      label: "Net spread",
      value: formatMoney(netAfterDailyPayment),
      detail:
        netAfterDailyPayment >= 0
          ? "Room after modeled payment"
          : "Shortfall against payment drag",
      weight: netSpreadWeight,
      tone: netAfterDailyPayment >= 0 ? "cash" : "risk",
    },
  ];
  const dealActions = [
    {
      label: "Next call move",
      value:
        paymentUtilization <= 0.78
          ? "Ask for close"
          : paymentUtilization <= 1
            ? "Sell structure"
            : "Resize first",
      detail:
        paymentUtilization <= 0.78
          ? "Lead with approval confidence, then ask for statements and signature path."
          : paymentUtilization <= 1
            ? "Anchor the funds to the strongest use case before discussing cost."
            : "Lower the amount or extend term before the merchant anchors on a payment they will reject.",
    },
    {
      label: "Doc priority",
      value:
        lastFundedAmount > 0
          ? "Prior contract"
          : bankHealth === "clean"
            ? "Bank logins"
            : "Recent banks",
      detail:
        lastFundedAmount > 0
          ? "Use the last funding agreement to verify position, payback, and renewal room."
          : "Get the freshest deposit picture before quoting a stronger number.",
    },
    {
      label: "Price position",
      value: offer.factor <= 1.24 ? "Hold factor" : "Guard spread",
      detail:
        offer.factor <= 1.24
          ? "Do not discount early; the live structure is already close to the floor."
          : "Use cost only after payment fit and use of funds are clear.",
    },
  ];
  const submissionRadar = [
    {
      label: "Collect first",
      value:
        lastFundedAmount > 0
          ? "Prior funding contract"
          : bankHealth === "clean"
            ? "Bank login + last 3 months"
            : "Fresh statements",
      detail:
        lastFundedAmount > 0
          ? "Verify current balance, remittance, and whether the new money is a true step-up or a refinance story."
          : bankHealth === "stressed"
            ? "Do not let old statements carry the file. Get the newest clean deposit run before quoting higher."
            : "Use live deposits to protect the approval and avoid re-trading after underwriting sees the file.",
    },
    {
      label: "Ask on call",
      value:
        lastFundedAmount > 0
          ? "What did the last deal solve?"
          : "What would this capital unlock?",
      detail:
        lastFundedAmount > 0
          ? "If the last deal created revenue, frame this as repeatable momentum. If it only plugged cash flow, resize tighter."
          : `Tie the answer to ${capitalPlan[0]?.label.toLowerCase() ?? "one use of funds"} so the deal has a reason beyond cash on hand.`,
    },
    {
      label: "Do not lead with",
      value: offer.factor <= 1.24 ? "Rate discounting" : "Max cash",
      detail:
        offer.factor <= 1.24
          ? "The structure is already close enough to defend. Sell speed, fit, and use case before giving up price."
          : "The number needs context first. Lead with payment fit and revenue use before pushing the largest approval.",
    },
  ];
  const brokerPackage = [
    {
      label: "First ask",
      value: formatMoney(firstAsk),
      detail: hasRoomAboveOffer
        ? `Anchor above the live offer so ${formatMoney(amountValue)} feels earned, not discounted.`
        : "Hold the top-line approval; any concession should come from term, payoff, or conditions.",
    },
    {
      label: "Fallback",
      value: `${formatMoney(fallbackAmount)} / ${fallbackTerm} mo`,
      detail: `Use this if the merchant flinches at the ${paymentCadence} payment.`,
    },
    {
      label: "Price guardrail",
      value: fallbackFactor.toFixed(2),
      detail: "Do not drop below this without better banks, payoff leverage, or cleaner stips.",
    },
    {
      label: "Condition",
      value:
        bankHealth === "clean"
          ? "Bank logins"
          : bankHealth === "workable"
            ? "Clear debits"
            : "Fresh statements",
      detail:
        bankHealth === "stressed"
          ? "Ask for the most recent clean days before packaging the file."
          : "Keep the document ask narrow so the call stays moving.",
    },
  ];
  const liveCallLenses: {
    id: ActiveLens;
    label: string;
    value: string;
    cue: string;
  }[] = [
    {
      id: "offer",
      label: "Offer",
      value: formatMoney(amountValue),
      cue: `${formatMoney(offer.paymentAmount)} ${paymentCadence}`,
    },
    {
      id: "close",
      label: "Close",
      value: dealActions[0]?.value ?? "Next move",
      cue: activeRebuttal.objection,
    },
    {
      id: "growth",
      label: "Growth",
      value: formatMoney(netAfterDailyPayment),
      cue: conversionStatus,
    },
    {
      id: "risk",
      label: "Risk",
      value: underwriting.tier,
      cue: brokerPackage[3]?.value ?? "Condition",
    },
  ];
  const liveCallCue =
    activeLens === "offer"
      ? `Quote ${formatMoney(amountValue)} around ${formatMoney(
          offer.paymentAmount,
        )} ${paymentCadence}; tune only if the payment becomes the objection.`
      : activeLens === "close"
        ? dealActions[0]?.detail
        : activeLens === "growth"
          ? conversionRead
        : redFlags.find((flag) => flag.includes("Ask what")) ?? redFlags[0];
  const offerMathCards = [
    {
      label: "Offer",
      value: formatMoney(offer.amount),
    },
    {
      label: "Factor",
      value: offer.factor.toFixed(2),
    },
    {
      label: "Term",
      value: `${termMonths} mo`,
    },
    {
      label: paymentFrequency === "daily" ? "Daily payment" : "Weekly payment",
      value: formatMoney(offer.paymentAmount),
    },
    {
      label: "Payback",
      value: formatMoney(offer.payback),
    },
  ];

  return (
    <main className={`app-shell live-call-shell lens-${activeLens}`}>
      <style>{`
        .live-call-shell .topbar .market-stamp.live-status-badge {
          isolation: isolate !important;
          position: relative !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          width: auto !important;
          min-width: 178px !important;
          min-height: 54px !important;
          padding: 0 22px !important;
          overflow: hidden !important;
          transform: none !important;
          transform-style: flat !important;
          border: 1px solid rgba(92, 225, 143, 0.24) !important;
          border-radius: 999px !important;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.02)),
            rgba(5, 12, 11, 0.72) !important;
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.25),
            0 0 26px rgba(92, 225, 143, 0.11),
            inset 0 1px 0 rgba(255, 255, 255, 0.11) !important;
          text-align: left !important;
          animation: broker-live-badge 4.8s ease-in-out infinite !important;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge::before {
          content: "" !important;
          position: absolute !important;
          inset: 1px !important;
          z-index: 0 !important;
          border-radius: inherit !important;
          background: linear-gradient(90deg, transparent, rgba(92, 225, 143, 0.12), transparent) !important;
          opacity: 0.72 !important;
          pointer-events: none !important;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge::after {
          display: none !important;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge .offer-orbit {
          position: relative !important;
          left: auto !important;
          top: auto !important;
          z-index: 3 !important;
          flex: 0 0 auto !important;
          width: 9px !important;
          height: 9px !important;
          border: 0 !important;
          border-radius: 50% !important;
          background: #ff4f57 !important;
          box-shadow:
            0 0 0 5px rgba(255, 79, 87, 0.12),
            0 0 16px rgba(255, 79, 87, 0.7) !important;
          opacity: 1 !important;
          transform: none !important;
          animation: broker-red-dot 1.9s ease-in-out infinite !important;
          pointer-events: none;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge .offer-orbit::before,
        .live-call-shell .topbar .market-stamp.live-status-badge .offer-orbit::after {
          display: none !important;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge .offer-depth {
          display: none !important;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge span,
        .live-call-shell .topbar .market-stamp.live-status-badge strong,
        .live-call-shell .topbar .market-stamp.live-status-badge small {
          display: none !important;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge b {
          position: relative !important;
          inset: auto !important;
          z-index: 4 !important;
          display: block !important;
          color: #5ce18f !important;
          font-size: clamp(0.82rem, 0.9vw, 0.96rem) !important;
          font-weight: 950 !important;
          letter-spacing: 0.12em !important;
          line-height: 1 !important;
          text-align: left !important;
          text-transform: uppercase !important;
          text-shadow:
            0 0 12px rgba(92, 225, 143, 0.45),
            0 1px 0 rgba(0, 0, 0, 0.35) !important;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge b::before {
          display: none !important;
        }

        .live-call-shell .topbar .market-stamp.live-status-badge em {
          display: none !important;
        }

        @keyframes broker-live-badge {
          0%, 100% { box-shadow: 0 14px 34px rgba(0, 0, 0, 0.25), 0 0 22px rgba(92, 225, 143, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.11); }
          50% { box-shadow: 0 14px 34px rgba(0, 0, 0, 0.25), 0 0 34px rgba(92, 225, 143, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.11); }
        }

        @keyframes broker-live-sweep {
          0%, 30% { left: -45%; opacity: 0; }
          48% { opacity: 1; }
          100% { left: 112%; opacity: 0; }
        }

        @keyframes broker-red-dot {
          0%, 100% { transform: scale(0.9); opacity: 0.72; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes broker-live-line {
          0%, 100% { transform: scaleX(0.42); opacity: 0.45; }
          50% { transform: scaleX(1); opacity: 1; }
        }

        @media (max-width: 780px) {
          .live-call-shell .topbar .market-stamp.live-status-badge {
            width: auto !important;
            min-height: 52px !important;
          }
        }
      `}</style>
      <header className="topbar">
        <div className="brand-lockup">
          <span>Private equity</span>
          <h1>Broker Club</h1>
        </div>
        <div className="market-stamp live-status-badge" aria-label="Live offer">
          <i className="offer-depth" aria-hidden="true" />
          <i className="offer-orbit" aria-hidden="true" />
          <b>Live offer</b>
          <em aria-hidden="true">
            <i />
            <i />
            <i />
          </em>
        </div>
      </header>

      <section className="call-cockpit" aria-label="Live call command center">
        <div className="call-focus-card">
          <span>Working number</span>
          <strong>{formatMoney(amountValue)}</strong>
          <p>{formatMoney(offer.paymentAmount)} {paymentCadence} · {offer.factor.toFixed(2)} · {termMonths} mo</p>
        </div>
        <div className="call-cue-card">
          <span>Say next</span>
          <p>{liveCallCue}</p>
        </div>
        <div className="lens-switcher" role="tablist" aria-label="Live call lenses">
          {liveCallLenses.map((lens) => (
            <button
              type="button"
              key={lens.id}
              className={activeLens === lens.id ? "is-active" : ""}
              role="tab"
              aria-selected={activeLens === lens.id}
              onClick={() => setActiveLens(lens.id)}
            >
              <span>{lens.label}</span>
              <strong>{lens.value}</strong>
              <small>{lens.cue}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="market-tape" aria-label="Workflow">
        <span>Desk</span>
        <span>Structure</span>
        <span>Risk</span>
        <span>Close</span>
      </section>

      <section className="summary-grid" aria-label="Deal snapshot">
        <div className="snapshot-card offer-card">
          <span>Primary offer</span>
          <strong>{formatMoney(amountValue)}</strong>
          <small>Max approval · {underwriting.tier}</small>
        </div>
        <div className="snapshot-card payment-card">
          <span>Payment load</span>
          <strong>{formatMoney(offer.paymentAmount)}</strong>
          <small>{formatPercent(paymentUtilization)} of payment room</small>
        </div>
        <div className="snapshot-card approval-card">
          <span>Payback</span>
          <strong>{formatMoney(offer.payback)}</strong>
          <small>{termMonths} months · {offer.termDays} ACH days</small>
        </div>
        <div className="snapshot-card pricing-card">
          <span>Price</span>
          <strong>{offer.factor.toFixed(2)}</strong>
          <small>{payoffPerDollar.toFixed(2)} payback per $1</small>
        </div>
      </section>

      <section className="deal-desk">
        <aside className="panel input-panel section-blue">
          <div className="panel-heading">
            <span>Profile</span>
            <h2>Merchant profile</h2>
          </div>

          <div className="input-group">
            <h3>Inputs</h3>
            <div className="field-grid">
              <label>
                Gross deposits
                <input
                  type="number"
                  min="0"
                  value={monthlyRevenueInput}
                  onChange={(event) =>
                    updateNumberInput(
                      event.target.value,
                      setMonthlyRevenueInput,
                      setMonthlyRevenue,
                    )
                  }
                />
              </label>
              <label>
                Avg balance
                <input
                  type="number"
                  min="0"
                  value={dailyBalanceInput}
                  onChange={(event) =>
                    updateNumberInput(
                      event.target.value,
                      setDailyBalanceInput,
                      setDailyBalance,
                    )
                  }
                />
              </label>
              <label>
                Existing debits
                <input
                  type="number"
                  min="0"
                  value={existingDailyPaymentsInput}
                  onChange={(event) =>
                    updateNumberInput(
                      event.target.value,
                      setExistingDailyPaymentsInput,
                      setExistingDailyPayments,
                    )
                  }
                />
              </label>
              <label>
                Prior funded
                <input
                  type="number"
                  min="0"
                  placeholder="Amount of prior funding"
                  value={lastFundedAmountInput}
                  onChange={(event) =>
                    updateNumberInput(
                      event.target.value,
                      setLastFundedAmountInput,
                      setLastFundedAmount,
                    )
                  }
                />
              </label>
              <label>
                Credit score
                <input
                  type="number"
                  min="450"
                  max="850"
                  value={creditScoreInput}
                  onChange={(event) =>
                    updateNumberInput(
                      event.target.value,
                      setCreditScoreInput,
                      setCreditScore,
                    )
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

          <div className="input-note renewal-note">
            <b>Last funded deal</b>
            <span>{renewalRead}</span>
          </div>

          <div className="submission-radar" aria-label="Submission readiness radar">
            <div className="submission-radar-head">
              <span>Submission radar</span>
              <strong>{paymentUtilization <= 1 ? "Ready to package" : "Tune first"}</strong>
            </div>
            <div className="submission-radar-grid">
              {submissionRadar.map((item) => (
                <article key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>

        <section className="panel offer-panel section-green">
          <div className="panel-heading horizontal">
            <div>
              <span>Approval</span>
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
              <small>Live working figure; adjust for payment room before submit.</small>
            </div>
            <div className="payment-focus">
              <span>{paymentLabel}</span>
              <strong>{formatMoney(offer.paymentAmount)}</strong>
              <small>{formatPercent(offer.holdback)} holdback</small>
            </div>
          </div>

          <div className="slider-card">
            <div className="frequency-control" aria-label="Payment frequency">
              <span>Payment</span>
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
                Amount <b>{formatMoney(amountValue)}</b>
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
                Term <b>{termMonths} mo</b>
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

          <div className="offer-math-grid" aria-label="Offer terms">
            {offerMathCards.map((card) => (
              <div key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>

          <div className="merchant-surface-card" aria-label="3D merchant deal analytics">
            <div className="surface-header">
              <div>
                <span>Merchant analytics</span>
                <h3>3D deal surface</h3>
              </div>
              <strong>{brokerPosture.label}</strong>
            </div>
            <div className="surface-body">
              <div className="surface-scene" aria-hidden="true">
                <div className="surface-grid">
                  {dealSurfaceMetrics.map((metric, index) => (
                    <div
                      className={`surface-pillar tone-${metric.tone}`}
                      key={metric.label}
                      style={
                        {
                          "--height": `${46 + metric.score * 118}px`,
                          "--depth": `${22 + metric.score * 64}px`,
                          "--delay": `${index * 0.22}s`,
                        } as SurfaceMetricStyle
                      }
                    >
                      <i />
                      <b />
                      <em />
                    </div>
                  ))}
                </div>
                <div className="surface-orbit" />
              </div>
              <div className="surface-readout">
                <p>{dealSurfaceRead}</p>
                <div className="surface-metrics">
                  {dealSurfaceMetrics.map((metric) => (
                    <div key={metric.label}>
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <small>{metric.detail}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="conversion-map" aria-label="Capital conversion map">
            <div className="conversion-header">
              <div>
                <span>Capital conversion</span>
                <h3>Use of funds to payment spread</h3>
              </div>
              <strong>{conversionStatus}</strong>
            </div>
            <div className="conversion-body">
              <div className="conversion-stage" aria-hidden="true">
                {conversionNodes.map((node, index) => (
                  <div
                    className={`conversion-block tone-${node.tone}`}
                    key={node.label}
                    style={
                      {
                        "--weight": `${node.weight}`,
                        "--delay": `${index * 0.18}s`,
                      } as ConversionNodeStyle
                    }
                  >
                    <span>{node.label}</span>
                    <b>{node.value}</b>
                  </div>
                ))}
              </div>
              <div className="conversion-panel">
                <p>{conversionRead}</p>
                <div className="conversion-node-grid">
                  {conversionNodes.map((node) => (
                    <article key={node.label}>
                      <span>{node.label}</span>
                      <strong>{node.value}</strong>
                      <small>{node.detail}</small>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="action-queue" aria-label="Broker action queue">
            <div className="action-queue-header">
              <span>Broker command queue</span>
              <strong>{paymentUtilization <= 1 ? "Callable" : "Tune first"}</strong>
            </div>
            <div className="action-queue-grid">
              {dealActions.map((action) => (
                <article key={action.label}>
                  <span>{action.label}</span>
                  <strong>{action.value}</strong>
                  <p>{action.detail}</p>
                </article>
              ))}
            </div>
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
                    Remaining {formatMoney(payoff.remainingBalance)} · save{" "}
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
                <small>{mode.term} mo</small>
              </button>
            ))}
          </div>

          <div className={`broker-package ${brokerPosture.tone}`}>
            <div className="broker-package-header">
              <div>
                <span>Broker package</span>
                <h3>{brokerPosture.label}</h3>
              </div>
              <strong>{formatPercent(paymentUtilization)}</strong>
            </div>
            <p>{brokerPosture.detail}</p>
            <div className="package-grid">
              {brokerPackage.map((item) => (
                <article key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.detail}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="panel read-panel section-amber">
          <div className="panel-heading">
            <span>Risk read</span>
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
      </section>

      <section className="strategy-zone">
        <div className="panel industry-panel section-purple strategy-workstation">
          <div className="panel-heading horizontal">
            <div>
              <span>Closing strategy</span>
              <h2>Industry angle</h2>
            </div>
            <div className="industry-tools">
              <label className="industry-search">
                Search industry
                <input
                  type="search"
                  placeholder="Try hotel, daycare, trucking..."
                  value={industrySearch}
                  onChange={(event) => setIndustrySearch(event.target.value)}
                />
              </label>
              <label className="industry-select">
                Merchant industry
                <select
                  value={selectedIndustry.id}
                  onChange={(event) => {
                    setIndustryId(event.target.value);
                    setIndustrySearch("");
                  }}
                >
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="industry-results" aria-label="Industry search results">
            {filteredIndustries.slice(0, 8).map((industry) => (
              <button
                type="button"
                key={industry.id}
                className={industry.id === selectedIndustry.id ? "is-active" : ""}
                onMouseDown={() => {
                  setIndustryId(industry.id);
                  setIndustrySearch("");
                }}
                onClick={() => {
                  setIndustryId(industry.id);
                  setIndustrySearch("");
                }}
              >
                {industry.name}
              </button>
            ))}
            {filteredIndustries.length === 0 ? (
              <span>No match yet. Try a broader trade or business type.</span>
            ) : null}
          </div>
          <div className="strategy-command">
            <h3>{selectedIndustry.headline}</h3>
            <div className="strategy-intel">
              <div>
                <span>Operating signal</span>
                <strong>{selectedIntelligence.targetMetric}</strong>
                <p>{selectedIntelligence.operatingSignal}</p>
              </div>
              <div>
                <span>90-day lift target</span>
                <strong>{formatMoney(projectedLiftDollars)}</strong>
                <p>
                  Estimated monthly revenue target from the selected industry
                  model, not a guaranteed outcome.
                </p>
              </div>
            </div>
          </div>

          <div className="strategy-board">
            <div className="strategy-lane">
              <div className="allocation-card">
                <div className="allocation-header">
                  <div>
                    <span>Use of funds model</span>
                    <h3>{formatMoney(offer.amount)} working allocation</h3>
                  </div>
                  <strong>{selectedIndustry.name}</strong>
                </div>
                <div className="allocation-grid">
                  {capitalPlan.map((item) => (
                    <article key={item.label}>
                      <div className="allocation-topline">
                        <span>{item.label}</span>
                        <strong>{formatMoney(item.amount)}</strong>
                      </div>
                      <div className="allocation-meter">
                        <i style={{ width: `${Math.round(item.percent * 100)}%` }} />
                      </div>
                      <p>{item.detail}</p>
                      <small>Verify: {item.proof}</small>
                    </article>
                  ))}
                </div>
              </div>
              <div className="strategy-note">
                <span>Close angle</span>
                <ul>
                  {selectedIndustry.uses.map((use) => (
                    <li key={use}>{use}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="strategy-lane">
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
                  {revenuePath.map((item) => (
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
                      <em>{item.note}</em>
                    </div>
                  ))}
                </div>

                <div className="revenue-lever-grid">
                  {revenueLevers.map((lever) => (
                    <article key={lever.label}>
                      <span>{lever.label}</span>
                      <strong>{formatMoney(lever.amount)}</strong>
                      <p>{lever.detail}</p>
                      <small>{lever.math}</small>
                    </article>
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
              </div>
              <div className="strategy-note">
                <span>Revenue discipline</span>
                <ul>
                  {selectedIndustry.revenueMoves.map((move) => (
                    <li key={move}>{move}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rebuttal-deck" aria-label="Industry rebuttal slideshow">
            <div className="rebuttal-topline">
              <div>
                <span>Objection handling</span>
                <h3>{selectedIndustry.name} rebuttal deck</h3>
              </div>
              <div className="rebuttal-controls">
                <button
                  type="button"
                  aria-label="Previous rebuttal"
                  onClick={() => setRebuttalIndex(rebuttalIndex - 1)}
                >
                  Prev
                </button>
                <strong>
                  {((rebuttalIndex % rebuttals.length) + rebuttals.length) %
                    rebuttals.length +
                    1}
                  /{rebuttals.length}
                </strong>
                <button
                  type="button"
                  aria-label="Next rebuttal"
                  onClick={() => setRebuttalIndex(rebuttalIndex + 1)}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="rebuttal-tabs" role="tablist" aria-label="Common objections">
              {rebuttals.map((rebuttal, index) => (
                <button
                  type="button"
                  key={rebuttal.objection}
                  className={
                    index ===
                    ((rebuttalIndex % rebuttals.length) + rebuttals.length) %
                      rebuttals.length
                      ? "is-active"
                      : ""
                  }
                  role="tab"
                  aria-selected={
                    index ===
                    ((rebuttalIndex % rebuttals.length) + rebuttals.length) %
                      rebuttals.length
                  }
                  onMouseDown={() => setRebuttalIndex(index)}
                  onClick={() => setRebuttalIndex(index)}
                >
                  {rebuttal.objection}
                </button>
              ))}
            </div>

            <article className="rebuttal-slide" aria-live="polite">
              <div className="rebuttal-script">
                <span>Merchant says</span>
                <h4>“{activeRebuttal.objection}”</h4>
                <p>{activeRebuttal.intent}</p>
              </div>
              <div className="rebuttal-lines">
                <div>
                  <span>Open</span>
                  <p>{activeRebuttal.opener}</p>
                </div>
                <div>
                  <span>Bridge to this industry</span>
                  <p>{activeRebuttal.bridge}</p>
                </div>
                <div>
                  <span>Proof point</span>
                  <p>{activeRebuttal.proof}</p>
                </div>
                <div>
                  <span>Close</span>
                  <p>{activeRebuttal.close}</p>
                </div>
              </div>
            </article>
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
      </section>

      <section className="reference-strip" aria-label="Underwriting basis">
        <strong>Model basis</strong>
        <span>deposits</span>
        <span>balance</span>
        <span>bank activity</span>
        <span>daily debits</span>
        <span>credit</span>
        <span>estimate, not lender approval</span>
      </section>
    </main>
  );
}
