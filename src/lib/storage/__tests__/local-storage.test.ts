import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { localStorageProvider } from "@/lib/storage/local";

const assessmentId = "test-upload-assessment";
const sourceId = "test-upload-source";
const testDirectory = path.join(
  process.cwd(),
  ".pulseiq",
  "uploads",
  assessmentId,
  sourceId,
);

describe("local storage provider", () => {
  afterEach(async () => {
    await rm(testDirectory, { recursive: true, force: true });
  });

  it("stores files outside public routes", async () => {
    const bytes = Buffer.from("PulseIQ local storage test");
    const stored = await localStorageProvider.put({
      assessmentId,
      sourceId,
      fileName: "../customer-notes.txt",
      bytes,
    });

    expect(stored.provider).toBe("local");
    expect(stored.key).toBe(
      `.pulseiq/uploads/${assessmentId}/${sourceId}/customer-notes.txt`,
    );
    expect(stored.absolutePath).not.toContain(`${path.sep}public${path.sep}`);
    await expect(readFile(stored.absolutePath, "utf8")).resolves.toBe(
      "PulseIQ local storage test",
    );
  });
});
