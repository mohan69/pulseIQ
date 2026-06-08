import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAssessment,
  getCockpit,
  getFacts,
  getRecommendations,
  getScenarios,
  getSources,
  getTruthLayers,
} from "@/lib/assessment/store";
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
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Target,
  TrendingUp,
  GitBranch,
  ListChecks,
  FileText,
  Layers,
  XCircle,
  Activity,
  Building2,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AssessmentOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await getAssessment(id);
  if (!assessment) notFound();
  const [sources, facts, layers, cockpit, scenarios, recs] =
    await Promise.all([
      getSources(id),
      getFacts(id),
      getTruthLayers(id),
      getCockpit(id),
      getScenarios(id),
      getRecommendations(id),
    ]);

  const offTrack = cockpit.metrics.filter((m) => m.status === "off_track");
  const atRisk = cockpit.metrics.filter((m) => m.status === "at_risk");
  const onTrack = cockpit.metrics.filter((m) => m.status === "on_track");
  const totalGaps = layers.reduce((acc, l) => acc + l.gaps.length, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Executive snapshot
              </CardTitle>
              <CardDescription className="mt-1">
                Synthesised from {sources.length} source{sources.length === 1 ? "" : "s"} and {facts.length} extracted fact{facts.length === 1 ? "" : "s"}.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Snapshot label="Off track" value={offTrack.length} icon={XCircle} tone="error" />
            <Snapshot label="At risk" value={atRisk.length} icon={AlertTriangle} tone="warning" />
            <Snapshot label="On track" value={onTrack.length} icon={CheckCircle2} tone="success" />
            <Snapshot label="Data gaps" value={totalGaps} icon={Layers} tone="info" />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Link href={`/app/assessments/${id}/sources`} className="block group">
          <Card className="h-full hover:shadow-md hover:border-accent/30 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sources</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition-colors" />
              </div>
              <CardDescription>
                {sources.length} registered · {sources.filter((s) => s.status === "parsed").length} parsed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {sources.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-foreground-secondary">
                    <Building2 className="h-3.5 w-3.5 text-muted shrink-0" />
                    <span className="truncate">{s.name}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {s.type.replace(/_/g, " ")}
                    </Badge>
                  </li>
                ))}
                {sources.length > 4 && (
                  <li className="text-xs text-muted pt-1">
                    + {sources.length - 4} more
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/app/assessments/${id}/truth-map`} className="block group">
          <Card className="h-full hover:shadow-md hover:border-accent/30 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Truth map</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition-colors" />
              </div>
              <CardDescription>
                {layers.filter((l) => l.findings.length > 0).length} of 5 layers populated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {layers.slice(0, 4).map((l) => (
                  <li key={l.key} className="flex items-center gap-2 text-foreground-secondary">
                    <Layers className="h-3.5 w-3.5 text-muted shrink-0" />
                    <span className="truncate">{l.title}</span>
                    <Badge
                      variant={
                        l.findings.length > 0
                          ? "success"
                          : l.gaps.length > 0
                            ? "warning"
                            : "outline"
                      }
                      className="ml-auto text-[10px]"
                    >
                      {l.findings.length} findings
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/app/assessments/${id}/cockpit`} className="block group">
          <Card className="h-full hover:shadow-md hover:border-accent/30 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Cockpit</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition-colors" />
              </div>
              <CardDescription>
                {cockpit.metrics.length} headline metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {cockpit.metrics.slice(0, 4).map((m) => (
                  <li key={m.key} className="flex items-center gap-2 text-foreground-secondary">
                    <Target className="h-3.5 w-3.5 text-muted shrink-0" />
                    <span className="truncate">{m.label}</span>
                    <Badge
                      variant={
                        m.status === "on_track"
                          ? "success"
                          : m.status === "at_risk"
                            ? "warning"
                            : "destructive"
                      }
                      className="ml-auto text-[10px]"
                    >
                      {m.status.replace(/_/g, " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Workbench highlights
          </CardTitle>
          <CardDescription>
            What the workbench will surface to leadership from this assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <Highlight
              icon={GitBranch}
              label="What-if scenarios"
              value={scenarios.length.toString()}
              detail="5 standard scenarios: revenue, margin, cost, headcount, cash."
              href={`/app/assessments/${id}/what-if`}
            />
            <Highlight
              icon={ListChecks}
              label="Recommendations"
              value={recs.length.toString()}
              detail="Top 10 ranked actions, each with impact, owner, and evidence."
              href={`/app/assessments/${id}/recommendations`}
            />
            <Highlight
              icon={FileText}
              label="Board-ready report"
              value="Ready"
              detail="Print-friendly report with executive summary and 90-day plan."
              href={`/app/assessments/${id}/report`}
            />
            <Highlight
              icon={TrendingUp}
              label="Top opportunity"
              value={
                cockpit.topOpportunities[0]
                  ? formatCurrency(cockpit.topOpportunities[0].impactInr)
                  : "—"
              }
              detail={
                cockpit.topOpportunities[0]?.title ?? "Add sources to surface opportunities."
              }
              href={`/app/assessments/${id}/cockpit`}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Last updated {new Date(assessment.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          {assessment.id === "asm-bharat-heavy-fabrications" && (
            <span className="ml-2 text-[10px] bg-accent-muted text-accent px-1.5 py-0.5 rounded">Demo data</span>
          )}
        </div>
        <Link href={`/app/assessments/${id}/report`}>
          <Button variant="outline" className="px-5">
            View board report
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Snapshot({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "success" | "warning" | "error" | "info";
}) {
  const toneClass = {
    success: "text-success bg-success-muted",
    warning: "text-warning bg-warning-muted",
    error: "text-error bg-error-muted",
    info: "text-info bg-info-muted",
  }[tone];
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle bg-background-alt">
      <div className={`h-9 w-9 rounded-lg ${toneClass} flex items-center justify-center shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xl font-bold text-foreground leading-none">{value}</div>
        <div className="text-[11px] text-muted mt-1">{label}</div>
      </div>
    </div>
  );
}

function Highlight({
  icon: Icon,
  label,
  value,
  detail,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 rounded-xl border border-border bg-white hover:border-accent/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-xs font-medium text-foreground-secondary">
          {label}
        </span>
      </div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted mt-0.5 line-clamp-2">{detail}</div>
      <div className="mt-2 text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Open →
      </div>
    </Link>
  );
}
