import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Lightbulb,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatExecutiveCurrency } from "@/lib/utils";
import {
  DIAGNOSTIC_DISCLAIMER,
  DIAGNOSTIC_POSITIONING,
} from "@/lib/diagnostic-positioning";
import {
  isMicrofinishPublicDomain,
  metricRequiresInternalData,
  MICROFINISH_DISCLAIMER,
} from "@/lib/assessment/presentation";
import type {
  Assessment,
  CockpitMetric,
  Report,
  TopOpportunity,
  TopRisk,
  TruthFinding,
} from "@/lib/assessment/types";
import type {
  AssessmentReadiness,
  ReadinessEvidenceStatus,
} from "@/lib/readiness/types";

type BoardReportProps = {
  assessment: Assessment;
  report: Report;
  readiness: AssessmentReadiness;
};

type ScorecardItem = {
  label: string;
  value: string;
  status: "On track" | "At risk" | "Off track" | "Needs review";
  confidence: "high" | "medium" | "low";
  action: string;
};

type ReadinessTableRow = {
  area: string;
  status: string;
  gap: string;
  impact: string;
  owner: string;
  action: string;
};

const PROFESSIONAL_ROADMAP = [
  {
    window: "30 days",
    title: "Validate and index the baseline",
    actions: [
      "Validate internal financial baseline",
      "Build product-family revenue/margin view",
      "Create proposal register",
      "Index critical statutory and standards documents",
    ],
  },
  {
    window: "60 days",
    title: "Build qualification and control systems",
    actions: [
      "Build customer qualification pack",
      "Establish supplier qualification tracker",
      "Create working-capital visibility cockpit",
      "Implement AI output review workflow",
    ],
  },
  {
    window: "90 days",
    title: "Establish the operating rhythm",
    actions: [
      "Board operating cadence",
      "Customer audit readiness pack",
      "Standards evidence governance",
      "Scalable PulseIQ operating intelligence rhythm",
    ],
  },
] as const;

export function BoardReport({
  assessment,
  report,
  readiness,
}: BoardReportProps) {
  const isMicrofinish = isMicrofinishPublicDomain(assessment);
  const postureScore = average([
    readiness.cockpit.standardsReadinessScore,
    readiness.cockpit.customerQualificationReadiness,
    readiness.cockpit.statutoryEvidenceHealth,
    readiness.cockpit.supplierQualificationHealth,
    readiness.cockpit.aiGovernanceReadiness,
  ]);
  const topFindings = topTruthFindings(report);
  const topGaps = unique([
    ...report.truthLayers.flatMap((layer) => layer.gaps),
    ...readiness.criticalGaps,
  ]).slice(0, 5);
  const evidenceRequests = unique([
    ...report.dataGaps,
    ...report.truthLayers.flatMap((layer) => layer.gaps),
  ]).slice(0, 5);
  const scorecard = buildScorecard(assessment, report, readiness);
  const readinessRows = buildReadinessRows(readiness);

  return (
    <article
      className="board-report mx-auto max-w-[980px] overflow-hidden rounded-2xl border border-border bg-white shadow-sm print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none"
      data-testid="board-report"
    >
      <section className="board-page board-cover relative flex min-h-[820px] flex-col justify-between bg-navy px-10 py-12 text-white print:min-h-[255mm] print:px-0 print:py-0">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">
            RightSense Diagnostic Report
          </div>
          <div className="mt-2 text-sm text-white/75">Powered by PulseIQ</div>
        </div>
        <div className="max-w-3xl">
          <div className="mb-5 h-1 w-20 rounded-full bg-cyan" />
          <h1 className="text-4xl font-bold leading-tight text-white print:text-3xl">
            {assessment.companyName}
          </h1>
          <p className="mt-4 text-xl leading-relaxed text-white/85">
            {isMicrofinish
              ? "Public-domain Enterprise Intelligence, Compliance & Standards Diagnostic"
              : "Enterprise Intelligence, Compliance & Standards Diagnostic"}
          </p>
        </div>
        <div className="grid gap-6 border-t border-white/20 pt-7 text-sm text-white/80 sm:grid-cols-2">
          <CoverDetail label="Generated" value={formatDate(report.generatedAt)} />
          <CoverDetail
            label="Diagnostic type"
            value={assessment.objective.replace(/_/g, " ")}
          />
          <CoverDetail
            label="Evidence base"
            value={`${report.sourceCount} indexed sources · ${report.factCount} facts`}
          />
          <CoverDetail
            label="Confidentiality"
            value="Confidential · Internal leadership and approved advisers only"
          />
        </div>
        <div
          className="mt-7 rounded-xl border border-white/25 bg-white/10 p-4 text-sm leading-relaxed text-white/85"
          data-testid="cover-note"
        >
          {isMicrofinish
            ? "Public-domain sample / internal validation required. Readiness indicators do not constitute certification, audit, statutory, regulatory, or customer approval."
            : "Decision-support diagnostic based on indexed evidence. Readiness indicators require human validation and do not constitute certification, audit, statutory, regulatory, or customer approval."}
        </div>
      </section>

      <section className="board-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 1"
          title="Executive Decision Summary"
          description={DIAGNOSTIC_POSITIONING}
        />
        <div className="mt-7 grid gap-4 md:grid-cols-3 print:grid-cols-3">
          <DecisionMetric
            label="Overall readiness posture"
            value={`${postureScore}%`}
            detail={postureLabel(postureScore)}
          />
          <DecisionMetric
            label="Critical readiness gaps"
            value={readiness.cockpit.criticalGaps.toString()}
            detail="Leadership closure required"
          />
          <DecisionMetric
            label="Revenue blocked by evidence gaps"
            value={formatExecutiveCurrency(
              readiness.cockpit.revenueBlockedByGaps,
            )}
            detail="Illustrative exposure, not a forecast"
          />
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-2 print:grid-cols-2">
          <DecisionList
            icon={AlertTriangle}
            title="Top 3 risks"
            items={report.cockpit.topRisks.slice(0, 3).map(riskLine)}
            tone="risk"
          />
          <DecisionList
            icon={Lightbulb}
            title="Top 3 opportunities"
            items={report.cockpit.topOpportunities.slice(0, 3).map(opportunityLine)}
            tone="opportunity"
          />
          <DecisionList
            icon={Target}
            title="Immediate 14-day actions"
            items={[
              "Confirm the executive sponsor and accountable evidence owners.",
              "Validate revenue, margin, working-capital, and productivity baselines.",
              "Open the controlled proposal register and approval checkpoint.",
              "Prioritize critical standards, statutory, customer, and supplier evidence requests.",
            ]}
          />
          <DecisionList
            icon={FileCheck2}
            title="Internal data required"
            items={
              evidenceRequests.length
                ? evidenceRequests
                : ["Approved internal financial, commercial, operating, and compliance evidence."]
            }
          />
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 print:grid-cols-2">
          <DecisionCallout
            label="Board decision required"
            text="Approve the 90-day evidence-readiness and operating-intelligence closure program, including named owners and monthly Board review."
          />
          <DecisionCallout
            label="Executive sponsor required"
            text="Nominate a CFO/COO-level sponsor with authority across Commercial, Quality, Compliance, Procurement, IT, and Operations."
          />
        </div>
      </section>

      <section className="board-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 2"
          title="Board Scorecard"
          description="Decision signals derived from the existing cockpit and structured evidence-readiness register."
        />
        <div className="mt-7 grid gap-4 md:grid-cols-3 print:grid-cols-3">
          {scorecard.map((item) => (
            <ScorecardCard key={item.label} item={item} />
          ))}
        </div>
      </section>

      <section className="board-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 3"
          title="Priority Findings and Evidence Requests"
          description="The main report shows only the highest-priority decision signals. Full truth-layer detail is retained in the appendix."
        />
        <div className="mt-7 grid gap-6 md:grid-cols-3 print:grid-cols-3">
          <NumberedList title="Top 5 findings" items={topFindings.map((item) => item.text)} />
          <NumberedList title="Top 5 gaps" items={topGaps} />
          <NumberedList title="Top 5 evidence requests" items={evidenceRequests} />
        </div>

        <h3 className="mt-10 text-lg font-bold text-foreground">
          Readiness action table
        </h3>
        <div className="mt-4 overflow-x-auto print:overflow-visible">
          <table className="board-table w-full min-w-[900px] border-collapse text-left text-xs print:min-w-0">
            <thead>
              <tr>
                {[
                  "Area",
                  "Current status",
                  "Evidence gap",
                  "Business impact",
                  "Owner",
                  "30-day action",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readinessRows.map((row) => (
                <tr key={row.area}>
                  <td className="font-semibold">{row.area}</td>
                  <td>{row.status}</td>
                  <td>{row.gap}</td>
                  <td>{row.impact}</td>
                  <td>{row.owner}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="board-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 4"
          title="30 / 60 / 90-Day Leadership Roadmap"
          description="A management-owned closure sequence, replacing raw generated action text with a consistent operating plan."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3 print:grid-cols-3">
          {PROFESSIONAL_ROADMAP.map((phase) => (
            <div
              key={phase.window}
              className="board-avoid-break rounded-xl border border-border p-5"
            >
              <Badge>{phase.window}</Badge>
              <h3 className="mt-4 text-base font-bold text-foreground">
                {phase.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-foreground-secondary">
                {phase.actions.map((action) => (
                  <li key={action} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section
        className="board-page board-page-break px-8 py-10 print:px-0 print:py-0"
        data-testid="truth-map-appendix"
      >
        <BoardSectionHeader
          eyebrow="Appendix A"
          title="Detailed Truth Map"
          description="Supporting layer detail retained for management review and source follow-up."
        />
        <div className="mt-7 space-y-5">
          {report.truthLayers.map((layer) => (
            <div
              key={layer.key}
              className="board-avoid-break rounded-xl border border-border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-foreground">{layer.title}</h3>
                  <p className="mt-1 text-sm text-muted">{layer.description}</p>
                </div>
                <Badge variant="outline">{layer.confidence} confidence</Badge>
              </div>
              <div className="mt-4 grid gap-5 md:grid-cols-2 print:grid-cols-2">
                <AppendixList
                  title="Findings"
                  items={layer.findings.map((finding) => finding.text)}
                />
                <AppendixList title="Evidence gaps" items={layer.gaps} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="board-page board-page-break px-8 py-10 print:px-0 print:py-0"
        data-testid="disclaimer-appendix"
      >
        <BoardSectionHeader
          eyebrow="Appendix B"
          title="Method, Evidence Boundary, and Disclaimer"
          description="The Board should read all conclusions within the evidence and human-review boundaries below."
        />
        <div className="mt-8 rounded-xl border border-warning/30 bg-warning-muted p-6">
          <p className="text-sm leading-7 text-foreground-secondary">
            {DIAGNOSTIC_DISCLAIMER}
          </p>
          {isMicrofinish && (
            <p className="mt-4 text-sm leading-7 text-foreground-secondary">
              {MICROFINISH_DISCLAIMER}
            </p>
          )}
          <p className="mt-4 text-sm leading-7 text-foreground-secondary">
            Scores and revenue exposure are diagnostic prioritization aids,
            not forecasts, audit opinions, legal advice, certification
            decisions, or representations of customer acceptance. Human review
            and approved source evidence are required before management action.
          </p>
        </div>
      </section>

      <footer className="board-print-footer">
        <span>Internal admin use only · Human review required</span>
        <span className="board-page-number" />
      </footer>
    </article>
  );
}

function buildScorecard(
  assessment: Assessment,
  report: Report,
  readiness: AssessmentReadiness,
): ScorecardItem[] {
  const revenue = report.cockpit.metrics.find((metric) => metric.key === "revenue");
  const margin = report.cockpit.metrics.find((metric) => metric.key === "margin");
  const productivity = report.cockpit.metrics.find(
    (metric) => metric.key === "rpe" || metric.key === "productivity",
  );
  return [
    metricScorecard(
      "Revenue signal",
      revenue,
      assessment,
      "Validate the monthly revenue bridge and product-family pipeline.",
    ),
    metricScorecard(
      "Margin signal",
      margin,
      assessment,
      "Approve product-family margin ownership and leakage reviews.",
    ),
    metricScorecard(
      "Productivity visibility",
      productivity,
      assessment,
      "Confirm headcount and capacity data before setting productivity actions.",
    ),
    readinessScorecard(
      "Standards readiness",
      readiness.cockpit.standardsReadinessScore,
      "Quality / Engineering",
      "Index applicable standards evidence and assign closure owners.",
    ),
    readinessScorecard(
      "Customer qualification readiness",
      readiness.cockpit.customerQualificationReadiness,
      "Commercial Operations",
      "Build the controlled customer prequalification evidence pack.",
    ),
    readinessScorecard(
      "Statutory readiness",
      readiness.cockpit.statutoryEvidenceHealth,
      "Compliance / CFO",
      "Index current statutory documents, expiries, and review evidence.",
    ),
    readinessScorecard(
      "Supplier readiness",
      readiness.cockpit.supplierQualificationHealth,
      "Procurement",
      "Establish critical-supplier qualification and dependency tracking.",
    ),
    readinessScorecard(
      "AI governance readiness",
      readiness.cockpit.aiGovernanceReadiness,
      "AI Governance Owner",
      "Implement traceable human output review and approval history.",
    ),
    {
      label: "Revenue blocked by evidence gaps",
      value: formatExecutiveCurrency(readiness.cockpit.revenueBlockedByGaps),
      status:
        readiness.cockpit.revenueBlockedByGaps > 0 ? "At risk" : "On track",
      confidence: "low",
      action: "Validate opportunity-level exposure before Board forecasting.",
    },
  ];
}

function metricScorecard(
  label: string,
  metric: CockpitMetric | undefined,
  assessment: Assessment,
  action: string,
): ScorecardItem {
  if (!metric || metricRequiresInternalData(assessment, metric)) {
    return {
      label,
      value: "Internal data required",
      status: "Needs review",
      confidence: "low",
      action,
    };
  }
  return {
    label,
    value:
      metric.unit === "%"
        ? `${metric.value.toFixed(0)}%`
        : formatExecutiveCurrency(metric.value, {
            suffix: metric.unit === "₹/employee" ? "/emp" : undefined,
          }),
    status: statusLabel(metric.status),
    confidence: "high",
    action,
  };
}

function readinessScorecard(
  label: string,
  score: number,
  owner: string,
  action: string,
): ScorecardItem {
  return {
    label,
    value: `${score}%`,
    status: score >= 75 ? "On track" : score >= 50 ? "At risk" : "Off track",
    confidence: "medium",
    action: `${action} Owner: ${owner}.`,
  };
}

function buildReadinessRows(
  readiness: AssessmentReadiness,
): ReadinessTableRow[] {
  const missingStandard = readiness.standards.find((item) =>
    isGap(item.status),
  );
  const customer = readiness.customerQualification.find((item) =>
    isGap(item.status),
  );
  const statutory = readiness.statutory.find((item) =>
    isGap(item.evidenceStatus),
  );
  const supplier = readiness.suppliers.find((item) =>
    isGap(item.qualificationStatus),
  );
  const ai = readiness.aiGovernance.find((item) => isGap(item.status));
  return [
    {
      area: "Standards",
      status: `${readiness.cockpit.standardsReadinessScore}% readiness`,
      gap: missingStandard?.gaps[0] ?? "No priority gap recorded",
      impact:
        missingStandard?.businessImpact ??
        "May affect bid, audit, or customer evidence readiness",
      owner: missingStandard?.owner ?? "Quality / Engineering",
      action: "Confirm applicability and index approved evidence.",
    },
    {
      area: "Customer qualification",
      status: `${readiness.cockpit.customerQualificationReadiness}% readiness`,
      gap: customer?.missingEvidence[0] ?? "No priority gap recorded",
      impact:
        customer && customer.revenueAtRisk > 0
          ? `${formatExecutiveCurrency(customer.revenueAtRisk)} illustrative exposure`
          : "May delay customer or vendor registration",
      owner: customer?.owner ?? "Commercial Operations",
      action: "Build a controlled prequalification evidence pack.",
    },
    {
      area: "Statutory evidence",
      status: `${readiness.cockpit.statutoryEvidenceHealth}% health`,
      gap: statutory?.gap ?? "No priority gap recorded",
      impact: "May affect audit, license, tax, or customer assurance readiness",
      owner: statutory?.owner ?? "Compliance Lead",
      action: "Index documents, expiries, review dates, and source links.",
    },
    {
      area: "Supplier ecosystem",
      status: `${readiness.cockpit.supplierQualificationHealth}% health`,
      gap:
        supplier?.certifications ??
        "Supplier qualification evidence requires review",
      impact:
        supplier?.customerProjectImpact ??
        "May affect project quality and delivery assurance",
      owner: "Procurement Head",
      action: "Launch critical-supplier qualification and dependency tracker.",
    },
    {
      area: "AI governance",
      status: `${readiness.cockpit.aiGovernanceReadiness}% readiness`,
      gap: ai?.gap ?? "No priority gap recorded",
      impact: "Weak traceability may limit trusted use of generated outputs",
      owner: ai?.owner ?? "AI Governance Owner",
      action: "Implement source, prompt, output, and human-approval records.",
    },
  ];
}

function ScorecardCard({ item }: { item: ScorecardItem }) {
  const variant =
    item.status === "On track"
      ? "success"
      : item.status === "At risk" || item.status === "Needs review"
        ? "warning"
        : "destructive";
  return (
    <div className="board-avoid-break flex min-h-48 flex-col rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">
          {item.label}
        </div>
        <Badge variant={variant}>{item.status}</Badge>
      </div>
      <div className="mt-4 text-2xl font-bold text-foreground">{item.value}</div>
      <div className="mt-2 text-xs capitalize text-muted">
        Confidence: {item.confidence}
      </div>
      <div className="mt-auto pt-4 text-sm leading-relaxed text-foreground-secondary">
        <span className="font-semibold text-foreground">Management action: </span>
        {item.action}
      </div>
    </div>
  );
}

function BoardSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="border-b border-border pb-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        {description}
      </p>
    </header>
  );
}

function CoverDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
        {label}
      </div>
      <div className="mt-1 capitalize text-white">{value}</div>
    </div>
  );
}

function DecisionMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="board-avoid-break rounded-xl border border-border bg-background-alt p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-3 text-2xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-foreground-secondary">{detail}</div>
    </div>
  );
}

function DecisionList({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  tone?: "risk" | "opportunity";
}) {
  return (
    <div className="board-avoid-break rounded-xl border border-border p-5">
      <h3 className="flex items-center gap-2 font-bold text-foreground">
        <Icon
          className={`h-4 w-4 ${
            tone === "risk"
              ? "text-error"
              : tone === "opportunity"
                ? "text-success"
                : "text-accent"
          }`}
        />
        {title}
      </h3>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground-secondary">
        {items.slice(0, 5).map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecisionCallout({ label, text }: { label: string; text: string }) {
  return (
    <div className="board-avoid-break rounded-xl border border-accent/25 bg-accent-muted p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <ShieldCheck className="h-4 w-4 text-accent" />
        {label}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
        {text}
      </p>
    </div>
  );
}

function NumberedList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="board-avoid-break rounded-xl border border-border p-5">
      <h3 className="font-bold text-foreground">{title}</h3>
      <ol className="mt-4 space-y-3">
        {items.slice(0, 5).map((item, index) => (
          <li key={item} className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-bold text-accent">
              {index + 1}
            </span>
            <span className="leading-relaxed text-foreground-secondary">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AppendixList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </div>
      {items.length ? (
        <ul className="mt-2 space-y-2 text-sm text-foreground-secondary">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CircleDollarSign className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">No item recorded.</p>
      )}
    </div>
  );
}

function topTruthFindings(report: Report): TruthFinding[] {
  const weight = { high: 3, medium: 2, low: 1 };
  return report.truthLayers
    .flatMap((layer) => layer.findings)
    .sort((a, b) => weight[b.impact] - weight[a.impact])
    .slice(0, 5);
}

function riskLine(risk: TopRisk): string {
  return `${risk.title}: ${risk.description}`;
}

function opportunityLine(opportunity: TopOpportunity): string {
  return `${opportunity.title}: ${formatExecutiveCurrency(
    opportunity.impactInr,
  )} potential impact over ${opportunity.timeframeDays} days.`;
}

function statusLabel(
  status: CockpitMetric["status"],
): ScorecardItem["status"] {
  if (status === "on_track") return "On track";
  if (status === "at_risk") return "At risk";
  return "Off track";
}

function postureLabel(score: number): string {
  if (score >= 75) return "Evidence base broadly decision-ready";
  if (score >= 50) return "Material evidence closure still required";
  return "Foundational evidence and ownership gaps require action";
}

function isGap(status: ReadinessEvidenceStatus): boolean {
  return (
    status === "Missing evidence" ||
    status === "Expired evidence" ||
    status === "Needs review"
  );
}

function average(values: number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
}
