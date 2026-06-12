import Link from "next/link";
import {
  AlertTriangle,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileWarning,
  Landmark,
  Network,
  PackageCheck,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatExecutiveCurrency } from "@/lib/utils";
import { buildReadinessReportSections } from "@/lib/readiness";
import type {
  AIGovernanceControl,
  AssessmentReadiness,
  ComplianceCockpit,
  ReadinessEvidenceStatus,
  ReadinessRiskLevel,
} from "@/lib/readiness/types";

export function ReadinessHeader({
  title,
  description,
  readiness,
}: {
  title: string;
  description: string;
  readiness: AssessmentReadiness;
}) {
  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Badge variant="outline">Read-only readiness view</Badge>
          {readiness.sampleType === "microfinish-public-domain" && (
            <Badge variant="warning">Public-domain sample</Badge>
          )}
        </div>
        <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>
      </div>
      <div className="rounded-xl border border-warning/25 bg-warning-muted px-4 py-3 text-sm leading-relaxed text-foreground-secondary">
        <AlertTriangle className="mr-2 inline h-4 w-4 text-warning" />
        {readiness.disclaimer}
      </div>
    </>
  );
}

export function ComplianceCockpitCards({
  cockpit,
}: {
  cockpit: ComplianceCockpit;
}) {
  const cards = [
    ["Standards readiness score", `${cockpit.standardsReadinessScore}%`, ShieldCheck, "accent"],
    ["Customer qualification readiness", `${cockpit.customerQualificationReadiness}%`, UserCheck, "info"],
    ["Statutory evidence health", `${cockpit.statutoryEvidenceHealth}%`, Landmark, "success"],
    ["Supplier qualification health", `${cockpit.supplierQualificationHealth}%`, Network, "info"],
    ["AI governance readiness", `${cockpit.aiGovernanceReadiness}%`, BrainCircuit, "accent"],
    ["Critical gaps", cockpit.criticalGaps.toString(), FileWarning, "error"],
    ["Expiring documents", cockpit.expiringDocuments.toString(), CalendarClock, "warning"],
    ["Revenue blocked by gaps", formatExecutiveCurrency(cockpit.revenueBlockedByGaps), CircleDollarSign, "warning"],
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(([label, value, Icon, tone]) => {
        const colors = cockpitTone(tone);
        return (
          <Card key={label} className="p-4">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${colors.background}`}>
              <Icon className={`h-4 w-4 ${colors.foreground}`} />
            </div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="mt-1 text-xs text-muted">{label}</div>
          </Card>
        );
      })}
    </div>
  );
}

export function StandardsReadinessView({
  readiness,
}: {
  readiness: AssessmentReadiness;
}) {
  return (
    <div className="space-y-6">
      <ReadinessHeader
        title="Standards Readiness"
        description="Applicability, evidence, ownership, and gap tracking for ISO, industry, regulatory, and customer-specific standards."
        readiness={readiness}
      />
      <ComplianceCockpitCards cockpit={readiness.cockpit} />
      <Card>
        <CardHeader>
          <CardTitle>Standards applicability and evidence status</CardTitle>
          <CardDescription>
            “Evidence found” means an indexed source exists. It does not mean
            certification, compliance, or customer approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                {["Standard", "Status", "Evidence", "Gaps", "Owner", "Risk", "Confidence", "Next review", "Business impact"].map((label) => (
                  <th key={label} className="pb-3 pr-4 font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {readiness.standards.map((item) => (
                <tr key={item.code} className="align-top">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-foreground">{item.code}</div>
                    <div className="mt-0.5 text-xs text-muted">{item.name}</div>
                  </td>
                  <td className="py-3 pr-4"><EvidenceStatusBadge status={item.status} /></td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.evidenceCount}</td>
                  <td className="max-w-56 py-3 pr-4 text-foreground-secondary">{item.gaps.join("; ") || "No recorded gap"}</td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.owner}</td>
                  <td className="py-3 pr-4"><RiskBadge risk={item.riskLevel} /></td>
                  <td className="py-3 pr-4 capitalize text-foreground-secondary">{item.confidence}</td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.nextReviewDate}</td>
                  <td className="max-w-64 py-3 pr-4 text-foreground-secondary">{item.businessImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Standards Evidence Register</CardTitle>
          <CardDescription>
            Structured clause-to-source register with validity, ownership,
            customer impact, and human-review status.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-[1500px] w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                {["Code", "Requirement", "Evidence document", "Type", "Owner", "Valid from", "Valid to", "Status", "Gap", "Customer impact", "Revenue impact", "Risk", "Next review", "Source", "Confidence", "Human reviewed"].map((label) => (
                  <th key={label} className="pb-3 pr-4 font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {readiness.standardsEvidence.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="py-3 pr-4 font-semibold text-foreground">{item.standardCode}</td>
                  <td className="max-w-64 py-3 pr-4 text-foreground-secondary">{item.clauseOrRequirement}</td>
                  <td className="max-w-56 py-3 pr-4 text-foreground-secondary">{item.evidenceDocument}</td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.evidenceType}</td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.ownerDepartment}</td>
                  <td className="py-3 pr-4 text-muted">{item.validFrom ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted">{item.validTo ?? "—"}</td>
                  <td className="py-3 pr-4"><EvidenceStatusBadge status={item.status} /></td>
                  <td className="max-w-64 py-3 pr-4 text-foreground-secondary">{item.gapDescription}</td>
                  <td className="max-w-64 py-3 pr-4 text-foreground-secondary">{item.customerImpact}</td>
                  <td className="py-3 pr-4 text-foreground-secondary">{formatExecutiveCurrency(item.revenueImpact)}</td>
                  <td className="py-3 pr-4"><RiskBadge risk={item.riskLevel} /></td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.nextReviewDate}</td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.sourceId ?? "Not linked"}</td>
                  <td className="py-3 pr-4 capitalize text-foreground-secondary">{item.confidence}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={item.humanReviewed ? "success" : "warning"}>
                      {item.humanReviewed ? "Yes" : "Required"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export function CustomerQualificationView({
  readiness,
}: {
  readiness: AssessmentReadiness;
}) {
  return (
    <div className="space-y-6">
      <ReadinessHeader
        title="Customer Qualification"
        description="Customer and vendor prequalification evidence readiness across corporate, financial, technical, EHS, governance, delivery, and supplier records."
        readiness={readiness}
      />
      <ComplianceCockpitCards cockpit={readiness.cockpit} />
      <div className="grid gap-4 md:grid-cols-2">
        {readiness.customerQualification.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{item.category}</CardTitle>
                  <CardDescription className="mt-1">{item.requirement}</CardDescription>
                </div>
                <EvidenceStatusBadge status={item.status} />
              </div>
            </CardHeader>
            <CardContent className="mt-4 space-y-3 text-sm">
              <Detail label="Owner" value={item.owner} />
              <Detail label="Revenue at risk" value={formatExecutiveCurrency(item.revenueAtRisk)} />
              <Detail label="Source" value={item.sourceId ?? "No source linked"} />
              <Detail label="Confidence" value={item.confidence} />
              <ListDetail label="Blockers" values={item.blockers} />
              <ListDetail label="Missing evidence" values={item.missingEvidence} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StatutoryReadinessView({
  readiness,
}: {
  readiness: AssessmentReadiness;
}) {
  return (
    <div className="space-y-6">
      <ReadinessHeader
        title="Statutory Readiness"
        description="Evidence indexing for statutory registrations, licenses, tax, workforce, insurance, board, financial, and audit requirements."
        readiness={readiness}
      />
      <ComplianceCockpitCards cockpit={readiness.cockpit} />
      <Card>
        <CardHeader>
          <CardTitle>Statutory and audit evidence checklist</CardTitle>
          <CardDescription>
            Evidence status only. Legal, regulatory, and audit conclusions
            require qualified human review.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                {["Requirement", "Evidence status", "Expiry / review", "Owner", "Risk", "Source", "Evidence", "Gap"].map((label) => (
                  <th key={label} className="pb-3 pr-4 font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {readiness.statutory.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="py-3 pr-4 font-semibold text-foreground">{item.requirement}</td>
                  <td className="py-3 pr-4"><EvidenceStatusBadge status={item.evidenceStatus} /></td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.expiryOrReviewDate}</td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.owner}</td>
                  <td className="py-3 pr-4"><RiskBadge risk={item.riskLevel} /></td>
                  <td className="py-3 pr-4 text-foreground-secondary">{item.sourceId ?? "Not linked"}</td>
                  <td className="max-w-64 py-3 pr-4 text-foreground-secondary">{item.evidenceDocument}</td>
                  <td className="max-w-72 py-3 pr-4 text-foreground-secondary">{item.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export function SupplierEcosystemView({
  readiness,
}: {
  readiness: AssessmentReadiness;
}) {
  return (
    <div className="space-y-6">
      <ReadinessHeader
        title="Supplier Ecosystem"
        description="Supplier qualification, dependency, certification evidence, quality, delivery, single-source, commercial, and customer-project risk."
        readiness={readiness}
      />
      <ComplianceCockpitCards cockpit={readiness.cockpit} />
      <div className="grid gap-4 lg:grid-cols-2">
        {readiness.suppliers.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{item.supplierName}</CardTitle>
                  <CardDescription className="mt-1">{item.category}</CardDescription>
                </div>
                <EvidenceStatusBadge status={item.qualificationStatus} />
              </div>
            </CardHeader>
            <CardContent className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Critical dependency" value={item.criticalDependency} />
              <Detail label="Certification evidence" value={item.certifications} />
              <Detail label="Quality risk" value={item.qualityRisk} />
              <Detail label="Delivery risk" value={item.deliveryRisk} />
              <Detail label="Single-source risk" value={item.singleSourceRisk ? "Yes" : "No"} />
              <Detail label="Commercial dependency" value={item.commercialDependency} />
              <div className="sm:col-span-2">
                <Detail label="Customer / project impact" value={item.customerProjectImpact} />
              </div>
              <div className="sm:col-span-2">
                <Detail label="Source" value={item.sourceId ?? "No source linked"} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AIGovernanceView({
  readiness,
}: {
  readiness: AssessmentReadiness;
}) {
  return (
    <div className="space-y-6">
      <ReadinessHeader
        title="AI Governance"
        description="ISO/IEC 42001 readiness controls for traceability, model records, confidence, review, access, sensitive data, approval history, and human authority."
        readiness={readiness}
      />
      <ComplianceCockpitCards cockpit={readiness.cockpit} />
      <Card className="border-success/25 bg-success-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            Trusted-agent guardrail
          </CardTitle>
          <CardDescription>
            No autonomous irreversible action. PulseIQ remains read-only and
            requires human review before management action.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {readiness.aiGovernance.map((item) => (
          <AIGovernanceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function ReadinessPackView({
  readiness,
}: {
  readiness: AssessmentReadiness;
}) {
  const sections = buildReadinessReportSections(readiness);
  return (
    <div className="space-y-6">
      <ReadinessHeader
        title="Readiness Pack"
        description="Board and customer-ready readiness summary built from structured evidence status, gaps, ownership, and human-review controls."
        readiness={readiness}
      />
      <ComplianceCockpitCards cockpit={readiness.cockpit} />
      <Card>
        <CardHeader>
          <CardTitle>Executive readiness summary</CardTitle>
          <CardDescription>
            Readiness indicators organize evidence and closure priorities. They
            do not replace certification, audit, legal, or customer approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-border-subtle bg-background-alt p-4">
              <div className="font-semibold text-foreground">{section.title}</div>
              <p className="mt-1 text-sm text-foreground-secondary">{section.summary}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted">
                {section.items.slice(0, 5).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Critical gaps</CardTitle>
          <CardDescription>
            Highest-priority evidence gaps for leadership closure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 md:grid-cols-2">
            {readiness.criticalGaps.map((gap) => (
              <li key={gap} className="rounded-lg border border-error/15 bg-error-muted p-3 text-sm text-foreground-secondary">
                <AlertTriangle className="mr-2 inline h-4 w-4 text-error" />
                {gap}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>30 / 60 / 90-day closure plan</CardTitle>
          <CardDescription>
            Evidence collection, validation, approval, and governance cadence.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {readiness.closurePlan.map((phase) => (
            <div key={phase.window} className="rounded-xl border border-border p-4">
              <Badge>{phase.window}</Badge>
              <div className="mt-3 font-semibold text-foreground">{phase.title}</div>
              <ul className="mt-3 space-y-2 text-sm text-foreground-secondary">
                {phase.actions.map((action) => (
                  <li key={action} className="flex items-start gap-2">
                    <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Link className="text-sm font-medium text-accent hover:text-accent-hover" href={`/app/assessments/${readiness.assessmentId}/standards-readiness`}>
          Standards evidence matrix →
        </Link>
        <Link className="text-sm font-medium text-accent hover:text-accent-hover" href={`/app/assessments/${readiness.assessmentId}/customer-qualification`}>
          Customer qualification evidence →
        </Link>
        <Link className="text-sm font-medium text-accent hover:text-accent-hover" href={`/app/assessments/${readiness.assessmentId}/ai-governance`}>
          AI governance statement →
        </Link>
      </div>
    </div>
  );
}

function AIGovernanceCard({ item }: { item: AIGovernanceControl }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{item.control}</CardTitle>
          <EvidenceStatusBadge status={item.status} />
        </div>
      </CardHeader>
      <CardContent className="mt-4 space-y-3 text-sm">
        <Detail label="Evidence" value={item.evidence} />
        <Detail label="Owner" value={item.owner} />
        <Detail label="Confidence" value={item.confidence} />
        <Detail label="Human approval" value={item.humanApprovalRequired ? "Required" : "Not recorded"} />
        <Detail label="Source" value={item.sourceId ?? "Internal guardrail / not source-linked"} />
        <Detail label="Gap" value={item.gap} />
      </CardContent>
    </Card>
  );
}

export function EvidenceStatusBadge({
  status,
}: {
  status: ReadinessEvidenceStatus;
}) {
  const variant =
    status === "Evidence found"
      ? "success"
      : status === "Missing evidence" || status === "Expired evidence"
        ? "destructive"
        : status === "Needs review"
          ? "warning"
          : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

function RiskBadge({ risk }: { risk: ReadinessRiskLevel }) {
  const variant =
    risk === "critical" || risk === "high"
      ? "destructive"
      : risk === "medium"
        ? "warning"
        : "success";
  return <Badge variant={variant}>{risk}</Badge>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 capitalize text-foreground-secondary">{value}</div>
    </div>
  );
}

function ListDetail({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      {values.length ? (
        <ul className="mt-1 space-y-1 text-foreground-secondary">
          {values.map((value) => <li key={value}>• {value}</li>)}
        </ul>
      ) : (
        <div className="mt-1 text-success">No blocker recorded</div>
      )}
    </div>
  );
}

function cockpitTone(tone: string) {
  if (tone === "success") return { background: "bg-success-muted", foreground: "text-success" };
  if (tone === "warning") return { background: "bg-warning-muted", foreground: "text-warning" };
  if (tone === "error") return { background: "bg-error-muted", foreground: "text-error" };
  if (tone === "info") return { background: "bg-info-muted", foreground: "text-info" };
  return { background: "bg-accent-muted", foreground: "text-accent" };
}

