import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppBreadcrumbs } from "@/components/layout/AppBreadcrumbs";
import { Bell, Search, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Workbench | PulseIQ",
  description: "PulseIQ Assessment Workbench — internal admin console.",
  robots: { index: false, follow: false },
};

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 lg:px-8 h-14">
            <AppBreadcrumbs />
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white text-sm text-muted">
                <Search className="h-3.5 w-3.5" />
                <span>Search assessments, sources…</span>
                <kbd className="text-[10px] text-muted border border-border rounded px-1 py-0.5">
                  ⌘K
                </kbd>
              </div>
              <button
                type="button"
                className="h-9 w-9 rounded-lg border border-border bg-white flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-hover"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0 px-6 lg:px-8 py-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
