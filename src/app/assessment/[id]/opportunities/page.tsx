"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
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
  BarChart3,
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
        <div className="text-center py-20 text-muted">Assessment not found</div>
      </AssessmentShell>
    );
  }

  const { opportunities, cockpit } = assessment;

  return (
    <AssessmentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Transformation Opportunities</h1>
          <p className="text-foreground-secondary mt-1">Ranked by business impact and implementation complexity</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm border-t-3 border-t-accent">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-accent-muted flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-accent" />
              </div>
            </div>
            <div className="text-xl font-bold text-accent">{cockpit.opportunityValue}</div>
            <div className="text-xs text-muted">Total Opportunity Value</div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm border-t-3 border-t-success">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-success-muted flex items-center justify-center">
                <Zap className="h-4 w-4 text-success" />
              </div>
            </div>
            <div className="text-xl font-bold text-success">{cockpit.quickWinsCount}</div>
            <div className="text-xs text-muted">Quick Wins</div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm border-t-3 border-t-warning">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-warning-muted flex items-center justify-center">
                <Shield className="h-4 w-4 text-warning" />
              </div>
            </div>
            <div className="text-xl font-bold text-warning">{cockpit.highComplexityCount}</div>
            <div className="text-xs text-muted">High Complexity</div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm border-t-3 border-t-info">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-info-muted flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-info" />
              </div>
            </div>
            <div className="text-xl font-bold text-info">{opportunities.length}</div>
            <div className="text-xs text-muted">Total Opportunities</div>
          </div>
        </div>

        <div className="space-y-4">
          {opportunities.map((opp) => {
            const config = priorityConfig[opp.priorityTier];
            const ImpactIcon = impactIcons[opp.impactType] || TrendingUp;
            return (
              <div key={opp.id} className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={config.variant} className="font-medium">
                          <config.icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="font-medium">
                          <ImpactIcon className="h-3 w-3 mr-1" />
                          {opp.impactType.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="font-medium">{opp.complexity} complexity</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{opp.title}</h3>
                      <p className="text-sm text-foreground-secondary mb-3">{opp.description}</p>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted font-medium">Impact: </span>
                          <span className="font-semibold text-foreground">{opp.estimatedImpact}</span>
                        </div>
                        <div>
                          <span className="text-muted font-medium">Owner: </span>
                          <span className="font-semibold text-foreground">{opp.recommendedOwner}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 rounded-xl bg-accent-muted border border-accent/10">
                        <span className="text-accent font-semibold text-sm">Why it matters: </span>
                        <span className="text-sm text-foreground-secondary">{opp.whyItMatters}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/assessment/${params.id}/model`)} className="border-border-hover">
            <ArrowLeft className="h-4 w-4" /> Back to Model
          </Button>
          <Button onClick={() => router.push(`/assessment/${params.id}/cockpit`)} className="bg-accent hover:bg-accent-hover text-white shadow-sm">
            Continue to Executive Cockpit <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
