"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileStack,
  Layers,
  BarChart3,
  GitBranch,
  ListChecks,
  FileText,
  ShieldCheck,
  UserCheck,
  Landmark,
  Network,
  BrainCircuit,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, path: "" },
  { key: "sources", label: "Sources", icon: FileStack, path: "sources" },
  { key: "truth-map", label: "Truth map", icon: Layers, path: "truth-map" },
  { key: "cockpit", label: "Cockpit", icon: BarChart3, path: "cockpit" },
  { key: "what-if", label: "What-if", icon: GitBranch, path: "what-if" },
  {
    key: "recommendations",
    label: "Recommendations",
    icon: ListChecks,
    path: "recommendations",
  },
  {
    key: "standards-readiness",
    label: "Standards Readiness",
    icon: ShieldCheck,
    path: "standards-readiness",
  },
  {
    key: "customer-qualification",
    label: "Customer Qualification",
    icon: UserCheck,
    path: "customer-qualification",
  },
  {
    key: "statutory-readiness",
    label: "Statutory Readiness",
    icon: Landmark,
    path: "statutory-readiness",
  },
  {
    key: "supplier-ecosystem",
    label: "Supplier Ecosystem",
    icon: Network,
    path: "supplier-ecosystem",
  },
  {
    key: "ai-governance",
    label: "AI Governance",
    icon: BrainCircuit,
    path: "ai-governance",
  },
  {
    key: "readiness-pack",
    label: "Readiness Pack",
    icon: PackageCheck,
    path: "readiness-pack",
  },
  { key: "report", label: "Report", icon: FileText, path: "report" },
] as const;

export function AssessmentTabs({
  assessmentId,
  sourceCount,
}: {
  assessmentId: string;
  sourceCount: number;
}) {
  const pathname = usePathname();
  const base = `/app/assessments/${assessmentId}`;
  return (
    <div className="border-b border-border overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {TABS.map((t) => {
          const href = t.path ? `${base}/${t.path}` : base;
          const active =
            t.path === ""
              ? pathname === base
              : pathname === href || pathname.startsWith(`${href}/`);
          const Icon = t.icon;
          const showBadge = t.key === "sources" && sourceCount > 0;
          return (
            <Link
              key={t.key}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-foreground-secondary hover:text-foreground hover:border-border",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {showBadge && (
                <span className="text-[10px] rounded-full bg-accent-muted text-accent px-1.5 py-0.5 font-semibold">
                  {sourceCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
