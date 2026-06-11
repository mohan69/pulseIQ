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
    title: "Create ISO and customer standards readiness evidence register",
    description:
      "Map applicable ISO and customer technical standards to owners, evidence status, gaps, and review dates.",
    priority: "P1",
    businessImpact: "Documentation readiness and audit evidence visibility.",
    effort: "medium",
    timeframeDays: 45,
    ownerRole: "Quality Head + Compliance Lead",
    evidence: "Standards applicability, evidence status, and ownership mapping require a controlled gap review.",
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
    title: "Build supplier qualification and subcontractor governance tracker",
    description:
      "Track qualification status, onboarding documents, exceptions, performance evidence, and review dates.",
    priority: "P2",
    businessImpact: "Vendor onboarding readiness and supply-chain risk visibility.",
    effort: "medium",
    timeframeDays: 90,
    ownerRole: "Procurement Head + Quality Head",
    evidence: "Supplier qualification and subcontractor governance evidence is not available in one tracker.",
    confidence: "low",
  },
  {
    title: "Introduce AI output validation and human approval workflow",
    description:
      "Require source-linked prompt/output review and approval history before action; prohibit autonomous irreversible action.",
    priority: "P2",
    businessImpact: "Trusted-agent readiness and auditable accountability.",
    effort: "high",
    timeframeDays: 120,
    ownerRole: "CIO + Risk / Compliance",
    evidence: "Human validation, source traceability, and approval evidence require a controlled workflow.",
    confidence: "medium",
  },
  {
    title: "Create statutory document and audit evidence dashboard",
    description:
      "Index required statutory documents and audit evidence with owner, validity, status, gap, and next review date.",
    priority: "P3",
    businessImpact: "Documentation readiness and management visibility.",
    effort: "low",
    timeframeDays: 30,
    ownerRole: "Company Secretary + Compliance Lead",
    evidence: "Statutory document and audit evidence ownership is not available in one controlled view.",
    confidence: "high",
  },
  {
    title: "Standardize vendor registration and customer prequalification documentation",
    description:
      "Create reusable, version-controlled packs linked to proposal and vendor onboarding workflows.",
    priority: "P3",
    businessImpact: "Faster documentation response and fewer onboarding gaps.",
    effort: "low",
    timeframeDays: 7,
    ownerRole: "Commercial Operations + Procurement",
    evidence: "Vendor registration and customer prequalification documentation requires a readiness review.",
    confidence: "high",
  },
];
