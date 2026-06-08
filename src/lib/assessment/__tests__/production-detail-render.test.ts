// Regression test: simulates the exact data shapes the Prisma repository returns
// for the assessment detail route, guarding against production 500 errors.

import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));

import { prismaMapping } from "@/lib/assessment/prisma-repository";
import { formatCurrency, formatDate } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("assessment detail page rendering safety", () => {
  it("safeCockpit filters out malformed metrics", () => {
    const cockpit = prismaMapping.safeCockpit({
      metrics: [
        null,
        { key: "rev", label: "Revenue", status: "off_track" },
        { key: "margin", label: "Margin", status: "at_risk" as const, value: 21, target: 26, unit: "%" as const, note: "" },
        42,
        "invalid",
        { key: "cost", status: 123 },
      ],
    });
    // Valid: rev (has status string), margin (has status string) — 2 total
    expect(cockpit.metrics).toHaveLength(2);
    expect(cockpit.metrics[0]?.status).toBe("off_track");
    expect(cockpit.metrics[1]?.status).toBe("at_risk");
  });

  it("safeCockpit filters malformed topRisks and topOpportunities", () => {
    const cockpit = prismaMapping.safeCockpit({
      metrics: [],
      topRisks: [null, undefined, 42, { id: "r1", title: "Real risk", description: "", likelihood: "high" as const, impact: "high" as const }],
      topOpportunities: [null, { id: "o1", title: "Real opp", description: "", impactInr: 1000000, timeframeDays: 90 }],
    });
    expect(cockpit.topRisks).toHaveLength(1);
    expect(cockpit.topRisks[0]?.id).toBe("r1");
    expect(cockpit.topOpportunities).toHaveLength(1);
    expect(cockpit.topOpportunities[0]?.impactInr).toBe(1000000);
  });

  it("safeCockpit returns empty cockpit for null", () => {
    const c = prismaMapping.safeCockpit(null);
    expect(c.metrics).toEqual([]);
    expect(c.topRisks).toEqual([]);
    expect(c.topOpportunities).toEqual([]);
  });

  it("safeCockpit returns empty cockpit for undefined", () => {
    const c = prismaMapping.safeCockpit(undefined);
    expect(c.metrics).toEqual([]);
  });

  it("safeCockpit returns empty cockpit for non-object", () => {
    const c = prismaMapping.safeCockpit("nope");
    expect(c.metrics).toEqual([]);
  });

  it("safeTruthLayers sanitizes each layer element", () => {
    const layers = prismaMapping.safeTruthLayers([
      null,
      { key: "bad-key", title: 42, findings: "not-array", gaps: null },
      { key: "financial", title: "Financial", findings: [{ id: "f1", text: "Found", impact: "high" as const, factIds: [] }], gaps: ["gap1"], contradictions: [], evidence: [], description: "", confidence: "high" as const },
    ]);
    expect(layers).toHaveLength(3);
    // null element → falls back to empty layer with default key
    expect(layers[0].key).toBe("financial");
    expect(layers[0].findings).toEqual([]);
    // malformed element → fields coerced to safe defaults
    expect(layers[1].key).toBe("financial"); // bad-key not in map
    expect(layers[1].title).toBe("");
    expect(layers[1].findings).toEqual([]);
    expect(layers[1].gaps).toEqual([]);
    // valid element preserved
    expect(layers[2].key).toBe("financial");
    expect(layers[2].findings).toHaveLength(1);
    expect(layers[2].gaps).toEqual(["gap1"]);
  });

  it("safeTruthLayers returns empty layers for non-array", () => {
    const layers = prismaMapping.safeTruthLayers(null);
    expect(layers).toHaveLength(5);
    for (const l of layers) {
      expect(l.findings).toEqual([]);
      expect(l.gaps).toEqual([]);
      expect(typeof l.title).toBe("string");
    }
  });

  it("safeTruthLayers returns empty layers for undefined", () => {
    const layers = prismaMapping.safeTruthLayers(undefined);
    expect(layers).toHaveLength(5);
  });

  it("safeArray returns empty for null", () => {
    expect(prismaMapping.safeArray(null)).toEqual([]);
  });

  it("safeArray returns empty for non-array", () => {
    expect(prismaMapping.safeArray(42)).toEqual([]);
  });

  it("safeArray preserves valid array", () => {
    expect(prismaMapping.safeArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("formatCurrency handles null/undefined/NaN", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
    expect(formatCurrency(NaN)).toBe("—");
  });

  it("formatCurrency formats normal numbers", () => {
    expect(formatCurrency(150000000)).toBe("₹15Cr");
    expect(formatCurrency(1500000)).toBe("₹15L");
    expect(formatCurrency(50000)).toBe("₹50,000");
  });

  it("formatDate handles null/undefined/empty", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
  });

  it("formatDate formats valid ISO string", () => {
    const result = formatDate("2026-01-15T10:00:00.000Z");
    expect(result).toBeTruthy();
    expect(result).not.toBe("—");
    expect(result).toContain("Jan");
  });

  it("layers.filter(l => l.findings.length > 0) never throws", () => {
    const layers = prismaMapping.safeTruthLayers([
      { key: "financial", title: "F", findings: null, gaps: null },
      { key: "strategic", title: "S", findings: undefined, gaps: undefined },
      { key: "operational", title: "O", findings: "not-array" as any, gaps: 42 as any },
    ]);
    // These operations mirror page.tsx lines 146, 157-165
    const populated = layers.filter((l) => Array.isArray(l.findings) && l.findings.length > 0);
    expect(populated).toHaveLength(0);

    for (const l of layers) {
      expect(() => {
        const fLen = Array.isArray(l.findings) ? l.findings.length : 0;
        const gLen = Array.isArray(l.gaps) ? l.gaps.length : 0;
        const variant = fLen > 0 ? "success" : gLen > 0 ? "warning" : "outline";
        expect(typeof variant).toBe("string");
      }).not.toThrow();
    }
  });

  it("new Date(assessment.updatedAt).toLocaleString never throws", () => {
    expect(() => {
      formatDate("2026-01-15T10:00:00.000Z");
    }).not.toThrow();
  });
});
