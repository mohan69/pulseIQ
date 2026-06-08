import type { ExtractionStatus } from "@/lib/assessment/types";
import type { SupportedUploadExtension } from "@/lib/storage";
import { extractCsv } from "./csv";
import { extractDocx } from "./docx";
import { capExtractedText } from "./limits";
import { extractPdf } from "./pdf";
import { extractTxt } from "./txt";
import { extractXlsx } from "./xlsx";

export type FileExtractionResult = {
  status: ExtractionStatus;
  text?: string;
  error?: string;
  pageCount?: number;
  truncated?: boolean;
};

export async function extractUploadedFile(
  extension: SupportedUploadExtension,
  buffer: Buffer,
): Promise<FileExtractionResult> {
  if (extension === ".txt") {
    const capped = capExtractedText(extractTxt(buffer));
    return {
      status: "extracted",
      text: capped.text,
      error: capped.note,
      truncated: capped.truncated,
    };
  }
  if (extension === ".csv") {
    const capped = capExtractedText(extractCsv(buffer));
    return {
      status: "extracted",
      text: capped.text,
      error: capped.note,
      truncated: capped.truncated,
    };
  }
  if (extension === ".pdf") {
    const result = await extractPdf(buffer);
    if (!result.text) {
      return {
        status: "failed",
        error: result.error,
        pageCount: result.pageCount,
      };
    }
    return {
      status: "extracted",
      text: result.text,
      error: result.error,
      pageCount: result.pageCount,
      truncated: result.truncated,
    };
  }
  if (extension === ".docx") {
    const result = await extractDocx(buffer);
    return {
      status: "extracted",
      text: result.text,
      error: result.warning,
      truncated: result.truncated,
    };
  }
  if (extension === ".xlsx") {
    const result = await extractXlsx(buffer);
    return {
      status: "extracted",
      text: result.text,
      error: result.warning,
      truncated: result.truncated,
    };
  }
  return {
    status: "extraction_pending",
    error: "PPTX extraction is not enabled yet.",
  };
}

export function previewText(text: string, maxLength = 500): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1)}…`;
}
