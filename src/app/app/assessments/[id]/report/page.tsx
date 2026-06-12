import { notFound } from "next/navigation";
import { BoardReport } from "@/components/report/BoardReport";
import { ReportViewNav } from "@/components/report/ReportViewNav";
import { getAssessment, getReport, getSources } from "@/lib/assessment/store";
import { getAssessmentReadiness } from "@/lib/readiness";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [assessment, report, sources] = await Promise.all([
    getAssessment(id),
    getReport(id),
    getSources(id),
  ]);
  if (!assessment || !report) notFound();
  const readiness = getAssessmentReadiness(assessment, sources);

  return (
    <div className="board-report-route space-y-6 print:space-y-0">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Board Report</h2>
          <p className="mt-1 text-sm text-muted">
            Leadership-ready report with a decision summary, scorecard,
            evidence actions, roadmap, and supporting appendix.
          </p>
        </div>
        <ReportViewNav assessmentId={id} active="board" />
      </div>
      <BoardReport
        assessment={assessment}
        report={report}
        readiness={readiness}
      />
    </div>
  );
}
