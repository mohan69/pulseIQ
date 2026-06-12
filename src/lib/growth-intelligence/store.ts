import { calculateGrowthLearning } from "@/lib/growth-intelligence/learning";
import {
  buildGrowthExecutionPack,
  getExecutionSendEligibility,
} from "@/lib/growth-intelligence/control-center";
import { sendApprovedEmail } from "@/lib/growth-intelligence/email-sender";
import type {
  GrowthAccountInput,
  GrowthEmailTrackingStatus,
  GrowthPipelineStatus,
  GrowthWorkspaceSnapshot,
} from "@/lib/growth-intelligence/types";
import type {
  GrowthIdentity,
  GrowthContactPatch,
  GrowthControlDraftPatch,
  GrowthOutcomePatch,
  GrowthRepository,
} from "@/lib/growth-intelligence/repository";

let repositoryPromise: Promise<GrowthRepository> | undefined;

async function getRepository(): Promise<GrowthRepository> {
  if (!process.env.DATABASE_URL) {
    throw new Error("Growth Intelligence persistence is not configured.");
  }
  repositoryPromise ??= Promise.all([
    import("@/lib/db"),
    import("@/lib/growth-intelligence/repository"),
  ]).then(([{ prisma }, { createGrowthRepository }]) =>
    createGrowthRepository(prisma),
  );
  return repositoryPromise;
}

export async function loadGrowthWorkspace(
  identity: GrowthIdentity,
  seed = true,
): Promise<GrowthWorkspaceSnapshot> {
  const repository = await getRepository();
  if (seed) await repository.ensureDemoSeed(identity);
  const [accounts, auditLogs] = await Promise.all([
    repository.listAccounts(identity.orgId),
    repository.listAuditLogs(identity.orgId),
  ]);
  return {
    accounts,
    auditLogs,
    learning: calculateGrowthLearning(accounts),
  };
}

export async function createGrowthAccount(
  identity: GrowthIdentity,
  input: GrowthAccountInput,
) {
  const repository = await getRepository();
  await repository.createAccount(identity, input);
  return loadGrowthWorkspace(identity, false);
}

export async function regenerateGrowthAccount(
  identity: GrowthIdentity,
  accountId: string,
) {
  const repository = await getRepository();
  const account = await repository.regenerateAccount(identity, accountId);
  if (!account) throw new Error("Growth account was not found.");
  return loadGrowthWorkspace(identity, false);
}

export async function updateGrowthStatus(
  identity: GrowthIdentity,
  accountId: string,
  status: GrowthPipelineStatus,
) {
  const repository = await getRepository();
  if (!(await repository.updateStatus(identity, accountId, status))) {
    throw new Error("Growth account was not found.");
  }
  return loadGrowthWorkspace(identity, false);
}

export async function updateGrowthOutcome(
  identity: GrowthIdentity,
  accountId: string,
  patch: GrowthOutcomePatch,
) {
  const repository = await getRepository();
  if (!(await repository.updateOutcome(identity, accountId, patch))) {
    throw new Error("Growth account was not found.");
  }
  return loadGrowthWorkspace(identity, false);
}

export async function updateGrowthControlDraft(
  identity: GrowthIdentity,
  accountId: string,
  patch: GrowthControlDraftPatch,
) {
  const repository = await getRepository();
  if (!(await repository.updateControlDraft(identity, accountId, patch))) {
    throw new Error("Growth account was not found.");
  }
  return loadGrowthWorkspace(identity, false);
}

export async function updateGrowthContact(
  identity: GrowthIdentity,
  accountId: string,
  patch: GrowthContactPatch,
) {
  const repository = await getRepository();
  if (!(await repository.updateContact(identity, accountId, patch))) {
    throw new Error("Growth account was not found.");
  }
  return loadGrowthWorkspace(identity, false);
}

export async function sendGrowthApprovedEmail(
  identity: GrowthIdentity,
  accountId: string,
) {
  const repository = await getRepository();
  const account = await repository.getAccount(identity.orgId, accountId);
  if (!account) throw new Error("Growth account was not found.");
  const eligibility = getExecutionSendEligibility(account);
  if (!eligibility.allowed) {
    return { ok: false as const, message: eligibility.reason };
  }
  const executionPack = buildGrowthExecutionPack(account);
  const recipient = executionPack.preferredContact?.email;
  if (!recipient) {
    return {
      ok: false as const,
      message: "Email cannot be sent without a verified recipient.",
    };
  }
  const result = await sendApprovedEmail({
    recipient,
    subject: executionPack.email.selectedSubject,
    body: executionPack.email.emailBody,
  });
  await repository.logEmailSendAttempt(identity, accountId, result.ok);
  if (!result.ok) {
    return { ok: false as const, message: result.message };
  }
  await repository.recordEmailSent(identity, accountId, {
    recipient,
    subject: executionPack.email.selectedSubject,
    providerMessageId: result.providerMessageId,
    threadId: result.threadId,
  });
  return {
    ok: true as const,
    message: "Approved email sent.",
    providerMessageId: result.providerMessageId,
    threadId: result.threadId,
  };
}

export async function updateGrowthEmailTrackingStatus(
  identity: GrowthIdentity,
  accountId: string,
  status: Extract<GrowthEmailTrackingStatus, "Bounced" | "Follow-up Due">,
) {
  const repository = await getRepository();
  if (
    !(await repository.updateEmailTrackingStatus(identity, accountId, status))
  ) {
    throw new Error("Growth account was not found.");
  }
  return loadGrowthWorkspace(identity, false);
}
