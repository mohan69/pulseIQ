"use client";

import { useParams, useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/assessment";
import { AssessmentShell } from "@/components/layout/AssessmentShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  IndianRupee,
  AlertTriangle,
  Target,
  Server,
  ArrowRight,
  Layers,
} from "lucide-react";

export default function IntakePage() {
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

  const profile = assessment.enterpriseProfile;
  const systemCount = Object.values(profile.currentSystems).filter(Boolean).length;

  return (
    <AssessmentShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Enterprise Intake</h1>
          <p className="text-foreground-secondary mt-2 text-lg">
            Company profile and operating context
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: IndianRupee, value: profile.revenueRange, label: "Revenue", color: "success" },
            { icon: Users, value: profile.employeeCount.toLocaleString(), label: "Employees", color: "accent" },
            { icon: Layers, value: systemCount, label: "Systems", color: "info" },
            { icon: AlertTriangle, value: profile.painPoints.length, label: "Pain Points", color: "error" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 shadow-xs">
              <div className={`h-11 w-11 rounded-xl bg-${kpi.color}-muted flex items-center justify-center shrink-0`}>
                <kpi.icon className={`h-5 w-5 text-${kpi.color}`} />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{kpi.value}</div>
                <div className="text-sm text-muted">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-accent" />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted">Company Name</div>
                <div className="font-bold text-xl text-foreground">
                  {profile.companyName}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted">Industry</div>
                  <Badge variant="outline" className="mt-1 font-medium">{profile.industry}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted">Revenue</div>
                  <div className="font-semibold flex items-center gap-1 mt-1">
                    <IndianRupee className="h-3.5 w-3.5 text-success" />
                    {profile.revenueRange}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted">Employees</div>
                  <div className="font-semibold flex items-center gap-1 mt-1">
                    <Users className="h-3.5 w-3.5 text-accent" />
                    {profile.employeeCount.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="h-5 w-5 text-info" />
                Current Systems Landscape
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(profile.currentSystems).map(
                  ([key, value]) =>
                    value && (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3 px-4 rounded-xl bg-background border border-border-subtle"
                      >
                        <span className="text-sm text-muted capitalize font-medium">
                          {key === "plm"
                            ? "PLM / MES"
                            : key === "hrms"
                              ? "HRMS"
                              : key}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{value}</span>
                      </div>
                    )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-error" />
              Pain Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {profile.painPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-error-muted border border-error/10"
                >
                  <div className="h-7 w-7 rounded-full bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-error">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">{point}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-success" />
              Strategic Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {profile.strategicPriorities.map((priority, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-success-muted border border-success/10"
                >
                  <div className="h-7 w-7 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">{priority}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => router.push(`/assessment/${params.id}/model`)} className="bg-accent hover:bg-accent-hover text-white shadow-sm">
            Continue to Operating Model
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
