import { getCompositeFitScore } from "@/lib/growth-intelligence/generator";
import type {
  GrowthAccount,
  GrowthApprovalQueueItem,
  GrowthApprovalStatus,
  GrowthContactCandidate,
  GrowthContactRoleCategory,
  GrowthControlMetrics,
  GrowthControlState,
  GrowthDiscoveryBrief,
  GrowthDraftType,
  GrowthExecutionPack,
  GrowthFollowUpPlan,
  GrowthReplyClassification,
} from "@/lib/growth-intelligence/types";

export const GROWTH_DRAFT_LABELS: Record<GrowthDraftType, string> = {
  cxoEmail: "CXO Email",
  functionalLeaderEmail: "Functional Leader Email",
  linkedInNote: "LinkedIn Note",
  whatsappMessage: "WhatsApp Message",
  followUpMessage: "Follow-up Message",
};

const UNSAFE_CLAIMS =
  /certification guaranteed|customer approved|regulatory approved|statutory approved|fully compliant|compliance built-in|guaranteed acceptance|tender-ready/i;

export function emptyGrowthControlState(): GrowthControlState {
  return { version: 2, drafts: {}, contacts: [] };
}

export function normalizeGrowthControlState(value: unknown): GrowthControlState {
  if (!value || typeof value !== "object") return emptyGrowthControlState();
  const candidate = value as Partial<GrowthControlState>;
  return {
    version: 2,
    drafts:
      candidate.drafts && typeof candidate.drafts === "object"
        ? candidate.drafts
        : {},
    contacts: Array.isArray(candidate.contacts) ? candidate.contacts : [],
    preferredContactId:
      typeof candidate.preferredContactId === "string"
        ? candidate.preferredContactId
        : undefined,
    emailTracking:
      candidate.emailTracking && typeof candidate.emailTracking === "object"
        ? candidate.emailTracking
        : undefined,
  };
}

function contactRoleCategory(account: GrowthAccount): GrowthContactRoleCategory {
  const role = `${account.targetPersona} ${account.contactRole}`.toLowerCase();
  if (/ceo|md|founder|chief|managing director/.test(role)) return "CXO";
  if (/proposal|bid|tender/.test(role)) return "Proposal Head";
  if (/sales|business development|commercial/.test(role)) return "Sales Head";
  if (/operations|coo|plant/.test(role)) return "Operations";
  if (/quality|compliance|standards/.test(role)) return "Quality/Compliance";
  if (/hr|talent|recruit|people/.test(role)) return "HR/Talent";
  return "Other";
}

export function contactCandidatesFor(
  account: GrowthAccount,
): GrowthContactCandidate[] {
  if (account.controlState.contacts.length > 0) {
    return account.controlState.contacts;
  }
  return [
    {
      id: `${account.id}-primary-contact`,
      name: account.contactName,
      title: account.contactRole || account.targetPersona,
      roleCategory: contactRoleCategory(account),
      email: "",
      phone: "",
      linkedInUrl: account.linkedInUrl,
      sourceUrl: account.linkedInUrl || account.website,
      confidence: account.linkedInUrl ? "Medium" : "Low",
      verificationNote:
        "Email and phone not found; needs manual verification before contact.",
      lastCheckedDate: account.updatedAt.slice(0, 10),
      allowedToContact: false,
    },
  ];
}

export function preferredContactFor(
  account: GrowthAccount,
): GrowthContactCandidate | undefined {
  const contacts = contactCandidatesFor(account);
  return (
    contacts.find(
      (contact) => contact.id === account.controlState.preferredContactId,
    ) ?? contacts[0]
  );
}

export function recommendedDraftType(account: GrowthAccount): GrowthDraftType {
  const persona = `${account.targetPersona} ${account.contactRole}`.toLowerCase();
  if (/ceo|md|founder|chief executive|managing director/.test(persona)) {
    return "cxoEmail";
  }
  if (/sales|proposal|operations|coo|hr|talent|functional/.test(persona)) {
    return "functionalLeaderEmail";
  }
  return "linkedInNote";
}

function defaultApprovalStatus(account: GrowthAccount): GrowthApprovalStatus {
  switch (account.outcome.status) {
    case "Target Identified":
    case "Diagnostic Angle Researched":
      return "Draft";
    case "Diagnostic Draft Prepared":
      return "Needs Review";
    case "Human Outreach Approved":
      return "Approved";
    case "Discovery Scheduled":
    case "Diagnostic Completed":
    case "Product Route Recommended":
    case "Pilot Proposed":
    case "Pilot / Deal Won":
      return "Replied";
    case "Nurture / Lost":
      return "Nurture";
  }
}

export function approvalStatusFor(
  account: GrowthAccount,
  draftType: GrowthDraftType,
): GrowthApprovalStatus {
  return (
    account.controlState.drafts[draftType]?.status ??
    defaultApprovalStatus(account)
  );
}

export function getDraftRiskFlags(
  account: GrowthAccount,
  message: string,
): string[] {
  const flags: string[] = [];
  if (!account.contactName.trim()) flags.push("Contact name missing");
  if (!account.contactRole.trim()) flags.push("Contact role missing");
  if (UNSAFE_CLAIMS.test(message)) flags.push("Unsupported assurance claim");
  if (!message.includes("HUMAN REVIEW REQUIRED")) {
    flags.push("Human-review notice missing");
  }
  if (!message.includes("NO AUTOMATED SENDING")) {
    flags.push("No-send notice missing");
  }
  if (!message.includes("NO CONFIDENTIAL DATA ACCESS ASSUMED")) {
    flags.push("Confidential-data disclaimer missing");
  }
  if (flags.length === 0) flags.push("Public-context assumptions require review");
  return flags;
}

const UNSUPPORTED_METRIC =
  /\b(?:guarantee|guaranteed|promise)\b|\b\d{2,3}%\b|\b\d+x\b/i;
const COMPETITOR_ATTACK =
  /\b(?:inferior|obsolete|replace your vendor|competitor failure|their product fails)\b/i;

export function buildEmailExecutionPack(
  account: GrowthAccount,
): GrowthExecutionPack["email"] {
  const contact = preferredContactFor(account);
  const greeting = contact?.name
    ? `Hi ${contact.name.split(" ")[0]},`
    : "Hello,";
  const pillar = account.intelligence.bestDiagnosticPillar;
  return {
    subjectLineOption1: `48-Hour diagnostic for ${account.companyName}`,
    subjectLineOption2: `${pillar} readiness review for ${account.companyName}`,
    selectedSubject: `48-Hour diagnostic for ${account.companyName}`,
    emailBody: `${greeting}

RightSense 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic helps industrial and project-driven teams map likely readiness gaps across operating intelligence, proposals, standards, suppliers, and trusted AI workflows.

For ${account.companyName}, a useful hypothesis to validate is ${account.intelligence.diagnosticEntryAngle.toLowerCase()}

Would a 20-minute conversation be useful to decide whether the diagnostic is relevant? Any finding would remain a hypothesis until supported by approved evidence.

If this is not relevant, please let me know and I will not follow up.

Mohan Babu
Co-Founder, RightSense Technologies
https://www.rightsense.in/48-hour-diagnostic`,
    shortFollowUpEmail: `${greeting}

Following up on the RightSense 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic. I can share a short sample of the likely ${pillar.toLowerCase()} gaps we would validate before recommending any product route.

If this is not relevant, please let me know and I will not follow up.

Mohan Babu
Co-Founder, RightSense Technologies
https://www.rightsense.in/48-hour-diagnostic`,
    linkedInNote: `Hello${contact?.name ? ` ${contact.name.split(" ")[0]}` : ""} - I work with industrial teams on the RightSense 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic. I would value connecting to compare notes on ${pillar.toLowerCase()} readiness at ${account.companyName}.`,
    whatsappMessage: `${greeting} I prepared a short public-context hypothesis for ${account.companyName} around ${pillar.toLowerCase()}. May I share the RightSense 48-Hour Diagnostic overview?`,
    callOpener: `I am calling from RightSense about our 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic. We help teams validate readiness gaps before recommending a product or pilot. I wanted to test whether ${pillar.toLowerCase()} is a current priority for ${account.companyName}.`,
    discoveryQuestions: buildDiscoveryBrief(account).discoveryQuestions,
  };
}

export function assessExecutionRisk(
  account: GrowthAccount,
  email: GrowthExecutionPack["email"],
): GrowthExecutionPack["risk"] {
  const contact = preferredContactFor(account);
  const body = email.emailBody;
  const flags: string[] = [];
  let blocked = false;
  if (!contact?.email) {
    flags.push("Contact email not found; needs manual verification");
    blocked = true;
  }
  if (!contact?.allowedToContact) {
    flags.push("Contact is not marked allowed-to-contact");
    blocked = true;
  }
  if (contact?.confidence !== "High") {
    flags.push("Contact verification is below High confidence");
  }
  if (UNSAFE_CLAIMS.test(body)) {
    flags.push("Certification or approval claim detected");
    blocked = true;
  }
  if (UNSUPPORTED_METRIC.test(body)) {
    flags.push("Unsupported metric or guarantee detected");
    blocked = true;
  }
  if (/confidential (?:data|information|assumption)/i.test(body)) {
    flags.push("Confidential-data assumption detected");
    blocked = true;
  }
  if (!body.includes("RightSense 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic")) {
    flags.push("Diagnostic CTA missing");
    blocked = true;
  }
  if (
    !body.includes("Mohan Babu") ||
    !body.includes("Co-Founder, RightSense Technologies")
  ) {
    flags.push("Human signature missing");
    blocked = true;
  }
  if (COMPETITOR_ATTACK.test(body)) {
    flags.push("Aggressive competitor language detected");
    blocked = true;
  }
  if (!/not relevant|not follow up|opt out/i.test(body)) {
    flags.push("Cold-email opt-out line missing");
  }
  if (flags.length === 0) flags.push("All configured execution checks passed");
  return {
    status: blocked ? "Blocked" : flags.length > 1 ? "Needs Review" : "Pass",
    flags,
  };
}

export function buildDiagnosticSampleOutput(
  account: GrowthAccount,
): GrowthExecutionPack["diagnosticSample"] {
  const fallbacks = [
    "Proposal and standards mapping evidence may be fragmented across spreadsheets, email, and documents.",
    "ISO and customer prequalification evidence may not be centrally mapped to customer and vendor requirements.",
    "AI-assisted analysis may need stronger source traceability, human approval, and audit trail before enterprise use.",
  ];
  const source = [
    ...account.intelligence.likelyReadinessGaps,
    ...fallbacks,
  ].slice(0, 3);
  return {
    title: "Sample 48-Hour Diagnostic Output",
    findings: source.map((gap) => ({
      finding: `Likely readiness-gap hypothesis: ${gap}. To be validated through approved evidence.`,
      whyItMatters:
        "A mapping gap can slow decisions, weaken traceability, or create avoidable execution risk.",
      evidenceNeeded:
        "Evidence needed: current workflow, approved source documents, system records, ownership, and recent review examples.",
      likelyDiagnosticPillar: account.intelligence.bestDiagnosticPillar,
      recommendedNextStep:
        "Validate the hypothesis in the 48-hour diagnostic and agree a low-risk 30-day action path.",
    })),
  };
}

export function collateralReferences(): GrowthExecutionPack["collateral"] {
  return [
    {
      title: "RightSense company overview",
      description: "Company positioning, capabilities, and engagement model.",
      intendedAudience: "CXO and functional leaders",
      status: "Ready",
      suggestedLink: "https://www.rightsense.in/",
    },
    {
      title: "RightSense 48-Hour Diagnostic pitch deck",
      description: "Diagnostic scope, outputs, evidence model, and next steps.",
      intendedAudience: "CXO, proposal, operations, and compliance leaders",
      status: "Ready",
      suggestedLink: "https://www.rightsense.in/48-hour-diagnostic",
    },
    {
      title: "PulseIQ overview",
      description: "Operating intelligence, truth-map, cockpit, and execution planning.",
      intendedAudience: "CXO, COO, finance, and operations",
      status: "Draft needed",
      suggestedLink: "/offerings",
    },
    {
      title: "WinsProposal overview",
      description: "Proposal, RFP, standards mapping, TBE, and workflow readiness.",
      intendedAudience: "Sales, proposal, and commercial teams",
      status: "Draft needed",
      suggestedLink: "/offerings",
    },
    {
      title: "TalentPulse overview",
      description: "Hiring, staffing, skills, capacity, and delivery readiness.",
      intendedAudience: "HR, talent acquisition, and delivery leaders",
      status: "Draft needed",
      suggestedLink: "/offerings",
    },
  ];
}

export function buildGrowthExecutionPack(
  account: GrowthAccount,
): GrowthExecutionPack {
  const contacts = contactCandidatesFor(account);
  const preferredContact = preferredContactFor(account);
  const email = buildEmailExecutionPack(account);
  return {
    accountProfile: {
      companyName: account.companyName,
      industry: account.industry,
      location: account.location,
      segment: account.segment,
      diagnosticAngle: account.intelligence.diagnosticEntryAngle,
      recommendedProductRouteAfterDiagnostic:
        account.intelligence.recommendedProductRouteAfterDiagnostic,
    },
    contacts,
    preferredContact,
    email,
    diagnosticSample: buildDiagnosticSampleOutput(account),
    collateral: collateralReferences(),
    risk: assessExecutionRisk(account, email),
    tracking: account.controlState.emailTracking ?? { status: "Not Ready" },
    followUp: buildFollowUpPlan(account),
  };
}

export function getExecutionSendEligibility(account: GrowthAccount): {
  allowed: boolean;
  reason: string;
} {
  const draftType = recommendedDraftType(account);
  const approval = approvalStatusFor(account, draftType);
  if (approval !== "Approved") {
    return {
      allowed: false,
      reason: "Email cannot be sent until the execution draft is approved.",
    };
  }
  const executionPack = buildGrowthExecutionPack(account);
  if (executionPack.risk.status !== "Pass") {
    return {
      allowed: false,
      reason: `Email cannot be sent while risk status is ${executionPack.risk.status}.`,
    };
  }
  if (!executionPack.preferredContact?.email) {
    return {
      allowed: false,
      reason: "Email cannot be sent without a verified recipient.",
    };
  }
  return { allowed: true, reason: "Approved email is eligible for sending." };
}

export function buildApprovalQueue(
  accounts: GrowthAccount[],
): GrowthApprovalQueueItem[] {
  return accounts
    .map((account) => {
      const draftType = recommendedDraftType(account);
      const message = account.outreachDrafts[draftType];
      const state = account.controlState.drafts[draftType];
      return {
        id: `${account.id}-${draftType}`,
        accountId: account.id,
        draftType,
        draftLabel: GROWTH_DRAFT_LABELS[draftType],
        targetAccount: account.companyName,
        contactRole: account.contactRole || account.targetPersona,
        diagnosticAngle: account.intelligence.diagnosticEntryAngle,
        messagePreview: message,
        riskFlags: getDraftRiskFlags(account, message),
        status: state?.status ?? defaultApprovalStatus(account),
        replyClassification: state?.replyClassification,
      };
    })
    .sort(
      (a, b) =>
        statusPriority(a.status) - statusPriority(b.status) ||
        a.targetAccount.localeCompare(b.targetAccount),
    );
}

function statusPriority(status: GrowthApprovalStatus): number {
  return {
    "Needs Review": 0,
    Draft: 1,
    Approved: 2,
    "Sent Manually": 3,
    Replied: 4,
    Nurture: 5,
  }[status];
}

export function canTransitionApprovalStatus(
  current: GrowthApprovalStatus,
  next: GrowthApprovalStatus,
): boolean {
  if (next === "Approved") return current === "Draft" || current === "Needs Review";
  if (next === "Sent Manually") return current === "Approved";
  if (next === "Replied") return current === "Sent Manually";
  if (next === "Nurture") return current !== "Nurture";
  return next === "Draft" || next === "Needs Review";
}

export function classifyGrowthReply(reply: string): GrowthReplyClassification {
  const text = reply.toLowerCase();
  if (/book|schedule|calendar|meeting|call|available/.test(text)) {
    return "Meeting requested";
  }
  if (/speak to|contact|refer|introduc|cc.?ing|forwarded/.test(text)) {
    return "Referral provided";
  }
  if (/not the right|wrong person|not responsible|not my area/.test(text)) {
    return "Wrong person";
  }
  if (/later|next quarter|next month|not now|circle back/.test(text)) {
    return "Ask later";
  }
  if (/more information|send details|share details|deck|brochure|explain/.test(text)) {
    return "Needs more information";
  }
  if (/not interested|no thanks|remove me|do not contact/.test(text)) {
    return "Not interested";
  }
  return "Interested";
}

export function buildFollowUpPlan(account: GrowthAccount): GrowthFollowUpPlan {
  const draftType = recommendedDraftType(account);
  const status = approvalStatusFor(account, draftType);
  const days = status === "Sent Manually" ? 3 : status === "Replied" ? 7 : 2;
  const date = new Date(account.outcome.updatedAt);
  date.setUTCDate(date.getUTCDate() + days);
  return {
    suggestedFollowUpDate: date.toISOString().slice(0, 10),
    followUpReason:
      status === "Replied"
        ? "Respond to the logged interest and confirm a diagnostic discovery step."
        : status === "Sent Manually"
          ? "No automated follow-up is permitted; review whether a concise manual check-in is appropriate."
          : "Complete human review before planning any outbound follow-up.",
    draftFollowUpMessage: account.outreachDrafts.followUpMessage,
    previousTouchSummary: `${GROWTH_DRAFT_LABELS[draftType]} is currently ${status}. ${account.outcome.outcome}`,
    humanApprovalRequired: true,
  };
}

export function buildDiscoveryBrief(account: GrowthAccount): GrowthDiscoveryBrief {
  return {
    recommendedOpening: `Use the ${account.intelligence.bestDiagnosticPillar.toLowerCase()} angle to test whether the RightSense 48-Hour Diagnostic is relevant. State that all gaps are hypotheses based on public or approved context.`,
    discoveryQuestions: [
      "Which revenue, proposal, bid, or customer-prequalification workflow matters most now?",
      "Where is operating visibility weakest, and where could margin or productivity leakage occur?",
      "Which compliance, standards, supplier, or documentation readiness gaps need evidence review?",
      "How are AI outputs, source traceability, and human approvals governed today?",
      "What measurable result would make a 30-day pilot worth approving?",
    ],
    likelyReadinessGaps: account.intelligence.likelyReadinessGaps,
    diagnosticPillarFocus: account.intelligence.bestDiagnosticPillar,
    likelyProductRouteAfterDiagnostic:
      account.intelligence.recommendedProductRouteAfterDiagnostic,
    objectionsToExpect: [
      "The team may already have tools but lack an evidence-backed cross-functional view.",
      "Leaders may be concerned about time, data access, or disruption.",
      "The buyer may want proof of value before considering a product route.",
    ],
    pilotSuccessCriteria: [
      "A named business owner and approved data sources are confirmed.",
      "The priority readiness gap has a measurable baseline.",
      "A 30-day scope, review cadence, and human decision points are agreed.",
    ],
  };
}

export function calculateControlMetrics(
  accounts: GrowthAccount[],
): GrowthControlMetrics {
  const queue = buildApprovalQueue(accounts);
  const fits = accounts.map((account) => getCompositeFitScore(account.fitScores));
  const explicitStates = accounts.flatMap((account) =>
    Object.values(account.controlState.drafts),
  );
  const bestLabel = (labelFor: (account: GrowthAccount) => string) => {
    const values = new Map<string, { score: number; count: number }>();
    for (const account of accounts) {
      const label = labelFor(account);
      const current = values.get(label) ?? { score: 0, count: 0 };
      current.score +=
        pipelineProgress(account.outcome.status) * 10 +
        getCompositeFitScore(account.fitScores);
      current.count += 1;
      values.set(label, current);
    }
    return (
      [...values.entries()].sort(
        (a, b) =>
          b[1].score / b[1].count - a[1].score / a[1].count ||
          b[1].count - a[1].count,
      )[0]?.[0] ?? "Not enough data"
    );
  };
  return {
    accountsByDiagnosticFit: {
      high: fits.filter((score) => score >= 75).length,
      medium: fits.filter((score) => score >= 60 && score < 75).length,
      developing: fits.filter((score) => score < 60).length,
    },
    draftsPrepared: queue.length,
    approvedDrafts: queue.filter((item) => item.status === "Approved").length,
    manualSendsLogged: explicitStates.filter(
      (state) => state.status === "Sent Manually" || state.status === "Replied",
    ).length,
    repliesLogged: explicitStates.filter((state) => state.status === "Replied")
      .length,
    discoveryCallsScheduled: accounts.filter(
      (account) => account.outcome.status === "Discovery Scheduled",
    ).length,
    bestDiagnosticAngle: bestLabel(
      (account) => account.intelligence.bestDiagnosticPillar,
    ),
    bestSegment: bestLabel((account) => account.segment),
    bestProductRoute: bestLabel(
      (account) => account.intelligence.recommendedProductRouteAfterDiagnostic,
    ),
  };
}

function pipelineProgress(status: GrowthAccount["outcome"]["status"]): number {
  return {
    "Target Identified": 0,
    "Diagnostic Angle Researched": 1,
    "Diagnostic Draft Prepared": 2,
    "Human Outreach Approved": 3,
    "Discovery Scheduled": 5,
    "Diagnostic Completed": 6,
    "Product Route Recommended": 7,
    "Pilot Proposed": 8,
    "Pilot / Deal Won": 10,
    "Nurture / Lost": 0,
  }[status];
}
