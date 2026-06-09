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
    vi.unstubAllGlobals();
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

  it("produces public-domain framed outputs from five uploaded sources", async () => {
    vi.stubEnv("PULSEIQ_DATA_MODE", "memory");
    vi.stubEnv("AI_PROVIDER", "openrouter");
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    vi.stubEnv("OPENROUTER_MODEL", "test/model");
    vi.stubEnv("PULSEIQ_ALLOW_AI_FALLBACK", "false");
    vi.stubGlobal("fetch", vi.fn(openRouterSectionResponse));

    const assessment = await createAssessment({
      companyName: "Microfinish Public-Domain Sample Diagnostic",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 100_000_000,
      marginTarget: 20,
      cashTarget: 10_000_000,
      headcountProductivityTarget: 1_000_000,
    });
    for (let index = 1; index <= 5; index += 1) {
      const source = await addSource(assessment.id, {
        name: `Public-domain source ${index}`,
        type: "operations_report",
        notes: "Public-domain material; assumptions require validation.",
        fileName: `source-${index}.txt`,
        extractionStatus: "extracted",
      });
      await updateSource(source!.id, { status: "parsed" });
      await addSourceDocument(source!.id, {
        kind: "text",
        content: `Revenue observation ${index}: public-domain evidence only.`,
      });
    }

    const result = await runAssessmentAnalysis(assessment.id, {
      allowDeterministicFallback: false,
    });
    const [layers, cockpit, scenarios, recommendations, plan, report] =
      await Promise.all([
        getTruthLayers(assessment.id),
        getCockpit(assessment.id),
        getScenarios(assessment.id),
        getRecommendations(assessment.id),
        getPlan(assessment.id),
        getReport(assessment.id),
      ]);

    expect(result.ok).toBe(true);
    expect(layers).toHaveLength(5);
    expect(layers.every((layer) => layer.description.includes("Public-domain"))).toBe(true);
    expect(cockpit.metrics[0]?.note).toContain("Public-domain");
    expect(scenarios).toHaveLength(5);
    expect(JSON.stringify(scenarios)).toMatch(/public[\s-]?domain/i);
    expect(JSON.stringify(scenarios)).not.toContain("Reduce headcount by 15%");
    expect(
      scenarios.find((scenario) => scenario.key === "margin_plus_10")?.label,
    ).toContain("2–3 percentage points");
    expect(recommendations[0]?.evidence).toContain("Public-domain");
    expect(plan).toHaveLength(4);
    expect(
      plan.every((phase) => phase.description.includes("Public-domain")),
    ).toBe(true);
    expect(report?.executiveSummary).toContain(
      "public-domain sample diagnostic",
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

function openRouterSectionResponse(
  _input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const body = JSON.parse(String(init?.body)) as {
    response_format: { json_schema: { name: string } };
  };
  const section = body.response_format.json_schema.name;
  const publicDomain =
    "Public-domain assumption; validate against approved customer evidence.";
  if (section.startsWith("pulseiq_truth_layer_")) {
    const key = section.replace("pulseiq_truth_layer_", "");
    return Promise.resolve(
      providerJsonResponse({
        layer: {
          key,
          title: `${key} truth`,
          description: publicDomain,
          findings: [{ text: `Assumption: ${publicDomain}`, impact: "low" }],
          gaps: ["Customer validation required."],
          contradictions: [],
          confidence: "low",
        },
      }),
    );
  }
  if (section.startsWith("pulseiq_recommendation_")) {
    const rank = Number(section.replace("pulseiq_recommendation_", ""));
    return Promise.resolve(
      providerJsonResponse({
        recommendation: {
          rank,
          title: `Validate public-domain assumption ${rank}`,
          description: publicDomain,
          priority: rank === 1 ? "P0" : "P1",
          businessImpact: "Improves evidence quality",
          effort: "low",
          timeframeDays: 14,
          ownerRole: "Leadership team",
          evidence: publicDomain,
          confidence: "low",
        },
      }),
    );
  }
  if (section.startsWith("pulseiq_cockpit_metric_")) {
    const key = section.replace("pulseiq_cockpit_metric_", "");
    return Promise.resolve(
      providerJsonResponse({
        metric: {
          key,
          label: `${key} evidence`,
          value: 5,
          target: 5,
          unit: "count",
          status: "at_risk",
          note: publicDomain,
        },
      }),
    );
  }
  if (section.startsWith("pulseiq_plan_phase_")) {
    const phase = Number(section.replace("pulseiq_plan_phase_", ""));
    return Promise.resolve(
      providerJsonResponse({
        phase: {
          phase: `0${phase}`,
          windowLabel: `Phase ${phase}`,
          title: "Validate evidence",
          description: publicDomain,
          deliverables: ["Evidence validation"],
        },
      }),
    );
  }
  if (section.startsWith("pulseiq_scenarios_")) {
    const key = section.replace("pulseiq_scenarios_", "");
    return Promise.resolve(
      providerJsonResponse({
        scenario: {
          key,
          label: key,
          description: publicDomain,
          currentBaseline: "Not verified",
          target: "Requires customer validation",
          options: [],
          pros: [],
          shortfalls: ["Public-domain evidence only."],
          expectedImpact: "Not quantified",
          risks: ["Assumption risk"],
          recommendation: "Validate source evidence first.",
          confidence: "low",
        },
      }),
    );
  }
  const contentBySection: Record<string, unknown> = {
    pulseiq_business_facts: {
      facts: [
        {
          kind: "risk",
          label: "Public-domain evidence limitation",
          value: publicDomain,
          numericValue: null,
          unit: null,
          evidence: `Assumption: ${publicDomain}`,
          confidence: "low",
        },
      ],
    },
    pulseiq_truth_layers: {
      layers: [
        "financial",
        "strategic",
        "operational",
        "process",
        "collaboration",
      ].map((key) => ({
        key,
        title: `${key} truth`,
        description: publicDomain,
        findings: [{ text: `Assumption: ${publicDomain}`, impact: "low" }],
        gaps: ["Customer validation required."],
        contradictions: [],
        confidence: "low",
      })),
    },
    pulseiq_cockpit: {
      metrics: [
        {
          key: "evidence",
          label: "Evidence coverage",
          value: 5,
          target: 5,
          unit: "count",
          status: "at_risk",
          note: publicDomain,
        },
      ],
      topRisks: [
        {
          title: "Evidence limitation",
          description: publicDomain,
          likelihood: "high",
          impact: "medium",
        },
      ],
      topOpportunities: [],
    },
    pulseiq_recommendations: {
      recommendations: [
        {
          rank: 1,
          title: "Validate public-domain assumptions",
          description: publicDomain,
          priority: "P0",
          businessImpact: "Improves evidence quality",
          effort: "low",
          timeframeDays: 14,
          ownerRole: "Leadership team",
          evidence: publicDomain,
          confidence: "low",
        },
      ],
    },
    pulseiq_plan: {
      phases: Array.from({ length: 4 }, (_, index) => ({
        phase: `0${index + 1}`,
        windowLabel: `Phase ${index + 1}`,
        title: "Validate evidence",
        description: publicDomain,
        deliverables: ["Evidence validation"],
      })),
    },
    pulseiq_report: {
      executiveSummary: publicDomain,
      dataGaps: ["Approved customer evidence."],
      confidence: "low",
    },
  };
  return Promise.resolve(
    providerJsonResponse(contentBySection[section]),
  );
}

function providerJsonResponse(content: unknown): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(content) } }],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
