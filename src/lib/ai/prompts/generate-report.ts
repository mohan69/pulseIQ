import type { AIContext } from "@/lib/ai";

export function generateReportPrompt(ctx: AIContext): string {
  return `Generate a PulseIQ report snapshot for ${ctx.companyName}.

Industry: ${ctx.industry}
Objective: ${ctx.objective}
Facts:
${JSON.stringify(ctx.facts).slice(0, 12000)}

Return a cautious executive summary and data gaps. Do not invent unavailable evidence.

Return strict JSON only:
{"executiveSummary":"string","dataGaps":["string"],"confidence":"high|medium|low"}`;
}
