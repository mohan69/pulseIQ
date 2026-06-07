import Link from "next/link";
import { listAssessments } from "@/lib/assessment/store";
import { getSources } from "@/lib/assessment/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileStack,
  ArrowRight,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function AllSourcesPage() {
  const assessments = listAssessments();
  type Row = {
    sourceId: string;
    sourceName: string;
    sourceType: string;
    sourceStatus: string;
    sourceNotes: string;
    assessmentId: string;
    companyName: string;
  };
  const rows: Row[] = [];
  for (const a of assessments) {
    for (const s of getSources(a.id)) {
      rows.push({
        sourceId: s.id,
        sourceName: s.name,
        sourceType: s.type,
        sourceStatus: s.status,
        sourceNotes: s.notes,
        assessmentId: a.id,
        companyName: a.companyName,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All sources</h1>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Every document, export, and summary registered across every
          assessment. Each row is traceable to its parent assessment, with
          status, confidence, and notes.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-accent-muted flex items-center justify-center mb-4">
            <FileStack className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            No sources yet
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Once you attach sources to an assessment, they will be listed here
            across the whole workbench.
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All registered sources</CardTitle>
            <CardDescription>
              {rows.length} source{rows.length === 1 ? "" : "s"} across{" "}
              {assessments.length} assessment
              {assessments.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="pb-3 pr-3 font-medium">Source</th>
                  <th className="pb-3 pr-3 font-medium">Assessment</th>
                  <th className="pb-3 pr-3 font-medium">Type</th>
                  <th className="pb-3 pr-3 font-medium">Status</th>
                  <th className="pb-3 pr-3 font-medium">Notes</th>
                  <th className="pb-3 pr-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {rows.map((r) => (
                  <tr key={r.sourceId} className="align-top">
                    <td className="py-3 pr-3 font-medium text-foreground">
                      {r.sourceName}
                    </td>
                    <td className="py-3 pr-3">
                      <Link
                        href={`/app/assessments/${r.assessmentId}`}
                        className="inline-flex items-center gap-1.5 text-foreground-secondary hover:text-accent"
                      >
                        <Building2 className="h-3.5 w-3.5 text-muted" />
                        {r.companyName}
                      </Link>
                    </td>
                    <td className="py-3 pr-3">
                      <Badge variant="outline" className="bg-white">
                        {r.sourceType.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 pr-3">
                      <StatusPill status={r.sourceStatus} />
                    </td>
                    <td className="py-3 pr-3 text-foreground-secondary max-w-md">
                      {r.sourceNotes || <span className="text-muted">—</span>}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <Link
                        href={`/app/assessments/${r.assessmentId}/sources`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
                      >
                        Open
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "parsed")
    return (
      <Badge variant="success" className="inline-flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Parsed
      </Badge>
    );
  if (status === "parsing")
    return (
      <Badge variant="info" className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Parsing
      </Badge>
    );
  if (status === "failed")
    return (
      <Badge variant="destructive" className="inline-flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  return (
    <Badge variant="outline" className="inline-flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      Registered
    </Badge>
  );
}
