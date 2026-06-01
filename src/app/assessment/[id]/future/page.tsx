"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <h1 className="text-2xl font-bold">Future Operating Model</h1>
          <p className="text-muted mt-1">
            AI-augmented department vision and transformation path
          </p>
        </div>

        <div className="space-y-6">
          {assessment.futureModel.map((model) => (
            <Card key={model.departmentId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-accent" />
                  {model.departmentName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-error/20 bg-error-muted">
                    <div className="text-sm font-medium text-error mb-2 flex items-center gap-1">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Current State
                    </div>
                    <p className="text-sm">{model.beforeState}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-success/20 bg-success-muted">
                    <div className="text-sm font-medium text-success mb-2 flex items-center gap-1">
                      <ArrowRight className="h-3.5 w-3.5" />
                      Future State
                    </div>
                    <p className="text-sm">{model.afterState}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">Recommended AI Agents</span>
                    </div>
                    <div className="space-y-1">
                      {model.recommendedAIAgents.map((agent) => (
                        <Badge key={agent} variant="default" className="block text-center">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="h-4 w-4 text-info" />
                      <span className="text-sm font-medium">Workflow Automations</span>
                    </div>
                    <div className="space-y-1">
                      {model.workflowAutomations.map((auto) => (
                        <div
                          key={auto}
                          className="text-xs bg-info/10 text-info px-2 py-1 rounded text-center"
                        >
                          {auto}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Governance</span>
                    </div>
                    <div className="space-y-1">
                      {model.governanceRecommendations.map((rec) => (
                        <div
                          key={rec}
                          className="text-xs bg-warning/10 text-warning px-2 py-1 rounded text-center"
                        >
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Integration Suggestions</div>
                  <div className="flex flex-wrap gap-2">
                    {model.integrationSuggestions.map((suggestion) => (
                      <Badge key={suggestion} variant="outline">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessment/${params.id}/cockpit`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cockpit
          </Button>
          <Button
            onClick={() => router.push(`/assessment/${params.id}/roadmap`)}
          >
            Continue to Roadmap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
