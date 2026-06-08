import { notFound } from "next/navigation";
import {
  getAssessment,
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
import {
  Layers,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  XCircle,
  Lightbulb,
} from "lucide-react";

const LAYER_ORDER = [
  "financial",
  "strategic",
  "operational",
  "process",
  "collaboration",
] as const;

export default async function TruthMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await getAssessment(id);
  if (!assessment) notFound();
  const layers = await getTruthLayers(id);
  const ordered = LAYER_ORDER.map(
    (k) => layers.find((l) => l.key === k) ?? layers[0],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Truth map</h2>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Five canonical layers reconcile what the company says, what the
          numbers say, what the operations say, and what the process and
          collaboration signals say. Gaps and contradictions are surfaced
          honestly — they are the point of the diagnostic.
        </p>
      </div>

      <div className="space-y-4">
        {ordered.map((layer) => (
          <Card key={layer.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="h-4 w-4 text-accent" />
                    {layer.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {layer.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      layer.findings.length > 0
                        ? layer.confidence === "high"
                          ? "success"
                          : "warning"
                        : "outline"
                    }
                  >
                    {layer.findings.length} findings
                  </Badge>
                  <Badge
                    variant={
                      layer.confidence === "high"
                        ? "success"
                        : layer.confidence === "medium"
                          ? "warning"
                          : "outline"
                    }
                  >
                    {layer.confidence} confidence
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {layer.findings.length === 0 && layer.gaps.length === 0 && (
                <div className="text-sm text-muted italic">
                  No findings yet for this layer.
                </div>
              )}

              {layer.findings.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Findings
                  </div>
                  <ul className="space-y-2">
                    {layer.findings.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <ImpactIcon impact={f.impact} />
                        <span className="text-foreground">{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {layer.evidence.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Evidence ({layer.evidence.length})
                  </div>
                  <ul className="space-y-1.5">
                    {layer.evidence.slice(0, 4).map((e, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-foreground-secondary bg-background-alt border border-border-subtle rounded-lg px-3 py-2"
                      >
                        <span className="text-muted">“</span>
                        <span className="italic">{e.excerpt}</span>
                        <span className="text-muted">”</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {layer.gaps.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 flex items-center gap-1.5">
                    <Lightbulb className="h-3 w-3" />
                    Gaps
                  </div>
                  <ul className="space-y-1.5">
                    {layer.gaps.map((g, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-warning"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {layer.contradictions.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 flex items-center gap-1.5">
                    <XCircle className="h-3 w-3" />
                    Inconsistencies
                  </div>
                  <ul className="space-y-1.5">
                    {layer.contradictions.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-error"
                      >
                        <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center py-4 text-sm text-muted border-t border-border-subtle mt-2">
        The Collaboration layer is intentionally empty in the demo — no email or
        meeting sources were registered. In a full engagement, this is where
        decision ownership and accountability signals would surface.
      </div>
    </div>
  );
}

function ImpactIcon({ impact }: { impact: "high" | "medium" | "low" }) {
  if (impact === "high")
    return <TrendingUp className="h-4 w-4 text-error shrink-0 mt-0.5" />;
  if (impact === "medium")
    return <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />;
  return <TrendingDown className="h-4 w-4 text-muted shrink-0 mt-0.5" />;
}
