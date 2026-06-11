// PulseIQ Workbench — report composer
// Assembles the board-ready report from the workbench's primary domain objects.

import type {
  ActionPhase,
  Assessment,
  Cockpit,
  ExtractedFact,
  Report,
  Scenario,
  Source,
  TruthLayer,
} from "@/lib/assessment/types";
import {
  DIAGNOSTIC_DISCLAIMER,
  DIAGNOSTIC_POSITIONING,
} from "@/lib/diagnostic-positioning";

export function buildReport(input: {
  assessment: Assessment;
  sources: Source[];
  facts: ExtractedFact[];
  truthLayers: TruthLayer[];
  cockpit: Cockpit;
  scenarios: Scenario[];
  recommendations: import("@/lib/assessment/types").Recommendation[];
  plan: ActionPhase[];
}): Report {
  const {
    assessment,
    sources,
    facts,
    truthLayers,
    cockpit,
    scenarios,
    recommendations,
    plan,
  } = input;
  const dataGaps = truthLayers.flatMap((l) =>
    l.gaps.map((g) => `[${l.title}] ${g}`),
  );
  return {
    assessmentId: assessment.id,
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
    dataGaps,
  };
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
  return `${DIAGNOSTIC_POSITIONING} Assessment of ${assessment.companyName} synthesised from ${sources.length} source${sources.length === 1 ? "" : "s"} and ${facts.length} extracted fact${facts.length === 1 ? "" : "s"}. Current operating posture: ${headline}. The scope includes compliance and standards readiness, vendor/supplier ecosystem readiness, statutory and customer prequalification documentation readiness, and AI governance readiness. ${DIAGNOSTIC_DISCLAIMER}`;
}
