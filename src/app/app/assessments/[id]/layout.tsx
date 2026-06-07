import { notFound } from "next/navigation";
import {
  getAssessment,
  getCockpit,
  getSources,
} from "@/lib/assessment/store";
import { Badge } from "@/components/ui/badge";
import { Building2, IndianRupee, Target, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AssessmentTabs } from "@/components/workbench/AssessmentTabs";

export default async function AssessmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = getAssessment(id);
  if (!assessment) notFound();
  const sources = getSources(id);
  const cockpit = getCockpit(id);
  const offTrack = cockpit.metrics.filter((m) => m.status === "off_track").length;
  const atRisk = cockpit.metrics.filter((m) => m.status === "at_risk").length;
  const headline =
    offTrack > 0
      ? `${offTrack} off track`
      : atRisk > 0
        ? `${atRisk} at risk`
        : "broadly on plan";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground truncate">
                  {assessment.companyName}
                </h1>
                <Badge variant="default">{assessment.status}</Badge>
              </div>
              <div className="text-sm text-muted mt-1 flex items-center gap-2 flex-wrap">
                <span className="capitalize">
                  {assessment.industry.replace(/_/g, " ")}
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="capitalize">
                  {assessment.objective.replace(/_/g, " ")}
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Posture: {headline}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-right">
            <div>
              <div className="text-[11px] text-muted flex items-center justify-end gap-1">
                <IndianRupee className="h-3 w-3" />
                Revenue target
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatCurrency(assessment.revenueTarget)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted flex items-center justify-end gap-1">
                <Target className="h-3 w-3" />
                Margin target
              </div>
              <div className="text-sm font-semibold text-foreground">
                {assessment.marginTarget}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted flex items-center justify-end gap-1">
                <Users className="h-3 w-3" />
                RPE target
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatCurrency(assessment.headcountProductivityTarget)}/emp
              </div>
            </div>
          </div>
        </div>
      </section>
      <AssessmentTabs assessmentId={assessment.id} sourceCount={sources.length} />
      <div>{children}</div>
    </div>
  );
}
