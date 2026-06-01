"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  TrendingUp,
  Target,
} from "lucide-react";

const phaseConfig = {
  "30_day": {
    title: "30-Day Phase",
    subtitle: "Discovery & Quick Wins",
    color: "text-accent",
    bgColor: "bg-accent-muted",
    borderColor: "border-accent/20",
  },
  "60_day": {
    title: "60-Day Phase",
    subtitle: "Workflow Implementation",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
  },
  "90_day": {
    title: "90-Day Phase",
    subtitle: "Scale & Governance",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
  },
};

export default function RoadmapPage() {
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
          <h1 className="text-2xl font-bold">30/60/90 Day Roadmap</h1>
          <p className="text-muted mt-1">
            Phased execution plan with milestones and measurable outcomes
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {assessment.roadmap.map((phase) => {
            const config = phaseConfig[phase.phase];
            return (
              <Card key={phase.phase} className={config.borderColor}>
                <CardHeader>
                  <div className={`${config.bgColor} rounded-lg p-3 mb-2`}>
                    <CardTitle className={`text-lg ${config.color}`}>
                      {config.title}
                    </CardTitle>
                    <div className="text-sm text-muted">{config.subtitle}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {phase.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-accent-muted flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {milestone.title}
                            </h4>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted">
                                <Users className="h-3 w-3" />
                                {milestone.ownerFunction}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted">
                                <Target className="h-3 w-3" />
                                {milestone.expectedOutcome}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-accent font-medium">
                                <TrendingUp className="h-3 w-3" />
                                {milestone.measurableKPI}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium">Pilot Scope Recommendation</div>
                <div className="text-sm text-muted">
                  Start with the 30-day quick wins phase to demonstrate
                  immediate value. This builds stakeholder confidence for the
                  full 90-day transformation program.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessment/${params.id}/future`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Future Model
          </Button>
          <Button
            onClick={() => router.push(`/assessment/${params.id}/report`)}
          >
            View Print Report
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
