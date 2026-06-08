import type { AIContext } from "@/lib/ai";

export function generateTruthMapPrompt(ctx: AIContext): string {
  return `Build the PulseIQ five-layer truth map for ${ctx.companyName}.

Layers must be: financial, strategic, operational, process, collaboration.
Facts:
${JSON.stringify(ctx.facts).slice(0, 18000)}

Sources:
${JSON.stringify(ctx.sources.map((s) => ({ id: s.id, name: s.name, type: s.type, notes: s.notes }))).slice(0, 6000)}

Return strict JSON only:
{"layers":[{"key":"financial|strategic|operational|process|collaboration","title":"string","description":"string","findings":[{"text":"finding","impact":"high|medium|low"}],"gaps":["gap"],"contradictions":["contradiction"],"confidence":"high|medium|low"}]}`;
}
