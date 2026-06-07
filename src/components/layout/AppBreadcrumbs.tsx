"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

type Crumb = { href?: string; label: string };

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ href: "/app", label: "Workbench" }];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    // Skip the leading /app, but the first iteration adds /app which is already there
    if (acc === "/app") continue;
    const label = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ href: acc, label });
  }
  // If we're on the dashboard, the last crumb shouldn't be a link
  if (pathname === "/app") crumbs[0].href = undefined;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted"
    >
      <Home className="h-3.5 w-3.5" />
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {c.href && !isLast ? (
              <Link
                href={c.href}
                className="hover:text-foreground transition-colors"
              >
                {c.label}
              </Link>
            ) : (
              <span className={cn(isLast ? "text-foreground font-medium" : "")}>
                {c.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

import { cn } from "@/lib/utils";
