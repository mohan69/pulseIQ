export const DEFAULT_MAX_EXTRACTED_CHARS = 100_000;
export const DEFAULT_MAX_ROWS_PER_SHEET = 200;

export function getMaxExtractedChars(): number {
  const configured = Number(process.env.PULSEIQ_MAX_EXTRACTED_CHARS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_EXTRACTED_CHARS;
}

export function getMaxRowsPerSheet(): number {
  const configured = Number(process.env.PULSEIQ_XLSX_MAX_ROWS_PER_SHEET);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_ROWS_PER_SHEET;
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
}

export function capExtractedText(
  text: string,
  maxChars = getMaxExtractedChars(),
): { text: string; truncated: boolean; note?: string } {
  const normalized = normalizeWhitespace(text);
  if (normalized.length <= maxChars) {
    return { text: normalized, truncated: false };
  }
  const note = `[Extraction truncated after ${maxChars.toLocaleString("en-IN")} characters.]`;
  return {
    text: `${normalized.slice(0, Math.max(0, maxChars - note.length - 2)).trim()}\n\n${note}`,
    truncated: true,
    note,
  };
}
