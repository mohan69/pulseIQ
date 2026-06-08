import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  demoAssessment,
  demoCockpit,
  demoFacts,
  demoPlan,
  demoRecommendations,
  demoScenarios,
  demoSources,
  demoTruthLayers,
} from "../src/lib/assessment/seed";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the PulseIQ demo.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_ORGANIZATION_ID = "org-pulseiq-internal";
const DEFAULT_ORGANIZATION_NAME = "PulseIQ Internal";

async function main() {
  await prisma.organization.upsert({
    where: { id: DEFAULT_ORGANIZATION_ID },
    update: { name: DEFAULT_ORGANIZATION_NAME },
    create: {
      id: DEFAULT_ORGANIZATION_ID,
      name: DEFAULT_ORGANIZATION_NAME,
    },
  });

  await prisma.assessment.upsert({
    where: { id: demoAssessment.id },
    update: {
      organizationId: DEFAULT_ORGANIZATION_ID,
      companyName: demoAssessment.companyName,
      industry: demoAssessment.industry,
      objective: demoAssessment.objective,
      revenueTarget: BigInt(demoAssessment.revenueTarget),
      marginTarget: demoAssessment.marginTarget,
      cashTarget: BigInt(demoAssessment.cashTarget),
      headcountProductivityTarget: BigInt(
        demoAssessment.headcountProductivityTarget,
      ),
      status: demoAssessment.status,
      isDemo: true,
      createdAt: new Date(demoAssessment.createdAt),
      updatedAt: new Date(demoAssessment.updatedAt),
    },
    create: {
      id: demoAssessment.id,
      organizationId: DEFAULT_ORGANIZATION_ID,
      companyName: demoAssessment.companyName,
      industry: demoAssessment.industry,
      objective: demoAssessment.objective,
      revenueTarget: BigInt(demoAssessment.revenueTarget),
      marginTarget: demoAssessment.marginTarget,
      cashTarget: BigInt(demoAssessment.cashTarget),
      headcountProductivityTarget: BigInt(
        demoAssessment.headcountProductivityTarget,
      ),
      status: demoAssessment.status,
      isDemo: true,
      createdAt: new Date(demoAssessment.createdAt),
      updatedAt: new Date(demoAssessment.updatedAt),
    },
  });

  // Idempotent upsert: sources, facts, and outputs are replaced on every seed.
  // Using deleteMany + createMany so the seed is a full reset regardless of prior state.
  const priorSources = await prisma.dataSource.findMany({
    where: { assessmentId: demoAssessment.id },
    select: { id: true },
  });
  const priorSourceIds = priorSources.map((s) => s.id);

  if (priorSourceIds.length > 0) {
    // Cascade: facts and sourceDocuments reference sources
    await prisma.businessFact.deleteMany({
      where: { sourceId: { in: priorSourceIds } },
    });
    await prisma.sourceDocument.deleteMany({
      where: { sourceId: { in: priorSourceIds } },
    });
    await prisma.dataSource.deleteMany({
      where: { id: { in: priorSourceIds } },
    });
  }
  await prisma.assessmentOutput.deleteMany({
    where: { assessmentId: demoAssessment.id },
  });

  await prisma.dataSource.createMany({
    data: demoSources.map((source) => ({
      id: source.id,
      assessmentId: source.assessmentId,
      name: source.name,
      type: source.type,
      status: source.status,
      confidence: source.confidence,
      notes: source.notes,
      pageCount: source.pageCount,
      createdAt: new Date(source.createdAt),
    })),
  });

  await prisma.businessFact.createMany({
    data: demoFacts.map((fact) => ({
      id: fact.id,
      assessmentId: fact.assessmentId,
      sourceId: fact.sourceId,
      kind: fact.kind,
      label: fact.label,
      value: fact.value,
      numericValue: fact.numericValue,
      unit: fact.unit,
      evidence: fact.evidence,
      confidence: fact.confidence,
      capturedAt: new Date(fact.capturedAt),
    })),
  });

  await prisma.assessmentOutput.createMany({
    data: [
      {
        assessmentId: demoAssessment.id,
        type: "truth_layers",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoTruthLayers as object,
      },
      {
        assessmentId: demoAssessment.id,
        type: "cockpit",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoCockpit as object,
      },
      {
        assessmentId: demoAssessment.id,
        type: "scenarios",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoScenarios as object,
      },
      {
        assessmentId: demoAssessment.id,
        type: "recommendations",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoRecommendations as object,
      },
      {
        assessmentId: demoAssessment.id,
        type: "plan",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoPlan as object,
      },
    ],
  });

  const [sourceCount, factCount, outputCount] = await Promise.all([
    prisma.dataSource.count({ where: { assessmentId: demoAssessment.id } }),
    prisma.businessFact.count({ where: { assessmentId: demoAssessment.id } }),
    prisma.assessmentOutput.count({
      where: { assessmentId: demoAssessment.id },
    }),
  ]);

  console.log(
    `Seeded ${demoAssessment.companyName}: ${sourceCount} sources, ${factCount} facts, ${outputCount} outputs.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
