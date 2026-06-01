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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enterprise Intake</h1>
          <p className="text-foreground-secondary mt-1">
            Company profile and operating context
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: IndianRupee, value: profile.revenueRange, label: "Revenue", color: "success" },
            { icon: Users, value: profile.employeeCount.toLocaleString(), label: "Employees", color: "accent" },
            { icon: Layers, value: systemCount, label: "Systems", color: "info" },
            { icon: AlertTriangle, value: profile.painPoints.length, label: "Pain Points", color: "error" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-border p-3 flex items-center gap-3 shadow-xs">
              <div className={`h-9 w-9 rounded-lg bg-${kpi.color}-muted flex items-center justify-center shrink-0`}>
                <kpi.icon className={`h-4 w-4 text-${kpi.color}`} />
              </div>
              <div>
                <div className="text-base font-bold text-foreground">{kpi.value}</div>
                <div className="text-xs text-muted">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Company Profile - Compact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-accent" />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="pb-3 border-b border-border-subtle">
                  <div className="font-bold text-lg text-foreground">{profile.companyName}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted mb-1">Industry</div>
                    <Badge variant="outline" className="font-medium">{profile.industry}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-1">Revenue</div>
                    <div className="font-semibold text-sm flex items-center gap-1">
                      <IndianRupee className="h-3 w-3 text-success" />
                      {profile.revenueRange}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-1">Employees</div>
                    <div className="font-semibold text-sm flex items-center gap-1">
                      <Users className="h-3 w-3 text-accent" />
                      {profile.employeeCount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-1">Strategic Priorities</div>
                    <div className="font-semibold text-sm">{profile.strategicPriorities.length} priorities</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Systems */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4 text-info" />
                Current Systems Landscape
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {Object.entries(profile.currentSystems).map(
                  ([key, value]) =>
                    value && (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-border-subtle"
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-error" />
              Pain Points
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-2">
              {profile.painPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-error-muted border border-error/10"
                >
                  <div className="h-6 w-6 rounded-full bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-error">{i + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{point}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-success" />
              Strategic Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-2">
              {profile.strategicPriorities.map((priority, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-success-muted border border-success/10"
                >
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-success">{i + 1}</span>
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
