import type { AIContext } from "@/lib/ai";
import { factsPromptJson } from "./context";
import { strictJsonContract } from "./json-contract";

export function generateRecommendationsPrompt(ctx: AIContext): string {
  return `Generate the top PulseIQ recommendations for ${ctx.companyName}.

Objective: ${ctx.objective}
Facts:
${factsPromptJson(ctx)}

Rules:
- Return up to 10 ranked recommendations.
- Each recommendation must cite evidence from the facts.
- Prioritize actions that move revenue, margin, cash, productivity, governance, or risk.
- Include evidence-backed actions for compliance/ISO/technical standards mapping,
  statutory documentation, supplier qualification, customer prequalification,
  source traceability, and human-approved AI output validation where gaps exist.
- Use readiness and gap-review language. Never claim certification or approval.
- Every recommendation requires priority, business impact, owner role,
  timeframe, confidence, and evidence/source reference.
- Prefix public-domain inferences with "Assumption:" and keep confidence low.

${strictJsonContract(
  '{"recommendations":[{"rank":1,"title":"string","description":"string","priority":"P0|P1|P2|P3","businessImpact":"string","effort":"low|medium|high","timeframeDays":90,"ownerRole":"string","evidence":"source reference or Assumption: ...","confidence":"high|medium|low"}]}',
)}`;
}

export function generateSingleRecommendationPrompt(
  ctx: AIContext,
  rank: number,
): string {
  return `Generate PulseIQ recommendation rank ${rank} for ${ctx.companyName}.

Objective: ${ctx.objective}
Facts:
${factsPromptJson(ctx, 60)}

Rules:
- Return one recommendation only.
- Cite a source-backed fact or clearly label an assumption.
- Include priority, business impact, owner, timeframe, confidence, and evidence.
- Do not invent financial impact.

${strictJsonContract(
  `{"recommendation":{"rank":${rank},"title":"string","description":"string","priority":"P0|P1|P2|P3","businessImpact":"string","effort":"low|medium|high","timeframeDays":90,"ownerRole":"string","evidence":"source reference or Assumption: ...","confidence":"high|medium|low"}}`,
)}`;
}
