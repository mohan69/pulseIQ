import type { AIContext } from "@/lib/ai";
import type { TruthLayerKey } from "@/lib/assessment/types";
import { factsPromptJson, sourcesPromptJson } from "./context";
import { strictJsonContract } from "./json-contract";

export function generateTruthMapPrompt(ctx: AIContext): string {
  return `Build the PulseIQ five-layer truth map for ${ctx.companyName}.

Layers must be: financial, strategic, operational, process, collaboration.
Facts:
${factsPromptJson(ctx)}

Sources:
${sourcesPromptJson(ctx)}

Return exactly five layers, one for each required key. Mark public-domain
inferences as assumptions in finding text and use low confidence.

${strictJsonContract(
  '{"layers":[{"key":"financial|strategic|operational|process|collaboration","title":"string","description":"string","findings":[{"text":"finding or Assumption: ...","impact":"high|medium|low"}],"gaps":["gap"],"contradictions":["contradiction"],"confidence":"high|medium|low"}]}',
)}`;
}

export function generateSingleTruthLayerPrompt(
  ctx: AIContext,
  key: TruthLayerKey,
): string {
  return `Build the PulseIQ "${key}" truth layer for ${ctx.companyName}.

Facts:
${factsPromptJson(ctx, 60)}

Sources:
${sourcesPromptJson(ctx)}

Rules:
- Return only the requested truth layer key.
- Use [] for unsupported findings, gaps, or contradictions.
- Mark public-domain assumptions explicitly and use low confidence.

${strictJsonContract(
  `{"layer":{"key":"${key}","title":"string","description":"string","findings":[{"text":"finding or Assumption: ...","impact":"high|medium|low"}],"gaps":["gap"],"contradictions":["contradiction"],"confidence":"high|medium|low"}}`,
)}`;
}
