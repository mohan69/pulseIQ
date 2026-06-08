import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider } from "./index";

const UPLOAD_ROOT = path.join(process.cwd(), ".pulseiq", "uploads");

function sanitizeLocalFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\- ()]/g, "_").trim();
  return base || "uploaded-source";
}

export const localStorageProvider: StorageProvider = {
  name: "local",

  async put({ assessmentId, sourceId, fileName, bytes }) {
    const safeFileName = sanitizeLocalFileName(fileName);
    const directory = path.join(UPLOAD_ROOT, assessmentId, sourceId);
    await mkdir(directory, { recursive: true });
    const absolutePath = path.join(directory, safeFileName);
    await writeFile(absolutePath, bytes);
    return {
      provider: this.name,
      key: path
        .relative(process.cwd(), absolutePath)
        .split(path.sep)
        .join("/"),
      absolutePath,
    };
  },
};
