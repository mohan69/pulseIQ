import type { Metadata } from "next";
import { connection } from "next/server";
import { GrowthIntelligenceWorkspace } from "@/components/growth-intelligence/GrowthIntelligenceWorkspace";
import {
  DEMO_GROWTH_ORG_ID,
  getDemoGrowthAccounts,
  getDemoGrowthAuditLogs,
} from "@/lib/growth-intelligence/seed";
import { DEMO_GROWTH_USER_ID } from "@/lib/growth-intelligence/context";
import { calculateGrowthLearning } from "@/lib/growth-intelligence/learning";
import { loadGrowthWorkspace } from "@/lib/growth-intelligence/store";

export const metadata: Metadata = {
  title: "Growth Intelligence Agent | PulseIQ",
  description:
    "Prioritize target accounts, identify business pain signals, prepare human-approved outreach, and learn from GTM outcomes.",
  robots: { index: false, follow: false },
};

export default async function GrowthIntelligencePage() {
  await connection();
  let persistenceAvailable = true;
  let persistenceMessage = "";
  let accounts;
  let auditLogs;
  let learning;
  try {
    const snapshot = await loadGrowthWorkspace({
      orgId: DEMO_GROWTH_ORG_ID,
      userId: DEMO_GROWTH_USER_ID,
    });
    ({ accounts, auditLogs, learning } = snapshot);
  } catch (error) {
    console.error("[Growth Intelligence] workspace load failed", {
      error: error instanceof Error ? error.message.slice(0, 240) : "Unknown error",
    });
    accounts = getDemoGrowthAccounts(DEMO_GROWTH_ORG_ID);
    auditLogs = getDemoGrowthAuditLogs(DEMO_GROWTH_ORG_ID);
    learning = calculateGrowthLearning(accounts);
    persistenceAvailable = false;
    persistenceMessage =
      "Persistent storage is temporarily unavailable. Showing read-only demo records.";
  }

  return (
    <GrowthIntelligenceWorkspace
      initialAccounts={accounts}
      initialAuditLogs={auditLogs}
      initialLearning={learning}
      persistenceAvailable={persistenceAvailable}
      persistenceMessage={persistenceMessage}
    />
  );
}
