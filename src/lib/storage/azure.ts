import { BlobServiceClient } from "@azure/storage-blob";
import path from "node:path";
import type { StorageProvider } from "./index";

const DEFAULT_CONTAINER = "pulseiq-sources";
const DEFAULT_ORGANIZATION_ID = "org-pulseiq-internal";

function sanitizeBlobFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\- ()]/g, "_").trim();
  return base || "uploaded-source";
}

export function getAzureContainerName(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.AZURE_STORAGE_CONTAINER?.trim() || DEFAULT_CONTAINER;
}

export function getAzureConnectionString(
  env: Record<string, string | undefined> = process.env,
): string {
  const connectionString = env.AZURE_STORAGE_CONNECTION_STRING?.trim();
  if (!connectionString) {
    throw new Error(
      "STORAGE_PROVIDER=azure requires AZURE_STORAGE_CONNECTION_STRING.",
    );
  }
  return connectionString;
}

export function buildAzureStorageKey(input: {
  organizationId?: string;
  assessmentId: string;
  sourceId: string;
  checksumSha256: string;
  fileName: string;
}): string {
  const organizationId =
    input.organizationId?.trim() ||
    process.env.PULSEIQ_STORAGE_ORGANIZATION_ID ||
    DEFAULT_ORGANIZATION_ID;
  const safeFileName = sanitizeBlobFileName(input.fileName);
  return [
    "org",
    organizationId,
    "assessment",
    input.assessmentId,
    "source",
    input.sourceId,
    `${input.checksumSha256}-${safeFileName}`,
  ].join("/");
}

export const azureStorageProvider: StorageProvider = {
  name: "azure",

  async put(input) {
    const containerName = getAzureContainerName();
    const connectionString = getAzureConnectionString();
    const key = buildAzureStorageKey({
      organizationId: input.organizationId,
      assessmentId: input.assessmentId,
      sourceId: input.sourceId,
      checksumSha256: input.checksumSha256,
      fileName: input.fileName,
    });
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    await blockBlobClient.uploadData(input.bytes, {
      blobHTTPHeaders: input.mimeType
        ? { blobContentType: input.mimeType }
        : undefined,
      metadata: {
        assessmentId: input.assessmentId,
        sourceId: input.sourceId,
        checksumSha256: input.checksumSha256,
      },
    });
    return {
      provider: this.name,
      container: containerName,
      key,
      byteSize: input.bytes.length,
      checksumSha256: input.checksumSha256,
    };
  },

  async delete(input) {
    const containerName = input.container || getAzureContainerName();
    const connectionString = getAzureConnectionString();
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.deleteBlob(input.key);
  },
};
