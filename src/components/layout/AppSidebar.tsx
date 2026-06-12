"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  LayoutDashboard,
  ClipboardList,
  FileStack,
  ChevronRight,
  Telescope,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/app/sources", label: "Sources", icon: FileStack },
  {
    href: "/app/growth-intelligence",
    label: "Growth Intelligence",
    icon: Telescope,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isGrowthIntelligence = pathname.startsWith(
    "/app/growth-intelligence",
  );
  return (
    <aside className="app-shell-sidebar hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-white print:hidden">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/app" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center shadow-sm">
            <Brain className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground leading-tight">
              PulseIQ
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
              {isGrowthIntelligence ? "Growth workspace" : "Workbench"}
            </span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-accent-muted text-accent"
                  : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-border">
        <div className="text-[11px] text-muted leading-relaxed">
          {isGrowthIntelligence
            ? "PulseIQ Workbench"
            : "RightSense diagnostic · powered by PulseIQ."}
          <br />
          {isGrowthIntelligence
            ? "Secure enterprise intelligence workspace"
            : "Readiness gaps, evidence, and human review."}
        </div>
      </div>
    </aside>
  );
}
