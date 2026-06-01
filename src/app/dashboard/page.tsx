"use client";

import Link from "next/link";
import { useAssessmentStore } from "@/stores/assessment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  ArrowRight,
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

const scoreColor = (score: number) => {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-error";
};

export default function DashboardPage() {
  const assessments = useAssessmentStore((s) => s.assessments);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-info flex items-center justify-center">
              <Brain className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">PulseIQ</span>
              <span className="text-sm text-muted hidden sm:inline">Enterprise Intelligence</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">Enterprise Assessments</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
            <p className="text-muted mt-1">
              Enterprise intelligence assessments and demo data
            </p>
          </div>
          <Link href="/assessment/bharat-heavy-fabrications/intake">
            <Button className="bg-accent hover:bg-accent-hover text-white">
              Explore Demo Assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/assessment/${assessment.id}/intake`}
            >
              <Card className="hover:shadow-md hover:border-accent/30 transition-all cursor-pointer h-full bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground">
                        {assessment.enterpriseProfile.companyName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-background">
                          {assessment.enterpriseProfile.industry}
                        </Badge>
                        <Badge
                          variant={
                            assessment.status === "complete"
                              ? "success"
                              : "default"
                          }
                        >
                          {assessment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-3xl font-bold ${scoreColor(
                          assessment.cockpit.transformationScore
                        )}`}
                      >
                        {assessment.cockpit.transformationScore}
                      </div>
                      <div className="text-xs text-muted">
                        Transformation Score
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {assessment.enterpriseProfile.revenueRange}
                        </div>
                        <div className="text-xs text-muted">Revenue</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {assessment.enterpriseProfile.employeeCount.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted">Employees</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {assessment.cockpit.opportunityValue}
                        </div>
                        <div className="text-xs text-muted">Opportunity</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {assessment.cockpit.topBottlenecks
                      .slice(0, 2)
                      .map((bottleneck) => (
                        <div
                          key={bottleneck}
                          className="text-xs bg-error-muted text-error px-2 py-1 rounded"
                        >
                          {bottleneck}
                        </div>
                      ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {assessment.cockpit.quickWinsCount} quick wins
                      </span>
                      <span>
                        {assessment.opportunities.length} opportunities
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-accent font-medium">
                      View Assessment
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
