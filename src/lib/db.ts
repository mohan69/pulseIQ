import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __pulseiqPrisma?: PrismaClient;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required to initialize PrismaClient in database mode.",
    );
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma =
  globalForPrisma.__pulseiqPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__pulseiqPrisma = prisma;
}
