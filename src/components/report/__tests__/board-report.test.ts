import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BoardReportPage from "@/app/app/assessments/[id]/report/board/page";
import DetailedReportPage from "@/app/app/assessments/[id]/report/detail/page";
import ReportPage from "@/app/app/assessments/[id]/report/page";
import { BoardReport } from "@/components/report/BoardReport";
import { DIAGNOSTIC_DISCLAIMER } from "@/lib/diagnostic-positioning";
import { getAssessment, getReport } from "@/lib/assessment/store";
import type { Assessment } from "@/lib/assessment/types";
import { getAssessmentReadiness } from "@/lib/readiness";

const DEMO_ID = "asm-bharat-heavy-fabrications";
const pageProps = { params: Promise.resolve({ id: DEMO_ID }) };

describe("Board report", () => {
  it("renders a dedicated Board-ready report", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));

    expect(markup).toContain("RightSense Diagnostic Report");
    expect(markup).toContain("Executive Decision Summary");
    expect(markup).toContain("Board Scorecard");
    expect(markup).toContain("Readiness action table");
    expect(markup).toContain("Evidence Boundary Summary");
  });

  it("keeps app and assessment chrome print-hidden before the cover", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));
    const workbenchLayout = source("src/app/app/layout.tsx");
    const assessmentLayout = source(
      "src/app/app/assessments/[id]/layout.tsx",
    );
    const sidebar = source("src/components/layout/AppSidebar.tsx");

    expect(sidebar).toContain("print:hidden");
    expect(workbenchLayout).toContain(
      "backdrop-blur-sm print:hidden",
    );
    expect(workbenchLayout).toContain("print:max-w-none print:p-0");
    expect(assessmentLayout).toContain("p-5 lg:p-6 print:hidden");
    expect(assessmentLayout).toContain("print:space-y-0");
    expect(markup.indexOf("Workbench Assessments")).toBe(-1);
    expect(markup.indexOf("RightSense Diagnostic Report")).toBeGreaterThan(-1);
  });

  it("uses one short cover note and one full disclaimer in the appendix", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));

    expect(count(markup, 'data-testid="cover-note"')).toBe(1);
    expect(count(markup, DIAGNOSTIC_DISCLAIMER)).toBe(1);
    expect(count(markup, 'data-testid="disclaimer-appendix"')).toBe(1);
  });

  it("keeps compact truth-map evidence after the appendix boundary", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));
    const appendixIndex = markup.indexOf('data-testid="truth-map-appendix"');
    const layerIndex = markup.indexOf(
      "Proposal and Revenue Truth",
      appendixIndex,
    );

    expect(appendixIndex).toBeGreaterThan(0);
    expect(layerIndex).toBeGreaterThan(appendixIndex);
    expect(markup).not.toContain(
      "Revenue ambition, pipeline, proposal controls, customer prequalification readiness",
    );
  });

  it("renders three non-empty risks and opportunities", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));

    expect(count(markup, 'data-testid="top-risks-item"')).toBe(3);
    expect(count(markup, 'data-testid="top-opportunities-item"')).toBe(3);
  });

  it("uses prescribed Microfinish risks and opportunities", async () => {
    const report = await getReport(DEMO_ID);
    expect(report).toBeDefined();
    const assessment: Assessment = {
      ...(await getAssessment(DEMO_ID))!,
      id: "asm-microfinish-board-report",
      companyName: "Microfinish Public-Domain Sample Diagnostic",
    };
    const readiness = getAssessmentReadiness(assessment, []);
    const markup = renderToStaticMarkup(
      BoardReport({ assessment, report: report!, readiness }),
    );

    expect(markup).toContain(
      "Public financial signals require internal validation before Board decisions.",
    );
    expect(markup).toContain(
      "Convert public-domain diagnostic into a 48-hour internal validated diagnostic.",
    );
    expect(markup).toContain(
      "Public financial signals are directional, not an approved internal baseline.",
    );
    expect(count(markup, 'data-testid="top-risks-item"')).toBe(3);
    expect(count(markup, 'data-testid="top-opportunities-item"')).toBe(3);
  });

  it("renders exactly five Board priority rows", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));
    expect(count(markup, 'data-testid="priority-row"')).toBe(5);
  });

  it("keeps each professional roadmap phase with its bullets", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));

    const thirty = testSection(markup, "roadmap-30");
    const sixty = testSection(markup, "roadmap-60");
    const ninety = testSection(markup, "roadmap-90");

    expect(thirty).toContain("Validate internal financial baseline");
    expect(thirty).toContain("Index critical statutory and standards documents");
    expect(sixty).toContain("Build customer qualification pack");
    expect(sixty).toContain("Implement AI output review workflow");
    expect(ninety).toContain("Board operating cadence");
    expect(ninety).toContain(
      "Scalable PulseIQ operating intelligence rhythm",
    );
  });

  it("keeps the existing report route and detailed route rendering", async () => {
    const rootMarkup = renderToStaticMarkup(await ReportPage(pageProps));
    const detailMarkup = renderToStaticMarkup(
      await DetailedReportPage(pageProps),
    );

    expect(rootMarkup).toContain("Board Report");
    expect(rootMarkup).toContain("Executive Decision Summary");
    expect(detailMarkup).toContain("Detailed Workbench Report");
    expect(detailMarkup).toContain(
      "Internal use only. Not intended for Board/customer circulation without review.",
    );
    expect(detailMarkup).toContain("Top 10 recommendations");
  });

  it("does not make unsupported approval or certification claims", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));

    expect(markup).not.toMatch(
      /\b(is|are|fully|formally|confirmed)\s+(certified|compliant|approved)\b/i,
    );
    expect(markup).not.toMatch(
      /\b(certification|statutory approval|customer approval)\s+(completed|confirmed|granted)\b/i,
    );
  });
});

function count(value: string, needle: string): number {
  return value.split(needle).length - 1;
}

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function testSection(markup: string, testId: string): string {
  const start = markup.indexOf(`data-testid="${testId}"`);
  expect(start).toBeGreaterThan(-1);
  const nextTestId = markup.indexOf("data-testid=", start + 20);
  return markup.slice(start, nextTestId === -1 ? undefined : nextTestId);
}
