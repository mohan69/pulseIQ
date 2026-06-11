"use server";

import { revalidatePath } from "next/cache";
import {
  canManageGrowthWorkspace,
  getCurrentGrowthContext,
} from "@/lib/growth-intelligence/context";
import {
  createGrowthAccount,
  regenerateGrowthAccount,
  updateGrowthOutcome,
  updateGrowthStatus,
} from "@/lib/growth-intelligence/store";
import type {
  GrowthAccountInput,
  GrowthPipelineStatus,
  GrowthWorkspaceSnapshot,
} from "@/lib/growth-intelligence/types";

type GrowthActionResult =
  | { ok: true; snapshot: GrowthWorkspaceSnapshot; message: string }
  | { ok: false; message: string };

const PIPELINE_STATUSES: GrowthPipelineStatus[] = [
  "Target Identified",
  "Researched",
  "Outreach Drafted",
  "Outreach Sent",
  "Replied",
  "Discovery Scheduled",
  "Demo Completed",
  "Proposal Shared",
  "Pilot / Deal Won",
  "Nurture / Lost",
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
