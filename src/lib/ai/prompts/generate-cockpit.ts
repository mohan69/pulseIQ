import type { AIContext } from "@/lib/ai";

export function generateCockpitPrompt(ctx: AIContext): string {
  return `Build an executive cockpit for ${ctx.companyName}.

Assessment:
- Industry: ${ctx.industry}
- Objective: ${ctx.objective}

Facts:
${JSON.stringify(ctx.facts).slice(0, 18000)}

Return strict JSON only:
{"metrics":[{"key":"string","label":"string","value":123,"target":123,"unit":"₹|%|₹/employee|count","status":"on_track|at_risk|off_track","note":"string"}],"topRisks":[{"title":"string","description":"string","likelihood":"high|medium|low","impact":"high|medium|low"}],"topOpportunities":[{"title":"string","description":"string","impactInr":123,"timeframeDays":90}]}`;
}
