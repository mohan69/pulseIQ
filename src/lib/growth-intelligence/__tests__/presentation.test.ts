import { describe, expect, it } from "vitest";
import {
  contactVerificationLabel,
  formatDiagnosticEmailHypothesis,
  formatFollowUpDate,
  GROWTH_INTERNAL_WORKSPACE_NOTICE,
  normalizeGrowthProductNames,
  removeRepeatedEvidenceLabel,
} from "@/lib/growth-intelligence/presentation";
import type { GrowthContactCandidate } from "@/lib/growth-intelligence/types";

describe("growth intelligence presentation", () => {
  it("normalizes product and company brand capitalization", () => {
    expect(
      normalizeGrowthProductNames(
        "rightsense can route to pulseiq, winsproposal, or talentpulse.",
      ),
    ).toBe(
      "RightSense can route to PulseIQ, WinsProposal, or TalentPulse.",
    );
    expect(
      normalizeGrowthProductNames(
        "Offer the rightsense diagnostic before pulseiq, winsproposal, and talentpulse.",
      ),
    ).toBe(
      "Offer the RightSense diagnostic before PulseIQ, WinsProposal, and TalentPulse.",
    );
  });

  it("removes a repeated Evidence needed label", () => {
    expect(
      removeRepeatedEvidenceLabel(
        "Evidence needed: approved workflow and source records.",
      ),
    ).toBe("approved workflow and source records.");
  });

  it("formats a natural, public-context diagnostic angle for email", () => {
    expect(
      formatDiagnosticEmailHypothesis(
        "DECON Technologies",
        "Offer the rightsense 48-Hour Diagnostic using pulseiq evidence.",
      ),
    ).toBe(
      "For DECON Technologies, this public-context diagnostic angle may be useful to validate:\n\nOffer the RightSense 48-Hour Diagnostic using PulseIQ evidence.",
    );
  });

  it("uses internal, review-first workspace wording", () => {
    expect(GROWTH_INTERNAL_WORKSPACE_NOTICE).toBe(
      "Internal RightSense Growth Intelligence workspace. Tenant-scoped demo and approved account data only. Drafts require human approval; PulseIQ does not send outbound messages.",
    );
  });

  it("marks stale or invalid follow-up dates safely", () => {
    const today = new Date("2026-06-13T12:00:00.000Z");

    expect(formatFollowUpDate("2026-06-12", today)).toBe(
      "Follow-up overdue",
    );
    expect(formatFollowUpDate("not-a-date", today)).toBe(
      "Review follow-up date",
    );
    expect(formatFollowUpDate("2026-06-14", today)).toBe("2026-06-14");
  });

  it("labels demo or unapproved contacts for manual verification", () => {
    const contact: GrowthContactCandidate = {
      id: "contact-1",
      name: "Sample Contact",
      title: "CEO",
      roleCategory: "CXO",
      email: "",
      phone: "",
      linkedInUrl: "https://linkedin.com/in/demo-contact",
      sourceUrl: "https://example.com",
      sourceType: "manual input",
      confidence: "Medium",
      verificationNote: "Sample record.",
      lastCheckedDate: "2026-06-13",
      allowedToContact: false,
      doNotContact: false,
    };

    expect(contactVerificationLabel(contact)).toBe(
      "Needs manual verification",
    );
  });
});
