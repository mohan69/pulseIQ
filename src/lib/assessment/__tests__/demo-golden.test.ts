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
  it("keeps the seeded workbench assessment available", async () => {
    const assessment = await getAssessment(DEMO_ID);

    expect(assessment).toBeDefined();
    expect(assessment?.id).toBe(DEMO_ID);
    expect(assessment?.companyName).toBe(
      "Bharat Heavy Fabrications Pvt Ltd",
    );
  });

  it("keeps the golden source, fact, insight, and recommendation counts stable", async () => {
    await expect(getSources(DEMO_ID)).resolves.toHaveLength(8);
    await expect(getFacts(DEMO_ID)).resolves.toHaveLength(20);
    await expect(getTruthLayers(DEMO_ID)).resolves.toHaveLength(5);
    await expect(getScenarios(DEMO_ID)).resolves.toHaveLength(5);
    await expect(getRecommendations(DEMO_ID)).resolves.toHaveLength(10);
  });

  it("builds the golden report without throwing", async () => {
    await expect(getReport(DEMO_ID)).resolves.toBeDefined();

    const report = await getReport(DEMO_ID);
    expect(report).toBeDefined();
    expect(report?.executiveSummary).toContain(
      "Bharat Heavy Fabrications",
    );
    expect(report?.sourceCount).toBe(8);
    expect(report?.factCount).toBe(20);
  });
});
