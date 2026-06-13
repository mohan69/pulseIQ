import { DIAGNOSTIC_PILLARS } from "@/lib/diagnostic-positioning";
import { financialSignalsForAccount } from "@/lib/growth-intelligence/financials";
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
  "bid",
  "tbe",
  "technical compliance",
  "standards mapping",
];
const PULSE_IQ_KEYWORDS = [
  "manufacturing",
  "fabrication",
  "erp",
  "mis",
  "margin",
  "productivity",
  "execution",
  "operating visibility",
  "cockpit",
  "truth map",
];
const TALENT_PULSE_KEYWORDS = [
  "recruitment",
  "hiring",
  "talent",
  "hr",
  "skills",
  "staffing",
  "capacity",
];
const COMPLIANCE_KEYWORDS = [
  "compliance",
  "iso",
  "standards",
  "statutory",
  "audit",
  "prequalification",
  "documentation",
];
const VENDOR_KEYWORDS = [
  "vendor",
  "supplier",
  "subcontractor",
  "procurement",
  "registration",
  "partner",
  "ecosystem",
];
const AI_GOVERNANCE_KEYWORDS = [
  "ai",
  "governance",
  "validation",
  "traceability",
  "approval workflow",
  "audit trail",
  "prompt",
  "output review",
];

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
      angle:
        "enterprise truth, profitable growth, readiness risk, and a low-risk execution path",
      priority:
        "profitable growth, operating visibility, and enterprise readiness",
      personaFitBoost: 14,
    };
  }
  if (/(coo|operations|plant head)/.test(normalized)) {
    return {
      angle:
        "operating visibility, margin/productivity leakage, supplier readiness, and execution control",
      priority:
        "execution reliability, productivity, and supplier ecosystem readiness",
      personaFitBoost: 13,
    };
  }
  if (
    /(sales head|proposal head|business development|commercial)/.test(
      normalized,
    )
  ) {
    return {
      angle:
        "proposal workflow, standards mapping, prequalification readiness, and conversion",
      priority:
        "faster proposal response with stronger technical and documentation readiness",
      personaFitBoost: 15,
    };
  }
  if (/(hr|talent|ta|people)/.test(normalized)) {
    return {
      angle:
        "hiring productivity, skills visibility, capacity, and delivery readiness",
      priority: "improving talent throughput and delivery capacity",
      personaFitBoost: 15,
    };
  }
  return {
    angle:
      "measurable business outcomes, evidence readiness, and execution confidence",
    priority: "turning enterprise readiness gaps into measurable outcomes",
    personaFitBoost: 8,
  };
}

function getCompanyDescriptor(input: GrowthAccountInput): string {
  const segment = input.segment || "B2B industrial";
  const industry = input.industry || "industrial";
  const location = input.location ? ` based in ${input.location}` : "";
  return `${segment} ${industry} company${location}`;
}

function productRoute(
  winsHits: number,
  pulseHits: number,
  talentHits: number,
  governanceHits: number,
): "WinsProposal" | "PulseIQ" | "TalentPulse" | "RightSense Consulting" {
  if (talentHits > winsHits && talentHits > pulseHits) return "TalentPulse";
  if (winsHits >= pulseHits && winsHits > 0) return "WinsProposal";
  if (pulseHits > 0) return "PulseIQ";
  if (governanceHits > 0) return "RightSense Consulting";
  return "RightSense Consulting";
}

function diagnosticPillar(
  winsHits: number,
  pulseHits: number,
  talentHits: number,
  complianceHits: number,
  vendorHits: number,
  governanceHits: number,
): (typeof DIAGNOSTIC_PILLARS)[number] {
  const ranked = [
    { pillar: DIAGNOSTIC_PILLARS[0], score: winsHits },
    { pillar: DIAGNOSTIC_PILLARS[1], score: pulseHits },
    { pillar: DIAGNOSTIC_PILLARS[2], score: pulseHits + talentHits * 0.5 },
    { pillar: DIAGNOSTIC_PILLARS[3], score: complianceHits },
    { pillar: DIAGNOSTIC_PILLARS[4], score: vendorHits },
    { pillar: DIAGNOSTIC_PILLARS[5], score: governanceHits },
  ].sort((a, b) => b.score - a.score);
  return ranked[0]?.score > 0
    ? ranked[0].pillar
    : "Operating Intelligence";
}

function readinessGaps(input: {
  winsHits: number;
  pulseHits: number;
  talentHits: number;
  complianceHits: number;
  vendorHits: number;
  governanceHits: number;
}): string[] {
  const gaps: string[] = [];
  if (input.winsHits > 0) {
    gaps.push(
      "Customer standards mapping and proposal audit-trail gap review",
      "Customer prequalification documentation readiness",
    );
  }
  if (input.pulseHits > 0) {
    gaps.push(
      "Operating source traceability and management cockpit evidence status",
      "Margin and productivity leakage mapping",
    );
  }
  if (input.talentHits > 0) {
    gaps.push(
      "Skills, capacity, staffing, and delivery-readiness evidence status",
    );
  }
  if (input.complianceHits > 0) {
    gaps.push(
      "ISO readiness and technical standards mapping gaps",
      "Statutory document and audit evidence readiness gaps",
    );
  }
  if (input.vendorHits > 0) {
    gaps.push(
      "Vendor registration and supplier qualification gaps",
      "Subcontractor governance and ecosystem documentation gaps",
    );
  }
  if (input.governanceHits > 0) {
    gaps.push(
      "AI output validation and human approval workflow gaps",
      "Source traceability, prompt/output review, and audit-trail gaps",
    );
  }
  if (gaps.length === 0) {
    gaps.push(
      "Operating and commercial evidence status requires validation",
      "Compliance, standards, vendor, and AI governance readiness require a focused gap review",
    );
  }
  return [...new Set(gaps)].slice(0, 12);
}

export function generateGrowthIntelligence(
  input: GrowthAccountInput,
): GrowthGenerationResult {
  const financialContext = financialSignalsForAccount(input);
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
  const complianceHits = keywordHits(sourceText, COMPLIANCE_KEYWORDS);
  const vendorHits = keywordHits(sourceText, VENDOR_KEYWORDS);
  const governanceHits = keywordHits(sourceText, AI_GOVERNANCE_KEYWORDS);
  const persona = personaGuidance(
    `${input.targetPersona} ${input.contactRole}`,
  );
  const offset = stableOffset(sourceText, 9);
  const route = financialContext.publicContextProfile
    ? "PulseIQ"
    : productRoute(
        winsHits,
        pulseHits,
        talentHits,
        governanceHits,
      );
  const pillar = diagnosticPillar(
    winsHits,
    pulseHits,
    talentHits,
    complianceHits,
    vendorHits,
    governanceHits,
  );
  const gaps = readinessGaps({
    winsHits,
    pulseHits,
    talentHits,
    complianceHits,
    vendorHits,
    governanceHits,
  });
  const productSignal = Math.max(winsHits, pulseHits, talentHits, 1);
  const diagnosticSignal =
    winsHits +
    pulseHits +
    talentHits +
    complianceHits +
    vendorHits +
    governanceHits;
  const fitScores: GrowthFitScores = {
    diagnosticFit: clamp(
      58 + Math.min(28, diagnosticSignal * 3) + persona.personaFitBoost / 2,
    ),
    complianceStandardsSignal: clamp(
      42 + complianceHits * 11 + winsHits * 3 + offset,
    ),
    vendorSupplierReadinessSignal: clamp(
      40 + vendorHits * 12 + pulseHits * 2 + offset,
    ),
    aiGovernanceSignal: clamp(
      38 + governanceHits * 13 + diagnosticSignal + offset,
    ),
    productRouteFit: clamp(55 + productSignal * 8 + offset),
    commercialReadiness: clamp(
      50 +
        keywordHits(sourceText, [
          "urgent",
          "growth",
          "margin",
          "rfq",
          "tender",
          "hiring",
          "execution",
          "pilot",
        ]) *
          5 +
        persona.personaFitBoost +
        offset,
    ),
  };

  const dominantSignal =
    winsHits >= pulseHits && winsHits >= talentHits
      ? "proposal, standards, and prequalification readiness"
      : talentHits > pulseHits
        ? "talent capacity and delivery readiness"
        : "operating visibility and margin/productivity leakage";
  const companyDescriptor = getCompanyDescriptor(input);
  const bestPersona =
    input.targetPersona || input.contactRole || "Business Function Leader";
  const diagnosticName =
    input.mode === "rightsense"
      ? "the RightSense 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic"
      : "a focused 48-hour enterprise intelligence, compliance & standards diagnostic";
  const routeLabel =
    input.mode === "rightsense"
      ? route
      : "the most relevant operating, proposal, talent, or consulting solution";
  const intelligence: GrowthAccountIntelligence = {
    companySummary: `${input.companyName} is a ${companyDescriptor}. Public and approved account context suggests a potential diagnostic conversation without assuming access to confidential company data.`,
    likelyBusinessModel: `B2B revenue generated through ${
      /epc|project|tender|rfq/.test(sourceText)
        ? "project, tender, specification, and customer-prequalification-led sales cycles"
        : /recruitment|talent|hiring/.test(sourceText)
          ? "client mandates, talent delivery, staffing capacity, and relationship-led services"
          : "industrial products or services sold through direct, vendor, supplier, and channel-led enterprise relationships"
    }.`,
    businessPriorities: [
      persona.priority,
      `Improve ${dominantSignal}`,
      "Create an evidence-backed 30-day pilot decision path",
    ],
    painSignals: gaps,
    diagnosticEntryAngle: `Offer ${diagnosticName} to validate ${dominantSignal}, evidence status, ownership, and a practical 30/60/90 execution path.`,
    likelyReadinessGaps: gaps,
    bestDiagnosticPillar: pillar,
    recommendedProductRouteAfterDiagnostic: `Likely product route: ${routeLabel}. Confirm only after diagnostic evidence review.`,
    buyingTriggerHypothesis: `A leadership review, active ${
      winsHits > 0
        ? "RFQ, tender, standards-mapping, or prequalification cycle"
        : talentHits > 0
          ? "hiring, staffing, skills, or delivery-capacity mandate"
          : "performance, compliance, supplier, or AI governance initiative"
    } could create urgency for a focused diagnostic.`,
    bestPersonaToApproach: bestPersona,
    conversationAngle: `Lead with ${persona.angle}; validate current workflows, systems, evidence, and readiness gaps before recommending ${routeLabel}.`,
    recommendedNextAction: `Offer the RightSense 48-Hour Diagnostic. Then validate the likely product route: ${route}. Personalize one draft and obtain human approval before outreach to ${bestPersona}.`,
    financialSignals: financialContext.financialSignals,
    publicContextProfile: financialContext.publicContextProfile,
  };

  const rightSenseFitScores: RightSenseFitScores | undefined =
    input.mode === "rightsense"
      ? {
          pulseIQ: clamp(48 + pulseHits * 10 + offset),
          winsProposal: clamp(46 + winsHits * 10 + offset),
          talentPulse: clamp(42 + talentHits * 13 + offset),
          rightSenseConsulting: clamp(
            60 +
              Math.min(
                24,
                (complianceHits + vendorHits + governanceHits) * 4,
              ) +
              offset,
          ),
        }
      : undefined;

  const greeting = input.contactName
    ? `Hi ${input.contactName.split(" ")[0]},`
    : "Hello,";
  const accountReference = input.companyName || "your organization";
  const reviewLabel =
    "DRAFT - HUMAN REVIEW REQUIRED\nNO AUTOMATED SENDING\nPUBLIC OR APPROVED CONTEXT ONLY - NO CONFIDENTIAL DATA ACCESS ASSUMED\n\n";
  const signature =
    input.mode === "rightsense"
      ? "Regards,\nMohan Babu\nCo-Founder, RightSense Technologies"
      : "Regards,\nGrowth Team";
  const diagnosticIntro =
    input.mode === "rightsense"
      ? "RightSense is offering a focused 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic for industrial and project-driven companies."
      : "We are offering a focused 48-hour enterprise intelligence, compliance & standards diagnostic for industrial and project-driven companies.";
  const diagnosticUseCase = `For teams dealing with proposal execution, standards mapping, vendor/supplier documentation, operating visibility, talent delivery readiness, or AI governance readiness, the diagnostic identifies practical gaps and a low-risk execution path.`;

  const outreachDrafts: GrowthOutreachDrafts = {
    cxoEmail: `${reviewLabel}${greeting}\n\n${diagnosticIntro} ${diagnosticUseCase}\n\nBased only on public or approved context for ${accountReference}, a useful entry angle may be ${pillar.toLowerCase()}. Would a 20-minute conversation be useful to test whether the 48-hour diagnostic is relevant?\n\nNo confidential data access is assumed, and any next step remains subject to human review.\n\n${signature}`,
    functionalLeaderEmail: `${reviewLabel}${greeting}\n\n${diagnosticIntro}\n\nFor ${accountReference}, the likely starting point is a gap review around ${dominantSignal}. We would first map the current workflow, systems, evidence status, and ownership; only after that would we recommend a product or pilot route.\n\nWould a short diagnostic-fit discussion be relevant?\n\n${signature}`,
    linkedInNote: `${reviewLabel}Hello${input.contactName ? ` ${input.contactName.split(" ")[0]}` : ""} - I work with industrial teams on focused 48-hour diagnostics covering operating intelligence, compliance and standards readiness, supplier documentation, proposal workflows, and AI governance. I would value connecting and comparing notes on ${accountReference}'s current priorities.\n\n${signature}`,
    whatsappMessage: `${reviewLabel}${greeting} I have prepared a short, public-context diagnostic angle for ${accountReference} covering ${pillar.toLowerCase()}. May I share the review note? Nothing is sent or actioned automatically.\n\n${signature}`,
    followUpMessage: `${reviewLabel}${greeting}\n\nFollowing up on the 48-hour diagnostic note. I can share a one-page view of likely readiness gaps, assumptions, and a low-risk evidence review for ${accountReference}. No confidential data access, automated outreach, or product commitment is assumed.\n\n${signature}`,
    discoveryCallBrief: `${reviewLabel}Objective: validate fit for ${diagnosticName} before recommending any product route.\n\nAsk:\n1. Which revenue, proposal, RFP, bid, or customer-prequalification workflows matter most now?\n2. Where is operating visibility weak across finance, delivery, quality, or management reporting?\n3. Where might margin or productivity leakage occur?\n4. What compliance, ISO, technical standards, statutory document, or audit evidence readiness gaps are visible?\n5. How are suppliers, subcontractors, vendor registration, and customer prequalification managed?\n6. How are AI outputs validated, traced to sources, reviewed, and approved by people?\n7. Which systems and approved data sources support these workflows today?\n8. What measurable result would make a 30-day pilot worth approving?\n\nDo not present assumptions as facts. Confirm data-use approval before requesting sensitive information. No automated sending or irreversible action is permitted.\n\n${signature}`,
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
    (scores.diagnosticFit +
      scores.complianceStandardsSignal +
      scores.vendorSupplierReadinessSignal +
      scores.aiGovernanceSignal +
      scores.productRouteFit +
      scores.commercialReadiness) /
      6,
  );
}
