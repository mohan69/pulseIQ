"use client";

import { usePathname } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { StepProgress } from "@/components/layout/StepProgress";
import { Building2, Users, IndianRupee } from "lucide-react";

export function AssessmentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("assessment") + 1;
  const assessmentId = segments[idIndex] || "";
  const getAssessment = useAssessmentStore((s) => s.getAssessment);
  const assessment = getAssessment(assessmentId);

  return (
    <div className="min-h-screen">
      <StepProgress assessmentId={assessmentId} />
      {assessment && (
        <div className="bg-white border-b border-border">
          <div className="max-w-[1200px] mx-auto px-8 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-5 min-w-0">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
                    <Building2 className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-foreground truncate">{assessment.enterpriseProfile.companyName}</div>
                    <div className="text-sm text-muted">{assessment.enterpriseProfile.industry}</div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4 text-sm text-muted">
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span className="font-medium">{assessment.enterpriseProfile.revenueRange}</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium">{assessment.enterpriseProfile.employeeCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right">
                  <div className="text-xl font-bold text-accent">{assessment.cockpit.transformationScore}</div>
                  <div className="text-sm text-muted uppercase">Score</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-success">{assessment.cockpit.opportunityValue}</div>
                  <div className="text-sm text-muted uppercase">Opportunity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-[1200px] mx-auto px-8 py-8">{children}</main>
    </div>
  );
}
