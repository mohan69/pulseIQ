import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AssessmentCardFinancialSummary } from "@/app/app/assessments/page";
import type { Assessment } from "@/lib/assessment/types";

function assessment(
  id: string,
  companyName: string,
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
    createdAt: "2026-06-13T00:00:00.000Z",
    updatedAt: "2026-06-13T00:00:00.000Z",
  };
}

describe("assessment card financial presentation", () => {
  it("masks numeric targets for public-domain assessments", () => {
    const markup = renderToStaticMarkup(
      createElement(AssessmentCardFinancialSummary, {
        assessment: assessment(
          "decon",
          "DECON Technologies Public-Domain Sample Diagnostic",
        ),
      }),
    );

    expect(markup).toContain("Public-domain sample");
    expect(markup).toContain(
      "Financial baseline requires internal validation",
    );
    expect(markup).toContain("No internal financial data used");
    expect(markup).not.toContain("Revenue target");
    expect(markup).not.toContain("Margin target");
    expect(markup).not.toContain("Cash target");
    expect(markup).not.toContain("26%");
  });

  it("retains Bharat targets only with seeded demo labeling", () => {
    const markup = renderToStaticMarkup(
      createElement(AssessmentCardFinancialSummary, {
        assessment: assessment(
          "asm-bharat-heavy-fabrications",
          "Bharat Heavy Fabrications",
        ),
      }),
    );

    expect(markup).toContain("Seeded internal demo");
    expect(markup).toContain("Financial targets are seeded demo assumptions.");
    expect(markup).toContain("Revenue target");
  });
});
