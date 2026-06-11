import type { AIContext } from "@/lib/ai";
import { factsPromptJson } from "./context";
import { strictJsonContract } from "./json-contract";

export function generateCockpitPrompt(ctx: AIContext): string {
  return `Build an executive cockpit for ${ctx.companyName}.

Assessment:
- Industry: ${ctx.industry}
- Objective: ${ctx.objective}

Facts:
${factsPromptJson(ctx)}

Do not invent metric values or targets. Omit a metric when reliable numeric
evidence is unavailable. Mark public-domain inferences as assumptions in notes
or descriptions. Where evidence supports it, include safe readiness metrics for
standards gaps, audit evidence completeness, vendor qualification gaps,
customer prequalification readiness, AI output validation, source traceability,
or approval workflow coverage. Never claim certification or approval.

${strictJsonContract(
  '{"metrics":[{"key":"string","label":"string","value":123,"target":123,"unit":"₹|%|₹/employee|count","status":"on_track|at_risk|off_track","note":"string"}],"topRisks":[{"title":"string","description":"string","likelihood":"high|medium|low","impact":"high|medium|low"}],"topOpportunities":[{"title":"string","description":"string","impactInr":123,"timeframeDays":90}]}',
)}`;
}

export function generateSingleCockpitMetricPrompt(
  ctx: AIContext,
  key: "revenue" | "margin" | "cash" | "productivity",
): string {
  return `Build the PulseIQ "${key}" cockpit metric for ${ctx.companyName}.

Assessment objective: ${ctx.objective}
Facts:
${factsPromptJson(ctx, 60)}

Rules:
- Return one metric only.
- Use numeric values only when supported by extracted evidence.
- If evidence is incomplete, use 0 and explain the gap in note.
- Mark public-domain assumptions explicitly in the note.

${strictJsonContract(
  `{"metric":{"key":"${key}","label":"string","value":123,"target":123,"unit":"₹|%|₹/employee|count","status":"on_track|at_risk|off_track","note":"string"}}`,
)}`;
}
