import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BoardReportPage from "@/app/app/assessments/[id]/report/board/page";
import DetailedReportPage from "@/app/app/assessments/[id]/report/detail/page";
import ReportPage from "@/app/app/assessments/[id]/report/page";
import { DIAGNOSTIC_DISCLAIMER } from "@/lib/diagnostic-positioning";

const DEMO_ID = "asm-bharat-heavy-fabrications";
const pageProps = { params: Promise.resolve({ id: DEMO_ID }) };

describe("Board report", () => {
  it("renders a dedicated Board-ready report", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));

    expect(markup).toContain("RightSense Diagnostic Report");
    expect(markup).toContain("Executive Decision Summary");
    expect(markup).toContain("Board Scorecard");
    expect(markup).toContain("Readiness action table");
    expect(markup).toContain("Detailed Truth Map");
  });

  it("keeps app and assessment chrome print-hidden", () => {
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
  });

  it("uses one short cover note and one full disclaimer in the appendix", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));

    expect(count(markup, 'data-testid="cover-note"')).toBe(1);
    expect(count(markup, DIAGNOSTIC_DISCLAIMER)).toBe(1);
    expect(count(markup, 'data-testid="disclaimer-appendix"')).toBe(1);
  });

  it("keeps detailed truth-map content after the appendix boundary", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));
    const appendixIndex = markup.indexOf('data-testid="truth-map-appendix"');
    const layerDescriptionIndex = markup.indexOf(
      "Revenue ambition, pipeline, proposal controls",
    );

    expect(appendixIndex).toBeGreaterThan(0);
    expect(layerDescriptionIndex).toBeGreaterThan(appendixIndex);
  });

  it("uses the professional 30/60/90 roadmap labels", async () => {
    const markup = renderToStaticMarkup(await BoardReportPage(pageProps));

    for (const label of [
      "Validate internal financial baseline",
      "Build product-family revenue/margin view",
      "Build customer qualification pack",
      "Implement AI output review workflow",
      "Board operating cadence",
      "Scalable PulseIQ operating intelligence rhythm",
    ]) {
      expect(markup).toContain(label);
    }
  });

  it("keeps the existing report route and detailed route rendering", async () => {
    const rootMarkup = renderToStaticMarkup(await ReportPage(pageProps));
    const detailMarkup = renderToStaticMarkup(
      await DetailedReportPage(pageProps),
    );

    expect(rootMarkup).toContain("Board Report");
    expect(rootMarkup).toContain("Executive Decision Summary");
    expect(detailMarkup).toContain("Detailed Workbench Report");
    expect(detailMarkup).toContain("Top 10 recommendations");
  });
});

function count(value: string, needle: string): number {
  return value.split(needle).length - 1;
}

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}
