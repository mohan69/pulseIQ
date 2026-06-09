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

    const statuses = ["draft", "intake", "ingestion", "analysis", "analysis_ready", "analyzing", "analysis_failed", "review", "delivered"];
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

  it("safeCockpit returns defaults for null", () => {
    const result = prismaMapping.safeCockpit(null);
    expect(result.metrics).toEqual([]);
    expect(result.topRisks).toEqual([]);
    expect(result.topOpportunities).toEqual([]);
  });

  it("safeCockpit returns defaults for undefined", () => {
    const result = prismaMapping.safeCockpit(undefined);
    expect(result.metrics).toEqual([]);
  });

  it("safeCockpit returns defaults for non-object", () => {
    const result = prismaMapping.safeCockpit("invalid");
    expect(result.metrics).toEqual([]);
  });

  it("safeCockpit returns defaults when metrics is null", () => {
    const result = prismaMapping.safeCockpit({ metrics: null, topRisks: [], topOpportunities: [] });
    expect(result.metrics).toEqual([]);
  });

  it("safeCockpit preserves valid metrics", () => {
    const cockpit = {
      metrics: [{ key: "rev", label: "Revenue", value: 100, target: 150, unit: "₹" as const, status: "off_track" as const, note: "" }],
      topRisks: [{ id: "r1", title: "Risk", description: "", likelihood: "high" as const, impact: "high" as const }],
      topOpportunities: [{ id: "o1", title: "Opp", description: "", impactInr: 1000000, timeframeDays: 90 }],
    };
    const result = prismaMapping.safeCockpit(cockpit);
    expect(result.metrics).toHaveLength(1);
    expect(result.topRisks).toHaveLength(1);
    expect(result.topOpportunities).toHaveLength(1);
  });

  it("safeArray returns empty for null", () => {
    expect(prismaMapping.safeArray(null)).toEqual([]);
  });

  it("safeArray returns empty for non-array", () => {
    expect(prismaMapping.safeArray("not-array")).toEqual([]);
  });

  it("safeArray preserves valid array", () => {
    expect(prismaMapping.safeArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("safeTruthLayers returns empty layers for null", () => {
    const result = prismaMapping.safeTruthLayers(null);
    expect(result).toHaveLength(5);
    expect(result[0].key).toBe("financial");
  });

  it("safeTruthLayers returns empty layers for non-array", () => {
    const result = prismaMapping.safeTruthLayers({});
    expect(result).toHaveLength(5);
  });

  it("safeTruthLayers preserves valid layers", () => {
    const layers = [{ key: "financial" as const, title: "Financial", description: "", confidence: "high" as const, findings: [], evidence: [], gaps: [], contradictions: [] }];
    const result = prismaMapping.safeTruthLayers(layers);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("financial");
  });
});
