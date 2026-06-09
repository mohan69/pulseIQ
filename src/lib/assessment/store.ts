// PulseIQ Workbench — stable public store facade.
// UI pages and Server Actions import this module. Memory remains the default;
// database mode is selected with PULSEIQ_DATA_MODE=database.

import { memoryAssessmentRepository } from "./memory-repository";
import type {
  AddAuditEventInput,
  AddFactInput,
  AddSourceInput,
  AddSourceDocumentInput,
  AssessmentRepository,
  CreateAssessmentInput,
  SourcePatch,
} from "./repository";
import type {
  ActionPhase,
  AnalysisState,
  AssessmentStatus,
  Cockpit,
  Recommendation,
  Scenario,
  TruthLayer,
} from "./types";
import {
  presentCockpit,
  presentRecommendations,
  presentReport,
  presentScenarios,
} from "./presentation";

type DataMode = "memory" | "database";

let cachedDatabaseRepository: AssessmentRepository | null = null;

function getDataMode(): DataMode {
  const mode = process.env.PULSEIQ_DATA_MODE ?? "memory";
  if (mode === "memory" || mode === "database") return mode;
  throw new Error(
    `Unsupported PULSEIQ_DATA_MODE="${mode}". Expected "memory" or "database".`,
  );
}

async function getRepository(): Promise<AssessmentRepository> {
  const mode = getDataMode();
  if (mode === "memory") return memoryAssessmentRepository;

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "PULSEIQ_DATA_MODE=database requires DATABASE_URL. Set DATABASE_URL or switch PULSEIQ_DATA_MODE back to memory.",
    );
  }

  if (cachedDatabaseRepository) return cachedDatabaseRepository;
  const { prismaAssessmentRepository } = await import("./prisma-repository");
  cachedDatabaseRepository = prismaAssessmentRepository;
  return cachedDatabaseRepository;
}

export type {
  AddFactInput,
  AddAuditEventInput,
  AddSourceInput,
  AddSourceDocumentInput,
  CreateAssessmentInput,
  SourcePatch,
};

export async function listAssessments() {
  return (await getRepository()).listAssessments();
}

export async function getAssessment(id: string) {
  return (await getRepository()).getAssessment(id);
}

export async function createAssessment(input: CreateAssessmentInput) {
  return (await getRepository()).createAssessment(input);
}

export async function updateAssessmentStatus(
  id: string,
  status: AssessmentStatus,
) {
  return (await getRepository()).updateAssessmentStatus(id, status);
}

export async function deleteAssessment(id: string) {
  return (await getRepository()).deleteAssessment(id);
}

export async function setAssessmentStatus(
  id: string,
  status: AssessmentStatus,
) {
  return updateAssessmentStatus(id, status);
}

export async function getSources(assessmentId: string) {
  return (await getRepository()).getSources(assessmentId);
}

export async function addSource(assessmentId: string, input: AddSourceInput) {
  return (await getRepository()).addSource(assessmentId, input);
}

export async function updateSource(sourceId: string, patch: SourcePatch) {
  return (await getRepository()).updateSource(sourceId, patch);
}

export async function deleteSource(sourceId: string) {
  return (await getRepository()).deleteSource(sourceId);
}

export async function addSourceDocument(
  sourceId: string,
  input: AddSourceDocumentInput,
) {
  return (await getRepository()).addSourceDocument(sourceId, input);
}

export async function getSourceDocuments(sourceId: string) {
  return (await getRepository()).getSourceDocuments(sourceId);
}

export async function getExtractedDocuments(assessmentId: string) {
  return (await getRepository()).getExtractedDocuments(assessmentId);
}

export async function getFacts(assessmentId: string) {
  return (await getRepository()).getFacts(assessmentId);
}

export async function saveExtractedFacts(
  assessmentId: string,
  sourceId: string,
  facts: AddFactInput[],
) {
  return (await getRepository()).saveExtractedFacts(
    assessmentId,
    sourceId,
    facts,
  );
}

export async function addFacts(
  assessmentId: string,
  sourceId: string,
  facts: AddFactInput[],
) {
  return (await getRepository()).addFacts(assessmentId, sourceId, facts);
}

export async function getTruthLayers(assessmentId: string) {
  return (await getRepository()).getTruthLayers(assessmentId);
}

export async function setTruthLayers(
  assessmentId: string,
  layers: TruthLayer[],
) {
  return (await getRepository()).setTruthLayers(assessmentId, layers);
}

export async function getCockpit(assessmentId: string) {
  const repository = await getRepository();
  const [assessment, cockpit] = await Promise.all([
    repository.getAssessment(assessmentId),
    repository.getCockpit(assessmentId),
  ]);
  return presentCockpit(assessment, cockpit);
}

export async function setCockpit(assessmentId: string, cockpit: Cockpit) {
  return (await getRepository()).setCockpit(assessmentId, cockpit);
}

export async function getScenarios(assessmentId: string) {
  const repository = await getRepository();
  const [assessment, scenarios] = await Promise.all([
    repository.getAssessment(assessmentId),
    repository.getScenarios(assessmentId),
  ]);
  return presentScenarios(assessment, scenarios);
}

export async function setScenarios(
  assessmentId: string,
  scenarios: Scenario[],
) {
  return (await getRepository()).setScenarios(assessmentId, scenarios);
}

export async function getRecommendations(assessmentId: string) {
  const repository = await getRepository();
  const [assessment, recommendations] = await Promise.all([
    repository.getAssessment(assessmentId),
    repository.getRecommendations(assessmentId),
  ]);
  return presentRecommendations(assessment, recommendations);
}

export async function setRecommendations(
  assessmentId: string,
  recs: Recommendation[],
) {
  return (await getRepository()).setRecommendations(assessmentId, recs);
}

export async function getPlan(assessmentId: string) {
  return (await getRepository()).getPlan(assessmentId);
}

export async function setPlan(assessmentId: string, plan: ActionPhase[]) {
  return (await getRepository()).setPlan(assessmentId, plan);
}

export async function getReport(assessmentId: string) {
  const repository = await getRepository();
  const [assessment, report] = await Promise.all([
    repository.getAssessment(assessmentId),
    repository.getReport(assessmentId),
  ]);
  return presentReport(assessment, report);
}

export async function getAnalysisState(assessmentId: string) {
  return (await getRepository()).getAnalysisState(assessmentId);
}

export async function setAnalysisState(
  assessmentId: string,
  state: AnalysisState,
) {
  return (await getRepository()).setAnalysisState(assessmentId, state);
}

export async function markAssessmentAnalyzing(id: string) {
  return (await getRepository()).markAssessmentAnalyzing(id);
}

export async function markAssessmentAnalyzed(id: string) {
  return (await getRepository()).markAssessmentAnalyzed(id);
}

export async function markAssessmentAnalysisFailed(id: string) {
  return (await getRepository()).markAssessmentAnalysisFailed(id);
}

export async function addAuditEvent(input: AddAuditEventInput) {
  return (await getRepository()).addAuditEvent(input);
}
