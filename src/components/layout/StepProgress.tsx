"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Brain,
  CheckCircle2,
  FileText,
  GitBranch,
  Lightbulb,
  Gauge,
  Rocket,
  Calendar,
  Printer,
} from "lucide-react";

const steps = [
  { key: "intake", label: "Intake", href: "intake", icon: FileText },
  { key: "model", label: "Model", href: "model", icon: GitBranch },
  { key: "opportunities", label: "Opportunities", href: "opportunities", icon: Lightbulb },
  { key: "cockpit", label: "Cockpit", href: "cockpit", icon: Gauge },
  { key: "future", label: "Future", href: "future", icon: Rocket },
  { key: "roadmap", label: "Roadmap", href: "roadmap", icon: Calendar },
  { key: "report", label: "Report", href: "report", icon: Printer },
];

interface StepProgressProps {
  assessmentId: string;
}

export function StepProgress({ assessmentId }: StepProgressProps) {
  const pathname = usePathname();
  const currentStep = steps.findIndex((s) => pathname.includes(s.href));

  return (
    <nav className="no-print border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center h-12 overflow-x-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 mr-6 shrink-0"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center shadow-sm">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight">PulseIQ</span>
              <span className="text-[9px] text-muted leading-none">Intelligence</span>
            </div>
          </Link>
          <div className="flex items-center gap-0.5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <Link
                  key={step.key}
                  href={`/assessment/${assessmentId}/${step.href}`}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm transition-all shrink-0",
                    isActive &&
                      "bg-accent text-white font-medium shadow-sm",
                    isCompleted && "text-success hover:bg-success-muted",
                    !isActive &&
                      !isCompleted &&
                      "text-muted hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
