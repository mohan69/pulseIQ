import type { Source } from "@/lib/assessment/types";

export function classifySourcePrompt(input: {
  companyName: string;
  source: Source;
  extractedText: string;
}): string {
  return `Classify this PulseIQ assessment source.

Company: ${input.companyName}
Source name: ${input.source.name}
Current source type: ${input.source.type}
Notes: ${input.source.notes || "None"}
Extracted text:
${input.extractedText.slice(0, 6000)}

Return strict JSON only:
{"sourceType":"financial_filing|strategy_deck|sop|excel_tracker|erp_export|crm_export|hrms_export|operations_report|proposal_report|email_summary|meeting_summary","confidence":"high|medium|low","reason":"short reason"}`;
}
