import { afterEach, describe, expect, it, vi } from "vitest";
import { runAssessmentAnalysis } from "@/lib/analysis/run-analysis";
import {
  addSource,
  addSourceDocument,
  createAssessment,
  getAssessment,
  getCockpit,
  getFacts,
  getRecommendations,
  getReport,
  getScenarios,
  getTruthLayers,
  updateSource,
} from "@/lib/assessment/store";
import { resetAIEngine } from "@/lib/ai";

describe("assessment analysis pipeline", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetAIEngine();
  });

  it("analyzes an uploaded TXT source in mock mode", async () => {
    vi.stubEnv("PULSEIQ_DATA_MODE", "memory");
    vi.stubEnv("AI_PROVIDER", "mock");

    const assessment = await createAssessment({
      companyName: "Stage Four Test Manufacturing Pvt Ltd",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 150_000_000,
      marginTarget: 25,
      cashTarget: 20_000_000,
      headcountProductivityTarget: 1_500_000,
    });
    const source = await addSource(assessment.id, {
      name: "Management TXT Upload",
      type: "operations_report",
      notes: "Uploaded text source for analysis.",
      fileName: "management.txt",
      mimeType: "text/plain",
      byteSize: 210,
      checksumSha256: "test-checksum",
      extractionStatus: "extracted",
      extractedTextPreview:
        "Revenue ₹12 Cr. Gross margin 18%. Headcount 120. Risk: delayed orders.",
    });
    expect(source).toBeTruthy();
    await updateSource(source!.id, { status: "parsed" });
    await addSourceDocument(source!.id, {
      kind: "text",
      chunkIndex: 0,
      content: [
        "Revenue: ₹12 Cr",
        "Gross margin: 18%",
        "Headcount: 120 people",
        "Risk: delayed orders worth ₹1.2 Cr",
        "Opportunity: pipeline improvement worth ₹3 Cr",
      ].join("\n"),
    });

    const result = await runAssessmentAnalysis(assessment.id);

    expect(result.ok).toBe(true);
    expect(result.provider).toBe("mock");
    expect(result.factsAdded).toBeGreaterThan(0);
    expect((await getAssessment(assessment.id))?.status).toBe("analysis");
    expect(await getFacts(assessment.id)).not.toHaveLength(0);
    expect(await getTruthLayers(assessment.id)).toHaveLength(5);
    expect((await getCockpit(assessment.id)).metrics.length).toBeGreaterThan(0);
    expect(await getScenarios(assessment.id)).toHaveLength(5);
    expect((await getRecommendations(assessment.id)).length).toBeGreaterThan(0);
    expect((await getReport(assessment.id))?.executiveSummary).toContain(
      "Stage Four Test Manufacturing",
    );
  });

  it("keeps the Bharat Heavy Fabrications demo stable", async () => {
    vi.stubEnv("PULSEIQ_DATA_MODE", "memory");
    vi.stubEnv("AI_PROVIDER", "mock");

    const result = await runAssessmentAnalysis("asm-bharat-heavy-fabrications");
    const report = await getReport("asm-bharat-heavy-fabrications");

    expect(result.ok).toBe(true);
    expect(result.factsAdded).toBe(0);
    expect(report?.sourceCount).toBe(8);
    expect(report?.factCount).toBe(20);
    expect(report?.truthLayers).toHaveLength(5);
    expect(report?.scenarios).toHaveLength(5);
    expect(report?.recommendations).toHaveLength(10);
  });
});
