// PulseIQ Workbench — recommendations builder
// MVP: returns the canonical 10 recommendations for the demo case. The slot
// is the same engine that an LLM-driven recommender will write to.

import type { Cockpit, ExtractedFact, Recommendation } from "@/lib/assessment/types";

export function buildRecommendations(
  facts: ExtractedFact[],
  cockpit: Cockpit,
): Recommendation[] {
  void facts;
  void cockpit;
  return SEED_RECOMMENDATIONS.map((r, i) => ({ ...r, id: `rec-${i + 1}`, rank: i + 1 }));
}

const SEED_RECOMMENDATIONS: Omit<Recommendation, "id" | "rank">[] = [
  {
    title: "Lift proposal win rate from 24% to 30%",
    description:
      "Tighten go/no-go discipline, build pre-bid technical engagement, and reprice the bottom 20% of deals. Target: 7 of next 25 proposals won.",
    priority: "P0",
    businessImpact: "₹14 – ₹18 Cr incremental revenue in FY26",
    effort: "medium",
    timeframeDays: 90,
    ownerRole: "CRO + Head of Proposals",
    evidence: "Q3 proposal log shows 24% win rate; board mandate is 31% (board deck p.9).",
    confidence: "high",
  },
  {
    title: "Exit the 3 lowest-margin SKUs",
    description:
      "Formally exit 3 SKUs under 12% GM. Communicate to affected customers with 60-day notice and a fill-rate plan.",
    priority: "P0",
    businessImpact: "₹1.2 – ₹1.8 Cr margin uplift in FY26",
    effort: "low",
    timeframeDays: 60,
    ownerRole: "COO + Sales leadership",
    evidence: "Pipeline tracker margin column flags 3 SKUs (BHF-VLV-110, BHF-VLV-114, BHF-PMP-207).",
    confidence: "high",
  },
  {
    title: "AR collection drive + early-payment discount",
    description:
      "Run a 60-day collection sprint with sales ops; offer 1% early-payment discount to settle open invoices inside 30 days.",
    priority: "P0",
    businessImpact: "₹6 – ₹8 Cr working capital release",
    effort: "low",
    timeframeDays: 60,
    ownerRole: "CFO + AR Lead",
    evidence: "AR aging 31-Dec-2025 = ₹18 Cr; DSO at 55 days vs 35-day target.",
    confidence: "high",
  },
  {
    title: "Re-tender the 2 escalated suppliers",
    description:
      "Run a competitive tender for the 2 suppliers flagged with >8% QoQ cost increase; include 1 alternate per category.",
    priority: "P1",
    businessImpact: "₹0.6 – ₹1.0 Cr margin protection in FY26",
    effort: "medium",
    timeframeDays: 120,
    ownerRole: "Head of Procurement",
    evidence: "AP variance report Q3: 2 suppliers flagged (BHF-SUP-014, BHF-SUP-021).",
    confidence: "medium",
  },
  {
    title: "Enforce quote approval SOP for >₹50L deals",
    description:
      "Block ERP from releasing quotes >₹50L without the approval matrix sign-off. Audit monthly.",
    priority: "P1",
    businessImpact: "Margin protection on high-value deals; governance control.",
    effort: "low",
    timeframeDays: 30,
    ownerRole: "CIO + CFO",
    evidence: "SOP §3.2 + ERP audit log: 7 quotes >₹50L without sign-off in Q3.",
    confidence: "high",
  },
  {
    title: "Move 4 delayed proposals to a fast-track review",
    description:
      "₹6.2 Cr of proposals are >30 days past expected close. Assign a deal owner and 14-day close plan to each.",
    priority: "P1",
    businessImpact: "₹4 – ₹6 Cr revenue recovery in Q4",
    effort: "low",
    timeframeDays: 14,
    ownerRole: "CRO",
    evidence: "Q3 proposal log: 4 proposals >30 days past expected close.",
    confidence: "medium",
  },
  {
    title: "Inventory rationalisation on slow movers",
    description:
      "Identify the top 20 slow-moving SKUs and run a sell-through plan over 90 days; write off the bottom 5.",
    priority: "P2",
    businessImpact: "₹3 – ₹4 Cr working capital release",
    effort: "medium",
    timeframeDays: 90,
    ownerRole: "COO + Plant Head",
    evidence: "Inventory GL 31-Dec-2025 = ₹22 Cr; ageing not in current source set — to be confirmed.",
    confidence: "low",
  },
  {
    title: "Reprice top 5 customer contracts where contracts permit",
    description:
      "Open a structured repricing conversation with the top 5 customers, anchored to value delivered, not just price.",
    priority: "P2",
    businessImpact: "₹0.8 – ₹1.2 Cr margin uplift",
    effort: "high",
    timeframeDays: 120,
    ownerRole: "CRO + KAM Lead",
    evidence: "Top 5 customers = 62% of revenue (FY25 audit schedule).",
    confidence: "medium",
  },
  {
    title: "Stand up a board action-item tracker",
    description:
      "Replace the board deck's action-item table with a live tracker, owned by the company secretary.",
    priority: "P3",
    businessImpact: "Governance and execution visibility.",
    effort: "low",
    timeframeDays: 30,
    ownerRole: "Company Secretary",
    evidence: "Board action item B-26-04 lacks a clear owner in current source set.",
    confidence: "high",
  },
  {
    title: "Bring OEE and downtime data into the next diagnostic",
    description:
      "Pull MES export for the next 48-hour sprint so plant-level operating reality is fully visible.",
    priority: "P3",
    businessImpact: "Better operating diagnostic in next cycle.",
    effort: "low",
    timeframeDays: 7,
    ownerRole: "CIO + Plant Head",
    evidence: "OEE and downtime data is missing from the current source set.",
    confidence: "high",
  },
];
