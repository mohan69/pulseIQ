"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Loader2 } from "lucide-react";
import {
  analyzeAssessmentAction,
  type AnalyzeAssessmentActionState,
} from "@/app/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const INITIAL_ACTION_STATE: AnalyzeAssessmentActionState = {
  status: "idle",
  message: "",
};

export function AnalyzeAssessmentButton({
  assessmentId,
  modeLabel,
  persistedStatus,
  persistedError,
}: {
  assessmentId: string;
  modeLabel: string;
  persistedStatus: string;
  persistedError?: string;
}) {
  const router = useRouter();
  const action = analyzeAssessmentAction.bind(null, assessmentId);
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_ACTION_STATE,
  );
  const activelyAnalyzing =
    pending || persistedStatus === "analyzing";
  const message =
    state.message ||
    (persistedStatus === "analysis_failed" ? persistedError : undefined);

  useEffect(() => {
    if (state.status !== "idle") router.refresh();
  }, [router, state.status]);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-white">
            Mode: {modeLabel}
          </Badge>
          <Button
            type="submit"
            disabled={activelyAnalyzing}
            className="px-5"
          >
            {activelyAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {activelyAnalyzing
              ? "Analyzing..."
              : persistedStatus === "analysis_failed"
                ? "Retry Analysis"
                : "Analyze Assessment"}
          </Button>
        </div>
      </form>
      {message && (
        <p
          aria-live="polite"
          className={
            state.status === "success"
              ? "text-xs text-success"
              : "max-w-xl text-xs text-warning"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
