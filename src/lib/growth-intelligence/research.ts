import { generateGrowthIntelligence } from "@/lib/growth-intelligence/generator";
import type {
  GrowthAccountInput,
  GrowthContactCandidate,
  GrowthContactRoleCategory,
  GrowthPublicSignal,
  GrowthPublicSignalCategory,
  GrowthResearchInput,
  GrowthResearchResult,
  GrowthRiskAssessment,
} from "@/lib/growth-intelligence/types";

export const RESEARCH_FALLBACK_MESSAGE =
  "Automated public web research is not configured. Using supplied account details and safe diagnostic heuristics.";

const UNSAFE_RESEARCH =
  /certification guaranteed|certified|customer approved|regulatory approved|statutory approved|fully compliant|compliance built-in|guaranteed acceptance/i;
const UNSUPPORTED_METRIC = /\b\d{2,3}%\b|\b\d+x\b|\bguaranteed?\b/i;

const SIGNAL_KEYWORDS: Array<{
  category: GrowthPublicSignalCategory;
  pattern: RegExp;
  hypothesis: string;
}> = [
  {
    category: "Proposal / RFP complexity",
    pattern: /proposal|rfp|rfq|bid|tender|epc/,
    hypothesis:
      "Public or supplied context may indicate a complex proposal, RFP, or bid workflow to be validated.",
  },
  {
    category: "Operating visibility",
    pattern: /operations|erp|mis|cockpit|visibility|manufactur/,
    hypothesis:
      "Public signals may indicate an operating-visibility readiness hypothesis across systems and management reporting.",
  },
  {
    category: "Margin / productivity leakage",
    pattern: /margin|productivity|fabrication|execution|throughput/,
    hypothesis:
      "The operating model may indicate a margin or productivity mapping gap to be validated with evidence.",
  },
  {
    category: "Compliance and standards readiness",
    pattern: /compliance|quality|standards|audit/,
    hypothesis:
      "Public context may indicate a compliance and standards documentation-readiness review.",
  },
  {
    category: "ISO readiness",
    pattern: /\biso\b|quality management/,
    hypothesis:
      "ISO evidence may require a readiness and mapping review; no certification status is assumed.",
  },
  {
    category: "Technical standards mapping",
    pattern: /technical|drawing|specification|standards|tbe/,
    hypothesis:
      "Customer and technical standards may require evidence mapping across proposals and delivery workflows.",
  },
  {
    category: "Statutory document readiness",
    pattern: /statutory|license|document|registration/,
    hypothesis:
      "Statutory document readiness may need validation against current evidence and ownership.",
  },
  {
    category: "Vendor registration readiness",
    pattern: /vendor|registration|procurement/,
    hypothesis:
      "Vendor-registration evidence may indicate a readiness gap to be validated.",
  },
  {
    category: "Supplier qualification",
    pattern: /supplier|sourcing|procurement/,
    hypothesis:
      "Supplier qualification may require a public-signal-led evidence review.",
  },
  {
    category: "Subcontractor governance",
    pattern: /subcontractor|partner|ecosystem/,
    hypothesis:
      "Subcontractor governance may indicate documentation and ownership gaps to be validated.",
  },
  {
    category: "Customer prequalification readiness",
    pattern: /prequalification|customer requirement|approved vendor/,
    hypothesis:
      "Customer prequalification readiness may require requirement-to-evidence mapping.",
  },
  {
    category: "AI governance and output validation",
    pattern: /\bai\b|artificial intelligence|automation|traceability/,
    hypothesis:
      "AI-assisted work may need source traceability, output validation, human approval, and audit-trail readiness.",
  },
  {
    category: "Talent / delivery capacity",
    pattern: /talent|hiring|recruit|staffing|skills|capacity/,
    hypothesis:
      "Public signals may indicate a talent or delivery-capacity readiness hypothesis.",
  },
];

export async function researchAccount(
  input: GrowthResearchInput,
): Promise<GrowthResearchResult> {
  const text = [
    input.companyName,
    input.industry,
    input.segment,
    input.location,
    input.targetProductRoutePreference,
    input.knownRelationshipNote,
    input.publicSourceNotes,
    input.targetRole,
  ]
    .join(" ")
    .toLowerCase();
  const generated = generateGrowthIntelligence(researchToGrowthInput(input));
  const matched = SIGNAL_KEYWORDS.filter(({ pattern }) => pattern.test(text));
  const publicSignals: GrowthPublicSignal[] = (
    matched.length > 0
      ? matched
      : SIGNAL_KEYWORDS.filter(({ category }) =>
          [
            "Operating visibility",
            "Compliance and standards readiness",
            "AI governance and output validation",
          ].includes(category),
        )
  ).map(({ category, hypothesis }) => ({
    category,
    hypothesis,
    sourceNote:
      input.publicSourceNotes.trim() ||
      "Supplied account details only; public evidence needed.",
  }));
  const confidence =
    input.website.trim() && input.publicSourceNotes.trim()
      ? "Medium"
      : "Low";
  return {
    companyName: input.companyName.trim(),
    website: input.website.trim(),
    industry: input.industry.trim(),
    location: input.location.trim(),
    segment: input.segment.trim(),
    sizeBand: sizeBandFor(input.segment),
    productsOrServices: productsFor(input),
    likelyBusinessModel: generated.intelligence.likelyBusinessModel,
    publicSignals,
    likelyReadinessGaps: generated.intelligence.likelyReadinessGaps,
    diagnosticEntryAngle: generated.intelligence.diagnosticEntryAngle,
    bestDiagnosticPillar: generated.intelligence.bestDiagnosticPillar,
    recommendedProductRouteAfterDiagnostic:
      generated.intelligence.recommendedProductRouteAfterDiagnostic,
    confidence,
    sourceNotes: [
      input.website.trim()
        ? `Company website supplied: ${input.website.trim()}`
        : "Company website not supplied.",
      input.publicSourceNotes.trim() || "No public source notes supplied.",
      input.knownRelationshipNote.trim()
        ? "Existing relationship context supplied for manual verification."
        : "No known relationship context supplied.",
    ],
    evidenceNeeded: [
      "Public company website or approved company profile",
      "Current workflow and system ownership",
      "Approved examples of proposal, operating, compliance, supplier, or talent evidence",
      "Named contact and permission-to-contact verification",
    ],
    verificationStatus: "Needs Manual Verification",
    contactCandidates: [roleTargetContact(input)],
    providerMessage: RESEARCH_FALLBACK_MESSAGE,
  };
}

export function researchToGrowthInput(
  research: GrowthResearchInput | GrowthResearchResult,
): GrowthAccountInput {
  const isResult = "publicSignals" in research;
  const sourceText = isResult
    ? [
        ...research.sourceNotes,
        ...research.publicSignals.map(
          (signal) => `${signal.category}: ${signal.hypothesis}`,
        ),
        ...research.likelyReadinessGaps,
      ].join(" ")
    : [research.knownRelationshipNote, research.publicSourceNotes].join(" ");
  const route = isResult
    ? routeFromRecommendation(research.recommendedProductRouteAfterDiagnostic)
    : research.targetProductRoutePreference === "Unknown"
      ? "RightSense Consulting"
      : research.targetProductRoutePreference;
  const contact = isResult ? research.contactCandidates[0] : undefined;
  return {
    companyName: research.companyName.trim(),
    website: research.website.trim(),
    industry: research.industry.trim(),
    location: research.location.trim(),
    segment: research.segment.trim() || "Mid-market manufacturer",
    targetProductService: route,
    targetPersona: isResult ? contact?.title || "CEO / MD" : research.targetRole,
    contactName:
      contact?.name === "Role target, contact not identified"
        ? ""
        : contact?.name ?? "",
    contactRole: contact?.title ?? (isResult ? "" : research.targetRole),
    linkedInUrl: contact?.linkedInUrl ?? "",
    notes: sourceText.slice(0, 4000),
    mode: "rightsense",
  };
}

export function assessResearchRisk(
  result: GrowthResearchResult,
): GrowthRiskAssessment {
  const serialized = JSON.stringify(result);
  const flags: string[] = [];
  let blocked = false;
  if (!result.website) flags.push("Company website missing");
  if (result.confidence === "Low") flags.push("Research confidence is Low");
  if (
    !result.contactCandidates.some(
      (contact) =>
        contact.confidence === "High" &&
        contact.allowedToContact &&
        !contact.doNotContact,
    )
  ) {
    flags.push("No verified contact");
  }
  if (UNSUPPORTED_METRIC.test(serialized)) {
    flags.push("Unsupported metric claim detected");
    blocked = true;
  }
  if (/confidential internal|confidential data shows/i.test(serialized)) {
    flags.push("Confidential assumption detected");
    blocked = true;
  }
  if (UNSAFE_RESEARCH.test(serialized)) {
    flags.push("Certification or approval wording detected");
    blocked = true;
  }
  if (
    result.contactCandidates.some(
      (contact) =>
        Boolean(contact.email || contact.phone) &&
        contact.sourceType === "unknown",
    )
  ) {
    flags.push("Fabricated contact risk");
    blocked = true;
  }
  if (
    result.sourceNotes.every(
      (note) => !note || /not supplied|no public source/i.test(note),
    )
  ) {
    flags.push("No source note");
  }
  const status = blocked ? "Blocked" : flags.length > 0 ? "Needs Review" : "Pass";
  if (flags.length === 0) flags.push("Research checks passed");
  return {
    status,
    flags,
  };
}

function roleTargetContact(input: GrowthResearchInput): GrowthContactCandidate {
  return {
    id: `research-role-${slug(input.targetRole)}`,
    name: "Role target, contact not identified",
    title: input.targetRole,
    roleCategory: roleCategory(input.targetRole),
    email: "",
    phone: "",
    linkedInUrl: "",
    sourceUrl: input.website.trim(),
    sourceType: input.knownRelationshipNote.trim()
      ? "existing relationship"
      : input.website.trim()
        ? "website"
        : "unknown",
    confidence: "Low",
    verificationNote:
      "Role target only. Email and phone not found / needs manual verification.",
    lastCheckedDate: new Date().toISOString().slice(0, 10),
    allowedToContact: false,
    doNotContact: false,
  };
}

function roleCategory(role: string): GrowthContactRoleCategory {
  if (/CEO|MD|CFO|CIO/.test(role)) return "CXO";
  if (role === "Sales Head") return "Sales Head";
  if (role === "Proposal Head") return "Proposal Head";
  if (role === "COO") return "Operations";
  if (/Quality|Compliance/.test(role)) return "Quality/Compliance";
  if (role === "HR") return "HR/Talent";
  return "Other";
}

function sizeBandFor(segment: string): string {
  if (/large|enterprise/i.test(segment)) return "Large enterprise hypothesis";
  if (/growth|small|startup/i.test(segment)) return "Growth-stage hypothesis";
  return "Mid-market hypothesis";
}

function productsFor(input: GrowthResearchInput): string[] {
  const values = [input.industry.trim()];
  if (input.targetProductRoutePreference !== "Unknown") {
    values.push(
      `Potential post-diagnostic route: ${input.targetProductRoutePreference}`,
    );
  }
  return values.filter(Boolean);
}

function routeFromRecommendation(value: string): GrowthAccountInput["targetProductService"] {
  for (const route of [
    "WinsProposal",
    "PulseIQ",
    "TalentPulse",
    "RightSense Consulting",
  ]) {
    if (value.includes(route)) return route;
  }
  return "RightSense Consulting";
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
