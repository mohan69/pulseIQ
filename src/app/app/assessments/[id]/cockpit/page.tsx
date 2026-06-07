import { notFound } from "next/navigation";
import {
  getAssessment,
  getCockpit,
} from "@/lib/assessment/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  XCircle,
  IndianRupee,
  BarChart3,
  Lightbulb,
  Activity,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  CockpitStatusBoard,
  RevenueMarginChart,
  WinRateLineChart,
  WorkingCapitalBars,
} from "@/components/workbench/CockpitCharts";

export default async function CockpitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = getAssessment(id);
  if (!assessment) notFound();
  const cockpit = getCockpit(id);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-foreground">Executive cockpit</h2>
          {assessment.id === "asm-bharat-heavy-fabrications" && (
            <span className="text-[10px] bg-accent-muted text-accent px-1.5 py-0.5 rounded">Demo data</span>
          )}
        </div>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Headline metrics vs. board-approved targets, with working-capital and
          win-rate views. Status is derived from each metric&apos;s gap to target.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  Revenue & margin trajectory
                </CardTitle>
                <CardDescription className="mt-1">
                  Actual vs. forecast vs. target
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueMarginChart metrics={cockpit.metrics} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              Metric status
            </CardTitle>
            <CardDescription className="mt-1">
              {cockpit.metrics.length} headline metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CockpitStatusBoard cockpit={cockpit} />
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="rounded-lg bg-success-muted py-2">
                <div className="text-lg font-bold text-success">
                  {cockpit.metrics.filter((m) => m.status === "on_track").length}
                </div>
                <div className="text-[10px] text-success">on track</div>
              </div>
              <div className="rounded-lg bg-warning-muted py-2">
                <div className="text-lg font-bold text-warning">
                  {cockpit.metrics.filter((m) => m.status === "at_risk").length}
                </div>
                <div className="text-[10px] text-warning">at risk</div>
              </div>
              <div className="rounded-lg bg-error-muted py-2">
                <div className="text-lg font-bold text-error">
                  {cockpit.metrics.filter((m) => m.status === "off_track").length}
                </div>
                <div className="text-[10px] text-error">off track</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All headline metrics</CardTitle>
          <CardDescription>
            Each metric shows actual vs. board-approved target with a status flag.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {cockpit.metrics.map((m) => {
              const gap = m.value - m.target;
              const gapPositive = gap > 0;
              const formatVal = (v: number) =>
                m.unit === "%"
                  ? `${v.toFixed(0)}%`
                  : m.unit === "₹/employee"
                    ? formatCurrency(v)
                    : formatCurrency(v);
              return (
                <div
                  key={m.key}
                  className="rounded-xl border border-border bg-white p-4"
                >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted">{m.label}</span>
        <StatusDot status={m.status} />
      </div>
      <div className="text-xl font-bold text-foreground leading-none">
        {formatVal(m.value)}
      </div>
      <div className="text-[11px] text-muted mt-1">
        Target {formatVal(m.target)} · Variance{" "}
        <span
          className={
            gapPositive
              ? "text-success font-medium"
              : "text-error font-medium"
          }
        >
          {gapPositive ? "+" : ""}
          {formatVal(gap)}
        </span>
      </div>
                  <div className="text-[11px] text-foreground-secondary mt-2 line-clamp-2">
                    {m.note}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Proposal win rate
            </CardTitle>
            <CardDescription>Quarterly trajectory to FY26 plan</CardDescription>
          </CardHeader>
          <CardContent>
            <WinRateLineChart metrics={cockpit.metrics} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-accent" />
              Working capital deployment
            </CardTitle>
            <CardDescription>Receivables + inventory vs. payables</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkingCapitalBars metrics={cockpit.metrics} />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-error" />
              Top risks
            </CardTitle>
            <CardDescription>
              Highest-likelihood, highest-impact items surfaced by the workbench.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cockpit.topRisks.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-error/20 bg-error-muted/40 p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="font-semibold text-foreground">{r.title}</div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="destructive" className="text-[10px]">
                      L: {r.likelihood}
                    </Badge>
                    <Badge variant="destructive" className="text-[10px]">
                      I: {r.impact}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-foreground-secondary">
                  {r.description}
                </div>
              </div>
            ))}
            {cockpit.topRisks.length === 0 && (
              <div className="text-sm text-muted italic">No risks surfaced yet.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-success" />
              Top opportunities
            </CardTitle>
            <CardDescription>
              Highest-value moves sized in rupees and timeframe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cockpit.topOpportunities.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-success/20 bg-success-muted/40 p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="font-semibold text-foreground">{o.title}</div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-success">
                      {formatCurrency(o.impactInr)}
                    </div>
                    <div className="text-[10px] text-muted">
                      {o.timeframeDays} days
                    </div>
                  </div>
                </div>
                <div className="text-sm text-foreground-secondary">
                  {o.description}
                </div>
              </div>
            ))}
            {cockpit.topOpportunities.length === 0 && (
              <div className="text-sm text-muted italic">No opportunities surfaced yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === "on_track")
    return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "at_risk")
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  return <XCircle className="h-4 w-4 text-error" />;
}
