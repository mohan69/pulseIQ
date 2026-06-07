// PulseIQ Workbench — in-memory store
// MVP-only. Module-level state. Designed so a Prisma adapter can drop in
// behind the same surface without UI changes.

import { generateId } from "@/lib/utils";
import {
  demoAssessment,
  demoCockpit,
  demoFacts,
  demoPlan,
  demoRecommendations,
  demoScenarios,
  demoSources,
  demoTruthLayers,
} from "./seed";
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

type StoreState = {
  assessments: Map<string, Assessment>;
  sources: Map<string, Source[]>; // by assessmentId
  facts: Map<string, ExtractedFact[]>; // by assessmentId
  truthLayers: Map<string, TruthLayer[]>; // by assessmentId
  cockpits: Map<string, Cockpit>; // by assessmentId
  scenarios: Map<string, Scenario[]>; // by assessmentId
  recommendations: Map<string, Recommendation[]>; // by assessmentId
  plans: Map<string, ActionPhase[]>; // by assessmentId
};

declare global {
  var __pulseiqStore: StoreState | undefined;
}

function getOrInitState(): StoreState {
  if (globalThis.__pulseiqStore) return globalThis.__pulseiqStore;
  const state: StoreState = {
    assessments: new Map(),
    sources: new Map(),
    facts: new Map(),
    truthLayers: new Map(),
    cockpits: new Map(),
    scenarios: new Map(),
    recommendations: new Map(),
    plans: new Map(),
  };
  // Seed the demo assessment once.
  state.assessments.set(demoAssessment.id, demoAssessment);
  state.sources.set(demoAssessment.id, [...demoSources]);
  state.facts.set(demoAssessment.id, [...demoFacts]);
  state.truthLayers.set(demoAssessment.id, [...demoTruthLayers]);
  state.cockpits.set(demoAssessment.id, demoCockpit);
  state.scenarios.set(demoAssessment.id, [...demoScenarios]);
  state.recommendations.set(demoAssessment.id, [...demoRecommendations]);
  state.plans.set(demoAssessment.id, [...demoPlan]);
  globalThis.__pulseiqStore = state;
  return state;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export function listAssessments(): Assessment[] {
  const s = getOrInitState();
  return Array.from(s.assessments.values()).sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
}

export function getAssessment(id: string): Assessment | undefined {
  return getOrInitState().assessments.get(id);
}

export type CreateAssessmentInput = {
  companyName: string;
  industry: Industry;
  objective: AssessmentObjective;
  revenueTarget: number;
  marginTarget: number;
  cashTarget: number;
  headcountProductivityTarget: number;
};

export function createAssessment(input: CreateAssessmentInput): Assessment {
  const s = getOrInitState();
  const id = `asm-${generateId()}`;
  const now = nowIso();
  const assessment: Assessment = {
    id,
    companyName: input.companyName,
    industry: input.industry,
    objective: input.objective,
    revenueTarget: input.revenueTarget,
    marginTarget: input.marginTarget,
    cashTarget: input.cashTarget,
    headcountProductivityTarget: input.headcountProductivityTarget,
    status: "draft" as AssessmentStatus,
    createdAt: now,
    updatedAt: now,
  };
  s.assessments.set(id, assessment);
  s.sources.set(id, []);
  s.facts.set(id, []);
  s.truthLayers.set(id, emptyTruthLayers());
  s.cockpits.set(id, { metrics: [], topRisks: [], topOpportunities: [] });
  s.scenarios.set(id, []);
  s.recommendations.set(id, []);
  s.plans.set(id, []);
  return assessment;
}

export function updateAssessmentStatus(
  id: string,
  status: AssessmentStatus,
): Assessment | undefined {
  const s = getOrInitState();
  const existing = s.assessments.get(id);
  if (!existing) return undefined;
  const next: Assessment = { ...existing, status, updatedAt: nowIso() };
  s.assessments.set(id, next);
  return next;
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export function getSources(assessmentId: string): Source[] {
  return getOrInitState().sources.get(assessmentId) ?? [];
}

export type AddSourceInput = {
  name: string;
  type: SourceType;
  notes?: string;
};

export function addSource(
  assessmentId: string,
  input: AddSourceInput,
): Source | undefined {
  const s = getOrInitState();
  const assessment = s.assessments.get(assessmentId);
  if (!assessment) return undefined;
  const src: Source = {
    id: `src-${generateId()}`,
    assessmentId,
    name: input.name,
    type: input.type,
    status: "registered",
    confidence: "medium",
    notes: input.notes ?? "",
    createdAt: nowIso(),
  };
  const list = s.sources.get(assessmentId) ?? [];
  s.sources.set(assessmentId, [src, ...list]);
  touch(assessmentId);
  return src;
}

export function updateSource(
  sourceId: string,
  patch: Partial<Omit<Source, "id" | "assessmentId" | "createdAt">>,
): Source | undefined {
  const s = getOrInitState();
  for (const [assessmentId, list] of s.sources.entries()) {
    const idx = list.findIndex((x) => x.id === sourceId);
    if (idx >= 0) {
      const next = { ...list[idx], ...patch };
      const newList = [...list];
      newList[idx] = next;
      s.sources.set(assessmentId, newList);
      touch(assessmentId);
      return next;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Facts
// ---------------------------------------------------------------------------

export function getFacts(assessmentId: string): ExtractedFact[] {
  return getOrInitState().facts.get(assessmentId) ?? [];
}

export function addFacts(
  assessmentId: string,
  sourceId: string,
  facts: Omit<ExtractedFact, "id" | "assessmentId" | "sourceId" | "capturedAt">[],
): ExtractedFact[] {
  const s = getOrInitState();
  const list = s.facts.get(assessmentId) ?? [];
  const created: ExtractedFact[] = facts.map((f) => ({
    id: `fact-${generateId()}`,
    assessmentId,
    sourceId,
    capturedAt: nowIso(),
    ...f,
  }));
  s.facts.set(assessmentId, [...created, ...list]);
  touch(assessmentId);
  return created;
}

// ---------------------------------------------------------------------------
// Truth layers / cockpit / scenarios / recs / plan
// ---------------------------------------------------------------------------

export function getTruthLayers(assessmentId: string): TruthLayer[] {
  return getOrInitState().truthLayers.get(assessmentId) ?? emptyTruthLayers();
}

export function setTruthLayers(
  assessmentId: string,
  layers: TruthLayer[],
): void {
  getOrInitState().truthLayers.set(assessmentId, layers);
  touch(assessmentId);
}

export function getCockpit(assessmentId: string): Cockpit {
  return (
    getOrInitState().cockpits.get(assessmentId) ?? {
      metrics: [],
      topRisks: [],
      topOpportunities: [],
    }
  );
}

export function setCockpit(assessmentId: string, cockpit: Cockpit): void {
  getOrInitState().cockpits.set(assessmentId, cockpit);
  touch(assessmentId);
}

export function getScenarios(assessmentId: string): Scenario[] {
  return getOrInitState().scenarios.get(assessmentId) ?? [];
}

export function setScenarios(assessmentId: string, scenarios: Scenario[]): void {
  getOrInitState().scenarios.set(assessmentId, scenarios);
  touch(assessmentId);
}

export function getRecommendations(assessmentId: string): Recommendation[] {
  return getOrInitState().recommendations.get(assessmentId) ?? [];
}

export function setRecommendations(
  assessmentId: string,
  recs: Recommendation[],
): void {
  getOrInitState().recommendations.set(assessmentId, recs);
  touch(assessmentId);
}

export function getPlan(assessmentId: string): ActionPhase[] {
  return getOrInitState().plans.get(assessmentId) ?? [];
}

export function setPlan(assessmentId: string, plan: ActionPhase[]): void {
  getOrInitState().plans.set(assessmentId, plan);
  touch(assessmentId);
}

// ---------------------------------------------------------------------------
// Composite
// ---------------------------------------------------------------------------

export function getReport(assessmentId: string): Report | undefined {
  const assessment = getAssessment(assessmentId);
  if (!assessment) return undefined;
  const sources = getSources(assessmentId);
  const facts = getFacts(assessmentId);
  const layers = getTruthLayers(assessmentId);
  const cockpit = getCockpit(assessmentId);
  const scenarios = getScenarios(assessmentId);
  const recs = getRecommendations(assessmentId);
  const plan = getPlan(assessmentId);
  const gaps = layers.flatMap((l) =>
    l.gaps.map((g) => `[${l.title}] ${g}`),
  );
  return {
    assessmentId,
    generatedAt: nowIso(),
    executiveSummary: buildExecutiveSummary(
      assessment,
      sources,
      facts,
      cockpit,
    ),
    sourceCount: sources.length,
    factCount: facts.length,
    truthLayers: layers,
    cockpit,
    scenarios,
    recommendations: recs,
    plan,
    dataGaps: gaps,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function touch(assessmentId: string): void {
  const s = getOrInitState();
  const a = s.assessments.get(assessmentId);
  if (!a) return;
  s.assessments.set(assessmentId, { ...a, updatedAt: nowIso() });
}

function emptyTruthLayers(): TruthLayer[] {
  return [
    {
      key: "financial",
      title: "Official Financial Truth",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
    {
      key: "strategic",
      title: "Strategic Management Intent",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
    {
      key: "operational",
      title: "Operational Reality",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
    {
      key: "process",
      title: "Process and SOP Truth",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
    {
      key: "collaboration",
      title: "Collaboration Truth",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
  ];
}

function buildExecutiveSummary(
  assessment: Assessment,
  sources: Source[],
  facts: ExtractedFact[],
  cockpit: Cockpit,
): string {
  const offTrack = cockpit.metrics.filter((m) => m.status === "off_track").length;
  const atRisk = cockpit.metrics.filter((m) => m.status === "at_risk").length;
  const headline =
    offTrack > 0
      ? `${offTrack} headline metric${offTrack === 1 ? "" : "s"} off track`
      : atRisk > 0
        ? `${atRisk} metric${atRisk === 1 ? "" : "s"} at risk`
        : "operating broadly on plan";
  return `Assessment of ${assessment.companyName} synthesised from ${sources.length} source${sources.length === 1 ? "" : "s"} and ${facts.length} extracted fact${facts.length === 1 ? "" : "s"}. Current operating posture: ${headline}.`;
}
