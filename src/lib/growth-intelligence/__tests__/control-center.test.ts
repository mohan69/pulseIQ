import { describe, expect, it } from "vitest";
import {
  assessExecutionRisk,
  buildApprovalQueue,
  buildDiagnosticSampleOutput,
  buildDiscoveryBrief,
  buildEmailExecutionPack,
  buildFollowUpPlan,
  contactCandidatesFor,
  calculateControlMetrics,
  canTransitionApprovalStatus,
  classifyGrowthReply,
  getExecutionSendEligibility,
  getDraftRiskFlags,
  normalizeGrowthControlState,
  recommendedDraftType,
} from "@/lib/growth-intelligence/control-center";
import { sendApprovedEmail } from "@/lib/growth-intelligence/email-sender";
import { demoGrowthAccounts } from "@/lib/growth-intelligence/seed";
import type { GrowthAccount } from "@/lib/growth-intelligence/types";

describe("growth control center", () => {
  it("builds a review-first approval queue for every account", () => {
    const queue = buildApprovalQueue(demoGrowthAccounts);

    expect(queue).toHaveLength(demoGrowthAccounts.length);
    expect(
      queue.every(
        (item) =>
          item.draftType &&
          item.targetAccount &&
          item.contactRole &&
          item.diagnosticAngle &&
          item.messagePreview &&
          item.riskFlags.length > 0,
      ),
    ).toBe(true);
  });

  it("requires approval before a manual send can be logged", () => {
    expect(canTransitionApprovalStatus("Needs Review", "Sent Manually")).toBe(
      false,
    );
    expect(canTransitionApprovalStatus("Needs Review", "Approved")).toBe(true);
    expect(canTransitionApprovalStatus("Approved", "Sent Manually")).toBe(true);
    expect(canTransitionApprovalStatus("Sent Manually", "Replied")).toBe(true);
  });

  it.each([
    ["Can we schedule a meeting next Tuesday?", "Meeting requested"],
    ["Please speak to our proposal director.", "Referral provided"],
    ["I am not the right person for this.", "Wrong person"],
    ["Circle back next quarter.", "Ask later"],
    ["Please send more information.", "Needs more information"],
    ["No thanks, we are not interested.", "Not interested"],
    ["This looks relevant to us.", "Interested"],
  ] as const)("classifies %s as %s", (reply, classification) => {
    expect(classifyGrowthReply(reply)).toBe(classification);
  });

  it("creates a deterministic human-reviewed follow-up plan", () => {
    const plan = buildFollowUpPlan(demoGrowthAccounts[0]);

    expect(plan.suggestedFollowUpDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(plan.followUpReason).toBeTruthy();
    expect(plan.previousTouchSummary).toBeTruthy();
    expect(plan.draftFollowUpMessage).toContain("HUMAN REVIEW REQUIRED");
    expect(plan.humanApprovalRequired).toBe(true);
  });

  it("builds a structured five-question discovery brief", () => {
    const brief = buildDiscoveryBrief(demoGrowthAccounts[0]);

    expect(brief.discoveryQuestions).toHaveLength(5);
    expect(brief.recommendedOpening).toContain("RightSense 48-Hour Diagnostic");
    expect(brief.likelyReadinessGaps.length).toBeGreaterThan(0);
    expect(brief.objectionsToExpect).toHaveLength(3);
    expect(brief.pilotSuccessCriteria).toHaveLength(3);
  });

  it("flags missing safeguards and unsupported assurance claims", () => {
    const account = { ...demoGrowthAccounts[0], contactName: "" };
    const flags = getDraftRiskFlags(
      account,
      "This is fully compliant and certification guaranteed.",
    );

    expect(flags).toContain("Contact name missing");
    expect(flags).toContain("Unsupported assurance claim");
    expect(flags).toContain("Human-review notice missing");
    expect(flags).toContain("No-send notice missing");
    expect(flags).toContain("Confidential-data disclaimer missing");
  });

  it("calculates count-based learning metrics without unsupported rates", () => {
    const metrics = calculateControlMetrics(demoGrowthAccounts);

    expect(metrics.draftsPrepared).toBe(demoGrowthAccounts.length);
    expect(
      metrics.accountsByDiagnosticFit.high +
        metrics.accountsByDiagnosticFit.medium +
        metrics.accountsByDiagnosticFit.developing,
    ).toBe(demoGrowthAccounts.length);
    expect(metrics.bestDiagnosticAngle).toBeTruthy();
    expect(metrics.bestProductRoute).toContain("Likely product route");
  });

  it("does not fabricate unknown contact email or phone values", () => {
    const contacts = contactCandidatesFor(demoGrowthAccounts[0]);

    expect(contacts[0].email).toBe("");
    expect(contacts[0].phone).toBe("");
    expect(contacts[0].verificationNote).toContain(
      "needs manual verification",
    );
  });

  it("keeps legacy version-one queue state compatible", () => {
    const normalized = normalizeGrowthControlState({
      version: 1,
      drafts: {
        cxoEmail: {
          status: "Approved",
          updatedAt: "2026-06-01T00:00:00.000Z",
        },
      },
    });

    expect(normalized.version).toBe(2);
    expect(normalized.drafts.cxoEmail?.status).toBe("Approved");
    expect(normalized.contacts).toEqual([]);
  });

  it("blocks sending when the execution draft is not approved", () => {
    const result = getExecutionSendEligibility(demoGrowthAccounts[0]);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("approved");
  });

  it("blocks sending when contact or risk verification is incomplete", () => {
    const account = withApprovedExecutionDraft(demoGrowthAccounts[0]);
    const email = buildEmailExecutionPack(account);

    expect(assessExecutionRisk(account, email).status).toBe("Blocked");
    expect(getExecutionSendEligibility(account).allowed).toBe(false);
  });

  it("allows sending only after approval and high-confidence contact verification", () => {
    const account = withApprovedExecutionDraft(demoGrowthAccounts[0], true);

    expect(getExecutionSendEligibility(account)).toEqual({
      allowed: true,
      reason: "Approved email is eligible for sending.",
    });
  });

  it("uses hypothesis language throughout sample diagnostic findings", () => {
    const sample = buildDiagnosticSampleOutput(demoGrowthAccounts[0]);

    expect(sample.title).toBe("Sample 48-Hour Diagnostic Output");
    expect(sample.findings).toHaveLength(3);
    for (const finding of sample.findings) {
      expect(finding.finding).toMatch(/likely|hypothesis|to be validated/i);
      expect(finding.evidenceNeeded).toMatch(/evidence needed/i);
      expect(finding.finding).not.toMatch(/confirmed|certified|approved fact/i);
    }
  });

  it("returns a safe not-configured result from the email provider stub", async () => {
    await expect(
      sendApprovedEmail({
        recipient: "verified@example.com",
        subject: "Approved subject",
        body: "Approved body",
      }),
    ).resolves.toEqual({
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Email sending not configured",
    });
  });
});

function withApprovedExecutionDraft(
  source: GrowthAccount,
  verifiedContact = false,
): GrowthAccount {
  const draftType = recommendedDraftType(source);
  return {
    ...source,
    controlState: {
      version: 2,
      drafts: {
        [draftType]: {
          status: "Approved",
          updatedAt: "2026-06-12T00:00:00.000Z",
        },
      },
      contacts: verifiedContact
        ? [
            {
              id: `${source.id}-verified`,
              name: source.contactName,
              title: source.contactRole,
              roleCategory: "CXO",
              email: "verified@example.com",
              phone: "",
              linkedInUrl: source.linkedInUrl,
              sourceUrl: source.linkedInUrl,
              confidence: "High",
              verificationNote: "Verified manually against the supplied source.",
              lastCheckedDate: "2026-06-12",
              allowedToContact: true,
            },
          ]
        : [],
      preferredContactId: verifiedContact
        ? `${source.id}-verified`
        : undefined,
    },
  };
}
