import { PDFParse } from "pdf-parse";
import { capExtractedText } from "./limits";

const SCANNED_PDF_MESSAGE =
  "PDF appears to be scanned or image-based. OCR is not enabled yet.";

type PdfTextResult = {
  text: string;
  total?: number;
};

type PdfParser = {
  getText(): Promise<PdfTextResult>;
  destroy?(): Promise<void> | void;
};

export type PdfExtractionResult = {
  text?: string;
  pageCount?: number;
  truncated?: boolean;
  error?: string;
};

function defaultPdfParser(buffer: Buffer): PdfParser {
  return new PDFParse({ data: new Uint8Array(buffer) });
}

export async function extractPdf(
  buffer: Buffer,
  createParser: (buffer: Buffer) => PdfParser = defaultPdfParser,
): Promise<PdfExtractionResult> {
  const parser = createParser(buffer);
  try {
    const result = await parser.getText();
    const capped = capExtractedText(result.text ?? "");
    if (!capped.text || capped.text.length < 20) {
      return {
        pageCount: result.total,
        error: SCANNED_PDF_MESSAGE,
      };
    }
    return {
      text: capped.text,
      pageCount: result.total,
      truncated: capped.truncated,
      error: capped.note,
    };
  } finally {
    await parser.destroy?.();
  }
}

export { SCANNED_PDF_MESSAGE };
