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

  return (
    <AssessmentShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Intake</h1>
          <p className="text-muted mt-1">
            Company profile and operating context
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-accent" />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted">Company Name</div>
                <div className="font-medium text-lg">
                  {profile.companyName}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted">Industry</div>
                  <Badge variant="outline">{profile.industry}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted">Revenue</div>
                  <div className="font-medium flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {profile.revenueRange}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted">Employees</div>
                  <div className="font-medium flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {profile.employeeCount.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-accent" />
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
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="text-sm text-muted capitalize">
                          {key === "plm"
                            ? "PLM / MES"
                            : key === "hrms"
                              ? "HRMS"
                              : key}
                        </span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Pain Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {profile.painPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-error/5 border border-error/10"
                >
                  <div className="h-6 w-6 rounded-full bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-error">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Strategic Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {profile.strategicPriorities.map((priority, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10"
                >
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-success">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-sm">{priority}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => router.push(`/assessment/${params.id}/model`)}>
            Continue to Operating Model
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}
