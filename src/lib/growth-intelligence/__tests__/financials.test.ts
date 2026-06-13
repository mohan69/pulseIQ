import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FinancialSignalsSection } from "@/components/growth-intelligence/GrowthIntelligenceWorkspace";
import {
  financialSignalsForAccount,
  resolveFinancialCandidate,
} from "@/lib/growth-intelligence/financials";
import { generateGrowthIntelligence } from "@/lib/growth-intelligence/generator";
import type { GrowthAccountInput } from "@/lib/growth-intelligence/types";

const deconInput: GrowthAccountInput = {
  companyName: "Decon Technologies",
  website: "https://decontechnologies.com/",
  industry: "Oil & Gas / engineered manufacturing / global sourcing",
  location: "Vadodara, Gujarat",
  segment: "Industrial OEM",
  targetProductService: "PulseIQ",
  targetPersona: "CEO / MD",
  contactName: "",
  contactRole: "",
  linkedInUrl: "",
  notes:
    "Engineered manufacturing, global sourcing, customer qualification, supplier readiness, and proposal pipeline.",
  mode: "rightsense",
};

describe("growth financial enrichment", () => {
  it("renders the financials-not-found state", () => {
    const context = financialSignalsForAccount(deconInput);
    const markup = renderToStaticMarkup(
      FinancialSignalsSection({
        financials: context.financialSignals,
        publicContext: context.publicContextProfile,
      }),
    );

    expect(markup).toContain("Financial Signals");
    expect(markup).toContain("Financials not found");
    expect(markup).toContain("Revenue value or range");
    expect(markup).toContain("Not found");
    expect(markup).toContain("Decon Technologies public website");
    expect(markup).toContain("https://decontechnologies.com/");
    expect(markup).toContain("Low");
    expect(markup).toContain("Confirmed");
  });

  it("renders an entity ambiguity warning", () => {
    const financials = resolveFinancialCandidate(
      {
        companyName: "Decon Technologies",
        website: "https://decontechnologies.com/",
        location: "Vadodara, Gujarat",
      },
      {
        companyName: "Docon Technologies Private Limited",
        website: "https://docon.example/",
        location: "Bengaluru, Karnataka",
        revenue: "₹42 Cr",
        sourceName: "Third-party company database",
        sourceUrl: "https://database.example/docon",
        financialYear: "FY2025",
      },
    );
    const markup = renderToStaticMarkup(
      FinancialSignalsSection({ financials }),
    );

    expect(markup).toContain("Entity ambiguity detected");
    expect(markup).toContain(
      "Similarly named company financials are excluded",
    );
  });

  it("does not use similarly named company financials", () => {
    const financials = resolveFinancialCandidate(
      {
        companyName: "Decon Technologies",
        website: "https://decontechnologies.com/",
        location: "Vadodara, Gujarat",
      },
      {
        companyName: "Deacon Technologies Limited",
        website: "https://deacon.example/",
        location: "Mumbai, Maharashtra",
        revenue: "₹900 Cr",
        sourceName: "Unmatched filing",
      },
    );

    expect(financials.state).toBe("Entity ambiguity detected");
    expect(financials.entityMatchStatus).toBe("Ambiguous");
    expect(financials.revenue).toBe("Not used");
    expect(JSON.stringify(financials)).not.toContain("₹900 Cr");
  });

  it("shows certifications and employee signal without revenue", () => {
    const intelligence = generateGrowthIntelligence(deconInput).intelligence;
    const serialized = JSON.stringify(intelligence.publicContextProfile);

    expect(intelligence.financialSignals.revenue).toBe("Not found");
    expect(serialized).toContain("51-200 employees");
    expect(serialized).toContain("https://decontechnologies.com/");
    expect(serialized).toContain(
      "Oil & Gas / engineered manufacturing / global sourcing",
    );
    expect(serialized).toContain("Vadodara, Gujarat");
    expect(serialized).toContain("ISO 9001:2015");
    expect(serialized).toContain("ISO 45001:2018");
    expect(serialized).toContain("Revenue");
    expect(serialized).toContain("Gross margin");
    expect(serialized).toContain("Order book");
  });

  it("produces a PulseIQ diagnostic angle without unsupported financial claims", () => {
    const result = generateGrowthIntelligence(deconInput);
    const financialText = JSON.stringify(result.intelligence.financialSignals);

    expect(result.intelligence.diagnosticEntryAngle).toContain(
      "RightSense 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic",
    );
    expect(
      result.intelligence.recommendedProductRouteAfterDiagnostic,
    ).toContain("PulseIQ");
    expect(financialText).toContain(
      "No reliable public financials found. Use this as a qualification and diagnostic target, not a financial benchmark.",
    );
    expect(financialText).toContain(
      "Ask for internal data under NDA for 48-hour diagnostic.",
    );
    expect(financialText).not.toMatch(/₹|\b\d+(?:\.\d+)?\s*(?:Cr|crore)\b/i);
  });

  it("distinguishes exact values and ranges only after entity matching", () => {
    const target = {
      companyName: "Matched Industrial Limited",
      website: "https://matched.example/",
      location: "Pune, India",
    };
    const baseCandidate = {
      companyName: "Matched Industrial Ltd",
      website: "https://matched.example",
      location: "Pune, India",
      sourceName: "Matched annual report",
      sourceUrl: "https://matched.example/report",
      financialYear: "FY2025",
    };

    expect(
      resolveFinancialCandidate(target, {
        ...baseCandidate,
        revenue: "₹120 Cr",
      }).state,
    ).toBe("Financials found");
    expect(
      resolveFinancialCandidate(target, {
        ...baseCandidate,
        revenueRange: "₹100-150 Cr",
      }).state,
    ).toBe("Financial range only");
  });
});
