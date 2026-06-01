"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Users,
  AlertTriangle,
  ArrowLeftRight,
  Layers,
} from "lucide-react";

export default function ModelPage() {
  const params = useParams();
  const router = useRouter();
  const getAssessment = useAssessmentStore((s) => s.getAssessment);
  const assessment = getAssessment(params.id as string);

  if (!assessment) {
    return (
      <AssessmentShell>
        <div className="text-center py-20 text-muted">
          Assessment not found
        </div>
      </AssessmentShell>
    );
  }

  return (
    <AssessmentShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Operating Model Mapper</h1>
          <p className="text-foreground-secondary mt-2 text-lg">
            Departments, processes, systems, and handoffs
          </p>
        </div>

        {/* Outcome Banner */}
        <div className="rounded-xl bg-gradient-to-r from-navy/5 to-accent/5 border border-border p-5">
          <div className="text-sm font-semibold text-foreground mb-1">Operating Complexity Assessment</div>
          <div className="text-sm text-foreground-secondary">
            Current operating complexity creates visibility gaps, manual effort, and delayed decisions across {assessment.departments.length} departments with {assessment.cockpit.processesMapped} mapped processes.
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 shadow-xs">
            <div className="h-11 w-11 rounded-xl bg-accent-muted flex items-center justify-center shrink-0">
              <GitBranch className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{assessment.departments.length}</div>
              <div className="text-sm text-muted">Departments Mapped</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 shadow-xs">
            <div className="h-11 w-11 rounded-xl bg-warning-muted flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{assessment.cockpit.processesMapped}</div>
              <div className="text-sm text-muted">Processes Mapped</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 shadow-xs">
            <div className="h-11 w-11 rounded-xl bg-error-muted flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{assessment.cockpit.topBottlenecks.length}</div>
              <div className="text-sm text-muted">Bottlenecks Found</div>
            </div>
          </div>
        </div>

        {/* Department Cards */}
        <div className="space-y-6">
          {assessment.departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-accent/5 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-accent-muted flex items-center justify-center">
                    <Layers className="h-4.5 w-4.5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{dept.name}</h3>
                    <div className="text-xs text-muted">{dept.processes.length} processes · {dept.headCount} people</div>
                  </div>
                </div>
                <Badge variant="outline" className="font-medium">{dept.headCount} people</Badge>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dept.processes.map((process) => (
                    <div
                      key={process.id}
                      className="border border-border rounded-xl p-5 hover:border-border-hover transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-foreground">{process.name}</h4>
                        <Badge
                          variant={
                            process.manualWorkPercent > 70
                              ? "destructive"
                              : process.manualWorkPercent > 40
                                ? "warning"
                                : "success"
                          }
                          className="font-medium"
                        >
                          {process.manualWorkPercent}% manual
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted mb-2 flex items-center gap-1 font-medium">
                            <Layers className="h-3 w-3" />
                            <span>Systems Used</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {process.systemsUsed.map((sys) => (
                              <Badge key={sys} variant="outline" className="text-xs font-medium">
                                {sys}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted mb-2 flex items-center gap-1 font-medium">
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>Handoffs</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {process.handoffs.map((h) => (
                              <Badge key={h} variant="info" className="text-xs font-medium">
                                {h}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted mb-2 font-medium">Risks</div>
                          <div className="space-y-1.5">
                            {process.risks.map((risk) => (
                              <div
                                key={risk}
                                className="text-xs text-error bg-error-muted px-2.5 py-1 rounded-lg font-medium"
                              >
                                {risk}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted mb-2 font-medium">Reporting Pain Points</div>
                          <div className="space-y-1.5">
                            {process.reportingPainPoints.map((pain) => (
                              <div
                                key={pain}
                                className="text-xs text-warning bg-warning-muted px-2.5 py-1 rounded-lg font-medium"
                              >
                                {pain}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-subtle">
                        <div className="text-xs text-muted font-medium">
                          Dependencies:{" "}
                          {process.dependencies.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessment/${params.id}/intake`)}
            className="border-border-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Intake
          </Button>
          <Button
            onClick={() => router.push(`/assessment/${params.id}/opportunities`)}
            className="bg-accent hover:bg-accent-hover text-white shadow-sm"
          >
            Continue to Opportunities
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
