"use client";

import { useParams } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { Badge } from "@/components/ui/badge";
import { Brain, Building2, AlertTriangle, Target, Lightbulb, Rocket, Calendar, CheckCircle2, Users, IndianRupee, TrendingUp } from "lucide-react";
import PrintButton from "@/components/report/PrintButton";

const formatSystemLabel = (key: string): string => {
  const map: Record<string, string> = {
    erp: "ERP",
    crm: "CRM",
    plm: "PLM / MES",
    hrms: "HRMS",
    projecttools: "Project Tools",
    sap: "SAP",
    oracle: "Oracle",
    salesforce: "Salesforce",
    workday: "Workday",
    servicenow: "ServiceNow",
    microsoft: "Microsoft",
    aws: "AWS",
    azure: "Azure",
    gcp: "GCP",
    finance: "Finance",
    spreadsheets: "Spreadsheets",
    other: "Other",
  };
  return map[key.toLowerCase()] || key.replace(/([A-Z])/g, ' $1').trim();
};

const formatOpportunityTag = (tier: string): string => {
  const map: Record<string, string> = {
    quick_win: "Quick Win",
    strategic: "Strategic",
  };
  return map[tier] || tier.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const formatImpactType = (type: string): string => {
  const map: Record<string, string> = {
    cycle_time: "Cycle Time",
    cost: "Cost",
    governance: "Governance",
    revenue: "Revenue",
    quality: "Quality",
    safety: "Safety",
    compliance: "Compliance",
  };
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

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
         <div className="no-print sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
           <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
                 <Brain className="h-4 w-4 text-white" />
               </div>
               <div>
                 <span className="font-bold text-foreground">PulseIQ Assessment Report</span>
                 <span className="text-xs text-muted ml-2 hidden sm:inline">by RightSense Technologies</span>
               </div>
             </div>
              <div className="flex items-center gap-3">
                 <PrintButton className="bg-accent hover:bg-accent-hover text-white shadow-sm">
                   Print / Save as PDF
                 </PrintButton>
                <span className="text-xs text-muted">
                  For clean PDF export, disable browser Headers and footers in the print dialog.
                </span>
              </div>
           </div>
         </div>

        <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* Executive Report Cover */}
          <div className="bg-white rounded-2xl border border-border p-12 mb-10 shadow-sm">
            <div className="text-center">
              <div className="inline-flex items-center gap-4 rounded-full bg-accent-muted px-6 py-2 text-sm text-accent font-medium mb-6">
                <Brain className="h-4 w-4" />
                PulseIQ Enterprise Intelligence Assessment Report
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4 max-w-[22ch] text-center">{profile.companyName}</h1>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-6 mt-2 text-sm text-muted">
                  <span className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {profile.industry}</span>
                  <span className="w-px h-8 bg-border" />
                  <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> {profile.revenueRange}</span>
                  <span className="w-px h-8 bg-border" />
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {profile.employeeCount.toLocaleString()} employees</span>
                </div>
                <div className="mt-4">
                  <span className="text-xs text-muted">Prepared by RightSense Technologies</span>
                  <span className="mx-2">|</span>
                  <span className="text-xs text-muted">Generated: {formatDate(new Date())}</span>
                </div>
                <div className="mt-6 text-center max-w-2xl mx-auto">
                  <p className="text-sm text-muted leading-relaxed">
                    Current operating model, AI transformation opportunities, business impact estimates, and 90-day execution roadmap.
                  </p>
                </div>
              </div>
            </div>
          </div>

         {/* Executive Summary */}
         <section className="print-break bg-white rounded-2xl border border-border p-8 mb-6 shadow-sm">
           <div className="space-y-4">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-xl font-bold text-foreground">Executive Summary</h3>
               <div className="text-sm text-muted">Key findings at a glance</div>
             </div>
             <div className="grid md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="h-8 w-8 rounded-full bg-success-muted flex items-center justify-center">
                     <CheckCircle2 className="h-4 w-4 text-success" />
                   </div>
                    <div>
                      <div className="text-base font-bold text-foreground">Transformation Readiness</div>
                      <div className="text-sm text-muted">{cockpit.transformationScore}/100</div>
                      <div className="text-xs text-muted">Lower score indicates higher improvement opportunity.</div>
                    </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-info-muted flex items-center justify-center">
                       <IndianRupee className="h-4 w-4 text-info" />
                     </div>
                     <div>
                       <div className="text-base font-bold text-foreground">Opportunity Value</div>
                       <div className="text-sm text-muted">{cockpit.opportunityValue}</div>
                     </div>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-warning-muted flex items-center justify-center">
                       <TrendingUp className="h-4 w-4 text-warning" />
                     </div>
                     <div>
                       <div className="text-base font-bold text-foreground">Quick Wins</div>
                       <div className="text-sm text-muted">{cockpit.quickWinsCount}</div>
                     </div>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-error-muted flex items-center justify-center">
                       <AlertTriangle className="h-4 w-4 text-error" />
                     </div>
                     <div>
                       <div className="text-base font-bold text-foreground">Top Bottleneck</div>
                       <div className="text-sm text-muted">{cockpit.topBottlenecks[0] || 'None identified'}</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             <div className="border-t pt-4 mt-4">
               <div className="flex items-center justify-between text-sm">
                 <span>90-Day Roadmap:</span>
                 <span className="font-medium text-foreground">See detailed 30/60/90 day execution plan below</span>
               </div>
             </div>
           </div>
         </section>

         <section className="print-break">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
             <Building2 className="h-5 w-5 text-accent" />
             Company Profile
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
             <div>
               <h4 className="font-semibold mb-2 text-foreground">Current Systems</h4>
               <div className="space-y-1 text-sm">
                 {Object.entries(profile.currentSystems).map(
                   ([key, value]) =>
                     value && (
                       <div key={key} className="flex justify-between py-2 border-b border-border-subtle">
                         <span className="text-muted font-medium">{formatSystemLabel(key)}</span>
                         <span className="font-semibold text-foreground">{value}</span>
                       </div>
                     )
                 )}
               </div>
             </div>
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Strategic Priorities</h4>
              <div className="space-y-2">
                {profile.strategicPriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-foreground-secondary">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="print-break">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-error" />
            Top Bottlenecks
          </h3>
          <div className="space-y-2">
            {cockpit.topBottlenecks.map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-error-muted border border-error/10 text-sm">
                <span className="font-bold text-error">{i + 1}.</span>
                <span className="text-foreground">{b}</span>
              </div>
            ))}
          </div>
        </section>

          <section className="print-break avoid-print-break opportunity-section-header">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-warning" />
              AI Transformation Opportunities
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-accent-muted border border-accent/10">
                <div className="text-2xl font-bold text-accent">{cockpit.opportunityValue}</div>
                <div className="text-sm text-muted">Total Opportunity Value</div>
              </div>
              <div className="p-4 rounded-xl bg-success-muted border border-success/10">
                <div className="text-2xl font-bold text-success">{cockpit.quickWinsCount}</div>
                <div className="text-sm text-muted">Quick Wins</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="mb-3">
                <p className="text-sm text-muted italic max-w-2xl">
                  Impact estimates are directional and based on current assessment inputs. Final values should be validated during the 2-week discovery sprint.
                </p>
              </div>
              {assessment.opportunities.slice(0, 6).map((opp) => (
                <div key={opp.id} className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        opp.priorityTier === "quick_win"
                          ? "success"
                          : opp.priorityTier === "strategic"
                            ? "info"
                            : "outline"
                      }
                      className="font-medium"
                    >
                      {formatOpportunityTag(opp.priorityTier)}
                    </Badge>
                    <Badge variant="outline" className="font-medium">
                      {formatImpactType(opp.impactType)}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground">{opp.title}</h4>
                  <p className="text-sm text-muted mt-1">{opp.description}</p>
                  <div className="text-sm mt-2">
                    <span className="font-medium text-muted">Impact: </span>
                    <span className="font-semibold text-foreground">{opp.estimatedImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        <section className="print-break">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Rocket className="h-5 w-5 text-accent" />
            Future Operating Model
          </h3>
          <div className="space-y-4">
            {assessment.futureModel.map((model) => (
              <div key={model.departmentId} className="p-4 rounded-xl border border-border">
                <h4 className="font-semibold text-foreground mb-2">{model.departmentName}</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-error-muted border border-error/10">
                    <div className="font-semibold text-error mb-1">Current</div>
                    <span className="text-foreground-secondary">{model.beforeState}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-success-muted border border-success/10">
                    <div className="font-semibold text-success mb-1">Future</div>
                    <span className="text-foreground-secondary">{model.afterState}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium text-muted">AI Agents: </span>
                  <span className="text-foreground font-medium">{model.recommendedAIAgents.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="print-break">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-success" />
            30/60/90 Day Roadmap
          </h3>
          <div className="space-y-5">
            {assessment.roadmap.map((phase) => (
              <div key={phase.phase}>
                <h4 className="font-semibold mb-2 text-foreground">{phase.title}</h4>
                <div className="space-y-2">
                  {phase.milestones.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl border border-border text-sm">
                      <div className="font-semibold text-foreground">{m.title}</div>
                      <div className="text-muted mt-1">Owner: {m.ownerFunction} | KPI: {m.measurableKPI}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

         <section className="executive-actions-section">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
             <Target className="h-5 w-5 text-accent" />
             Executive Actions
           </h3>
           <div className="space-y-2">
             {cockpit.executiveActions.map((action, i) => (
               <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent-muted text-sm">
                 <span className="font-bold text-accent">{i + 1}.</span>
                 <span className="text-foreground">{action}</span>
               </div>
             ))}
           </div>
         </section>

        <footer className="border-t border-border pt-6 text-center text-sm text-muted">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-foreground">PulseIQ Enterprise Intelligence</span>
          </div>
          <div className="text-foreground-secondary">Convert enterprise complexity into AI-native operating intelligence</div>
          <div className="mt-1">Generated by PulseIQ | RightSense Technologies Pvt Ltd</div>
          <div className="text-xs mt-1">pulseiq.co.in</div>
        </footer>
      </main>
    </div>
  );
}
