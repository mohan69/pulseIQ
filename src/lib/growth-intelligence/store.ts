import { calculateGrowthLearning } from "@/lib/growth-intelligence/learning";
import type {
  GrowthAccountInput,
  GrowthPipelineStatus,
  GrowthWorkspaceSnapshot,
} from "@/lib/growth-intelligence/types";
import type {
  GrowthIdentity,
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
