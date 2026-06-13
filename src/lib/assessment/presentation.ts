import type {
  Assessment,
  Cockpit,
  CockpitMetric,
  Recommendation,
  Report,
  Scenario,
  TruthLayer,
} from "./types";
import { DIAGNOSTIC_DISCLAIMER } from "@/lib/diagnostic-positioning";

export const MICROFINISH_PUBLIC_DOMAIN_NAME =
  "Microfinish Public-Domain Sample Diagnostic";

export const MICROFINISH_DISCLAIMER =
  "This is a public-domain sample diagnostic. It is not an audit, valuation, credit report, or assessment of actual internal performance. Public financial signals are directional and require internal validation. Sample targets are illustrative only and are not Microfinish management targets. No claim is made regarding audited consolidated group revenue.";

export const PUBLIC_DOMAIN_DISCLAIMER =
  "This is a public-domain sample diagnostic. It is not an audit, valuation, credit report, or assessment of actual internal performance. Financial and operational baselines require approved internal data and human validation.";

export const BHARAT_DEMO_ID = "asm-bharat-heavy-fabrications";

export function isBharatDemoAssessment(
  assessment: Assessment | undefined,
): boolean {
  return assessment?.id === BHARAT_DEMO_ID;
}

export function isMicrofinishPublicDomain(
  assessment: Assessment | undefined,
): boolean {
  return assessment?.companyName === MICROFINISH_PUBLIC_DOMAIN_NAME;
}

export function isPublicDomainAssessment(
  assessment: Assessment | undefined,
): boolean {
  if (!assessment) return false;
  if (isMicrofinishPublicDomain(assessment)) return true;

  const name = assessment.companyName
    .toLowerCase()
    .replace(/[_\u2010-\u2015-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return [
    /\bpublic domain\b/,
    /\bpublic source(?:d)?\b/,
    /\bpublic sample\b/,
    /\bsample diagnostic\b/,
    /\bprospect diagnostic\b/,
  ].some((marker) => marker.test(name));
}

export function presentCockpit(
  assessment: Assessment | undefined,
  cockpit: Cockpit,
): Cockpit {
  if (!isPublicDomainAssessment(assessment)) return cockpit;
  return {
    ...cockpit,
    metrics: cockpit.metrics.map((metric) => {
      if (isRevenueMetric(metric)) {
        return internalDataMetric(
          metric,
          "Revenue actual",
          "Public-domain signal — Requires internal validation. No confirmed public financial baseline is available.",
        );
      }
      if (isMarginMetric(metric)) {
        return internalDataMetric(
          metric,
          "Margin actual",
          "Requires internal data. No confirmed public margin baseline is available.",
        );
      }
      if (isCashVisibilityMetric(metric)) {
        return internalDataMetric(
          metric,
          "Working capital visibility",
          "Requires internal data. Working capital visibility requires AR, AP, inventory, and open order backlog exports.",
        );
      }
      if (isProductivityMetric(metric)) {
        return internalDataMetric(
          metric,
          "Revenue per employee / productivity",
          "Requires internal data. Confirmed headcount and revenue are required before calculating RPE.",
        );
      }
      if (isOrderBookMetric(metric)) {
        return internalDataMetric(
          metric,
          "Order book / backlog value",
          "Requires internal validation. Open orders, backlog ageing, holds, and conversion status require approved internal data.",
        );
      }
      if (isProfitabilityMetric(metric)) {
        return internalDataMetric(
          metric,
          "Profitability",
          "Requires internal validation. No confirmed public profitability baseline is available.",
        );
      }
      if (isRevenueExposureMetric(metric)) {
        return internalDataMetric(
          metric,
          "Revenue exposure",
          "Illustrative only — requires internal validation.",
        );
      }
      return metric;
    }),
    topRisks: [
      {
        id: "public-financial-validation",
        title: "Financial baseline requires validation",
        description:
          "Public financial signals are directional and require approved internal evidence before management use.",
        likelihood: "medium",
        impact: "high",
      },
    ],
    topOpportunities: [
      {
        id: "public-internal-diagnostic",
        title: "Run a validated internal diagnostic",
        description:
          "Replace public assumptions with approved financial, commercial, operating, and readiness evidence.",
        impactInr: 0,
        timeframeDays: 30,
      },
    ],
  };
}

export function presentScenarios(
  assessment: Assessment | undefined,
  scenarios: Scenario[],
): Scenario[] {
  if (!isPublicDomainAssessment(assessment)) return scenarios;
  return PUBLIC_DOMAIN_SCENARIOS;
}

export function presentRecommendations(
  assessment: Assessment | undefined,
  recommendations: Recommendation[],
): Recommendation[] {
  if (!isPublicDomainAssessment(assessment)) return recommendations;
  const presented = isMicrofinishPublicDomain(assessment)
    ? MICROFINISH_RECOMMENDATIONS
    : recommendations;
  return presented.map((recommendation) => ({
    ...recommendation,
    businessImpact: "Requires internal validation.",
    evidence: recommendation.evidence.includes("internal validation")
      ? recommendation.evidence
      : `${recommendation.evidence} Internal validation required.`,
    confidence: "low",
  }));
}

export function presentTruthLayers(
  assessment: Assessment | undefined,
  layers: TruthLayer[],
): TruthLayer[] {
  if (!isPublicDomainAssessment(assessment)) return layers;
  return layers.map((layer) => ({
    ...layer,
    description: maskPublicFinancialText(layer.description),
    findings: layer.findings.map((finding) => ({
      ...finding,
      text: maskPublicFinancialText(finding.text),
    })),
    evidence: layer.evidence.map((evidence) => ({
      ...evidence,
      excerpt: maskPublicFinancialText(evidence.excerpt),
    })),
    gaps: layer.gaps.map(maskPublicFinancialText),
    contradictions: layer.contradictions.map(maskPublicFinancialText),
    confidence: "low",
  }));
}

export function presentReport(
  assessment: Assessment | undefined,
  report: Report | undefined,
): Report | undefined {
  if (!report || !isPublicDomainAssessment(assessment)) return report;
  const executiveSummary = isMicrofinishPublicDomain(assessment)
    ? `${MICROFINISH_DISCLAIMER} The sample synthesises ${report.sourceCount} public-domain source${report.sourceCount === 1 ? "" : "s"} into directional operating hypotheses, compliance and standards readiness gaps, supplier and prequalification evidence needs, AI governance controls, validation priorities, and a practical internal data request. ${DIAGNOSTIC_DISCLAIMER}`
    : `${PUBLIC_DOMAIN_DISCLAIMER} The diagnostic synthesises ${report.sourceCount} registered public-domain source${report.sourceCount === 1 ? "" : "s"} into company-context findings, evidence-readiness gaps, and an internal data request without asserting a confirmed financial baseline. ${DIAGNOSTIC_DISCLAIMER}`;
  return {
    ...report,
    executiveSummary,
    truthLayers: presentTruthLayers(assessment, report.truthLayers),
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
  return isPublicDomainAssessment(assessment) && isPublicFinancialMetric(metric);
}

function internalDataMetric(
  metric: CockpitMetric,
  label: string,
  note: string,
): CockpitMetric {
  return {
    ...metric,
    label,
    value: 0,
    target: 0,
    status: "at_risk",
    note,
  };
}

function isRevenueMetric(metric: CockpitMetric): boolean {
  const value = `${metric.key} ${metric.label}`.toLowerCase();
  return value.includes("revenue") && !isProductivityMetric(metric);
}

function isMarginMetric(metric: CockpitMetric): boolean {
  const value = `${metric.key} ${metric.label}`.toLowerCase();
  return value.includes("margin");
}

function isCashVisibilityMetric(metric: CockpitMetric): boolean {
  const value = metricText(metric);
  return (
    value.includes("cash") ||
    value.includes("working capital") ||
    value.includes("receivable") ||
    value.includes("payable")
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

function isOrderBookMetric(metric: CockpitMetric): boolean {
  const value = metricText(metric);
  return value.includes("order book") || value.includes("backlog");
}

function isProfitabilityMetric(metric: CockpitMetric): boolean {
  const value = metricText(metric);
  return (
    value.includes("profit") ||
    value.includes("ebitda") ||
    value.includes("contribution")
  );
}

function isRevenueExposureMetric(metric: CockpitMetric): boolean {
  return metricText(metric).includes("exposure");
}

function isPublicFinancialMetric(metric: CockpitMetric): boolean {
  return (
    isRevenueMetric(metric) ||
    isMarginMetric(metric) ||
    isCashVisibilityMetric(metric) ||
    isProductivityMetric(metric) ||
    isOrderBookMetric(metric) ||
    isProfitabilityMetric(metric) ||
    isRevenueExposureMetric(metric)
  );
}

function metricText(metric: CockpitMetric): string {
  return `${metric.key} ${metric.label} ${metric.note}`.toLowerCase();
}

function maskPublicFinancialText(value: string): string {
  if (
    !/\b(revenue|margin|cash|working capital|receivable|payable|rpe|revenue per employee|order book|backlog|exposure|profit|ebitda)\b/i.test(
      value,
    )
  ) {
    return value;
  }
  return value
    .replace(
      /₹\s*[\d,.]+(?:\s*(?:Cr|crore|L|lakh|million|billion))?/gi,
      "Requires internal validation",
    )
    .replace(
      /\b\d+(?:\.\d+)?\s*(?:Cr|crore|L|lakh|million|billion)\b/gi,
      "Requires internal validation",
    )
    .replace(/\b\d+(?:\.\d+)?\s*%/g, "Requires internal validation")
    .replace(/\bhigh confidence\b/gi, "Requires validation");
}

const PUBLIC_DOMAIN_SCENARIOS: Scenario[] = [
  {
    key: "revenue_plus_10",
    label: "Revenue visibility case",
    description:
      "Public-domain scenario. Test revenue and order-book visibility only after approved internal financial and commercial evidence is available.",
    currentBaseline: "Requires internal validation.",
    target: "Validated revenue, order-book, and conversion baseline.",
    options: [
      "Validate entity and product-family revenue.",
      "Reconcile order book, backlog, and proposal pipeline.",
      "Confirm conversion and shipment assumptions.",
    ],
    pros: ["Creates a controlled evidence baseline."],
    shortfalls: ["Requires approved internal revenue, backlog, and pipeline data."],
    expectedImpact: "Requires approved internal data before quantification.",
    risks: ["Treating public signals as audited or internally validated revenue."],
    recommendation:
      "Validate the internal baseline before approving revenue or growth actions.",
    confidence: "low",
  },
  {
    key: "margin_plus_10",
    label: "Margin and profitability evidence case",
    description:
      "Test product, customer, and channel profitability only after reconciled cost and revenue evidence is available.",
    currentBaseline: "Requires internal validation.",
    target: "Validated product-family and customer profitability baseline.",
    options: [
      "Build product-family and customer margin views.",
      "Reconcile pricing, material, labour, overhead, and cost-to-serve.",
      "Track proposal revisions and exception costs.",
    ],
    pros: ["Supports evidence-led pricing and portfolio decisions."],
    shortfalls: ["Requires approved cost, pricing, and mix data."],
    expectedImpact: "Requires approved internal data before quantification.",
    risks: ["Public or cross-entity margin signals may not be comparable."],
    recommendation:
      "Establish a validated margin baseline before approving pricing or cost actions.",
    confidence: "low",
  },
  {
    key: "cost_minus_10",
    label: "Proposal and operating cycle-time case",
    description:
      "Assess proposal velocity while protecting technical, standards, documentation, and approval quality.",
    currentBaseline: "Cycle time, revision count, and win/loss data are not available.",
    target: "Validated cycle-time and conversion baseline.",
    options: [
      "Create a quote and proposal register.",
      "Track revisions, approvals, and compliance effort.",
      "Standardise reusable evidence content after human review.",
    ],
    pros: ["Creates process evidence and identifies avoidable delay."],
    shortfalls: ["Requires timestamped quote and proposal records."],
    expectedImpact: "Requires approved internal data before quantification.",
    risks: ["Speed improvements must not weaken engineering review."],
    recommendation:
      "Validate the internal baseline before approving cycle-time targets.",
    confidence: "low",
  },
  {
    key: "cash_improvement",
    label: "Working-capital visibility case",
    description:
      "Build an evidence-based view of receivables, inventory, payables, and open order backlog before setting cash targets.",
    currentBaseline: "Requires internal AR, inventory, AP, and backlog exports.",
    target: "Validated working-capital baseline and prioritised improvement actions.",
    options: [
      "Review AR ageing and overdue collections.",
      "Segment inventory by movement and project linkage.",
      "Connect open orders, billing milestones, and supplier commitments.",
    ],
    pros: ["Improves cash visibility.", "Supports a controlled operating cadence."],
    shortfalls: ["No reliable public working-capital baseline."],
    expectedImpact: "Requires approved internal data before quantification.",
    risks: ["Premature targets may distort customer or supplier decisions."],
    recommendation:
      "Start with read-only AR, AP, inventory, and backlog exports.",
    confidence: "low",
  },
  {
    key: "headcount_minus_15",
    label: "Productivity evidence case without assumed workforce action",
    description:
      "Explore productivity gains through automation, proposal velocity, workflow clarity, and better commercial focus, not workforce reduction.",
    currentBaseline: "Requires confirmed headcount and internally validated revenue.",
    target: "Validated productivity baseline without an assumed workforce action.",
    options: [
      "Automate repetitive reporting and proposal administration.",
      "Reduce proposal rework and approval delays.",
      "Improve product, customer, and channel focus.",
    ],
    pros: ["Supports respectful operating review."],
    shortfalls: ["Public headcount signals are not a reliable baseline."],
    expectedImpact: "Requires approved internal data before quantification.",
    risks: ["Using unverified public headcount as a performance judgment."],
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
    "Run a 48-hour internal diagnostic using read-only exports",
    "Use approved read-only financial, commercial, working-capital, proposal, standards, supplier, and governance evidence to replace public assumptions with internal validation.",
    "Accelerates a higher-confidence diagnostic without system integration.",
    "Assessment sponsor",
    2,
  ],
  [
    "Create ISO and customer standards readiness evidence register",
    "Map applicable ISO and customer-specific technical standards to evidence status, ownership, gaps, and review dates.",
    "Improves documentation readiness and proposal evidence visibility.",
    "Engineering and quality leadership",
    45,
  ],
  [
    "Build supplier qualification and vendor registration tracker",
    "Track supplier qualification, onboarding documentation, exceptions, and review dates alongside partner ecosystem signals.",
    "Improves vendor readiness and ecosystem visibility.",
    "Procurement and quality leadership",
    45,
  ],
  [
    "Introduce AI output validation and human approval workflow",
    "Require source traceability, prompt/output review, approval history, and no autonomous irreversible action.",
    "Strengthens AI governance and trusted-agent readiness.",
    "Technology and risk leadership",
    30,
  ],
  [
    "Create statutory document and audit evidence dashboard",
    "Index statutory documents and audit evidence with owner, validity, evidence status, gap, and next review date.",
    "Improves documentation readiness without implying formal approval.",
    "Company secretary and compliance leadership",
    45,
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
