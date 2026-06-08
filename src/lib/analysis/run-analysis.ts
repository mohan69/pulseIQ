import {
  cockDraftToCockpit,
  createAIEngine,
  planDraftToPhases,
  recDraftsToRecs,
  scenarioDraftsToScenarios,
  truthDraftsToLayers,
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
} from "@/lib/assessment/types";
import type { AddFactInput } from "@/lib/assessment/repository";
import { buildFacts } from "@/lib/extraction/facts";
import { buildReport } from "@/lib/report/build";
import { buildTruthLayers } from "@/lib/truth-map/build";

const DEMO_ASSESSMENT_ID = "asm-bharat-heavy-fabrications";

export type AnalysisResult = {
  ok: boolean;
  assessmentId: string;
  provider: string;
  factsAdded: number;
  sourcesAnalyzed: number;
  message: string;
};

type SourceCorpus = {
  source: Source;
  text: string;
};

export async function runAssessmentAnalysis(
  assessmentId: string,
): Promise<AnalysisResult> {
  const engine = createAIEngine();
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error("Assessment not found.");
  }

  if (assessment.id === DEMO_ASSESSMENT_ID) {
    await addAuditEvent({
      action: "analysis_run_demo_skipped",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: { provider: engine.provider },
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

  await addAuditEvent({
    action: "analysis_run",
    entityType: "assessment",
    entityId: assessmentId,
    assessmentId,
    metadata: { provider: engine.provider },
  });
  await markAssessmentAnalyzing(assessmentId);

  try {
    const sources = await getSources(assessmentId);
    const existingFacts = await getFacts(assessmentId);
    const corpus = await loadAnalyzableCorpus(sources);
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

    for (const item of corpus) {
      await engine.classifySource(ctxBase, item.source, item.text);
      const aiDrafts = await engine.extractBusinessFacts(
        { ...ctxBase, facts: currentFacts },
        item.source,
        item.text,
      );
      const deterministicDrafts = deterministicFactsFromText(
        assessment,
        item.source,
        item.text,
      );
      const drafts =
        aiDrafts.facts.length > 0
          ? buildFacts(item.source, aiDrafts.facts)
          : deterministicDrafts;
      const fresh = dedupeFactDrafts(drafts, currentFacts, item.source.id);
      if (fresh.length === 0) continue;
      const created = await saveExtractedFacts(
        assessmentId,
        item.source.id,
        fresh,
      );
      factsAdded += created.length;
      currentFacts = [...created, ...currentFacts];
    }

    const ctx: AIContext = { ...ctxBase, facts: currentFacts };
    const truthDraft = await engine.generateTruthMap(ctx);
    const truthLayers =
      truthDraft.layers.length === 5
        ? truthDraftsToLayers(truthDraft.layers)
        : buildTruthLayers(currentFacts, sources);
    await setTruthLayers(assessmentId, truthLayers);

    const cockpitDraft = await engine.generateCockpitMetrics(ctx);
    const cockpit =
      cockpitDraft.metrics.length > 0
        ? cockDraftToCockpit(cockpitDraft)
        : deterministicCockpit(assessment, currentFacts);
    await setCockpit(assessmentId, cockpit);

    const scenariosDraft = await engine.generateWhatIfScenarios(ctx);
    const scenarios =
      scenariosDraft.scenarios.length === 5
        ? scenarioDraftsToScenarios(scenariosDraft.scenarios)
        : deterministicScenarios(assessment, currentFacts);
    await setScenarios(assessmentId, scenarios);

    const recommendationsDraft = await engine.generateRecommendations(ctx);
    const recommendations =
      recommendationsDraft.recommendations.length > 0
        ? recDraftsToRecs(recommendationsDraft.recommendations)
        : deterministicRecommendations(assessment, currentFacts, cockpit);
    await setRecommendations(assessmentId, recommendations);

    const planDraft = await engine.buildPlan(ctx);
    const plan =
      planDraft.phases.length > 0
        ? planDraftToPhases(planDraft)
        : deterministicPlan(recommendations);
    await setPlan(assessmentId, plan);

    await engine.generateReportSnapshot(ctx);
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
    await addAuditEvent({
      action: "report_generated",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: {
        provider: engine.provider,
        factCount: currentFacts.length,
        sourceCount: sources.length,
      },
    });

    await markAssessmentAnalyzed(assessmentId);
    await addAuditEvent({
      action: "analysis_completed",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: {
        provider: engine.provider,
        factsAdded,
        sourcesAnalyzed: corpus.length,
      },
    });
    return {
      ok: true,
      assessmentId,
      provider: engine.provider,
      factsAdded,
      sourcesAnalyzed: corpus.length,
      message: "Analysis ready.",
    };
  } catch (error) {
    await markAssessmentAnalysisFailed(assessmentId);
    await addAuditEvent({
      action: "analysis_failed",
      entityType: "assessment",
      entityId: assessmentId,
      assessmentId,
      metadata: {
        provider: engine.provider,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return {
      ok: false,
      assessmentId,
      provider: engine.provider,
      factsAdded: 0,
      sourcesAnalyzed: 0,
      message:
        error instanceof Error
          ? `Analysis failed: ${error.message}`
          : "Analysis failed.",
    };
  }
}

async function loadAnalyzableCorpus(sources: Source[]): Promise<SourceCorpus[]> {
  const rows: SourceCorpus[] = [];
  for (const source of sources) {
    const documents = await getSourceDocuments(source.id);
    const extractedText = documents
      .map((doc) => doc.content)
      .filter((content): content is string => Boolean(content?.trim()))
      .join("\n\n");
    const notes = source.notes.trim();
    const canUsePendingNotes =
      source.extractionStatus === "extraction_pending" && notes.length > 0;
    const text = [extractedText, canUsePendingNotes ? notes : ""]
      .filter(Boolean)
      .join("\n\n")
      .trim();
    if (!text) continue;
    rows.push({ source, text });
  }
  return rows;
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
