import { notFound } from "next/navigation";
import { getAssessment, getRecommendations } from "@/lib/assessment/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ListChecks,
  Clock,
  User,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const PRIORITY_LABEL: Record<string, string> = {
  P0: "Critical",
  P1: "High",
  P2: "Medium",
  P3: "Low",
};

const PRIORITY_VARIANT: Record<
  string,
  "default" | "success" | "warning" | "destructive" | "info" | "outline"
> = {
  P0: "destructive",
  P1: "warning",
  P2: "info",
  P3: "outline",
};

const EFFORT_VARIANT: Record<
  string,
  "default" | "success" | "warning" | "destructive" | "info" | "outline"
> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

const CONFIDENCE_VARIANT: Record<
  string,
  "default" | "success" | "warning" | "destructive" | "info" | "outline"
> = {
  high: "success",
  medium: "warning",
  low: "outline",
};

export default async function RecommendationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = getAssessment(id);
  if (!assessment) notFound();
  const recs = getRecommendations(id);

  const p0 = recs.filter((r) => r.priority === "P0").length;
  const p1 = recs.filter((r) => r.priority === "P1").length;
  const p2 = recs.filter((r) => r.priority === "P2").length;
  const p3 = recs.filter((r) => r.priority === "P3").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-foreground">Top 10 recommendations</h2>
          {assessment.id === "asm-bharat-heavy-fabrications" && (
            <span className="text-[10px] bg-accent-muted text-accent px-1.5 py-0.5 rounded">Demo data</span>
          )}
        </div>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Ranked by priority, business impact, and confidence. Each item lists
          its owner, timeframe, and the evidence that supports it. Designed to
          be sliced directly into the management review.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PriorityCount label="Critical — act now" value={p0} variant="destructive" />
        <PriorityCount label="High — this quarter" value={p1} variant="warning" />
        <PriorityCount label="Medium — next quarter" value={p2} variant="info" />
        <PriorityCount label="Low — hygiene" value={p3} variant="outline" />
      </div>

      <div className="space-y-3">
        {recs.map((r) => (
          <Card key={r.id} className="hover:shadow-sm transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-accent">
                    {r.rank}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CardTitle className="text-base">{r.title}</CardTitle>
                    <Badge variant={PRIORITY_VARIANT[r.priority]}>
                      {PRIORITY_LABEL[r.priority] ?? r.priority}
                    </Badge>
                    <Badge variant={EFFORT_VARIANT[r.effort]}>
                      {r.effort} effort
                    </Badge>
                    <Badge variant={CONFIDENCE_VARIANT[r.confidence]}>
                      {r.confidence} confidence
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {r.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <Meta
                  icon={TrendingUp}
                  label="Business impact"
                  value={r.businessImpact}
                  tone="success"
                />
                <Meta
                  icon={Clock}
                  label="Timeframe"
                  value={`${r.timeframeDays} days`}
                />
                <Meta
                  icon={User}
                  label="Owner"
                  value={r.ownerRole}
                />
                <Meta
                  icon={Zap}
                  label="Confidence"
                  value={r.confidence}
                />
              </div>
              <div className="rounded-lg bg-background-alt border border-border-subtle p-3 flex items-start gap-2">
                {r.confidence === "high" ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-0.5">
                    Evidence
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    {r.evidence}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {recs.length === 0 && (
          <Card className="p-10 text-center">
            <div className="text-muted italic">No recommendations yet for this assessment.</div>
          </Card>
        )}
      </div>
    </div>
  );
}

function PriorityCount({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "destructive" | "warning" | "info" | "outline";
}) {
  const toneClass = {
    destructive: "bg-error-muted text-error border-error/20",
    warning: "bg-warning-muted text-warning border-warning/20",
    info: "bg-info-muted text-info border-info/20",
    outline: "bg-background text-muted border-border",
  }[variant];
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-xs mt-1">{label}</div>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "default" | "success";
}) {
  const valueClass =
    tone === "success"
      ? "text-success font-semibold"
      : "text-foreground font-medium";
  return (
    <div className="rounded-lg bg-background-alt border border-border-subtle px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted mb-0.5">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={`text-sm ${valueClass}`}>{value}</div>
    </div>
  );
}

// Suppress unused-imports warning
void ListChecks;
