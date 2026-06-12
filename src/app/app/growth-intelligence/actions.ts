"use server";

import { revalidatePath } from "next/cache";
import {
  canManageGrowthWorkspace,
  getCurrentGrowthContext,
} from "@/lib/growth-intelligence/context";
import {
  createGrowthAccount,
  regenerateGrowthAccount,
  sendGrowthApprovedEmail,
  updateGrowthEmailTrackingStatus,
  updateGrowthOutcome,
  updateGrowthControlDraft,
  updateGrowthContact,
  updateGrowthStatus,
} from "@/lib/growth-intelligence/store";
import type {
  GrowthAccountInput,
  GrowthApprovalStatus,
  GrowthContactCandidate,
  GrowthDraftType,
  GrowthEmailTrackingStatus,
  GrowthPipelineStatus,
  GrowthWorkspaceSnapshot,
} from "@/lib/growth-intelligence/types";

type GrowthActionResult =
  | { ok: true; snapshot: GrowthWorkspaceSnapshot; message: string }
  | { ok: false; message: string };

type GrowthEmailActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const PIPELINE_STATUSES: GrowthPipelineStatus[] = [
  "Target Identified",
  "Diagnostic Angle Researched",
  "Diagnostic Draft Prepared",
  "Human Outreach Approved",
  "Discovery Scheduled",
  "Diagnostic Completed",
  "Product Route Recommended",
  "Pilot Proposed",
  "Pilot / Deal Won",
  "Nurture / Lost",
];

const CONTROL_DRAFT_TYPES: GrowthDraftType[] = [
  "cxoEmail",
  "functionalLeaderEmail",
  "linkedInNote",
  "whatsappMessage",
  "followUpMessage",
];

const CONTROL_STATUSES: GrowthApprovalStatus[] = [
  "Draft",
  "Needs Review",
  "Approved",
  "Sent Manually",
  "Replied",
  "Nurture",
];

async function identity() {
  const context = await getCurrentGrowthContext();
  if (!canManageGrowthWorkspace(context)) {
    throw new Error("Growth Intelligence access denied.");
  }
  return { orgId: context.orgId, userId: context.userId };
}

function cleanInput(input: GrowthAccountInput): GrowthAccountInput {
  return {
    companyName: input.companyName.trim(),
    website: input.website.trim(),
    industry: input.industry.trim(),
    location: input.location.trim(),
    segment: input.segment.trim(),
    targetProductService: input.targetProductService.trim(),
    targetPersona: input.targetPersona.trim(),
    contactName: input.contactName.trim(),
    contactRole: input.contactRole.trim(),
    linkedInUrl: input.linkedInUrl.trim(),
    notes: input.notes.trim(),
    mode: input.mode === "customer" ? "customer" : "rightsense",
  };
}

function failure(error: unknown): GrowthActionResult {
  console.error("[Growth Intelligence] persistence action failed", {
    error: error instanceof Error ? error.message.slice(0, 240) : "Unknown error",
  });
  return {
    ok: false,
    message:
      "The persistent workspace is temporarily unavailable. Your changes were not saved.",
  };
}

export async function createGrowthAccountAction(
  input: GrowthAccountInput,
): Promise<GrowthActionResult> {
  try {
    const cleaned = cleanInput(input);
    if (!cleaned.companyName) {
      return { ok: false, message: "Company Name is required." };
    }
    const snapshot = await createGrowthAccount(await identity(), cleaned);
    revalidatePath("/app/growth-intelligence");
    return { ok: true, snapshot, message: "Account created and persisted." };
  } catch (error) {
    return failure(error);
  }
}

export async function regenerateGrowthAccountAction(
  accountId: string,
): Promise<GrowthActionResult> {
  try {
    const snapshot = await regenerateGrowthAccount(await identity(), accountId);
    revalidatePath("/app/growth-intelligence");
    return { ok: true, snapshot, message: "Intelligence regenerated and persisted." };
  } catch (error) {
    return failure(error);
  }
}

export async function updateGrowthStatusAction(
  accountId: string,
  status: GrowthPipelineStatus,
): Promise<GrowthActionResult> {
  if (!PIPELINE_STATUSES.includes(status)) {
    return { ok: false, message: "Invalid pipeline status." };
  }
  try {
    const snapshot = await updateGrowthStatus(
      await identity(),
      accountId,
      status,
    );
    revalidatePath("/app/growth-intelligence");
    return { ok: true, snapshot, message: "Pipeline status persisted." };
  } catch (error) {
    return failure(error);
  }
}

export async function updateGrowthOutcomeAction(
  accountId: string,
  patch: {
    status: GrowthPipelineStatus;
    nextAction: string;
    outcome: string;
  },
): Promise<GrowthActionResult> {
  if (!PIPELINE_STATUSES.includes(patch.status)) {
    return { ok: false, message: "Invalid pipeline status." };
  }
  try {
    const snapshot = await updateGrowthOutcome(await identity(), accountId, {
      status: patch.status,
      nextAction: patch.nextAction.trim().slice(0, 500),
      outcome: patch.outcome.trim().slice(0, 500),
    });
    revalidatePath("/app/growth-intelligence");
    return { ok: true, snapshot, message: "Outcome and learning insights updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function updateGrowthControlDraftAction(
  accountId: string,
  patch: {
    draftType: GrowthDraftType;
    status: GrowthApprovalStatus;
    replyText?: string;
  },
): Promise<GrowthActionResult> {
  if (
    !CONTROL_DRAFT_TYPES.includes(patch.draftType) ||
    !CONTROL_STATUSES.includes(patch.status)
  ) {
    return { ok: false, message: "Invalid outreach review update." };
  }
  try {
    const snapshot = await updateGrowthControlDraft(
      await identity(),
      accountId,
      {
        draftType: patch.draftType,
        status: patch.status,
        replyText: patch.replyText?.trim().slice(0, 2000),
      },
    );
    revalidatePath("/app/growth-intelligence");
    return {
      ok: true,
      snapshot,
      message:
        patch.status === "Sent Manually"
          ? "Manual send logged. PulseIQ did not send a message."
          : "Outreach review status persisted.",
    };
  } catch (error) {
    return failure(error);
  }
}

export async function updateGrowthContactAction(
  accountId: string,
  contact: GrowthContactCandidate,
  preferred: boolean,
): Promise<GrowthActionResult> {
  try {
    const snapshot = await updateGrowthContact(await identity(), accountId, {
      ...contact,
      name: contact.name.trim().slice(0, 160),
      title: contact.title.trim().slice(0, 160),
      email: contact.email.trim().toLowerCase().slice(0, 320),
      phone: contact.phone.trim().slice(0, 80),
      linkedInUrl: contact.linkedInUrl.trim().slice(0, 500),
      sourceUrl: contact.sourceUrl.trim().slice(0, 500),
      verificationNote: contact.verificationNote.trim().slice(0, 500),
      lastCheckedDate: contact.lastCheckedDate.trim().slice(0, 10),
      preferred,
    });
    revalidatePath("/app/growth-intelligence");
    return {
      ok: true,
      snapshot,
      message: "Contact verification metadata persisted.",
    };
  } catch (error) {
    return failure(error);
  }
}

export async function sendApprovedGrowthEmailAction(
  accountId: string,
): Promise<GrowthEmailActionResult> {
  try {
    const result = await sendGrowthApprovedEmail(await identity(), accountId);
    revalidatePath("/app/growth-intelligence");
    return result;
  } catch (error) {
    const failed = failure(error);
    return { ok: false, message: failed.message };
  }
}

export async function updateGrowthEmailTrackingAction(
  accountId: string,
  status: Extract<GrowthEmailTrackingStatus, "Bounced" | "Follow-up Due">,
): Promise<GrowthActionResult> {
  if (status !== "Bounced" && status !== "Follow-up Due") {
    return { ok: false, message: "Invalid email tracking status." };
  }
  try {
    const snapshot = await updateGrowthEmailTrackingStatus(
      await identity(),
      accountId,
      status,
    );
    revalidatePath("/app/growth-intelligence");
    return {
      ok: true,
      snapshot,
      message: `Email tracking updated to ${status}.`,
    };
  } catch (error) {
    return failure(error);
  }
}
