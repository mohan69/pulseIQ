"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Brain,
  BarChart3,
  ArrowRight,
  Zap,
  Target,
  Clock,
  Calendar,
  Building2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="no-print border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-info flex items-center justify-center">
              <Brain className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">PulseIQ</span>
              <span className="text-sm text-muted hidden sm:inline">Enterprise Intelligence</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted hover:text-foreground">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-accent hover:bg-accent-hover text-white">
                Explore Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-info/5" />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-muted px-3.5 py-1 text-sm text-accent font-medium mb-6">
              <Zap className="h-3.5 w-3.5" />
              AI-Native Enterprise Intelligence
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-foreground">
              Convert Enterprise Complexity Into{" "}
              <span className="text-accent">AI-Native Operating Intelligence</span>
            </h1>
            <p className="mt-5 text-lg text-muted max-w-2xl leading-relaxed">
              PulseIQ maps current systems, departments, processes and bottlenecks, then generates AI transformation opportunities, business impact estimates and a 90-day CXO execution roadmap.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="text-base px-7 bg-accent hover:bg-accent-hover text-white">
                  Explore Demo Assessment
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-base px-7">
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">2 Weeks</div>
              <div className="text-sm text-muted mt-1">Assessment Sprint</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">30/60/90</div>
              <div className="text-sm text-muted mt-1">Day Execution Roadmap</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">CXO-Ready</div>
              <div className="text-sm text-muted mt-1">Operating Model</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">AI-Ranked</div>
              <div className="text-sm text-muted mt-1">Opportunity Pipeline</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground">What PulseIQ Delivers</h2>
            <p className="mt-3 text-muted max-w-2xl mx-auto">
              A complete enterprise intelligence platform that moves from assessment to execution roadmap in weeks, not months.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-xl border border-border bg-white p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-accent-muted flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div className="inline-flex items-center rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent mb-3">
                Cost Reduction
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">Current State Mapping</h3>
              <p className="text-sm text-muted leading-relaxed">
                Map departments, processes, systems, handoffs, and manual work across your enterprise.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-success-muted flex items-center justify-center mb-4">
                <Brain className="h-5 w-5 text-success" />
              </div>
              <div className="inline-flex items-center rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success mb-3">
                Revenue Growth
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">AI Opportunity Discovery</h3>
              <p className="text-sm text-muted leading-relaxed">
                AI analyzes your operating model and generates ranked transformation opportunities.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-info-muted flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-info" />
              </div>
              <div className="inline-flex items-center rounded-full bg-info-muted px-2 py-0.5 text-xs font-medium text-info mb-3">
                Productivity
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">Executive Cockpit</h3>
              <p className="text-sm text-muted leading-relaxed">
                Transformation score, opportunity value, bottlenecks, and executive actions.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-warning-muted flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div className="inline-flex items-center rounded-full bg-warning-muted px-2 py-0.5 text-xs font-medium text-warning mb-3">
                Cycle Time
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">90-Day Roadmap</h3>
              <p className="text-sm text-muted leading-relaxed">
                Milestones, owners, KPIs, and expected business outcomes ready for CXO discussion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground">Built For</h2>
            <p className="mt-3 text-muted max-w-2xl mx-auto">
              Enterprise operations with complex processes, multiple systems, and significant manual work.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Manufacturing</h3>
              </div>
              <p className="text-sm text-muted mb-3">
                Production scheduling delays, manual quality tracking, no real-time OEE visibility.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">SAP ERP</span>
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">MES</span>
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">Excel</span>
              </div>
            </div>
            <div className="rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">EPC & Infrastructure</h3>
              </div>
              <p className="text-sm text-muted mb-3">
                Proposal cycle time, vendor coordination manual, project cost overruns.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">Oracle ERP</span>
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">MS Project</span>
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">WhatsApp</span>
              </div>
            </div>
            <div className="rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Financial Services</h3>
              </div>
              <p className="text-sm text-muted mb-3">
                Month-end close delays, compliance reporting manual, no single source of truth.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">Tally</span>
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">Spreadsheets</span>
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">Manual Audit</span>
              </div>
            </div>
            <div className="rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Recruitment & Talent</h3>
              </div>
              <p className="text-sm text-muted mb-3">
                Recruiter productivity, placement tracking manual, no pipeline visibility.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">Custom ATS</span>
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">Excel</span>
                <span className="text-xs bg-background rounded px-2 py-0.5 text-muted">WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="rounded-2xl bg-white border border-border p-10 lg:p-14">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                See How PulseIQ Works
              </h2>
              <p className="text-muted text-lg leading-relaxed mb-6">
                Explore the demo assessment and see how PulseIQ turns enterprise complexity into a 90-day AI transformation roadmap.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard">
                  <Button size="lg" className="text-base px-7 bg-accent hover:bg-accent-hover text-white">
                    Explore Demo Assessment
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="text-base px-7">
                    Open Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-accent to-info flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-foreground">PulseIQ</span>
              <span className="text-muted">by RightSense Technologies</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Enterprise Intelligence Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
