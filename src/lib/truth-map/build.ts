// PulseIQ Workbench — Truth Map builder
// Groups extracted facts into the 5 canonical truth layers and derives
// findings, gaps, and contradictions deterministically for the MVP.

import type {
  ExtractedFact,
  Source,
  TruthFinding,
  TruthLayer,
  TruthLayerKey,
} from "@/lib/assessment/types";

const LAYER_DEFS: Record<
  TruthLayerKey,
  { title: string; description: string; factKinds: ReadonlyArray<string> }
> = {
  financial: {
    title: "Financial Truth",
    description:
      "P&L, balance sheet, working capital, and unit economics reconciled across entities, plants, and SKUs.",
    factKinds: ["revenue", "cost", "margin", "cash", "receivables", "payables"],
  },
  strategic: {
    title: "Proposal and Revenue Truth",
    description:
      "Revenue ambition, pipeline, proposals, customer prequalification, and commercial commitments reconciled to supporting evidence.",
    factKinds: [
      "target",
      "commitment",
      "action_item",
      "opportunity",
      "pipeline",
      "orders",
      "customer",
    ],
  },
  operational: {
    title: "Operational, Vendor, and Capacity Truth",
    description:
      "Production, quality, logistics, supplier qualification, subcontractor governance, talent, capacity, downtime, and OEE.",
    factKinds: [
      "headcount",
      "orders",
      "backlog",
      "pipeline",
      "product",
      "supplier",
      "customer",
    ],
  },
  process: {
    title: "Compliance and Standards Truth",
    description:
      "ISO and technical standards mapping, statutory documents, audit evidence, SOP controls, and documentation readiness.",
    factKinds: ["sop_rule", "risk"],
  },
  collaboration: {
    title: "AI Governance and Accountability Truth",
    description:
      "Human validation, source traceability, prompt and output review, approvals, policy controls, access, and audit trails.",
    factKinds: [],
  },
};

export function buildTruthLayers(
  facts: ExtractedFact[],
  sources: Source[],
): TruthLayer[] {
  const byKind = new Map<string, ExtractedFact[]>();
  for (const f of facts) {
    const list = byKind.get(f.kind) ?? [];
    list.push(f);
    byKind.set(f.kind, list);
  }

  return (Object.keys(LAYER_DEFS) as TruthLayerKey[]).map((key) => {
    const def = LAYER_DEFS[key];
    const layerFacts = def.factKinds.flatMap((k) => byKind.get(k) ?? []);
    const findings = layerFactsToFindings(key, layerFacts);
    const evidence = layerFacts.slice(0, 5).map((f) => {
      const src = sources.find((s) => s.id === f.sourceId);
      return {
        sourceId: f.sourceId,
        factId: f.id,
        excerpt: f.evidence || src?.notes || f.value,
      };
    });
    return {
      key,
      title: def.title,
      description: def.description,
      findings,
      evidence,
      confidence: deriveConfidence(layerFacts),
      gaps: layerFacts.length === 0 ? defaultGaps(key) : [],
      contradictions: [],
    };
  });
}

function layerFactsToFindings(
  key: TruthLayerKey,
  facts: ExtractedFact[],
): TruthFinding[] {
  if (facts.length === 0) return [];
  // For MVP, render up to 4 findings per layer from fact labels + values.
  return facts.slice(0, 4).map((f, i) => ({
    id: `fnd-${key}-${i + 1}`,
    text: `${f.label} — ${f.value}`,
    impact: f.confidence === "high" ? "high" : f.confidence === "medium" ? "medium" : "low",
    factIds: [f.id],
  }));
}

function deriveConfidence(
  facts: ExtractedFact[],
): "high" | "medium" | "low" {
  if (facts.length === 0) return "low";
  const highs = facts.filter((f) => f.confidence === "high").length;
  if (highs >= Math.max(2, facts.length / 2)) return "high";
  if (highs >= 1) return "medium";
  return "low";
}

function defaultGaps(key: TruthLayerKey): string[] {
  switch (key) {
    case "financial":
      return ["No financial source registered yet."];
    case "strategic":
      return [
        "No proposal register, customer prequalification pack, or revenue plan registered yet.",
      ];
    case "operational":
      return [
        "No operations, supplier qualification, subcontractor, or capacity evidence registered yet.",
      ];
    case "process":
      return [
        "No ISO readiness register, statutory document index, standards mapping, or audit evidence register provided yet.",
      ];
    case "collaboration":
      return [
        "No AI validation policy, approval workflow, source traceability control, or audit trail evidence provided yet.",
      ];
  }
}
