import { createHash } from "node:crypto";
import path from "node:path";
import type { SourceType } from "@/lib/assessment/types";
import { localStorageProvider } from "./local";

export type StoredFile = {
  provider: string;
  key: string;
  absolutePath: string;
};

export type FileValidationResult = {
  extension: SupportedUploadExtension;
  mimeType: string;
  byteSize: number;
};

export type SupportedUploadExtension =
  | ".txt"
  | ".csv"
  | ".pdf"
  | ".docx"
  | ".pptx"
  | ".xlsx";

export type StorageProvider = {
  readonly name: string;
  put(input: {
    assessmentId: string;
    sourceId: string;
    fileName: string;
    bytes: Buffer;
  }): Promise<StoredFile>;
};

const MAX_FILE_SIZE_BYTES = Number(
  process.env.PULSEIQ_MAX_UPLOAD_BYTES ?? 10 * 1024 * 1024,
);

const ALLOWED_EXTENSIONS = new Set<SupportedUploadExtension>([
  ".txt",
  ".csv",
  ".pdf",
  ".docx",
  ".pptx",
  ".xlsx",
]);

const ALLOWED_MIME_TYPES = new Set([
  "text/plain",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
]);

const EXECUTABLE_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".cpl",
  ".dll",
  ".jar",
  ".js",
  ".jse",
  ".lnk",
  ".msi",
  ".ps1",
  ".psm1",
  ".reg",
  ".scr",
  ".sh",
  ".ts",
  ".tsx",
  ".vb",
  ".vbs",
  ".wsf",
]);

const ARCHIVE_EXTENSIONS = new Set([
  ".7z",
  ".bz2",
  ".gz",
  ".rar",
  ".tar",
  ".tgz",
  ".zip",
]);

export function getStorageProvider(): StorageProvider {
  return localStorageProvider;
}

export function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\- ()]/g, "_").trim();
  return base || "uploaded-source";
}

export function checksumSha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function validateUploadFile(input: {
  fileName: string;
  mimeType?: string;
  byteSize: number;
}): FileValidationResult {
  const extension = path
    .extname(input.fileName)
    .toLowerCase() as SupportedUploadExtension;
  const mimeType = input.mimeType || "application/octet-stream";
  const normalizedName = input.fileName.toLowerCase();
  const nameParts = normalizedName.split(".").filter(Boolean);

  if (EXECUTABLE_EXTENSIONS.has(extension)) {
    throw new Error("Executable or script files are not allowed.");
  }
  if (ARCHIVE_EXTENSIONS.has(extension)) {
    throw new Error("Archive files are not allowed. Upload TXT, CSV, PDF, DOCX, PPTX, or XLSX only.");
  }
  if (
    nameParts.length > 2 &&
    nameParts
      .slice(0, -1)
      .some((part) =>
        EXECUTABLE_EXTENSIONS.has(`.${part}`) || ARCHIVE_EXTENSIONS.has(`.${part}`),
      )
  ) {
    throw new Error("Files with executable, script, or archive double extensions are not allowed.");
  }
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(
      "Unsupported file type. Upload TXT, CSV, PDF, DOCX, PPTX, or XLSX.",
    );
  }
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Unsupported MIME type: ${mimeType}.`);
  }
  if (input.byteSize <= 0) {
    throw new Error("Uploaded file is empty.");
  }
  if (input.byteSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File is too large. Maximum upload size is ${Math.round(MAX_FILE_SIZE_BYTES / 1024 / 1024)} MB.`,
    );
  }

  return { extension, mimeType, byteSize: input.byteSize };
}

export function sourceTypeForExtension(
  extension: SupportedUploadExtension,
): SourceType | undefined {
  switch (extension) {
    case ".csv":
    case ".xlsx":
      return "excel_tracker";
    case ".pdf":
      return "financial_filing";
    case ".docx":
      return "sop";
    case ".pptx":
      return "strategy_deck";
    case ".txt":
      return undefined;
  }
}
