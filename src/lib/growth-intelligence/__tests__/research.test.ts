import { describe, expect, it } from "vitest";
import {
  assessResearchRisk,
  RESEARCH_FALLBACK_MESSAGE,
  researchAccount,
  researchToGrowthInput,
} from "@/lib/growth-intelligence/research";
import type {
  GrowthResearchInput,
  GrowthResearchResult,
} from "@/lib/growth-intelligence/types";

const input: GrowthResearchInput = {
  companyName: "Example Valve Systems",
  website: "https://example.com",
  industry: "Industrial Valves",
  segment: "Industrial OEM",
  location: "Pune, India",
  targetProductRoutePreference: "Unknown",
  knownRelationshipNote: "",
  publicSourceNotes:
    "Public website notes mention RFQ proposals, ISO systems, supplier qualification, and technical standards.",
  targetRole: "Proposal Head",
};

describe("growth automated research", () => {
  it("uses deterministic fallback when no external provider is configured", async () => {
    const result = await researchAccount(input);

    expect(result.providerMessage).toBe(RESEARCH_FALLBACK_MESSAGE);
    expect(result.companyName).toBe(input.companyName);
    expect(result.publicSignals.length).toBeGreaterThan(0);
    expect(result.verificationStatus).toBe("Needs Manual Verification");
  });

  it("never fabricates contact email or phone values", async () => {
    const result = await researchAccount(input);
    const contact = result.contactCandidates[0];

    expect(contact.name).toBe("Role target, contact not identified");
    expect(contact.email).toBe("");
    expect(contact.phone).toBe("");
    expect(contact.verificationNote).toMatch(
      /not found \/ needs manual verification/i,
    );
  });

  it("converts research output into a complete account intake", async () => {
    const result = await researchAccount(input);
    const accountInput = researchToGrowthInput(result);

    expect(accountInput.companyName).toBe(input.companyName);
    expect(accountInput.website).toBe(input.website);
    expect(accountInput.targetPersona).toBe("Proposal Head");
    expect(accountInput.notes).toContain("Proposal / RFP complexity");
    expect(accountInput.mode).toBe("rightsense");
  });

  it("uses hypothesis language for public signals and findings", async () => {
    const result = await researchAccount(input);
    const serialized = JSON.stringify({
      signals: result.publicSignals,
      gaps: result.likelyReadinessGaps,
    });

    expect(serialized).toMatch(/likely|may indicate|hypothesis|to be validated/i);
    expect(serialized).not.toMatch(/confirmed internal fact/i);
  });

  it("requires review for low-confidence research", async () => {
    const result = await researchAccount({
      ...input,
      website: "",
      publicSourceNotes: "",
    });
    const risk = assessResearchRisk(result);

    expect(result.confidence).toBe("Low");
    expect(risk.status).toBe("Needs Review");
    expect(risk.flags).toContain("Research confidence is Low");
  });

  it("blocks unsafe certification or approval wording", async () => {
    const result = await researchAccount({
      ...input,
      publicSourceNotes:
        "The company is certified and customer approved with guaranteed acceptance.",
    });
    const risk = assessResearchRisk(result);

    expect(risk.status).toBe("Blocked");
    expect(risk.flags).toContain(
      "Certification or approval wording detected",
    );
  });

  it("blocks contact details that have no supporting source", async () => {
    const result = await researchAccount(input);
    const unsafe: GrowthResearchResult = {
      ...result,
      contactCandidates: [
        {
          ...result.contactCandidates[0],
          email: "invented@example.com",
          sourceUrl: "",
          sourceType: "unknown",
        },
      ],
    };

    expect(assessResearchRisk(unsafe)).toEqual(
      expect.objectContaining({
        status: "Blocked",
        flags: expect.arrayContaining(["Fabricated contact risk"]),
      }),
    );
  });
});
