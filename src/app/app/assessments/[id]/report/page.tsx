import { notFound } from "next/navigation";
import { getReport, getAssessment } from "@/lib/assessment/store";
import { Badge } from "@/components/ui/badge";
import { formatExecutiveCurrency } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Shield,
  GitBranch,
  ListChecks,
  Calendar,
} from "lucide-react";
import { ReportPrintButton } from "@/components/workbench/ReportPrintButton";

const PRIORITY_LABEL: Record<string, string> = {
  P0: "Critical",
  P1: "High",
  P2: "Medium",
  P3: "Low",
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();
  const assessment = await getAssessment(id);
  const isDemo = assessment?.id === "asm-bharat-heavy-fabrications";

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-foreground">Board report</h2>
            {isDemo && (
              <span className="text-[10px] bg-accent-muted text-accent px-1.5 py-0.5 rounded">Demo data</span>
            )}
          </div>
          <p className="text-sm text-muted mt-1">
            Print-ready, two-column friendly. Use the button below to print or
            save as PDF.
          </p>
        </div>
        <ReportPrintButton assessmentId={id} />
      </div>

      <article className="rounded-2xl border border-border bg-white p-6 lg:p-10 print:border-0 print:p-0 print:shadow-none space-y-8 print:space-y-6 max-w-3xl mx-auto">
        <header className="border-b border-border pb-6 print:pb-4">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            PulseIQ board report
          </div>
          <h1 className="text-2xl print:text-3xl font-bold text-foreground">
            Operating truth &amp; 90-day plan
          </h1>
          <div className="text-sm text-muted mt-2">
            Generated {new Date(report.generatedAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })} · {report.sourceCount} sources · {report.factCount} facts
          </div>
        </header>

        <section>
          <SectionTitle icon={Sparkles}>Executive summary</SectionTitle>
          <p className="text-foreground leading-relaxed">
            {report.executiveSummary}
          </p>
        </section>

        <section>
          <SectionTitle icon={BarChart3Icon}>Cockpit</SectionTitle>
          <div className="grid md:grid-cols-2 gap-3 print:grid-cols-2">
            {report.cockpit.metrics.map((m) => {
              const gap = m.target - m.value;
              const formatVal = (v: number) =>
                m.unit === "%"
                  ? `${v.toFixed(0)}%`
                  : formatExecutiveCurrency(v, {
                      suffix: m.unit === "₹/employee" ? "/emp" : undefined,
                    });
              return (
                <div
                  key={m.key}
                  className="rounded-xl border border-border bg-background-alt p-4"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted">{m.label}</span>
                    <StatusPill status={m.status} />
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {formatVal(m.value)}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    Target {formatVal(m.target)} ·{" "}
                    <span
                      className={
                        gap >= 0
                          ? "text-success font-semibold"
                          : "text-error font-semibold"
                      }
                    >
                      {gap >= 0 ? "+" : ""}
                      {formatVal(gap)}
                    </span>
                  </div>
                  <div className="text-xs text-foreground-secondary mt-2">
                    {m.note}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {report.cockpit.topRisks.length > 0 && (
          <section>
            <SectionTitle icon={AlertTriangle}>Top risks</SectionTitle>
            <ul className="space-y-2">
              {report.cockpit.topRisks.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-error/20 bg-error-muted/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-semibold text-foreground">
                      {r.title}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="destructive" className="text-[10px]">
                        Likelihood: {r.likelihood}
                      </Badge>
                      <Badge variant="destructive" className="text-[10px]">
                        Impact: {r.impact}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    {r.description}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {report.cockpit.topOpportunities.length > 0 && (
          <section>
            <SectionTitle icon={Lightbulb}>Top opportunities</SectionTitle>
            <ul className="space-y-2">
              {report.cockpit.topOpportunities.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-success/20 bg-success-muted/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-semibold text-foreground">
                      {o.title}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-success">
                        {formatExecutiveCurrency(o.impactInr)}
                      </div>
                      <div className="text-[10px] text-muted">
                        {o.timeframeDays} days
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    {o.description}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <SectionTitle icon={LayersIcon}>Truth map</SectionTitle>
          <div className="space-y-3">
            {report.truthLayers.map((l) => (
              <div
                key={l.key}
                className="rounded-xl border border-border p-4 print:break-inside-avoid"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-semibold text-foreground">{l.title}</div>
                  <div className="text-[11px] text-muted">
                    {l.findings.length} findings · {l.confidence} confidence
                  </div>
                </div>
                <div className="text-xs text-muted mb-2">{l.description}</div>
                {l.findings.length > 0 && (
                  <ul className="space-y-1 text-sm text-foreground">
                    {l.findings.map((f) => (
                      <li key={f.id} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        {f.text}
                      </li>
                    ))}
                  </ul>
                )}
                {l.gaps.length > 0 && (
                  <div className="mt-2 text-xs text-warning">
                    Gaps: {l.gaps.join("; ")}
                  </div>
                )}
                {l.contradictions.length > 0 && (
                  <div className="mt-1 text-xs text-error">
                    Inconsistencies: {l.contradictions.join("; ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {report.dataGaps.length > 0 && (
          <section>
            <SectionTitle icon={Shield}>Data gaps to close</SectionTitle>
            <ul className="space-y-1 text-sm text-foreground-secondary">
              {report.dataGaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  {g}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <SectionTitle icon={GitBranch}>What-if scenarios</SectionTitle>
          <div className="space-y-3">
            {report.scenarios.map((s) => (
              <div
                key={s.key}
                className="rounded-xl border border-border p-4 print:break-inside-avoid"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-foreground">{s.label}</div>
                  <Badge variant="outline" className="text-[10px]">
                    {s.confidence}
                  </Badge>
                </div>
                <p className="text-sm text-foreground-secondary mb-2">
                  {s.description}
                </p>
                <div className="grid md:grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-background-alt p-2">
                    <span className="text-muted">Baseline:</span>{" "}
                    <span className="text-foreground">{s.currentBaseline}</span>
                  </div>
                  <div className="rounded bg-accent-muted p-2">
                    <span className="text-accent">Target:</span>{" "}
                    <span className="text-foreground">{s.target}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-foreground">
                  <span className="font-semibold">Recommendation:</span>{" "}
                  {s.recommendation}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={ListChecks}>Top 10 recommendations</SectionTitle>
          <ol className="space-y-2">
            {report.recommendations.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-border p-3 print:break-inside-avoid"
              >
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-accent-muted flex items-center justify-center text-sm font-bold text-accent shrink-0">
                    {r.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <div className="font-semibold text-foreground">
                        {r.title}
                      </div>
                      <Badge variant="destructive" className="text-[10px]">
                        {PRIORITY_LABEL[r.priority] ?? r.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-foreground-secondary">
                      {r.description}
                    </div>
                    <div className="grid md:grid-cols-3 gap-2 mt-2 text-[11px]">
                      <div>
                        <span className="text-muted">Impact: </span>
                        <span className="text-success font-semibold">
                          {r.businessImpact}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Owner: </span>
                        <span className="text-foreground font-medium">
                          {r.ownerRole}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">In </span>
                        <span className="text-foreground font-medium">
                          {r.timeframeDays} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <SectionTitle icon={Calendar}>90-day execution plan</SectionTitle>
          <div className="space-y-3">
            {report.plan.map((p) => (
              <div
                key={p.phase}
                className="rounded-xl border border-border p-4 print:break-inside-avoid"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="h-9 w-9 rounded-lg bg-accent-muted flex items-center justify-center text-sm font-bold text-accent shrink-0">
                    {p.phase}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                      {p.windowLabel}
                    </div>
                    <div className="font-semibold text-foreground">{p.title}</div>
                  </div>
                </div>
                <p className="text-sm text-foreground-secondary mb-2">
                  {p.description}
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  {p.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-6 border-t border-border text-[11px] text-muted print:mt-8">
          PulseIQ Workbench MVP · Internal admin use only · Read-only by design.
          This report is a synthesis of the sources registered for this
          assessment and is meant to support — not replace — management review.
        </footer>
      </article>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-3 print:text-lg">
      <Icon className="h-4 w-4 text-accent" />
      {children}
    </h2>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "on_track")
    return (
      <Badge variant="success" className="text-[10px]">
        on track
      </Badge>
    );
  if (status === "at_risk")
    return (
      <Badge variant="warning" className="text-[10px]">
        at risk
      </Badge>
    );
  return (
    <Badge variant="destructive" className="text-[10px]">
      off track
    </Badge>
  );
}

// Tiny presentational icons used in the report (avoid name collisions)
function BarChart3Icon(p: { className?: string }) {
  return (
    <svg
      className={p.className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
function LayersIcon(p: { className?: string }) {
  return (
    <svg
      className={p.className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.91a1 1 0 0 0 0-1.83Z" />
      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.91A1 1 0 0 0 22 12" />
      <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.91A1 1 0 0 0 22 17" />
    </svg>
  );
}
