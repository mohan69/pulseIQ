import type { Assessment, Source } from "@/lib/assessment/types";
import {
  isMicrofinishPublicDomain,
  isPublicDomainAssessment,
  MICROFINISH_DISCLAIMER,
  PUBLIC_DOMAIN_DISCLAIMER,
} from "@/lib/assessment/presentation";
import { DIAGNOSTIC_DISCLAIMER } from "@/lib/diagnostic-positioning";
import type {
  AIGovernanceControl,
  AssessmentReadiness,
  ComplianceCockpit,
  CustomerQualificationItem,
  ReadinessClosurePhase,
  ReadinessEvidenceStatus,
  ReadinessReportSection,
  ReadinessRiskLevel,
  StandardReadinessItem,
  StandardsEvidenceRecord,
  StatutoryReadinessItem,
  SupplierReadinessItem,
} from "@/lib/readiness/types";

const REVIEW_DATE = "2026-07-15";
const CR = 10_000_000;

const STANDARD_CATALOGUE = [
  ["ISO 9001", "Quality management systems"],
  ["ISO 14001", "Environmental management systems"],
  ["ISO 45001", "Occupational health and safety management"],
  ["ISO/IEC 27001", "Information security management systems"],
  ["ISO/IEC 42001", "AI management system readiness"],
  ["ISO 50001", "Energy management systems"],
  ["API", "American Petroleum Institute requirements"],
  ["ASME", "Mechanical engineering codes and standards"],
  ["ANSI", "American National Standards Institute requirements"],
  ["IEC", "Electrotechnical standards"],
  ["ISA", "Automation and instrumentation standards"],
  ["ATEX", "Equipment for potentially explosive atmospheres"],
  ["PED", "Pressure Equipment Directive requirements"],
  ["SIL", "Safety integrity level requirements"],
  ["TA Luft", "Air-quality and fugitive-emissions requirements"],
  ["CUSTOMER", "Customer-specific standards"],
] as const;

const STATUTORY_REQUIREMENTS = [
  "MCA / ROC",
  "GST",
  "Income Tax / TDS",
  "Factory License",
  "Pollution Control",
  "PF / ESI",
  "Labour compliance",
  "Insurance",
  "Audited financials",
  "Board approvals",
  "Internal audit observations",
  "External audit observations",
] as const;

const AI_CONTROLS = [
  "Prompt traceability",
  "Source traceability",
  "Model used",
  "Confidence recording",
  "Human approval",
  "Output review",
  "Role-based access",
  "Sensitive-data check",
  "Approval history",
  "No autonomous irreversible action",
] as const;

export function calculateReadinessScore(
  statuses: ReadinessEvidenceStatus[],
): number {
  const applicable = statuses.filter((status) => status !== "Not applicable");
  if (applicable.length === 0) return 0;
  const weights: Record<ReadinessEvidenceStatus, number> = {
    "Evidence found": 100,
    "Needs review": 55,
    "Expired evidence": 20,
    "Missing evidence": 0,
    "Not applicable": 0,
  };
  return Math.round(
    applicable.reduce((sum, status) => sum + weights[status], 0) /
      applicable.length,
  );
}

export function getAssessmentReadiness(
  assessment: Assessment,
  sources: Source[],
): AssessmentReadiness {
  if (isMicrofinishPublicDomain(assessment)) {
    return maskPublicFinancialReadiness(
      assessment,
      buildMicrofinishReadiness(assessment),
    );
  }
  if (assessment.id === "asm-bharat-heavy-fabrications") {
    return buildBharatReadiness(assessment, sources);
  }
  return maskPublicFinancialReadiness(
    assessment,
    buildConservativeReadiness(assessment),
  );
}

function maskPublicFinancialReadiness(
  assessment: Assessment,
  readiness: AssessmentReadiness,
): AssessmentReadiness {
  if (!isPublicDomainAssessment(assessment)) return readiness;
  return {
    ...readiness,
    disclaimer: `${PUBLIC_DOMAIN_DISCLAIMER} internal validation required. ${DIAGNOSTIC_DISCLAIMER}`,
    standardsEvidence: readiness.standardsEvidence.map((item) => ({
      ...item,
      revenueImpact: 0,
    })),
    customerQualification: readiness.customerQualification.map((item) => ({
      ...item,
      revenueAtRisk: 0,
    })),
    cockpit: {
      ...readiness.cockpit,
      revenueBlockedByGaps: 0,
    },
  };
}

export function buildReadinessReportSections(
  readiness: AssessmentReadiness,
): ReadinessReportSection[] {
  const cockpit = readiness.cockpit;
  return [
    {
      title: "Compliance & Standards Readiness",
      summary: `${cockpit.standardsReadinessScore}% evidence-readiness score. This is a readiness view, not a certification or compliance determination.`,
      items: readiness.standards
        .filter((item) => item.status !== "Not applicable")
        .slice(0, 6)
        .map((item) => `${item.code}: ${item.status} · ${item.owner}`),
    },
    {
      title: "Customer Qualification Readiness",
      summary: `${cockpit.customerQualificationReadiness}% prequalification evidence readiness; formal customer approval is not assumed.`,
      items: readiness.customerQualification.map(
        (item) => `${item.category}: ${item.status} · owner ${item.owner}`,
      ),
    },
    {
      title: "Statutory & Audit Evidence",
      summary: `${cockpit.statutoryEvidenceHealth}% statutory evidence health based only on indexed evidence status.`,
      items: readiness.statutory
        .filter((item) => item.evidenceStatus !== "Evidence found")
        .slice(0, 6)
        .map(
          (item) =>
            `${item.requirement}: ${item.evidenceStatus} · ${item.gap}`,
        ),
    },
    {
      title: "Supplier / Vendor Ecosystem Readiness",
      summary: `${cockpit.supplierQualificationHealth}% supplier qualification evidence health.`,
      items: readiness.suppliers.map(
        (item) =>
          `${item.supplierName}: ${item.qualificationStatus} · ${item.customerProjectImpact}`,
      ),
    },
    {
      title: "AI Governance & Trusted Agent Readiness",
      summary: `${cockpit.aiGovernanceReadiness}% ISO/IEC 42001 readiness indicator, not certification.`,
      items: readiness.aiGovernance.map(
        (item) => `${item.control}: ${item.status} · ${item.owner}`,
      ),
    },
    {
      title: "Revenue Risk from Readiness Gaps",
      summary: /public-domain/i.test(readiness.disclaimer)
        ? "Revenue exposure requires approved internal opportunity and financial evidence before quantification."
        : `${formatCrores(cockpit.revenueBlockedByGaps)} is illustratively linked to missing or review-pending readiness evidence.`,
      items: readiness.criticalGaps,
    },
  ];
}

function buildBharatReadiness(
  assessment: Assessment,
  sources: Source[],
): AssessmentReadiness {
  const sourceIds = new Set(sources.map((source) => source.id));
  const standardsEvidence = STANDARD_CATALOGUE.map(([code, name], index) => {
    const hasReadinessRegister = sourceIds.has("src-sop-quote-approval");
    const status: ReadinessEvidenceStatus =
      code === "ANSI" || code === "ISA"
        ? "Not applicable"
        : hasReadinessRegister && index < 6
          ? "Needs review"
          : "Missing evidence";
    return standardEvidence({
      assessmentId: assessment.id,
      code,
      name,
      index,
      status,
      sourceId: hasReadinessRegister ? "src-sop-quote-approval" : null,
      evidenceDocument: hasReadinessRegister
        ? "SOP & Readiness Evidence Register — Sample"
        : "No indexed evidence",
      confidence: hasReadinessRegister ? "medium" : "low",
      humanReviewed: hasReadinessRegister,
      revenueImpact:
        status === "Missing evidence" ? (index < 8 ? 1.2 * CR : 0.5 * CR) : 0.3 * CR,
    });
  });
  const standards = summarizeStandards(standardsEvidence);
  const customerQualification: CustomerQualificationItem[] = [
    qualification("company", "Company documents", "Corporate identity and registration pack", "Needs review", "Company Secretary", 1.2 * CR, "src-fy25-audit"),
    qualification("financials", "Financials", "Audited financial and banking evidence", "Evidence found", "CFO", 0, "src-fy25-audit"),
    qualification("certifications", "Certifications", "Applicable standards evidence matrix", "Missing evidence", "Quality Head", 2.4 * CR, "src-sop-quote-approval"),
    qualification("technical", "Technical capability", "Product, drawing, testing, and project capability evidence", "Needs review", "Engineering Head", 1.8 * CR, "src-sop-quote-approval"),
    qualification("ehs", "EHS", "Safety and environmental evidence", "Missing evidence", "EHS Head", 1.4 * CR, null),
    qualification("ai", "IT / AI governance", "Information security and AI governance controls", "Needs review", "CIO", 0.8 * CR, "src-sop-quote-approval"),
    qualification("performance", "Past performance", "Customer references and delivery evidence", "Needs review", "Commercial Operations", 1.1 * CR, "src-crm-export"),
    qualification("supplier", "Supplier ecosystem", "Critical supplier and subcontractor qualification", "Missing evidence", "Procurement Head", 1.7 * CR, "src-erp-finance-export"),
  ];
  const statutory = STATUTORY_REQUIREMENTS.map((requirement, index) => {
    const evidenceFound =
      requirement === "Audited financials" || requirement === "Board approvals";
    return statutoryItem(
      assessment.id,
      requirement,
      evidenceFound ? "Evidence found" : index < 3 ? "Needs review" : "Missing evidence",
      evidenceFound
        ? requirement === "Audited financials"
          ? "src-fy25-audit"
          : "src-board-deck"
        : null,
      evidenceFound ? `${requirement} source indexed` : "No controlled evidence indexed",
      index,
    );
  });
  const suppliers: SupplierReadinessItem[] = [
    supplier("bharat-supplier-1", "Critical Forgings Supplier", "Forgings", "Needs review", "High dependency for engineered orders", "Not evidenced", "high", "medium", true, "Material cost and lead-time exposure", "Could delay two priority customer orders", "src-erp-finance-export"),
    supplier("bharat-supplier-2", "Seal Systems Supplier", "Seals and internals", "Missing evidence", "Quality-critical bought-out item", "No certificate pack indexed", "high", "high", true, "Commercial dependency not quantified", "Potential technical deviation and customer hold", null),
    supplier("bharat-supplier-3", "Actuation Partner", "Actuation systems", "Needs review", "Project-specific dependency", "Qualification register requires review", "medium", "medium", false, "Moderate package-value dependency", "May affect package acceptance and delivery", "src-sop-quote-approval"),
  ];
  const aiGovernance = buildAIControls(
    assessment.id,
    "src-sop-quote-approval",
    false,
  );
  return assembleReadiness({
    assessment,
    sampleType: "bharat-demo",
    disclaimer: `${DIAGNOSTIC_DISCLAIMER} Bharat Heavy Fabrications is protected demo data.`,
    standards,
    standardsEvidence,
    customerQualification,
    statutory,
    suppliers,
    aiGovernance,
  });
}

function buildMicrofinishReadiness(
  assessment: Assessment,
): AssessmentReadiness {
  const standardsEvidence = STANDARD_CATALOGUE.map(([code, name], index) =>
    standardEvidence({
      assessmentId: assessment.id,
      code,
      name,
      index,
      status: index < 5 ? "Needs review" : "Missing evidence",
      sourceId: null,
      evidenceDocument: "Public-domain signal only; approved internal evidence required",
      confidence: "low",
      humanReviewed: false,
      revenueImpact: index < 8 ? 0.8 * CR : 0.3 * CR,
    }),
  );
  const customerQualification = (
    [
      "Company documents",
      "Financials",
      "Certifications",
      "Technical capability",
      "EHS",
      "IT / AI governance",
      "Past performance",
      "Supplier ecosystem",
    ] as const
  ).map((category, index) =>
    qualification(
      `microfinish-${index}`,
      category,
      `${category} evidence requires approved internal validation`,
      index < 2 ? "Needs review" : "Missing evidence",
      categoryOwner(category),
      0.5 * CR,
      null,
    ),
  );
  const statutory = STATUTORY_REQUIREMENTS.map((requirement, index) =>
    statutoryItem(
      assessment.id,
      requirement,
      index < 3 ? "Needs review" : "Missing evidence",
      null,
      "Public-domain information is not sufficient evidence",
      index,
    ),
  );
  const suppliers = [
    supplier("microfinish-supplier-1", "Critical supplier portfolio", "Engineered components", "Missing evidence", "Dependency requires internal mapping", "No approved evidence indexed", "medium", "medium", true, "Requires spend and dependency validation", "Potential project and customer qualification impact", null),
    supplier("microfinish-supplier-2", "Subcontractor ecosystem", "Special processes", "Missing evidence", "Special-process dependency requires validation", "No qualification register indexed", "high", "medium", false, "Requires internal validation", "Potential quality and delivery evidence gap", null),
  ];
  return assembleReadiness({
    assessment,
    sampleType: "microfinish-public-domain",
    disclaimer: `${MICROFINISH_DISCLAIMER} ${DIAGNOSTIC_DISCLAIMER}`,
    standards: summarizeStandards(standardsEvidence),
    standardsEvidence,
    customerQualification,
    statutory,
    suppliers,
    aiGovernance: buildAIControls(assessment.id, null, true),
  });
}

function buildConservativeReadiness(
  assessment: Assessment,
): AssessmentReadiness {
  const standardsEvidence = STANDARD_CATALOGUE.map(([code, name], index) =>
    standardEvidence({
      assessmentId: assessment.id,
      code,
      name,
      index,
      status: "Missing evidence",
      sourceId: null,
      evidenceDocument: "No indexed evidence",
      confidence: "low",
      humanReviewed: false,
      revenueImpact: 0,
    }),
  );
  const customerQualification = (
    [
      "Company documents",
      "Financials",
      "Certifications",
      "Technical capability",
      "EHS",
      "IT / AI governance",
      "Past performance",
      "Supplier ecosystem",
    ] as const
  ).map((category, index) =>
    qualification(
      `generic-${index}`,
      category,
      `${category} requirement-to-evidence mapping`,
      "Missing evidence",
      categoryOwner(category),
      0,
      null,
    ),
  );
  return assembleReadiness({
    assessment,
    sampleType: "assessment",
    disclaimer: DIAGNOSTIC_DISCLAIMER,
    standards: summarizeStandards(standardsEvidence),
    standardsEvidence,
    customerQualification,
    statutory: STATUTORY_REQUIREMENTS.map((requirement, index) =>
      statutoryItem(
        assessment.id,
        requirement,
        "Missing evidence",
        null,
        "No controlled evidence indexed",
        index,
      ),
    ),
    suppliers: [
      supplier("generic-supplier", "Supplier portfolio", "All suppliers", "Missing evidence", "Dependency mapping not provided", "No qualification evidence indexed", "medium", "medium", false, "Not quantified", "Requires assessment", null),
    ],
    aiGovernance: buildAIControls(assessment.id, null, true),
  });
}

function assembleReadiness(input: Omit<AssessmentReadiness, "cockpit" | "criticalGaps" | "closurePlan" | "assessmentId" | "companyName"> & {
  assessment: Assessment;
}): AssessmentReadiness {
  const standardsScore = calculateReadinessScore(
    input.standards.map((item) => item.status),
  );
  const customerScore = calculateReadinessScore(
    input.customerQualification.map((item) => item.status),
  );
  const statutoryScore = calculateReadinessScore(
    input.statutory.map((item) => item.evidenceStatus),
  );
  const supplierScore = calculateReadinessScore(
    input.suppliers.map((item) => item.qualificationStatus),
  );
  const aiScore = calculateReadinessScore(
    input.aiGovernance.map((item) => item.status),
  );
  const criticalGaps = [
    ...input.standards
      .filter((item) => item.status === "Missing evidence" && item.riskLevel === "high")
      .map((item) => `${item.code}: ${item.gaps[0]}`),
    ...input.customerQualification
      .filter((item) => item.status === "Missing evidence")
      .map((item) => `${item.category}: ${item.missingEvidence[0]}`),
    ...input.statutory
      .filter(
        (item) =>
          item.evidenceStatus === "Missing evidence" &&
          (item.riskLevel === "critical" || item.riskLevel === "high"),
      )
      .map((item) => `${item.requirement}: ${item.gap}`),
  ].slice(0, 10);
  const revenueBlockedByGaps = input.customerQualification.reduce(
    (sum, item) =>
      item.status === "Evidence found" ? sum : sum + item.revenueAtRisk,
    0,
  );
  const cockpit: ComplianceCockpit = {
    standardsReadinessScore: standardsScore,
    customerQualificationReadiness: customerScore,
    statutoryEvidenceHealth: statutoryScore,
    supplierQualificationHealth: supplierScore,
    aiGovernanceReadiness: aiScore,
    criticalGaps: criticalGaps.length,
    expiringDocuments:
      input.standardsEvidence.filter(
        (item) =>
          item.status === "Expired evidence" ||
          (item.validTo !== null && item.validTo <= "2026-09-30"),
      ).length +
      input.statutory.filter(
        (item) => item.evidenceStatus === "Expired evidence",
      ).length,
    revenueBlockedByGaps,
  };
  return {
    assessmentId: input.assessment.id,
    companyName: input.assessment.companyName,
    sampleType: input.sampleType,
    disclaimer: input.disclaimer,
    standards: input.standards,
    standardsEvidence: input.standardsEvidence,
    customerQualification: input.customerQualification,
    statutory: input.statutory,
    suppliers: input.suppliers,
    aiGovernance: input.aiGovernance,
    cockpit,
    criticalGaps,
    closurePlan: buildClosurePlan(criticalGaps),
  };
}

function standardEvidence(input: {
  assessmentId: string;
  code: string;
  name: string;
  index: number;
  status: ReadinessEvidenceStatus;
  sourceId: string | null;
  evidenceDocument: string;
  confidence: "high" | "medium" | "low";
  humanReviewed: boolean;
  revenueImpact: number;
}): StandardsEvidenceRecord {
  const riskLevel: ReadinessRiskLevel =
    input.status === "Missing evidence"
      ? input.index < 8
        ? "high"
        : "medium"
      : input.status === "Expired evidence"
        ? "high"
        : "medium";
  return {
    id: `std-${slug(input.code)}`,
    assessmentId: input.assessmentId,
    standardCode: input.code,
    standardName: input.name,
    clauseOrRequirement: "Applicability, controlled evidence, ownership, and review status",
    evidenceDocument: input.evidenceDocument,
    evidenceType: "Readiness evidence",
    ownerDepartment:
      input.code.startsWith("ISO/IEC")
        ? "IT / Risk"
        : input.code === "CUSTOMER"
          ? "Commercial / Engineering"
          : "Quality / Engineering",
    validFrom: null,
    validTo: null,
    status: input.status,
    gapDescription:
      input.status === "Evidence found"
        ? "No gap recorded in the indexed evidence"
        : `${input.code} applicability and approved evidence require ${
            input.status === "Needs review" ? "human review" : "collection"
          }.`,
    customerImpact:
      input.status === "Not applicable"
        ? "No current customer impact recorded"
        : "May affect bid, vendor registration, audit, or delivery evidence readiness",
    revenueImpact: input.revenueImpact,
    riskLevel,
    nextReviewDate: REVIEW_DATE,
    sourceId: input.sourceId,
    confidence: input.confidence,
    humanReviewed: input.humanReviewed,
  };
}

function summarizeStandards(
  records: StandardsEvidenceRecord[],
): StandardReadinessItem[] {
  return records.map((record) => ({
    code: record.standardCode,
    name: record.standardName,
    status: record.status,
    evidenceCount: record.sourceId ? 1 : 0,
    gaps:
      record.status === "Evidence found" || record.status === "Not applicable"
        ? []
        : [record.gapDescription],
    owner: record.ownerDepartment,
    riskLevel: record.riskLevel,
    confidence: record.confidence,
    nextReviewDate: record.nextReviewDate,
    businessImpact: record.customerImpact,
  }));
}

function qualification(
  id: string,
  category: CustomerQualificationItem["category"],
  requirement: string,
  status: ReadinessEvidenceStatus,
  owner: string,
  revenueAtRisk: number,
  sourceId: string | null,
): CustomerQualificationItem {
  return {
    id,
    category,
    requirement,
    status,
    blockers:
      status === "Evidence found" ? [] : [`${category} evidence is not approval-ready`],
    missingEvidence:
      status === "Evidence found"
        ? []
        : [`Approved ${category.toLowerCase()} evidence pack`],
    owner,
    revenueAtRisk,
    sourceId,
    confidence: status === "Evidence found" ? "high" : sourceId ? "medium" : "low",
  };
}

function statutoryItem(
  assessmentId: string,
  requirement: string,
  evidenceStatus: ReadinessEvidenceStatus,
  sourceId: string | null,
  evidenceDocument: string,
  index: number,
): StatutoryReadinessItem {
  return {
    id: `stat-${slug(requirement)}`,
    requirement,
    evidenceStatus,
    expiryOrReviewDate: REVIEW_DATE,
    owner:
      requirement === "Board approvals"
        ? "Company Secretary"
        : requirement.includes("audit") || requirement === "Audited financials"
          ? "CFO / Internal Audit"
          : "Compliance Lead",
    riskLevel:
      evidenceStatus === "Evidence found"
        ? "low"
        : index < 7
          ? "high"
          : "medium",
    sourceId,
    evidenceDocument,
    gap:
      evidenceStatus === "Evidence found"
        ? "No gap recorded in the indexed evidence"
        : `${requirement} evidence requires collection and human validation for assessment ${assessmentId}.`,
  };
}

function supplier(
  id: string,
  supplierName: string,
  category: string,
  qualificationStatus: ReadinessEvidenceStatus,
  criticalDependency: string,
  certifications: string,
  qualityRisk: ReadinessRiskLevel,
  deliveryRisk: ReadinessRiskLevel,
  singleSourceRisk: boolean,
  commercialDependency: string,
  customerProjectImpact: string,
  sourceId: string | null,
): SupplierReadinessItem {
  return {
    id,
    supplierName,
    category,
    qualificationStatus,
    criticalDependency,
    certifications,
    qualityRisk,
    deliveryRisk,
    singleSourceRisk,
    commercialDependency,
    customerProjectImpact,
    sourceId,
  };
}

function buildAIControls(
  assessmentId: string,
  sourceId: string | null,
  publicDomain: boolean,
): AIGovernanceControl[] {
  return AI_CONTROLS.map((control, index) => {
    const guardrail = control === "No autonomous irreversible action";
    const status: ReadinessEvidenceStatus = guardrail
      ? "Evidence found"
      : sourceId && index < 5
        ? "Needs review"
        : "Missing evidence";
    return {
      id: `ai-${slug(control)}`,
      control,
      status,
      evidence: guardrail
        ? "PulseIQ internal read-only guardrail: human approval required before action"
        : sourceId
          ? "SOP & Readiness Evidence Register — Sample"
          : publicDomain
            ? "Public-domain sample; approved internal control evidence required"
            : "No indexed evidence",
      owner:
        control === "Role-based access"
          ? "IT Administrator"
          : "AI Governance Owner",
      confidence: guardrail ? "high" : sourceId ? "medium" : "low",
      humanApprovalRequired: true,
      sourceId: guardrail ? null : sourceId,
      gap:
        status === "Evidence found"
          ? "Guardrail enabled"
          : `${control} control evidence requires human validation for assessment ${assessmentId}.`,
    };
  });
}

function buildClosurePlan(gaps: string[]): ReadinessClosurePhase[] {
  const fallback = [
    "Confirm applicability and owners for standards and statutory requirements.",
    "Collect approved evidence and link each item to a source.",
    "Complete human review and record closure decisions.",
  ];
  return [
    {
      window: "30 days",
      title: "Triage and assign",
      actions: (gaps.slice(0, 3).length ? gaps.slice(0, 3) : fallback).map(
        (gap) => `Assign owner and evidence request: ${gap}`,
      ),
    },
    {
      window: "60 days",
      title: "Collect and validate",
      actions: [
        "Collect controlled standards, statutory, customer, and supplier evidence.",
        "Link each record to a source and complete human review.",
        "Resolve expired or contradictory documents before customer use.",
      ],
    },
    {
      window: "90 days",
      title: "Close and govern",
      actions: [
        "Review residual high-risk gaps with leadership.",
        "Publish the approved readiness pack for board or customer review.",
        "Set recurring review dates and preserve the no-autonomous-action guardrail.",
      ],
    },
  ];
}

function categoryOwner(
  category: CustomerQualificationItem["category"],
): string {
  if (category === "Financials") return "CFO";
  if (category === "Technical capability") return "Engineering Head";
  if (category === "EHS") return "EHS Head";
  if (category === "IT / AI governance") return "CIO / Risk";
  if (category === "Supplier ecosystem") return "Procurement Head";
  return "Commercial Operations";
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatCrores(value: number): string {
  return `₹${(value / CR).toFixed(1).replace(/\.0$/, "")} Cr`;
}
