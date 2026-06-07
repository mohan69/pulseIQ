// PulseIQ Workbench — what-if scenario engine
// MVP: returns seed-style scenarios for the 5 canonical keys. The same engine
// is the slot where a future model recomputes scenarios from live facts.

import type { ExtractedFact, Scenario, ScenarioKey } from "@/lib/assessment/types";

export function buildScenarios(facts: ExtractedFact[]): Scenario[] {
  void facts;
  return SCENARIO_TEMPLATES.map((tpl) => ({ ...tpl }));
}

export const SCENARIO_TEMPLATES: Scenario[] = [
  {
    key: "revenue_plus_10",
    label: "Revenue +10%",
    description:
      "What would margin, cash, and capacity have to look like to support a 10% revenue lift?",
    currentBaseline: "FY25 actual revenue ₹120 Cr; current run-rate ₹134 Cr.",
    target: "Revenue ₹154 Cr (FY26 plan ₹150 Cr + 2.7% buffer).",
    options: [
      "Lift proposal win rate from 24% to 30%",
      "Aggressive cross-sell into top 5 customers",
      "Add one new product line with proven specs",
    ],
    pros: [
      "Operating leverage: fixed cost spread across more revenue",
      "Improves working-capital cycle if collection discipline is held",
      "Demonstrates growth to board and investors",
    ],
    shortfalls: [
      "Requires capacity headcount addition of ~40 people if not planned",
      "Adds receivable and inventory pressure if mix shifts unfavourably",
      "Cannot be delivered without a 7pp win-rate lift in the funnel",
    ],
    expectedImpact:
      "₹12 Cr revenue uplift; margin hold to 24% delivers +₹2.9 Cr gross profit.",
    risks: [
      "Cash strain if receivables and inventory scale linearly",
      "Quality slippage if capacity is rushed",
    ],
    recommendation:
      "Pursue a focused top-3 customer expansion first; defer new product line until win-rate is at 28%.",
    confidence: "medium",
  },
  {
    key: "margin_plus_10",
    label: "Margin +10%",
    description: "Where would a 5pp margin lift (21% → 26%) come from?",
    currentBaseline: "FY25 gross margin 21%.",
    target: "FY26 target gross margin 26%.",
    options: [
      "Exit 3 low-margin SKUs",
      "Re-tender top 2 escalated suppliers",
      "Reprice top 5 customer contracts (where contracts permit)",
      "Reduce rework and wastage in the plant",
    ],
    pros: [
      "5pp margin lift = ~₹6 Cr gross profit at FY25 volume",
      "Drops directly to the bottom line",
      "Improves cash by reducing inventory days",
    ],
    shortfalls: [
      "Customer pushback on repricing may cost volume",
      "Suppliers may not move on price in a tight cycle",
      "Exit of SKUs may impact fill-rate on multi-SKU orders",
    ],
    expectedImpact:
      "₹6 Cr gross profit uplift; blended at 75% retention = ₹4.5 Cr net.",
    risks: [
      "Volume loss on repriced customers",
      "Top-customer churn if exit sequence is mis-managed",
    ],
    recommendation:
      "Sequence: exit low-margin SKUs first, then re-tender suppliers, then reprice — over 6 months.",
    confidence: "high",
  },
  {
    key: "cost_minus_10",
    label: "Cost –10%",
    description:
      "Which cost lines can defensibly be cut, and at what operational risk?",
    currentBaseline: "FY25 operating cost base ~₹95 Cr.",
    target: "₹9.5 Cr run-rate cost takeout without breaking operations.",
    options: [
      "Consolidate 3 logistics vendors",
      "Renegotiate rent at the 2 oldest sites",
      "Move ERP hosting to managed cloud (capex → opex)",
      "Tighten travel and discretionary spend",
    ],
    pros: [
      "Direct hit to bottom line",
      "Improves cash position quickly",
      "Some items (rent, logistics) are one-time negotiations",
    ],
    shortfalls: [
      "10% across-the-board is unrealistic without headcount",
      "Renegotiation cycles are 90+ days",
      "May damage supplier and landlord relationships if mishandled",
    ],
    expectedImpact:
      "₹3.5–4.5 Cr achievable in 6 months; remainder needs 9–12 months.",
    risks: [
      "Quality or delivery slippage if cuts go too deep",
      "Vendor churn if renegotiation is heavy-handed",
    ],
    recommendation:
      "Target 5% in 6 months with the logistics + rent + cloud moves; re-evaluate before deeper cuts.",
    confidence: "medium",
  },
  {
    key: "headcount_minus_15",
    label: "Headcount –15%",
    description: "What productivity uplift is required, and where would it come from?",
    currentBaseline: "Headcount 420; revenue per employee ₹28.6L.",
    target: "Headcount 357 (-63) while keeping revenue ≥ ₹120 Cr.",
    options: [
      "Automate manual reporting across 4 functions",
      "Consolidate shifts in the plant",
      "Outsource non-core functions (security, housekeeping, IT helpdesk)",
    ],
    pros: [
      "₹4–5 Cr annualised payroll saving",
      "Raises revenue per employee toward ₹33.6L target",
    ],
    shortfalls: [
      "Risk of execution slowdown in the plant during transition",
      "Severance and rehire cost in the short term",
      "Loss of institutional knowledge in non-core functions",
    ],
    expectedImpact:
      "₹4.5 Cr payroll saving offset by ₹1.2 Cr severance = ₹3.3 Cr net in Year 1.",
    risks: [
      "Plant downtime during transition",
      "Customer-facing impact if outsourced vendors underperform",
    ],
    recommendation:
      "Defer to a 12-month plan after the win-rate and margin work is underway; do not combine with cost cut.",
    confidence: "low",
  },
  {
    key: "cash_improvement",
    label: "Cash improvement",
    description:
      "Impact of stretching payables, tightening receivables, or releasing inventory.",
    currentBaseline:
      "Receivables ₹18 Cr; inventory ₹22 Cr; payables stretched 45 days.",
    target: "Release ₹6–8 Cr working capital over 6 months.",
    options: [
      "AR collection drive with early-payment discount (1% for <30 days)",
      "Inventory rationalisation on slow-moving SKUs",
      "Stretch payables to 60 days with top 5 suppliers",
      "Convert 2 largest customer contracts to milestone billing",
    ],
    pros: [
      "Direct cash release without P&L impact",
      "Improves DSCR and headroom for capex",
      "Reduces interest cost if working-capital line is in use",
    ],
    shortfalls: [
      "Early-payment discounts hit margin",
      "Supplier relationship risk on payables stretch",
      "Inventory write-downs possible on slow movers",
    ],
    expectedImpact:
      "₹6–8 Cr cash release; ~₹0.3 Cr margin cost on early-payment discount.",
    risks: [
      "Customer churn if collections are too aggressive",
      "Supplier delivery risk if payables are stretched too far",
    ],
    recommendation:
      "Start with AR collection drive and inventory rationalisation; defer payables stretch to month 3.",
    confidence: "high",
  },
];

export const SCENARIO_KEYS: ScenarioKey[] = [
  "revenue_plus_10",
  "margin_plus_10",
  "cost_minus_10",
  "headcount_minus_15",
  "cash_improvement",
];
