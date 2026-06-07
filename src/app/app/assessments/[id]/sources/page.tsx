import { notFound } from "next/navigation";
import {
  getAssessment,
  getSources,
} from "@/lib/assessment/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
} from "lucide-react";
import { AddSourceForm } from "@/components/workbench/AddSourceForm";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = getAssessment(id);
  if (!assessment) notFound();
  const sources = getSources(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Sources</h2>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            Every document, export, or summary the workbench is allowed to read.
            Each fact in the UI traces back to a source and a confidence level.
            Email and meeting sources are optional and only ever summarised.
          </p>
        </div>
        <AddSourceForm assessmentId={id} />
      </div>

      {sources.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-accent-muted flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            No sources registered yet
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Add your first source to start building the truth map. Typical
            starting set: FY25 audited financials, board strategy deck, and
            the SOP for quote approval.
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registered sources</CardTitle>
            <CardDescription>
              {sources.length} source{sources.length === 1 ? "" : "s"} · {sources.filter((s) => s.status === "parsed").length} parsed · {sources.filter((s) => s.status === "failed").length} failed
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="pb-3 pr-3 font-medium">Name</th>
                  <th className="pb-3 pr-3 font-medium">Type</th>
                  <th className="pb-3 pr-3 font-medium">Status</th>
                  <th className="pb-3 pr-3 font-medium">Confidence</th>
                  <th className="pb-3 pr-3 font-medium">Pages</th>
                  <th className="pb-3 pr-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sources.map((s) => (
                  <tr key={s.id} className="align-top">
                    <td className="py-3 pr-3 font-medium text-foreground">
                      {s.name}
                    </td>
                    <td className="py-3 pr-3">
                      <Badge variant="outline" className="bg-white">
                        {s.type.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 pr-3">
                      <ConfidenceBadge level={s.confidence} />
                    </td>
                    <td className="py-3 pr-3 text-muted">
                      {s.pageCount ?? "—"}
                    </td>
                    <td className="py-3 pr-3 text-foreground-secondary max-w-md">
                      {s.notes || <span className="text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            How sources are handled
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
          {[
            "Every fact traces to a source with a confidence level.",
            "Source content is read-only — never modified by the workbench.",
            "Email and meeting sources are optional, summarised only, never republished verbatim.",
            "Failed parses are flagged so the team can re-upload or escalate.",
          ].map((line) => (
            <div
              key={line}
              className="flex items-start gap-2 text-foreground-secondary"
            >
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span>{line}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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
        Processing
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
      <span className="h-3 w-3 rounded-full bg-muted" />
      Registered
    </Badge>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  if (level === "high")
    return <Badge variant="success">High</Badge>;
  if (level === "medium")
    return <Badge variant="warning">Medium</Badge>;
  return <Badge variant="destructive">Low</Badge>;
}
