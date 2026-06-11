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
  AnalysisState,
  Assessment,
  AssessmentStatus,
  Cockpit,
  ExtractedFact,
  Recommendation,
  Report,
  Scenario,
  Source,
  SourceDocument,
  TruthLayer,
} from "./types";
import type {
  AddAuditEventInput,
  AddFactInput,
  AddSourceInput,
  AddSourceDocumentInput,
  AssessmentRepository,
  CreateAssessmentInput,
  SourcePatch,
} from "./repository";

type StoreState = {
  assessments: Map<string, Assessment>;
  sources: Map<string, Source[]>;
  sourceDocuments: Map<string, SourceDocument[]>;
  facts: Map<string, ExtractedFact[]>;
  truthLayers: Map<string, TruthLayer[]>;
  cockpits: Map<string, Cockpit>;
  scenarios: Map<string, Scenario[]>;
  recommendations: Map<string, Recommendation[]>;
  plans: Map<string, ActionPhase[]>;
  analysisStates: Map<string, AnalysisState>;
  auditEvents: AddAuditEventInput[];
};

declare global {
  var __pulseiqStore: StoreState | undefined;
}

function getOrInitState(): StoreState {
  if (globalThis.__pulseiqStore) return globalThis.__pulseiqStore;
  const state: StoreState = {
    assessments: new Map(),
    sources: new Map(),
    sourceDocuments: new Map(),
    facts: new Map(),
    truthLayers: new Map(),
    cockpits: new Map(),
    scenarios: new Map(),
    recommendations: new Map(),
    plans: new Map(),
    analysisStates: new Map(),
    auditEvents: [],
  };
  state.assessments.set(demoAssessment.id, demoAssessment);
  state.sources.set(
    demoAssessment.id,
    demoSources.map((source) => ({ ...source, origin: "demo" as const })),
  );
  state.facts.set(demoAssessment.id, [...demoFacts]);
  state.truthLayers.set(demoAssessment.id, [...demoTruthLayers]);
  state.cockpits.set(demoAssessment.id, demoCockpit);
  state.scenarios.set(demoAssessment.id, [...demoScenarios]);
  state.recommendations.set(demoAssessment.id, [...demoRecommendations]);
  state.plans.set(demoAssessment.id, [...demoPlan]);
  state.analysisStates.set(demoAssessment.id, {
    status: "analysis_ready",
    provider: "mock",
    model: "deterministic",
    updatedAt: demoAssessment.updatedAt,
  });
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
      title: "Financial Truth",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
    {
      key: "strategic",
      title: "Proposal and Revenue Truth",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
    {
      key: "operational",
      title: "Operational, Vendor, and Capacity Truth",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
    {
      key: "process",
      title: "Compliance and Standards Truth",
      description: "",
      confidence: "low",
      findings: [],
      evidence: [],
      gaps: [],
      contradictions: [],
    },
    {
      key: "collaboration",
      title: "AI Governance and Accountability Truth",
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
  const publicDomainNote = isPublicDomainAssessment(assessment, sources)
    ? " This diagnostic uses public-domain material; assumptions require validation against approved customer evidence."
    : "";
  return `Assessment of ${assessment.companyName} synthesised from ${sources.length} source${sources.length === 1 ? "" : "s"} and ${facts.length} extracted fact${facts.length === 1 ? "" : "s"}. Current operating posture: ${headline}.${publicDomainNote}`;
}

function isPublicDomainAssessment(
  assessment: Assessment,
  sources: Source[],
): boolean {
  return [assessment.companyName, ...sources.flatMap((source) => [source.name, source.notes])]
    .some((value) => /public[\s-]?domain/i.test(value));
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
    s.analysisStates.set(id, {
      status: "not_analyzed",
      updatedAt: now,
    });
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

  deleteAssessment(id: string) {
    if (id === demoAssessment.id) return false;
    const s = getOrInitState();
    if (!s.assessments.has(id)) return false;
    const sources = s.sources.get(id) ?? [];
    const sourceIds = new Set(sources.map((source) => source.id));
    for (const source of sources) {
      s.sourceDocuments.delete(source.id);
    }
    s.auditEvents = s.auditEvents.filter(
      (event) =>
        event.assessmentId !== id &&
        !(event.entityType === "assessment" && event.entityId === id) &&
        !(event.entityType === "source" && sourceIds.has(event.entityId)),
    );
    s.sources.delete(id);
    s.facts.delete(id);
    s.truthLayers.delete(id);
    s.cockpits.delete(id);
    s.scenarios.delete(id);
    s.recommendations.delete(id);
    s.plans.delete(id);
    s.analysisStates.delete(id);
    s.assessments.delete(id);
    return true;
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
      origin: input.fileName ? "uploaded" : "manual",
      fileName: input.fileName,
      mimeType: input.mimeType,
      byteSize: input.byteSize,
      checksumSha256: input.checksumSha256,
      storageProvider: input.storageProvider,
      storageContainer: input.storageContainer,
      storageKey: input.storageKey,
      extractionStatus:
        input.extractionStatus ?? (input.fileName ? "extraction_pending" : "not_applicable"),
      extractedTextPreview: input.extractedTextPreview,
      extractedAt: input.extractedAt,
      extractionError: input.extractionError,
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

  deleteSource(sourceId: string) {
    const s = getOrInitState();
    for (const [assessmentId, list] of s.sources.entries()) {
      const idx = list.findIndex((x) => x.id === sourceId);
      if (idx >= 0) {
        s.sources.set(
          assessmentId,
          list.filter((source) => source.id !== sourceId),
        );
        s.sourceDocuments.delete(sourceId);
        s.facts.set(
          assessmentId,
          (s.facts.get(assessmentId) ?? []).filter(
            (fact) => fact.sourceId !== sourceId,
          ),
        );
        touch(assessmentId);
        return true;
      }
    }
    return false;
  },

  addSourceDocument(sourceId: string, input: AddSourceDocumentInput) {
    const document: SourceDocument = {
      id: `doc-${generateId()}`,
      sourceId,
      createdAt: nowIso(),
      ...input,
    };
    const list = getOrInitState().sourceDocuments.get(sourceId) ?? [];
    getOrInitState().sourceDocuments.set(sourceId, [...list, document]);
    return document;
  },

  getSourceDocuments(sourceId: string) {
    return getOrInitState().sourceDocuments.get(sourceId) ?? [];
  },

  getExtractedDocuments(assessmentId: string) {
    const s = getOrInitState();
    const sources = s.sources.get(assessmentId) ?? [];
    return sources.flatMap((source) => s.sourceDocuments.get(source.id) ?? []);
  },

  getFacts(assessmentId: string) {
    return getOrInitState().facts.get(assessmentId) ?? [];
  },

  saveExtractedFacts(
    assessmentId: string,
    sourceId: string,
    facts: AddFactInput[],
  ) {
    return this.addFacts(assessmentId, sourceId, facts);
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

  getAnalysisState(assessmentId: string) {
    const state = getOrInitState().analysisStates.get(assessmentId);
    if (state) return state;
    const assessment = getOrInitState().assessments.get(assessmentId);
    return analysisStateFromStatus(assessment?.status, assessment?.updatedAt);
  },

  setAnalysisState(assessmentId: string, state: AnalysisState) {
    getOrInitState().analysisStates.set(assessmentId, state);
    touch(assessmentId);
  },

  markAssessmentAnalyzing(id: string) {
    if (getOrInitState().assessments.get(id)?.status === "analyzing") {
      return undefined;
    }
    return this.updateAssessmentStatus(id, "analyzing");
  },

  markAssessmentAnalyzed(id: string) {
    return this.updateAssessmentStatus(id, "analysis_ready");
  },

  markAssessmentAnalysisFailed(id: string) {
    return this.updateAssessmentStatus(id, "analysis_failed");
  },

  addAuditEvent(input: AddAuditEventInput) {
    getOrInitState().auditEvents.push(input);
  },
};

function analysisStateFromStatus(
  status?: AssessmentStatus,
  updatedAt = nowIso(),
): AnalysisState {
  if (status === "analyzing") {
    return {
      status: "analysis_failed",
      error: "The previous analysis was interrupted. You can retry safely.",
      updatedAt,
    };
  }
  if (status === "analysis" || status === "analysis_ready") {
    return { status: "analysis_ready", updatedAt };
  }
  if (status === "analysis_failed") {
    return {
      status: "analysis_failed",
      error: "The previous analysis did not complete.",
      updatedAt,
    };
  }
  return { status: "not_analyzed", updatedAt };
}
