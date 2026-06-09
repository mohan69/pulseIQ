import { resolveAIEngineConfig } from "@/lib/ai";
import { getAnalysisState } from "@/lib/assessment/store";
import type { Assessment } from "@/lib/assessment/types";
import { AnalyzeAssessmentButton } from "./AnalyzeAssessmentButton";

export async function AnalyzeAssessmentForm({
  assessment,
}: {
  assessment: Assessment;
}) {
  const config = resolveAIEngineConfig();
  const analysisState = await getAnalysisState(assessment.id);
  const modeLabel =
    config.provider === "openrouter"
      ? "OpenRouter"
      : config.provider === "openai"
        ? "OpenAI"
        : "Mock";
  return (
    <AnalyzeAssessmentButton
      assessmentId={assessment.id}
      modeLabel={modeLabel}
      persistedStatus={analysisState.status}
      persistedError={analysisState.error}
    />
  );
}
