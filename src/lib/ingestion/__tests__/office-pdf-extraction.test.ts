import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import ExcelJS from "exceljs";
import { extractDocx } from "@/lib/ingestion/extractors/docx";
import { extractPdf } from "@/lib/ingestion/extractors/pdf";
import { extractXlsx } from "@/lib/ingestion/extractors/xlsx";

describe("office and PDF extraction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("extracts searchable PDF text through the parser contract", async () => {
    const result = await extractPdf(Buffer.from("%PDF-1.7"), () => ({
      async getText() {
        return {
          text: "Bharat Heavy Fabrications revenue target and margin plan.",
          total: 3,
        };
      },
      destroy() {},
    }));

    expect(result.text).toContain("revenue target");
    expect(result.pageCount).toBe(3);
  });

  it("flags scanned or image-based PDFs when no text is available", async () => {
    const result = await extractPdf(Buffer.from("%PDF-1.7"), () => ({
      async getText() {
        return { text: " ", total: 2 };
      },
      destroy() {},
    }));

    expect(result.text).toBeUndefined();
    expect(result.error).toContain("OCR is not enabled yet");
    expect(result.pageCount).toBe(2);
  });

  it("extracts XLSX sheets and truncates large sheets", async () => {
    vi.stubEnv("PULSEIQ_XLSX_MAX_ROWS_PER_SHEET", "2");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Pipeline");
    sheet.addRows([
      ["customer", "value"],
      ["A", 100],
      ["B", 200],
      ["C", 300],
    ]);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await extractXlsx(buffer);

    expect(result.text).toContain("Sheet: Pipeline");
    expect(result.text).toContain("Headers: customer | value");
    expect(result.text).toContain("Row 2: B | 200");
    expect(result.text).not.toContain("Row 3: C | 300");
    expect(result.truncated).toBe(true);
    expect(result.warning).toContain("2 rows per sheet");
  });

  it("extracts DOCX paragraph text", async () => {
    const fixture = await readFile(
      "node_modules/mammoth/test/test-data/single-paragraph.docx",
    );

    const result = await extractDocx(fixture);

    expect(result.text.length).toBeGreaterThan(0);
    expect(result.truncated).toBe(false);
  });
});
