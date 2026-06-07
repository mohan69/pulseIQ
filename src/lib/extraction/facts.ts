// PulseIQ Workbench — fact extraction
// MVP: structured builder that takes a source + (optional) text and returns
// ExtractedFact rows. The schema below is what an LLM provider would parse
// its output against when wired up.

import { z } from "zod";
import type { ExtractedFact, FactKind, Source } from "@/lib/assessment/types";
import { ExtractionResultSchema } from "@/lib/ai";
import { generateId } from "@/lib/utils";

export const FactKindSchema = z.enum([
  "revenue",
  "cost",
  "margin",
  "cash",
  "receivables",
  "payables",
  "pipeline",
  "orders",
  "backlog",
  "headcount",
  "customer",
  "product",
  "supplier",
  "risk",
  "opportunity",
  "action_item",
  "commitment",
  "target",
  "sop_rule",
]);
export type FactKindZ = z.infer<typeof FactKindSchema>;

export function extractFactsFromSource(
  source: Source,
  text?: string,
): ExtractedFact[] {
  // Deterministic MVP: we don't synthesise facts from arbitrary text in the
  // workbench yet. The seed and any future real extractor will provide them.
  void text;
  void source;
  return [];
}

export function buildFacts(
  source: Source,
  drafts: z.infer<typeof ExtractionResultSchema>["facts"],
): Omit<ExtractedFact, "id" | "assessmentId" | "sourceId" | "capturedAt">[] {
  return drafts.map((d) => ({
    kind: d.kind as FactKind,
    label: d.label,
    value: d.value,
    numericValue: d.numericValue,
    unit: d.unit,
    evidence: d.evidence,
    confidence: d.confidence,
  }));
}

export function withIds(
  source: Source,
  assessmentId: string,
  drafts: Omit<ExtractedFact, "id" | "assessmentId" | "sourceId" | "capturedAt">[],
): ExtractedFact[] {
  const now = new Date().toISOString();
  return drafts.map((d) => ({
    id: `fact-${generateId()}`,
    assessmentId,
    sourceId: source.id,
    capturedAt: now,
    ...d,
  }));
}
