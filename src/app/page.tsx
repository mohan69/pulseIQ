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
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const demoStats = {
  score: 72,
  opportunityValue: "₹2.2–3.8 Cr",
  quickWins: 5,
  bottlenecks: 4,
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="no-print border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center shadow-sm">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground leading-tight">PulseIQ</span>
              <span className="text-[11px] text-muted leading-none">Enterprise Intelligence</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-foreground-secondary hover:text-foreground">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-accent hover:bg-accent-hover text-white shadow-sm">
                Explore Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eef5ff] via-[#f3f8ff] to-[#f8fbff]">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-cyan/[0.04]" />
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left Column */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-muted border border-accent/10 px-4 py-1.5 text-sm text-accent font-medium mb-5">
                <Zap className="h-3.5 w-3.5" />
                AI-Native Enterprise Intelligence
              </div>
              <h1 className="text-4xl lg:text-[2.5rem] font-bold leading-[1.15] text-foreground">
                Convert Enterprise Complexity Into{" "}
                <span className="bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">AI-Native Operating Intelligence</span>
              </h1>
              <p className="mt-4 text-lg text-foreground-secondary leading-relaxed max-w-xl">
                PulseIQ maps systems, departments, processes and bottlenecks, then generates AI transformation opportunities, business impact estimates and a 90-day CXO execution roadmap.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard">
                  <Button size="lg" className="text-base px-7 bg-accent hover:bg-accent-hover text-white shadow-md hover:shadow-lg transition-shadow">
                    Explore Demo Assessment
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="text-base px-7 border-border-hover">
                    Open Dashboard
                  </Button>
                </Link>
              </div>
              <div className="mt-7 flex items-center gap-5 text-sm text-muted">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  No setup required
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  4 demo enterprises
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Full 7-step flow
                </div>
              </div>
            </div>

            {/* Right Column - Preview Panel */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/5 to-cyan/5 rounded-3xl blur-xl" />
              <div className="relative bg-white rounded-2xl border border-border shadow-xl overflow-hidden">
                {/* Preview Header */}
                <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy to-accent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">Bharat Heavy Fabrications</div>
                        <div className="text-xs text-white/60">Manufacturing · ₹420Cr Revenue</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-2xl font-bold text-white">{demoStats.score}</div>
                      <div className="text-[10px] text-white/60 uppercase">Score</div>
                    </div>
                  </div>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-3 divide-x divide-border">
                  <div className="px-4 py-3 text-center">
                    <div className="text-base font-bold text-accent">{demoStats.opportunityValue}</div>
                    <div className="text-[10px] text-muted uppercase">Opportunity</div>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <div className="text-base font-bold text-success">{demoStats.quickWins}</div>
                    <div className="text-[10px] text-muted uppercase">Quick Wins</div>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <div className="text-base font-bold text-warning">{demoStats.bottlenecks}</div>
                    <div className="text-[10px] text-muted uppercase">Bottlenecks</div>
                  </div>
                </div>

                {/* Mini Cards */}
                <div className="p-4 space-y-2.5">
                  <div className="p-3 rounded-xl bg-accent-muted border border-accent/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-semibold text-accent uppercase">Top Opportunity</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">AI-Powered Quality Inspection</div>
                    <div className="text-xs text-muted mt-0.5">Saves 1,200+ hours annually</div>
                  </div>
                  <div className="p-3 rounded-xl bg-success-muted border border-success/10">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs font-semibold text-success uppercase">Quick Win</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">Automated Production Reports</div>
                    <div className="text-xs text-muted mt-0.5">Saves 40 hours per week</div>
                  </div>
                  <div className="p-3 rounded-xl bg-warning-muted border border-warning/10">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      <span className="text-xs font-semibold text-warning uppercase">Key Bottleneck</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">Manual Excel reconciliation</div>
                    <div className="text-xs text-muted mt-0.5">3 departments affected</div>
                  </div>
                </div>

                {/* Roadmap Preview */}
                <div className="px-4 pb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-navy/5 to-accent/5 border border-border">
                    <div className="text-xs font-semibold text-foreground uppercase mb-2">30/60/90 Day Roadmap</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-center p-2 rounded-lg bg-white border border-border">
                        <div className="text-xs font-bold text-accent">30 Days</div>
                        <div className="text-[10px] text-muted mt-0.5">Assess + Quick Wins</div>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted shrink-0" />
                      <div className="flex-1 text-center p-2 rounded-lg bg-white border border-border">
                        <div className="text-xs font-bold text-warning">60 Days</div>
                        <div className="text-[10px] text-muted mt-0.5">Implement + Track</div>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted shrink-0" />
                      <div className="flex-1 text-center p-2 rounded-lg bg-white border border-border">
                        <div className="text-xs font-bold text-success">90 Days</div>
                        <div className="text-[10px] text-muted mt-0.5">Scale + Govern</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, value: "2 Weeks", label: "Assessment Sprint", color: "text-accent" },
              { icon: Calendar, value: "30/60/90", label: "Day Execution Roadmap", color: "text-warning" },
              { icon: Target, value: "CXO-Ready", label: "Operating Model", color: "text-success" },
              { icon: TrendingUp, value: "AI-Ranked", label: "Opportunity Pipeline", color: "text-info" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shrink-0">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What PulseIQ Delivers */}
      <section>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">What PulseIQ Delivers</h2>
            <p className="mt-3 text-foreground-secondary max-w-2xl mx-auto">
              A complete enterprise intelligence platform that moves from assessment to execution roadmap in weeks, not months.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Target, color: "accent", label: "Cost Reduction", title: "Current State Mapping", desc: "Map departments, processes, systems, handoffs, and manual work across your enterprise." },
              { icon: Brain, color: "success", label: "Revenue Growth", title: "AI Opportunity Discovery", desc: "AI analyzes your operating model and generates ranked transformation opportunities." },
              { icon: BarChart3, color: "info", label: "Productivity", title: "Executive Cockpit", desc: "Transformation score, opportunity value, bottlenecks, and executive actions." },
              { icon: Calendar, color: "warning", label: "Cycle Time", title: "90-Day Roadmap", desc: "Milestones, owners, KPIs, and expected business outcomes ready for CXO discussion." },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-border bg-white p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <div className={`h-11 w-11 rounded-xl bg-${card.color}-muted flex items-center justify-center mb-4`}>
                  <card.icon className={`h-5 w-5 text-${card.color}`} />
                </div>
                <div className={`inline-flex items-center rounded-full bg-${card.color}-muted px-2.5 py-0.5 text-xs font-medium text-${card.color} mb-3`}>
                  {card.label}
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{card.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built For */}
      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Built For</h2>
            <p className="mt-3 text-foreground-secondary max-w-2xl mx-auto">
              Enterprise operations with complex processes, multiple systems, and significant manual work.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: "Manufacturing", desc: "Production scheduling delays, manual quality tracking, no real-time OEE visibility.", tags: ["SAP ERP", "MES", "Excel"] },
              { title: "EPC & Infrastructure", desc: "Proposal cycle time, vendor coordination manual, project cost overruns.", tags: ["Oracle ERP", "MS Project", "WhatsApp"] },
              { title: "Financial Services", desc: "Month-end close delays, compliance reporting manual, no single source of truth.", tags: ["Tally", "Spreadsheets", "Manual Audit"] },
              { title: "Recruitment & Talent", desc: "Recruiter productivity, placement tracking manual, no pipeline visibility.", tags: ["Custom ATS", "Excel", "WhatsApp"] },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="text-sm text-muted mb-3">
                  {item.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-background rounded-lg px-2.5 py-1 text-muted font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="rounded-2xl bg-gradient-to-br from-navy to-accent p-10 lg:p-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                See How PulseIQ Works
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Explore the demo assessment and see how PulseIQ turns enterprise complexity into a 90-day AI transformation roadmap.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard">
                  <Button size="lg" className="text-base px-8 bg-white text-accent hover:bg-white/90 shadow-lg">
                    Explore Demo Assessment
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="text-base px-8 border-white/20 text-white hover:bg-white/10">
                    Open Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
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
