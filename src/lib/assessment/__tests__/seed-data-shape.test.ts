import { describe, expect, it } from "vitest";
import {
  demoAssessment,
  demoSources,
  demoFacts,
  demoTruthLayers,
  demoCockpit,
  demoScenarios,
  demoRecommendations,
  demoPlan,
} from "@/lib/assessment/seed";

const DEMO_ID = "asm-bharat-heavy-fabrications";

describe("seed data shape", () => {
  it("exports a demo assessment with the golden ID", () => {
    expect(demoAssessment.id).toBe(DEMO_ID);
    expect(demoAssessment.companyName).toBe("Bharat Heavy Fabrications Pvt Ltd");
    expect(demoAssessment.industry).toBe("industrial_manufacturing");
    expect(demoAssessment.objective).toBe("board_review");
  });

  it("has all source assessmentIds pointing to the demo assessment", () => {
    expect(demoSources.length).toBeGreaterThan(0);
    for (const source of demoSources) {
      expect(source.assessmentId).toBe(DEMO_ID);
    }
  });

  it("has all fact assessmentIds pointing to the demo assessment", () => {
    expect(demoFacts.length).toBeGreaterThan(0);
    for (const fact of demoFacts) {
      expect(fact.assessmentId).toBe(DEMO_ID);
    }
  });

  it("has all fact sourceIds matching a known demo source", () => {
    const sourceIds = new Set(demoSources.map((s) => s.id));
    for (const fact of demoFacts) {
      expect(sourceIds.has(fact.sourceId)).toBe(true);
    }
  });

  it("has 5 truth layers with the expected keys", () => {
    expect(demoTruthLayers).toHaveLength(5);
    const keys = demoTruthLayers.map((l) => l.key);
    expect(keys).toEqual([
      "financial",
      "strategic",
      "operational",
      "process",
      "collaboration",
    ]);
  });

  it("has cockpit with metrics, risks, and opportunities", () => {
    expect(demoCockpit.metrics.length).toBeGreaterThan(0);
    expect(demoCockpit.topRisks.length).toBeGreaterThan(0);
    expect(demoCockpit.topOpportunities.length).toBeGreaterThan(0);
  });

  it("has 5 scenarios with expected keys", () => {
    expect(demoScenarios).toHaveLength(5);
    const keys = demoScenarios.map((s) => s.key);
    expect(keys).toContain("revenue_plus_10");
    expect(keys).toContain("margin_plus_10");
  });

  it("has 10 recommendations with ids", () => {
    expect(demoRecommendations).toHaveLength(10);
    for (const rec of demoRecommendations) {
      expect(rec.id).toBeTruthy();
      expect(rec.rank).toBeGreaterThanOrEqual(1);
      expect(rec.priority).toMatch(/^P[0-3]$/);
    }
  });

  it("has a phased action plan", () => {
    expect(demoPlan.length).toBeGreaterThanOrEqual(3);
    for (const phase of demoPlan) {
      expect(phase.phase).toBeTruthy();
      expect(phase.deliverables.length).toBeGreaterThan(0);
    }
  });

  it("has the expected source count", () => {
    expect(demoSources).toHaveLength(8);
  });

  it("has the expected fact count", () => {
    expect(demoFacts).toHaveLength(20);
  });
});
