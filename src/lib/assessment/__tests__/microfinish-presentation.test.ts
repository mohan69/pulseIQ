import { describe, expect, it } from "vitest";
import {
  isMicrofinishPublicDomain,
  isPublicDomainAssessment,
  MICROFINISH_DISCLAIMER,
  presentCockpit,
  presentRecommendations,
  presentReport,
  presentScenarios,
  presentTruthLayers,
} from "@/lib/assessment/presentation";
import type {
  Assessment,
  Cockpit,
  Recommendation,
  Report,
  Scenario,
  TruthLayer,
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
  it("identifies public-domain samples without classifying the protected demo", () => {
    const deconAssessment: Assessment = {
      ...assessment,
      id: "asm-decon-public-domain",
      companyName: "DECON Technologies Public-Domain Sample Diagnostic",
    };
    const spacedPublicDomain: Assessment = {
      ...assessment,
      id: "asm-public-domain-spaced",
      companyName: "Example Public Domain Assessment",
    };
    const bharatAssessment: Assessment = {
      ...assessment,
      id: "asm-bharat-heavy-fabrications",
      companyName: "Bharat Heavy Fabrications",
    };
    const prospectAssessment: Assessment = {
      ...assessment,
      id: "asm-prospect",
      companyName: "Example Prospect Diagnostic",
    };

    expect(isMicrofinishPublicDomain(assessment)).toBe(true);
    expect(isPublicDomainAssessment(assessment)).toBe(true);
    expect(isPublicDomainAssessment(deconAssessment)).toBe(true);
    expect(isPublicDomainAssessment(spacedPublicDomain)).toBe(true);
    expect(isPublicDomainAssessment(bharatAssessment)).toBe(false);
    expect(isPublicDomainAssessment(prospectAssessment)).toBe(true);
    expect(isMicrofinishPublicDomain(deconAssessment)).toBe(false);
  });

  it("replaces zero and estimated cockpit metrics with internal-data framing", () => {
    const result = presentCockpit(assessment, {
      ...cockpit,
      metrics: [
        {
          key: "revenue",
          label: "Revenue signal",
          value: 5_660_000_000,
          target: 6_500_000_000,
          unit: "₹",
          status: "on_track",
          note: "High confidence public signal.",
        },
        {
          key: "margin",
          label: "Margin signal",
          value: 22,
          target: 25,
          unit: "%",
          status: "on_track",
          note: "Public margin estimate.",
        },
        ...cockpit.metrics,
      ],
    });

    expect(result.metrics[0]).toMatchObject({
      label: "Revenue actual",
      value: 0,
      target: 0,
      note: expect.stringContaining("Requires internal validation"),
    });
    expect(result.metrics[1]).toMatchObject({
      label: "Margin actual",
      value: 0,
      target: 0,
    });
    expect(result.metrics[2]).toMatchObject({
      label: "Working capital visibility",
      note: expect.stringContaining("AR, AP, inventory"),
    });
    expect(result.metrics[3]).toMatchObject({
      label: "Revenue per employee / productivity",
      value: 0,
      target: 0,
      note: expect.stringContaining("Requires internal data"),
    });
    expect(result.topOpportunities[0]?.impactInr).toBe(0);
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

  it("uses non-numeric, low-confidence public-domain scenarios", () => {
    const result = presentScenarios(assessment, []);
    const text = JSON.stringify(result);
    const productivity = result.find(
      (scenario) => scenario.key === "headcount_minus_15",
    );

    expect(result).toHaveLength(5);
    expect(text).not.toContain("Reduce headcount by 15%");
    expect(text).not.toMatch(/₹\s*[\d,.]+|\b\d+(?:\.\d+)?%/);
    expect(productivity?.label).toContain("without assumed workforce action");
    expect(result.every((scenario) => scenario.confidence === "low")).toBe(
      true,
    );
  });

  it("masks public financial truth and confidence", () => {
    const layers: TruthLayer[] = [
      {
        key: "financial",
        title: "Financial Truth",
        description: "Revenue ₹566Cr with high confidence and margin 22%.",
        findings: [
          {
            id: "finding-1",
            text: "Profit ₹40Cr and order book ₹120Cr.",
            impact: "high",
            factIds: [],
          },
        ],
        evidence: [],
        confidence: "high",
        gaps: [],
        contradictions: [],
      },
    ];
    const result = presentTruthLayers(assessment, layers);
    const text = JSON.stringify(result);

    expect(result[0]?.confidence).toBe("low");
    expect(text).not.toMatch(/₹566Cr|₹40Cr|₹120Cr|high confidence/i);
    expect(text).toContain("Requires internal validation");
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
