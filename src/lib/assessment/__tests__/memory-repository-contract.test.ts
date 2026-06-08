import { describe, expect, it } from "vitest";
import { memoryAssessmentRepository } from "@/lib/assessment/memory-repository";

describe("memory assessment repository contract", () => {
  it("creates an assessment with empty workbench outputs", async () => {
    const assessment = await memoryAssessmentRepository.createAssessment({
      companyName: "Contract Test Manufacturing Pvt Ltd",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 100_000_000,
      marginTarget: 20,
      cashTarget: 10_000_000,
      headcountProductivityTarget: 1_000_000,
    });

    expect(assessment.id).toMatch(/^asm-/);
    expect(assessment.status).toBe("draft");
    expect(await memoryAssessmentRepository.getSources(assessment.id)).toHaveLength(0);
    expect(await memoryAssessmentRepository.getFacts(assessment.id)).toHaveLength(0);
    expect(
      await memoryAssessmentRepository.getTruthLayers(assessment.id),
    ).toHaveLength(5);
    expect(await memoryAssessmentRepository.getScenarios(assessment.id)).toHaveLength(0);
    expect(
      await memoryAssessmentRepository.getRecommendations(assessment.id),
    ).toHaveLength(0);
  });

  it("registers sources and updates assessment status", async () => {
    const assessment = await memoryAssessmentRepository.createAssessment({
      companyName: "Contract Test Valves Pvt Ltd",
      industry: "valve_manufacturer",
      objective: "margin_improvement",
      revenueTarget: 50_000_000,
      marginTarget: 24,
      cashTarget: 8_000_000,
      headcountProductivityTarget: 900_000,
    });

    const source = await memoryAssessmentRepository.addSource(assessment.id, {
      name: "FY25 Trial Balance",
      type: "erp_export",
      notes: "Contract test source",
    });
    const updated = await memoryAssessmentRepository.updateAssessmentStatus(
      assessment.id,
      "analysis",
    );

    expect(source?.assessmentId).toBe(assessment.id);
    expect(source?.status).toBe("registered");
    expect(updated?.status).toBe("analysis");
  });
});
