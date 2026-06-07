import { notFound } from "next/navigation";
import { getAssessment, getScenarios } from "@/lib/assessment/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Lightbulb,
} from "lucide-react";

export default async function WhatIfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = getAssessment(id);
  if (!assessment) notFound();
  const scenarios = getScenarios(id);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-foreground">What-if scenarios</h2>
          {assessment.id === "asm-bharat-heavy-fabrications" && (
            <span className="text-[10px] bg-accent-muted text-accent px-1.5 py-0.5 rounded">Demo data</span>
          )}
        </div>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Five canonical scenarios — revenue, margin, cost, headcount, and cash —
          each with the levers, the trade-offs, and a recommendation. Designed
          to be reviewed in the board pre-read.
        </p>
      </div>

      <div className="space-y-4">
        {scenarios.map((s) => (
          <Card key={s.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-accent" />
                    {s.label}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {s.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    s.confidence === "high"
                      ? "success"
                      : s.confidence === "medium"
                        ? "warning"
                        : "outline"
                  }
                >
                  {s.confidence} confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-background-alt border border-border-subtle p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1.5 flex items-center gap-1.5">
                    <TrendingDown className="h-3 w-3" />
                    Current baseline
                  </div>
                  <div className="text-sm text-foreground">{s.currentBaseline}</div>
                </div>
                <div className="rounded-lg bg-accent-muted border border-accent/20 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-1.5 flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" />
                    Target
                  </div>
                  <div className="text-sm text-foreground">{s.target}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Options to consider
                </div>
                <ul className="grid md:grid-cols-2 gap-2">
                  {s.options.map((o, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground-secondary bg-white border border-border rounded-lg px-3 py-2"
                    >
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Pros
                  </div>
                  <ul className="space-y-1.5 text-sm text-foreground-secondary">
                    {s.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                    Shortfalls
                  </div>
                  <ul className="space-y-1.5 text-sm text-foreground-secondary">
                    {s.shortfalls.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-success-muted border border-success/20 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-success font-semibold mb-1.5">
                    Expected impact
                  </div>
                  <div className="text-sm text-foreground">{s.expectedImpact}</div>
                </div>
                <div className="rounded-lg bg-error-muted border border-error/20 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-error font-semibold mb-1.5">
                    Key risks
                  </div>
                  <ul className="space-y-1 text-sm text-foreground">
                    {s.risks.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-accent/30 bg-accent-muted/50 p-4 flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">
                    Recommendation
                  </div>
                  <div className="text-sm text-foreground">{s.recommendation}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {scenarios.length === 0 && (
          <Card className="p-10 text-center">
            <div className="text-muted italic">No scenarios built yet for this assessment.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
