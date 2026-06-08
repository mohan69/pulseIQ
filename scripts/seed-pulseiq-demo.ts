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

  await prisma.assessmentOutput.deleteMany({
    where: { assessmentId: demoAssessment.id },
  });
  await prisma.businessFact.deleteMany({
    where: { assessmentId: demoAssessment.id },
  });
  await prisma.dataSource.deleteMany({
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
        data: demoTruthLayers,
      },
      {
        assessmentId: demoAssessment.id,
        type: "cockpit",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoCockpit,
      },
      {
        assessmentId: demoAssessment.id,
        type: "scenarios",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoScenarios,
      },
      {
        assessmentId: demoAssessment.id,
        type: "recommendations",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoRecommendations,
      },
      {
        assessmentId: demoAssessment.id,
        type: "plan",
        provider: "demo",
        model: "seed",
        promptVersion: "bhf-demo-v1",
        data: demoPlan,
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
