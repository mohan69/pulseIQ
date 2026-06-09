import { capExtractedText } from "./limits";

const SCANNED_PDF_MESSAGE =
  "PDF appears to be scanned or image-based. OCR is not enabled yet.";

const PDF_UNAVAILABLE_MESSAGE =
  "PDF extraction is unavailable in this runtime. Upload DOCX/XLSX/CSV or use a searchable PDF extraction worker.";

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

async function defaultPdfParser(buffer: Buffer): Promise<PdfParser> {
  let pdfParseModule: { PDFParse: new (opts: { data: Uint8Array }) => PdfParser };
  try {
    pdfParseModule = await import("pdf-parse");
  } catch {
    throw new Error(PDF_UNAVAILABLE_MESSAGE);
  }
  const PDFParse = pdfParseModule.PDFParse;
  if (!PDFParse) {
    throw new Error(PDF_UNAVAILABLE_MESSAGE);
  }
  return new PDFParse({ data: new Uint8Array(buffer) });
}

export async function extractPdf(
  buffer: Buffer,
  createParser?: (buffer: Buffer) => PdfParser | Promise<PdfParser>,
): Promise<PdfExtractionResult> {
  try {
    const parser = await Promise.resolve((createParser ?? defaultPdfParser)(buffer));
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message.includes("DOMMatrix") ? PDF_UNAVAILABLE_MESSAGE : message };
  }
}

export { SCANNED_PDF_MESSAGE, PDF_UNAVAILABLE_MESSAGE };
