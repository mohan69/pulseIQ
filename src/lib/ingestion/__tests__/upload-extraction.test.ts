import { describe, expect, it } from "vitest";
import { extractUploadedFile, previewText } from "@/lib/ingestion/extractors";
import { checksumSha256, validateUploadFile } from "@/lib/storage";

describe("upload validation and extraction", () => {
  it("validates and extracts TXT uploads", () => {
    const buffer = Buffer.from("Revenue target is 150 Cr\nMargin target is 26%");
    const validation = validateUploadFile({
      fileName: "board-notes.txt",
      mimeType: "text/plain",
      byteSize: buffer.length,
    });
    const extraction = extractUploadedFile(validation.extension, buffer);

    expect(validation.extension).toBe(".txt");
    expect(extraction.status).toBe("extracted");
    expect(extraction.text).toContain("Revenue target");
    expect(checksumSha256(buffer)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("validates and extracts CSV uploads", () => {
    const buffer = Buffer.from("customer,value\nA,100\nB,200");
    const validation = validateUploadFile({
      fileName: "pipeline.csv",
      mimeType: "text/csv",
      byteSize: buffer.length,
    });
    const extraction = extractUploadedFile(validation.extension, buffer);

    expect(validation.extension).toBe(".csv");
    expect(extraction.status).toBe("extracted");
    expect(extraction.text).toContain("CSV headers: customer,value");
    expect(extraction.text).toContain("Row 2: B,200");
  });

  it("marks PDF extraction pending without rejecting the upload", () => {
    const buffer = Buffer.from("%PDF-1.7");
    const validation = validateUploadFile({
      fileName: "financials.pdf",
      mimeType: "application/pdf",
      byteSize: buffer.length,
    });
    const extraction = extractUploadedFile(validation.extension, buffer);

    expect(validation.extension).toBe(".pdf");
    expect(extraction.status).toBe("extraction_pending");
  });

  it("rejects executable uploads", () => {
    expect(() =>
      validateUploadFile({
        fileName: "run-me.exe",
        mimeType: "application/octet-stream",
        byteSize: 10,
      }),
    ).toThrow("Executable or script files are not allowed.");
  });

  it("rejects archive uploads", () => {
    expect(() =>
      validateUploadFile({
        fileName: "customer-data.zip",
        mimeType: "application/octet-stream",
        byteSize: 10,
      }),
    ).toThrow("Archive files are not allowed.");
  });

  it("rejects suspicious double extensions", () => {
    expect(() =>
      validateUploadFile({
        fileName: "financials.exe.pdf",
        mimeType: "application/pdf",
        byteSize: 10,
      }),
    ).toThrow("double extensions");
  });

  it("builds compact previews", () => {
    expect(previewText("A\n\nB\tC", 10)).toBe("A B C");
  });
});
