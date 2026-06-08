import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const DEMO_ASSESSMENT_ID = "asm-bharat-heavy-fabrications";
const REQUIRED_OUTPUT_TYPES = [
  "truth_layers",
  "cockpit",
  "scenarios",
  "recommendations",
  "plan",
] as const;

interface CheckResult {
  name: string;
  pass: boolean;
  detail?: string;
}

if (!process.env.DATABASE_URL) {
  console.error("FAIL: DATABASE_URL is required.");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const results: CheckResult[] = [];

  // 1. Assessment exists
  const assessment = await prisma.assessment.findUnique({
    where: { id: DEMO_ASSESSMENT_ID },
  });
  results.push({
    name: "Assessment exists",
    pass: assessment !== null,
    detail: assessment
      ? `${assessment.id} — ${assessment.companyName}`
      : `not found`,
  });

  if (!assessment) {
    // Remaining checks are pointless; short-circuit
    printResults(results);
    await prisma.$disconnect();
    process.exit(1);
  }

  // 2. Source count
  const sourceCount = await prisma.dataSource.count({
    where: { assessmentId: DEMO_ASSESSMENT_ID },
  });
  results.push({
    name: "Sources count",
    pass: sourceCount === 8,
    detail: `${sourceCount} (expected 8)`,
  });

  // 3. Fact count
  const factCount = await prisma.businessFact.count({
    where: { assessmentId: DEMO_ASSESSMENT_ID },
  });
  results.push({
    name: "Facts count",
    pass: factCount === 20,
    detail: `${factCount} (expected 20)`,
  });

  // 4. Output types exist
  const existingOutputs = await prisma.assessmentOutput.findMany({
    where: { assessmentId: DEMO_ASSESSMENT_ID },
    select: { type: true },
  });
  const existingTypes = new Set(existingOutputs.map((o) => o.type));

  for (const type of REQUIRED_OUTPUT_TYPES) {
    results.push({
      name: `Output type "${type}"`,
      pass: existingTypes.has(type),
      detail: existingTypes.has(type) ? "present" : "missing",
    });
  }

  // 5. Report can be built — verify every required output has non-null data
  const outputsWithData = await prisma.assessmentOutput.findMany({
    where: { assessmentId: DEMO_ASSESSMENT_ID },
    select: { type: true, data: true },
  });
  const outputMap = new Map(outputsWithData.map((o) => [o.type, o.data]));

  for (const type of REQUIRED_OUTPUT_TYPES) {
    const data = outputMap.get(type);
    results.push({
      name: `Report prerequisite "${type}" data`,
      pass: data !== null && data !== undefined,
      detail:
        data !== null && data !== undefined ? `valid JSON` : `missing or null`,
    });
  }

  // Overall — all output types present and all have valid data
  const allPrerequisitesMet = REQUIRED_OUTPUT_TYPES.every(
    (t) => existingTypes.has(t) && outputMap.get(t) != null,
  );
  results.push({
    name: "Report can be built",
    pass: allPrerequisitesMet,
    detail: allPrerequisitesMet
      ? "all outputs present with valid data"
      : "some outputs missing or null",
  });

  printResults(results);
  await prisma.$disconnect();

  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    process.exit(1);
  }
}

function printResults(results: CheckResult[]) {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;

  console.log(`\nPulseIQ Demo Database Verification`);
  console.log(`================================\n`);

  for (const r of results) {
    const icon = r.pass ? "PASS" : "FAIL";
    const line = r.detail ? `${r.name}: ${r.detail}` : r.name;
    console.log(`  [${icon}] ${line}`);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
}

main().catch((error: unknown) => {
  console.error("Verification script error:", error);
  process.exit(1);
});
