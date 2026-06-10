import type { Metadata } from "next";
import { GrowthIntelligenceWorkspace } from "@/components/growth-intelligence/GrowthIntelligenceWorkspace";
import {
  DEMO_GROWTH_ORG_ID,
  getDemoGrowthAccounts,
  getDemoGrowthAuditLogs,
} from "@/lib/growth-intelligence/seed";

export const metadata: Metadata = {
  title: "Growth Intelligence Agent | PulseIQ",
  description:
    "Prioritize target accounts, identify business pain signals, prepare human-approved outreach, and learn from GTM outcomes.",
  robots: { index: false, follow: false },
};

export default function GrowthIntelligencePage() {
  const accounts = getDemoGrowthAccounts(DEMO_GROWTH_ORG_ID);
  const auditLogs = getDemoGrowthAuditLogs(DEMO_GROWTH_ORG_ID);

  return (
    <GrowthIntelligenceWorkspace
      initialAccounts={accounts}
      initialAuditLogs={auditLogs}
    />
  );
}
