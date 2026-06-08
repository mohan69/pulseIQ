import { describe, expect, it, vi } from "vitest";

// Mock the db module so Prisma client is never instantiated during tests.
vi.mock("@/lib/db", () => ({ prisma: {} }));

import { prismaMapping } from "@/lib/assessment/prisma-repository";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("prisma DTO mapping tolerates null optional file fields", () => {
  it("mapSource returns undefined for all optional fields when null", () => {
    const row: any = {
      id: "src-test",
      assessmentId: "asm-test",
      name: "Test Source",
      type: "financial_filing",
      status: "registered",
      confidence: "medium",
      notes: "",
      pageCount: null,
      fileName: null,
      mimeType: null,
      byteSize: null,
      checksumSha256: null,
      storageProvider: null,
      storageBucket: null,
      storageKey: null,
      extractionStatus: null,
      extractedTextPreview: null,
      extractedAt: null,
      extractionError: null,
      createdAt: new Date(),
    };

    const result = prismaMapping.mapSource(row);

    expect(result.pageCount).toBeUndefined();
    expect(result.fileName).toBeUndefined();
    expect(result.mimeType).toBeUndefined();
    expect(result.byteSize).toBeUndefined();
    expect(result.checksumSha256).toBeUndefined();
    expect(result.storageProvider).toBeUndefined();
    expect(result.storageContainer).toBeUndefined();
    expect(result.storageKey).toBeUndefined();
    expect(result.extractionStatus).toBeUndefined();
    expect(result.extractedTextPreview).toBeUndefined();
    expect(result.extractedAt).toBeUndefined();
    expect(result.extractionError).toBeUndefined();
  });

  it("mapSource preserves defined optional fields", () => {
    const row: any = {
      id: "src-defined",
      assessmentId: "asm-defined",
      name: "Defined Source",
      type: "erp_export",
      status: "parsed",
      confidence: "high",
      notes: "Some notes",
      pageCount: 10,
      fileName: "report.pdf",
      mimeType: "application/pdf",
      byteSize: 1024,
      checksumSha256: "abc123",
      storageProvider: "azure",
      storageBucket: "bucket-name",
      storageKey: "path/to/file",
      extractionStatus: "extracted",
      extractedTextPreview: "Preview text",
      extractedAt: new Date("2026-01-15"),
      extractionError: null,
      createdAt: new Date(),
    };

    const result = prismaMapping.mapSource(row);

    expect(result.pageCount).toBe(10);
    expect(result.fileName).toBe("report.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(result.byteSize).toBe(1024);
    expect(result.checksumSha256).toBe("abc123");
    expect(result.storageProvider).toBe("azure");
    expect(result.storageContainer).toBe("bucket-name");
    expect(result.storageKey).toBe("path/to/file");
    expect(result.extractionStatus).toBe("extracted");
    expect(result.extractedTextPreview).toBe("Preview text");
    expect(result.extractedAt).toBeDefined();
    expect(result.extractionError).toBeUndefined();
  });

  it("mapAssessment handles all status values", () => {
    const base: any = {
      id: "asm-test",
      companyName: "Test Co",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: BigInt(1000000),
      marginTarget: 20,
      cashTarget: BigInt(500000),
      headcountProductivityTarget: BigInt(100000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const statuses = ["draft", "intake", "ingestion", "analysis", "analyzing", "analysis_failed", "review", "delivered"];
    for (const status of statuses) {
      const result = prismaMapping.mapAssessment({ ...base, status });
      expect(result.status).toBe(status);
    }
  });

  it("mapFact returns undefined for null numeric fields", () => {
    const row: any = {
      id: "fact-test",
      assessmentId: "asm-test",
      sourceId: "src-test",
      kind: "revenue",
      label: "FY25 Revenue",
      value: "₹150 Cr",
      numericValue: null,
      unit: null,
      evidence: "Source excerpt",
      confidence: "high",
      capturedAt: new Date(),
    };

    const result = prismaMapping.mapFact(row);

    expect(result.numericValue).toBeUndefined();
    expect(result.unit).toBeUndefined();
  });

  it("mapSourceDocument returns undefined for null optional fields", () => {
    const row: any = {
      id: "doc-test",
      sourceId: "src-test",
      kind: "text",
      pageNumber: null,
      chunkIndex: null,
      content: null,
      data: null,
      metadata: null,
      createdAt: new Date(),
    };

    const result = prismaMapping.mapSourceDocument(row);

    expect(result.pageNumber).toBeUndefined();
    expect(result.chunkIndex).toBeUndefined();
    expect(result.content).toBeUndefined();
    expect(result.data).toBeUndefined();
  });

  it("outputData returns undefined for null output", () => {
    expect(prismaMapping.outputData(null)).toBeUndefined();
  });

  it("outputData returns data from valid output", () => {
    const output: any = { data: { metrics: [], topRisks: [], topOpportunities: [] } };
    const result = prismaMapping.outputData(output);
    expect(result).toEqual({ metrics: [], topRisks: [], topOpportunities: [] });
  });

  it("outputData returns undefined when data is null", () => {
    const output: any = { data: null };
    expect(prismaMapping.outputData(output)).toBeUndefined();
  });
});
