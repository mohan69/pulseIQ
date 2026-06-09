import { describe, expect, it } from "vitest";
import {
  MICROFINISH_DISCLAIMER,
  presentCockpit,
  presentRecommendations,
  presentReport,
  presentScenarios,
} from "@/lib/assessment/presentation";
import type {
  Assessment,
  Cockpit,
  Recommendation,
  Report,
  Scenario,
} from "@/lib/assessment/types";

const assessment: Assessment = {
  id: "asm-microfinish-presentation",
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

const cockpit: Cockpit = {
  metrics: [
    {
      key: "cash",
      label: "Cash Generation",
      value: 0,
      target: 0,
      unit: "₹",
      status: "off_track",
      note: "Risk gap +₹0",
    },
    {
      key: "productivity",
      label: "Productivity (Revenue per Employee)",
      value: 2_954_545,
      target: 10_000_000,
      unit: "₹/employee",
      status: "off_track",
      note: "Estimated from public headcount.",
    },
  ],
  topRisks: [],
  topOpportunities: [],
};

describe("Microfinish public-domain presentation", () => {
  it("replaces zero and estimated cockpit metrics with internal-data framing", () => {
    const result = presentCockpit(assessment, cockpit);

    expect(result.metrics[0]).toMatchObject({
      label: "Working capital visibility",
      note: expect.stringContaining("AR, AP, inventory"),
    });
    expect(result.metrics[1]).toMatchObject({
      label: "Revenue per employee / productivity",
      value: 0,
      target: 0,
      note: expect.stringContaining("Requires confirmed headcount"),
    });
  });

  it("returns ten distinct, diversified recommendations", () => {
    const result = presentRecommendations(assessment, []);
    const titles = result.map((recommendation) => recommendation.title);

    expect(result).toHaveLength(10);
    expect(new Set(titles).size).toBe(10);
    expect(titles).toContain("Build a quote and proposal register");
    expect(titles).toContain(
      "Run a 48-hour internal diagnostic using read-only exports",
    );
  });

  it("uses respectful scenarios and realistic margin improvement", () => {
    const result = presentScenarios(assessment, []);
    const text = JSON.stringify(result);
    const margin = result.find((scenario) => scenario.key === "margin_plus_10");
    const productivity = result.find(
      (scenario) => scenario.key === "headcount_minus_15",
    );

    expect(result).toHaveLength(5);
    expect(text).not.toContain("Reduce headcount by 15%");
    expect(productivity?.label).toContain("without headcount reduction");
    expect(margin?.label).toContain("2–3 percentage points");
    expect(margin?.target).toContain("24–25%");
  });

  it("strengthens report framing without changing unrelated assessments", () => {
    const report = makeReport(cockpit, [], []);
    const shaped = presentReport(assessment, report);
    const otherAssessment = { ...assessment, companyName: "Other Company" };

    expect(shaped?.executiveSummary).toContain(MICROFINISH_DISCLAIMER);
    expect(presentCockpit(otherAssessment, cockpit)).toBe(cockpit);
    expect(presentScenarios(otherAssessment, report.scenarios)).toBe(
      report.scenarios,
    );
    expect(
      presentRecommendations(otherAssessment, report.recommendations),
    ).toBe(report.recommendations);
  });
});

function makeReport(
  reportCockpit: Cockpit,
  scenarios: Scenario[],
  recommendations: Recommendation[],
): Report {
  return {
    assessmentId: assessment.id,
    generatedAt: assessment.updatedAt,
    executiveSummary: "Original generated summary.",
    sourceCount: 6,
    factCount: 75,
    truthLayers: [],
    cockpit: reportCockpit,
    scenarios,
    recommendations,
    plan: [],
    dataGaps: [],
  };
}
