import { describe, expect, it } from "vitest";
import {
  getAssessment,
  getFacts,
  getRecommendations,
  getReport,
  getScenarios,
  getSources,
  getTruthLayers,
} from "@/lib/assessment/store";

const DEMO_ID = "asm-bharat-heavy-fabrications";

describe("Bharat Heavy Fabrications golden demo", () => {
  it("keeps the seeded workbench assessment available", () => {
    const assessment = getAssessment(DEMO_ID);

    expect(assessment).toBeDefined();
    expect(assessment?.id).toBe(DEMO_ID);
    expect(assessment?.companyName).toBe(
      "Bharat Heavy Fabrications Pvt Ltd",
    );
  });

  it("keeps the golden source, fact, insight, and recommendation counts stable", () => {
    expect(getSources(DEMO_ID)).toHaveLength(8);
    expect(getFacts(DEMO_ID)).toHaveLength(20);
    expect(getTruthLayers(DEMO_ID)).toHaveLength(5);
    expect(getScenarios(DEMO_ID)).toHaveLength(5);
    expect(getRecommendations(DEMO_ID)).toHaveLength(10);
  });

  it("builds the golden report without throwing", () => {
    expect(() => getReport(DEMO_ID)).not.toThrow();

    const report = getReport(DEMO_ID);
    expect(report).toBeDefined();
    expect(report?.executiveSummary).toContain(
      "Bharat Heavy Fabrications",
    );
    expect(report?.sourceCount).toBe(8);
    expect(report?.factCount).toBe(20);
  });
});
