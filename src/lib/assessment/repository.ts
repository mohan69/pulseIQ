import type {
  ActionPhase,
  AnalysisState,
  Assessment,
  AssessmentObjective,
  AssessmentStatus,
  Cockpit,
  ExtractedFact,
  Industry,
  Recommendation,
  Report,
  Scenario,
  Source,
  SourceDocument,
  SourceType,
  TruthLayer,
} from "./types";

export type Awaitable<T> = T | Promise<T>;

export type CreateAssessmentInput = {
  companyName: string;
  industry: Industry;
  objective: AssessmentObjective;
  revenueTarget: number;
  marginTarget: number;
  cashTarget: number;
  headcountProductivityTarget: number;
};

export type AddSourceInput = {
  name: string;
  type: SourceType;
  notes?: string;
  fileName?: string;
  mimeType?: string;
  byteSize?: number;
  checksumSha256?: string;
  storageProvider?: string;
  storageContainer?: string;
  storageKey?: string;
  extractionStatus?: Source["extractionStatus"];
  extractedTextPreview?: string;
  extractedAt?: string;
  extractionError?: string;
};

export type AddSourceDocumentInput = Omit<
  SourceDocument,
  "id" | "sourceId" | "createdAt"
>;

export type AddFactInput = Omit<
  ExtractedFact,
  "id" | "assessmentId" | "sourceId" | "capturedAt"
>;

export type SourcePatch = Partial<
  Omit<Source, "id" | "assessmentId" | "createdAt">
>;

export type AddAuditEventInput = {
  action: string;
  entityType: string;
  entityId: string;
  assessmentId?: string;
  metadata?: Record<string, unknown>;
};

export interface AssessmentRepository {
  listAssessments(): Awaitable<Assessment[]>;
  getAssessment(id: string): Awaitable<Assessment | undefined>;
  createAssessment(input: CreateAssessmentInput): Awaitable<Assessment>;
  updateAssessmentStatus(
    id: string,
    status: AssessmentStatus,
  ): Awaitable<Assessment | undefined>;
  deleteAssessment(id: string): Awaitable<boolean>;

  getSources(assessmentId: string): Awaitable<Source[]>;
  addSource(
    assessmentId: string,
    input: AddSourceInput,
  ): Awaitable<Source | undefined>;
  updateSource(
    sourceId: string,
    patch: SourcePatch,
  ): Awaitable<Source | undefined>;
  deleteSource(sourceId: string): Awaitable<boolean>;
  addSourceDocument(
    sourceId: string,
    input: AddSourceDocumentInput,
  ): Awaitable<SourceDocument | undefined>;
  getSourceDocuments(sourceId: string): Awaitable<SourceDocument[]>;
  getExtractedDocuments(assessmentId: string): Awaitable<SourceDocument[]>;

  getFacts(assessmentId: string): Awaitable<ExtractedFact[]>;
  saveExtractedFacts(
    assessmentId: string,
    sourceId: string,
    facts: AddFactInput[],
  ): Awaitable<ExtractedFact[]>;
  addFacts(
    assessmentId: string,
    sourceId: string,
    facts: AddFactInput[],
  ): Awaitable<ExtractedFact[]>;

  getTruthLayers(assessmentId: string): Awaitable<TruthLayer[]>;
  setTruthLayers(assessmentId: string, layers: TruthLayer[]): Awaitable<void>;

  getCockpit(assessmentId: string): Awaitable<Cockpit>;
  setCockpit(assessmentId: string, cockpit: Cockpit): Awaitable<void>;

  getScenarios(assessmentId: string): Awaitable<Scenario[]>;
  setScenarios(assessmentId: string, scenarios: Scenario[]): Awaitable<void>;

  getRecommendations(assessmentId: string): Awaitable<Recommendation[]>;
  setRecommendations(
    assessmentId: string,
    recs: Recommendation[],
  ): Awaitable<void>;

  getPlan(assessmentId: string): Awaitable<ActionPhase[]>;
  setPlan(assessmentId: string, plan: ActionPhase[]): Awaitable<void>;

  getReport(assessmentId: string): Awaitable<Report | undefined>;
  getAnalysisState(assessmentId: string): Awaitable<AnalysisState>;
  setAnalysisState(
    assessmentId: string,
    state: AnalysisState,
  ): Awaitable<void>;

  markAssessmentAnalyzing(id: string): Awaitable<Assessment | undefined>;
  markAssessmentAnalyzed(id: string): Awaitable<Assessment | undefined>;
  markAssessmentAnalysisFailed(id: string): Awaitable<Assessment | undefined>;
  addAuditEvent(input: AddAuditEventInput): Awaitable<void>;
}
