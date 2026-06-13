import { describe, expect, it } from "vitest";
import {
  assessmentCardPresentation,
  dashboardAssessmentSummary,
} from "@/lib/assessment/list-presentation";
import type { Assessment } from "@/lib/assessment/types";

const featuredNames = [
  "DECON Technologies Public-Domain Sample Diagnostic",
  "IMI CCI / IMI Critical Engineering India Public-Domain Sample Diagnostic",
  "Bray Controls India / Bray India Public-Domain Sample Diagnostic",
  "Microfinish Group / Microfinish Valves / Microfinish Pumps Public-Domain Sample Diagnostic",
];

function assessment(
  id: string,
  companyName: string,
  updatedAt = "2026-06-13T00:00:00.000Z",
): Assessment {
  return {
    id,
    companyName,
    industry: "industrial_manufacturing",
    objective: "board_review",
    revenueTarget: 150_000_000,
    marginTarget: 26,
    cashTarget: 25_000_000,
    headcountProductivityTarget: 5_000_000,
    status: "analysis_ready",
    createdAt: updatedAt,
    updatedAt,
  };
}

describe("assessment list presentation", () => {
  it("counts every visible assessment and features public diagnostics in the expected order", () => {
    const assessments = [
      assessment("bharat", "Bharat Heavy Fabrications", "2026-06-13T10:00:00.000Z"),
      assessment("microfinish", featuredNames[3]),
      assessment("bray", featuredNames[2]),
      assessment("decon", featuredNames[0]),
      assessment("imi", featuredNames[1]),
    ];

    const summary = dashboardAssessmentSummary(assessments);

    expect(summary.visibleCount).toBe(5);
    expect(summary.featured.map((item) => item.companyName)).toEqual(
      featuredNames,
    );
  });

  it("marks public-domain cards as requiring internal financial validation", () => {
    expect(
      assessmentCardPresentation(assessment("decon", featuredNames[0])),
    ).toEqual({
      kind: "public-domain",
      label: "Public-domain sample",
      description:
        "Financial baseline requires internal validation. No internal financial data used.",
    });
  });

  it("labels Bharat as seeded internal-demo content", () => {
    expect(
      assessmentCardPresentation(
        assessment(
          "asm-bharat-heavy-fabrications",
          "Bharat Heavy Fabrications",
        ),
      ),
    ).toEqual({
      kind: "internal-demo",
      label: "Seeded internal demo",
      description: "Financial targets are seeded demo assumptions.",
    });
  });
});
