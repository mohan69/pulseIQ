"use client";

import { useParams } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Printer,
  Building2,
  AlertTriangle,
  Target,
  Lightbulb,
  Rocket,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function ReportPage() {
  const params = useParams();
  const getAssessment = useAssessmentStore((s) => s.getAssessment);
  const assessment = getAssessment(params.id as string);

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted">
        Assessment not found
      </div>
    );
  }

  const profile = assessment.enterpriseProfile;
  const { cockpit } = assessment;

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <span className="font-semibold">PulseIQ Assessment Report</span>
              <span className="text-xs text-muted ml-2 hidden sm:inline">by RightSense Technologies</span>
            </div>
          </div>
          <Button onClick={() => window.print()} size="sm">
            <Printer className="h-4 w-4 mr-1" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div className="text-center border-b border-border pb-8">
          <h1 className="text-3xl font-bold mb-2">
            Enterprise Intelligence Assessment
          </h1>
          <h2 className="text-xl text-muted">{profile.companyName}</h2>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted">
            <span>{profile.industry}</span>
            <span>{profile.revenueRange}</span>
            <span>{profile.employeeCount.toLocaleString()} employees</span>
          </div>
        </div>

        <section className="print-break">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            Company Profile
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Current Systems</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(profile.currentSystems).map(
                  ([key, value]) =>
                    value && (
                      <div key={key} className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted capitalize">{key}</span>
                        <span>{value}</span>
                      </div>
                    )
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Strategic Priorities</h4>
              <div className="space-y-2">
                {profile.strategicPriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="print-break">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-error" />
            Top Bottlenecks
          </h3>
          <div className="space-y-2">
            {cockpit.topBottlenecks.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded bg-error-muted border border-error/20 text-sm"
              >
                <span className="font-medium text-error">{i + 1}.</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="print-break">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            AI Transformation Opportunities
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-accent-muted">
              <div className="text-2xl font-bold text-accent">{cockpit.opportunityValue}</div>
              <div className="text-sm text-muted">Total Opportunity Value</div>
            </div>
            <div className="p-4 rounded-lg bg-success-muted">
              <div className="text-2xl font-bold text-success">{cockpit.quickWinsCount}</div>
              <div className="text-sm text-muted">Quick Wins</div>
            </div>
          </div>
          <div className="space-y-3">
            {assessment.opportunities.slice(0, 6).map((opp) => (
              <div
                key={opp.id}
                className="p-4 rounded border border-border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      opp.priorityTier === "quick_win"
                        ? "success"
                        : opp.priorityTier === "strategic"
                          ? "info"
                          : "outline"
                    }
                  >
                    {opp.priorityTier.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline">{opp.impactType.replace("_", " ")}</Badge>
                </div>
                <h4 className="font-medium">{opp.title}</h4>
                <p className="text-sm text-muted mt-1">{opp.description}</p>
                <div className="text-sm mt-2">
                  <span className="font-medium">Impact: </span>{opp.estimatedImpact}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="print-break">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-accent" />
            Future Operating Model
          </h3>
          <div className="space-y-4">
            {assessment.futureModel.map((model) => (
              <div
                key={model.departmentId}
                className="p-4 rounded border border-border"
              >
                <h4 className="font-medium mb-2">{model.departmentName}</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded bg-error-muted border border-error/20">
                    <div className="font-medium text-error mb-1">Current</div>
                    {model.beforeState}
                  </div>
                  <div className="p-3 rounded bg-success-muted border border-success/20">
                    <div className="font-medium text-success mb-1">Future</div>
                    {model.afterState}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">AI Agents: </span>
                  {model.recommendedAIAgents.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="print-break">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-success" />
            30/60/90 Day Roadmap
          </h3>
          <div className="space-y-6">
            {assessment.roadmap.map((phase) => (
              <div key={phase.phase}>
                <h4 className="font-medium mb-2">
                  {phase.title}
                </h4>
                <div className="space-y-2">
                  {phase.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded border border-border text-sm"
                    >
                      <div className="font-medium">{m.title}</div>
                      <div className="text-muted mt-1">
                        Owner: {m.ownerFunction} | KPI: {m.measurableKPI}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Executive Actions
          </h3>
          <div className="space-y-2">
            {cockpit.executiveActions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded bg-accent-muted text-sm"
              >
                <span className="font-medium text-accent">{i + 1}.</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border pt-8 text-center text-sm text-muted">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <Brain className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium">PulseIQ Enterprise Intelligence</span>
          </div>
          <div>Convert enterprise complexity into AI-native operating intelligence</div>
          <div className="mt-1">Generated by PulseIQ | RightSense Technologies Pvt Ltd</div>
          <div className="text-xs mt-1">pulseiq.co.in</div>
        </footer>
      </main>
    </div>
  );
}
