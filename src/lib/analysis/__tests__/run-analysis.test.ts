import { afterEach, describe, expect, it, vi } from "vitest";
import { runAssessmentAnalysis } from "@/lib/analysis/run-analysis";
import {
  addSource,
  addSourceDocument,
  createAssessment,
  getAnalysisState,
  getAssessment,
  getCockpit,
  getFacts,
  getRecommendations,
  getReport,
  getScenarios,
  getPlan,
  getTruthLayers,
  updateSource,
} from "@/lib/assessment/store";
import {
  AIProviderError,
  createAIEngine,
  resetAIEngine,
  type AIEngine,
} from "@/lib/ai";

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
    expect((await getAssessment(assessment.id))?.status).toBe(
      "analysis_ready",
    );
    expect((await getAnalysisState(assessment.id)).status).toBe(
      "analysis_ready",
    );
    expect(await getFacts(assessment.id)).not.toHaveLength(0);
    expect(await getTruthLayers(assessment.id)).toHaveLength(5);
    expect((await getCockpit(assessment.id)).metrics.length).toBeGreaterThan(0);
    expect(await getScenarios(assessment.id)).toHaveLength(5);
    expect((await getRecommendations(assessment.id)).length).toBeGreaterThan(0);
    expect(await getPlan(assessment.id)).toHaveLength(4);
    expect((await getReport(assessment.id))?.executiveSummary).toContain(
      "Stage Four Test Manufacturing",
    );
  });

  it("sets analyzing before work and analysis_ready after success", async () => {
    vi.stubEnv("PULSEIQ_DATA_MODE", "memory");
    vi.stubEnv("AI_PROVIDER", "mock");
    const assessment = await createAssessment({
      companyName: "Lifecycle Test Manufacturing",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 10_000_000,
      marginTarget: 20,
      cashTarget: 2_000_000,
      headcountProductivityTarget: 1_000_000,
    });
    const source = await addSource(assessment.id, {
      name: "Lifecycle source",
      type: "operations_report",
      extractionStatus: "extracted",
      fileName: "lifecycle.txt",
    });
    await addSourceDocument(source!.id, {
      kind: "text",
      content: "Revenue: ₹1 Cr\nGross margin: 15%",
    });

    const baseEngine = createAIEngine();
    const observingEngine = new Proxy(baseEngine, {
      get(target, property, receiver) {
        if (property === "extractBusinessFacts") {
          return async () => {
            expect((await getAssessment(assessment.id))?.status).toBe(
              "analyzing",
            );
            expect((await getAnalysisState(assessment.id)).status).toBe(
              "analyzing",
            );
            return { facts: [] };
          };
        }
        return Reflect.get(target, property, receiver);
      },
    });

    const result = await runAssessmentAnalysis(assessment.id, {
      engine: observingEngine,
    });

    expect(result.ok).toBe(true);
    expect((await getAssessment(assessment.id))?.status).toBe(
      "analysis_ready",
    );
  });

  it("persists analysis_failed when the provider rejects output", async () => {
    vi.stubEnv("PULSEIQ_DATA_MODE", "memory");
    const assessment = await createAssessment({
      companyName: "Provider Failure Test",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 10_000_000,
      marginTarget: 20,
      cashTarget: 2_000_000,
      headcountProductivityTarget: 1_000_000,
    });
    const source = await addSource(assessment.id, {
      name: "Failure source",
      type: "operations_report",
      extractionStatus: "extracted",
      fileName: "failure.txt",
    });
    await addSourceDocument(source!.id, {
      kind: "text",
      content: "Revenue: ₹1 Cr",
    });

    const baseEngine = createAIEngine();
    const failingEngine = new Proxy(baseEngine, {
      get(target, property, receiver) {
        if (property === "provider") return "openrouter";
        if (property === "model") return "test/model";
        if (property === "extractBusinessFacts") {
          return async () => {
            throw new AIProviderError(
              "openrouter",
              "returned JSON that did not match the required schema",
            );
          };
        }
        return Reflect.get(target, property, receiver);
      },
    }) as AIEngine;

    const result = await runAssessmentAnalysis(assessment.id, {
      engine: failingEngine,
      allowDeterministicFallback: false,
    });
    const state = await getAnalysisState(assessment.id);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("OpenRouter analysis failed");
    expect((await getAssessment(assessment.id))?.status).toBe(
      "analysis_failed",
    );
    expect(state.status).toBe("analysis_failed");
    expect(state.error).toContain("required schema");
  });

  it("fails clearly when no extracted documents are available", async () => {
    vi.stubEnv("PULSEIQ_DATA_MODE", "memory");
    vi.stubEnv("AI_PROVIDER", "mock");
    const assessment = await createAssessment({
      companyName: "Missing Documents Test",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 10_000_000,
      marginTarget: 20,
      cashTarget: 2_000_000,
      headcountProductivityTarget: 1_000_000,
    });

    const result = await runAssessmentAnalysis(assessment.id);
    const state = await getAnalysisState(assessment.id);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("No extracted source text");
    expect((await getAssessment(assessment.id))?.status).toBe(
      "analysis_failed",
    );
    expect(state.error).toContain("Upload and parse");
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
