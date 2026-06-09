"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteAssessmentAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";

const CONFIRMATION =
  "Delete this assessment and all related sources, facts, outputs, and reports? This cannot be undone.";

export function DeleteAssessmentButton({
  assessmentId,
  assessmentName,
  protected: isProtected,
}: {
  assessmentId: string;
  assessmentName: string;
  protected: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (isProtected) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        title="Protected demo assessment"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Protected demo assessment
      </Button>
    );
  }

  function handleDelete() {
    setError("");
    if (!window.confirm(CONFIRMATION)) return;
    startTransition(async () => {
      const result = await deleteAssessmentAction(assessmentId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/app/assessments");
      router.refresh();
    });
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={handleDelete}
        aria-label={`Delete ${assessmentName}`}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        {pending ? "Deleting..." : "Delete"}
      </Button>
      {error && (
        <p className="max-w-64 text-xs text-error" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
