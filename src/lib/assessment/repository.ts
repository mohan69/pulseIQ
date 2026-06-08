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
  listAssessments(): Assessment[];
  getAssessment(id: string): Assessment | undefined;
  createAssessment(input: CreateAssessmentInput): Assessment;
  updateAssessmentStatus(
    id: string,
    status: AssessmentStatus,
  ): Assessment | undefined;

  getSources(assessmentId: string): Source[];
  addSource(assessmentId: string, input: AddSourceInput): Source | undefined;
  updateSource(sourceId: string, patch: SourcePatch): Source | undefined;

  getFacts(assessmentId: string): ExtractedFact[];
  addFacts(
    assessmentId: string,
    sourceId: string,
    facts: AddFactInput[],
  ): ExtractedFact[];

  getTruthLayers(assessmentId: string): TruthLayer[];
  setTruthLayers(assessmentId: string, layers: TruthLayer[]): void;

  getCockpit(assessmentId: string): Cockpit;
  setCockpit(assessmentId: string, cockpit: Cockpit): void;

  getScenarios(assessmentId: string): Scenario[];
  setScenarios(assessmentId: string, scenarios: Scenario[]): void;

  getRecommendations(assessmentId: string): Recommendation[];
  setRecommendations(assessmentId: string, recs: Recommendation[]): void;

  getPlan(assessmentId: string): ActionPhase[];
  setPlan(assessmentId: string, plan: ActionPhase[]): void;

  getReport(assessmentId: string): Report | undefined;
}
