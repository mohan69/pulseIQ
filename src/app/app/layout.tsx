import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppBreadcrumbs } from "@/components/layout/AppBreadcrumbs";
import { AppContextNotice } from "@/components/layout/AppContextNotice";
import { AppSearchHint } from "@/components/layout/AppSearchHint";
import { Bell, User } from "lucide-react";

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
              <AppSearchHint />
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
        <main className="flex-1 min-w-0 px-6 lg:px-8 py-8 max-w-[1280px] has-[.growth-intelligence-workspace]:max-w-[1440px] w-full mx-auto">
          <AppContextNotice />
          {children}
        </main>
      </div>
    </div>
  );
}
