import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, redirect } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import { deleteAssessmentAction } from "@/app/app/actions";
import {
  createAssessment,
  getAssessment,
} from "@/lib/assessment/store";

describe("deleteAssessmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PULSEIQ_DATA_MODE", "memory");
  });

  it("returns a safe error for a missing assessment", async () => {
    await expect(deleteAssessmentAction("asm-missing")).resolves.toEqual({
      ok: false,
      message: "Assessment was not found.",
    });
  });

  it("blocks deletion of the protected demo assessment", async () => {
    const result = await deleteAssessmentAction(
      "asm-bharat-heavy-fabrications",
    );

    expect(result).toEqual({
      ok: false,
      message: "Protected demo assessment cannot be deleted.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("deletes a user-created assessment and revalidates list pages", async () => {
    const assessment = await createAssessment({
      companyName: "Action Deletion Test",
      industry: "industrial_manufacturing",
      objective: "board_review",
      revenueTarget: 20_000_000,
      marginTarget: 20,
      cashTarget: 2_000_000,
      headcountProductivityTarget: 800_000,
    });

    await expect(deleteAssessmentAction(assessment.id)).resolves.toEqual({
      ok: true,
      message: "Assessment deleted.",
    });
    expect(await getAssessment(assessment.id)).toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith("/app");
    expect(revalidatePath).toHaveBeenCalledWith("/app/assessments");
    expect(revalidatePath).toHaveBeenCalledWith("/app/sources");
  });
});
