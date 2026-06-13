"use client";

import { usePathname } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { GROWTH_INTERNAL_WORKSPACE_NOTICE } from "@/lib/growth-intelligence/presentation";

export function AppContextNotice() {
  const pathname = usePathname();
  const isGrowthIntelligence = pathname.startsWith(
    "/app/growth-intelligence",
  );

  if (isGrowthIntelligence) {
    return (
      <div className="mb-6 rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-foreground-secondary">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p>{GROWTH_INTERNAL_WORKSPACE_NOTICE}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-warning/30 bg-warning-muted px-4 py-3 text-sm text-foreground-secondary">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p>
          <span className="font-semibold text-foreground">
            Internal RightSense Assessment Workbench.
          </span>{" "}
          Do not upload customer data unless the engagement is approved,
          protected, and covered by NDA/confidentiality terms.
        </p>
      </div>
    </div>
  );
}
