import type { AIContext } from "@/lib/ai";
import type { ScenarioKey } from "@/lib/assessment/types";
import { factsPromptJson } from "./context";
import { strictJsonContract } from "./json-contract";

export function generateWhatIfPrompt(ctx: AIContext): string {
  return `Build the five standard PulseIQ what-if scenarios for ${ctx.companyName}.

Required keys:
- revenue_plus_10
- margin_plus_10
- cost_minus_10
- headcount_minus_15
- cash_improvement

Facts:
${factsPromptJson(ctx)}

Return exactly five scenarios, one for each required key. Do not invent
financial baselines; use cautious text and mark assumptions explicitly.

${strictJsonContract(
  '{"scenarios":[{"key":"revenue_plus_10|margin_plus_10|cost_minus_10|headcount_minus_15|cash_improvement","label":"string","description":"string","currentBaseline":"string","target":"string","options":["string"],"pros":["string"],"shortfalls":["string"],"expectedImpact":"string","risks":["string"],"recommendation":"string","confidence":"high|medium|low"}]}',
)}`;
}

export function generateSingleWhatIfPrompt(
  ctx: AIContext,
  key: ScenarioKey,
): string {
  return `Build the PulseIQ what-if scenario "${key}" for ${ctx.companyName}.

Facts:
${factsPromptJson(ctx, 50)}

Rules:
- Return only the requested scenario key.
- Do not invent financial baselines.
- Use cautious text when evidence is incomplete.
- Mark public-domain assumptions explicitly and use low confidence.

${strictJsonContract(
  `{"scenario":{"key":"${key}","label":"string","description":"string","currentBaseline":"string","target":"string","options":["string"],"pros":["string"],"shortfalls":["string"],"expectedImpact":"string","risks":["string"],"recommendation":"string","confidence":"high|medium|low"}}`,
)}`;
}
