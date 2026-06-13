import { describe, expect, it } from "vitest";
import { runAssessmentAnalysis } from "@/lib/analysis/run-analysis";
import { isPublicDomainAssessment } from "@/lib/assessment/presentation";

describe("public-domain analysis imports", () => {
  it("exports the generic helper used by run-analysis", () => {
    expect(typeof isPublicDomainAssessment).toBe("function");
    expect(typeof runAssessmentAnalysis).toBe("function");
  });
});
