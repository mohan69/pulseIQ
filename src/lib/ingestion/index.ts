// PulseIQ Workbench — ingestion pipeline
// MVP: deterministic stub. Real text extraction (pdf-parse, mammoth, etc.) and
// a file-upload path slot in here without UI changes.

import type { Source, SourceType } from "@/lib/assessment/types";

export type IngestResult = {
  sourceId: string;
  status: "parsed" | "failed";
  pageCount?: number;
  text?: string;
  error?: string;
};

const PAGE_HINTS: Record<SourceType, number> = {
  financial_filing: 40,
  strategy_deck: 28,
  sop: 6,
  excel_tracker: 2,
  erp_export: 16,
  crm_export: 6,
  hrms_export: 4,
  operations_report: 8,
  proposal_report: 3,
  compliance_register: 6,
  standards_mapping: 8,
  vendor_qualification: 6,
  statutory_document: 12,
  ai_governance: 6,
  email_summary: 1,
  meeting_summary: 1,
};

export async function ingestSource(source: Source): Promise<IngestResult> {
  // Deterministic stub: no real I/O. Returns a stable page count so the UI can
  // show something meaningful.
  await new Promise((r) => setTimeout(r, 5));
  if (source.status === "failed") {
    return { sourceId: source.id, status: "failed", error: "Source marked as failed." };
  }
  const pageCount = source.pageCount ?? PAGE_HINTS[source.type] ?? 1;
  return {
    sourceId: source.id,
    status: "parsed",
    pageCount,
    text: undefined,
  };
}

export function expectedPageCount(type: SourceType): number {
  return PAGE_HINTS[type];
}
