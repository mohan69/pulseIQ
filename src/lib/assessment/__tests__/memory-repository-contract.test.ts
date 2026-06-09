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

  it("deletes a user assessment and all related records", async () => {
    const assessment = await memoryAssessmentRepository.createAssessment({
      companyName: "Deletion Contract Test",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 20_000_000,
      marginTarget: 22,
      cashTarget: 3_000_000,
      headcountProductivityTarget: 800_000,
    });
    const source = await memoryAssessmentRepository.addSource(assessment.id, {
      name: "Deletion source",
      type: "operations_report",
      extractionStatus: "extracted",
      fileName: "deletion.txt",
    });
    await memoryAssessmentRepository.addSourceDocument(source!.id, {
      kind: "text",
      content: "Revenue: ₹2 Cr",
    });
    await memoryAssessmentRepository.addFacts(assessment.id, source!.id, [
      {
        kind: "revenue",
        label: "Revenue",
        value: "₹2 Cr",
        numericValue: 20_000_000,
        unit: "₹",
        evidence: "Revenue: ₹2 Cr",
        confidence: "high",
      },
    ]);
    await memoryAssessmentRepository.setRecommendations(assessment.id, [
      {
        id: "rec-delete-test",
        rank: 1,
        title: "Deletion test",
        description: "Temporary output",
        priority: "P2",
        businessImpact: "Test only",
        effort: "low",
        timeframeDays: 1,
        ownerRole: "Tester",
        evidence: "Test",
        confidence: "high",
      },
    ]);

    expect(await memoryAssessmentRepository.deleteAssessment(assessment.id)).toBe(
      true,
    );
    expect(await memoryAssessmentRepository.getAssessment(assessment.id)).toBe(
      undefined,
    );
    expect(await memoryAssessmentRepository.getSources(assessment.id)).toEqual(
      [],
    );
    expect(
      await memoryAssessmentRepository.getSourceDocuments(source!.id),
    ).toEqual([]);
    expect(await memoryAssessmentRepository.getFacts(assessment.id)).toEqual([]);
    expect(
      await memoryAssessmentRepository.getRecommendations(assessment.id),
    ).toEqual([]);
    expect(
      (await memoryAssessmentRepository.listAssessments()).some(
        (item) => item.id === assessment.id,
      ),
    ).toBe(false);
  });

  it("protects the Bharat Heavy Fabrications demo from deletion", async () => {
    expect(
      await memoryAssessmentRepository.deleteAssessment(
        "asm-bharat-heavy-fabrications",
      ),
    ).toBe(false);
    expect(
      await memoryAssessmentRepository.getAssessment(
        "asm-bharat-heavy-fabrications",
      ),
    ).toBeTruthy();
  });
});
