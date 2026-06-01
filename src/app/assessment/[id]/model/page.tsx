"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Users,
  AlertTriangle,
  ArrowLeftRight,
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
          <h1 className="text-2xl font-bold">Operating Model Mapper</h1>
          <p className="text-muted mt-1">
            Departments, processes, systems, and handoffs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent-muted flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {assessment.departments.length}
                </div>
                <div className="text-sm text-muted">Departments Mapped</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {assessment.cockpit.processesMapped}
                </div>
                <div className="text-sm text-muted">Processes Mapped</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-error/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-error" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {assessment.cockpit.topBottlenecks.length}
                </div>
                <div className="text-sm text-muted">Bottlenecks Found</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {assessment.departments.map((dept) => (
            <Card key={dept.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{dept.name}</CardTitle>
                  <Badge variant="outline">
                    {dept.headCount} people
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dept.processes.map((process) => (
                    <div
                      key={process.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{process.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              process.manualWorkPercent > 70
                                ? "destructive"
                                : process.manualWorkPercent > 40
                                  ? "warning"
                                  : "success"
                            }
                          >
                            {process.manualWorkPercent}% manual
                          </Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted mb-1 flex items-center gap-1">
                            <span>Systems Used</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {process.systemsUsed.map((sys) => (
                              <Badge key={sys} variant="outline" className="text-xs">
                                {sys}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted mb-1 flex items-center gap-1">
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>Handoffs</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {process.handoffs.map((h) => (
                              <Badge key={h} variant="info" className="text-xs">
                                {h}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted mb-1">Risks</div>
                          <div className="space-y-1">
                            {process.risks.map((risk) => (
                              <div
                                key={risk}
                                className="text-xs text-error bg-error/5 px-2 py-1 rounded"
                              >
                                {risk}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted mb-1">Reporting Pain Points</div>
                          <div className="space-y-1">
                            {process.reportingPainPoints.map((pain) => (
                              <div
                                key={pain}
                                className="text-xs text-warning bg-warning/5 px-2 py-1 rounded"
                              >
                                {pain}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-xs text-muted">
                          Dependencies:{" "}
                          {process.dependencies.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessment/${params.id}/intake`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Intake
          </Button>
          <Button
            onClick={() =>
              router.push(`/assessment/${params.id}/opportunities`)
            }
          >
            Continue to Opportunities
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
