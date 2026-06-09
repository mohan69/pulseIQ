import type {
  Assessment,
  Cockpit,
  CockpitMetric,
  Recommendation,
  Report,
  Scenario,
} from "./types";

export const MICROFINISH_PUBLIC_DOMAIN_NAME =
  "Microfinish Public-Domain Sample Diagnostic";

export const MICROFINISH_DISCLAIMER =
  "This is a public-domain sample diagnostic. It is not an audit, valuation, credit report, or assessment of actual internal performance. Public financial signals are directional and require internal validation. Sample targets are illustrative only and are not Microfinish management targets. No claim is made regarding audited consolidated group revenue.";

export function isMicrofinishPublicDomain(
  assessment: Assessment | undefined,
): boolean {
  return assessment?.companyName === MICROFINISH_PUBLIC_DOMAIN_NAME;
}

export function presentCockpit(
  assessment: Assessment | undefined,
  cockpit: Cockpit,
): Cockpit {
  if (!isMicrofinishPublicDomain(assessment)) return cockpit;
  return {
    ...cockpit,
    metrics: cockpit.metrics.map((metric) => {
      if (isCashVisibilityMetric(metric)) {
        return {
          ...metric,
          label: "Working capital visibility",
          value: 0,
          target: 0,
          status: "at_risk",
          note:
            "Requires internal data. Working capital visibility requires AR, AP, inventory, and open order backlog exports.",
        };
      }
      if (isProductivityMetric(metric)) {
        return {
          ...metric,
          label: "Revenue per employee / productivity",
          value: 0,
          target: 0,
          status: "at_risk",
          note:
            "Requires confirmed headcount and consolidated revenue. Public headcount signals must not be presented as a firm productivity metric.",
        };
      }
      return metric;
    }),
  };
}

export function presentScenarios(
  assessment: Assessment | undefined,
  scenarios: Scenario[],
): Scenario[] {
  if (!isMicrofinishPublicDomain(assessment)) return scenarios;
  return MICROFINISH_SCENARIOS;
}

export function presentRecommendations(
  assessment: Assessment | undefined,
  recommendations: Recommendation[],
): Recommendation[] {
  if (!isMicrofinishPublicDomain(assessment)) return recommendations;
  return MICROFINISH_RECOMMENDATIONS;
}

export function presentReport(
  assessment: Assessment | undefined,
  report: Report | undefined,
): Report | undefined {
  if (!report || !isMicrofinishPublicDomain(assessment)) return report;
  return {
    ...report,
    executiveSummary: `${MICROFINISH_DISCLAIMER} The sample synthesises ${report.sourceCount} public-domain sources into directional operating hypotheses, validation priorities, and a practical internal data request.`,
    cockpit: presentCockpit(assessment, report.cockpit),
    scenarios: presentScenarios(assessment, report.scenarios),
    recommendations: presentRecommendations(
      assessment,
      report.recommendations,
    ),
  };
}

export function metricRequiresInternalData(
  assessment: Assessment | undefined,
  metric: CockpitMetric,
): boolean {
  return (
    isMicrofinishPublicDomain(assessment) &&
    (isCashVisibilityMetric(metric) || isProductivityMetric(metric))
  );
}

function isCashVisibilityMetric(metric: CockpitMetric): boolean {
  return (
    metric.key.toLowerCase().includes("cash") ||
    metric.label.toLowerCase().includes("cash")
  );
}

function isProductivityMetric(metric: CockpitMetric): boolean {
  const value = `${metric.key} ${metric.label}`.toLowerCase();
  return (
    value.includes("productivity") ||
    value.includes("revenue per employee") ||
    value.includes("rpe")
  );
}

const MICROFINISH_SCENARIOS: Scenario[] = [
  {
    key: "revenue_plus_10",
    label: "Revenue growth toward an illustrative ₹650Cr ambition",
      description:
        "Explore the operating requirements to move from the directional ₹566Cr public-domain signal toward a ₹650Cr illustrative ambition.",
    currentBaseline:
      "₹566Cr directional public signal; not audited consolidated group revenue.",
    target:
      "₹650Cr illustrative ambition for scenario planning, not a Microfinish management target.",
    options: [
      "Validate entity and product-family revenue",
      "Prioritise severe-service, refining, pharma/API, and export opportunities",
      "Improve proposal conversion and order velocity",
    ],
    pros: ["Creates a measurable growth discussion", "Links growth to pipeline evidence"],
    shortfalls: ["Requires internal revenue, backlog, and pipeline validation"],
    expectedImpact: "Directional growth case only; financial impact requires internal data.",
    risks: ["Treating public signals as consolidated audited revenue"],
    recommendation:
      "Validate the revenue baseline and opportunity pipeline before setting a formal growth target.",
    confidence: "low",
  },
  {
    key: "margin_plus_10",
    label: "Margin improvement by 2–3 percentage points",
    description:
      "Test a realistic margin improvement range through product mix, pricing discipline, sourcing, and proposal quality.",
    currentBaseline:
      "22% illustrative sample signal; requires entity-level and product-family validation.",
    target: "Illustrative 24–25% range, subject to internal validation.",
    options: [
      "Build product-family and customer margin views",
      "Review severe-service and engineered-order pricing",
      "Track proposal revision and compliance effort",
    ],
    pros: ["More realistic than a ten-point jump", "Supports focused operating actions"],
    shortfalls: ["Requires cost, pricing, and mix data"],
    expectedImpact: "Potential 2–3 percentage-point improvement after validation.",
    risks: ["Margin estimates may not be comparable across entities"],
    recommendation:
      "Establish a validated margin baseline before approving pricing or cost actions.",
    confidence: "low",
  },
  {
    key: "cost_minus_10",
    label: "Quote and proposal cycle-time reduction by 20%",
    description:
      "Improve proposal velocity while protecting technical, certification, and compliance quality.",
    currentBaseline: "Cycle time, revision count, and win/loss data are not available.",
    target: "Illustrative 20% cycle-time reduction after baseline measurement.",
    options: [
      "Create a quote and proposal register",
      "Track revisions, approvals, and compliance effort",
      "Standardise reusable technical and certification content",
    ],
    pros: ["Can improve responsiveness", "Creates process evidence quickly"],
    shortfalls: ["Requires timestamped quote and proposal records"],
    expectedImpact: "Faster proposal throughput and clearer conversion analysis.",
    risks: ["Speed improvements must not weaken engineering review"],
    recommendation:
      "Baseline proposal cycle time for four weeks, then target the largest avoidable delays.",
    confidence: "medium",
  },
  {
    key: "cash_improvement",
    label: "Working-capital visibility and improvement",
    description:
      "Build an evidence-based view of receivables, inventory, payables, and open order backlog before setting cash targets.",
    currentBaseline: "Requires internal AR, inventory, AP, and backlog exports.",
    target: "Validated working-capital baseline and prioritised improvement actions.",
    options: [
      "Review AR ageing and overdue collections",
      "Segment inventory by movement and project linkage",
      "Connect open orders, billing milestones, and supplier commitments",
    ],
    pros: ["Improves cash visibility", "Supports weekly operating cadence"],
    shortfalls: ["No reliable public working-capital baseline"],
    expectedImpact: "Cash opportunity can be quantified only after internal validation.",
    risks: ["Premature targets may distort customer or supplier decisions"],
    recommendation:
      "Start with read-only AR, AP, inventory, and backlog exports.",
    confidence: "low",
  },
  {
    key: "headcount_minus_15",
    label: "Revenue per employee improvement without headcount reduction",
    description:
      "Explore productivity gains through automation, proposal velocity, workflow clarity, and better commercial focus, not workforce reduction.",
    currentBaseline:
      "Requires confirmed headcount and audited or consolidated revenue.",
    target:
      "A validated productivity baseline and measurable improvement plan without an assumed headcount reduction.",
    options: [
      "Automate repetitive reporting and proposal administration",
      "Reduce proposal rework and approval delays",
      "Improve product, customer, and channel focus",
    ],
    pros: ["Improves throughput without presuming workforce action", "Supports respectful operating review"],
    shortfalls: ["Public headcount signals are not a reliable baseline"],
    expectedImpact: "Higher proposal and execution throughput per confirmed employee.",
    risks: ["Using unverified public headcount as a performance judgment"],
    recommendation:
      "Confirm headcount and revenue first, then measure productivity by workflow and output.",
    confidence: "low",
  },
];

const recommendationInputs = [
  [
    "Validate public financial signals with internal audited/entity-level data",
    "Reconcile directional public revenue and margin signals to approved entity-level financials before drawing performance conclusions.",
    "Creates a trusted baseline for the diagnostic.",
    "Finance leadership",
    14,
  ],
  [
    "Build a product-family revenue and margin view",
    "Create a consistent view across valves, pumps, automation, severe-service, and pharma/API product families.",
    "Improves portfolio and pricing decisions.",
    "Finance and business leadership",
    30,
  ],
  [
    "Build a quote and proposal register",
    "Track cycle time, revision count, win/loss outcome, value, approvals, and owner for each proposal.",
    "Improves proposal velocity and conversion visibility.",
    "Commercial operations",
    30,
  ],
  [
    "Review working-capital visibility",
    "Combine AR ageing, inventory, AP, and open order backlog into one weekly operating view.",
    "Surfaces validated cash and execution opportunities.",
    "Finance and operations",
    21,
  ],
  [
    "Create customer and market profitability views",
    "Analyse profitability by customer segment, industry, geography, and channel using internal revenue and cost data.",
    "Supports commercial prioritisation and pricing discipline.",
    "Commercial and finance leadership",
    45,
  ],
  [
    "Map the severe-service and pharma/API opportunity pipeline",
    "Create a qualified pipeline view for severe-service/refining and pharma/API opportunities, including stage, value, probability, and next action.",
    "Clarifies growth focus and resource allocation.",
    "Sales leadership",
    30,
  ],
  [
    "Review proposal compliance and certification effort",
    "Measure documentation, certification, technical review, and revision effort by proposal type.",
    "Reduces avoidable proposal effort while protecting quality.",
    "Engineering and quality leadership",
    45,
  ],
  [
    "Identify distributor and export channel indicators",
    "Track revenue, pipeline, conversion, margin, responsiveness, and concentration by distributor and export market.",
    "Improves channel performance visibility.",
    "International sales leadership",
    45,
  ],
  [
    "Build a 90-day leadership cockpit",
    "Create a concise weekly cockpit for validated revenue, margin, cash, pipeline, proposal velocity, and execution measures.",
    "Creates a shared leadership operating cadence.",
    "Leadership team",
    30,
  ],
  [
    "Run a 48-hour internal diagnostic using read-only exports",
    "Use approved read-only financial, commercial, working-capital, and proposal exports to replace public assumptions with internal evidence.",
    "Accelerates a higher-confidence diagnostic without system integration.",
    "Assessment sponsor",
    2,
  ],
] as const;

const MICROFINISH_RECOMMENDATIONS: Recommendation[] =
  recommendationInputs.map((item, index) => ({
    id: `rec-microfinish-${index + 1}`,
    rank: index + 1,
    title: item[0],
    description: item[1],
    priority: index === 0 || index === 9 ? "P0" : index < 5 ? "P1" : "P2",
    businessImpact: item[2],
    effort: index === 9 ? "low" : "medium",
    timeframeDays: item[4],
    ownerRole: item[3],
    evidence:
      "Public-domain sample diagnostic; recommendation requires internal validation and approved read-only source data.",
    confidence: "low",
  }));
