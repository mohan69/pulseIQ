import Link from "next/link";
import { FileSearch, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportPrintButton } from "@/components/workbench/ReportPrintButton";

export function ReportViewNav({
  assessmentId,
  active,
}: {
  assessmentId: string;
  active: "board" | "detail";
}) {
  const base = `/app/assessments/${assessmentId}/report`;
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Link
        href={`${base}/board`}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
          active === "board"
            ? "border-accent bg-accent text-white"
            : "border-border bg-white text-foreground hover:bg-surface-hover",
        )}
      >
        <Presentation className="h-4 w-4" />
        Board Report
      </Link>
      <Link
        href={`${base}/detail`}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
          active === "detail"
            ? "border-accent bg-accent text-white"
            : "border-border bg-white text-foreground hover:bg-surface-hover",
        )}
      >
        <FileSearch className="h-4 w-4" />
        Detailed Report
      </Link>
      <ReportPrintButton assessmentId={assessmentId} />
    </div>
  );
}
