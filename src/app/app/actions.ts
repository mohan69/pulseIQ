"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addSource as storeAddSource,
  createAssessment as storeCreateAssessment,
  updateAssessmentStatus as storeUpdateStatus,
} from "@/lib/assessment/store";
import type {
  AssessmentObjective,
  Industry,
  SourceType,
} from "@/lib/assessment/types";

function parseNumber(v: FormDataEntryValue | null, fallback: number): number {
  if (v === null) return fallback;
  const n = Number(String(v));
  return Number.isFinite(n) ? n : fallback;
}

export async function createAssessmentAction(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) {
    throw new Error("Company name is required.");
  }
  const industry = String(formData.get("industry") ?? "industrial_manufacturing") as Industry;
  const objective = String(formData.get("objective") ?? "board_review") as AssessmentObjective;
  const revenueTargetCr = parseNumber(formData.get("revenueTargetCr"), 150);
  const marginTargetPct = parseNumber(formData.get("marginTargetPct"), 26);
  const cashTargetCr = parseNumber(formData.get("cashTargetCr"), 25);
  const rpeTargetL = parseNumber(formData.get("headcountProductivityTargetL"), 32);

  const created = storeCreateAssessment({
    companyName,
    industry,
    objective,
    revenueTarget: revenueTargetCr * 10_000_000,
    marginTarget: marginTargetPct,
    cashTarget: cashTargetCr * 10_000_000,
    headcountProductivityTarget: rpeTargetL * 100_000,
  });
  revalidatePath("/app/assessments");
  redirect(`/app/assessments/${created.id}`);
}

export async function addSourceAction(
  assessmentId: string,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Source name is required.");
  }
  const type = String(formData.get("type") ?? "financial_filing") as SourceType;
  const notes = String(formData.get("notes") ?? "").trim();
  storeAddSource(assessmentId, { name, type, notes: notes || undefined });
  revalidatePath(`/app/assessments/${assessmentId}/sources`);
  revalidatePath(`/app/assessments/${assessmentId}`);
  revalidatePath(`/app/sources`);
  return { ok: true } as const;
}

export async function setAssessmentStatusAction(
  assessmentId: string,
  formData: FormData,
) {
  const status = String(formData.get("status") ?? "");
  if (!status) return { ok: false } as const;
  storeUpdateStatus(assessmentId, status as Parameters<typeof storeUpdateStatus>[1]);
  revalidatePath(`/app/assessments/${assessmentId}`);
  revalidatePath("/app/assessments");
  return { ok: true } as const;
}
