"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function AppSearchHint() {
  const pathname = usePathname();
  const isGrowthIntelligence = pathname.startsWith(
    "/app/growth-intelligence",
  );

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white text-sm text-muted">
      <Search className="h-3.5 w-3.5" />
      <span>
        {isGrowthIntelligence
          ? "Search accounts, personas…"
          : "Search assessments, sources…"}
      </span>
      <kbd className="text-[10px] text-muted border border-border rounded px-1 py-0.5">
        ⌘K
      </kbd>
    </div>
  );
}

