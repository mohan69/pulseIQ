import type { AIContext } from "@/lib/ai";

export function factsPromptJson(
  ctx: AIContext,
  maxFacts = 80,
): string {
  const seen = new Set<string>();
  const facts = [];
  for (const fact of ctx.facts) {
    const key = [fact.kind, fact.label, fact.value, fact.sourceId].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    facts.push({
      id: fact.id,
      sourceId: fact.sourceId,
      kind: fact.kind,
      label: fact.label,
      value: fact.value,
      numericValue: fact.numericValue,
      unit: fact.unit,
      evidence: fact.evidence.slice(0, 320),
      confidence: fact.confidence,
    });
    if (facts.length >= maxFacts) break;
  }
  return JSON.stringify(facts);
}

export function sourcesPromptJson(ctx: AIContext): string {
  return JSON.stringify(
    ctx.sources.map((source) => ({
      id: source.id,
      name: source.name,
      type: source.type,
      notes: source.notes.slice(0, 500),
    })),
  );
}
