import type { AIContext } from "@/lib/ai";
import { factsPromptJson } from "./context";
import { strictJsonContract } from "./json-contract";

export function generateReportPrompt(ctx: AIContext): string {
  return `Generate a PulseIQ report snapshot for ${ctx.companyName}.

Industry: ${ctx.industry}
Objective: ${ctx.objective}
Facts:
${factsPromptJson(ctx, 50)}

Return a cautious executive summary and data gaps. Do not invent unavailable
evidence. State when the assessment uses public-domain sources and distinguish
verified findings from assumptions.

${strictJsonContract(
  '{"executiveSummary":"string","dataGaps":["string"],"confidence":"high|medium|low"}',
)}`;
}
