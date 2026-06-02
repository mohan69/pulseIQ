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
        <>
          {/* Dark Navy Grid Banner for Assessment Context */}
          <section className="dark-grid-banner relative overflow-hidden">
            <div className="hero-glow absolute inset-0" />
            <div className="max-w-[1200px] mx-auto px-8 py-6">
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-6 min-w-0">
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xl font-bold text-white truncate">{assessment.enterpriseProfile.companyName}</div>
                      <div className="text-lg text-white/90">{assessment.enterpriseProfile.industry}</div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-5 text-white/90">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      <span className="font-medium">{assessment.enterpriseProfile.revenueRange}</span>
                    </div>
                    <div className="w-px h-5 bg-white/20" />
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{assessment.enterpriseProfile.employeeCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{assessment.cockpit.transformationScore}</div>
                    <div className="text-sm text-white/70 uppercase">Readiness</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{assessment.cockpit.opportunityValue}</div>
                    <div className="text-sm text-white/70 uppercase">Opportunity</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Optional separator */}
          <div className="border-t border-border/20"></div>
        </>
      )}
      <main className="max-w-[1200px] mx-auto px-8 py-8">{children}</main>
    </div>
  );
}
