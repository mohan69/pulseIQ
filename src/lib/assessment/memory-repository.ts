// PulseIQ Workbench — in-memory repository
// MVP-only. Keeps the current globalThis Map behavior behind an adapter-shaped
// repository so a Prisma implementation can replace it without UI changes.

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
  AssessmentStatus,
  Cockpit,
  ExtractedFact,
  Recommendation,
  Report,
  Scenario,
  Source,
  TruthLayer,
} from "./types";
import type {
  AddFactInput,
  AddSourceInput,
  AssessmentRepository,
  CreateAssessmentInput,
  SourcePatch,
} from "./repository";

type StoreState = {
  assessments: Map<string, Assessment>;
  sources: Map<string, Source[]>;
  facts: Map<string, ExtractedFact[]>;
  truthLayers: Map<string, TruthLayer[]>;
  cockpits: Map<string, Cockpit>;
  scenarios: Map<string, Scenario[]>;
  recommendations: Map<string, Recommendation[]>;
  plans: Map<string, ActionPhase[]>;
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

export const memoryAssessmentRepository: AssessmentRepository = {
  listAssessments() {
    const s = getOrInitState();
    return Array.from(s.assessments.values()).sort((a, b) =>
      a.updatedAt < b.updatedAt ? 1 : -1,
    );
  },

  getAssessment(id: string) {
    return getOrInitState().assessments.get(id);
  },

  createAssessment(input: CreateAssessmentInput) {
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
  },

  updateAssessmentStatus(id: string, status: AssessmentStatus) {
    const s = getOrInitState();
    const existing = s.assessments.get(id);
    if (!existing) return undefined;
    const next: Assessment = { ...existing, status, updatedAt: nowIso() };
    s.assessments.set(id, next);
    return next;
  },

  getSources(assessmentId: string) {
    return getOrInitState().sources.get(assessmentId) ?? [];
  },

  addSource(assessmentId: string, input: AddSourceInput) {
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
  },

  updateSource(sourceId: string, patch: SourcePatch) {
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
  },

  getFacts(assessmentId: string) {
    return getOrInitState().facts.get(assessmentId) ?? [];
  },

  addFacts(
    assessmentId: string,
    sourceId: string,
    facts: AddFactInput[],
  ) {
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
  },

  getTruthLayers(assessmentId: string) {
    return getOrInitState().truthLayers.get(assessmentId) ?? emptyTruthLayers();
  },

  setTruthLayers(assessmentId: string, layers: TruthLayer[]) {
    getOrInitState().truthLayers.set(assessmentId, layers);
    touch(assessmentId);
  },

  getCockpit(assessmentId: string) {
    return (
      getOrInitState().cockpits.get(assessmentId) ?? {
        metrics: [],
        topRisks: [],
        topOpportunities: [],
      }
    );
  },

  setCockpit(assessmentId: string, cockpit: Cockpit) {
    getOrInitState().cockpits.set(assessmentId, cockpit);
    touch(assessmentId);
  },

  getScenarios(assessmentId: string) {
    return getOrInitState().scenarios.get(assessmentId) ?? [];
  },

  setScenarios(assessmentId: string, scenarios: Scenario[]) {
    getOrInitState().scenarios.set(assessmentId, scenarios);
    touch(assessmentId);
  },

  getRecommendations(assessmentId: string) {
    return getOrInitState().recommendations.get(assessmentId) ?? [];
  },

  setRecommendations(assessmentId: string, recs: Recommendation[]) {
    getOrInitState().recommendations.set(assessmentId, recs);
    touch(assessmentId);
  },

  getPlan(assessmentId: string) {
    return getOrInitState().plans.get(assessmentId) ?? [];
  },

  setPlan(assessmentId: string, plan: ActionPhase[]) {
    getOrInitState().plans.set(assessmentId, plan);
    touch(assessmentId);
  },

  getReport(assessmentId: string): Report | undefined {
    const assessment = getOrInitState().assessments.get(assessmentId);
    if (!assessment) return undefined;
    const sources = getOrInitState().sources.get(assessmentId) ?? [];
    const facts = getOrInitState().facts.get(assessmentId) ?? [];
    const layers =
      getOrInitState().truthLayers.get(assessmentId) ?? emptyTruthLayers();
    const cockpit =
      getOrInitState().cockpits.get(assessmentId) ?? {
        metrics: [],
        topRisks: [],
        topOpportunities: [],
      };
    const scenarios = getOrInitState().scenarios.get(assessmentId) ?? [];
    const recs = getOrInitState().recommendations.get(assessmentId) ?? [];
    const plan = getOrInitState().plans.get(assessmentId) ?? [];
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
  },
};
