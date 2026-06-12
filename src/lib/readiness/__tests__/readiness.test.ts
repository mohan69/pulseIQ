import { describe, expect, it } from "vitest";
import type { Assessment } from "@/lib/assessment/types";
import { getAssessment, getSources } from "@/lib/assessment/store";
import {
  buildReadinessReportSections,
  calculateReadinessScore,
  getAssessmentReadiness,
} from "@/lib/readiness";

const DEMO_ID = "asm-bharat-heavy-fabrications";

describe("assessment readiness", () => {
  it("calculates evidence readiness deterministically", () => {
    const statuses = [
      "Evidence found",
      "Needs review",
      "Expired evidence",
      "Missing evidence",
      "Not applicable",
    ] as const;

    expect(calculateReadinessScore([...statuses])).toBe(44);
    expect(calculateReadinessScore([...statuses])).toBe(44);
  });

  it("surfaces missing standards as readiness gaps", async () => {
    const assessment = await getAssessment(DEMO_ID);
    const sources = await getSources(DEMO_ID);
    expect(assessment).toBeDefined();

    const readiness = getAssessmentReadiness(assessment!, sources);
    const missing = readiness.standards.filter(
      (standard) => standard.status === "Missing evidence",
    );

    expect(missing.length).toBeGreaterThan(0);
    expect(missing.every((standard) => standard.gaps.length > 0)).toBe(true);
    expect(readiness.criticalGaps.length).toBeGreaterThan(0);
  });

  it("does not make positive certification or compliance claims without evidence", async () => {
    const assessment = await getAssessment(DEMO_ID);
    const sources = await getSources(DEMO_ID);
    expect(assessment).toBeDefined();

    const readiness = getAssessmentReadiness(assessment!, sources);
    const output = JSON.stringify({
      readiness,
      sections: buildReadinessReportSections(readiness),
    });

    expect(output).not.toMatch(
      /\b(is|are|fully|formally|confirmed)\s+(certified|compliant)\b/i,
    );
    expect(output).not.toMatch(/\bcertified\s+(to|under)\b/i);
  });

  it("builds all structured report sections", async () => {
    const assessment = await getAssessment(DEMO_ID);
    const sources = await getSources(DEMO_ID);
    expect(assessment).toBeDefined();

    const sections = buildReadinessReportSections(
      getAssessmentReadiness(assessment!, sources),
    );

    expect(sections.map((section) => section.title)).toEqual([
      "Compliance & Standards Readiness",
      "Customer Qualification Readiness",
      "Statutory & Audit Evidence",
      "Supplier / Vendor Ecosystem Readiness",
      "AI Governance & Trusted Agent Readiness",
      "Revenue Risk from Readiness Gaps",
    ]);
  });

  it("keeps Microfinish explicitly public-domain and validation-gated", () => {
    const assessment: Assessment = {
      id: "asm-microfinish-readiness",
      companyName: "Microfinish Public-Domain Sample Diagnostic",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 6_500_000_000,
      marginTarget: 22,
      cashTarget: 0,
      headcountProductivityTarget: 10_000_000,
      status: "analysis_ready",
      createdAt: "2026-06-09T00:00:00.000Z",
      updatedAt: "2026-06-09T00:00:00.000Z",
    };

    const readiness = getAssessmentReadiness(assessment, []);

    expect(readiness.sampleType).toBe("microfinish-public-domain");
    expect(readiness.disclaimer).toContain("public-domain");
    expect(readiness.disclaimer).toContain("internal validation");
    expect(
      readiness.standards.every(
        (standard) => standard.status !== "Evidence found",
      ),
    ).toBe(true);
  });
});
