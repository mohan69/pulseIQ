// PulseIQ Workbench — Prisma/PostgreSQL repository.
// This adapter persists the same workbench domain objects exposed by store.ts.

import type {
  Assessment as DbAssessment,
  AssessmentOutput as DbAssessmentOutput,
  BusinessFact as DbBusinessFact,
  DataSource as DbDataSource,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  ActionPhase,
  AnalysisState,
  Assessment,
  AssessmentStatus,
  Cockpit,
  CockpitMetric,
  ConfidenceLevel,
  EvidenceRef,
  ExtractedFact,
  FactKind,
  Recommendation,
  Scenario,
  Source,
  SourceDocument,
  SourceStatus,
  SourceType,
  TopOpportunity,
  TopRisk,
  TruthFinding,
  TruthLayer,
  TruthLayerKey,
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

const DEFAULT_ORGANIZATION_ID = "org-pulseiq-internal";
const DEFAULT_ORGANIZATION_NAME = "PulseIQ Internal";

const OUTPUT_TYPES = {
  truthLayers: "truth_layers",
  cockpit: "cockpit",
  scenarios: "scenarios",
  recommendations: "recommendations",
  plan: "plan",
  analysisState: "analysis_state",
} as const;

async function ensureDefaultOrganization() {
  return prisma.organization.upsert({
    where: { id: DEFAULT_ORGANIZATION_ID },
    update: {},
    create: {
      id: DEFAULT_ORGANIZATION_ID,
      name: DEFAULT_ORGANIZATION_NAME,
    },
  });
}

function toDate(value: string): Date {
  return new Date(value);
}

function mapAssessment(row: DbAssessment): Assessment {
  return {
    id: row.id,
    companyName: row.companyName,
    industry: row.industry as Assessment["industry"],
    objective: row.objective as Assessment["objective"],
    revenueTarget: Number(row.revenueTarget),
    marginTarget: row.marginTarget,
    cashTarget: Number(row.cashTarget),
    headcountProductivityTarget: Number(row.headcountProductivityTarget),
    status: row.status as AssessmentStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapSource(row: DbDataSource): Source {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    name: row.name,
    type: row.type as SourceType,
    status: row.status as SourceStatus,
    confidence: row.confidence as ConfidenceLevel,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    pageCount: row.pageCount ?? undefined,
    origin: row.fileName ? "uploaded" : row.id.startsWith("src-") ? "demo" : "manual",
    fileName: row.fileName ?? undefined,
    mimeType: row.mimeType ?? undefined,
    byteSize: row.byteSize ?? undefined,
    checksumSha256: row.checksumSha256 ?? undefined,
    storageProvider: row.storageProvider ?? row.storageBucket ?? undefined,
    storageContainer: row.storageBucket ?? undefined,
    storageKey: row.storageKey ?? undefined,
    extractionStatus:
      (row.extractionStatus as Source["extractionStatus"] | null) ?? undefined,
    extractedTextPreview: row.extractedTextPreview ?? undefined,
    extractedAt: row.extractedAt?.toISOString(),
    extractionError: row.extractionError ?? undefined,
  };
}

function mapSourceDocument(row: {
  id: string;
  sourceId: string;
  kind: string;
  pageNumber: number | null;
  chunkIndex: number | null;
  content: string | null;
  data: unknown;
  metadata: unknown;
  createdAt: Date;
}): SourceDocument {
  return {
    id: row.id,
    sourceId: row.sourceId,
    kind: row.kind as SourceDocument["kind"],
    pageNumber: row.pageNumber ?? undefined,
    chunkIndex: row.chunkIndex ?? undefined,
    content: row.content ?? undefined,
    data: row.data ?? undefined,
    metadata: row.metadata ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapFact(row: DbBusinessFact): ExtractedFact {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    sourceId: row.sourceId,
    kind: row.kind as FactKind,
    label: row.label,
    value: row.value,
    numericValue: row.numericValue ?? undefined,
    unit: row.unit ?? undefined,
    evidence: row.evidence,
    confidence: row.confidence as ConfidenceLevel,
    capturedAt: row.capturedAt.toISOString(),
  };
}

function outputData<T>(output: DbAssessmentOutput | null): T | undefined {
  if (!output) return undefined;
  if (output.data == null) return undefined;
  return output.data as T;
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

async function getOutput<T>(
  assessmentId: string,
  type: string,
): Promise<T | undefined> {
  const output = await prisma.assessmentOutput.findUnique({
    where: { assessmentId_type: { assessmentId, type } },
  });
  return outputData<T>(output);
}

async function setOutput<T>(
  assessmentId: string,
  type: string,
  data: T,
) {
  await prisma.assessmentOutput.upsert({
    where: { assessmentId_type: { assessmentId, type } },
    update: {
      data: data as object,
      provider: "internal",
    },
    create: {
      assessmentId,
      type,
      provider: "internal",
      data: data as object,
    },
  });
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { updatedAt: new Date() },
  });
}

async function organizationIdForAudit(input: AddAuditEventInput) {
  if (input.assessmentId) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: input.assessmentId },
      select: { organizationId: true },
    });
    return assessment?.organizationId;
  }
  if (input.entityType === "assessment") {
    const assessment = await prisma.assessment.findUnique({
      where: { id: input.entityId },
      select: { organizationId: true },
    });
    return assessment?.organizationId;
  }
  if (input.entityType === "source") {
    const source = await prisma.dataSource.findUnique({
      where: { id: input.entityId },
      select: { assessment: { select: { organizationId: true } } },
    });
    return source?.assessment.organizationId;
  }
  return undefined;
}

function safeCockpit(value: unknown): Cockpit {
  if (!value || typeof value !== "object") return { metrics: [], topRisks: [], topOpportunities: [] };
  const v = value as Record<string, unknown>;
  return {
    metrics: Array.isArray(v.metrics) ? v.metrics.filter((m): m is CockpitMetric =>
      m != null && typeof m === "object" && typeof (m as Record<string, unknown>).status === "string"
    ) : [],
    topRisks: Array.isArray(v.topRisks) ? v.topRisks.filter((r): r is TopRisk =>
      r != null && typeof r === "object"
    ) : [],
    topOpportunities: Array.isArray(v.topOpportunities) ? v.topOpportunities.filter((o): o is TopOpportunity =>
      o != null && typeof o === "object"
    ) : [],
  };
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

const EMPTY_TRUTH_LAYERS_MAP: Record<string, TruthLayerKey> = {
  financial: "financial",
  strategic: "strategic",
  operational: "operational",
  process: "process",
  collaboration: "collaboration",
};

function safeTruthLayers(value: unknown): TruthLayer[] {
  if (!Array.isArray(value)) return emptyTruthLayers();
  return value.map((l, i) => {
    if (!l || typeof l !== "object") return emptyTruthLayers()[i] ?? emptyTruthLayers()[0];
    const v = l as Record<string, unknown>;
    return {
      key: (EMPTY_TRUTH_LAYERS_MAP[v.key as string] as TruthLayerKey) ?? "financial" as TruthLayerKey,
      title: typeof v.title === "string" ? v.title : "",
      description: typeof v.description === "string" ? v.description : "",
      findings: Array.isArray(v.findings) ? v.findings as TruthFinding[] : [],
      evidence: Array.isArray(v.evidence) ? v.evidence as EvidenceRef[] : [],
      confidence: (v.confidence as ConfidenceLevel) ?? "low",
      gaps: Array.isArray(v.gaps) ? v.gaps as string[] : [],
      contradictions: Array.isArray(v.contradictions) ? v.contradictions as string[] : [],
    };
  });
}

export const prismaAssessmentRepository: AssessmentRepository = {
  async listAssessments() {
    const rows = await prisma.assessment.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(mapAssessment);
  },

  async getAssessment(id: string) {
    const row = await prisma.assessment.findUnique({ where: { id } });
    return row ? mapAssessment(row) : undefined;
  },

  async createAssessment(input: CreateAssessmentInput) {
    await ensureDefaultOrganization();
    const row = await prisma.assessment.create({
      data: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        companyName: input.companyName,
        industry: input.industry,
        objective: input.objective,
        revenueTarget: BigInt(input.revenueTarget),
        marginTarget: input.marginTarget,
        cashTarget: BigInt(input.cashTarget),
        headcountProductivityTarget: BigInt(
          input.headcountProductivityTarget,
        ),
        status: "draft",
      },
    });
    await setOutput(row.id, OUTPUT_TYPES.truthLayers, emptyTruthLayers());
    await setOutput(row.id, OUTPUT_TYPES.cockpit, {
      metrics: [],
      topRisks: [],
      topOpportunities: [],
    } satisfies Cockpit);
    await setOutput(row.id, OUTPUT_TYPES.scenarios, [] satisfies Scenario[]);
    await setOutput(
      row.id,
      OUTPUT_TYPES.recommendations,
      [] satisfies Recommendation[],
    );
    await setOutput(row.id, OUTPUT_TYPES.plan, [] satisfies ActionPhase[]);
    await setOutput(row.id, OUTPUT_TYPES.analysisState, {
      status: "not_analyzed",
      updatedAt: row.updatedAt.toISOString(),
    } satisfies AnalysisState);
    return mapAssessment(row);
  },

  async updateAssessmentStatus(id: string, status: AssessmentStatus) {
    try {
      const row = await prisma.assessment.update({
        where: { id },
        data: { status },
      });
      return mapAssessment(row);
    } catch {
      return undefined;
    }
  },

  async deleteAssessment(id: string) {
    try {
      const deleted = await prisma.$transaction(async (tx) => {
        const assessment = await tx.assessment.findUnique({
          where: { id },
          select: { id: true, isDemo: true },
        });
        if (!assessment || assessment.isDemo || id === "asm-bharat-heavy-fabrications") {
          return false;
        }
        const sources = await tx.dataSource.findMany({
          where: { assessmentId: id },
          select: { id: true },
        });
        const sourceIds = sources.map((source) => source.id);
        await tx.auditEvent.deleteMany({
          where: {
            OR: [
              { entityType: "assessment", entityId: id },
              ...(sourceIds.length > 0
                ? [{ entityType: "source", entityId: { in: sourceIds } }]
                : []),
            ],
          },
        });
        await tx.assessmentOutput.deleteMany({ where: { assessmentId: id } });
        await tx.businessFact.deleteMany({ where: { assessmentId: id } });
        await tx.sourceDocument.deleteMany({
          where: { source: { assessmentId: id } },
        });
        await tx.dataSource.deleteMany({ where: { assessmentId: id } });
        await tx.assessment.delete({ where: { id } });
        return true;
      });
      if (!deleted) return false;
      return true;
    } catch {
      return false;
    }
  },

  async getSources(assessmentId: string) {
    const rows = await prisma.dataSource.findMany({
      where: { assessmentId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapSource);
  },

  async addSource(assessmentId: string, input: AddSourceInput) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { id: true },
    });
    if (!assessment) return undefined;
    const row = await prisma.dataSource.create({
      data: {
        assessmentId,
        name: input.name,
        type: input.type,
        status: "registered",
        confidence: "medium",
        notes: input.notes ?? "",
        fileName: input.fileName,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        checksumSha256: input.checksumSha256,
        storageProvider: input.storageProvider,
        storageBucket: input.storageContainer,
        storageKey: input.storageKey,
        extractionStatus:
          input.extractionStatus ??
          (input.fileName ? "extraction_pending" : "not_applicable"),
        extractedTextPreview: input.extractedTextPreview,
        extractedAt: input.extractedAt ? new Date(input.extractedAt) : undefined,
        extractionError: input.extractionError,
      },
    });
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { updatedAt: new Date() },
    });
    return mapSource(row);
  },

  async updateSource(sourceId: string, patch: SourcePatch) {
    try {
      const row = await prisma.dataSource.update({
        where: { id: sourceId },
        data: {
          name: patch.name,
          type: patch.type,
          status: patch.status,
          confidence: patch.confidence,
          notes: patch.notes,
          pageCount: patch.pageCount,
          fileName: patch.fileName,
          mimeType: patch.mimeType,
          byteSize: patch.byteSize,
          checksumSha256: patch.checksumSha256,
          storageProvider: patch.storageProvider,
          storageBucket: patch.storageContainer,
          storageKey: patch.storageKey,
          extractionStatus: patch.extractionStatus,
          extractedTextPreview: patch.extractedTextPreview,
          extractedAt: patch.extractedAt ? new Date(patch.extractedAt) : undefined,
          extractionError: patch.extractionError,
        },
      });
      await prisma.assessment.update({
        where: { id: row.assessmentId },
        data: { updatedAt: new Date() },
      });
      return mapSource(row);
    } catch {
      return undefined;
    }
  },

  async deleteSource(sourceId: string) {
    try {
      const row = await prisma.dataSource.delete({
        where: { id: sourceId },
        select: { assessmentId: true },
      });
      await prisma.assessment.update({
        where: { id: row.assessmentId },
        data: { updatedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  },

  async addSourceDocument(sourceId: string, input: AddSourceDocumentInput) {
    try {
      const row = await prisma.sourceDocument.create({
        data: {
          sourceId,
          kind: input.kind,
          pageNumber: input.pageNumber,
          chunkIndex: input.chunkIndex,
          content: input.content,
          data: input.data as object | undefined,
          metadata: input.metadata as object | undefined,
        },
      });
      return mapSourceDocument(row);
    } catch {
      return undefined;
    }
  },

  async getSourceDocuments(sourceId: string) {
    const rows = await prisma.sourceDocument.findMany({
      where: { sourceId },
      orderBy: [{ chunkIndex: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(mapSourceDocument);
  },

  async getExtractedDocuments(assessmentId: string) {
    const rows = await prisma.sourceDocument.findMany({
      where: { source: { assessmentId } },
      orderBy: [{ sourceId: "asc" }, { chunkIndex: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(mapSourceDocument);
  },

  async getFacts(assessmentId: string) {
    const rows = await prisma.businessFact.findMany({
      where: { assessmentId },
      orderBy: { capturedAt: "desc" },
    });
    return rows.map(mapFact);
  },

  async saveExtractedFacts(
    assessmentId: string,
    sourceId: string,
    facts: AddFactInput[],
  ) {
    return this.addFacts(assessmentId, sourceId, facts);
  },

  async addFacts(
    assessmentId: string,
    sourceId: string,
    facts: AddFactInput[],
  ) {
    const created = await prisma.$transaction(
      facts.map((fact) =>
        prisma.businessFact.create({
          data: {
            assessmentId,
            sourceId,
            kind: fact.kind,
            label: fact.label,
            value: fact.value,
            numericValue: fact.numericValue,
            unit: fact.unit,
            evidence: fact.evidence,
            confidence: fact.confidence,
          },
        }),
      ),
    );
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { updatedAt: new Date() },
    });
    return created.map(mapFact);
  },

  async getTruthLayers(assessmentId: string) {
    return safeTruthLayers(
      await getOutput<TruthLayer[]>(assessmentId, OUTPUT_TYPES.truthLayers),
    );
  },

  async setTruthLayers(assessmentId: string, layers: TruthLayer[]) {
    await setOutput(assessmentId, OUTPUT_TYPES.truthLayers, layers);
  },

  async getCockpit(assessmentId: string) {
    return safeCockpit(
      await getOutput<Cockpit>(assessmentId, OUTPUT_TYPES.cockpit),
    );
  },

  async setCockpit(assessmentId: string, cockpit: Cockpit) {
    await setOutput(assessmentId, OUTPUT_TYPES.cockpit, cockpit);
  },

  async getScenarios(assessmentId: string) {
    return safeArray<Scenario>(
      await getOutput<Scenario[]>(assessmentId, OUTPUT_TYPES.scenarios),
    );
  },

  async setScenarios(assessmentId: string, scenarios: Scenario[]) {
    await setOutput(assessmentId, OUTPUT_TYPES.scenarios, scenarios);
  },

  async getRecommendations(assessmentId: string) {
    return safeArray<Recommendation>(
      await getOutput<Recommendation[]>(
        assessmentId,
        OUTPUT_TYPES.recommendations,
      ),
    );
  },

  async setRecommendations(assessmentId: string, recs: Recommendation[]) {
    await setOutput(assessmentId, OUTPUT_TYPES.recommendations, recs);
  },

  async getPlan(assessmentId: string) {
    return safeArray<ActionPhase>(
      await getOutput<ActionPhase[]>(assessmentId, OUTPUT_TYPES.plan),
    );
  },

  async setPlan(assessmentId: string, plan: ActionPhase[]) {
    await setOutput(assessmentId, OUTPUT_TYPES.plan, plan);
  },

  async getReport(assessmentId: string) {
    const assessment = await this.getAssessment(assessmentId);
    if (!assessment) return undefined;
    const [sources, facts, truthLayers, cockpit, scenarios, recommendations, plan] =
      await Promise.all([
        this.getSources(assessmentId),
        this.getFacts(assessmentId),
        this.getTruthLayers(assessmentId),
        this.getCockpit(assessmentId),
        this.getScenarios(assessmentId),
        this.getRecommendations(assessmentId),
        this.getPlan(assessmentId),
      ]);
    return {
      assessmentId,
      generatedAt: new Date().toISOString(),
      executiveSummary: buildExecutiveSummary(
        assessment,
        sources,
        facts,
        cockpit,
      ),
      sourceCount: sources.length,
      factCount: facts.length,
      truthLayers,
      cockpit,
      scenarios,
      recommendations,
      plan,
      dataGaps: truthLayers.flatMap((l) =>
        l.gaps.map((g) => `[${l.title}] ${g}`),
      ),
    };
  },

  async getAnalysisState(assessmentId: string) {
    const state = await getOutput<AnalysisState>(
      assessmentId,
      OUTPUT_TYPES.analysisState,
    );
    if (state?.status && state.updatedAt) return state;
    const assessment = await this.getAssessment(assessmentId);
    return analysisStateFromAssessment(assessment);
  },

  async setAnalysisState(assessmentId: string, state: AnalysisState) {
    await setOutput(assessmentId, OUTPUT_TYPES.analysisState, state);
  },

  async markAssessmentAnalyzing(id: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.assessment.updateMany({
        where: {
          id,
          OR: [
            { status: { not: "analyzing" } },
            { outputs: { none: { type: OUTPUT_TYPES.analysisState } } },
          ],
        },
        data: { status: "analyzing" },
      });
      if (updated.count === 0) return undefined;
      const now = new Date();
      await tx.assessmentOutput.upsert({
        where: {
          assessmentId_type: {
            assessmentId: id,
            type: OUTPUT_TYPES.analysisState,
          },
        },
        update: {
          data: {
            status: "analyzing",
            updatedAt: now.toISOString(),
          },
          provider: "internal",
        },
        create: {
          assessmentId: id,
          type: OUTPUT_TYPES.analysisState,
          provider: "internal",
          data: {
            status: "analyzing",
            updatedAt: now.toISOString(),
          },
        },
      });
      const row = await tx.assessment.findUnique({ where: { id } });
      return row ? mapAssessment(row) : undefined;
    });
  },

  async markAssessmentAnalyzed(id: string) {
    return this.updateAssessmentStatus(id, "analysis_ready");
  },

  async markAssessmentAnalysisFailed(id: string) {
    return this.updateAssessmentStatus(id, "analysis_failed");
  },

  async addAuditEvent(input: AddAuditEventInput) {
    const organizationId = await organizationIdForAudit(input);
    await prisma.auditEvent.create({
      data: {
        organizationId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata as object | undefined,
      },
    });
  },
};

function analysisStateFromAssessment(
  assessment: Assessment | undefined,
): AnalysisState {
  const updatedAt = assessment?.updatedAt ?? new Date().toISOString();
  if (assessment?.status === "analyzing") {
    return {
      status: "analysis_failed",
      error: "The previous analysis was interrupted. You can retry safely.",
      updatedAt,
    };
  }
  if (
    assessment?.status === "analysis" ||
    assessment?.status === "analysis_ready"
  ) {
    return { status: "analysis_ready", updatedAt };
  }
  if (assessment?.status === "analysis_failed") {
    return {
      status: "analysis_failed",
      error: "The previous analysis did not complete.",
      updatedAt,
    };
  }
  return { status: "not_analyzed", updatedAt };
}

// Exported for testing — mapping functions used by the public repository.
// These are safe to call with mock Prisma row data (no DB required).
export const prismaMapping = {
  mapAssessment,
  mapSource,
  mapFact,
  mapSourceDocument,
  outputData,
  safeCockpit,
  safeArray,
  safeTruthLayers,
};

export const prismaDemoHelpers = {
  DEFAULT_ORGANIZATION_ID,
  DEFAULT_ORGANIZATION_NAME,
  OUTPUT_TYPES,
  toDate,
};
