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
  Source,
  TopOpportunity,
  TruthLayer,
} from "@/lib/assessment/types";

// ---------------------------------------------------------------------------
// Output schemas — these are the *contracts* the workbench UI consumes.
// Any provider (mock or real) must return data that parses against these.
// ---------------------------------------------------------------------------

export const FactDraftSchema = z.object({
  kind: z.string(),
  label: z.string(),
  value: z.string(),
  numericValue: z.number().optional(),
  unit: z.string().optional(),
  evidence: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});
export type FactDraft = z.infer<typeof FactDraftSchema>;

export const ExtractionResultSchema = z.object({
  facts: z.array(FactDraftSchema),
});
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

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
    }),
  ),
  gaps: z.array(z.string()),
  contradictions: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});
export type TruthLayerDraft = z.infer<typeof TruthLayerDraftSchema>;

export const TruthMapResultSchema = z.object({
  layers: z.array(TruthLayerDraftSchema),
});
export type TruthMapResult = z.infer<typeof TruthMapResultSchema>;

export const CockpitMetricSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  target: z.number(),
  unit: z.enum(["₹", "%", "₹/employee", "count"]),
  status: z.enum(["on_track", "at_risk", "off_track"]),
  note: z.string(),
});
export const CockpitResultSchema = z.object({
  metrics: z.array(CockpitMetricSchema),
  topRisks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      likelihood: z.enum(["high", "medium", "low"]),
      impact: z.enum(["high", "medium", "low"]),
    }),
  ),
  topOpportunities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      impactInr: z.number(),
      timeframeDays: z.number(),
    }),
  ),
});
export type CockpitResult = z.infer<typeof CockpitResultSchema>;

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
});
export const ScenariosResultSchema = z.object({
  scenarios: z.array(ScenarioDraftSchema),
});
export type ScenariosResult = z.infer<typeof ScenariosResultSchema>;

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
});
export const RecommendationsResultSchema = z.object({
  recommendations: z.array(RecommendationDraftSchema),
});
export type RecommendationsResult = z.infer<typeof RecommendationsResultSchema>;

export const PlanPhaseSchema = z.object({
  phase: z.string(),
  windowLabel: z.string(),
  title: z.string(),
  description: z.string(),
  deliverables: z.array(z.string()),
});
export const PlanResultSchema = z.object({
  phases: z.array(PlanPhaseSchema),
});
export type PlanResult = z.infer<typeof PlanResultSchema>;

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
    void ctx;
    return {
      layers: [],
    };
  }

  async buildCockpit(ctx: AIContext): Promise<CockpitResult> {
    void ctx;
    return { metrics: [], topRisks: [], topOpportunities: [] };
  }

  async buildScenarios(ctx: AIContext): Promise<ScenariosResult> {
    void ctx;
    return { scenarios: [] };
  }

  async buildRecommendations(ctx: AIContext): Promise<RecommendationsResult> {
    void ctx;
    return { recommendations: [] };
  }

  async buildPlan(ctx: AIContext): Promise<PlanResult> {
    void ctx;
    return { phases: [] };
  }
}

// ---------------------------------------------------------------------------
// OpenAI-compatible providers — used only when explicitly configured.
// ---------------------------------------------------------------------------

type ProviderConfig = {
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

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

class OpenAICompatibleEngine implements AIEngine {
  readonly provider: AIProviderName;
  private apiKey: string;
  private baseUrl: string;
  private model: string;
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

  private async callModel(prompt: string): Promise<string> {
    const res = await fetch(joinUrl(this.baseUrl, "/chat/completions"), {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return strict JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof data?.error?.message === "string"
          ? data.error.message
          : `HTTP ${res.status}`;
      throw new Error(`${this.provider} request failed: ${message}`);
    }
    return data.choices?.[0]?.message?.content ?? "{}";
  }

  private async validated<T>(
    prompt: string,
    schema: z.ZodType<T>,
    fallback: T,
  ): Promise<T> {
    try {
      const raw = await this.callModel(prompt);
      return schema.parse(safeJsonParse(raw));
    } catch (error) {
      console.warn(
        `[PulseIQ AI] ${this.provider} output rejected; using safe fallback.`,
        error,
      );
      return fallback;
    }
  }

  async extractFacts(
    ctx: AIContext,
    source: Source,
  ): Promise<ExtractionResult> {
    const prompt = `Extract atomic facts from this source for assessment ${ctx.assessmentId} (${ctx.companyName}, ${ctx.industry}, objective=${ctx.objective}).
Source: ${source.name} (${source.type})
Notes: ${source.notes}
Existing facts: ${JSON.stringify(ctx.facts.slice(0, 20))}
Return JSON matching: {"facts":[{"kind","label","value","numericValue?","unit?","evidence","confidence"}]}`;
    return this.validated(prompt, ExtractionResultSchema, { facts: [] });
  }

  async buildTruthMap(ctx: AIContext): Promise<TruthMapResult> {
    const prompt = `Build a 5-layer truth map for ${ctx.companyName}.
Layers: financial, strategic, operational, process, collaboration.
Facts: ${JSON.stringify(ctx.facts)}
Sources: ${JSON.stringify(ctx.sources.map((s) => ({ id: s.id, name: s.name, type: s.type })))}
Return JSON matching: {"layers":[{"key","title","description","findings":[{"text","impact"}],"gaps","contradictions","confidence"}]}`;
    return this.validated(prompt, TruthMapResultSchema, { layers: [] });
  }

  async buildCockpit(ctx: AIContext): Promise<CockpitResult> {
    const prompt = `Build an executive cockpit for ${ctx.companyName}.
Facts: ${JSON.stringify(ctx.facts)}
Return JSON matching: {"metrics":[{"key","label","value","target","unit","status","note"}],"topRisks":[{"title","description","likelihood","impact"}],"topOpportunities":[{"title","description","impactInr","timeframeDays"}]}`;
    return this.validated(prompt, CockpitResultSchema, {
      metrics: [],
      topRisks: [],
      topOpportunities: [],
    });
  }

  async buildScenarios(ctx: AIContext): Promise<ScenariosResult> {
    const prompt = `Build the 5 standard what-if scenarios for ${ctx.companyName}.
Keys: revenue_plus_10, margin_plus_10, cost_minus_10, headcount_minus_15, cash_improvement.
Facts: ${JSON.stringify(ctx.facts)}
Return JSON matching: {"scenarios":[{"key","label","description","currentBaseline","target","options","pros","shortfalls","expectedImpact","risks","recommendation","confidence"}]}`;
    return this.validated(prompt, ScenariosResultSchema, { scenarios: [] });
  }

  async buildRecommendations(ctx: AIContext): Promise<RecommendationsResult> {
    const prompt = `Produce the top 10 recommendations for ${ctx.companyName}.
Facts: ${JSON.stringify(ctx.facts)}
Return JSON matching: {"recommendations":[{"rank","title","description","priority","businessImpact","effort","timeframeDays","ownerRole","evidence","confidence"}]}`;
    return this.validated(prompt, RecommendationsResultSchema, {
      recommendations: [],
    });
  }

  async buildPlan(ctx: AIContext): Promise<PlanResult> {
    const prompt = `Build a 4-phase 90-day plan for ${ctx.companyName}.
Facts: ${JSON.stringify(ctx.facts)}
Return JSON matching: {"phases":[{"phase","windowLabel","title","description","deliverables"}]}`;
    return this.validated(prompt, PlanResultSchema, { phases: [] });
  }
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
