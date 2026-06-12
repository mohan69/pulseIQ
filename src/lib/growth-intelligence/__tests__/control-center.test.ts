import { describe, expect, it } from "vitest";
import {
  buildApprovalQueue,
  buildDiscoveryBrief,
  buildFollowUpPlan,
  calculateControlMetrics,
  canTransitionApprovalStatus,
  classifyGrowthReply,
  getDraftRiskFlags,
} from "@/lib/growth-intelligence/control-center";
import { demoGrowthAccounts } from "@/lib/growth-intelligence/seed";

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
});
