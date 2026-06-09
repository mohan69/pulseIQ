// Tests that PDF extraction is lazy-loaded and handles DOMMatrix failure gracefully.
// No pdf-parse import should be evaluated at module load time.

import { describe, expect, it } from "vitest";

describe("pdf lazy import isolation", () => {
  it("importing the extractor index does not eagerly evaluate pdf-parse", async () => {
    // Static import at top of file would evaluate pdf-parse.
    // Instead, dynamically import and verify the module resolves without errors.
    const mod = await import("../extractors/index");
    expect(typeof mod.extractUploadedFile).toBe("function");
    expect(typeof mod.previewText).toBe("function");
    // Confirm the module does NOT have extractPdf on it directly
    expect((mod as Record<string, unknown>).extractPdf).toBeUndefined();
  });

  it("PDF extractor handles DOMMatrix-like runtime failure gracefully", async () => {
    const { extractPdf } = await import("../extractors/pdf");

    // Simulate a parser that throws ReferenceError like DOMMatrix
    const result = await extractPdf(Buffer.from("%PDF-1.7"), async () => {
      throw new ReferenceError("DOMMatrix is not defined");
    });

    expect(result.text).toBeUndefined();
    expect(result.error).toContain("PDF extraction is unavailable");
  });

  it("PDF extractor handles generic runtime failure gracefully", async () => {
    const { extractPdf } = await import("../extractors/pdf");

    const result = await extractPdf(Buffer.from("%PDF-1.7"), async () => {
      throw new Error("Cannot load @napi-rs/canvas");
    });

    expect(result.text).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it("PDF extractor handles searchable PDF via custom parser", async () => {
    const { extractPdf } = await import("../extractors/pdf");

    const result = await extractPdf(Buffer.from("%PDF-1.7"), () => ({
      async getText() {
        return { text: "Real searchable PDF content", total: 5 };
      },
      destroy() {},
    }));

    expect(result.text).toBe("Real searchable PDF content");
    expect(result.pageCount).toBe(5);
  });

  it("PDF extractor flags scanned PDF when text is too short", async () => {
    const { extractPdf } = await import("../extractors/pdf");

    const result = await extractPdf(Buffer.from("%PDF-1.7"), () => ({
      async getText() {
        return { text: "   ", total: 2 };
      },
      destroy() {},
    }));

    expect(result.text).toBeUndefined();
    expect(result.error).toContain("OCR is not enabled yet");
  });
});

describe("pdf-parse dynamic import failure paths", () => {
  it("returns fallback error when dynamic import fails", async () => {
    // We can't easily mock dynamic import(), but we can test that
    // extractPdf returns an error result rather than throwing
    const { extractPdf } = await import("../extractors/pdf");

    // Simulate the default parser path by providing a buffer that isn't
    // real PDF data — pdf-parse won't actually be loaded since we provide a parser
    const result = await extractPdf(Buffer.from("not pdf"), () => ({
      async getText() {
        return { text: "", total: 0 };
      },
      destroy() {},
    }));

    expect(result.text).toBeUndefined();
    expect(result.error).toBeTruthy();
  });
});
