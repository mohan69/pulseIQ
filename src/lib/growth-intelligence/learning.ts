import { getCompositeFitScore } from "@/lib/growth-intelligence/generator";
import type {
  GrowthAccount,
  GrowthLearningInsight,
  GrowthPipelineStatus,
} from "@/lib/growth-intelligence/types";

const STATUS_SCORE: Record<GrowthPipelineStatus, number> = {
  "Target Identified": 0,
  Researched: 1,
  "Outreach Drafted": 2,
  "Outreach Sent": 3,
  Replied: 5,
  "Discovery Scheduled": 6,
  "Demo Completed": 7,
  "Proposal Shared": 8,
  "Pilot / Deal Won": 10,
  "Nurture / Lost": 0,
};

type Aggregate = {
  label: string;
  score: number;
  count: number;
};

function ranked(
  accounts: GrowthAccount[],
  labelFor: (account: GrowthAccount) => string,
): Aggregate[] {
  const values = new Map<string, { score: number; count: number }>();
  for (const account of accounts) {
    const label = labelFor(account).trim() || "Not enough data";
    const current = values.get(label) ?? { score: 0, count: 0 };
    current.score +=
      STATUS_SCORE[account.outcome.status] * 10 +
      getCompositeFitScore(account.fitScores) * 0.25;
    current.count += 1;
    values.set(label, current);
  }
  return Array.from(values, ([label, value]) => ({
    label,
    score: value.score / value.count,
    count: value.count,
  })).sort((a, b) => b.score - a.score || b.count - a.count);
}

function painAngle(account: GrowthAccount): string {
  return (
    account.intelligence.conversationAngle
      .split(";")[0]
      ?.replace(/^Lead with /, "")
      .replace(/[.;]$/, "") || "Outcome-led discovery"
  );
}

function channel(account: GrowthAccount): string {
  const outcome = `${account.outcome.outcome} ${account.outcome.nextAction}`.toLowerCase();
  if (outcome.includes("linkedin")) return "Human-approved LinkedIn";
  if (outcome.includes("whatsapp")) return "Human-approved WhatsApp";
  if (outcome.includes("call") || outcome.includes("discovery")) {
    return "Discovery call";
  }
  return "Human-approved email";
}

export function calculateGrowthLearning(
  accounts: GrowthAccount[],
): GrowthLearningInsight {
  if (accounts.length === 0) {
    return {
      bestPerformingSegment: "Not enough data",
      bestPersona: "Not enough data",
      bestPainAngle: "Not enough data",
      bestChannel: "Not enough data",
      highestConvertingOffer: "Not enough data",
      weakSegment: "Not enough data",
      recommendedNextCampaign: "Capture more qualified outcomes",
      recommendedMessageChange: "Keep messages outcome-led and validate assumptions",
      confidenceScore: 0,
    };
  }

  const segments = ranked(accounts, (account) => account.segment);
  const personas = ranked(accounts, (account) => account.targetPersona);
  const pains = ranked(accounts, painAngle);
  const channels = ranked(accounts, channel);
  const offers = ranked(accounts, (account) => account.targetProductService);
  const bestSegment = segments[0]?.label ?? "Not enough data";
  const bestPersona = personas[0]?.label ?? "Not enough data";
  const bestPain = pains[0]?.label ?? "Not enough data";
  const weakSegment =
    segments.length > 1 ? segments[segments.length - 1].label : "Not enough data";
  const progressed = accounts.filter(
    (account) => STATUS_SCORE[account.outcome.status] >= 5,
  ).length;
  const confidenceScore = Math.min(
    95,
    Math.round(35 + accounts.length * 4 + progressed * 3),
  );

  return {
    bestPerformingSegment: bestSegment,
    bestPersona,
    bestPainAngle: bestPain,
    bestChannel: channels[0]?.label ?? "Not enough data",
    highestConvertingOffer: offers[0]?.label ?? "Not enough data",
    weakSegment,
    recommendedNextCampaign: `${bestSegment} campaign for ${bestPersona}`,
    recommendedMessageChange: `Lead with ${bestPain.toLowerCase()} and one measurable next step`,
    confidenceScore,
  };
}
