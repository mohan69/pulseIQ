import { getCompositeFitScore } from "@/lib/growth-intelligence/generator";
import type {
  GrowthAccount,
  GrowthApprovalQueueItem,
  GrowthApprovalStatus,
  GrowthControlMetrics,
  GrowthControlState,
  GrowthDiscoveryBrief,
  GrowthDraftType,
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
  return { version: 1, drafts: {} };
}

export function normalizeGrowthControlState(value: unknown): GrowthControlState {
  if (!value || typeof value !== "object") return emptyGrowthControlState();
  const candidate = value as Partial<GrowthControlState>;
  return {
    version: 1,
    drafts:
      candidate.drafts && typeof candidate.drafts === "object"
        ? candidate.drafts
        : {},
  };
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
