import { Brain, Loader2 } from "lucide-react";
import { analyzeAssessmentAction } from "@/app/app/actions";
import { resolveAIEngineConfig } from "@/lib/ai";
import type { Assessment } from "@/lib/assessment/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AnalyzeAssessmentForm({
  assessment,
}: {
  assessment: Assessment;
}) {
  const config = resolveAIEngineConfig();
  const isAnalyzing = assessment.status === "analyzing";
  const modeLabel =
    config.provider === "openrouter"
      ? "OpenRouter"
      : config.provider === "openai"
        ? "OpenAI"
        : "Mock";

  return (
    <form action={analyzeAssessmentAction.bind(null, assessment.id)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-white">
          Mode: {modeLabel}
        </Badge>
        <Button type="submit" disabled={isAnalyzing} className="px-5">
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {isAnalyzing ? "Analyzing" : "Analyze Assessment"}
        </Button>
      </div>
    </form>
  );
}
