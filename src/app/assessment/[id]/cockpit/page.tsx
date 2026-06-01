"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const scoreColor = (score: number) => {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-error";
};

const scoreBg = (score: number) => {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-error";
};

export default function CockpitPage() {
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

  const { cockpit } = assessment;

  return (
    <AssessmentShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Executive Cockpit</h1>
          <p className="text-muted mt-1">
            Transformation readiness and business outcomes
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-8">
              <div className="flex flex-col items-center">
                <div
                  className={`h-32 w-32 rounded-full ${scoreBg(
                    cockpit.transformationScore
                  )}/10 flex items-center justify-center mb-4`}
                >
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold ${scoreColor(
                        cockpit.transformationScore
                      )}`}
                    >
                      {cockpit.transformationScore}
                    </div>
                    <div className="text-xs text-muted">/ 100</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Transformation Score</h3>
                <p className="text-sm text-muted text-center mt-1">
                  {cockpit.aiAdoptionReadiness}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {cockpit.opportunityValue}
                  </div>
                  <div className="text-sm text-muted">Opportunity Value</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent-muted flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {cockpit.quickWinsCount}
                  </div>
                  <div className="text-sm text-muted">Quick Wins</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {cockpit.highComplexityCount}
                  </div>
                  <div className="text-sm text-muted">High Complexity</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {cockpit.processesMapped}
                  </div>
                  <div className="text-sm text-muted">Processes Mapped</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-error" />
                Top 5 Bottlenecks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cockpit.topBottlenecks.map((bottleneck, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-error/5 border border-error/10"
                  >
                    <div className="h-6 w-6 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-error">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-sm">{bottleneck}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Top 5 Executive Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cockpit.executiveActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10"
                  >
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-success">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium">AI Adoption Readiness</div>
                <div className="text-sm text-muted">
                  {cockpit.aiAdoptionReadiness}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/assessment/${params.id}/opportunities`)
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Button>
          <Button
            onClick={() => router.push(`/assessment/${params.id}/future`)}
          >
            Continue to Future Model
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
