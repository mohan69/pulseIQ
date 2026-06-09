import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ReportSnapshotOutputSchema,
  createAIEngine,
  normalizeAIOutput,
  parseAIJsonObject,
  providerJsonSchema,
  resetAIEngine,
  summarizeZodIssues,
  BusinessFactExtractionSchema,
  type AIContext,
} from "@/lib/ai";

const context: AIContext = {
  assessmentId: "asm-openrouter-test",
  companyName: "Microfinish Public-Domain Sample Diagnostic",
  industry: "industrial_manufacturing",
  objective: "board_review",
  sources: [],
  facts: [],
};

function providerResponse(content: string): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function configureOpenRouter() {
  vi.stubEnv("AI_PROVIDER", "openrouter");
  vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  vi.stubEnv("OPENROUTER_MODEL", "test/model");
  resetAIEngine();
}

describe("OpenRouter output validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    resetAIEngine();
  });

  it("parses markdown-fenced JSON", () => {
    expect(
      parseAIJsonObject(
        '```json\n{"executiveSummary":"Ready","dataGaps":[],"confidence":"medium"}\n```',
      ),
    ).toMatchObject({ executiveSummary: "Ready" });
  });

  it("extracts the first valid JSON object from surrounding prose", () => {
    expect(
      parseAIJsonObject(
        'Here is the result: {"executiveSummary":"Ready","dataGaps":[],"confidence":"medium"} Thank you.',
      ),
    ).toMatchObject({ confidence: "medium" });
  });

  it("normalizes null arrays and safe text defaults", () => {
    expect(
      normalizeAIOutput("report", {
        executiveSummary: null,
        dataGaps: null,
        confidence: null,
      }),
    ).toEqual({
      executiveSummary: "",
      dataGaps: [],
      confidence: "medium",
    });
  });

  it("produces safe field diagnostics without values", () => {
    const value = {
      executiveSummary: "Public-domain assessment",
      dataGaps: [],
      confidence: "certain",
    };
    const result = ReportSnapshotOutputSchema.safeParse(value);
    expect(result.success).toBe(false);
    if (result.success) return;

    expect(summarizeZodIssues(result.error, value)).toEqual([
      {
        path: "$.confidence",
        expected: "invalid_value",
        received: "string",
      },
    ]);
  });

  it("repairs one invalid response and validates the repaired section", async () => {
    configureOpenRouter();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        providerResponse(
          '{"executiveSummary":"Public-domain diagnostic","dataGaps":[],"confidence":"low","commentary":"remove me"}',
        ),
      )
      .mockResolvedValueOnce(
        providerResponse(
          '{"executiveSummary":"Public-domain diagnostic; assumptions require validation.","dataGaps":[],"confidence":"low"}',
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createAIEngine().generateReportSnapshot(context);

    expect(result.confidence).toBe("low");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const repairBody = JSON.parse(
      String(fetchMock.mock.calls[1][1]?.body),
    ) as { messages: Array<{ content: string }> };
    expect(repairBody.messages[1].content).toContain(
      "Repair this JSON to match the schema",
    );
  });

  it("fails visibly after one unsuccessful repair attempt", async () => {
    configureOpenRouter();
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          providerResponse(
          '{"executiveSummary":"Diagnostic","dataGaps":[],"confidence":"low","commentary":"invalid extra field"}',
          ),
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createAIEngine().generateReportSnapshot(context),
    ).rejects.toThrow(
      "OpenRouter analysis failed: output did not match required schema after repair attempt.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("requests strict JSON Schema output from OpenRouter", async () => {
    configureOpenRouter();
    const fetchMock = vi.fn().mockResolvedValue(
      providerResponse(
        '{"executiveSummary":"Public-domain assessment; validate assumptions.","dataGaps":[],"confidence":"low"}',
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await createAIEngine().generateReportSnapshot(context);

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      response_format: {
        type: string;
        json_schema: { strict: boolean; name: string };
      };
      provider: { require_parameters: boolean };
      plugins: Array<{ id: string }>;
    };
    expect(body.response_format).toMatchObject({
      type: "json_schema",
      json_schema: { strict: true, name: "pulseiq_report" },
    });
    expect(body.provider.require_parameters).toBe(true);
    expect(body.plugins).toContainEqual({ id: "response-healing" });
  });

  it("makes optional fields nullable and required for strict providers", () => {
    const schema = providerJsonSchema(BusinessFactExtractionSchema) as {
      properties: {
        facts: {
          items: {
            required: string[];
            properties: { numericValue: { anyOf: unknown[] } };
          };
        };
      };
    };
    const factSchema = schema.properties.facts.items;

    expect(factSchema.required).toContain("numericValue");
    expect(factSchema.properties.numericValue.anyOf).toContainEqual({
      type: "null",
    });
  });
});
