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
  Assessment,
  AssessmentStatus,
  Cockpit,
  ConfidenceLevel,
  ExtractedFact,
  FactKind,
  Recommendation,
  Scenario,
  Source,
  SourceDocument,
  SourceStatus,
  SourceType,
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

const DEFAULT_ORGANIZATION_ID = "org-pulseiq-internal";
const DEFAULT_ORGANIZATION_NAME = "PulseIQ Internal";

const OUTPUT_TYPES = {
  truthLayers: "truth_layers",
  cockpit: "cockpit",
  scenarios: "scenarios",
  recommendations: "recommendations",
  plan: "plan",
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
  return (output.data ?? undefined) as T | undefined;
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
      await prisma.assessment.delete({ where: { id } });
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
    return (
      (await getOutput<TruthLayer[]>(
        assessmentId,
        OUTPUT_TYPES.truthLayers,
      )) ?? emptyTruthLayers()
    );
  },

  async setTruthLayers(assessmentId: string, layers: TruthLayer[]) {
    await setOutput(assessmentId, OUTPUT_TYPES.truthLayers, layers);
  },

  async getCockpit(assessmentId: string) {
    return (
      (await getOutput<Cockpit>(assessmentId, OUTPUT_TYPES.cockpit)) ?? {
        metrics: [],
        topRisks: [],
        topOpportunities: [],
      }
    );
  },

  async setCockpit(assessmentId: string, cockpit: Cockpit) {
    await setOutput(assessmentId, OUTPUT_TYPES.cockpit, cockpit);
  },

  async getScenarios(assessmentId: string) {
    return (
      (await getOutput<Scenario[]>(assessmentId, OUTPUT_TYPES.scenarios)) ?? []
    );
  },

  async setScenarios(assessmentId: string, scenarios: Scenario[]) {
    await setOutput(assessmentId, OUTPUT_TYPES.scenarios, scenarios);
  },

  async getRecommendations(assessmentId: string) {
    return (
      (await getOutput<Recommendation[]>(
        assessmentId,
        OUTPUT_TYPES.recommendations,
      )) ?? []
    );
  },

  async setRecommendations(assessmentId: string, recs: Recommendation[]) {
    await setOutput(assessmentId, OUTPUT_TYPES.recommendations, recs);
  },

  async getPlan(assessmentId: string) {
    return (await getOutput<ActionPhase[]>(assessmentId, OUTPUT_TYPES.plan)) ?? [];
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

  async markAssessmentAnalyzing(id: string) {
    return this.updateAssessmentStatus(id, "analyzing");
  },

  async markAssessmentAnalyzed(id: string) {
    return this.updateAssessmentStatus(id, "analysis");
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

// Exported for testing — mapping functions used by the public repository.
// These are safe to call with mock Prisma row data (no DB required).
export const prismaMapping = {
  mapAssessment,
  mapSource,
  mapFact,
  mapSourceDocument,
  outputData,
};

export const prismaDemoHelpers = {
  DEFAULT_ORGANIZATION_ID,
  DEFAULT_ORGANIZATION_NAME,
  OUTPUT_TYPES,
  toDate,
};
