import type { AIContext } from "@/lib/ai";
import { factsPromptJson } from "./context";
import { strictJsonContract } from "./json-contract";

export function generatePlanPrompt(ctx: AIContext): string {
  return `Build a four-phase 90-day implementation plan for ${ctx.companyName}.

Objective: ${ctx.objective}
Facts:
${factsPromptJson(ctx)}

Rules:
- Use exactly four phases.
- Keep deliverables evidence-led and executable.
- Do not invent financial values.
- Mark public-domain inferences as assumptions.

${strictJsonContract(
  '{"phases":[{"phase":"01","windowLabel":"Weeks 1-2","title":"string","description":"string","deliverables":["string"]}]}',
)}`;
}

export function generateSinglePlanPhasePrompt(
  ctx: AIContext,
  phase: number,
): string {
  return `Build PulseIQ implementation plan phase ${phase} of 4 for ${ctx.companyName}.

Objective: ${ctx.objective}
Facts:
${factsPromptJson(ctx, 60)}

Rules:
- Return one phase only.
- Keep deliverables evidence-led and executable.
- Do not invent financial values.
- Mark public-domain assumptions explicitly.

${strictJsonContract(
  `{"phase":{"phase":"0${phase}","windowLabel":"string","title":"string","description":"string","deliverables":["string"]}}`,
)}`;
}
