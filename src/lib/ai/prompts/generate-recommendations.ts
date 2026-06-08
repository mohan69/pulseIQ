import type { AIContext } from "@/lib/ai";

export function generateRecommendationsPrompt(ctx: AIContext): string {
  return `Generate the top PulseIQ recommendations for ${ctx.companyName}.

Objective: ${ctx.objective}
Facts:
${JSON.stringify(ctx.facts).slice(0, 18000)}

Rules:
- Return up to 10 ranked recommendations.
- Each recommendation must cite evidence from the facts.
- Prioritize actions that move revenue, margin, cash, productivity, governance, or risk.

Return strict JSON only:
{"recommendations":[{"rank":1,"title":"string","description":"string","priority":"P0|P1|P2|P3","businessImpact":"string","effort":"low|medium|high","timeframeDays":90,"ownerRole":"string","evidence":"string","confidence":"high|medium|low"}]}`;
}
