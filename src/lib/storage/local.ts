import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider } from "./index";

const UPLOAD_ROOT = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  ".pulseiq",
  "uploads",
);

function sanitizeLocalFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\- ()]/g, "_").trim();
  return base || "uploaded-source";
}

export const localStorageProvider: StorageProvider = {
  name: "local",

  async put({ assessmentId, sourceId, fileName, bytes, checksumSha256 }) {
    const safeFileName = sanitizeLocalFileName(fileName);
    const directory = path.join(UPLOAD_ROOT, assessmentId, sourceId);
    await mkdir(directory, { recursive: true });
    const absolutePath = path.join(directory, safeFileName);
    await writeFile(absolutePath, bytes);
    return {
      provider: this.name,
      container: "local",
      key: path
        .relative(/*turbopackIgnore: true*/ process.cwd(), absolutePath)
        .split(path.sep)
        .join("/"),
      absolutePath,
      byteSize: bytes.length,
      checksumSha256,
    };
  },

  async delete({ key }) {
    const absolutePath = path.resolve(
      /*turbopackIgnore: true*/ process.cwd(),
      key,
    );
    const uploadRoot = path.resolve(UPLOAD_ROOT);
    if (!absolutePath.startsWith(uploadRoot + path.sep)) {
      throw new Error("Refusing to delete a file outside PulseIQ upload storage.");
    }
    await rm(absolutePath, { force: true });
  },
};
