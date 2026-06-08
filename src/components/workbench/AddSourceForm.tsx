"use client";

import { addSourceAction } from "@/app/app/actions";
import type { SourceType } from "@/lib/assessment/types";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, X } from "lucide-react";

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: "financial_filing", label: "Financial filing (audited P&L / BS)" },
  { value: "strategy_deck", label: "Strategy / board deck" },
  { value: "sop", label: "SOP / process document" },
  { value: "excel_tracker", label: "Excel tracker" },
  { value: "erp_export", label: "ERP export (GL / AR / AP / Inventory)" },
  { value: "crm_export", label: "CRM export (opportunities / pipeline)" },
  { value: "hrms_export", label: "HRMS export" },
  { value: "operations_report", label: "Operations / plant report" },
  { value: "proposal_report", label: "Proposal submission log" },
  { value: "email_summary", label: "Email summary (consented, summarised only)" },
  { value: "meeting_summary", label: "Meeting summary (consented, summarised only)" },
];

export function AddSourceForm({ assessmentId }: { assessmentId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="px-4">
        <Plus className="h-4 w-4" />
        Add source
      </Button>
    );
  }

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await addSourceAction(assessmentId, formData);
        setOpen(false);
      } catch (err) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
      }
    });
  };

  return (
    <form
      action={onSubmit}
      className="rounded-xl border border-border bg-white p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-foreground">
            Register a new source
          </div>
          <div className="text-xs text-muted mt-0.5">
            Add a document, export, or summary. TXT and CSV are extracted now;
            PDF, DOCX, PPTX, and XLSX are stored and marked for extraction.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4">
        <label className="block">
          <div className="text-sm font-medium text-foreground mb-1.5">
            Source name <span className="text-muted font-normal">(optional with file)</span>
          </div>
          <input
            name="name"
            placeholder="e.g. FY25 Audited Financials"
            className="form-input"
            autoFocus
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium text-foreground mb-1.5">
            Source type
          </div>
          <select name="type" defaultValue="financial_filing" className="form-input">
            {SOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="text-sm font-medium text-foreground mb-1.5">
            File upload <span className="text-muted font-normal">(optional)</span>
          </div>
          <input
            name="file"
            type="file"
            accept=".txt,.csv,.pdf,.docx,.pptx,.xlsx,text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="form-input"
            style={{ paddingTop: 8 }}
          />
          <p className="mt-1 text-[11px] text-muted">
            Max 10 MB. Files are stored privately under local workbench storage
            in development.
          </p>
        </label>
        <label className="block">
          <div className="text-sm font-medium text-foreground mb-1.5">
            Notes <span className="text-muted font-normal">(optional)</span>
          </div>
          <textarea
            name="notes"
            rows={2}
            placeholder="What does this source cover? Any caveats?"
            className="form-input"
            style={{ height: "auto", padding: "8px 12px" }}
          />
        </label>
      </div>
      {error && (
        <div className="rounded-lg border border-error/20 bg-error-muted px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding…
            </>
          ) : (
            "Add source"
          )}
        </Button>
      </div>
      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--foreground);
          font-size: 14px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.form-input:focus) {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-muted);
        }
      `}</style>
    </form>
  );
}
