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
          <div className="max-w-[1200px] mx-auto px-6 py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{assessment.enterpriseProfile.companyName}</div>
                    <div className="text-[11px] text-muted">{assessment.enterpriseProfile.industry}</div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-3 text-xs text-muted">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    <span className="font-medium">{assessment.enterpriseProfile.revenueRange}</span>
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{assessment.enterpriseProfile.employeeCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-base font-bold text-accent">{assessment.cockpit.transformationScore}</div>
                  <div className="text-[10px] text-muted uppercase">Score</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-success">{assessment.cockpit.opportunityValue}</div>
                  <div className="text-[10px] text-muted uppercase">Opportunity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-[1200px] mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
