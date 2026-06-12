import type {
  GrowthAccount as DbGrowthAccount,
  GrowthAuditLog as DbGrowthAuditLog,
  PrismaClient,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
  approvalStatusFor,
  buildGrowthExecutionPack,
  canTransitionApprovalStatus,
  classifyGrowthReply,
  emptyGrowthControlState,
  normalizeGrowthControlState,
} from "@/lib/growth-intelligence/control-center";
import { generateGrowthIntelligence } from "@/lib/growth-intelligence/generator";
import {
  DEMO_GROWTH_ORG_ID,
  demoGrowthAccounts,
  demoGrowthAuditLogs,
} from "@/lib/growth-intelligence/seed";
import type {
  GrowthAccount,
  GrowthAccountInput,
  GrowthApprovalStatus,
  GrowthAuditLog,
  GrowthContactCandidate,
  GrowthControlState,
  GrowthDraftType,
  GrowthEmailTrackingStatus,
  GrowthOutcome,
  GrowthPipelineStatus,
  GrowthResearchResult,
} from "@/lib/growth-intelligence/types";

export type GrowthIdentity = {
  orgId: string;
  userId: string;
};

export type GrowthOutcomePatch = {
  status: GrowthPipelineStatus;
  nextAction: string;
  outcome: string;
};

export type GrowthControlDraftPatch = {
  draftType: GrowthDraftType;
  status: GrowthApprovalStatus;
  replyText?: string;
};

export type GrowthContactPatch = GrowthContactCandidate & {
  preferred: boolean;
};

export type GrowthRepository = ReturnType<typeof createGrowthRepository>;

const activeTenantWhere = (orgId: string) => ({
  orgId,
  deletedAt: null,
});

function json<T>(value: T): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function optionalJson<T>(
  value: T | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value === undefined ? Prisma.JsonNull : json(value);
}

const LEGACY_STATUS_MAP: Record<string, GrowthPipelineStatus> = {
  "Target Identified": "Target Identified",
  Researched: "Diagnostic Angle Researched",
  "Outreach Drafted": "Diagnostic Draft Prepared",
  "Outreach Sent": "Human Outreach Approved",
  Replied: "Discovery Scheduled",
  "Discovery Scheduled": "Discovery Scheduled",
  "Demo Completed": "Diagnostic Completed",
  "Proposal Shared": "Pilot Proposed",
  "Pilot / Deal Won": "Pilot / Deal Won",
  "Nurture / Lost": "Nurture / Lost",
  "Diagnostic Angle Researched": "Diagnostic Angle Researched",
  "Diagnostic Draft Prepared": "Diagnostic Draft Prepared",
  "Human Outreach Approved": "Human Outreach Approved",
  "Diagnostic Completed": "Diagnostic Completed",
  "Product Route Recommended": "Product Route Recommended",
  "Pilot Proposed": "Pilot Proposed",
};

function normalizePipelineStatus(value: unknown): GrowthPipelineStatus {
  return LEGACY_STATUS_MAP[String(value)] ?? "Target Identified";
}

function mapAccount(row: DbGrowthAccount): GrowthAccount {
  const input: GrowthAccountInput = {
    companyName: row.companyName,
    website: row.website,
    industry: row.industry,
    location: row.location,
    segment: row.segment,
    targetProductService: row.targetProductOrService,
    targetPersona: row.targetPersona,
    contactName: row.contactName,
    contactRole: row.contactRole,
    linkedInUrl: row.linkedInUrl,
    notes: row.notes,
    mode: row.mode as GrowthAccount["mode"],
  };
  const generated = generateGrowthIntelligence(input);
  const storedOutcome = row.outcome as GrowthOutcome;
  return {
    id: row.id,
    orgId: row.orgId,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString(),
    mode: row.mode as GrowthAccount["mode"],
    companyName: row.companyName,
    website: row.website,
    industry: row.industry,
    location: row.location,
    segment: row.segment,
    targetProductService: row.targetProductOrService,
    targetPersona: row.targetPersona,
    contactName: row.contactName,
    contactRole: row.contactRole,
    linkedInUrl: row.linkedInUrl,
    notes: row.notes,
    intelligence: generated.intelligence,
    fitScores: generated.fitScores,
    rightSenseFitScores: generated.rightSenseFitScores,
    outreachDrafts: generated.outreachDrafts,
    controlState: normalizeGrowthControlState(row.experiment),
    outcome: {
      ...storedOutcome,
      status: normalizePipelineStatus(storedOutcome.status ?? row.status),
    },
  };
}

function mapAuditLog(row: DbGrowthAuditLog): GrowthAuditLog {
  return {
    id: row.id,
    orgId: row.orgId,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    accountId: row.accountId,
    event: row.event as GrowthAuditLog["event"],
    summary: row.summary,
  };
}

function accountData(
  identity: GrowthIdentity,
  input: GrowthAccountInput,
  outcome: GrowthOutcome,
  seedKey?: string,
  controlState: GrowthControlState = emptyGrowthControlState(),
) {
  const generated = generateGrowthIntelligence(input);
  return {
    orgId: identity.orgId,
    createdBy: identity.userId,
    updatedBy: identity.userId,
    seedKey,
    mode: input.mode,
    companyName: input.companyName,
    website: input.website,
    industry: input.industry,
    location: input.location,
    segment: input.segment,
    targetProductOrService: input.targetProductService,
    targetPersona: input.targetPersona,
    contactName: input.contactName,
    contactRole: input.contactRole,
    linkedInUrl: input.linkedInUrl,
    notes: input.notes,
    status: outcome.status,
    intelligence: json(generated.intelligence),
    fitScores: json(generated.fitScores),
    rightSenseFitScores: optionalJson(generated.rightSenseFitScores),
    outreach: json(generated.outreachDrafts),
    outcome: json(outcome),
    experiment: json(controlState),
  };
}

function seededAccountId(orgId: string, accountId: string): string {
  return orgId === DEMO_GROWTH_ORG_ID ? accountId : `${orgId}-${accountId}`;
}

export function createGrowthRepository(client: PrismaClient) {
  return {
    async listAccounts(orgId: string): Promise<GrowthAccount[]> {
      const rows = await client.growthAccount.findMany({
        where: activeTenantWhere(orgId),
        orderBy: { updatedAt: "desc" },
      });
      return rows.map(mapAccount);
    },

    async getAccount(
      orgId: string,
      accountId: string,
    ): Promise<GrowthAccount | undefined> {
      const row = await client.growthAccount.findFirst({
        where: { id: accountId, ...activeTenantWhere(orgId) },
      });
      return row ? mapAccount(row) : undefined;
    },

    async listAuditLogs(orgId: string, take = 12): Promise<GrowthAuditLog[]> {
      const rows = await client.growthAuditLog.findMany({
        where: activeTenantWhere(orgId),
        orderBy: { createdAt: "desc" },
        take,
      });
      return rows.map(mapAuditLog);
    },

    async ensureDemoSeed(identity: GrowthIdentity): Promise<boolean> {
      const [existingAccounts, existingAudits] = await Promise.all([
        client.growthAccount.count({
          where: activeTenantWhere(identity.orgId),
        }),
        client.growthAuditLog.count({
          where: activeTenantWhere(identity.orgId),
        }),
      ]);
      if (existingAccounts > 0 && existingAudits > 0) return false;

      await client.$transaction(async (tx) => {
        if (existingAccounts === 0) {
          for (const account of demoGrowthAccounts) {
            const input: GrowthAccountInput = {
              companyName: account.companyName,
              website: account.website,
              industry: account.industry,
              location: account.location,
              segment: account.segment,
              targetProductService: account.targetProductService,
              targetPersona: account.targetPersona,
              contactName: account.contactName,
              contactRole: account.contactRole,
              linkedInUrl: account.linkedInUrl,
              notes: account.notes,
              mode: account.mode,
            };
            const created = await tx.growthAccount.upsert({
              where: {
                orgId_seedKey: {
                  orgId: identity.orgId,
                  seedKey: account.id,
                },
              },
              update: {},
              create: {
                id: seededAccountId(identity.orgId, account.id),
                ...accountData(identity, input, account.outcome, account.id),
                createdAt: new Date(account.createdAt),
                updatedAt: new Date(account.updatedAt),
              },
            });
            await tx.growthOutcome.upsert({
              where: { id: `seed-outcome-${identity.orgId}-${account.id}` },
              update: {},
              create: {
                id: `seed-outcome-${identity.orgId}-${account.id}`,
                accountId: created.id,
                orgId: identity.orgId,
                createdBy: identity.userId,
                updatedBy: identity.userId,
                status: account.outcome.status,
                data: json(account.outcome),
                createdAt: new Date(account.outcome.updatedAt),
                updatedAt: new Date(account.outcome.updatedAt),
              },
            });
          }
        }
        if (existingAudits === 0) {
          for (const audit of demoGrowthAuditLogs) {
            await tx.growthAuditLog.upsert({
              where: { id: `seed-${identity.orgId}-${audit.id}` },
              update: {},
              create: {
                id: `seed-${identity.orgId}-${audit.id}`,
                accountId: seededAccountId(identity.orgId, audit.accountId),
                orgId: identity.orgId,
                createdBy: identity.userId,
                updatedBy: identity.userId,
                event: audit.event,
                summary: audit.summary,
                createdAt: new Date(audit.createdAt),
                updatedAt: new Date(audit.updatedAt),
              },
            });
          }
        }
      });
      return true;
    },

    async createAccount(
      identity: GrowthIdentity,
      input: GrowthAccountInput,
      controlState?: GrowthControlState,
    ): Promise<GrowthAccount> {
      const now = new Date();
      const outcome: GrowthOutcome = {
        status: "Diagnostic Draft Prepared",
        nextAction: "Review the diagnostic angle and approve one draft manually",
        outcome: "Diagnostic-led drafts generated; no outreach sent",
        updatedAt: now.toISOString(),
      };
      const row = await client.$transaction(async (tx) => {
        const created = await tx.growthAccount.create({
          data: accountData(identity, input, outcome, undefined, controlState),
        });
        await tx.growthOutcome.create({
          data: {
            accountId: created.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            status: outcome.status,
            data: json(outcome),
          },
        });
        await tx.growthAuditLog.createMany({
          data: [
            {
              accountId: created.id,
              orgId: identity.orgId,
              createdBy: identity.userId,
              updatedBy: identity.userId,
              event: "ACCOUNT_CREATED",
              summary: `${input.companyName} added to the tenant account list.`,
            },
            {
              accountId: created.id,
              orgId: identity.orgId,
              createdBy: identity.userId,
              updatedBy: identity.userId,
              event: "INTELLIGENCE_GENERATED",
              summary: "Deterministic account brief and fit scores generated.",
            },
            {
              accountId: created.id,
              orgId: identity.orgId,
              createdBy: identity.userId,
              updatedBy: identity.userId,
              event: "OUTREACH_DRAFTED",
              summary: "Review-only outreach drafts prepared; no message was sent.",
            },
          ],
        });
        return created;
      });
      return mapAccount(row);
    },

    async regenerateAccount(
      identity: GrowthIdentity,
      accountId: string,
    ): Promise<GrowthAccount | undefined> {
      const existing = await client.growthAccount.findFirst({
        where: { id: accountId, ...activeTenantWhere(identity.orgId) },
      });
      if (!existing) return undefined;
      const account = mapAccount(existing);
      const generated = generateGrowthIntelligence(account);
      const row = await client.$transaction(async (tx) => {
        const updated = await tx.growthAccount.update({
          where: { id: existing.id },
          data: {
            updatedBy: identity.userId,
            intelligence: json(generated.intelligence),
            fitScores: json(generated.fitScores),
            rightSenseFitScores: optionalJson(generated.rightSenseFitScores),
            outreach: json(generated.outreachDrafts),
          },
        });
        await tx.growthAuditLog.createMany({
          data: [
            {
              accountId: updated.id,
              orgId: identity.orgId,
              createdBy: identity.userId,
              updatedBy: identity.userId,
              event: "INTELLIGENCE_GENERATED",
              summary: "Account intelligence regenerated from approved fields.",
            },
            {
              accountId: updated.id,
              orgId: identity.orgId,
              createdBy: identity.userId,
              updatedBy: identity.userId,
              event: "OUTREACH_DRAFTED",
              summary: "Review-only outreach drafts refreshed; no message was sent.",
            },
          ],
        });
        return updated;
      });
      return mapAccount(row);
    },

    async updateStatus(
      identity: GrowthIdentity,
      accountId: string,
      status: GrowthPipelineStatus,
    ): Promise<boolean> {
      const result = await client.$transaction(async (tx) => {
        const existing = await tx.growthAccount.findFirst({
          where: { id: accountId, ...activeTenantWhere(identity.orgId) },
        });
        if (!existing) return false;
        const current = existing.outcome as GrowthOutcome;
        const outcome = {
          ...current,
          status,
          updatedAt: new Date().toISOString(),
        };
        await tx.growthAccount.update({
          where: { id: existing.id },
          data: {
            status,
            outcome: json(outcome),
            updatedBy: identity.userId,
          },
        });
        await tx.growthOutcome.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            status,
            data: json(outcome),
          },
        });
        await tx.growthAuditLog.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            event: "ACCOUNT_UPDATED",
            summary: `Pipeline status updated to ${status}.`,
          },
        });
        return true;
      });
      return result;
    },

    async updateOutcome(
      identity: GrowthIdentity,
      accountId: string,
      patch: GrowthOutcomePatch,
    ): Promise<boolean> {
      return client.$transaction(async (tx) => {
        const existing = await tx.growthAccount.findFirst({
          where: { id: accountId, ...activeTenantWhere(identity.orgId) },
        });
        if (!existing) return false;
        const outcome: GrowthOutcome = {
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        await tx.growthAccount.update({
          where: { id: existing.id },
          data: {
            status: patch.status,
            outcome: json(outcome),
            updatedBy: identity.userId,
          },
        });
        await tx.growthOutcome.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            status: patch.status,
            data: json(outcome),
          },
        });
        await tx.growthAuditLog.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            event: "OUTCOME_UPDATED",
            summary: `Pipeline outcome updated at ${patch.status}.`,
          },
        });
        return true;
      });
    },

    async updateControlDraft(
      identity: GrowthIdentity,
      accountId: string,
      patch: GrowthControlDraftPatch,
    ): Promise<boolean> {
      return client.$transaction(async (tx) => {
        const existing = await tx.growthAccount.findFirst({
          where: { id: accountId, ...activeTenantWhere(identity.orgId) },
        });
        if (!existing) return false;
        const account = mapAccount(existing);
        const currentStatus = approvalStatusFor(account, patch.draftType);
        if (!canTransitionApprovalStatus(currentStatus, patch.status)) {
          throw new Error(
            `Invalid outreach review transition from ${currentStatus} to ${patch.status}.`,
          );
        }
        if (patch.status === "Replied" && !patch.replyText?.trim()) {
          throw new Error("Reply text is required for classification.");
        }
        const now = new Date().toISOString();
        const controlState = normalizeGrowthControlState(existing.experiment);
        const replyClassification =
          patch.status === "Replied"
            ? classifyGrowthReply(patch.replyText ?? "")
            : controlState.drafts[patch.draftType]?.replyClassification;
        controlState.drafts[patch.draftType] = {
          status: patch.status,
          updatedAt: now,
          ...(replyClassification ? { replyClassification } : {}),
        };
        if (patch.status === "Sent Manually") {
          const executionPack = buildGrowthExecutionPack({
            ...account,
            controlState,
          });
          controlState.emailTracking = {
            status: "Sent Manually",
            sentAt: now,
            subject: executionPack.email.selectedSubject,
            followUpDueAt: executionPack.followUp.suggestedFollowUpDate,
            ...(executionPack.preferredContact?.email
              ? { recipient: executionPack.preferredContact.email }
              : {}),
          };
        }
        if (patch.status === "Replied") {
          controlState.emailTracking = {
            ...(controlState.emailTracking ?? { status: "Replied" }),
            status: "Replied",
            replyClassification,
            replySummary: `Reply classified as ${replyClassification}.`,
          };
        }
        await tx.growthAccount.update({
          where: { id: existing.id },
          data: {
            experiment: json(controlState),
            updatedBy: identity.userId,
          },
        });
        const event =
          patch.status === "Approved"
            ? "OUTREACH_APPROVED"
            : patch.status === "Sent Manually"
              ? "MANUAL_SEND_LOGGED"
              : patch.status === "Replied"
                ? "REPLY_CLASSIFIED"
                : "ACCOUNT_UPDATED";
        const summary =
          patch.status === "Approved"
            ? "Outreach draft approved for manual use."
            : patch.status === "Sent Manually"
              ? "Manual send recorded; no message was sent by PulseIQ."
              : patch.status === "Replied"
                ? `Reply classified as ${replyClassification}.`
                : `Outreach review status updated to ${patch.status}.`;
        await tx.growthAuditLog.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            event,
            summary,
            metadata: json({
              draftType: patch.draftType,
              status: patch.status,
              ...(replyClassification ? { replyClassification } : {}),
            }),
          },
        });
        return true;
      });
    },

    async updateContact(
      identity: GrowthIdentity,
      accountId: string,
      patch: GrowthContactPatch,
    ): Promise<boolean> {
      return client.$transaction(async (tx) => {
        const existing = await tx.growthAccount.findFirst({
          where: { id: accountId, ...activeTenantWhere(identity.orgId) },
        });
        if (!existing) return false;
        const controlState = normalizeGrowthControlState(existing.experiment);
        const contacts = controlState.contacts.filter(
          (contact) => contact.id !== patch.id,
        );
        contacts.push({
          id: patch.id,
          name: patch.name,
          title: patch.title,
          roleCategory: patch.roleCategory,
          email: patch.email,
          phone: patch.phone,
          linkedInUrl: patch.linkedInUrl,
          sourceUrl: patch.sourceUrl,
          sourceType: patch.sourceType,
          confidence: patch.confidence,
          verificationNote: patch.verificationNote,
          lastCheckedDate: patch.lastCheckedDate,
          allowedToContact: patch.allowedToContact,
          doNotContact: patch.doNotContact,
        });
        controlState.contacts = contacts;
        if (patch.preferred) controlState.preferredContactId = patch.id;
        await tx.growthAccount.update({
          where: { id: existing.id },
          data: {
            experiment: json(controlState),
            updatedBy: identity.userId,
          },
        });
        await tx.growthAuditLog.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            event: "CONTACT_UPDATED",
            summary:
              "Contact verification metadata updated for the execution pack.",
            metadata: json({
              contactId: patch.id,
              confidence: patch.confidence,
              allowedToContact: patch.allowedToContact,
              preferred: patch.preferred,
            }),
          },
        });
        return true;
      });
    },

    async applyResearchToAccount(
      identity: GrowthIdentity,
      accountId: string,
      input: GrowthAccountInput,
      research: GrowthResearchResult,
    ): Promise<boolean> {
      return client.$transaction(async (tx) => {
        const existing = await tx.growthAccount.findFirst({
          where: { id: accountId, ...activeTenantWhere(identity.orgId) },
        });
        if (!existing) return false;
        const generated = generateGrowthIntelligence(input);
        const controlState = normalizeGrowthControlState(existing.experiment);
        controlState.research = research;
        controlState.contacts = research.contactCandidates;
        controlState.preferredContactId = research.contactCandidates[0]?.id;
        await tx.growthAccount.update({
          where: { id: existing.id },
          data: {
            updatedBy: identity.userId,
            companyName: input.companyName,
            website: input.website,
            industry: input.industry,
            location: input.location,
            segment: input.segment,
            targetProductOrService: input.targetProductService,
            targetPersona: input.targetPersona,
            contactName: input.contactName,
            contactRole: input.contactRole,
            linkedInUrl: input.linkedInUrl,
            notes: input.notes,
            intelligence: json(generated.intelligence),
            fitScores: json(generated.fitScores),
            rightSenseFitScores: optionalJson(generated.rightSenseFitScores),
            outreach: json(generated.outreachDrafts),
            experiment: json(controlState),
          },
        });
        await tx.growthAuditLog.createMany({
          data: [
            {
              accountId: existing.id,
              orgId: identity.orgId,
              createdBy: identity.userId,
              updatedBy: identity.userId,
              event: "ACCOUNT_UPDATED",
              summary: "Account intake updated from manually verified research.",
            },
            {
              accountId: existing.id,
              orgId: identity.orgId,
              createdBy: identity.userId,
              updatedBy: identity.userId,
              event: "INTELLIGENCE_GENERATED",
              summary:
                "Diagnostic intelligence regenerated from verified research.",
            },
          ],
        });
        return true;
      });
    },

    async logEmailSendAttempt(
      identity: GrowthIdentity,
      accountId: string,
      configured: boolean,
    ): Promise<boolean> {
      return client.$transaction(async (tx) => {
        const existing = await tx.growthAccount.findFirst({
          where: { id: accountId, ...activeTenantWhere(identity.orgId) },
        });
        if (!existing) return false;
        await tx.growthAuditLog.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            event: "EMAIL_SEND_ATTEMPTED",
            summary: configured
              ? "Approved email send requested through the configured provider."
              : "Approved email send requested, but email sending is not configured.",
            metadata: json({ configured }),
          },
        });
        return true;
      });
    },

    async recordEmailSent(
      identity: GrowthIdentity,
      accountId: string,
      data: {
        recipient: string;
        subject: string;
        providerMessageId: string;
        threadId?: string;
      },
    ): Promise<boolean> {
      return client.$transaction(async (tx) => {
        const existing = await tx.growthAccount.findFirst({
          where: { id: accountId, ...activeTenantWhere(identity.orgId) },
        });
        if (!existing) return false;
        const now = new Date();
        const controlState = normalizeGrowthControlState(existing.experiment);
        const followUp = new Date(now);
        followUp.setUTCDate(followUp.getUTCDate() + 3);
        controlState.emailTracking = {
          status: "Sent by Email",
          sentAt: now.toISOString(),
          recipient: data.recipient,
          subject: data.subject,
          providerMessageId: data.providerMessageId,
          followUpDueAt: followUp.toISOString().slice(0, 10),
          ...(data.threadId ? { threadId: data.threadId } : {}),
        };
        await tx.growthAccount.update({
          where: { id: existing.id },
          data: {
            experiment: json(controlState),
            updatedBy: identity.userId,
          },
        });
        await tx.growthAuditLog.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            event: "EMAIL_SENT",
            summary: "Approved email sent through the configured provider.",
            metadata: json({
              recipient: data.recipient,
              subject: data.subject,
              providerMessageId: data.providerMessageId,
              ...(data.threadId ? { threadId: data.threadId } : {}),
            }),
          },
        });
        return true;
      });
    },

    async updateEmailTrackingStatus(
      identity: GrowthIdentity,
      accountId: string,
      status: Extract<GrowthEmailTrackingStatus, "Bounced" | "Follow-up Due">,
    ): Promise<boolean> {
      return client.$transaction(async (tx) => {
        const existing = await tx.growthAccount.findFirst({
          where: { id: accountId, ...activeTenantWhere(identity.orgId) },
        });
        if (!existing) return false;
        const controlState = normalizeGrowthControlState(existing.experiment);
        controlState.emailTracking = {
          ...(controlState.emailTracking ?? { status }),
          status,
          ...(status === "Follow-up Due"
            ? { followUpDueAt: new Date().toISOString().slice(0, 10) }
            : {}),
        };
        await tx.growthAccount.update({
          where: { id: existing.id },
          data: {
            experiment: json(controlState),
            updatedBy: identity.userId,
          },
        });
        await tx.growthAuditLog.create({
          data: {
            accountId: existing.id,
            orgId: identity.orgId,
            createdBy: identity.userId,
            updatedBy: identity.userId,
            event: "ACCOUNT_UPDATED",
            summary: `Email tracking status updated to ${status}.`,
            metadata: json({ status }),
          },
        });
        return true;
      });
    },
  };
}

export const growthRepositoryInternals = {
  activeTenantWhere,
  mapAccount,
  mapAuditLog,
  seededAccountId,
  normalizePipelineStatus,
};
