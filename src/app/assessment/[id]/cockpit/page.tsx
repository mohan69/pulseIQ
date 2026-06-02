"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  IndianRupee,
  Zap,
  AlertTriangle,
  Target,
  Brain,
  CheckCircle2,
} from "lucide-react";

const scoreBg = (score: number) => {
  if (score >= 70) return "from-success to-success/80";
  if (score >= 40) return "from-amber to-amber/80";
  return "from-blue to-blue/80";
};

export default function CockpitPage() {
  const params = useParams();
  const router = useRouter();
  const getAssessment = useAssessmentStore((s) => s.getAssessment);
  const assessment = getAssessment(params.id as string);

  if (!assessment) {
    return (
      <AssessmentShell>
        <div className="text-center py-20 text-muted">Assessment not found</div>
      </AssessmentShell>
    );
  }

  const { cockpit } = assessment;

  return (
    <AssessmentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Cockpit</h1>
          <p className="text-foreground-secondary mt-1">Transformation readiness and business outcomes</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 flex flex-col items-center justify-center">
            <div className={`h-32 w-32 rounded-full bg-gradient-to-br ${scoreBg(cockpit.transformationScore)} flex items-center justify-center mb-4 shadow-lg`}>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{cockpit.transformationScore}</div>
                <div className="text-xs text-white/70 uppercase mt-1">/ 100</div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-2">Transformation Readiness</h3>
            <p className="text-sm text-muted text-center mt-1 max-w-xs">
              Low score indicates high improvement opportunity, not failure.
            </p>
            <p className="text-xs text-muted text-center mt-2">{cockpit.aiAdoptionReadiness}</p>
          </div>

          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm border-t-3 border-t-success">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-success-muted flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{cockpit.opportunityValue}</div>
                  <div className="text-sm text-muted">Opportunity Value</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm border-t-3 border-t-accent">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{cockpit.quickWinsCount}</div>
                  <div className="text-sm text-muted">Quick Wins</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm border-t-3 border-t-warning">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-warning-muted flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{cockpit.highComplexityCount}</div>
                  <div className="text-sm text-muted">High Complexity</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm border-t-3 border-t-info">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-info-muted flex items-center justify-center">
                  <Target className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{cockpit.processesMapped}</div>
                  <div className="text-sm text-muted">Processes Mapped</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-error/5 to-transparent">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-error" />
                <h3 className="font-bold text-foreground">Top 5 Bottlenecks</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-2.5">
                {cockpit.topBottlenecks.map((bottleneck, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-error-muted border border-error/10">
                    <div className="h-6 w-6 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-error">{i + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{bottleneck}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-success/5 to-transparent">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="font-bold text-foreground">Top 5 Executive Actions</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-2.5">
                {cockpit.executiveActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-success-muted border border-success/10">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-success">{i + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-foreground">AI Adoption Readiness</div>
              <div className="text-sm text-foreground-secondary">{cockpit.aiAdoptionReadiness}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/assessment/${params.id}/opportunities`)} className="border-border-hover">
            <ArrowLeft className="h-4 w-4" /> Back to Opportunities
          </Button>
          <Button onClick={() => router.push(`/assessment/${params.id}/future`)} className="bg-accent hover:bg-accent-hover text-white shadow-sm">
            Continue to Future Model <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
