import type { AIContext } from "@/lib/ai";

export function generateWhatIfPrompt(ctx: AIContext): string {
  return `Build the five standard PulseIQ what-if scenarios for ${ctx.companyName}.

Required keys:
- revenue_plus_10
- margin_plus_10
- cost_minus_10
- headcount_minus_15
- cash_improvement

Facts:
${JSON.stringify(ctx.facts).slice(0, 18000)}

Return strict JSON only:
{"scenarios":[{"key":"revenue_plus_10|margin_plus_10|cost_minus_10|headcount_minus_15|cash_improvement","label":"string","description":"string","currentBaseline":"string","target":"string","options":["string"],"pros":["string"],"shortfalls":["string"],"expectedImpact":"string","risks":["string"],"recommendation":"string","confidence":"high|medium|low"}]}`;
}
