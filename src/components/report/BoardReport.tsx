import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
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
  impact: string;
  owner: string;
  action: string;
};

type PriorityDecisionRow = {
  priority: number;
  signal: string;
  gap: string;
  impact: string;
  validation: string;
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
  const topRisks = buildTopRisks(assessment, report, readiness);
  const topOpportunities = buildTopOpportunities(
    assessment,
    report,
    readiness,
  );
  const scorecard = buildScorecard(assessment, report, readiness);
  const readinessRows = buildReadinessRows(readiness);
  const priorityRows = buildPriorityRows(
    assessment,
    readiness,
    topFindings,
    topGaps,
    evidenceRequests,
  );

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
            value={titleCase(assessment.objective.replace(/_/g, " "))}
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
        <BoardPageFooter inverse />
      </section>

      <section className="board-page board-executive-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 1"
          title="Executive Decision Summary"
          description={DIAGNOSTIC_POSITIONING}
        />
        <div className="board-summary-metrics mt-7 grid gap-4 md:grid-cols-3 print:grid-cols-3">
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

        <div className="board-decision-grid mt-7 grid gap-6 md:grid-cols-2 print:grid-cols-2">
          <DecisionList
            icon={AlertTriangle}
            title="Top 3 risks"
            items={topRisks}
            tone="risk"
            testId="top-risks"
          />
          <DecisionList
            icon={Lightbulb}
            title="Top 3 opportunities"
            items={topOpportunities}
            tone="opportunity"
            testId="top-opportunities"
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

        <div className="board-callout-grid mt-7 grid gap-4 md:grid-cols-2 print:grid-cols-2">
          <DecisionCallout
            label="Board decision required"
            text="Approve a 90-day evidence-readiness program with named owners and monthly Board review."
          />
          <DecisionCallout
            label="Executive sponsor required"
            text="Nominate a CFO/COO sponsor across Commercial, Quality, Compliance, Procurement, IT, and Operations."
          />
        </div>
        <BoardPageFooter />
      </section>

      <section className="board-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 2"
          title="Board Scorecard"
          description="Decision signals derived from the existing cockpit and structured evidence-readiness register."
        />
        <div className="mt-7 overflow-x-auto print:overflow-visible">
          <table
            className="board-table board-scorecard-table w-full min-w-[860px] border-collapse text-left text-xs print:min-w-0"
            data-testid="board-scorecard"
          >
            <thead>
              <tr>
                {["Area", "Value", "Status", "Confidence", "Management action"].map(
                  (heading) => (
                    <th key={heading}>{heading}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {scorecard.map((item) => (
                <ScorecardRow key={item.label} item={item} />
              ))}
            </tbody>
          </table>
        </div>
        <BoardPageFooter />
      </section>

      <section className="board-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 3"
          title="Priority Findings and Evidence Requests"
          description="The main report shows only the highest-priority decision signals. Full truth-layer detail is retained in the appendix."
        />
        <div className="mt-7 overflow-x-auto print:overflow-visible">
          <table
            className="board-table board-priority-table w-full min-w-[900px] border-collapse text-left text-xs print:min-w-0"
            data-testid="priority-decision-table"
          >
            <thead>
              <tr>
                {[
                  "Priority",
                  "Decision signal",
                  "Evidence gap",
                  "Why it matters",
                  "Required validation",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {priorityRows.map((row) => (
                <tr key={row.priority} data-testid="priority-row">
                  <td className="font-bold">P{row.priority}</td>
                  <td>{row.signal}</td>
                  <td>{row.gap}</td>
                  <td>{row.impact}</td>
                  <td>{row.validation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <BoardPageFooter />
      </section>

      <section className="board-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 4"
          title="Readiness action table"
          description="Five accountable 30-day actions across standards, customer qualification, statutory evidence, suppliers, and AI governance."
        />
        <div className="mt-7 overflow-x-auto print:overflow-visible">
          <table className="board-table w-full min-w-[900px] border-collapse text-left text-xs print:min-w-0">
            <thead>
              <tr>
                {[
                  "Area",
                  "Status",
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
                  <td>{row.impact}</td>
                  <td>{row.owner}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <BoardPageFooter />
      </section>

      <section className="board-page board-page-break px-8 py-10 print:px-0 print:py-0">
        <BoardSectionHeader
          eyebrow="Board page 5"
          title="30 / 60 / 90-Day Leadership Roadmap"
          description="A management-owned closure sequence, replacing raw generated action text with a consistent operating plan."
        />
        <div className="mt-8 space-y-5">
          {PROFESSIONAL_ROADMAP.map((phase) => (
            <div
              key={phase.window}
              className="board-roadmap-card board-avoid-break rounded-xl border border-border p-5"
              data-testid={`roadmap-${phase.window.split(" ")[0]}`}
            >
              <div className="grid gap-4 md:grid-cols-[130px_1fr] print:grid-cols-[28mm_1fr]">
                <div>
                  <Badge>{phase.window}</Badge>
                  <h3 className="mt-3 text-base font-bold text-foreground">
                    {phase.title}
                  </h3>
                </div>
                <ul className="grid gap-2 text-sm text-foreground-secondary md:grid-cols-2 print:grid-cols-2">
                  {phase.actions.map((action) => (
                    <li key={action} className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <BoardPageFooter />
      </section>

      <section
        className="board-page board-page-break px-8 py-10 print:px-0 print:py-0"
        data-testid="truth-map-appendix"
      >
        <BoardSectionHeader
          eyebrow="Appendix A"
          title="Evidence Boundary Summary"
          description="Compact supporting context for management validation. Full source-level detail remains in the Detailed Workbench Report."
        />
        <div className="mt-7 overflow-x-auto print:overflow-visible">
          <table className="board-table board-appendix-table w-full min-w-[760px] border-collapse text-left text-xs print:min-w-0">
            <thead>
              <tr>
                {[
                  "Truth area",
                  "Confidence",
                  "Findings indexed",
                  "Evidence references",
                  "Priority validation gap",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.truthLayers.map((layer) => (
                <tr key={layer.key}>
                  <td className="font-semibold">{layer.title}</td>
                  <td className="capitalize">{layer.confidence}</td>
                  <td>{layer.findings.length}</td>
                  <td>{layer.evidence.length}</td>
                  <td>{layer.gaps[0] ?? "No priority gap recorded"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted">
          Detailed findings, contradictions, source excerpts, scenarios, and
          recommendations remain available in the Detailed Workbench Report
          for internal review.
        </p>
        <BoardPageFooter />
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
        <BoardPageFooter />
      </section>
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
      impact:
        missingStandard?.businessImpact ??
        "May affect bid, audit, or customer evidence readiness",
      owner: missingStandard?.owner ?? "Quality / Engineering",
      action: "Confirm applicability and index approved evidence.",
    },
    {
      area: "Customer qualification",
      status: `${readiness.cockpit.customerQualificationReadiness}% readiness`,
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
      impact: "May affect audit, license, tax, or customer assurance readiness",
      owner: statutory?.owner ?? "Compliance Lead",
      action: "Index documents, expiries, review dates, and source links.",
    },
    {
      area: "Supplier ecosystem",
      status: `${readiness.cockpit.supplierQualificationHealth}% health`,
      impact:
        supplier?.customerProjectImpact ??
        "May affect project quality and delivery assurance",
      owner: "Procurement Head",
      action: "Launch critical-supplier qualification and dependency tracker.",
    },
    {
      area: "AI governance",
      status: `${readiness.cockpit.aiGovernanceReadiness}% readiness`,
      impact: "Weak traceability may limit trusted use of generated outputs",
      owner: ai?.owner ?? "AI Governance Owner",
      action: "Implement source, prompt, output, and human-approval records.",
    },
  ];
}

function ScorecardRow({ item }: { item: ScorecardItem }) {
  const variant =
    item.status === "On track"
      ? "success"
      : item.status === "At risk" || item.status === "Needs review"
        ? "warning"
        : "destructive";
  return (
    <tr className="board-avoid-break">
      <td className="font-semibold">{item.label}</td>
      <td className="font-bold">{item.value}</td>
      <td><Badge variant={variant}>{item.status}</Badge></td>
      <td className="capitalize">{item.confidence}</td>
      <td>{item.action}</td>
    </tr>
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
      <div className="mt-1 text-white">{value}</div>
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
    <div className="board-decision-metric board-avoid-break rounded-xl border border-border bg-background-alt p-5">
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
  testId,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  tone?: "risk" | "opportunity";
  testId?: string;
}) {
  return (
    <div
      className="board-decision-list board-avoid-break rounded-xl border border-border p-5"
      data-testid={testId}
    >
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
        {items.slice(0, 3).map((item) => (
          <li
            key={item}
            className="flex items-start gap-2"
            data-testid={testId ? `${testId}-item` : undefined}
          >
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
    <div className="board-decision-callout board-avoid-break rounded-xl border border-accent/25 bg-accent-muted p-5">
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

function BoardPageFooter({ inverse = false }: { inverse?: boolean }) {
  return (
    <footer
      className={`board-page-footer ${inverse ? "board-page-footer-inverse" : ""}`}
    >
      RightSense Diagnostic Report · Powered by PulseIQ · Human review required
    </footer>
  );
}

function topTruthFindings(report: Report): TruthFinding[] {
  const weight = { high: 3, medium: 2, low: 1 };
  return report.truthLayers
    .flatMap((layer) => layer.findings)
    .sort((a, b) => weight[b.impact] - weight[a.impact])
    .slice(0, 5);
}

function buildTopRisks(
  assessment: Assessment,
  report: Report,
  readiness: AssessmentReadiness,
): string[] {
  if (isMicrofinishPublicDomain(assessment)) {
    return [
      "Public financial signals require internal validation before Board decisions.",
      "Standards, statutory, and customer qualification evidence is not yet indexed.",
      "Supplier readiness and AI governance evidence are weak or missing.",
    ];
  }
  return takeThree(
    unique([
      ...report.cockpit.topRisks.map(
        (risk) => `${risk.title}: ${risk.description}`,
      ),
      ...readiness.criticalGaps.map((gap) => `Readiness gap: ${gap}`),
      "Internal financial and operating baselines require accountable human validation.",
      "Missing evidence may delay customer, statutory, supplier, or standards readiness decisions.",
      "AI-generated outputs require traceable human review before management action.",
    ]),
  );
}

function buildTopOpportunities(
  assessment: Assessment,
  report: Report,
  readiness: AssessmentReadiness,
): string[] {
  if (isMicrofinishPublicDomain(assessment)) {
    return [
      "Convert public-domain diagnostic into a 48-hour internal validated diagnostic.",
      "Build a customer qualification and standards evidence pack.",
      "Establish a monthly operating-intelligence cadence across Finance, Commercial, Quality, Procurement, IT, and Operations.",
    ];
  }
  return takeThree(
    unique([
      ...report.cockpit.topOpportunities.map(
        (opportunity) =>
          `${opportunity.title}: ${formatExecutiveCurrency(
            opportunity.impactInr,
          )} potential impact over ${opportunity.timeframeDays} days.`,
      ),
      ...report.recommendations.slice(0, 5).map(
        (recommendation) =>
          `${recommendation.title}: ${recommendation.businessImpact}.`,
      ),
      `Close the ${readiness.cockpit.criticalGaps} highest-priority evidence gaps through named owners and a 30-day review.`,
      "Build one controlled customer qualification, standards, and statutory evidence pack.",
      "Establish a monthly operating-intelligence cadence across executive functions.",
    ]),
  );
}

function buildPriorityRows(
  assessment: Assessment,
  readiness: AssessmentReadiness,
  findings: TruthFinding[],
  gaps: string[],
  evidenceRequests: string[],
): PriorityDecisionRow[] {
  if (isMicrofinishPublicDomain(assessment)) {
    return [
      {
        priority: 1,
        signal: "Public financial signals are directional, not an approved internal baseline.",
        gap: "Audited internal revenue, margin, cash, and working-capital baseline.",
        impact: "Board targets and investment decisions require validated management data.",
        validation: "CFO-approved financial statements and current management accounts.",
      },
      {
        priority: 2,
        signal: "Product-family and customer profitability are not visible.",
        gap: "Revenue, margin, backlog, and pipeline by product family and customer.",
        impact: "Portfolio, pricing, and growth decisions cannot be validated.",
        validation: "ERP and CRM exports reconciled to the approved financial baseline.",
      },
      {
        priority: 3,
        signal: "Customer qualification and applicable standards evidence is not indexed.",
        gap: "Controlled customer, certification, and standards evidence pack.",
        impact: "May delay bids, vendor registration, audits, or customer assurance.",
        validation: "Approved source documents with owners, validity dates, and human review.",
      },
      {
        priority: 4,
        signal: "Statutory and supplier readiness lacks a controlled evidence register.",
        gap: "Current statutory documents and critical-supplier qualification records.",
        impact: "May weaken delivery assurance, statutory readiness, and customer confidence.",
        validation: "Compliance register and supplier tracker linked to approved sources.",
      },
      {
        priority: 5,
        signal: "AI governance and source traceability controls require formal evidence.",
        gap: "Prompt, model, source, output-review, access, and approval records.",
        impact: "Trusted use requires traceable human review and no autonomous irreversible action.",
        validation: `AI governance evidence supporting the current ${readiness.cockpit.aiGovernanceReadiness}% readiness indicator.`,
      },
    ];
  }
  const fallbackSignals = [
    "Validate the financial baseline before setting Board commitments.",
    "Link proposal governance to customer and standards requirements.",
    "Establish statutory and supplier evidence ownership.",
    "Confirm productivity and working-capital operating baselines.",
    "Implement traceable human review for AI-generated outputs.",
  ];
  const fallbackGaps = [
    "Approved internal financial baseline is not fully validated.",
    "Customer and standards evidence is not linked to proposal checkpoints.",
    "Controlled statutory and supplier evidence is incomplete.",
    "Operating source data requires reconciliation.",
    "AI governance control evidence requires human validation.",
  ];
  const fallbackValidation = [
    "CFO-approved financial export and product-family bridge.",
    "Proposal register with customer and standards evidence links.",
    "Current statutory register and supplier qualification tracker.",
    "Approved operating, working-capital, and headcount extracts.",
    "Prompt, source, model, output-review, and approval records.",
  ];
  return Array.from({ length: 5 }, (_, index) => ({
    priority: index + 1,
    signal: findings[index]?.text ?? fallbackSignals[index],
    gap: gaps[index] ?? fallbackGaps[index],
    impact:
      findings[index]?.impact === "high"
        ? "Material Board, revenue, margin, delivery, or assurance decision risk."
        : "May weaken decision confidence, execution control, or customer readiness.",
    validation: evidenceRequests[index] ?? fallbackValidation[index],
  }));
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

function takeThree(items: string[]): string[] {
  return items.slice(0, 3);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}
