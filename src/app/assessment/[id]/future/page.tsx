"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  Bot,
  Link2,
  Shield,
} from "lucide-react";

export default function FuturePage() {
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

  return (
    <AssessmentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Future Operating Model</h1>
          <p className="text-foreground-secondary mt-1">AI-augmented department vision and transformation path</p>
        </div>

        <div className="space-y-5">
          {assessment.futureModel.map((model) => (
            <div key={model.departmentId} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-accent/5 to-transparent flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent-muted flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-accent" />
                </div>
                <h3 className="font-bold text-foreground">{model.departmentName}</h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-error/20 bg-error-muted">
                    <div className="text-sm font-bold text-error mb-2 flex items-center gap-1.5">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Current State (Friction)
                    </div>
                    <p className="text-sm text-foreground-secondary leading-relaxed">{model.beforeState}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-success/20 bg-success-muted">
                    <div className="text-sm font-bold text-success mb-2 flex items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5" />
                      Future State (AI-Native)
                    </div>
                    <p className="text-sm text-foreground-secondary leading-relaxed">{model.afterState}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-background">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-lg bg-accent-muted flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <span className="text-sm font-bold text-foreground">AI Agents</span>
                    </div>
                    <div className="space-y-1.5">
                      {model.recommendedAIAgents.map((agent) => (
                        <Badge key={agent} variant="default" className="block text-center font-medium">{agent}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-lg bg-info-muted flex items-center justify-center">
                        <Link2 className="h-3.5 w-3.5 text-info" />
                      </div>
                      <span className="text-sm font-bold text-foreground">Automations</span>
                    </div>
                    <div className="space-y-1.5">
                      {model.workflowAutomations.map((auto) => (
                        <div key={auto} className="text-xs bg-info-muted text-info px-2.5 py-1.5 rounded-lg text-center font-medium">{auto}</div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-lg bg-warning-muted flex items-center justify-center">
                        <Shield className="h-3.5 w-3.5 text-warning" />
                      </div>
                      <span className="text-sm font-bold text-foreground">Governance</span>
                    </div>
                    <div className="space-y-1.5">
                      {model.governanceRecommendations.map((rec) => (
                        <div key={rec} className="text-xs bg-warning-muted text-warning px-2.5 py-1.5 rounded-lg text-center font-medium">{rec}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="h-4 w-4 text-muted" />
                    <span className="text-sm font-bold text-foreground">Integration Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {model.integrationSuggestions.map((suggestion) => (
                      <Badge key={suggestion} variant="outline" className="font-medium">{suggestion}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/assessment/${params.id}/cockpit`)} className="border-border-hover">
            <ArrowLeft className="h-4 w-4" /> Back to Cockpit
          </Button>
          <Button onClick={() => router.push(`/assessment/${params.id}/roadmap`)} className="bg-accent hover:bg-accent-hover text-white shadow-sm">
            Continue to Roadmap <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
