"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addSourceDocument,
  addSource as storeAddSource,
  createAssessment as storeCreateAssessment,
  updateAssessmentStatus as storeUpdateStatus,
  updateSource,
} from "@/lib/assessment/store";
import { extractUploadedFile, previewText } from "@/lib/ingestion/extractors";
import {
  checksumSha256,
  getStorageProvider,
  sanitizeFileName,
  sourceTypeForExtension,
  validateUploadFile,
} from "@/lib/storage";
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

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value
  );
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

  const created = await storeCreateAssessment({
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
  const upload = formData.get("file");
  const hasFile = isUploadFile(upload) && upload.size > 0;
  const rawName = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  let type = String(formData.get("type") ?? "financial_filing") as SourceType;
  let name = rawName;

  if (!name && hasFile) {
    name = sanitizeFileName(upload.name);
  }
  if (!name) {
    throw new Error("Source name is required when no file is uploaded.");
  }

  if (!hasFile) {
    await storeAddSource(assessmentId, {
      name,
      type,
      notes: notes || undefined,
      extractionStatus: "not_applicable",
    });
    revalidatePath(`/app/assessments/${assessmentId}/sources`);
    revalidatePath(`/app/assessments/${assessmentId}`);
    revalidatePath(`/app/sources`);
    return { ok: true } as const;
  }

  const bytes = Buffer.from(await upload.arrayBuffer());
  const validation = validateUploadFile({
    fileName: upload.name,
    mimeType: upload.type,
    byteSize: upload.size,
  });
  type = type || sourceTypeForExtension(validation.extension) || "financial_filing";
  const checksum = checksumSha256(bytes);

  const source = await storeAddSource(assessmentId, {
    name,
    type,
    notes: notes || undefined,
    fileName: sanitizeFileName(upload.name),
    mimeType: validation.mimeType,
    byteSize: validation.byteSize,
    checksumSha256: checksum,
    extractionStatus: "extraction_pending",
  });

  if (!source) {
    throw new Error("Assessment not found.");
  }

  const storage = getStorageProvider();
  const stored = await storage.put({
    assessmentId,
    sourceId: source.id,
    fileName: upload.name,
    bytes,
  });

  const extraction = extractUploadedFile(validation.extension, bytes);
  const extractedAt =
    extraction.status === "extracted" ? new Date().toISOString() : undefined;
  const extractedTextPreview = extraction.text
    ? previewText(extraction.text)
    : undefined;

  await updateSource(source.id, {
    status: extraction.status === "extracted" ? "parsed" : "registered",
    storageProvider: stored.provider,
    storageKey: stored.key,
    extractionStatus: extraction.status,
    extractedTextPreview,
    extractedAt,
    extractionError: extraction.error,
  });

  if (extraction.text) {
    await addSourceDocument(source.id, {
      kind: "text",
      chunkIndex: 0,
      content: extraction.text,
      metadata: {
        extension: validation.extension,
        mimeType: validation.mimeType,
        checksumSha256: checksum,
      },
    });
  }

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
  await storeUpdateStatus(
    assessmentId,
    status as Parameters<typeof storeUpdateStatus>[1],
  );
  revalidatePath(`/app/assessments/${assessmentId}`);
  revalidatePath("/app/assessments");
  return { ok: true } as const;
}
