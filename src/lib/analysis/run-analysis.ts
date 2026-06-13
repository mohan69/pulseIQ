import {
  cockDraftToCockpit,
  createAIEngine,
  planDraftToPhases,
  recDraftsToRecs,
  scenarioDraftsToScenarios,
  truthDraftsToLayers,
  AIProviderError,
  type AIEngine,
  type AIContext,
} from "@/lib/ai";
import {
  addAuditEvent,
  getAssessment,
  getFacts,
  getReport,
  getSources,
  getSourceDocuments,
  markAssessmentAnalyzed,
  markAssessmentAnalysisFailed,
  markAssessmentAnalyzing,
  saveExtractedFacts,
  setAnalysisState,
  setCockpit,
  setPlan,
  setRecommendations,
  setScenarios,
  setTruthLayers,
} from "@/lib/assessment/store";
import type {
  ActionPhase,
  Assessment,
  Cockpit,
  CockpitMetric,
  ExtractedFact,
  FactKind,
  Recommendation,
  Scenario,
  Source,
  TruthLayer,
} from "@/lib/assessment/types";
import type { AddFactInput } from "@/lib/assessment/repository";
import { isPublicDomainAssessment } from "@/lib/assessment/presentation";
import { buildFacts } from "@/lib/extraction/facts";
import { getAssessmentReadiness } from "@/lib/readiness";
import { buildReport } from "@/lib/report/build";
import { buildTruthLayers } from "@/lib/truth-map/build";

const DEMO_ASSESSMENT_ID = "asm-bharat-heavy-fabrications";
export const FALLBACK_ANALYSIS_LABEL =
  "Analysis generated from fallback deterministic engine; requires human review.";

export type AnalysisResult = {
  ok: boolean;
  assessmentId: string;
  provider: string;
  factsAdded: number;
  sourcesAnalyzed: number;
  message: string;
};

type AnalysisOptions = {
  engine?: AIEngine;
  allowDeterministicFallback?: boolean;
};

type SourceCorpus = {
  source: Source;
  text: string;
};

type AnalysisTelemetry = {
  fallbackUsed: boolean;
  fallbackStages: string[];
};

type AnalysisErrorCode =
  | "no_parsed_source_text"
  | "model_call_failed"
  | "model_output_invalid"
  | "save_failed"
  | "timeout"
  | "unknown_server_error";

export async function runAssessmentAnalysis(
  assessmentId: string,
  options: AnalysisOptions = {},
): Promise<AnalysisResult> {
  const engine = options.engine ?? createAIEngine();
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error("Assessment not found.");
  }

  analysisLog("analysis_started", {
    assessmentId,
    provider: engine.provider,
    model: engine.model,
  });

  if (assessment.id === DEMO_ASSESSMENT_ID) {
    await safeAuditEvent({
      action: "analysis_run_demo_skipped",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: { provider: engine.provider, model: engine.model },
    });
    return {
      ok: true,
      assessmentId,
      provider: engine.provider,
      factsAdded: 0,
      sourcesAnalyzed: 0,
      message: "Demo assessment uses golden deterministic outputs.",
    };
  }

  try {
    const analyzing = await markAssessmentAnalyzing(assessmentId);
    if (!analyzing) {
      analysisLog("analysis_already_running", {
        assessmentId,
        provider: engine.provider,
        model: engine.model,
      });
      return {
        ok: false,
        assessmentId,
        provider: engine.provider,
        factsAdded: 0,
        sourcesAnalyzed: 0,
        message:
          "Analysis is already running. Refresh the page before retrying.",
      };
    }
    await setAnalysisState(assessmentId, {
      status: "analyzing",
      provider: engine.provider,
      model: engine.model,
      updatedAt: new Date().toISOString(),
    });
    await safeAuditEvent({
      action: "analysis_run",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: { provider: engine.provider, model: engine.model },
    });

    const sources = await getSources(assessmentId);
    const existingFacts = await getFacts(assessmentId);
    const corpusResult = await loadAnalyzableCorpus(sources);
    const corpus = corpusResult.rows;
    analysisLog("source_loading_completed", {
      assessmentId,
      registeredSourceCount: sources.length,
      parsedSourceCount: corpus.length,
      parsedDocumentCount: corpusResult.documentCount,
      extractedTextCharacterCount: corpusResult.textCharacterCount,
      notesOnlySourceCount: corpusResult.notesOnlySourceCount,
      existingFactCount: existingFacts.length,
    });
    if (corpus.length === 0) {
      throw new AnalysisInputError(
        "no_parsed_source_text",
        "No parsed source text. Upload and parse at least one source before analysis.",
      );
    }

    const ctxBase: AIContext = {
      assessmentId,
      companyName: assessment.companyName,
      industry: assessment.industry,
      objective: assessment.objective,
      sources,
      facts: existingFacts,
    };

    let currentFacts = [...existingFacts];
    let factsAdded = 0;
    const telemetry: AnalysisTelemetry = {
      fallbackUsed: false,
      fallbackStages: [],
    };
    const allowFallback =
      options.allowDeterministicFallback ??
      deterministicFallbackAllowed(engine.provider);
    const publicDomain = isPublicDomainAssessment(assessment);
    const confirmedFinancials = hasConfirmedFinancialSource(sources);

    const extractedBySource = await Promise.all(
      corpus.map(async (item) => {
        const aiDrafts = await withProviderFallback(
          "extract_business_facts",
          assessmentId,
          engine,
          allowFallback,
          telemetry,
          () =>
            engine.extractBusinessFacts(
              { ...ctxBase, facts: existingFacts },
              item.source,
              item.text,
            ),
          { facts: [] },
        );
        const deterministicDrafts = deterministicFactsFromText(
          assessment,
          item.source,
          item.text,
        );
        const drafts =
          publicDomain
            ? deterministicDrafts
            : aiDrafts.facts.length > 0
              ? buildFacts(item.source, aiDrafts.facts)
              : deterministicDrafts;
        return { item, drafts };
      }),
    );

    for (const { item, drafts } of extractedBySource) {
      const fresh = dedupeFactDrafts(drafts, currentFacts, item.source.id);
      if (fresh.length === 0) continue;
      const created = await saveStage("fact_generation", assessmentId, () =>
        saveExtractedFacts(assessmentId, item.source.id, fresh),
      );
      factsAdded += created.length;
      currentFacts = [...created, ...currentFacts];
    }
    analysisLog("fact_generation_completed", {
      assessmentId,
      factsAdded,
      totalFactCount: currentFacts.length,
      sourcesAnalyzed: corpus.length,
    });

    const ctx: AIContext = { ...ctxBase, facts: currentFacts };
    const usePublicDomainEngine = publicDomain && !confirmedFinancials;
    const [
      truthDraft,
      cockpitDraft,
      scenariosDraft,
      recommendationsDraft,
      planDraft,
      reportSnapshot,
    ] = usePublicDomainEngine
      ? [
          { layers: [] },
          { metrics: [], topRisks: [], topOpportunities: [] },
          { scenarios: [] },
          { recommendations: [] },
          { phases: [] },
          {
            executiveSummary: `${assessment.companyName} public-domain diagnostic requires internal validation.`,
            dataGaps: publicDomainInternalDataRequests(),
            confidence: "low" as const,
          },
        ]
      : await Promise.all([
          withProviderFallback(
            "truth_map_generation",
            assessmentId,
            engine,
            allowFallback,
            telemetry,
            () => engine.generateTruthMap(ctx),
            { layers: [] },
          ),
          withProviderFallback(
            "cockpit_generation",
            assessmentId,
            engine,
            allowFallback,
            telemetry,
            () => engine.generateCockpitMetrics(ctx),
            { metrics: [], topRisks: [], topOpportunities: [] },
          ),
          withProviderFallback(
            "scenario_generation",
            assessmentId,
            engine,
            allowFallback,
            telemetry,
            () => engine.generateWhatIfScenarios(ctx),
            { scenarios: [] },
          ),
          withProviderFallback(
            "recommendation_generation",
            assessmentId,
            engine,
            allowFallback,
            telemetry,
            () => engine.generateRecommendations(ctx),
            { recommendations: [] },
          ),
          withProviderFallback(
            "plan_generation",
            assessmentId,
            engine,
            allowFallback,
            telemetry,
            () => engine.buildPlan(ctx),
            { phases: [] },
          ),
          withProviderFallback(
            "report_generation",
            assessmentId,
            engine,
            allowFallback,
            telemetry,
            () => engine.generateReportSnapshot(ctx),
            {
              executiveSummary: `Assessment of ${assessment.companyName} is ready for review.`,
              dataGaps: [],
              confidence: "medium" as const,
            },
          ),
        ]);

    const truthLayersBase =
      usePublicDomainEngine
        ? deterministicPublicDomainTruthLayers(currentFacts, sources)
        : truthDraft.layers.length === 5
        ? truthDraftsToLayers(truthDraft.layers)
        : buildTruthLayers(currentFacts, sources);
    const truthLayers = telemetry.fallbackUsed
      ? truthLayersBase.map((layer) => ({
          ...layer,
          description: `${FALLBACK_ANALYSIS_LABEL} ${layer.description}`,
        }))
      : truthLayersBase;

    const cockpit =
      usePublicDomainEngine
        ? deterministicPublicDomainCockpit()
        : cockpitDraft.metrics.length > 0
        ? cockDraftToCockpit(cockpitDraft)
        : deterministicCockpit(assessment, currentFacts);

    const scenarios =
      usePublicDomainEngine
        ? deterministicPublicDomainScenarios()
        : scenariosDraft.scenarios.length === 5
        ? scenarioDraftsToScenarios(scenariosDraft.scenarios)
        : deterministicScenarios(assessment, currentFacts);

    const recommendations =
      usePublicDomainEngine
        ? deterministicPublicDomainRecommendations()
        : recommendationsDraft.recommendations.length > 0
        ? recDraftsToRecs(recommendationsDraft.recommendations)
        : deterministicRecommendations(assessment, currentFacts, cockpit);

    const planBase =
      planDraft.phases.length > 0
        ? planDraftToPhases(planDraft)
        : deterministicPlan(recommendations);
    const plan = usePublicDomainEngine
      ? planBase.map((phase) => ({
          ...phase,
          description: `Public-domain diagnostic; ${phase.description} All conclusions require internal validation.`,
        }))
      : planBase;

    logGeneratedOutputs(assessmentId, {
      truthLayers,
      cockpit,
      scenarios,
      recommendations,
      plan,
    });
    await saveStage("database_save", assessmentId, () =>
      Promise.all([
        setTruthLayers(assessmentId, truthLayers),
        setCockpit(assessmentId, cockpit),
        setScenarios(assessmentId, scenarios),
        setRecommendations(assessmentId, recommendations),
        setPlan(assessmentId, plan),
      ]),
    );
    analysisLog("database_save_completed", {
      assessmentId,
      outputCount: 5,
      outputTypes: [
        "truth_layers",
        "cockpit",
        "scenarios",
        "recommendations",
        "plan",
      ],
    });

    void reportSnapshot;
    buildReport({
      assessment,
      sources,
      facts: currentFacts,
      truthLayers,
      cockpit,
      scenarios,
      recommendations,
      plan,
    });
    await getReport(assessmentId);
    analysisLog("report_generation_completed", {
      assessmentId,
      confidence: reportSnapshot.confidence,
      dataGapCount: reportSnapshot.dataGaps.length,
    });
    const readiness = getAssessmentReadiness(assessment, sources);
    analysisLog("readiness_profile_generation_completed", {
      assessmentId,
      standardsReadinessScore: readiness.cockpit.standardsReadinessScore,
      customerQualificationReadiness:
        readiness.cockpit.customerQualificationReadiness,
      supplierQualificationHealth:
        readiness.cockpit.supplierQualificationHealth,
    });
    await safeAuditEvent({
      action: "report_generated",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: {
        provider: engine.provider,
        model: engine.model,
        factCount: currentFacts.length,
        sourceCount: sources.length,
      },
    });

    await markAssessmentAnalyzed(assessmentId);
    await setAnalysisState(assessmentId, {
      status: "analysis_ready",
      provider: engine.provider,
      model: engine.model,
      updatedAt: new Date().toISOString(),
    });
    await safeAuditEvent({
      action: "analysis_completed",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: {
        provider: engine.provider,
        model: engine.model,
        factsAdded,
        sourcesAnalyzed: corpus.length,
        fallbackUsed: telemetry.fallbackUsed,
        fallbackStages: telemetry.fallbackStages,
      },
    });
    analysisLog("analysis_finished", {
      assessmentId,
      finalStatus: "analysis_ready",
      provider: engine.provider,
      model: engine.model,
      fallbackUsed: telemetry.fallbackUsed,
      fallbackStages: telemetry.fallbackStages,
    });
    return {
      ok: true,
      assessmentId,
      provider: engine.provider,
      factsAdded,
      sourcesAnalyzed: corpus.length,
      message: telemetry.fallbackUsed
        ? FALLBACK_ANALYSIS_LABEL
        : "Analysis ready.",
    };
  } catch (error) {
    const failure = classifyAnalysisError(error);
    const safeMessage = failure.message;
    await Promise.allSettled([
      markAssessmentAnalysisFailed(assessmentId),
      setAnalysisState(assessmentId, {
        status: "analysis_failed",
        error: safeMessage,
        provider: engine.provider,
        model: engine.model,
        updatedAt: new Date().toISOString(),
      }),
    ]);
    await safeAuditEvent({
      action: "analysis_failed",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: {
        provider: engine.provider,
        model: engine.model,
        error: safeMessage,
        errorCode: failure.code,
      },
    });
    analysisLog("analysis_failed", {
      assessmentId,
      provider: engine.provider,
      model: engine.model,
      finalStatus: "analysis_failed",
      error: safeMessage,
      errorCode: failure.code,
      detail: errorDetail(error),
    });
    return {
      ok: false,
      assessmentId,
      provider: engine.provider,
      factsAdded: 0,
      sourcesAnalyzed: 0,
      message: safeMessage,
    };
  }
}

async function loadAnalyzableCorpus(sources: Source[]): Promise<{
  rows: SourceCorpus[];
  documentCount: number;
  textCharacterCount: number;
  notesOnlySourceCount: number;
}> {
  const rows: SourceCorpus[] = [];
  let documentCount = 0;
  let textCharacterCount = 0;
  let notesOnlySourceCount = 0;
  for (const source of sources) {
    const documents = await getSourceDocuments(source.id);
    documentCount += documents.length;
    const extractedText = documents
      .map((doc) => doc.content)
      .filter((content): content is string => Boolean(content?.trim()))
      .join("\n\n");
    const text = extractedText.trim();
    if (!text && source.notes.trim()) notesOnlySourceCount += 1;
    if (!text) continue;
    textCharacterCount += text.length;
    rows.push({ source, text });
  }
  return {
    rows,
    documentCount,
    textCharacterCount,
    notesOnlySourceCount,
  };
}

class AnalysisInputError extends Error {
  constructor(
    readonly code: AnalysisErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AnalysisInputError";
  }
}

class AnalysisSaveError extends Error {
  constructor(
    readonly stage: string,
    cause: unknown,
  ) {
    super(`Save failed during ${stage}.`);
    this.name = "AnalysisSaveError";
    this.cause = cause;
  }
}

function deterministicFallbackAllowed(provider: string): boolean {
  if (provider === "mock") return true;
  if (process.env.PULSEIQ_ALLOW_AI_FALLBACK === "false") return false;
  return true;
}

async function withProviderFallback<T>(
  stage: string,
  assessmentId: string,
  engine: AIEngine,
  allowFallback: boolean,
  telemetry: AnalysisTelemetry,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  const startedAt = Date.now();
  analysisLog("model_request_started", {
    assessmentId,
    provider: engine.provider,
    model: engine.model,
    stage,
  });
  try {
    const result = await run();
    analysisLog("model_request_completed", {
      assessmentId,
      provider: engine.provider,
      model: engine.model,
      stage,
      durationMs: Date.now() - startedAt,
      responseStatus: "success",
      jsonParseStatus: "success",
    });
    return result;
  } catch (error) {
    const failure = classifyAnalysisError(error);
    analysisLog("model_request_failed", {
      assessmentId,
      provider: engine.provider,
      model: engine.model,
      stage,
      durationMs: Date.now() - startedAt,
      responseStatus: "failed",
      jsonParseStatus:
        failure.code === "model_output_invalid" ? "failed" : "not_available",
      errorCode: failure.code,
      error: failure.message,
      detail: errorDetail(error),
    });
    if (!allowFallback || engine.provider === "mock") throw error;
    telemetry.fallbackUsed = true;
    telemetry.fallbackStages.push(stage);
    analysisLog("provider_fallback", {
      assessmentId,
      provider: engine.provider,
      model: engine.model,
      stage,
      errorCode: failure.code,
      error: failure.message,
    });
    return fallback;
  }
}

async function saveStage<T>(
  stage: string,
  assessmentId: string,
  save: () => Promise<T>,
): Promise<T> {
  analysisLog("database_save_started", { assessmentId, stage });
  try {
    return await save();
  } catch (error) {
    analysisLog("database_save_failed", {
      assessmentId,
      stage,
      detail: errorDetail(error),
    });
    throw new AnalysisSaveError(stage, error);
  }
}

async function safeAuditEvent(
  input: Parameters<typeof addAuditEvent>[0],
): Promise<void> {
  try {
    await addAuditEvent(input);
  } catch (error) {
    analysisLog("audit_write_failed", {
      assessmentId: input.assessmentId,
      action: input.action,
      error:
        error instanceof Error
          ? error.message.slice(0, 240)
          : "Unknown audit error",
    });
  }
}

function classifyAnalysisError(error: unknown): {
  code: AnalysisErrorCode;
  message: string;
} {
  if (error instanceof AnalysisInputError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof AnalysisSaveError) {
    return { code: "save_failed", message: "Save failed. Retry analysis." };
  }
  if (error instanceof AIProviderError) {
    const value = error.message.toLowerCase();
    if (value.includes("timed out")) {
      return { code: "timeout", message: "Timeout. The model request timed out." };
    }
    if (
      value.includes("invalid json") ||
      value.includes("required schema") ||
      value.includes("match required schema")
    ) {
      return {
        code: "model_output_invalid",
        message: "Model output invalid. A deterministic fallback could not be completed.",
      };
    }
    return {
      code: "model_call_failed",
      message: "Model call failed. A deterministic fallback could not be completed.",
    };
  }
  return {
    code: "unknown_server_error",
    message: "Unknown server error. Check server logs and retry.",
  };
}

function errorDetail(error: unknown): string {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error ? ` Cause: ${error.cause.message}` : "";
    return `${error.name}: ${error.message}${cause}`.slice(0, 500);
  }
  return "Unknown non-Error exception";
}

function analysisLog(
  event: string,
  details: Record<string, unknown>,
): void {
  console.info(`[PulseIQ Analysis] ${event}`, details);
}

function dedupeFactDrafts(
  drafts: AddFactInput[],
  existingFacts: ExtractedFact[],
  sourceId: string,
): AddFactInput[] {
  const existing = new Set(
    existingFacts.map((fact) =>
      [fact.sourceId, fact.kind, fact.label, fact.value, fact.evidence].join("|"),
    ),
  );
  return drafts.filter((draft) => {
    const key = [
      sourceId,
      draft.kind,
      draft.label,
      draft.value,
      draft.evidence,
    ].join("|");
    if (existing.has(key)) return false;
    existing.add(key);
    return true;
  });
}

function deterministicFactsFromText(
  assessment: Assessment,
  source: Source,
  text: string,
): AddFactInput[] {
  if (isPublicDomainAssessment(assessment)) {
    return deterministicPublicDomainFacts(source, text);
  }
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 4)
    .slice(0, 80);
  const facts: AddFactInput[] = [];
  for (const line of lines) {
    const kind = inferFactKind(line, source);
    if (!kind) continue;
    const amount = parseNumericValue(line);
    facts.push({
      kind,
      label: labelFromLine(line, kind),
      value: valueFromLine(line),
      numericValue: amount.numericValue,
      unit: amount.unit,
      evidence: line.slice(0, 240),
      confidence: amount.numericValue === undefined ? "medium" : "high",
    });
    if (facts.length >= 20) break;
  }
  if (facts.length === 0 && source.notes.trim()) {
    facts.push({
      kind: "opportunity",
      label: `${source.name} observation`,
      value: source.notes.trim().slice(0, 140),
      evidence: source.notes.trim().slice(0, 240),
      confidence: "low",
    });
  }
  if (facts.length === 0) {
    facts.push({
      kind: "target",
      label: `${assessment.companyName} analysis input`,
      value: `Source ${source.name} supplied for ${assessment.objective.replace(/_/g, " ")}`,
      evidence: text.slice(0, 240),
      confidence: "low",
    });
  }
  return facts;
}

function deterministicPublicDomainFacts(
  source: Source,
  text: string,
): AddFactInput[] {
  const evidence = (pattern: RegExp, fallback: string) =>
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => pattern.test(line))
      ?.slice(0, 240) ?? fallback;
  return [
    {
      kind: "product",
      label: "Company and capability context",
      value:
        "Public sources provide directional company, product, market, and manufacturing-capability context.",
      evidence: evidence(
        /public positioning|public capability|manufactur|product/i,
        source.notes || source.name,
      ),
      confidence: "low",
    },
    {
      kind: "sop_rule",
      label: "Standards and certification evidence readiness",
      value:
        "Public standards or certification signals require indexed certificates, validity dates, scope, and human review.",
      evidence: evidence(
        /standards|certification|iso|asme/i,
        source.notes || source.name,
      ),
      confidence: "low",
    },
    {
      kind: "risk",
      label: "Customer qualification evidence gap",
      value:
        "Customer qualification, vendor registration, approvals, and past-performance evidence are not confirmed from public sources.",
      evidence: evidence(
        /customer qualification|vendor-qualification|customer/i,
        source.notes || source.name,
      ),
      confidence: "low",
    },
    {
      kind: "supplier",
      label: "Supplier and manufacturing readiness gap",
      value:
        "Supplier qualification, subcontractor controls, capacity, machine loading, bottlenecks, and quality evidence require internal validation.",
      evidence: evidence(
        /supplier|subcontractor|capacity|machine|manufacturing/i,
        source.notes || source.name,
      ),
      confidence: "low",
    },
    {
      kind: "risk",
      label: "No confirmed financial baseline",
      value:
        "Revenue actual requires internal validation; margin, working capital, and RPE require internal data.",
      evidence: evidence(
        /financial boundary|no reliable audited|internal validation/i,
        "No confirmed public financial baseline was supplied.",
      ),
      confidence: "low",
    },
    {
      kind: "action_item",
      label: "Internal data request",
      value: publicDomainInternalDataRequests().join("; "),
      evidence: evidence(
        /internal data required/i,
        "Approved internal evidence is required for a validated diagnostic.",
      ),
      confidence: "low",
    },
  ];
}

function hasConfirmedFinancialSource(sources: Source[]): boolean {
  return sources.some(
    (source) =>
      (source.type === "financial_filing" ||
        source.type === "erp_export") &&
      source.status === "parsed" &&
      !`${source.name} ${source.notes}`.toLowerCase().includes("public-domain"),
  );
}

function publicDomainInternalDataRequests(): string[] {
  return [
    "Approved revenue and margin statements",
    "Order book, enquiries, RFQ/proposal register, and win/loss data",
    "AR, AP, inventory, and working-capital summary",
    "Confirmed headcount and productivity data",
    "Customer qualification and past-performance evidence",
    "Current standards certificates with scope and validity dates",
    "Supplier, subcontractor, capacity, bottleneck, and quality evidence",
  ];
}

function deterministicPublicDomainTruthLayers(
  facts: ExtractedFact[],
  sources: Source[],
): TruthLayer[] {
  const factByLabel = new Map(facts.map((fact) => [fact.label, fact]));
  const layer = (
    key: TruthLayer["key"],
    title: string,
    description: string,
    labels: string[],
    gaps: string[],
  ): TruthLayer => {
    const selected = labels
      .map((label) => factByLabel.get(label))
      .filter((fact): fact is ExtractedFact => Boolean(fact));
    return {
      key,
      title,
      description,
      findings: selected.map((fact, index) => ({
        id: `fnd-${key}-${index + 1}`,
        text: `${fact.label} — ${fact.value}`,
        impact: fact.kind === "risk" ? "high" : "medium",
        factIds: [fact.id],
      })),
      evidence: selected.map((fact) => ({
        sourceId: fact.sourceId,
        factId: fact.id,
        excerpt: fact.evidence,
      })),
      confidence: "low",
      gaps,
      contradictions: [],
    };
  };
  return [
    layer(
      "financial",
      "Financial Truth",
      "Public-domain evidence does not provide a confirmed financial baseline. Financial confidence is low.",
      ["No confirmed financial baseline"],
      [
        "Revenue actual requires internal validation.",
        "Margin actual requires internal data.",
        "Working capital requires internal data.",
        "Revenue per employee requires internal data.",
      ],
    ),
    layer(
      "strategic",
      "Proposal and Revenue Truth",
      "Public-domain sources support company context only; customer qualification and commercial performance require approved internal evidence.",
      ["Company and capability context", "Customer qualification evidence gap"],
      [
        "Order book, RFQ/proposal register, win/loss, cycle-time, and customer qualification evidence required.",
      ],
    ),
    layer(
      "operational",
      "Operational, Vendor, and Capacity Truth",
      "Public-domain manufacturing and supplier capability signals are directional and do not establish readiness or approval.",
      ["Supplier and manufacturing readiness gap"],
      [
        "Supplier qualification, subcontractor controls, capacity, bottleneck, and quality evidence required.",
      ],
    ),
    layer(
      "process",
      "Compliance and Standards Truth",
      "Public-domain standards and certification references are evidence-readiness signals only, not certification or compliance determinations.",
      ["Standards and certification evidence readiness"],
      [
        "Index certificate documents, scope, validity dates, statutory evidence, and human review.",
      ],
    ),
    layer(
      "collaboration",
      "AI Governance and Accountability Truth",
      `Public-domain diagnostic uses ${sources.length} registered source${sources.length === 1 ? "" : "s"} and requires source-linked human review before management action.`,
      ["Internal data request"],
      [
        "Record source, model, output review, confidence, and approval history.",
      ],
    ),
  ];
}

function deterministicPublicDomainCockpit(): Cockpit {
  const metrics: CockpitMetric[] = [
    validationMetric(
      "revenue",
      "Revenue actual",
      "Public-domain evidence only. Requires internal validation; no confirmed revenue baseline is available.",
      "₹",
    ),
    validationMetric(
      "margin",
      "Margin actual",
      "Public-domain evidence only. Requires internal data; no confirmed margin baseline is available.",
      "%",
    ),
    validationMetric(
      "cash",
      "Working capital",
      "Public-domain evidence only. Requires internal data for AR, AP, inventory, and backlog.",
      "₹",
    ),
    validationMetric(
      "rpe",
      "Revenue per employee",
      "Public-domain evidence only. RPE requires internal revenue and headcount data.",
      "₹/employee",
    ),
  ];
  return {
    metrics,
    topRisks: [
      {
        id: "risk-financial-baseline",
        title: "No confirmed financial baseline",
        description:
          "Public sources do not support revenue, margin, working-capital, or RPE conclusions.",
        likelihood: "high",
        impact: "high",
      },
      {
        id: "risk-qualification-evidence",
        title: "Customer qualification evidence gap",
        description:
          "Customer approval, qualification, and past-performance evidence require internal validation.",
        likelihood: "high",
        impact: "medium",
      },
      {
        id: "risk-supplier-readiness",
        title: "Supplier and manufacturing readiness gap",
        description:
          "Qualification, capacity, bottleneck, and quality evidence are not confirmed.",
        likelihood: "medium",
        impact: "medium",
      },
    ],
    topOpportunities: [
      {
        id: "opp-internal-diagnostic",
        title: "Run a validated internal diagnostic",
        description:
          "Replace public assumptions with approved read-only financial, commercial, qualification, supplier, and operating evidence.",
        impactInr: 0,
        timeframeDays: 2,
      },
    ],
  };
}

function validationMetric(
  key: string,
  label: string,
  note: string,
  unit: CockpitMetric["unit"],
): CockpitMetric {
  return {
    key,
    label,
    value: 0,
    target: 0,
    unit,
    status: "at_risk",
    note,
  };
}

function deterministicPublicDomainScenarios(): Scenario[] {
  const gap = "Requires approved internal data before quantification.";
  return [
    publicDomainScenario(
      "revenue_plus_10",
      "Revenue growth evidence case",
      "Validate revenue, order book, pipeline, and customer concentration before setting a growth case.",
      "No confirmed revenue baseline",
      "Validated revenue and commercial baseline",
      ["Revenue, order book, and pipeline reconciliation"],
      gap,
    ),
    publicDomainScenario(
      "margin_plus_10",
      "Margin improvement evidence case",
      "Validate product-family, customer, price, cost, and quality data before setting margin actions.",
      "No confirmed margin baseline",
      "Validated margin bridge and action range",
      ["Product and customer profitability view", "Supplier and rework evidence"],
      gap,
    ),
    publicDomainScenario(
      "cost_minus_10",
      "Proposal and operating cycle-time case",
      "Measure RFQ, quotation, approval, manufacturing, and inspection cycle times before committing to reductions.",
      "No confirmed cycle-time baseline",
      "Validated bottleneck and cycle-time improvement plan",
      ["RFQ/proposal register", "Capacity and bottleneck evidence"],
      gap,
    ),
    publicDomainScenario(
      "headcount_minus_15",
      "Productivity improvement without assumed workforce action",
      "Establish workflow output, capacity, revenue, and headcount baselines before assessing productivity.",
      "No confirmed RPE baseline",
      "Validated productivity baseline",
      ["Confirmed headcount", "Workflow and output measures"],
      gap,
    ),
    publicDomainScenario(
      "cash_improvement",
      "Working-capital visibility case",
      "Build AR, AP, inventory, billing milestone, and backlog visibility before setting cash actions.",
      "No confirmed working-capital baseline",
      "Validated working-capital cockpit",
      ["AR/AP ageing", "Inventory and backlog linkage"],
      gap,
    ),
  ];
}

function publicDomainScenario(
  key: Scenario["key"],
  label: string,
  description: string,
  currentBaseline: string,
  target: string,
  options: string[],
  expectedImpact: string,
): Scenario {
  return {
    key,
    label,
    description,
    currentBaseline,
    target,
    options,
    pros: ["Creates an evidence-based management discussion"],
    shortfalls: ["Public-domain evidence is insufficient for quantified conclusions"],
    expectedImpact,
    risks: ["Unsupported assumptions could distort management decisions"],
    recommendation: "Validate the internal baseline before approving action.",
    confidence: "low",
  };
}

function deterministicPublicDomainRecommendations(): Recommendation[] {
  const rows = [
    ["Validate the internal financial baseline", "Finance leadership", 7],
    ["Build the order book and RFQ/proposal register", "Commercial operations", 14],
    ["Build the customer qualification evidence pack", "Commercial and quality leadership", 21],
    ["Index standards certificates and validity evidence", "Quality and compliance leadership", 14],
    ["Build supplier and subcontractor qualification tracking", "Procurement and quality leadership", 30],
    ["Map manufacturing capacity, bottlenecks, and quality loss", "Operations leadership", 21],
    ["Create the working-capital evidence cockpit", "Finance and operations", 14],
    ["Confirm headcount and workflow productivity baselines", "Operations and people leadership", 21],
    ["Implement source-linked AI output review", "Technology and risk leadership", 14],
    ["Run the 48-hour validated diagnostic", "Assessment sponsor", 2],
  ] as const;
  return rows.map(([title, ownerRole, timeframeDays], index) => ({
    id: `rec-public-domain-${index + 1}`,
    rank: index + 1,
    title,
    description:
      index === 0
        ? "Replace public assumptions with approved revenue, margin, working-capital, and headcount evidence."
        : "Collect approved source evidence, assign an accountable owner, and record human review before action.",
    priority: index < 2 ? "P0" : index < 7 ? "P1" : "P2",
    businessImpact:
      "Improves evidence quality and decision readiness; financial impact is not quantified.",
    effort: index === 9 ? "low" : "medium",
    timeframeDays,
    ownerRole,
    evidence:
      "Public-domain source set identifies an evidence gap; internal validation is required.",
    confidence: "low",
  }));
}

function logGeneratedOutputs(
  assessmentId: string,
  outputs: {
    truthLayers: TruthLayer[];
    cockpit: Cockpit;
    scenarios: Scenario[];
    recommendations: Recommendation[];
    plan: ActionPhase[];
  },
): void {
  analysisLog("truth_map_generation_completed", {
    assessmentId,
    layerCount: outputs.truthLayers.length,
  });
  analysisLog("cockpit_generation_completed", {
    assessmentId,
    metricCount: outputs.cockpit.metrics.length,
  });
  analysisLog("scenario_generation_completed", {
    assessmentId,
    scenarioCount: outputs.scenarios.length,
  });
  analysisLog("recommendation_generation_completed", {
    assessmentId,
    recommendationCount: outputs.recommendations.length,
  });
  analysisLog("plan_generation_completed", {
    assessmentId,
    phaseCount: outputs.plan.length,
  });
}

function inferFactKind(line: string, source: Source): FactKind | undefined {
  const v = line.toLowerCase();
  if (/\brevenue|sales|turnover/.test(v)) return "revenue";
  if (/\bmargin|gm|gross margin|ebitda/.test(v)) return "margin";
  if (/\bcash|working capital|liquidity/.test(v)) return "cash";
  if (/\breceivable|ar\b|dso/.test(v)) return "receivables";
  if (/\bpayable|ap\b|creditor/.test(v)) return "payables";
  if (/\bpipeline|opportunit/.test(v)) return "pipeline";
  if (/\border|win rate|proposal/.test(v)) return "orders";
  if (/\bbacklog/.test(v)) return "backlog";
  if (/\bheadcount|employee|people|fte/.test(v)) return "headcount";
  if (/\bcustomer|client/.test(v)) return "customer";
  if (/\bproduct|sku|item/.test(v)) return "product";
  if (/\bsupplier|vendor|procurement/.test(v)) return "supplier";
  if (/\brisk|delay|overdue|issue|failure/.test(v)) return "risk";
  if (/\btarget|goal|plan|budget/.test(v)) return "target";
  if (/\bcommitment|committed/.test(v)) return "commitment";
  if (/\baction|owner|next step/.test(v)) return "action_item";
  if (/\bsop|policy|approval|control/.test(v)) return "sop_rule";
  if (/\bcost|expense|opex|inventory/.test(v)) return "cost";
  if (source.type === "sop") return "sop_rule";
  if (source.type === "strategy_deck") return "target";
  if (source.type === "operations_report") return "risk";
  if (source.type === "crm_export") return "pipeline";
  if (source.type === "erp_export") return "revenue";
  return undefined;
}

function parseNumericValue(line: string): { numericValue?: number; unit?: string } {
  const rupee = line.match(/₹\s*([\d,.]+)\s*(cr|crore|l|lac|lakh)?/i);
  if (rupee) {
    const n = Number(rupee[1].replace(/,/g, ""));
    if (Number.isFinite(n)) {
      const scale = rupee[2]?.toLowerCase();
      if (scale === "cr" || scale === "crore") {
        return { numericValue: n * 10_000_000, unit: "₹" };
      }
      if (scale === "l" || scale === "lac" || scale === "lakh") {
        return { numericValue: n * 100_000, unit: "₹" };
      }
      return { numericValue: n, unit: "₹" };
    }
  }
  const percent = line.match(/([\d,.]+)\s*%/);
  if (percent) {
    const n = Number(percent[1].replace(/,/g, ""));
    if (Number.isFinite(n)) return { numericValue: n, unit: "%" };
  }
  const plain = line.match(/\b([\d][\d,.]*)\b/);
  if (plain) {
    const n = Number(plain[1].replace(/,/g, ""));
    if (Number.isFinite(n)) return { numericValue: n, unit: "count" };
  }
  return {};
}

function labelFromLine(line: string, kind: FactKind): string {
  const clean = line.replace(/^[\s,;:-]+|[\s,;:-]+$/g, "");
  const beforeColon = clean.split(/:|,/)[0]?.trim();
  const candidate = beforeColon && beforeColon.length <= 64 ? beforeColon : clean;
  return candidate.slice(0, 72) || kind.replace(/_/g, " ");
}

function valueFromLine(line: string): string {
  const parts = line.split(/:|,/).map((part) => part.trim()).filter(Boolean);
  return (parts[1] ?? parts[0] ?? line).slice(0, 120);
}

function deterministicCockpit(
  assessment: Assessment,
  facts: ExtractedFact[],
): Cockpit {
  const revenue = findNumber(facts, "revenue") ?? 0;
  const margin = findNumber(facts, "margin") ?? 0;
  const cash = findNumber(facts, "cash") ?? findNumber(facts, "receivables") ?? 0;
  const headcount = findNumber(facts, "headcount");
  const rpe = revenue && headcount ? revenue / headcount : 0;
  const metrics: CockpitMetric[] = [
    metric("revenue", "Revenue actual vs target", revenue, assessment.revenueTarget, "₹"),
    metric("margin", "Margin actual vs target", margin, assessment.marginTarget, "%"),
    metric("cash", "Cash visibility", cash, assessment.cashTarget, "₹"),
    metric(
      "rpe",
      "Revenue per employee",
      rpe,
      assessment.headcountProductivityTarget,
      "₹/employee",
    ),
  ];
  const risks = facts.filter((fact) => fact.kind === "risk").slice(0, 4);
  const opportunities = facts
    .filter((fact) => fact.kind === "opportunity" || fact.kind === "pipeline")
    .slice(0, 4);
  return {
    metrics,
    topRisks:
      risks.length > 0
        ? risks.map((fact, i) => ({
            id: `risk-${i + 1}`,
            title: fact.label,
            description: fact.value,
            likelihood: fact.confidence,
            impact: i === 0 ? "high" : "medium",
          }))
        : [
            {
              id: "risk-data-quality",
              title: "Limited operating evidence",
              description:
                "Only extracted source text is available; pending binary sources are excluded until extraction is implemented.",
              likelihood: "medium",
              impact: "medium",
            },
          ],
    topOpportunities:
      opportunities.length > 0
        ? opportunities.map((fact, i) => ({
            id: `opp-${i + 1}`,
            title: fact.label,
            description: fact.value,
            impactInr: fact.numericValue ?? 0,
            timeframeDays: 90,
          }))
        : [
            {
              id: "opp-source-depth",
              title: "Add richer source evidence",
              description:
                "Upload financial, pipeline, and operating exports to unlock stronger recommendations.",
              impactInr: 0,
              timeframeDays: 14,
            },
          ],
  };
}

function metric(
  key: string,
  label: string,
  value: number,
  target: number,
  unit: CockpitMetric["unit"],
): CockpitMetric {
  const status =
    value === 0
      ? "off_track"
      : value >= target
        ? "on_track"
        : value >= target * 0.8
          ? "at_risk"
          : "off_track";
  return {
    key,
    label,
    value,
    target,
    unit,
    status,
    note:
      value === 0
        ? "No reliable extracted value yet."
        : `Extracted value ${formatValue(value, unit)} vs target ${formatValue(target, unit)}.`,
  };
}

function formatValue(value: number, unit: CockpitMetric["unit"]): string {
  if (unit === "₹") return `₹${(value / 10_000_000).toFixed(1)} Cr`;
  if (unit === "₹/employee") return `₹${(value / 100_000).toFixed(1)} L/employee`;
  if (unit === "%") return `${value}%`;
  return `${value}`;
}

function findNumber(facts: ExtractedFact[], kind: FactKind): number | undefined {
  return facts.find((fact) => fact.kind === kind && fact.numericValue !== undefined)
    ?.numericValue;
}

function deterministicScenarios(
  assessment: Assessment,
  facts: ExtractedFact[],
): Scenario[] {
  const revenue = findNumber(facts, "revenue") ?? assessment.revenueTarget * 0.8;
  const margin = findNumber(facts, "margin") ?? assessment.marginTarget * 0.8;
  return [
    {
      key: "revenue_plus_10",
      label: "Revenue +10%",
      description: "What must change to add 10% revenue without eroding margin?",
      currentBaseline: formatValue(revenue, "₹"),
      target: formatValue(revenue * 1.1, "₹"),
      options: ["Improve win rate", "Prioritize high-margin customers", "Clear delayed orders"],
      pros: ["Uses current pipeline evidence", "Creates operating leverage"],
      shortfalls: ["Needs stronger pipeline and capacity evidence"],
      expectedImpact: `${formatValue(revenue * 0.1, "₹")} incremental revenue`,
      risks: ["Working-capital pressure if receivables scale"],
      recommendation: "Start with pipeline quality and delayed-order recovery.",
      confidence: "medium",
    },
    {
      key: "margin_plus_10",
      label: "Margin +10%",
      description: "Where can margin expand from the extracted evidence?",
      currentBaseline: `${margin}%`,
      target: `${Math.round(margin * 1.1 * 10) / 10}%`,
      options: ["Reprice weak-margin deals", "Review supplier escalations", "Reduce rework"],
      pros: ["Direct P&L impact", "Can be sequenced by evidence confidence"],
      shortfalls: ["Requires SKU and customer profitability detail"],
      expectedImpact: "Margin uplift depends on product/customer mix evidence.",
      risks: ["Customer pushback on repricing"],
      recommendation: "Find low-margin SKUs and supplier movements before repricing.",
      confidence: "medium",
    },
    {
      key: "cost_minus_10",
      label: "Cost -10%",
      description: "Which cost lines are candidates for a controlled reduction?",
      currentBaseline: "Cost baseline inferred from extracted facts.",
      target: "10% lower controllable cost base.",
      options: ["Vendor consolidation", "Discretionary spend controls", "Process automation"],
      pros: ["Can release cash quickly", "Can be piloted without org-wide disruption"],
      shortfalls: ["Needs detailed GL and supplier evidence"],
      expectedImpact: "Prioritize facts with numeric cost evidence.",
      risks: ["Service or delivery degradation"],
      recommendation: "Run a two-week cost evidence sprint before cuts.",
      confidence: "low",
    },
    {
      key: "headcount_minus_15",
      label: "Headcount -15%",
      description: "What productivity uplift would be needed before headcount action?",
      currentBaseline: "Headcount baseline from extracted source if available.",
      target: "Same output with 15% fewer roles.",
      options: ["Automate manual reporting", "Consolidate duplicated workflows"],
      pros: ["Improves revenue per employee"],
      shortfalls: ["High execution and morale risk without process evidence"],
      expectedImpact: "Productivity upside requires workflow-level validation.",
      risks: ["Loss of institutional knowledge"],
      recommendation: "Do not pursue until process evidence is stronger.",
      confidence: "low",
    },
    {
      key: "cash_improvement",
      label: "Cash improvement",
      description: "How can receivables, inventory, and payables release cash?",
      currentBaseline: "Cash baseline from extracted finance facts.",
      target: formatValue(assessment.cashTarget, "₹"),
      options: ["AR collection sprint", "Inventory rationalisation", "Milestone billing"],
      pros: ["Direct balance-sheet impact", "Can be tracked weekly"],
      shortfalls: ["Needs AR aging and inventory detail"],
      expectedImpact: "Cash release depends on receivables and inventory evidence.",
      risks: ["Customer or supplier friction"],
      recommendation: "Start with AR aging and inventory extracts.",
      confidence: "medium",
    },
  ];
}

function deterministicRecommendations(
  _assessment: Assessment,
  facts: ExtractedFact[],
  cockpit: Cockpit,
): Recommendation[] {
  const recs: Omit<Recommendation, "id" | "rank">[] = [
    {
      title: "Create ISO and customer standards readiness evidence register",
      description:
        "Map applicable ISO and customer technical standards to owners, evidence status, gaps, and review dates.",
      priority: "P1",
      businessImpact: "Documentation readiness and evidence visibility.",
      effort: "medium",
      timeframeDays: 45,
      ownerRole: "Quality and compliance leadership",
      evidence:
        "Diagnostic scope requires an explicit standards gap review; confirm applicability and evidence from registered sources.",
      confidence: "low",
    },
    {
      title: "Build supplier qualification and subcontractor governance tracker",
      description:
        "Track qualification, onboarding documents, exceptions, performance evidence, and review dates.",
      priority: "P1",
      businessImpact: "Vendor readiness and supply-chain risk visibility.",
      effort: "medium",
      timeframeDays: 60,
      ownerRole: "Procurement and quality leadership",
      evidence:
        "Supplier and vendor evidence should be validated against the registered source set.",
      confidence: "low",
    },
    {
      title: "Introduce AI output validation and human approval workflow",
      description:
        "Require source-linked prompt/output review, approval history, and exception handling before action; prohibit autonomous irreversible action.",
      priority: "P1",
      businessImpact: "AI governance readiness and auditable accountability.",
      effort: "medium",
      timeframeDays: 30,
      ownerRole: "CIO and risk / compliance",
      evidence:
        "AI outputs require human validation and source traceability before management use.",
      confidence: "medium",
    },
    {
      title: "Create statutory document and audit evidence dashboard",
      description:
        "Index required documents and evidence with owner, validity, status, gap, and next review date.",
      priority: "P2",
      businessImpact: "Statutory documentation and audit evidence readiness.",
      effort: "medium",
      timeframeDays: 45,
      ownerRole: "Company secretary and compliance lead",
      evidence:
        "Confirm required statutory and audit evidence from the assessment's registered sources.",
      confidence: "low",
    },
    ...cockpit.metrics
      .filter((metricRow) => metricRow.status !== "on_track")
      .slice(0, 4)
      .map((metricRow): Omit<Recommendation, "id" | "rank"> => ({
        title: `Close the ${metricRow.label.toLowerCase()} gap`,
        description: metricRow.note,
        priority: metricRow.status === "off_track" ? "P0" : "P1",
        businessImpact: `Move ${metricRow.label} toward ${formatValue(metricRow.target, metricRow.unit)}.`,
        effort: "medium",
        timeframeDays: 60,
        ownerRole: "CXO owner",
        evidence: metricRow.note,
        confidence: "medium",
      })),
    ...facts
      .filter((fact) => fact.kind === "risk" || fact.kind === "opportunity")
      .slice(0, 4)
      .map((fact): Omit<Recommendation, "id" | "rank"> => ({
        title: fact.kind === "risk" ? `Mitigate ${fact.label}` : `Capture ${fact.label}`,
        description: fact.value,
        priority: fact.kind === "risk" ? "P1" : "P2",
        businessImpact: fact.numericValue
          ? formatValue(fact.numericValue, fact.unit === "%" ? "%" : "₹")
          : "Qualitative operating impact",
        effort: "medium",
        timeframeDays: 90,
        ownerRole: "Functional owner",
        evidence: fact.evidence,
        confidence: fact.confidence,
      })),
  ];
  if (recs.length === 0) {
    recs.push({
      title: "Upload financial and operating exports",
      description:
        "The current source set is too thin for high-confidence recommendations.",
      priority: "P0",
      businessImpact: "Higher-confidence truth map and recommendations.",
      effort: "low",
      timeframeDays: 7,
      ownerRole: "Assessment lead",
      evidence: "No extracted facts available.",
      confidence: "high",
    });
  }
  return recs.slice(0, 10).map((rec, i) => ({
    id: `rec-${i + 1}`,
    rank: i + 1,
    ...rec,
  })) as Recommendation[];
}

function deterministicPlan(recommendations: Recommendation[]): ActionPhase[] {
  const titles = recommendations.slice(0, 6).map((rec) => rec.title);
  return [
    {
      phase: "01",
      windowLabel: "Weeks 1-2",
      title: "Stabilise the evidence base",
      description: "Confirm extracted facts and resolve missing evidence.",
      deliverables: titles.slice(0, 2),
    },
    {
      phase: "02",
      windowLabel: "Weeks 3-6",
      title: "Move P0/P1 actions",
      description: "Run the highest-priority actions with clear owners.",
      deliverables: titles.slice(2, 4),
    },
    {
      phase: "03",
      windowLabel: "Weeks 7-10",
      title: "Operationalise the changes",
      description: "Convert the analysis into cadence, controls, and metrics.",
      deliverables: titles.slice(4, 6),
    },
    {
      phase: "04",
      windowLabel: "Weeks 11-13",
      title: "Refresh and review",
      description: "Refresh sources, rerun analysis, and prepare the board review.",
      deliverables: ["Refresh source set", "Rerun PulseIQ analysis", "Prepare board report"],
    },
  ];
}
