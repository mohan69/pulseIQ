import Link from "next/link";
import {
  listAssessments,
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
  Building2,
  FileStack,
  Layers,
  Activity,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WorkbenchDashboardPage() {
  const assessments = listAssessments();
  const demo = assessments.find((a) => a.id === "asm-bharat-heavy-fabrications");
  const demoSources = demo ? 8 : 0;
  const demoTruthLayers = demo ? 5 : 0;

  const stats = [
    {
      key: "assessments",
      label: "Assessments",
      value: assessments.length.toString(),
      hint: `${assessments.filter((a) => a.status === "draft").length} draft`,
      icon: Building2,
      color: "accent",
    },
    {
      key: "sources",
      label: "Sources registered",
      value: demoSources.toString(),
      hint: demo ? "across demo assessment" : "no demo assessment",
      icon: FileStack,
      color: "info",
    },
    {
      key: "truth",
      label: "Truth layers",
      value: demoTruthLayers.toString(),
      hint: demo ? "financial → collaboration" : "no demo assessment",
      icon: Layers,
      color: "success",
    },
    {
      key: "health",
      label: "Data readiness",
      value: demo ? "Ready" : "—",
      hint: demo ? "Demo seeded, no live connectors" : "Seed demo to begin",
      icon: Activity,
      color: demo ? "success" : "warning",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-muted px-3 py-1 text-xs font-medium text-accent mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Internal admin workbench
          </div>
          <h1 className="text-3xl font-bold text-foreground">Workbench dashboard</h1>
          <p className="text-foreground-secondary mt-1.5 max-w-2xl">
            Convert enterprise complexity into a board-ready operating truth map,
            what-if scenarios, recommendations, and a 90-day plan. Read-only by
            design — no customer access in the MVP.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/assessments/new">
            <Button className="px-5">
              <Plus className="h-4 w-4" />
              New assessment
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.key} className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl bg-${s.color}-muted flex items-center justify-center shrink-0`}
                >
                  <Icon className={`h-5 w-5 text-${s.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground leading-none">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted mt-1">{s.label}</div>
                </div>
              </div>
              <div className="text-xs text-muted mt-3">{s.hint}</div>
            </Card>
          );
        })}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent assessments
            </h2>
            <p className="text-sm text-muted">
              Latest work in flight. Click any row to open the assessment.
            </p>
          </div>
          <Link
            href="/app/assessments"
            className="text-sm font-medium text-accent hover:text-accent-hover inline-flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3">
          {assessments.slice(0, 4).map((a) => (
            <Link
              key={a.id}
              href={`/app/assessments/${a.id}`}
              className="block group"
            >
              <Card className="p-5 hover:shadow-md hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-muted shrink-0" />
                      <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                        {a.companyName}
                      </h3>
                      <StatusPill status={a.status} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span className="capitalize">{a.industry.replace(/_/g, " ")}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="capitalize">{a.objective.replace(/_/g, " ")}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>
                        Target {formatCurrency(a.revenueTarget)} · {a.marginTarget}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {assessments.length === 0 && (
            <Card className="p-10 text-center">
              <div className="text-muted mb-3">No assessments yet.</div>
              <Link href="/app/assessments/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create your first assessment
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              Intelligence engine
            </CardTitle>
            <CardDescription>
              How the workbench derives insights from your sources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row
              label="Mode"
              value="Demo (deterministic)"
              tone="info"
              icon={CheckCircle2}
            />
            <Row
              label="AI provider"
              value="Not configured"
              tone="warning"
              icon={AlertTriangle}
            />
            <Row
              label="Output validation"
              value="Schema-checked"
              tone="success"
              icon={CheckCircle2}
            />
            <p className="text-xs text-muted pt-2 leading-relaxed">
              The demo runs on a deterministic engine so numbers are stable for
              review. Connect an AI provider later to auto-extract facts from
              uploaded documents — all outputs stay schema-validated.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Workbench philosophy
            </CardTitle>
            <CardDescription>
              Operating principles for this MVP build.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              "Internal admin only — no customer portal in the MVP.",
              "Read-only philosophy: summarise, never surveil.",
              "Email and meeting sources are optional and summarised only.",
              "Every fact in the UI traces back to a source and confidence level.",
              "Data is in-memory by design — a Prisma adapter drops in later.",
            ].map((line) => (
              <div
                key={line}
                className="flex items-start gap-2 text-foreground-secondary"
              >
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>{line}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: "default" | "success" | "warning" | "info" | "outline" }
  > = {
    draft: { label: "Draft", variant: "outline" },
    intake: { label: "Intake", variant: "info" },
    ingestion: { label: "Ingestion", variant: "info" },
    analysis: { label: "Analysis", variant: "default" },
    review: { label: "Review", variant: "warning" },
    delivered: { label: "Delivered", variant: "success" },
  };
  const entry = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

function Row({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "info";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-info";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-foreground-secondary">{label}</span>
      <span className={`inline-flex items-center gap-1.5 ${toneClass} font-medium`}>
        <Icon className="h-3.5 w-3.5" />
        {value}
      </span>
    </div>
  );
}

// Suppress unused import warnings for icons imported for future use
void Sparkles;
