import ExcelJS from "exceljs";
import {
  capExtractedText,
  getMaxRowsPerSheet,
  normalizeWhitespace,
} from "./limits";

export type XlsxExtractionResult = {
  text: string;
  truncated: boolean;
  warning?: string;
};

export async function extractXlsx(buffer: Buffer): Promise<XlsxExtractionResult> {
  const workbook = new ExcelJS.Workbook();
  const data = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
  const loadWorkbook = workbook.xlsx.load.bind(workbook.xlsx) as (
    input: unknown,
  ) => Promise<ExcelJS.Workbook>;
  await loadWorkbook(data);
  const maxRows = getMaxRowsPerSheet();
  const sections: string[] = [];
  let rowTruncated = false;

  for (const sheet of workbook.worksheets) {
    const rows: Array<Array<ExcelJS.CellValue>> = [];
    sheet.eachRow((row) => {
      rows.push(rowToValues(row));
    });
    const limitedRows = rows.slice(0, maxRows + 1);
    if (rows.length > limitedRows.length) rowTruncated = true;

    const lines = limitedRows.map((row, index) => {
      const values = row.map(formatCell).join(" | ");
      return index === 0 ? `Headers: ${values}` : `Row ${index}: ${values}`;
    });
    const note =
      rows.length > limitedRows.length
        ? `Sheet "${sheet.name}" truncated after ${maxRows} data rows.`
        : undefined;
    sections.push(
      [`Sheet: ${sheet.name}`, ...lines, note].filter(Boolean).join("\n"),
    );
  }

  const capped = capExtractedText(sections.join("\n\n"));
  const warnings = [
    rowTruncated ? `Workbook extraction capped at ${maxRows} rows per sheet.` : undefined,
    capped.note,
  ].filter(Boolean);

  return {
    text: capped.text,
    truncated: rowTruncated || capped.truncated,
    warning: warnings.join(" ") || undefined,
  };
}

function rowToValues(row: ExcelJS.Row): Array<ExcelJS.CellValue> {
  const values: Array<ExcelJS.CellValue> = [];
  row.eachCell({ includeEmpty: true }, (cell) => {
    values.push(cell.value ?? "");
  });
  return values;
}

function formatCell(value: ExcelJS.CellValue): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && value !== null) {
    if ("text" in value && typeof value.text === "string") {
      return normalizeWhitespace(value.text);
    }
    if ("result" in value) {
      return normalizeWhitespace(String(value.result ?? ""));
    }
    if ("richText" in value && Array.isArray(value.richText)) {
      return normalizeWhitespace(
        value.richText.map((part) => part.text).join(""),
      );
    }
    if ("hyperlink" in value && "text" in value) {
      return normalizeWhitespace(String(value.text ?? value.hyperlink ?? ""));
    }
  }
  return normalizeWhitespace(String(value ?? ""));
}
