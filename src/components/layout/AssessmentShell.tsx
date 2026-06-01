"use client";

import { usePathname } from "next/navigation";
import { StepProgress } from "@/components/layout/StepProgress";

export function AssessmentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("assessment") + 1;
  const assessmentId = segments[idIndex] || "";

  return (
    <div className="min-h-screen bg-background">
      <StepProgress assessmentId={assessmentId} />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
