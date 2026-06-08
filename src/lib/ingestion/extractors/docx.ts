import mammoth from "mammoth";
import { capExtractedText } from "./limits";

export type DocxExtractionResult = {
  text: string;
  truncated: boolean;
  warning?: string;
};

export async function extractDocx(buffer: Buffer): Promise<DocxExtractionResult> {
  const result = await mammoth.extractRawText({ buffer });
  const warnings = result.messages
    .map((message) => message.message)
    .filter(Boolean)
    .join("; ");
  const capped = capExtractedText(result.value);
  return {
    text: capped.text,
    truncated: capped.truncated,
    warning: capped.note ?? (warnings || undefined),
  };
}
