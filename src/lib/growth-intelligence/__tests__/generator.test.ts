import { describe, expect, it } from "vitest";
import {
  generateGrowthIntelligence,
  getCompositeFitScore,
} from "@/lib/growth-intelligence/generator";
import {
  DEMO_GROWTH_ORG_ID,
  demoGrowthAccounts,
  getDemoGrowthAccounts,
} from "@/lib/growth-intelligence/seed";
import type { GrowthAccountInput } from "@/lib/growth-intelligence/types";

const baseInput: GrowthAccountInput = {
  companyName: "Example Industrial Company",
  website: "https://example.com",
  industry: "Industrial Manufacturing",
  location: "Pune, India",
  segment: "Mid-market manufacturer",
  targetProductService: "Growth platform",
  targetPersona: "CEO",
  contactName: "Asha Rao",
  contactRole: "Chief Executive Officer",
  linkedInUrl: "https://linkedin.com/in/example",
  notes: "",
  mode: "rightsense",
};

describe("growth intelligence generator", () => {
  it("is deterministic for the same account input", () => {
    expect(generateGrowthIntelligence(baseInput)).toEqual(
      generateGrowthIntelligence(baseInput),
    );
  });

  it("raises WinsProposal fit for valve, EPC, and bid workflow signals", () => {
    const baseline = generateGrowthIntelligence(baseInput);
    const proposalAccount = generateGrowthIntelligence({
      ...baseInput,
      industry: "Valve EPC",
      notes: "RFQ tender proposal drawing compliance",
    });

    expect(proposalAccount.rightSenseFitScores?.winsProposal).toBeGreaterThan(
      baseline.rightSenseFitScores?.winsProposal ?? 0,
    );
  });

  it("raises PulseIQ fit for manufacturing performance signals", () => {
    const baseline = generateGrowthIntelligence(baseInput);
    const manufacturingAccount = generateGrowthIntelligence({
      ...baseInput,
      notes: "manufacturing fabrication ERP MIS margin productivity execution",
    });

    expect(manufacturingAccount.rightSenseFitScores?.pulseIQ).toBeGreaterThan(
      baseline.rightSenseFitScores?.pulseIQ ?? 0,
    );
  });

  it("raises TalentPulse fit and uses the hiring angle for HR personas", () => {
    const result = generateGrowthIntelligence({
      ...baseInput,
      industry: "Recruitment",
      targetPersona: "HR / TA",
      contactRole: "Talent Acquisition Head",
      notes: "recruitment hiring talent HR",
    });

    expect(result.rightSenseFitScores?.talentPulse).toBeGreaterThanOrEqual(90);
    expect(result.intelligence.conversationAngle).toContain(
      "hiring productivity",
    );
  });

  it("does not expose RightSense product scores in customer mode", () => {
    const result = generateGrowthIntelligence({
      ...baseInput,
      mode: "customer",
    });

    expect(result.rightSenseFitScores).toBeUndefined();
  });

  it("scrubs RightSense product language from customer-mode outreach", () => {
    const result = generateGrowthIntelligence({
      ...baseInput,
      mode: "customer",
      targetProductService: "PulseIQ",
    });
    const outreach = Object.values(result.outreachDrafts).join(" ");

    expect(outreach).not.toMatch(
      /PulseIQ|WinsProposal|TalentPulse|RightSense Consulting/i,
    );
    expect(outreach).not.toMatch(/guarantee|guaranteed|promise/i);
    expect(
      Object.values(result.outreachDrafts).every((draft) =>
        draft.startsWith("DRAFT - HUMAN REVIEW REQUIRED"),
      ),
    ).toBe(true);
    expect(
      Object.values(result.outreachDrafts).every((draft) =>
        draft.endsWith("Regards,\nGrowth Team"),
      ),
    ).toBe(true);
  });

  it("uses the RightSense Co-Founder signature in RightSense mode", () => {
    const result = generateGrowthIntelligence(baseInput);

    expect(
      Object.values(result.outreachDrafts).every((draft) =>
        draft.endsWith(
          "Regards,\nMohan Babu\nCo-Founder, RightSense Technologies",
        ),
      ),
    ).toBe(true);
    expect(Object.values(result.outreachDrafts).join("\n")).not.toMatch(
      /\nFounder, RightSense Technologies/,
    );
  });

  it("seeds eight tenant-scoped demo accounts", () => {
    expect(demoGrowthAccounts).toHaveLength(8);
    expect(getDemoGrowthAccounts(DEMO_GROWTH_ORG_ID)).toHaveLength(8);
    expect(getDemoGrowthAccounts("another-org")).toEqual([]);
    expect(
      demoGrowthAccounts.every(
        (account) =>
          account.orgId === DEMO_GROWTH_ORG_ID &&
          account.createdBy === "demo-admin-user",
      ),
    ).toBe(true);
  });

  it("keeps every seeded outreach draft review-only and non-guaranteeing", () => {
    for (const account of demoGrowthAccounts) {
      for (const draft of Object.values(account.outreachDrafts)) {
        expect(draft).toMatch(/^DRAFT - HUMAN REVIEW REQUIRED/);
        expect(draft).not.toMatch(/guarantee|guaranteed|promise/i);
      }
    }
  });

  it("keeps composite fit scores within the 0-100 range", () => {
    const result = generateGrowthIntelligence(baseInput);
    expect(getCompositeFitScore(result.fitScores)).toBeGreaterThanOrEqual(0);
    expect(getCompositeFitScore(result.fitScores)).toBeLessThanOrEqual(100);
  });
});
