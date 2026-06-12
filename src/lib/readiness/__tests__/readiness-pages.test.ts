import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AIGovernancePage from "@/app/app/assessments/[id]/ai-governance/page";
import CustomerQualificationPage from "@/app/app/assessments/[id]/customer-qualification/page";
import ReadinessPackPage from "@/app/app/assessments/[id]/readiness-pack/page";
import ReportPage from "@/app/app/assessments/[id]/report/page";
import StandardsReadinessPage from "@/app/app/assessments/[id]/standards-readiness/page";
import StatutoryReadinessPage from "@/app/app/assessments/[id]/statutory-readiness/page";
import SupplierEcosystemPage from "@/app/app/assessments/[id]/supplier-ecosystem/page";

const DEMO_ID = "asm-bharat-heavy-fabrications";
const pageProps = { params: Promise.resolve({ id: DEMO_ID }) };

describe("readiness module pages", () => {
  it.each([
    ["Standards Readiness", StandardsReadinessPage],
    ["Customer Qualification", CustomerQualificationPage],
    ["Statutory Readiness", StatutoryReadinessPage],
    ["Supplier Ecosystem", SupplierEcosystemPage],
    ["AI Governance", AIGovernancePage],
    ["Readiness Pack", ReadinessPackPage],
  ])("renders %s", async (heading, Page) => {
    const markup = renderToStaticMarkup(await Page(pageProps));
    expect(markup).toContain(heading);
    expect(markup).toContain("Read-only readiness view");
  });

  it("renders the new structured sections in the existing report", async () => {
    const markup = renderToStaticMarkup(await ReportPage(pageProps));

    expect(markup).toContain("Compliance &amp; Standards Readiness");
    expect(markup).toContain("Customer Qualification Readiness");
    expect(markup).toContain("Statutory &amp; Audit Evidence");
    expect(markup).toContain("Supplier / Vendor Ecosystem Readiness");
    expect(markup).toContain("AI Governance &amp; Trusted Agent Readiness");
    expect(markup).toContain("Revenue Risk from Readiness Gaps");
    expect(markup).toContain("Truth map");
    expect(markup).toContain("Top 10 recommendations");
  });
});
