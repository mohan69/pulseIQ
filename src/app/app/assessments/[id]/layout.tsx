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
import {
  isMicrofinishPublicDomain,
  isPublicDomainAssessment,
} from "@/lib/assessment/presentation";

export default async function AssessmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (process.env.NODE_ENV === "development") {
    console.log(`[layout] loading assessment id="${id}"`);
  }
  let assessment;
  try {
    assessment = await getAssessment(id);
  } catch (err) {
    console.error(`[layout] getAssessment("${id}") failed:`, err);
    throw err;
  }
  if (!assessment) notFound();

  let sources: Awaited<ReturnType<typeof getSources>> = [];
  let cockpit: Awaited<ReturnType<typeof getCockpit>> = { metrics: [], topRisks: [], topOpportunities: [] };
  try {
    [sources, cockpit] = await Promise.all([
      getSources(id),
      getCockpit(id),
    ]);
  } catch (err) {
    console.error(`[layout] data fetch for "${id}" failed:`, err);
    throw err;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[layout] assessment="${assessment.id}" sources=${sources.length} cockpitMetrics=${cockpit.metrics.length}`);
  }

  const offTrack = cockpit.metrics.filter((m) => m.status === "off_track").length;
  const atRisk = cockpit.metrics.filter((m) => m.status === "at_risk").length;
  const headline =
    offTrack > 0
      ? `${offTrack} off track`
      : atRisk > 0
        ? `${atRisk} at risk`
        : "broadly on plan";
  const isMicrofinishSample = isMicrofinishPublicDomain(assessment);
  const isPublicDomain = isPublicDomainAssessment(assessment);

  return (
    <div className="space-y-6 print:space-y-0">
      <section className="assessment-shell-summary rounded-2xl border border-border bg-white p-5 lg:p-6 print:hidden">
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
                <Badge variant="default">
                  {assessmentStatusLabel(assessment.status)}
                </Badge>
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
                {isMicrofinishSample
                  ? "Revenue ambition"
                  : isPublicDomain
                    ? "Revenue actual"
                    : "Revenue target"}
              </div>
              <div className="text-sm font-semibold text-foreground">
                {isMicrofinishSample
                  ? `${formatCurrency(assessment.revenueTarget)} illustrative`
                  : isPublicDomain
                    ? "Requires internal validation"
                    : formatCurrency(assessment.revenueTarget)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted flex items-center justify-end gap-1">
                <Target className="h-3 w-3" />
                {isMicrofinishSample
                  ? "Margin scenario"
                  : isPublicDomain
                    ? "Margin actual"
                    : "Margin target"}
              </div>
              <div className="text-sm font-semibold text-foreground">
                {isMicrofinishSample
                  ? `${assessment.marginTarget}% illustrative`
                  : isPublicDomain
                    ? "Requires internal data"
                    : `${assessment.marginTarget}%`}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted flex items-center justify-end gap-1">
                <Users className="h-3 w-3" />
                {isMicrofinishSample
                  ? "Productivity"
                  : isPublicDomain
                    ? "RPE"
                    : "RPE target"}
              </div>
              <div className="text-sm font-semibold text-foreground">
                {isMicrofinishSample || isPublicDomain
                  ? "Requires internal data"
                  : `${formatCurrency(assessment.headcountProductivityTarget)}/emp`}
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="assessment-shell-tabs print:hidden">
        <AssessmentTabs
          assessmentId={assessment.id}
          sourceCount={sources.length}
        />
      </div>
      <div>{children}</div>
    </div>
  );
}

function assessmentStatusLabel(status: string): string {
  if (status === "analyzing") return "Analyzing";
  if (status === "analysis" || status === "analysis_ready") {
    return "Analysis ready";
  }
  if (status === "analysis_failed") return "Analysis failed";
  return status.replace(/_/g, " ");
}
