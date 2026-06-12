import type { ConfidenceLevel } from "@/lib/assessment/types";

export type ReadinessEvidenceStatus =
  | "Evidence found"
  | "Missing evidence"
  | "Expired evidence"
  | "Needs review"
  | "Not applicable";

export type ReadinessRiskLevel = "critical" | "high" | "medium" | "low";

export type StandardsEvidenceRecord = {
  id: string;
  assessmentId: string;
  standardCode: string;
  standardName: string;
  clauseOrRequirement: string;
  evidenceDocument: string;
  evidenceType: string;
  ownerDepartment: string;
  validFrom: string | null;
  validTo: string | null;
  status: ReadinessEvidenceStatus;
  gapDescription: string;
  customerImpact: string;
  revenueImpact: number;
  riskLevel: ReadinessRiskLevel;
  nextReviewDate: string;
  sourceId: string | null;
  confidence: ConfidenceLevel;
  humanReviewed: boolean;
};

export type StandardReadinessItem = {
  code: string;
  name: string;
  status: ReadinessEvidenceStatus;
  evidenceCount: number;
  gaps: string[];
  owner: string;
  riskLevel: ReadinessRiskLevel;
  confidence: ConfidenceLevel;
  nextReviewDate: string;
  businessImpact: string;
};

export type QualificationCategory =
  | "Company documents"
  | "Financials"
  | "Certifications"
  | "Technical capability"
  | "EHS"
  | "IT / AI governance"
  | "Past performance"
  | "Supplier ecosystem";

export type CustomerQualificationItem = {
  id: string;
  category: QualificationCategory;
  requirement: string;
  status: ReadinessEvidenceStatus;
  blockers: string[];
  missingEvidence: string[];
  owner: string;
  revenueAtRisk: number;
  sourceId: string | null;
  confidence: ConfidenceLevel;
};

export type StatutoryReadinessItem = {
  id: string;
  requirement: string;
  evidenceStatus: ReadinessEvidenceStatus;
  expiryOrReviewDate: string;
  owner: string;
  riskLevel: ReadinessRiskLevel;
  sourceId: string | null;
  evidenceDocument: string;
  gap: string;
};

export type SupplierReadinessItem = {
  id: string;
  supplierName: string;
  category: string;
  qualificationStatus: ReadinessEvidenceStatus;
  criticalDependency: string;
  certifications: string;
  qualityRisk: ReadinessRiskLevel;
  deliveryRisk: ReadinessRiskLevel;
  singleSourceRisk: boolean;
  commercialDependency: string;
  customerProjectImpact: string;
  sourceId: string | null;
};

export type AIGovernanceControl = {
  id: string;
  control: string;
  status: ReadinessEvidenceStatus;
  evidence: string;
  owner: string;
  confidence: ConfidenceLevel;
  humanApprovalRequired: boolean;
  sourceId: string | null;
  gap: string;
};

export type ComplianceCockpit = {
  standardsReadinessScore: number;
  customerQualificationReadiness: number;
  statutoryEvidenceHealth: number;
  supplierQualificationHealth: number;
  aiGovernanceReadiness: number;
  criticalGaps: number;
  expiringDocuments: number;
  revenueBlockedByGaps: number;
};

export type ReadinessClosurePhase = {
  window: "30 days" | "60 days" | "90 days";
  title: string;
  actions: string[];
};

export type AssessmentReadiness = {
  assessmentId: string;
  companyName: string;
  sampleType: "bharat-demo" | "microfinish-public-domain" | "assessment";
  disclaimer: string;
  standards: StandardReadinessItem[];
  standardsEvidence: StandardsEvidenceRecord[];
  customerQualification: CustomerQualificationItem[];
  statutory: StatutoryReadinessItem[];
  suppliers: SupplierReadinessItem[];
  aiGovernance: AIGovernanceControl[];
  cockpit: ComplianceCockpit;
  criticalGaps: string[];
  closurePlan: ReadinessClosurePhase[];
};

export type ReadinessReportSection = {
  title: string;
  summary: string;
  items: string[];
};

