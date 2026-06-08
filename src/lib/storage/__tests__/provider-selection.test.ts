import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAzureStorageKey,
  getAzureConnectionString,
} from "@/lib/storage/azure";
import {
  getStorageProvider,
  resolveStorageProviderName,
} from "@/lib/storage";

describe("storage provider selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to local storage", () => {
    expect(resolveStorageProviderName({})).toBe("local");
    expect(getStorageProvider({}).name).toBe("local");
  });

  it("selects Azure when STORAGE_PROVIDER=azure", () => {
    expect(resolveStorageProviderName({ STORAGE_PROVIDER: "azure" })).toBe(
      "azure",
    );
    expect(getStorageProvider({ STORAGE_PROVIDER: "azure" }).name).toBe(
      "azure",
    );
  });

  it("throws a helpful error when Azure connection string is missing", () => {
    expect(() => getAzureConnectionString({})).toThrow(
      "STORAGE_PROVIDER=azure requires AZURE_STORAGE_CONNECTION_STRING.",
    );
  });

  it("builds private Azure blob keys with organization, assessment, source, checksum, and safe file name", () => {
    const key = buildAzureStorageKey({
      organizationId: "org-test",
      assessmentId: "asm-123",
      sourceId: "src-456",
      checksumSha256: "abc123",
      fileName: "../Board Deck FY26.pdf",
    });

    expect(key).toBe(
      "org/org-test/assessment/asm-123/source/src-456/abc123-Board Deck FY26.pdf",
    );
    expect(key).not.toContain("..");
  });
});
