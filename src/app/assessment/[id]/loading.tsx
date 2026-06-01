import { Brain } from "lucide-react";

export default function AssessmentLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="relative h-16 w-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-accent/10 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="h-8 w-8 text-accent animate-pulse" />
          </div>
        </div>
        <h1 className="text-lg font-semibold mb-2">
          Preparing enterprise intelligence view…
        </h1>
        <p className="text-sm text-muted">
          Analyzing operating model and generating insights
        </p>
      </div>
    </div>
  );
}
