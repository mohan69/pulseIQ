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

  it("makes the RightSense diagnostic the first commercial action", () => {
    const result = generateGrowthIntelligence({
      ...baseInput,
      targetProductService: "WinsProposal",
      notes:
        "RFQ tender standards mapping vendor prequalification and supplier documentation",
    });

    expect(result.intelligence.recommendedNextAction).toMatch(
      /^Offer the RightSense 48-Hour Diagnostic\./,
    );
    expect(result.intelligence.diagnosticEntryAngle).toContain(
      "RightSense 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic",
    );
    expect(
      result.intelligence.recommendedProductRouteAfterDiagnostic,
    ).toContain("Confirm only after diagnostic evidence review");
  });

  it("surfaces readiness gaps for compliance, supplier, proposal, and AI governance signals", () => {
    const result = generateGrowthIntelligence({
      ...baseInput,
      notes:
        "ISO statutory technical standards vendor supplier subcontractor prequalification proposal audit trail AI validation source traceability human approval workflow",
    });
    const gaps = result.intelligence.likelyReadinessGaps.join(" ");

    expect(gaps).toMatch(/ISO|standards/i);
    expect(gaps).toMatch(/vendor|supplier|subcontractor/i);
    expect(gaps).toMatch(/proposal|prequalification/i);
    expect(gaps).toMatch(/AI output validation|source traceability/i);
  });

  it("generates diagnostic scoring dimensions within the 0-100 range", () => {
    const scores = generateGrowthIntelligence(baseInput).fitScores;

    expect(Object.keys(scores)).toEqual([
      "diagnosticFit",
      "complianceStandardsSignal",
      "vendorSupplierReadinessSignal",
      "aiGovernanceSignal",
      "productRouteFit",
      "commercialReadiness",
    ]);
    expect(Object.values(scores).every((score) => score >= 0 && score <= 100)).toBe(
      true,
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
        draft.includes("NO AUTOMATED SENDING"),
      ),
    ).toBe(true);
    expect(
      Object.values(result.outreachDrafts).every((draft) =>
        draft.includes("NO CONFIDENTIAL DATA ACCESS ASSUMED"),
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

  it("covers the required diagnostic discovery categories", () => {
    const brief =
      generateGrowthIntelligence(baseInput).outreachDrafts.discoveryCallBrief;

    for (const category of [
      "revenue, proposal, RFP, bid",
      "operating visibility",
      "margin or productivity leakage",
      "compliance, ISO, technical standards",
      "suppliers, subcontractors, vendor registration",
      "AI outputs validated",
      "systems and approved data sources",
      "30-day pilot",
    ]) {
      expect(brief).toContain(category);
    }
  });

  it("avoids unsupported assurance claims in generated outreach", () => {
    const outreach = Object.values(
      generateGrowthIntelligence({
        ...baseInput,
        notes: "ISO certification customer standards and tender compliance",
      }).outreachDrafts,
    ).join("\n");

    expect(outreach).not.toMatch(
      /certification guaranteed|customer approved|fully compliant|guaranteed acceptance|tender-ready/i,
    );
  });

  it("seeds nine tenant-scoped demo accounts including Decon", () => {
    expect(demoGrowthAccounts).toHaveLength(9);
    expect(getDemoGrowthAccounts(DEMO_GROWTH_ORG_ID)).toHaveLength(9);
    expect(getDemoGrowthAccounts("another-org")).toEqual([]);
    expect(
      demoGrowthAccounts.some(
        (account) => account.id === "growth-decon-technologies",
      ),
    ).toBe(true);
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
