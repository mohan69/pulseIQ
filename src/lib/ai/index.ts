// PulseIQ Workbench — AI provider abstraction
// MVP: deterministic MockEngine. Real providers (OpenAI / OpenRouter) plug in behind
// the same interface. All outputs are Zod-validated before they reach the UI.

import { z } from "zod";
import type {
  ActionPhase,
  Cockpit,
  CockpitMetric,
  ExtractedFact,
  Recommendation,
  Scenario,
  ScenarioKey,
  Source,
  TopOpportunity,
  TruthLayer,
  TruthLayerKey,
} from "@/lib/assessment/types";
import { classifySourcePrompt } from "./prompts/classify-source";
import { extractBusinessFactsPrompt } from "./prompts/extract-business-facts";
import {
  generateSingleCockpitMetricPrompt,
} from "./prompts/generate-cockpit";
import {
  generateSinglePlanPhasePrompt,
} from "./prompts/generate-plan";
import {
  generateSingleRecommendationPrompt,
} from "./prompts/generate-recommendations";
import { generateReportPrompt } from "./prompts/generate-report";
import {
  generateSingleTruthLayerPrompt,
} from "./prompts/generate-truth-map";
import {
  generateSingleWhatIfPrompt,
} from "./prompts/generate-what-if";

// ---------------------------------------------------------------------------
// Output schemas — these are the *contracts* the workbench UI consumes.
// Any provider (mock or real) must return data that parses against these.
// ---------------------------------------------------------------------------

const FactKindSchema = z.enum([
  "revenue",
  "cost",
  "margin",
  "cash",
  "receivables",
  "payables",
  "pipeline",
  "orders",
  "backlog",
  "headcount",
  "customer",
  "product",
  "supplier",
  "risk",
  "opportunity",
  "action_item",
  "commitment",
  "target",
  "sop_rule",
]);

const SourceTypeSchema = z.enum([
  "financial_filing",
  "strategy_deck",
  "sop",
  "excel_tracker",
  "erp_export",
  "crm_export",
  "hrms_export",
  "operations_report",
  "proposal_report",
  "compliance_register",
  "standards_mapping",
  "vendor_qualification",
  "statutory_document",
  "ai_governance",
  "email_summary",
  "meeting_summary",
]);

export const SourceClassificationSchema = z.object({
  sourceType: SourceTypeSchema,
  confidence: z.enum(["high", "medium", "low"]),
  reason: z.string(),
}).strict();
export type SourceClassification = z.infer<typeof SourceClassificationSchema>;

export const FactDraftSchema = z.object({
  kind: FactKindSchema,
  label: z.string(),
  value: z.string(),
  numericValue: z.number().optional(),
  unit: z.string().optional(),
  evidence: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
}).strict();
export type FactDraft = z.infer<typeof FactDraftSchema>;

export const ExtractionResultSchema = z.object({
  facts: z.array(FactDraftSchema),
}).strict();
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
export const BusinessFactExtractionSchema = ExtractionResultSchema;

export const TruthLayerDraftSchema = z.object({
  key: z.enum([
    "financial",
    "strategic",
    "operational",
    "process",
    "collaboration",
  ]),
  title: z.string(),
  description: z.string(),
  findings: z.array(
    z.object({
      text: z.string(),
      impact: z.enum(["high", "medium", "low"]),
    }).strict(),
  ),
  gaps: z.array(z.string()),
  contradictions: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
}).strict();
export type TruthLayerDraft = z.infer<typeof TruthLayerDraftSchema>;

export const TruthMapResultSchema = z.object({
  layers: z.array(TruthLayerDraftSchema).length(5),
}).strict();
export const SingleTruthLayerResultSchema = z.object({
  layer: TruthLayerDraftSchema,
}).strict();
export type TruthMapResult = z.infer<typeof TruthMapResultSchema>;
export const TruthMapOutputSchema = TruthMapResultSchema;

export const CockpitMetricSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  target: z.number(),
  unit: z.enum(["₹", "%", "₹/employee", "count"]),
  status: z.enum(["on_track", "at_risk", "off_track"]),
  note: z.string(),
}).strict();
export const CockpitResultSchema = z.object({
  metrics: z.array(CockpitMetricSchema).min(1),
  topRisks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      likelihood: z.enum(["high", "medium", "low"]),
      impact: z.enum(["high", "medium", "low"]),
    }).strict(),
  ),
  topOpportunities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      impactInr: z.number(),
      timeframeDays: z.number(),
    }).strict(),
  ),
}).strict();
export const SingleCockpitMetricResultSchema = z.object({
  metric: CockpitMetricSchema,
}).strict();
export type CockpitResult = z.infer<typeof CockpitResultSchema>;
export const CockpitOutputSchema = CockpitResultSchema;

export type ScenarioDraft = z.infer<typeof ScenarioDraftSchema>;

export const ScenarioDraftSchema = z.object({
  key: z.enum([
    "revenue_plus_10",
    "margin_plus_10",
    "cost_minus_10",
    "headcount_minus_15",
    "cash_improvement",
  ]),
  label: z.string(),
  description: z.string(),
  currentBaseline: z.string(),
  target: z.string(),
  options: z.array(z.string()),
  pros: z.array(z.string()),
  shortfalls: z.array(z.string()),
  expectedImpact: z.string(),
  risks: z.array(z.string()),
  recommendation: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
}).strict();
export const ScenariosResultSchema = z.object({
  scenarios: z.array(ScenarioDraftSchema).length(5),
}).strict();
export const SingleScenarioResultSchema = z.object({
  scenario: ScenarioDraftSchema,
}).strict();
export type ScenariosResult = z.infer<typeof ScenariosResultSchema>;
export const WhatIfOutputSchema = ScenariosResultSchema;

export type RecommendationDraft = z.infer<typeof RecommendationDraftSchema>;

export const RecommendationDraftSchema = z.object({
  rank: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  businessImpact: z.string(),
  effort: z.enum(["low", "medium", "high"]),
  timeframeDays: z.number().int().positive(),
  ownerRole: z.string(),
  evidence: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
}).strict();
export const RecommendationsResultSchema = z.object({
  recommendations: z.array(RecommendationDraftSchema).min(1).max(10),
}).strict();
export const SingleRecommendationResultSchema = z.object({
  recommendation: RecommendationDraftSchema,
}).strict();
export type RecommendationsResult = z.infer<typeof RecommendationsResultSchema>;
export const RecommendationOutputSchema = RecommendationsResultSchema;

export const PlanPhaseSchema = z.object({
  phase: z.string(),
  windowLabel: z.string(),
  title: z.string(),
  description: z.string(),
  deliverables: z.array(z.string()),
}).strict();
export const PlanResultSchema = z.object({
  phases: z.array(PlanPhaseSchema).length(4),
}).strict();
export const SinglePlanPhaseResultSchema = z.object({
  phase: PlanPhaseSchema,
}).strict();
export type PlanResult = z.infer<typeof PlanResultSchema>;

export const ReportSnapshotOutputSchema = z.object({
  executiveSummary: z.string(),
  dataGaps: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
}).strict();
export type ReportSnapshotOutput = z.infer<typeof ReportSnapshotOutputSchema>;

// ---------------------------------------------------------------------------
// Engine interface
// ---------------------------------------------------------------------------

export type AIProviderName = "mock" | "openai" | "openrouter";

export interface AIContext {
  assessmentId: string;
  companyName: string;
  industry: string;
  objective: string;
  sources: Source[];
  facts: ExtractedFact[];
}

export interface AIEngine {
  readonly provider: AIProviderName;
  readonly model: string;
  classifySource(
    ctx: AIContext,
    source: Source,
    extractedText: string,
  ): Promise<SourceClassification>;
  extractBusinessFacts(
    ctx: AIContext,
    source: Source,
    extractedText: string,
  ): Promise<ExtractionResult>;
  generateTruthMap(ctx: AIContext): Promise<TruthMapResult>;
  generateCockpitMetrics(ctx: AIContext): Promise<CockpitResult>;
  generateWhatIfScenarios(ctx: AIContext): Promise<ScenariosResult>;
  generateRecommendations(ctx: AIContext): Promise<RecommendationsResult>;
  generateReportSnapshot(ctx: AIContext): Promise<ReportSnapshotOutput>;
  extractFacts(ctx: AIContext, source: Source): Promise<ExtractionResult>;
  buildTruthMap(ctx: AIContext): Promise<TruthMapResult>;
  buildCockpit(ctx: AIContext): Promise<CockpitResult>;
  buildScenarios(ctx: AIContext): Promise<ScenariosResult>;
  buildRecommendations(ctx: AIContext): Promise<RecommendationsResult>;
  buildPlan(ctx: AIContext): Promise<PlanResult>;
}

// ---------------------------------------------------------------------------
// MockEngine — deterministic, seed-friendly implementation for the MVP.
// Returns structured JSON strings that validate against the schemas above.
// Designed so the UI renders meaningful data even without an LLM key.
// ---------------------------------------------------------------------------

class MockEngine implements AIEngine {
  readonly provider: AIProviderName = "mock";
  readonly model = "deterministic";

  async classifySource(
    ctx: AIContext,
    source: Source,
    extractedText: string,
  ): Promise<SourceClassification> {
    void ctx;
    void extractedText;
    return {
      sourceType: source.type,
      confidence: source.confidence,
      reason: "Deterministic mock mode keeps the registered source type.",
    };
  }

  async extractBusinessFacts(
    ctx: AIContext,
    source: Source,
    extractedText: string,
  ): Promise<ExtractionResult> {
    void ctx;
    void source;
    void extractedText;
    return { facts: [] };
  }

  async generateTruthMap(ctx: AIContext): Promise<TruthMapResult> {
    void ctx;
    return { layers: [] };
  }

  async generateCockpitMetrics(ctx: AIContext): Promise<CockpitResult> {
    void ctx;
    return { metrics: [], topRisks: [], topOpportunities: [] };
  }

  async generateWhatIfScenarios(ctx: AIContext): Promise<ScenariosResult> {
    void ctx;
    return { scenarios: [] };
  }

  async generateRecommendations(
    ctx: AIContext,
  ): Promise<RecommendationsResult> {
    void ctx;
    return { recommendations: [] };
  }

  async generateReportSnapshot(
    ctx: AIContext,
  ): Promise<ReportSnapshotOutput> {
    return {
      executiveSummary: `Assessment of ${ctx.companyName} is ready for deterministic analysis.`,
      dataGaps: [],
      confidence: "medium",
    };
  }

  async extractFacts(
    ctx: AIContext,
    source: Source,
  ): Promise<ExtractionResult> {
    // Deterministic stub: extract nothing new beyond the seed set; for unknown
    // sources we return a small placeholder so the ingestion loop has shape.
    void ctx;
    if (source.status !== "parsed") {
      return { facts: [] };
    }
    return { facts: [] };
  }

  async buildTruthMap(ctx: AIContext): Promise<TruthMapResult> {
    return this.generateTruthMap(ctx);
  }

  async buildCockpit(ctx: AIContext): Promise<CockpitResult> {
    return this.generateCockpitMetrics(ctx);
  }

  async buildScenarios(ctx: AIContext): Promise<ScenariosResult> {
    return this.generateWhatIfScenarios(ctx);
  }

  async buildRecommendations(ctx: AIContext): Promise<RecommendationsResult> {
    return this.generateRecommendations(ctx);
  }

  async buildPlan(ctx: AIContext): Promise<PlanResult> {
    void ctx;
    return { phases: [] };
  }
}

// ---------------------------------------------------------------------------
// OpenAI-compatible providers — used only when explicitly configured.
// ---------------------------------------------------------------------------

export type ProviderConfig = {
  provider: AIProviderName;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  siteUrl?: string;
  appName?: string;
};

const OPENAI_BASE_URL = "https://api.openai.com/v1";
const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_DEFAULT_MODEL = "openrouter/auto";

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export type AIAnalysisSection =
  | "source_classification"
  | "business_facts"
  | "truth_layers"
  | "cockpit"
  | "scenarios"
  | "recommendations"
  | "plan"
  | "report";

export function parseAIJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const candidates = [
    trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""),
    ...Array.from(trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)).map(
      (match) => match[1].trim(),
    ),
  ];
  for (const candidate of candidates) {
    const parsed = tryParseObject(candidate);
    if (parsed) return parsed;
  }
  for (let start = 0; start < trimmed.length; start += 1) {
    if (trimmed[start] !== "{") continue;
    const candidate = balancedJsonObject(trimmed, start);
    if (!candidate) continue;
    const parsed = tryParseObject(candidate);
    if (parsed) return parsed;
  }
  throw new Error("Provider returned invalid JSON.");
}

function tryParseObject(value: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function balancedJsonObject(value: string, start: number): string | undefined {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return value.slice(start, index + 1);
    }
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function arrayOrEmpty(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringOrEmpty(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function confidenceOrMedium(value: unknown): "high" | "medium" | "low" {
  const normalized =
    typeof value === "string" ? value.trim().toLowerCase() : "";
  return normalized === "high" || normalized === "low" ? normalized : "medium";
}

function lowerString(value: unknown): unknown {
  return typeof value === "string" ? value.toLowerCase() : value;
}

export function normalizeAIOutput(
  section: AIAnalysisSection,
  value: Record<string, unknown>,
  schemaName: string = section,
): Record<string, unknown> {
  if (section === "source_classification") {
    return {
      ...value,
      reason: stringOrEmpty(value.reason),
      confidence: confidenceOrMedium(value.confidence),
    };
  }
  if (section === "business_facts") {
    return {
      ...value,
      facts: arrayOrEmpty(value.facts).map((entry) => {
        if (!isRecord(entry)) return entry;
        const next: Record<string, unknown> = {
          ...entry,
          label: stringOrEmpty(entry.label),
          value: stringOrEmpty(entry.value),
          evidence: stringOrEmpty(entry.evidence),
          confidence: confidenceOrMedium(entry.confidence),
        };
        if (next.numericValue === null) delete next.numericValue;
        if (next.unit === null) delete next.unit;
        return next;
      }),
    };
  }
  if (section === "truth_layers") {
    if (schemaName.startsWith("truth_layer_")) {
      const requestedKey = schemaName.replace("truth_layer_", "");
      const layer = isRecord(value.layer)
        ? value.layer
        : arrayOrEmpty(value.layers).find(
            (entry) => isRecord(entry) && entry.key === requestedKey,
          ) ??
          (value.key === requestedKey ? value : undefined);
      return {
        layer: isRecord(layer) ? normalizeTruthLayer(layer) : layer,
      };
    }
    return {
      ...value,
      layers: arrayOrEmpty(value.layers).map((entry) => {
        return isRecord(entry) ? normalizeTruthLayer(entry) : entry;
      }),
    };
  }
  if (section === "cockpit") {
    if (schemaName.startsWith("cockpit_metric_")) {
      const requestedKey = schemaName.replace("cockpit_metric_", "");
      const metric = isRecord(value.metric)
        ? value.metric
        : arrayOrEmpty(value.metrics).find(
            (entry) => isRecord(entry) && entry.key === requestedKey,
          ) ??
          (value.key === requestedKey ? value : undefined);
      return {
        metric: isRecord(metric) ? normalizeCockpitMetric(metric) : metric,
      };
    }
    return {
      ...value,
      metrics: arrayOrEmpty(value.metrics).map((entry) =>
        isRecord(entry) ? normalizeCockpitMetric(entry) : entry,
      ),
      topRisks: arrayOrEmpty(value.topRisks).map((entry) =>
        isRecord(entry)
          ? {
              ...entry,
              title: stringOrEmpty(entry.title),
              description: stringOrEmpty(entry.description),
              likelihood: lowerString(entry.likelihood),
              impact: lowerString(entry.impact),
            }
          : entry,
      ),
      topOpportunities: arrayOrEmpty(value.topOpportunities).map((entry) =>
        isRecord(entry)
          ? {
              ...entry,
              title: stringOrEmpty(entry.title),
              description: stringOrEmpty(entry.description),
            }
          : entry,
      ),
    };
  }
  if (section === "scenarios") {
    if (schemaName.startsWith("scenarios_")) {
      const requestedKey = schemaName.replace("scenarios_", "");
      const scenario = isRecord(value.scenario)
        ? value.scenario
        : arrayOrEmpty(value.scenarios).find(
            (entry) => isRecord(entry) && entry.key === requestedKey,
          ) ??
          (value.key === requestedKey ? value : undefined);
      return {
        scenario: isRecord(scenario) ? normalizeScenario(scenario) : scenario,
      };
    }
    return {
      ...value,
      scenarios: arrayOrEmpty(value.scenarios).map((entry) =>
        isRecord(entry) ? normalizeScenario(entry) : entry,
      ),
    };
  }
  if (section === "recommendations") {
    if (schemaName.startsWith("recommendation_")) {
      const requestedRank = Number(schemaName.replace("recommendation_", ""));
      const recommendation = isRecord(value.recommendation)
        ? value.recommendation
        : arrayOrEmpty(value.recommendations).find(
            (entry) => isRecord(entry) && entry.rank === requestedRank,
          ) ??
          (value.rank === requestedRank ? value : undefined);
      return {
        recommendation: isRecord(recommendation)
          ? normalizeRecommendation(recommendation)
          : recommendation,
      };
    }
    return {
      ...value,
      recommendations: arrayOrEmpty(value.recommendations).map((entry) =>
        isRecord(entry) ? normalizeRecommendation(entry) : entry,
      ),
    };
  }
  if (section === "plan") {
    if (schemaName.startsWith("plan_phase_")) {
      const requestedPhase = schemaName.replace("plan_phase_", "");
      const phase = isRecord(value.phase)
        ? value.phase
        : arrayOrEmpty(value.phases).find(
            (entry) =>
              isRecord(entry) &&
              String(entry.phase).replace(/^0/, "") === requestedPhase,
          ) ??
          (String(value.phase).replace(/^0/, "") === requestedPhase
            ? value
            : undefined);
      return {
        phase: isRecord(phase) ? normalizePlanPhase(phase) : phase,
      };
    }
    return {
      ...value,
      phases: arrayOrEmpty(value.phases).map((entry) =>
        isRecord(entry) ? normalizePlanPhase(entry) : entry,
      ),
    };
  }
  return {
    ...value,
    executiveSummary: stringOrEmpty(value.executiveSummary),
    dataGaps: arrayOrEmpty(value.dataGaps),
    confidence: confidenceOrMedium(value.confidence),
  };
}

function normalizeCockpitMetric(
  entry: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...entry,
    key: stringOrEmpty(entry.key),
    label: stringOrEmpty(entry.label),
    note: stringOrEmpty(entry.note),
    status: lowerString(entry.status),
  };
}

function normalizeTruthLayer(
  entry: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...entry,
    title: stringOrEmpty(entry.title),
    description: stringOrEmpty(entry.description),
    findings: arrayOrEmpty(entry.findings).map((finding) =>
      isRecord(finding)
        ? {
            ...finding,
            text: stringOrEmpty(finding.text),
            impact: lowerString(finding.impact),
          }
        : finding,
    ),
    gaps: arrayOrEmpty(entry.gaps),
    contradictions: arrayOrEmpty(entry.contradictions),
    confidence: confidenceOrMedium(entry.confidence),
  };
}

function normalizeScenario(
  entry: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...entry,
    label: stringOrEmpty(entry.label),
    description: stringOrEmpty(entry.description),
    currentBaseline: stringOrEmpty(entry.currentBaseline),
    target: stringOrEmpty(entry.target),
    options: arrayOrEmpty(entry.options),
    pros: arrayOrEmpty(entry.pros),
    shortfalls: arrayOrEmpty(entry.shortfalls),
    expectedImpact: stringOrEmpty(entry.expectedImpact),
    risks: arrayOrEmpty(entry.risks),
    recommendation: stringOrEmpty(entry.recommendation),
    confidence: confidenceOrMedium(entry.confidence),
  };
}

function normalizeRecommendation(
  entry: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...entry,
    title: stringOrEmpty(entry.title),
    description: stringOrEmpty(entry.description),
    businessImpact: stringOrEmpty(entry.businessImpact),
    ownerRole: stringOrEmpty(entry.ownerRole, "Leadership team"),
    evidence: stringOrEmpty(entry.evidence),
    effort: lowerString(entry.effort),
    confidence: confidenceOrMedium(entry.confidence),
  };
}

function normalizePlanPhase(
  entry: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...entry,
    phase: stringOrEmpty(entry.phase),
    windowLabel: stringOrEmpty(entry.windowLabel),
    title: stringOrEmpty(entry.title),
    description: stringOrEmpty(entry.description),
    deliverables: arrayOrEmpty(entry.deliverables),
  };
}

class OpenAICompatibleEngine implements AIEngine {
  readonly provider: AIProviderName;
  readonly model: string;
  private apiKey: string;
  private baseUrl: string;
  private siteUrl?: string;
  private appName?: string;

  constructor(config: Required<Pick<ProviderConfig, "provider" | "apiKey" | "baseUrl" | "model">> &
    Pick<ProviderConfig, "siteUrl" | "appName">) {
    this.provider = config.provider;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
    this.siteUrl = config.siteUrl;
    this.appName = config.appName;
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (this.provider === "openrouter") {
      if (this.siteUrl) headers["HTTP-Referer"] = this.siteUrl;
      if (this.appName) headers["X-Title"] = this.appName;
    }
    return headers;
  }

  private async callModel(
    prompt: string,
    section: AIAnalysisSection,
    schema: z.ZodType,
    schemaName: string = section,
  ): Promise<string> {
    const timeoutMs = aiRequestTimeoutMs();
    let res: Response;
    const startedAt = Date.now();
    console.info("[PulseIQ AI] request_started", {
      provider: this.provider,
      model: this.model,
      section,
      schemaName,
      timeoutMs,
    });
    try {
      res = await fetch(joinUrl(this.baseUrl, "/chat/completions"), {
        method: "POST",
        headers: this.headers(),
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          model: this.model,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: `pulseiq_${schemaName}`,
              strict: true,
              schema: providerJsonSchema(schema),
            },
          },
          ...(this.provider === "openrouter"
            ? {
                provider: { require_parameters: true },
                plugins: [{ id: "response-healing" }],
              }
            : {}),
          messages: [
            {
              role: "system",
              content:
                "Return one JSON object only. No Markdown, prose, code fences, null arrays, or unknown fields. Match the supplied schema exactly.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });
    } catch (error) {
      const timedOut =
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError");
      throw new AIProviderError(
        this.provider,
        timedOut
          ? `request timed out after ${timeoutMs} ms`
          : "request could not be completed",
      );
    }
    const data = await res.json().catch(() => ({}));
    console.info("[PulseIQ AI] response_received", {
      provider: this.provider,
      model: this.model,
      section,
      schemaName,
      status: res.status,
      ok: res.ok,
      durationMs: Date.now() - startedAt,
    });
    if (!res.ok) {
      const message =
        typeof data?.error?.message === "string"
          ? data.error.message
          : `HTTP ${res.status}`;
      throw new AIProviderError(this.provider, message);
    }
    return data.choices?.[0]?.message?.content ?? "{}";
  }

  private async validated<T>(
    section: AIAnalysisSection,
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string = section,
  ): Promise<T> {
    const raw = await this.callModel(prompt, section, schema, schemaName);
    const first = validateProviderOutput(section, raw, schema, schemaName);
    if (first.success) {
      console.info("[PulseIQ AI] json_parse_succeeded", {
        provider: this.provider,
        model: this.model,
        section,
        schemaName,
        attempt: 1,
      });
      return first.data;
    }

    console.warn("[PulseIQ AI] json_parse_failed", {
      provider: this.provider,
      model: this.model,
      section,
      schemaName,
      attempt: 1,
      diagnostics: first.diagnostics,
    });
    logSchemaDiagnostics(this.provider, this.model, section, first.diagnostics, 1);
    const repairPrompt = buildRepairPrompt(
      section,
      prompt,
      raw,
      schema,
      first.diagnostics,
    );
    const repairedRaw = await this.callModel(
      repairPrompt,
      section,
      schema,
      schemaName,
    );
    const repaired = validateProviderOutput(
      section,
      repairedRaw,
      schema,
      schemaName,
    );
    if (repaired.success) {
      console.info("[PulseIQ AI] json_parse_succeeded", {
        provider: this.provider,
        model: this.model,
        section,
        schemaName,
        attempt: 2,
      });
      return repaired.data;
    }

    console.warn("[PulseIQ AI] json_parse_failed", {
      provider: this.provider,
      model: this.model,
      section,
      schemaName,
      attempt: 2,
      diagnostics: repaired.diagnostics,
    });
    logSchemaDiagnostics(
      this.provider,
      this.model,
      section,
      repaired.diagnostics,
      2,
    );
    throw new AIProviderError(
      this.provider,
      "output did not match required schema after repair attempt",
    );
  }

  private validatedSection<T>(
    section: AIAnalysisSection,
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string = section,
  ): Promise<T> {
    return this.validated(section, prompt, schema, schemaName);
  }

  async classifySource(
    ctx: AIContext,
    source: Source,
    extractedText: string,
  ): Promise<SourceClassification> {
    return this.validatedSection(
      "source_classification",
      classifySourcePrompt({
        companyName: ctx.companyName,
        source,
        extractedText,
      }),
      SourceClassificationSchema,
    );
  }

  async extractBusinessFacts(
    ctx: AIContext,
    source: Source,
    extractedText: string,
  ): Promise<ExtractionResult> {
    return this.validatedSection(
      "business_facts",
      extractBusinessFactsPrompt({
        companyName: ctx.companyName,
        industry: ctx.industry,
        objective: ctx.objective,
        source,
        extractedText,
      }),
      BusinessFactExtractionSchema,
    );
  }

  async generateTruthMap(ctx: AIContext): Promise<TruthMapResult> {
    const keys: TruthLayerKey[] = [
      "financial",
      "strategic",
      "operational",
      "process",
      "collaboration",
    ];
    const layers = await Promise.all(
      keys.map(async (key) => {
        const result = await this.validatedSection(
          "truth_layers",
          generateSingleTruthLayerPrompt(ctx, key),
          SingleTruthLayerResultSchema,
          `truth_layer_${key}`,
        );
        return result.layer;
      }),
    );
    return TruthMapOutputSchema.parse({ layers });
  }

  async generateCockpitMetrics(ctx: AIContext): Promise<CockpitResult> {
    const keys = ["revenue", "margin", "cash", "productivity"] as const;
    const metrics = await Promise.all(
      keys.map(async (key) => {
        const result = await this.validatedSection(
          "cockpit",
          generateSingleCockpitMetricPrompt(ctx, key),
          SingleCockpitMetricResultSchema,
          `cockpit_metric_${key}`,
        );
        return result.metric;
      }),
    );
    return CockpitOutputSchema.parse({
      metrics,
      topRisks: [],
      topOpportunities: [],
    });
  }

  async generateWhatIfScenarios(ctx: AIContext): Promise<ScenariosResult> {
    const keys: ScenarioKey[] = [
      "revenue_plus_10",
      "margin_plus_10",
      "cost_minus_10",
      "headcount_minus_15",
      "cash_improvement",
    ];
    const scenarios = await Promise.all(
      keys.map(async (key) => {
        const result = await this.validatedSection(
          "scenarios",
          generateSingleWhatIfPrompt(ctx, key),
          SingleScenarioResultSchema,
          `scenarios_${key}`,
        );
        return result.scenario;
      }),
    );
    return WhatIfOutputSchema.parse({ scenarios });
  }

  async generateRecommendations(
    ctx: AIContext,
  ): Promise<RecommendationsResult> {
    const recommendations = await Promise.all(
      [1, 2, 3, 4, 5].map(async (rank) => {
        const result = await this.validatedSection(
          "recommendations",
          generateSingleRecommendationPrompt(ctx, rank),
          SingleRecommendationResultSchema,
          `recommendation_${rank}`,
        );
        return result.recommendation;
      }),
    );
    return RecommendationOutputSchema.parse({ recommendations });
  }

  async generateReportSnapshot(
    ctx: AIContext,
  ): Promise<ReportSnapshotOutput> {
    return this.validatedSection(
      "report",
      generateReportPrompt(ctx),
      ReportSnapshotOutputSchema,
    );
  }

  async extractFacts(
    ctx: AIContext,
    source: Source,
  ): Promise<ExtractionResult> {
    return this.extractBusinessFacts(ctx, source, source.notes);
  }

  async buildTruthMap(ctx: AIContext): Promise<TruthMapResult> {
    return this.generateTruthMap(ctx);
  }

  async buildCockpit(ctx: AIContext): Promise<CockpitResult> {
    return this.generateCockpitMetrics(ctx);
  }

  async buildScenarios(ctx: AIContext): Promise<ScenariosResult> {
    return this.generateWhatIfScenarios(ctx);
  }

  async buildRecommendations(ctx: AIContext): Promise<RecommendationsResult> {
    return this.generateRecommendations(ctx);
  }

  async buildPlan(ctx: AIContext): Promise<PlanResult> {
    const phases = await Promise.all(
      [1, 2, 3, 4].map(async (phase) => {
        const result = await this.validatedSection(
          "plan",
          generateSinglePlanPhasePrompt(ctx, phase),
          SinglePlanPhaseResultSchema,
          `plan_phase_${phase}`,
        );
        return result.phase;
      }),
    );
    return PlanResultSchema.parse({ phases });
  }
}

type ValidationDiagnostic = {
  path: string;
  expected: string;
  received: string;
};

type ProviderValidation<T> =
  | { success: true; data: T }
  | { success: false; diagnostics: ValidationDiagnostic[] };

function validateProviderOutput<T>(
  section: AIAnalysisSection,
  raw: string,
  schema: z.ZodType<T>,
  schemaName: string = section,
): ProviderValidation<T> {
  let parsed: Record<string, unknown>;
  try {
    parsed = parseAIJsonObject(raw);
  } catch {
    return {
      success: false,
      diagnostics: [{ path: "$", expected: "JSON object", received: "string" }],
    };
  }
  const normalized = normalizeAIOutput(section, parsed, schemaName);
  const result = schema.safeParse(normalized);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    diagnostics: summarizeZodIssues(result.error, normalized),
  };
}

export function summarizeZodIssues(
  error: z.ZodError,
  value: unknown,
): ValidationDiagnostic[] {
  return error.issues.slice(0, 12).map((issue) => ({
    path:
      issue.path.length > 0
        ? `$.${issue.path.map(String).join(".")}`
        : "$",
    expected: expectedIssueType(issue),
    received: valueTypeAtPath(value, issue.path),
  }));
}

function expectedIssueType(issue: z.core.$ZodIssue): string {
  if ("expected" in issue && typeof issue.expected === "string") {
    return issue.expected;
  }
  if (
    issue.code === "too_small" &&
    "minimum" in issue &&
    typeof issue.minimum === "number"
  ) {
    const origin =
      "origin" in issue && typeof issue.origin === "string"
        ? issue.origin
        : "value";
    return `${origin}(min ${issue.minimum})`;
  }
  if (
    issue.code === "too_big" &&
    "maximum" in issue &&
    typeof issue.maximum === "number"
  ) {
    const origin =
      "origin" in issue && typeof issue.origin === "string"
        ? issue.origin
        : "value";
    return `${origin}(max ${issue.maximum})`;
  }
  return issue.code;
}

function valueTypeAtPath(
  value: unknown,
  path: PropertyKey[],
): string {
  let current = value;
  for (const segment of path) {
    if (current == null || typeof current !== "object") return typeof current;
    current = (current as Record<PropertyKey, unknown>)[segment];
  }
  if (current === null) return "null";
  if (Array.isArray(current)) return "array";
  return typeof current;
}

function logSchemaDiagnostics(
  provider: AIProviderName,
  model: string,
  section: AIAnalysisSection,
  diagnostics: ValidationDiagnostic[],
  attempt: number,
): void {
  console.warn("[PulseIQ AI] schema_validation_failed", {
    provider,
    model,
    section,
    attempt,
    issues: diagnostics,
  });
}

function buildRepairPrompt(
  section: AIAnalysisSection,
  originalPrompt: string,
  raw: string,
  schema: z.ZodType,
  diagnostics: ValidationDiagnostic[],
): string {
  return `Repair this JSON to match the schema. Return JSON only.
No Markdown, commentary, or code fences. Use [] instead of null arrays and ""
instead of null required strings. Omit unavailable optional numbers. Do not
invent financial values. Preserve evidence and clearly label assumptions.

Section: ${section}
Validation errors:
${JSON.stringify(diagnostics)}

Original task and evidence context:
${originalPrompt.slice(0, 30000)}

Required JSON Schema:
${JSON.stringify(providerJsonSchema(schema))}

JSON to repair:
${raw.slice(0, 50000)}`;
}

export function providerJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
  delete jsonSchema.$schema;
  return makeStrictProviderSchema(jsonSchema);
}

function makeStrictProviderSchema(
  value: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...value };
  if (isRecord(next.properties)) {
    const properties = Object.fromEntries(
      Object.entries(next.properties).map(([key, property]) => [
        key,
        isRecord(property) ? makeStrictProviderSchema(property) : property,
      ]),
    );
    const required = new Set(
      Array.isArray(next.required)
        ? next.required.filter((item): item is string => typeof item === "string")
        : [],
    );
    for (const [key, property] of Object.entries(properties)) {
      if (required.has(key) || !isRecord(property)) continue;
      properties[key] = nullableJsonSchema(property);
      required.add(key);
    }
    next.properties = properties;
    next.required = Array.from(required);
    next.additionalProperties = false;
  }
  if (isRecord(next.items)) {
    next.items = makeStrictProviderSchema(next.items);
  }
  if (Array.isArray(next.anyOf)) {
    next.anyOf = next.anyOf.map((item) =>
      isRecord(item) ? makeStrictProviderSchema(item) : item,
    );
  }
  return next;
}

function nullableJsonSchema(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  if (Array.isArray(schema.anyOf)) {
    return {
      ...schema,
      anyOf: [...schema.anyOf, { type: "null" }],
    };
  }
  return {
    anyOf: [schema, { type: "null" }],
  };
}

export class AIProviderError extends Error {
  constructor(
    readonly provider: AIProviderName,
    detail: string,
  ) {
    super(`${providerLabel(provider)} analysis failed: ${detail}.`);
    this.name = "AIProviderError";
  }
}

function providerLabel(provider: AIProviderName): string {
  if (provider === "openrouter") return "OpenRouter";
  if (provider === "openai") return "OpenAI";
  return "Mock";
}

function aiRequestTimeoutMs(): number {
  const configured = Number(process.env.PULSEIQ_AI_REQUEST_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured >= 1_000) {
    return Math.min(configured, 60_000);
  }
  return 20_000;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let cachedEngine: AIEngine | null = null;

export function resolveAIEngineConfig(
  env: Record<string, string | undefined> = process.env,
): ProviderConfig {
  const requestedProvider = env.AI_PROVIDER as AIProviderName | undefined;

  if (requestedProvider === "openrouter") {
    return {
      provider: env.OPENROUTER_API_KEY ? "openrouter" : "mock",
      apiKey: env.OPENROUTER_API_KEY,
      baseUrl: env.OPENROUTER_BASE_URL || OPENROUTER_BASE_URL,
      model: env.OPENROUTER_MODEL || OPENROUTER_DEFAULT_MODEL,
      siteUrl: env.OPENROUTER_SITE_URL,
      appName: env.OPENROUTER_APP_NAME,
    };
  }

  if (requestedProvider === "openai") {
    return {
      provider: env.OPENAI_API_KEY ? "openai" : "mock",
      apiKey: env.OPENAI_API_KEY,
      baseUrl: OPENAI_BASE_URL,
      model: env.OPENAI_MODEL || OPENAI_DEFAULT_MODEL,
    };
  }

  if (requestedProvider === "mock") {
    return { provider: "mock" };
  }

  if (env.OPENROUTER_API_KEY) {
    return {
      provider: "openrouter",
      apiKey: env.OPENROUTER_API_KEY,
      baseUrl: env.OPENROUTER_BASE_URL || OPENROUTER_BASE_URL,
      model: env.OPENROUTER_MODEL || OPENROUTER_DEFAULT_MODEL,
      siteUrl: env.OPENROUTER_SITE_URL,
      appName: env.OPENROUTER_APP_NAME,
    };
  }

  if (env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: env.OPENAI_API_KEY,
      baseUrl: OPENAI_BASE_URL,
      model: env.OPENAI_MODEL || OPENAI_DEFAULT_MODEL,
    };
  }

  return { provider: "mock" };
}

export function createAIEngine(): AIEngine {
  if (cachedEngine) return cachedEngine;
  const config = resolveAIEngineConfig();
  if (
    config.provider === "openrouter" &&
    config.apiKey &&
    config.baseUrl &&
    config.model
  ) {
    cachedEngine = new OpenAICompatibleEngine({
      provider: "openrouter",
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      siteUrl: config.siteUrl,
      appName: config.appName,
    });
    return cachedEngine;
  }
  if (
    config.provider === "openai" &&
    config.apiKey &&
    config.baseUrl &&
    config.model
  ) {
    cachedEngine = new OpenAICompatibleEngine({
      provider: "openai",
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
    });
    return cachedEngine;
  }
  cachedEngine = new MockEngine();
  return cachedEngine;
}

export function resetAIEngine(): void {
  cachedEngine = null;
}

// ---------------------------------------------------------------------------
// Type guards / shims used by builders to map drafts into domain types
// ---------------------------------------------------------------------------

export function cockDraftToCockpit(draft: CockpitResult): Cockpit {
  return {
    metrics: draft.metrics as CockpitMetric[],
    topRisks: draft.topRisks.map((r, i) => ({
      id: `risk-${i + 1}`,
      ...r,
    })),
    topOpportunities: draft.topOpportunities.map(
      (o, i): TopOpportunity => ({
        id: `opp-${i + 1}`,
        ...o,
      }),
    ),
  };
}

export function scenarioDraftsToScenarios(
  drafts: ScenarioDraft[],
): Scenario[] {
  return drafts.map((s) => ({ ...s }));
}

export function recDraftsToRecs(
  drafts: RecommendationDraft[],
): Recommendation[] {
  return drafts.map((d, i) => ({
    id: `rec-${i + 1}`,
    ...d,
    rank: d.rank,
  }));
}

export function planDraftToPhases(draft: PlanResult): ActionPhase[] {
  return draft.phases.map((p) => ({ ...p }));
}

export function truthDraftsToLayers(
  drafts: TruthLayerDraft[],
): TruthLayer[] {
  return drafts.map((d, i) => ({
    key: d.key,
    title: d.title,
    description: d.description,
    findings: d.findings.map((f, j) => ({
      id: `fnd-${d.key}-${j + 1}`,
      text: f.text,
      impact: f.impact,
      factIds: [],
    })),
    evidence: [],
    confidence: d.confidence,
    gaps: d.gaps,
    contradictions: d.contradictions,
    _index: i,
  } as TruthLayer & { _index?: number }));
}
