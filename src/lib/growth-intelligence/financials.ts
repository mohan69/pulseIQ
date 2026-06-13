import type {
  GrowthAccountInput,
  GrowthEntityMatchStatus,
  GrowthFinancialSignals,
  GrowthPublicContextProfile,
} from "@/lib/growth-intelligence/types";

export type GrowthFinancialCandidate = {
  companyName: string;
  revenue?: string;
  revenueRange?: string;
  sourceName: string;
  sourceUrl?: string;
  financialYear?: string;
  website?: string;
  cin?: string;
  location?: string;
  directors?: string[];
  sourceIdentity?: string;
};

type EntityIdentity = {
  companyName: string;
  website?: string;
  cin?: string;
  location?: string;
  directors?: string[];
  sourceIdentity?: string;
};

export const DECON_INTERNAL_DATA_REQUEST = [
  "Revenue",
  "Gross margin",
  "EBITDA",
  "Order book",
  "AR / AP / inventory",
  "Proposal pipeline",
  "Top customers",
  "Product-family revenue / margin",
] as const;

export const DECON_PUBLIC_CONTEXT_PROFILE: GrowthPublicContextProfile = {
  website: "https://decontechnologies.com/",
  industry: "Oil & Gas / engineered manufacturing / global sourcing",
  location: "Vadodara, Gujarat",
  employeeSignal: "51-200 employees",
  employeeSource: "LinkedIn public company profile",
  certifications: ["ISO 9001:2015", "ISO 45001:2018"],
  certificationSource: "Company website and LinkedIn public profile",
  certificationValidationNote:
    "Public profile signal only; certificate scope, validity, and legal entity require manual validation.",
  recommendedInternalDataRequest: [...DECON_INTERNAL_DATA_REQUEST],
};

const DEFAULT_GUIDANCE = [
  "No reliable public financials found. Use this as a qualification and diagnostic target, not a financial benchmark.",
  "Ask for internal data under NDA for 48-hour diagnostic.",
];

export function financialSignalsForAccount(
  input: GrowthAccountInput,
): {
  financialSignals: GrowthFinancialSignals;
  publicContextProfile?: GrowthPublicContextProfile;
} {
  if (isDeconManualProfile(input)) {
    return {
      financialSignals: {
        state: "Financials not found",
        revenue: "Not found",
        sourceName: "Decon Technologies public website",
        sourceUrl: "https://decontechnologies.com/",
        financialYear: "Not available",
        confidence: "Low",
        entityMatchStatus: "Confirmed",
        validationNote:
          "No reliable revenue value or range was found in the reviewed public website. Do not substitute financials from Docon, Deacon, or other similarly named entities.",
        guidance: DEFAULT_GUIDANCE,
      },
      publicContextProfile: DECON_PUBLIC_CONTEXT_PROFILE,
    };
  }

  return {
    financialSignals: {
      state: "Requires internal validation",
      revenue: "Not available",
      sourceName: "No verified public financial source attached",
      sourceUrl: "",
      financialYear: "Not available",
      confidence: "Low",
      entityMatchStatus: "Unconfirmed",
      validationNote:
        "Financial values must be supported by a source tied to the same legal or operating entity before use.",
      guidance: DEFAULT_GUIDANCE,
    },
  };
}

export function resolveFinancialCandidate(
  target: EntityIdentity,
  candidate: GrowthFinancialCandidate,
): GrowthFinancialSignals {
  const entityMatchStatus = assessEntityMatch(target, candidate);
  if (entityMatchStatus === "Ambiguous") {
    return {
      state: "Entity ambiguity detected",
      revenue: "Not used",
      sourceName: candidate.sourceName,
      sourceUrl: candidate.sourceUrl ?? "",
      financialYear: candidate.financialYear ?? "Not available",
      confidence: "Low",
      entityMatchStatus,
      validationNote: `Financials for ${candidate.companyName} were excluded because website, CIN, location, directors, or source identity did not confirm a match to ${target.companyName}.`,
      guidance: DEFAULT_GUIDANCE,
    };
  }

  const revenue = candidate.revenue?.trim();
  const revenueRange = candidate.revenueRange?.trim();
  if (revenue) {
    return {
      state: "Financials found",
      revenue,
      sourceName: candidate.sourceName,
      sourceUrl: candidate.sourceUrl ?? "",
      financialYear: candidate.financialYear ?? "Not specified",
      confidence: entityMatchStatus === "Confirmed" ? "High" : "Medium",
      entityMatchStatus,
      validationNote:
        "Public financial signal matched to the target entity; validate against approved internal records before decisioning.",
      guidance: [
        "Use public financials as directional qualification context only.",
        "Ask for internal data under NDA for 48-hour diagnostic.",
      ],
    };
  }
  if (revenueRange) {
    return {
      state: "Financial range only",
      revenue: revenueRange,
      sourceName: candidate.sourceName,
      sourceUrl: candidate.sourceUrl ?? "",
      financialYear: candidate.financialYear ?? "Not specified",
      confidence: "Medium",
      entityMatchStatus,
      validationNote:
        "Only a public revenue range is available; do not present it as audited or exact revenue.",
      guidance: [
        "Use the range for qualification context, not financial benchmarking.",
        "Ask for internal data under NDA for 48-hour diagnostic.",
      ],
    };
  }

  return {
    state: "Financials not found",
    revenue: "Not found",
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl ?? "",
    financialYear: candidate.financialYear ?? "Not available",
    confidence: "Low",
    entityMatchStatus,
    validationNote:
      "The reviewed matched source did not provide a reliable revenue value or range.",
    guidance: DEFAULT_GUIDANCE,
  };
}

export function assessEntityMatch(
  target: EntityIdentity,
  candidate: EntityIdentity,
): GrowthEntityMatchStatus {
  const sameName =
    normalizeCompanyName(target.companyName) ===
    normalizeCompanyName(candidate.companyName);
  const identityMatches = [
    exactMatch(normalizeWebsite(target.website), normalizeWebsite(candidate.website)),
    exactMatch(normalizeText(target.cin), normalizeText(candidate.cin)),
    exactMatch(normalizeText(target.location), normalizeText(candidate.location)),
    directorsOverlap(target.directors, candidate.directors),
    exactMatch(
      normalizeText(target.sourceIdentity),
      normalizeText(candidate.sourceIdentity),
    ),
  ].filter(Boolean).length;

  if (sameName && identityMatches > 0) return "Confirmed";
  if (!sameName && identityMatches > 0) return "Confirmed";
  if (sameName) return "Probable";
  return "Ambiguous";
}

function isDeconManualProfile(input: GrowthAccountInput): boolean {
  return (
    normalizeCompanyName(input.companyName) === "decon technologies" &&
    normalizeWebsite(input.website) === "decontechnologies.com"
  );
}

function normalizeCompanyName(value: string): string {
  return value
    .toLowerCase()
    .replace(
      /\b(private limited|pvt ltd|pvt limited|limited|ltd|llp|incorporated|inc)\b/g,
      "",
    )
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeWebsite(value = ""): string {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

function normalizeText(value = ""): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function exactMatch(left: string, right: string): boolean {
  return Boolean(left && right && left === right);
}

function directorsOverlap(left: string[] = [], right: string[] = []): boolean {
  const normalized = new Set(left.map(normalizeText).filter(Boolean));
  return right.some((director) => normalized.has(normalizeText(director)));
}
