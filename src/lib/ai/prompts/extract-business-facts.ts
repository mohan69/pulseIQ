import type { Source } from "@/lib/assessment/types";

export function extractBusinessFactsPrompt(input: {
  companyName: string;
  industry: string;
  objective: string;
  source: Source;
  extractedText: string;
}): string {
  return `Extract atomic business facts for PulseIQ.

Company: ${input.companyName}
Industry: ${input.industry}
Objective: ${input.objective}
Source: ${input.source.name} (${input.source.type})
Source notes: ${input.source.notes || "None"}
Extracted text:
${input.extractedText.slice(0, 12000)}

Rules:
- Return only facts supported by the text.
- Prefer board, financial, operating, pipeline, customer, supplier, process, risk, opportunity, target, commitment, and action-item facts.
- Include numericValue when a number is clear.
- Use INR absolute rupees for currency numericValue.
- Evidence must be a short excerpt from the source.

Return strict JSON only:
{"facts":[{"kind":"revenue|cost|margin|cash|receivables|payables|pipeline|orders|backlog|headcount|customer|product|supplier|risk|opportunity|action_item|commitment|target|sop_rule","label":"short label","value":"human-readable value","numericValue":123,"unit":"₹|%|people|count|₹/employee","evidence":"source excerpt","confidence":"high|medium|low"}]}`;
}
