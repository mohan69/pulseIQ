import type {
  ActionPhase,
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
};

export type AddFactInput = Omit<
  ExtractedFact,
  "id" | "assessmentId" | "sourceId" | "capturedAt"
>;

export type SourcePatch = Partial<
  Omit<Source, "id" | "assessmentId" | "createdAt">
>;

export interface AssessmentRepository {
  listAssessments(): Awaitable<Assessment[]>;
  getAssessment(id: string): Awaitable<Assessment | undefined>;
  createAssessment(input: CreateAssessmentInput): Awaitable<Assessment>;
  updateAssessmentStatus(
    id: string,
    status: AssessmentStatus,
  ): Awaitable<Assessment | undefined>;

  getSources(assessmentId: string): Awaitable<Source[]>;
  addSource(
    assessmentId: string,
    input: AddSourceInput,
  ): Awaitable<Source | undefined>;
  updateSource(
    sourceId: string,
    patch: SourcePatch,
  ): Awaitable<Source | undefined>;

  getFacts(assessmentId: string): Awaitable<ExtractedFact[]>;
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
}
