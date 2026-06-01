"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft, AlertTriangle } from "lucide-react";

export default function AssessmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Assessment error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="h-16 w-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-error" />
        </div>
        <h1 className="text-2xl font-bold mb-3">
          Unable to Load Assessment
        </h1>
        <p className="text-muted mb-8 leading-relaxed">
          We could not load this assessment. Please return to dashboard and try
          another demo assessment.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Return to Dashboard
            </Button>
          </Link>
          <Button onClick={() => reset()}>Try Again</Button>
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-sm text-muted">
            <Brain className="h-4 w-4" />
            <span>PulseIQ Enterprise Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
