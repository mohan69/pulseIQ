// PulseIQ Workbench — stable public store facade.
// UI pages and Server Actions import this module. The implementation delegates
// to the current in-memory repository until a database-backed adapter is added.

import { memoryAssessmentRepository } from "./memory-repository";
import type {
  AddFactInput,
  AddSourceInput,
  CreateAssessmentInput,
  SourcePatch,
} from "./repository";
import type {
  ActionPhase,
  AssessmentStatus,
  Cockpit,
  Recommendation,
  Scenario,
  TruthLayer,
} from "./types";

const repository = memoryAssessmentRepository;

export type {
  AddFactInput,
  AddSourceInput,
  CreateAssessmentInput,
  SourcePatch,
};

export function listAssessments() {
  return repository.listAssessments();
}

export function getAssessment(id: string) {
  return repository.getAssessment(id);
}

export function createAssessment(input: CreateAssessmentInput) {
  return repository.createAssessment(input);
}

export function updateAssessmentStatus(
  id: string,
  status: AssessmentStatus,
) {
  return repository.updateAssessmentStatus(id, status);
}

export function setAssessmentStatus(id: string, status: AssessmentStatus) {
  return updateAssessmentStatus(id, status);
}

export function getSources(assessmentId: string) {
  return repository.getSources(assessmentId);
}

export function addSource(assessmentId: string, input: AddSourceInput) {
  return repository.addSource(assessmentId, input);
}

export function updateSource(sourceId: string, patch: SourcePatch) {
  return repository.updateSource(sourceId, patch);
}

export function getFacts(assessmentId: string) {
  return repository.getFacts(assessmentId);
}

export function addFacts(
  assessmentId: string,
  sourceId: string,
  facts: AddFactInput[],
) {
  return repository.addFacts(assessmentId, sourceId, facts);
}

export function getTruthLayers(assessmentId: string) {
  return repository.getTruthLayers(assessmentId);
}

export function setTruthLayers(assessmentId: string, layers: TruthLayer[]) {
  repository.setTruthLayers(assessmentId, layers);
}

export function getCockpit(assessmentId: string) {
  return repository.getCockpit(assessmentId);
}

export function setCockpit(assessmentId: string, cockpit: Cockpit) {
  repository.setCockpit(assessmentId, cockpit);
}

export function getScenarios(assessmentId: string) {
  return repository.getScenarios(assessmentId);
}

export function setScenarios(assessmentId: string, scenarios: Scenario[]) {
  repository.setScenarios(assessmentId, scenarios);
}

export function getRecommendations(assessmentId: string) {
  return repository.getRecommendations(assessmentId);
}

export function setRecommendations(
  assessmentId: string,
  recs: Recommendation[],
) {
  repository.setRecommendations(assessmentId, recs);
}

export function getPlan(assessmentId: string) {
  return repository.getPlan(assessmentId);
}

export function setPlan(assessmentId: string, plan: ActionPhase[]) {
  repository.setPlan(assessmentId, plan);
}

export function getReport(assessmentId: string) {
  return repository.getReport(assessmentId);
}
