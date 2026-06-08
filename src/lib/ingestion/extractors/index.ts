import type { ExtractionStatus } from "@/lib/assessment/types";
import type { SupportedUploadExtension } from "@/lib/storage";
import { extractCsv } from "./csv";
import { extractTxt } from "./txt";

export type FileExtractionResult = {
  status: ExtractionStatus;
  text?: string;
  error?: string;
};

export function extractUploadedFile(
  extension: SupportedUploadExtension,
  buffer: Buffer,
): FileExtractionResult {
  if (extension === ".txt") {
    return { status: "extracted", text: extractTxt(buffer) };
  }
  if (extension === ".csv") {
    return { status: "extracted", text: extractCsv(buffer) };
  }
  return {
    status: "extraction_pending",
    error:
      "Extraction for PDF, DOCX, PPTX, and XLSX will be added in a later stage.",
  };
}

export function previewText(text: string, maxLength = 500): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1)}…`;
}
