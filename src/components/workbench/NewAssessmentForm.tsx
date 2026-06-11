"use client";

import {
  createAssessmentAction,
} from "@/app/app/actions";
import type {
  AssessmentObjective,
  Industry,
} from "@/lib/assessment/types";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "industrial_manufacturing", label: "Industrial Manufacturing" },
  { value: "epc", label: "EPC / Infrastructure" },
  { value: "valve_manufacturer", label: "Valve Manufacturer" },
  { value: "pump_manufacturer", label: "Pump Manufacturer" },
  { value: "industrial_oem", label: "Industrial OEM" },
  { value: "project_manufacturing", label: "Project Manufacturing" },
  { value: "mid_market_enterprise", label: "Mid-Market Enterprise" },
  { value: "other", label: "Other" },
];

const OBJECTIVES: { value: AssessmentObjective; label: string }[] = [
  { value: "board_review", label: "RightSense diagnostic / board review" },
  { value: "ai_transformation", label: "AI governance & transformation" },
  { value: "revenue_push", label: "Revenue push" },
  { value: "margin_improvement", label: "Margin improvement" },
  { value: "operating_reset", label: "Operating reset" },
  { value: "investor_review", label: "Investor review" },
  { value: "turnaround", label: "Turnaround" },
];

export function NewAssessmentForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    industry: "industrial_manufacturing" as Industry,
    objective: "board_review" as AssessmentObjective,
    revenueTargetCr: 150,
    marginTargetPct: 26,
    cashTargetCr: 25,
    headcountProductivityTargetL: 32,
  });

  const action = (formData: FormData) => {
    setError(null);
    formData.set("companyName", form.companyName);
    formData.set("industry", form.industry);
    formData.set("objective", form.objective);
    formData.set("revenueTargetCr", String(form.revenueTargetCr));
    formData.set("marginTargetPct", String(form.marginTargetPct));
    formData.set("cashTargetCr", String(form.cashTargetCr));
    formData.set("headcountProductivityTargetL", String(form.headcountProductivityTargetL));
    startTransition(async () => {
      try {
        await createAssessmentAction(formData);
      } catch (err) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
      }
    });
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5">
        <Field label="Company name" required>
          <input
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            placeholder="e.g. Bharat Heavy Fabrications Pvt Ltd"
            className="form-input"
            autoFocus
          />
        </Field>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Industry">
            <select
              value={form.industry}
              onChange={(e) => set("industry", e.target.value as Industry)}
              className="form-input"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assessment objective">
            <select
              value={form.objective}
              onChange={(e) => set("objective", e.target.value as AssessmentObjective)}
              className="form-input"
            >
              {OBJECTIVES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="FY revenue target" hint="₹ Crore">
            <input
              type="number"
              min={0}
              step={1}
              value={form.revenueTargetCr}
              onChange={(e) => set("revenueTargetCr", Number(e.target.value))}
              className="form-input"
            />
          </Field>
          <Field label="Target gross margin" hint="percent">
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={form.marginTargetPct}
              onChange={(e) => set("marginTargetPct", Number(e.target.value))}
              className="form-input"
            />
          </Field>
          <Field label="Cash target" hint="₹ Crore">
            <input
              type="number"
              min={0}
              step={1}
              value={form.cashTargetCr}
              onChange={(e) => set("cashTargetCr", Number(e.target.value))}
              className="form-input"
            />
          </Field>
          <Field label="Revenue per employee target" hint="₹ Lakh / employee">
            <input
              type="number"
              min={0}
              step={0.5}
              value={form.headcountProductivityTargetL}
              onChange={(e) =>
                set("headcountProductivityTargetL", Number(e.target.value))
              }
              className="form-input"
            />
          </Field>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/20 bg-error-muted px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={pending} className="px-6">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              Create assessment
              <ArrowRight className="h-4 w-4" />
            </>
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
        :global(.form-input::placeholder) {
          color: var(--muted);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </span>
        {hint && <span className="text-[11px] text-muted">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
