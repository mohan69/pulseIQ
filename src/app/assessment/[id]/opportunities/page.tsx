"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  IndianRupee,
  Clock,
  Users,
  Shield,
  Target,
  Zap,
} from "lucide-react";

const priorityConfig = {
  quick_win: { label: "Quick Win", variant: "success" as const, icon: Zap },
  strategic: { label: "Strategic", variant: "info" as const, icon: Target },
  high_complexity: { label: "High Complexity", variant: "warning" as const, icon: Shield },
  not_now: { label: "Not Now", variant: "outline" as const, icon: Clock },
};

const impactIcons: Record<string, React.ElementType> = {
  revenue: IndianRupee,
  cost: TrendingUp,
  productivity: Users,
  margin: TrendingUp,
  cycle_time: Clock,
  governance: Shield,
  risk: Shield,
};

export default function OpportunitiesPage() {
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

  const { opportunities, cockpit } = assessment;

  return (
    <AssessmentShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">AI Transformation Opportunities</h1>
          <p className="text-muted mt-1">
            Ranked by business impact and implementation complexity
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-accent">
              {cockpit.opportunityValue}
            </div>
            <div className="text-sm text-muted">Total Opportunity Value</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-success">
              {cockpit.quickWinsCount}
            </div>
            <div className="text-sm text-muted">Quick Wins</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-warning">
              {cockpit.highComplexityCount}
            </div>
            <div className="text-sm text-muted">High Complexity</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {opportunities.length}
            </div>
            <div className="text-sm text-muted">Total Opportunities</div>
          </Card>
        </div>

        <div className="space-y-4">
          {opportunities.map((opp) => {
            const config = priorityConfig[opp.priorityTier];
            const ImpactIcon = impactIcons[opp.impactType] || TrendingUp;

            return (
              <Card key={opp.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={config.variant}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="outline">
                          <ImpactIcon className="h-3 w-3 mr-1" />
                          {opp.impactType.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">
                          {opp.complexity} complexity
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{opp.title}</h3>
                      <p className="text-sm text-muted mb-3">
                        {opp.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted">Impact: </span>
                          <span className="font-medium">{opp.estimatedImpact}</span>
                        </div>
                        <div>
                          <span className="text-muted">Owner: </span>
                          <span className="font-medium">{opp.recommendedOwner}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 rounded-lg bg-accent-muted text-sm">
                        <span className="text-muted font-medium">Why it matters: </span>
                        {opp.whyItMatters}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessment/${params.id}/model`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Model
          </Button>
          <Button
            onClick={() => router.push(`/assessment/${params.id}/cockpit`)}
          >
            Continue to Executive Cockpit
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
