// PulseIQ Assessment Workbench — core domain types
// All amounts in INR; values stored in absolute rupees (e.g. ₹1.2 Cr = 12_000_000)

export type Industry =
  | "industrial_manufacturing"
  | "epc"
  | "valve_manufacturer"
  | "pump_manufacturer"
  | "industrial_oem"
  | "project_manufacturing"
  | "mid_market_enterprise"
  | "other";

export type AssessmentObjective =
  | "board_review"
  | "ai_transformation"
  | "revenue_push"
  | "margin_improvement"
  | "operating_reset"
  | "investor_review"
  | "turnaround";

export type AssessmentStatus =
  | "draft"
  | "intake"
  | "ingestion"
  | "analyzing"
  | "analysis"
  | "analysis_failed"
  | "review"
  | "delivered";

export type Assessment = {
  id: string;
  companyName: string;
  industry: Industry;
  objective: AssessmentObjective;
  revenueTarget: number; // ₹ absolute
  marginTarget: number; // percent (0-100)
  cashTarget: number; // ₹ absolute
  headcountProductivityTarget: number; // ₹/employee target
  status: AssessmentStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type SourceType =
  | "financial_filing"
  | "strategy_deck"
  | "sop"
  | "excel_tracker"
  | "erp_export"
  | "crm_export"
  | "hrms_export"
  | "operations_report"
  | "proposal_report"
  | "email_summary"
  | "meeting_summary";

export type SourceStatus = "registered" | "parsing" | "parsed" | "failed";

export type ConfidenceLevel = "high" | "medium" | "low";

export type SourceOrigin = "demo" | "manual" | "uploaded";

export type ExtractionStatus =
  | "not_applicable"
  | "extracted"
  | "extraction_pending"
  | "failed";

export type Source = {
  id: string;
  assessmentId: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  confidence: ConfidenceLevel;
  notes: string;
  createdAt: string;
  pageCount?: number;
  origin?: SourceOrigin;
  fileName?: string;
  mimeType?: string;
  byteSize?: number;
  checksumSha256?: string;
  storageProvider?: string;
  storageContainer?: string;
  storageKey?: string;
  extractionStatus?: ExtractionStatus;
  extractedTextPreview?: string;
  extractedAt?: string;
  extractionError?: string;
};

export type SourceDocument = {
  id: string;
  sourceId: string;
  kind: "text" | "table" | "page" | "chunk";
  pageNumber?: number;
  chunkIndex?: number;
  content?: string;
  data?: unknown;
  metadata?: unknown;
  createdAt: string;
};

export type FactKind =
  | "revenue"
  | "cost"
  | "margin"
  | "cash"
  | "receivables"
  | "payables"
  | "pipeline"
  | "orders"
  | "backlog"
  | "headcount"
  | "customer"
  | "product"
  | "supplier"
  | "risk"
  | "opportunity"
  | "action_item"
  | "commitment"
  | "target"
  | "sop_rule";

export type ExtractedFact = {
  id: string;
  assessmentId: string;
  sourceId: string;
  kind: FactKind;
  label: string;
  value: string; // human-readable value
  numericValue?: number; // optional numeric form for analytics
  unit?: string; // e.g. "₹", "%", "people"
  evidence: string; // source excerpt or pointer
  confidence: ConfidenceLevel;
  capturedAt: string;
};

export type TruthLayerKey =
  | "financial"
  | "strategic"
  | "operational"
  | "process"
  | "collaboration";

export type TruthLayer = {
  key: TruthLayerKey;
  title: string;
  description: string;
  findings: TruthFinding[];
  evidence: EvidenceRef[];
  confidence: ConfidenceLevel;
  gaps: string[];
  contradictions: string[];
};

export type TruthFinding = {
  id: string;
  text: string;
  impact: "high" | "medium" | "low";
  factIds: string[];
};

export type EvidenceRef = {
  sourceId: string;
  factId: string;
  excerpt: string;
};

export type CockpitMetric = {
  key: string;
  label: string;
  value: number;
  target: number;
  unit: "₹" | "%" | "₹/employee" | "count";
  status: "on_track" | "at_risk" | "off_track";
  note: string;
};

export type TopRisk = {
  id: string;
  title: string;
  description: string;
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
};

export type TopOpportunity = {
  id: string;
  title: string;
  description: string;
  impactInr: number;
  timeframeDays: number;
};

export type Cockpit = {
  metrics: CockpitMetric[];
  topRisks: TopRisk[];
  topOpportunities: TopOpportunity[];
};

export type ScenarioKey =
  | "revenue_plus_10"
  | "margin_plus_10"
  | "cost_minus_10"
  | "headcount_minus_15"
  | "cash_improvement";

export type Scenario = {
  key: ScenarioKey;
  label: string;
  description: string;
  currentBaseline: string;
  target: string;
  options: string[];
  pros: string[];
  shortfalls: string[];
  expectedImpact: string;
  risks: string[];
  recommendation: string;
  confidence: ConfidenceLevel;
};

export type Recommendation = {
  id: string;
  rank: number;
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2" | "P3";
  businessImpact: string; // e.g. "₹4.5 – ₹6.2 Cr / yr"
  effort: "low" | "medium" | "high";
  timeframeDays: number;
  ownerRole: string;
  evidence: string;
  confidence: ConfidenceLevel;
};

export type ActionPhase = {
  phase: string;
  windowLabel: string;
  title: string;
  description: string;
  deliverables: string[];
};

export type Report = {
  assessmentId: string;
  generatedAt: string;
  executiveSummary: string;
  sourceCount: number;
  factCount: number;
  truthLayers: TruthLayer[];
  cockpit: Cockpit;
  scenarios: Scenario[];
  recommendations: Recommendation[];
  plan: ActionPhase[];
  dataGaps: string[];
};
