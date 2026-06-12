import { readFileSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { calculateGrowthLearning } from "@/lib/growth-intelligence/learning";
import { researchAccount } from "@/lib/growth-intelligence/research";
import {
  createGrowthRepository,
  growthRepositoryInternals,
} from "@/lib/growth-intelligence/repository";
import { demoGrowthAccounts } from "@/lib/growth-intelligence/seed";
import type {
  GrowthAccount,
  GrowthAccountInput,
} from "@/lib/growth-intelligence/types";

const identity = {
  orgId: "demo-rightsense-org",
  userId: "demo-admin-user",
};

const input: GrowthAccountInput = {
  companyName: "Persistence Test Co",
  website: "https://example.com/persistence",
  industry: "Industrial Manufacturing",
  location: "Pune, India",
  segment: "Mid-market manufacturer",
  targetProductService: "PulseIQ",
  targetPersona: "CEO / MD",
  contactName: "Asha Rao",
  contactRole: "Chief Executive Officer",
  linkedInUrl: "https://linkedin.com/in/example",
  notes: "Private account note",
  mode: "rightsense",
};

function dbRow(account: GrowthAccount = demoGrowthAccounts[0]) {
  return {
    id: account.id,
    orgId: account.orgId,
    createdBy: account.createdBy,
    updatedBy: account.updatedBy,
    createdAt: new Date(account.createdAt),
    updatedAt: new Date(account.updatedAt),
    deletedAt: null,
    seedKey: null,
    mode: account.mode,
    companyName: account.companyName,
    website: account.website,
    industry: account.industry,
    location: account.location,
    segment: account.segment,
    targetProductOrService: account.targetProductService,
    targetPersona: account.targetPersona,
    contactName: account.contactName,
    contactRole: account.contactRole,
    linkedInUrl: account.linkedInUrl,
    notes: account.notes,
    status: account.outcome.status,
    intelligence: account.intelligence,
    fitScores: account.fitScores,
    rightSenseFitScores: account.rightSenseFitScores ?? null,
    outreach: account.outreachDrafts,
    outcome: account.outcome,
    experiment: null,
  };
}

describe("growth persistence", () => {
  it("filters account and audit reads by orgId and deletedAt", async () => {
    const findAccounts = vi.fn().mockResolvedValue([]);
    const findAuditLogs = vi.fn().mockResolvedValue([]);
    const client = {
      growthAccount: { findMany: findAccounts },
      growthAuditLog: { findMany: findAuditLogs },
    } as unknown as PrismaClient;
    const repository = createGrowthRepository(client);

    await repository.listAccounts("tenant-a");
    await repository.listAuditLogs("tenant-a");

    expect(findAccounts).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId: "tenant-a", deletedAt: null },
      }),
    );
    expect(findAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId: "tenant-a", deletedAt: null },
      }),
    );
    expect(growthRepositoryInternals.activeTenantWhere("tenant-b")).toEqual({
      orgId: "tenant-b",
      deletedAt: null,
    });
  });

  it("normalizes legacy pipeline statuses to the diagnostic journey", () => {
    expect(
      growthRepositoryInternals.normalizePipelineStatus("Researched"),
    ).toBe("Diagnostic Angle Researched");
    expect(
      growthRepositoryInternals.normalizePipelineStatus("Proposal Shared"),
    ).toBe("Pilot Proposed");
    expect(
      growthRepositoryInternals.normalizePipelineStatus("Replied"),
    ).toBe("Discovery Scheduled");
    expect(
      growthRepositoryInternals.normalizePipelineStatus("unknown-status"),
    ).toBe("Target Identified");
  });

  it("does not duplicate demo seed records on later loads", async () => {
    const count = vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(8);
    const auditCount = vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(4);
    const tx = {
      growthAccount: {
        upsert: vi.fn(({ create }) => Promise.resolve({ id: create.id })),
      },
      growthOutcome: { upsert: vi.fn().mockResolvedValue({}) },
      growthAuditLog: { upsert: vi.fn().mockResolvedValue({}) },
    };
    const transaction = vi.fn(async (callback) => callback(tx));
    const client = {
      growthAccount: { count },
      growthAuditLog: { count: auditCount },
      $transaction: transaction,
    } as unknown as PrismaClient;
    const repository = createGrowthRepository(client);

    expect(await repository.ensureDemoSeed(identity)).toBe(true);
    expect(await repository.ensureDemoSeed(identity)).toBe(false);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(tx.growthAccount.upsert).toHaveBeenCalledTimes(8);
    expect(tx.growthOutcome.upsert).toHaveBeenCalledTimes(8);
    expect(tx.growthAuditLog.upsert).toHaveBeenCalledTimes(4);
  });

  it("persists generated intelligence, outreach, and create audit events", async () => {
    let createdData: Record<string, unknown> | undefined;
    let auditData: Array<{ event: string }> = [];
    const tx = {
      growthAccount: {
        create: vi.fn(({ data }) => {
          createdData = data;
          return Promise.resolve({
            ...dbRow(),
            id: "created-account",
            companyName: input.companyName,
            intelligence: data.intelligence,
            fitScores: data.fitScores,
            rightSenseFitScores: data.rightSenseFitScores,
            outreach: data.outreach,
            outcome: data.outcome,
          });
        }),
      },
      growthOutcome: { create: vi.fn().mockResolvedValue({}) },
      growthAuditLog: {
        createMany: vi.fn(({ data }) => {
          auditData = data;
          return Promise.resolve({ count: data.length });
        }),
      },
    };
    const client = {
      $transaction: vi.fn(async (callback) => callback(tx)),
    } as unknown as PrismaClient;
    const repository = createGrowthRepository(client);

    const created = await repository.createAccount(identity, input);

    expect(created.intelligence.companySummary).toContain(input.companyName);
    expect(created.outreachDrafts.cxoEmail).toContain(
      "Co-Founder, RightSense Technologies",
    );
    expect(createdData?.orgId).toBe(identity.orgId);
    expect(createdData?.createdBy).toBe(identity.userId);
    expect(createdData?.updatedBy).toBe(identity.userId);
    expect(auditData.map((item) => item.event)).toEqual([
      "ACCOUNT_CREATED",
      "INTELLIGENCE_GENERATED",
      "OUTREACH_DRAFTED",
    ]);
  });

  it("creates an account with research and contact candidates in control state", async () => {
    const research = await researchAccount({
      companyName: "Research Intake Co",
      website: "https://example.com/research",
      industry: "Industrial Manufacturing",
      segment: "Mid-market manufacturer",
      location: "Pune, India",
      targetProductRoutePreference: "PulseIQ",
      knownRelationshipNote: "",
      publicSourceNotes: "Public notes mention ERP and operating visibility.",
      targetRole: "COO",
    });
    let createdData: Record<string, unknown> | undefined;
    const tx = {
      growthAccount: {
        create: vi.fn(({ data }) => {
          createdData = data;
          return Promise.resolve({
            ...dbRow(),
            id: "research-created-account",
            companyName: research.companyName,
            experiment: data.experiment,
            intelligence: data.intelligence,
            fitScores: data.fitScores,
            rightSenseFitScores: data.rightSenseFitScores,
            outreach: data.outreach,
            outcome: data.outcome,
          });
        }),
      },
      growthOutcome: { create: vi.fn().mockResolvedValue({}) },
      growthAuditLog: { createMany: vi.fn().mockResolvedValue({ count: 3 }) },
    };
    const client = {
      $transaction: vi.fn(async (callback) => callback(tx)),
    } as unknown as PrismaClient;
    const repository = createGrowthRepository(client);

    const created = await repository.createAccount(identity, input, {
      version: 3,
      drafts: {},
      contacts: research.contactCandidates,
      preferredContactId: research.contactCandidates[0]?.id,
      research: { ...research, verificationStatus: "Verified" },
    });

    expect(created.controlState.research?.companyName).toBe(
      "Research Intake Co",
    );
    expect(created.controlState.contacts).toHaveLength(1);
    expect(
      JSON.stringify(createdData?.experiment),
    ).toContain("publicSignals");
  });

  it("creates audits for regenerate and outcome updates", async () => {
    const auditCreateMany = vi.fn().mockResolvedValue({ count: 2 });
    const auditCreate = vi.fn().mockResolvedValue({});
    const row = dbRow();
    const tx = {
      growthAccount: {
        findFirst: vi.fn().mockResolvedValue(row),
        update: vi.fn().mockResolvedValue(row),
      },
      growthOutcome: { create: vi.fn().mockResolvedValue({}) },
      growthAuditLog: {
        createMany: auditCreateMany,
        create: auditCreate,
      },
    };
    const client = {
      growthAccount: { findFirst: vi.fn().mockResolvedValue(row) },
      $transaction: vi.fn(async (callback) => callback(tx)),
    } as unknown as PrismaClient;
    const repository = createGrowthRepository(client);

    await repository.regenerateAccount(identity, row.id);
    await repository.updateOutcome(identity, row.id, {
      status: "Pilot / Deal Won",
      nextAction: "Capture pilot value",
      outcome: "Pilot approved",
    });

    expect(auditCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ event: "INTELLIGENCE_GENERATED" }),
        expect.objectContaining({ event: "OUTREACH_DRAFTED" }),
      ]),
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ event: "OUTCOME_UPDATED" }),
    });
  });

  it("persists approval, manual-send, and reply audit events without reply text", async () => {
    const row = dbRow(demoGrowthAccounts[2]);
    let experiment = row.experiment;
    const auditCreate = vi.fn().mockResolvedValue({});
    const tx = {
      growthAccount: {
        findFirst: vi.fn(() =>
          Promise.resolve({ ...row, experiment }),
        ),
        update: vi.fn(({ data }) => {
          experiment = data.experiment;
          return Promise.resolve({ ...row, experiment });
        }),
      },
      growthAuditLog: { create: auditCreate },
    };
    const client = {
      $transaction: vi.fn(async (callback) => callback(tx)),
    } as unknown as PrismaClient;
    const repository = createGrowthRepository(client);

    await repository.updateControlDraft(identity, row.id, {
      draftType: "functionalLeaderEmail",
      status: "Approved",
    });
    await repository.updateControlDraft(identity, row.id, {
      draftType: "functionalLeaderEmail",
      status: "Sent Manually",
    });
    await repository.updateControlDraft(identity, row.id, {
      draftType: "functionalLeaderEmail",
      status: "Replied",
      replyText: "Please schedule a meeting next week. PRIVATE-REPLY",
    });

    expect(auditCreate).toHaveBeenCalledTimes(3);
    expect(
      auditCreate.mock.calls.map(([call]) => call.data.event),
    ).toEqual([
      "OUTREACH_APPROVED",
      "MANUAL_SEND_LOGGED",
      "REPLY_CLASSIFIED",
    ]);
    expect(JSON.stringify(auditCreate.mock.calls)).not.toContain(
      "PRIVATE-REPLY",
    );
    expect(JSON.stringify(experiment)).toContain("Meeting requested");
    expect(JSON.stringify(experiment)).toContain("sentAt");
    expect(JSON.stringify(experiment)).not.toContain("PRIVATE-REPLY");
  });

  it("updates learning from outcomes without exposing private notes", () => {
    const accounts = demoGrowthAccounts.map((account, index) => ({
      ...account,
      notes: `PRIVATE-NOTE-${index}`,
    }));
    const before = calculateGrowthLearning(accounts);
    const updated = calculateGrowthLearning(
      accounts.map((account, index) =>
        index === 2
          ? {
              ...account,
              outcome: {
                ...account.outcome,
                status: "Pilot / Deal Won" as const,
                outcome: "Won through human-approved email",
              },
            }
          : account,
      ),
    );
    const serialized = JSON.stringify(updated);

    expect(updated.confidenceScore).toBeGreaterThanOrEqual(
      before.confidenceScore,
    );
    expect(serialized).not.toContain("PRIVATE-NOTE");
    expect(updated.bestPerformingSegment).toBeTruthy();
    expect(updated.highestConvertingOffer).toBeTruthy();
  });

  it("contains no automatic outbound sending functions", () => {
    const files = [
      "src/lib/growth-intelligence/generator.ts",
      "src/lib/growth-intelligence/repository.ts",
      "src/app/app/growth-intelligence/actions.ts",
      "src/components/growth-intelligence/GrowthIntelligenceWorkspace.tsx",
    ];
    const source = files
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(source).not.toMatch(
      /\b(sendEmail|sendLinkedIn|sendWhatsApp)\s*(?:=|\()/,
    );
  });
});
