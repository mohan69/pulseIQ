"use client";

import Link from "next/link";
import { useAssessmentStore } from "@/stores/assessment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  ArrowRight,
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
  Zap,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const scoreBg = (score: number) => {
  if (score >= 70) return "from-success to-success/80";
  if (score >= 40) return "from-warning to-warning/80";
  return "from-error to-error/80";
};

export default function DashboardPage() {
  const assessments = useAssessmentStore((s) => s.assessments);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center shadow-sm">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight tracking-tight">PulseIQ</span>
              <span className="text-[10px] text-muted leading-none tracking-wide uppercase">Enterprise Intelligence</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/assessment/bharat-heavy-fabrications/intake">
              <Button size="sm" className="bg-accent hover:bg-accent-hover text-white shadow-sm">
                Explore Demo Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Enterprise Assessments</h1>
          <p className="text-foreground-secondary mt-2 text-lg max-w-2xl">
            Select a seeded demo assessment to explore how PulseIQ converts operating complexity into AI transformation priorities.
          </p>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Building2, value: "4", label: "Demo Enterprises", color: "accent" },
            { icon: IndianRupee, value: "₹100Cr+", label: "Opportunity Range", color: "success" },
            { icon: Zap, value: "21", label: "AI Opportunities", color: "warning" },
            { icon: TrendingUp, value: "12", label: "Quick Wins", color: "info" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 shadow-xs">
              <div className={`h-11 w-11 rounded-xl bg-${kpi.color}-muted flex items-center justify-center shrink-0`}>
                <kpi.icon className={`h-5 w-5 text-${kpi.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{kpi.value}</div>
                <div className="text-sm text-muted">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/assessment/${assessment.id}/intake`}
            >
              <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg hover:border-accent/20 transition-all duration-200 cursor-pointer h-full overflow-hidden group">
                {/* Card Header with Score */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                        {assessment.enterpriseProfile.companyName}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-background font-medium">
                          {assessment.enterpriseProfile.industry}
                        </Badge>
                        <Badge
                          variant={assessment.status === "complete" ? "success" : "default"}
                        >
                          {assessment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${scoreBg(assessment.cockpit.transformationScore)} flex items-center justify-center shadow-sm`}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{assessment.cockpit.transformationScore}</div>
                        <div className="text-[9px] text-white/70 uppercase tracking-wider">Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Company Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{assessment.enterpriseProfile.revenueRange}</div>
                        <div className="text-xs text-muted">Revenue</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                        <Users className="h-4 w-4 text-muted" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{assessment.enterpriseProfile.employeeCount.toLocaleString()}</div>
                        <div className="text-xs text-muted">Employees</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                        <IndianRupee className="h-4 w-4 text-muted" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{assessment.cockpit.opportunityValue}</div>
                        <div className="text-xs text-muted">Opportunity</div>
                      </div>
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div className="space-y-2 mb-4">
                    {assessment.cockpit.topBottlenecks.slice(0, 2).map((bottleneck) => (
                      <div
                        key={bottleneck}
                        className="flex items-center gap-2 text-xs bg-error-muted text-error px-3 py-1.5 rounded-lg"
                      >
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        {bottleneck}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-border bg-background/50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                      {assessment.cockpit.quickWinsCount} quick wins
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-accent" />
                      {assessment.opportunities.length} opportunities
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-accent font-semibold group-hover:gap-2.5 transition-all">
                    View Assessment
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
