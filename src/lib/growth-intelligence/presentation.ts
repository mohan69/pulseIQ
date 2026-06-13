import type { GrowthContactCandidate } from "./types";

export const GROWTH_INTERNAL_WORKSPACE_NOTICE =
  "Internal RightSense Growth Intelligence workspace. Tenant-scoped demo and approved account data only. Drafts require human approval; PulseIQ does not send outbound messages.";

const PRODUCT_NAMES: Array<[RegExp, string]> = [
  [/\bright\s*sense\b/gi, "RightSense"],
  [/\bpulse\s*iq\b/gi, "PulseIQ"],
  [/\bwins\s*proposal\b/gi, "WinsProposal"],
  [/\btalent\s*pulse\b/gi, "TalentPulse"],
];

export function normalizeGrowthProductNames(value: string): string {
  return PRODUCT_NAMES.reduce(
    (result, [pattern, replacement]) =>
      result.replace(pattern, replacement),
    value,
  );
}

export function removeRepeatedEvidenceLabel(value: string): string {
  return value.replace(/^\s*evidence needed\s*:\s*/i, "").trim();
}

export function formatFollowUpDate(
  value: string | undefined,
  today = new Date(),
): string {
  if (!value) return "Review follow-up date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Review follow-up date";

  const due = Date.UTC(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate(),
  );
  const current = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return due < current ? "Follow-up overdue" : value;
}

export function contactVerificationLabel(
  contact: GrowthContactCandidate,
): string {
  const sampleArtifact = /example\.com|\/demo-|demo-/i.test(
    `${contact.sourceUrl} ${contact.linkedInUrl}`,
  );
  if (
    sampleArtifact ||
    contact.confidence !== "High" ||
    !contact.allowedToContact
  ) {
    return "Needs manual verification";
  }
  return "Verified for reviewed use";
}
