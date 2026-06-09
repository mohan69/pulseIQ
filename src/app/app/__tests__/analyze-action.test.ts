import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, runAssessmentAnalysis } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  runAssessmentAnalysis: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/analysis/run-analysis", () => ({ runAssessmentAnalysis }));

import { analyzeAssessmentAction } from "@/app/app/actions";

describe("analyzeAssessmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a visible success and revalidates assessment pages", async () => {
    runAssessmentAnalysis.mockResolvedValue({
      ok: true,
      assessmentId: "asm-test",
      provider: "mock",
      factsAdded: 2,
      sourcesAnalyzed: 1,
      message: "Analysis ready.",
    });

    const result = await analyzeAssessmentAction("asm-test", {
      status: "idle",
      message: "",
    });

    expect(result).toEqual({
      status: "success",
      message: "Analysis ready.",
    });
    expect(revalidatePath).toHaveBeenCalledWith(
      "/app/assessments/asm-test/sources",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/app/assessments/asm-test/report",
    );
  });

  it("returns a visible provider failure", async () => {
    runAssessmentAnalysis.mockResolvedValue({
      ok: false,
      assessmentId: "asm-test",
      provider: "openrouter",
      factsAdded: 0,
      sourcesAnalyzed: 0,
      message: "OpenRouter analysis failed: invalid output.",
    });

    const result = await analyzeAssessmentAction("asm-test", {
      status: "idle",
      message: "",
    });

    expect(result).toEqual({
      status: "error",
      message: "OpenRouter analysis failed: invalid output.",
    });
  });
});
