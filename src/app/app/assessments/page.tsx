import Link from "next/link";
import { listAssessments } from "@/lib/assessment/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  Plus,
  Target,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Assessment, AssessmentStatus } from "@/lib/assessment/types";
import { DeleteAssessmentButton } from "@/components/workbench/DeleteAssessmentButton";
import {
  assessmentCardPresentation,
  orderAssessmentsForDisplay,
} from "@/lib/assessment/list-presentation";

const DEMO_ASSESSMENT_ID = "asm-bharat-heavy-fabrications";

export const dynamic = "force-dynamic";

export default async function AssessmentsListPage() {
  const assessments = await listAssessments();
  const orderedAssessments = orderAssessmentsForDisplay(assessments);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
          <p className="text-sm text-muted mt-1">
            RightSense diagnostic assessments powered by PulseIQ. Open one to
            review its sources, truth map, cockpit, readiness gaps, scenarios,
            recommendations, and report.
          </p>
        </div>
        <Link href="/app/assessments/new">
          <Button className="px-5">
            <Plus className="h-4 w-4" />
            New assessment
          </Button>
        </Link>
      </section>

      {assessments.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-accent-muted flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No assessments yet
          </h3>
          <p className="text-sm text-muted mb-5 max-w-md mx-auto">
            Start a RightSense diagnostic assessment. Capture the commercial
            targets now, then add operating, compliance, standards, supplier,
            statutory, prequalification, and AI governance evidence.
          </p>
          <div className="flex items-center justify-center">
            <Link href="/app/assessments/new">
              <Button className="px-5">
                <Plus className="h-4 w-4" />
                Create assessment
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {orderedAssessments.map((a) => (
            <Card
              key={a.id}
              className="h-full hover:shadow-md hover:border-accent/30 transition-all"
            >
              <Link
                href={`/app/assessments/${a.id}`}
                className="block group"
              >
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="group-hover:text-accent transition-colors">
                          {a.companyName}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="capitalize">
                            {a.industry.replace(/_/g, " ")}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="capitalize">
                            {a.objective.replace(/_/g, " ")}
                          </span>
                        </CardDescription>
                      </div>
                      <StatusPill status={a.status} />
                    </div>
                </CardHeader>
                <CardContent>
                  <AssessmentCardFinancialSummary assessment={a} />
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                    <div className="text-xs text-muted">
                      Updated {new Date(a.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </CardContent>
              </Link>
              <div className="flex justify-end border-t border-border-subtle px-6 py-3">
                <DeleteAssessmentButton
                  assessmentId={a.id}
                  assessmentName={a.companyName}
                  protected={a.id === DEMO_ASSESSMENT_ID}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function AssessmentCardFinancialSummary({
  assessment,
}: {
  assessment: Assessment;
}) {
  const presentation = assessmentCardPresentation(assessment);

  if (presentation.kind === "public-domain") {
    return (
      <div className="mb-4 rounded-lg border border-info/20 bg-info-muted p-3">
        <Badge variant="outline">{presentation.label}</Badge>
        <div className="mt-2 text-sm font-semibold text-foreground">
          Financial baseline requires internal validation
        </div>
        <div className="mt-1 text-xs text-foreground-secondary">
          No internal financial data used
        </div>
      </div>
    );
  }

  return (
    <>
      {presentation.kind === "internal-demo" && (
        <div className="mb-3">
          <Badge variant="outline">{presentation.label}</Badge>
          <p className="mt-1 text-xs text-foreground-secondary">
            {presentation.description}
          </p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat
          icon={IndianRupee}
          label="Revenue target"
          value={formatCurrency(assessment.revenueTarget)}
        />
        <Stat
          icon={TrendingUp}
          label="Margin target"
          value={`${assessment.marginTarget}%`}
        />
        <Stat
          icon={Target}
          label="Cash target"
          value={formatCurrency(assessment.cashTarget)}
        />
      </div>
    </>
  );
}

function StatusPill({ status }: { status: AssessmentStatus }) {
  const map: Record<
    AssessmentStatus,
    { label: string; variant: "default" | "success" | "warning" | "info" | "outline" }
  > = {
    draft: { label: "Draft", variant: "outline" },
    intake: { label: "Intake", variant: "info" },
    ingestion: { label: "Processing", variant: "info" },
    analyzing: { label: "Analyzing", variant: "info" },
    analysis: { label: "Analysis ready", variant: "default" },
    analysis_ready: { label: "Analysis ready", variant: "default" },
    analysis_failed: { label: "Analysis failed", variant: "warning" },
    review: { label: "Review", variant: "warning" },
    delivered: { label: "Delivered", variant: "success" },
  };
  const entry = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted mb-0.5">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
