"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addAuditEvent,
  addSourceDocument,
  addSource as storeAddSource,
  createAssessment as storeCreateAssessment,
  deleteAssessment,
  deleteSource,
  getAssessment,
  updateAssessmentStatus as storeUpdateStatus,
  updateSource,
} from "@/lib/assessment/store";
import { extractUploadedFile, previewText } from "@/lib/ingestion/extractors";
import { runAssessmentAnalysis } from "@/lib/analysis/run-analysis";
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

const DEMO_ASSESSMENT_ID = "asm-bharat-heavy-fabrications";

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
  await addAuditEvent({
    action: "assessment_created",
    entityType: "assessment",
    entityId: created.id,
    assessmentId: created.id,
    metadata: {
      companyName: created.companyName,
      industry: created.industry,
      objective: created.objective,
    },
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
    const source = await storeAddSource(assessmentId, {
      name,
      type,
      notes: notes || undefined,
      extractionStatus: "not_applicable",
    });
    if (source) {
      await addAuditEvent({
        action: "source_added",
        entityType: "source",
        entityId: source.id,
        assessmentId,
        metadata: {
          sourceName: source.name,
          sourceType: source.type,
          origin: source.origin ?? "manual",
        },
      });
    }
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
    mimeType: validation.mimeType,
    bytes,
    checksumSha256: checksum,
  });

  const extraction = await extractUploadedFile(validation.extension, bytes);
  const extractedAt =
    extraction.status === "extracted" ? new Date().toISOString() : undefined;
  const extractedTextPreview = extraction.text
    ? previewText(extraction.text)
    : undefined;

  await updateSource(source.id, {
    status:
      extraction.status === "extracted"
        ? "parsed"
        : extraction.status === "failed"
          ? "failed"
          : "registered",
    storageProvider: stored.provider,
    storageContainer: stored.container,
    storageKey: stored.key,
    pageCount: extraction.pageCount,
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
        pageCount: extraction.pageCount,
        truncated: extraction.truncated,
        warning: extraction.error,
      },
    });
  }

  await addAuditEvent({
    action: "source_uploaded",
    entityType: "source",
    entityId: source.id,
    assessmentId,
    metadata: {
      sourceName: source.name,
      sourceType: source.type,
      fileName: source.fileName,
      mimeType: source.mimeType,
      byteSize: source.byteSize,
      checksumSha256: checksum,
      extractionStatus: extraction.status,
      pageCount: extraction.pageCount,
      truncated: extraction.truncated,
    },
  });

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

export type AnalyzeAssessmentActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function analyzeAssessmentAction(
  assessmentId: string,
  previousState: AnalyzeAssessmentActionState,
): Promise<AnalyzeAssessmentActionState> {
  void previousState;
  let result;
  try {
    result = await runAssessmentAnalysis(assessmentId);
  } catch (error) {
    console.error("[PulseIQ Analysis] action_failed", {
      assessmentId,
      error:
        error instanceof Error ? error.message.slice(0, 240) : "Unknown error",
    });
    result = {
      ok: false,
      message: "Analysis could not be started. Check server logs and retry.",
    };
  }
  revalidatePath(`/app/assessments/${assessmentId}`);
  revalidatePath(`/app/assessments/${assessmentId}/sources`);
  revalidatePath(`/app/assessments/${assessmentId}/truth-map`);
  revalidatePath(`/app/assessments/${assessmentId}/cockpit`);
  revalidatePath(`/app/assessments/${assessmentId}/what-if`);
  revalidatePath(`/app/assessments/${assessmentId}/recommendations`);
  revalidatePath(`/app/assessments/${assessmentId}/report`);
  revalidatePath("/app");
  revalidatePath("/app/assessments");
  return {
    status: result.ok ? "success" : "error",
    message: result.message,
  };
}

export async function deleteSourceAction(
  assessmentId: string,
  formData: FormData,
) {
  if (assessmentId === DEMO_ASSESSMENT_ID) {
    throw new Error("The golden demo assessment cannot be modified.");
  }
  const sourceId = String(formData.get("sourceId") ?? "");
  if (!sourceId) throw new Error("Source id is required.");

  await addAuditEvent({
    action: "source_deleted",
    entityType: "source",
    entityId: sourceId,
    assessmentId,
  });
  await deleteSource(sourceId);
  revalidatePath(`/app/assessments/${assessmentId}`);
  revalidatePath(`/app/assessments/${assessmentId}/sources`);
  revalidatePath("/app/sources");
}

export type DeleteAssessmentActionResult = {
  ok: boolean;
  message: string;
};

export async function deleteAssessmentAction(
  assessmentId: string,
): Promise<DeleteAssessmentActionResult> {
  if (assessmentId === DEMO_ASSESSMENT_ID) {
    return {
      ok: false,
      message: "Protected demo assessment cannot be deleted.",
    };
  }
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    return { ok: false, message: "Assessment was not found." };
  }

  const deleted = await deleteAssessment(assessmentId);
  if (!deleted) {
    return {
      ok: false,
      message: "Assessment could not be deleted. Refresh and try again.",
    };
  }
  try {
    await addAuditEvent({
      action: "assessment_deleted",
      entityType: "assessment",
      entityId: assessmentId,
      metadata: {
        companyName: assessment.companyName,
      },
    });
  } catch (error) {
    console.warn("[PulseIQ Assessment] deletion audit failed", {
      assessmentId,
      error:
        error instanceof Error ? error.message.slice(0, 240) : "Unknown error",
    });
  }
  revalidatePath("/app");
  revalidatePath("/app/assessments");
  revalidatePath("/app/sources");
  return { ok: true, message: "Assessment deleted." };
}

export async function reportPrintedAction(assessmentId: string) {
  await addAuditEvent({
    action: "report_printed",
    entityType: "assessment",
    entityId: assessmentId,
    assessmentId,
  });
}
