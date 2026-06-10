import type {
  GrowthAccountInput,
  GrowthAccountIntelligence,
  GrowthFitScores,
  GrowthOutreachDrafts,
  RightSenseFitScores,
} from "@/lib/growth-intelligence/types";

type GrowthGenerationResult = {
  intelligence: GrowthAccountIntelligence;
  fitScores: GrowthFitScores;
  rightSenseFitScores?: RightSenseFitScores;
  outreachDrafts: GrowthOutreachDrafts;
};

const WINS_PROPOSAL_KEYWORDS = [
  "valve",
  "epc",
  "rfq",
  "tender",
  "proposal",
  "drawing",
  "compliance",
];
const PULSE_IQ_KEYWORDS = [
  "manufacturing",
  "fabrication",
  "erp",
  "mis",
  "margin",
  "productivity",
  "execution",
];
const TALENT_PULSE_KEYWORDS = ["recruitment", "hiring", "talent", "hr"];

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function stableOffset(value: string, range: number): number {
  const total = Array.from(value.toLowerCase()).reduce(
    (sum, character, index) => sum + character.charCodeAt(0) * (index + 1),
    0,
  );
  return total % range;
}

function keywordHits(text: string, keywords: string[]): number {
  return keywords.filter((keyword) => text.includes(keyword)).length;
}

function personaGuidance(persona: string): {
  angle: string;
  priority: string;
  personaFitBoost: number;
} {
  const normalized = persona.toLowerCase();
  if (/(ceo|md|founder|managing director)/.test(normalized)) {
    return {
      angle: "revenue, margin, growth, and management visibility",
      priority: "profitable growth and clearer operating visibility",
      personaFitBoost: 14,
    };
  }
  if (/(coo|operations|plant head)/.test(normalized)) {
    return {
      angle: "productivity, execution reliability, and operating control",
      priority: "execution speed and predictable operational performance",
      personaFitBoost: 13,
    };
  }
  if (/(sales head|proposal head|business development|commercial)/.test(normalized)) {
    return {
      angle: "proposal speed, bid readiness, and conversion",
      priority: "faster bid response and stronger conversion discipline",
      personaFitBoost: 15,
    };
  }
  if (/(hr|talent|ta|people)/.test(normalized)) {
    return {
      angle: "hiring productivity, talent visibility, and workforce readiness",
      priority: "improving hiring throughput and talent decisions",
      personaFitBoost: 15,
    };
  }
  return {
    angle: "measurable business outcomes, execution confidence, and visibility",
    priority: "turning operational priorities into measurable outcomes",
    personaFitBoost: 8,
  };
}

function getCompanyDescriptor(input: GrowthAccountInput): string {
  const segment = input.segment || "B2B industrial";
  const industry = input.industry || "industrial";
  const location = input.location ? ` based in ${input.location}` : "";
  return `${segment} ${industry} company${location}`;
}

function getSafeTargetProduct(input: GrowthAccountInput): string {
  const targetProduct =
    input.targetProductService.trim() || "the selected growth solution";
  if (
    input.mode === "customer" &&
    /^(pulseiq|winsproposal|talentpulse|rightsense consulting)$/i.test(
      targetProduct,
    )
  ) {
    return "the selected growth solution";
  }
  return targetProduct;
}

export function generateGrowthIntelligence(
  input: GrowthAccountInput,
): GrowthGenerationResult {
  const sourceText = [
    input.companyName,
    input.industry,
    input.segment,
    input.targetProductService,
    input.targetPersona,
    input.contactRole,
    input.notes,
  ]
    .join(" ")
    .toLowerCase();
  const winsHits = keywordHits(sourceText, WINS_PROPOSAL_KEYWORDS);
  const pulseHits = keywordHits(sourceText, PULSE_IQ_KEYWORDS);
  const talentHits = keywordHits(sourceText, TALENT_PULSE_KEYWORDS);
  const persona = personaGuidance(
    `${input.targetPersona} ${input.contactRole}`,
  );
  const offset = stableOffset(sourceText, 9);
  const productSignal = Math.max(winsHits, pulseHits, talentHits);
  const productFit = clamp(61 + productSignal * 7 + offset);
  const urgencyFit = clamp(
    54 +
      keywordHits(sourceText, [
        "urgent",
        "growth",
        "margin",
        "rfq",
        "tender",
        "hiring",
        "execution",
      ]) *
        5 +
      offset,
  );
  const fitScores: GrowthFitScores = {
    productFit,
    urgencyFit,
    personaFit: clamp(63 + persona.personaFitBoost + (offset % 5)),
    revenuePotential: clamp(
      59 +
        (/(enterprise|large|strategic|epc|oem)/.test(sourceText) ? 14 : 5) +
        offset,
    ),
    conversionProbability: clamp(
      (productFit + urgencyFit + 62 + persona.personaFitBoost) / 4,
    ),
    strategicFit: clamp(
      64 + Math.min(18, (winsHits + pulseHits + talentHits) * 4) + offset,
    ),
  };

  const dominantSignal =
    winsHits >= pulseHits && winsHits >= talentHits
      ? "proposal and bid execution"
      : talentHits > pulseHits
        ? "talent acquisition productivity"
        : "operating performance and management visibility";
  const companyDescriptor = getCompanyDescriptor(input);
  const targetProduct = getSafeTargetProduct(input);
  const bestPersona =
    input.targetPersona || input.contactRole || "Business Function Leader";
  const intelligence: GrowthAccountIntelligence = {
    companySummary: `${input.companyName} is a ${companyDescriptor}. The available account signals suggest an opportunity to connect ${targetProduct} to near-term business outcomes without assuming access to confidential company data.`,
    likelyBusinessModel: `B2B revenue generated through ${
      /epc|project|tender|rfq/.test(sourceText)
        ? "project, tender, and specification-led sales cycles"
        : /recruitment|talent|hiring/.test(sourceText)
          ? "client mandates, talent delivery, and relationship-led services"
          : "industrial products or services sold through direct and channel-led enterprise relationships"
    }.`,
    businessPriorities: [
      persona.priority,
      `Improve ${dominantSignal}`,
      `Create a clearer path from account activity to ${targetProduct} outcomes`,
    ],
    painSignals: [
      `${dominantSignal} may depend on fragmented follow-up and manual coordination`,
      "Decision-makers may lack a consistent view of priority actions and commercial progress",
      "Growth opportunities can lose momentum when ownership and next steps are unclear",
    ],
    buyingTriggerHypothesis: `A new growth target, active ${
      winsHits > 0
        ? "RFQ or tender pipeline"
        : talentHits > 0
          ? "hiring mandate"
          : "performance improvement initiative"
    }, or leadership review could create urgency for ${targetProduct}.`,
    bestPersonaToApproach: bestPersona,
    conversationAngle: `Lead with ${persona.angle}; validate the current workflow before positioning a solution.`,
    recommendedNextAction: `Review the discovery brief, personalize one draft, and obtain human approval before any outreach to ${bestPersona}.`,
  };

  const rightSenseFitScores: RightSenseFitScores | undefined =
    input.mode === "rightsense"
      ? {
          pulseIQ: clamp(48 + pulseHits * 10 + offset),
          winsProposal: clamp(46 + winsHits * 10 + offset),
          talentPulse: clamp(42 + talentHits * 13 + offset),
          rightSenseConsulting: clamp(
            58 +
              Math.min(18, (winsHits + pulseHits + talentHits) * 3) +
              offset,
          ),
        }
      : undefined;

  const greeting = input.contactName
    ? `Hi ${input.contactName.split(" ")[0]},`
    : "Hello,";
  const accountReference = input.companyName || "your organization";
  const reviewLabel = "DRAFT - HUMAN REVIEW REQUIRED\n\n";
  const signature =
    input.mode === "rightsense"
      ? "Regards,\nMohan Babu\nFounder, RightSense Technologies"
      : "Regards,\nGrowth Team";
  const outreachDrafts: GrowthOutreachDrafts = {
    cxoEmail: `${reviewLabel}${greeting}\n\nWe are seeing industrial growth teams focus on ${persona.priority}. Based on the public account context for ${accountReference}, there may be a practical opportunity to improve ${dominantSignal} with ${targetProduct}.\n\nWould a 20-minute working conversation be useful to compare priorities and identify one measurable pilot outcome?\n\n${signature}`,
    functionalLeaderEmail: `${reviewLabel}${greeting}\n\nI wanted to share a focused idea for ${accountReference}: use ${targetProduct} to strengthen ${dominantSignal} while keeping ownership and next actions visible to the team.\n\nWe would first map the current process, quantify the friction, and only then suggest a small next step. Would a short discovery discussion be relevant?\n\n${signature}`,
    linkedInNote: `${reviewLabel}Hello${input.contactName ? ` ${input.contactName.split(" ")[0]}` : ""} - I work with B2B industrial teams on ${dominantSignal}. I would value connecting and exchanging notes on how ${accountReference} is approaching ${persona.priority}.\n\n${signature}`,
    whatsappMessage: `${reviewLabel}${greeting} I have prepared a brief idea on how ${targetProduct} could support ${persona.priority} at ${accountReference}. May I share a short discovery note?\n\n${signature}`,
    followUpMessage: `${reviewLabel}${greeting}\n\nFollowing up on the note about ${persona.priority}. I can share a one-page view of the likely opportunity, assumptions, and a low-risk discovery path for ${accountReference}. No automated outreach or commitment is involved.\n\n${signature}`,
    discoveryCallBrief: `${reviewLabel}Objective: validate whether ${dominantSignal} is a priority.\n\nAsk:\n1. What growth or execution outcome matters most this quarter?\n2. Where does the current workflow slow down or lose visibility?\n3. Which teams and systems are involved today?\n4. What would make a pilot worth approving?\n\nDo not present assumptions as facts. Confirm data-use approval before requesting sensitive information.\n\n${signature}`,
  };

  return {
    intelligence,
    fitScores,
    rightSenseFitScores,
    outreachDrafts,
  };
}

export function getCompositeFitScore(scores: GrowthFitScores): number {
  return clamp(
    (scores.productFit +
      scores.urgencyFit +
      scores.personaFit +
      scores.revenuePotential +
      scores.conversionProbability +
      scores.strategicFit) /
      6,
  );
}
