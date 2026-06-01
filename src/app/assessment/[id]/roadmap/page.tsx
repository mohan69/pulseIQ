"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  TrendingUp,
  Target,
  Lightbulb,
} from "lucide-react";

const phaseConfig = {
  "30_day": {
    title: "30-Day Phase",
    subtitle: "Discovery & Quick Wins",
    color: "accent",
    gradient: "from-accent to-accent/80",
  },
  "60_day": {
    title: "60-Day Phase",
    subtitle: "Workflow Implementation",
    color: "warning",
    gradient: "from-warning to-warning/80",
  },
  "90_day": {
    title: "90-Day Phase",
    subtitle: "Scale & Governance",
    color: "success",
    gradient: "from-success to-success/80",
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">30/60/90 Day Roadmap</h1>
          <p className="text-foreground-secondary mt-2 text-lg">
            Phased execution plan with milestones and measurable outcomes
          </p>
        </div>

        {/* Pilot Scope */}
        <div className="rounded-xl bg-gradient-to-r from-navy/5 to-accent/5 border border-border p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center shrink-0">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="font-bold text-foreground">Pilot Scope Recommendation</div>
              <div className="text-sm text-foreground-secondary mt-1">
                Start with the 30-day quick wins phase to demonstrate immediate value. This builds stakeholder confidence for the full 90-day transformation program.
              </div>
            </div>
          </div>
        </div>

        {/* Phase Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {assessment.roadmap.map((phase) => {
            const config = phaseConfig[phase.phase];
            return (
              <div key={phase.phase} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Phase Header */}
                <div className={`bg-gradient-to-br ${config.gradient} p-6`}>
                  <div className="text-white">
                    <div className="text-xl font-bold">{config.title}</div>
                    <div className="text-white/70 text-sm mt-1">{config.subtitle}</div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="p-6 space-y-4">
                  {phase.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="border border-border rounded-xl p-4 hover:border-border-hover transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-accent-muted flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-sm">
                            {milestone.title}
                          </h4>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted">
                              <Users className="h-3 w-3" />
                              <span className="font-medium">{milestone.ownerFunction}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted">
                              <Target className="h-3 w-3" />
                              <span className="font-medium">{milestone.expectedOutcome}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-accent font-semibold">
                              <TrendingUp className="h-3 w-3" />
                              {milestone.measurableKPI}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessment/${params.id}/future`)}
            className="border-border-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Future Model
          </Button>
          <Button
            onClick={() => router.push(`/assessment/${params.id}/report`)}
            className="bg-accent hover:bg-accent-hover text-white shadow-sm"
          >
            View Print Report
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
