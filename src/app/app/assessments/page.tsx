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
import type { AssessmentStatus } from "@/lib/assessment/types";

export const dynamic = "force-dynamic";

export default async function AssessmentsListPage() {
  const assessments = await listAssessments();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
          <p className="text-sm text-muted mt-1">
            Every assessment in the workbench. Open one to see its truth map,
            cockpit, what-if, recommendations, and report.
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
            Start by creating an assessment. You can fill in targets now and
            attach sources on the next screen.
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
          {assessments.map((a) => (
            <Link key={a.id} href={`/app/assessments/${a.id}`} className="block group">
              <Card className="h-full hover:shadow-md hover:border-accent/30 transition-all">
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
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <Stat
                      icon={IndianRupee}
                      label="Revenue target"
                      value={formatCurrency(a.revenueTarget)}
                    />
                    <Stat
                      icon={TrendingUp}
                      label="Margin target"
                      value={`${a.marginTarget}%`}
                    />
                    <Stat
                      icon={Target}
                      label="Cash target"
                      value={formatCurrency(a.cashTarget)}
                    />
                  </div>
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
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
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
