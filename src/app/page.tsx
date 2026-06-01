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
  Layers,
  GitBranch,
  Rocket,
  Shield,
  IndianRupee,
  ArrowLeft,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="no-print border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
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

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e4f0fc] via-[#edf5fc] to-[#f4f8fd]">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-cyan/[0.03]" />
        <div className="max-w-[1200px] mx-auto px-6 py-14 lg:py-18 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/15 px-4 py-1.5 text-sm text-accent font-semibold mb-5">
                <Zap className="h-3.5 w-3.5" />
                AI-native enterprise intelligence for operating model transformation
              </div>
              <h1 className="text-4xl lg:text-[2.6rem] font-bold leading-[1.12] text-foreground">
                Enterprise Operating Intelligence Platform
              </h1>
              <p className="mt-4 text-lg text-foreground-secondary leading-relaxed max-w-xl">
                Increase operating visibility, reduce manual effort, and accelerate AI transformation with current-state mapping, opportunity ranking, future workflows, and a 90-day CXO roadmap.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard">
                  <Button size="lg" className="text-base px-7 bg-accent hover:bg-accent-hover text-white shadow-md">
                    Explore Demo Assessment
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="text-base px-7 border-border-hover bg-white">
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

            {/* Right - Preview Panel */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/8 to-cyan/5 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl border border-border shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy to-accent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">Bharat Heavy Fabrications</div>
                        <div className="text-xs text-white/60">Manufacturing · ₹420Cr Revenue</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-2xl font-bold text-white">72</div>
                      <div className="text-[10px] text-white/60 uppercase">Score</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-border">
                  <div className="px-4 py-3 text-center">
                    <div className="text-base font-bold text-accent">₹2.2–3.8 Cr</div>
                    <div className="text-[10px] text-muted uppercase">Opportunity</div>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <div className="text-base font-bold text-success">5</div>
                    <div className="text-[10px] text-muted uppercase">Quick Wins</div>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <div className="text-base font-bold text-warning">4</div>
                    <div className="text-[10px] text-muted uppercase">Bottlenecks</div>
                  </div>
                </div>
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

      {/* 2. Metrics Strip */}
      <section className="border-y border-border bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, value: "2 Weeks", label: "Assessment sprint", color: "text-accent" },
              { icon: Calendar, value: "30/60/90", label: "Execution roadmap", color: "text-warning" },
              { icon: Target, value: "CXO-ready", label: "Operating model", color: "text-success" },
              { icon: TrendingUp, value: "AI-ranked", label: "Opportunity pipeline", color: "text-info" },
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

      {/* 3. Built For */}
      <section className="bg-white/60">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Built for Enterprises Where Generic AI Tools Fall Short</h2>
            <p className="mt-3 text-foreground-secondary max-w-2xl mx-auto">
              PulseIQ is designed for complex operating environments with disconnected systems, manual handoffs, and leadership visibility gaps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: "Manufacturing", desc: "Production scheduling delays, manual quality tracking, no real-time OEE visibility.", tags: ["SAP ERP", "MES", "Excel"], outcome: "Reduce quality-related downtime by 20–30%" },
              { title: "EPC & Infrastructure", desc: "Proposal cycle time, vendor coordination manual, project cost overruns.", tags: ["Oracle ERP", "MS Project", "WhatsApp"], outcome: "Cut proposal cycle time by 40–50%" },
              { title: "Financial Services & Operations", desc: "Month-end close delays, compliance reporting manual, no single source of truth.", tags: ["Tally", "Spreadsheets", "Manual Audit"], outcome: "Accelerate month-end close by 3–5 days" },
              { title: "Recruitment & Talent", desc: "Recruiter productivity, placement tracking manual, no pipeline visibility.", tags: ["Custom ATS", "Excel", "WhatsApp"], outcome: "Improve recruiter throughput by 25–35%" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-white p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="text-sm text-muted mb-3">{item.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-background rounded-lg px-2.5 py-1 text-muted font-medium">{tag}</span>
                  ))}
                </div>
                <div className="text-sm font-medium text-accent">{item.outcome}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Capability / Moat */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">The Operating Intelligence Layer Your Enterprise Is Missing</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Layers, color: "accent", label: "Discovery", title: "Current-State Operating Model", desc: "Map departments, processes, systems, handoffs, and manual work across your enterprise.", metric: "6+ departments mapped" },
              { icon: Zap, color: "success", label: "Ranking", title: "AI Opportunity Ranking", desc: "AI analyzes your operating model and generates ranked transformation opportunities by impact.", metric: "21 opportunities identified" },
              { icon: Rocket, color: "info", label: "Design", title: "Future Workflow Design", desc: "Design AI-augmented workflows with recommended agents, automations, and governance.", metric: "5–8 agents per department" },
              { icon: BarChart3, color: "warning", label: "Dashboard", title: "Executive Cockpit", desc: "Transformation score, opportunity value, bottlenecks, and executive actions at a glance.", metric: "Real-time readiness score" },
              { icon: Calendar, color: "accent", label: "Roadmap", title: "90-Day Roadmap", desc: "Phased milestones, owners, KPIs, and expected business outcomes ready for CXO discussion.", metric: "30/60/90 day plan" },
              { icon: Shield, color: "success", label: "Governance", title: "Governance & Adoption Readiness", desc: "AI adoption readiness assessment with governance recommendations for safe deployment.", metric: "Risk-aware deployment" },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-border bg-white p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <div className={`h-11 w-11 rounded-xl bg-${card.color}-muted flex items-center justify-center mb-4`}>
                  <card.icon className={`h-5 w-5 text-${card.color}`} />
                </div>
                <div className={`inline-flex items-center rounded-full bg-${card.color}-muted px-2.5 py-0.5 text-xs font-medium text-${card.color} mb-3`}>
                  {card.label}
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{card.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-3">{card.desc}</p>
                <div className="text-xs font-semibold text-foreground-secondary">{card.metric}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Before / With PulseIQ */}
      <section className="bg-white/60">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Before PulseIQ vs. With PulseIQ</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-error/20 bg-error-muted p-6">
              <div className="text-sm font-bold text-error uppercase mb-4 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Before PulseIQ
              </div>
              <div className="space-y-3">
                {[
                  "Disconnected systems and spreadsheets",
                  "Manual reporting across departments",
                  "Unclear process ownership and handoffs",
                  "Slow AI adoption decisions",
                  "No quantified transformation roadmap",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <AlertTriangle className="h-4 w-4 text-error shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-success/20 bg-success-muted p-6">
              <div className="text-sm font-bold text-success uppercase mb-4 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                With PulseIQ
              </div>
              <div className="space-y-3">
                {[
                  "Mapped systems, departments, processes",
                  "Ranked AI opportunities with impact estimates",
                  "Business impact quantified in ₹ terms",
                  "Executive cockpit for real-time visibility",
                  "30/60/90 roadmap with owners and KPIs",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Executive Cockpit Preview */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Executive Operating Intelligence Dashboard</h2>
            <p className="mt-3 text-foreground-secondary max-w-2xl mx-auto">
              A single view of transformation readiness, opportunity value, and actionable next steps for CXO leadership.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="p-6 border-b border-border bg-gradient-to-r from-navy/5 to-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-foreground">Bharat Heavy Fabrications</div>
                  <div className="text-sm text-muted">Manufacturing · ₹420Cr Revenue · 1,850 employees</div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-info flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">72</div>
                    <div className="text-[8px] text-white/70 uppercase">Score</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
              <div className="p-5 text-center">
                <div className="text-xl font-bold text-accent">₹2.2–3.8 Cr</div>
                <div className="text-xs text-muted mt-1">Opportunity Value</div>
              </div>
              <div className="p-5 text-center">
                <div className="text-xl font-bold text-success">5</div>
                <div className="text-xs text-muted mt-1">Quick Wins</div>
              </div>
              <div className="p-5 text-center">
                <div className="text-xl font-bold text-warning">4</div>
                <div className="text-xs text-muted mt-1">Top Bottlenecks</div>
              </div>
              <div className="p-5 text-center">
                <div className="text-xl font-bold text-info">21</div>
                <div className="text-xs text-muted mt-1">Total Opportunities</div>
              </div>
            </div>
            <div className="p-6 grid lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground uppercase">Top Executive Actions</div>
                <div className="p-3 rounded-lg bg-success-muted border border-success/10 text-sm">Deploy AI quality inspection on Shop Floor B</div>
                <div className="p-3 rounded-lg bg-success-muted border border-success/10 text-sm">Automate production reporting from MES</div>
                <div className="p-3 rounded-lg bg-success-muted border border-success/10 text-sm">Implement predictive maintenance alerts</div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground uppercase">Top Bottlenecks</div>
                <div className="p-3 rounded-lg bg-error-muted border border-error/10 text-sm">Manual Excel reconciliation across 3 departments</div>
                <div className="p-3 rounded-lg bg-error-muted border border-error/10 text-sm">No real-time OEE visibility</div>
                <div className="p-3 rounded-lg bg-error-muted border border-error/10 text-sm">WhatsApp-based vendor coordination</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section className="bg-white/60">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How PulseIQ Works</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { num: "01", title: "Map Enterprise Context", desc: "Capture company profile, systems, and strategic priorities", icon: Building2 },
              { num: "02", title: "Capture Operating Model", desc: "Map departments, processes, handoffs, and manual work", icon: GitBranch },
              { num: "03", title: "Rank AI Opportunities", desc: "Generate and prioritize transformation opportunities", icon: Zap },
              { num: "04", title: "Generate Future Workflows", desc: "Design AI-augmented workflows and governance", icon: Rocket },
              { num: "05", title: "Build 90-Day Roadmap", desc: "Create phased execution plan with milestones", icon: Calendar },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="h-12 w-12 rounded-xl bg-accent-muted flex items-center justify-center mx-auto mb-3">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="text-xs font-bold text-accent mb-1">{step.num}</div>
                <div className="text-sm font-semibold text-foreground mb-1">{step.title}</div>
                <div className="text-xs text-muted">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Results / Outcomes */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Potential Impact</h2>
            <p className="mt-3 text-foreground-secondary max-w-2xl mx-auto">
              Estimated outcomes based on pilot assessments. Actual results are deployment-dependent.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { value: "20–30%", label: "Manual effort reduction potential", icon: TrendingUp, color: "success" },
              { value: "30–50%", label: "Faster assessment cycle", icon: Clock, color: "accent" },
              { value: "₹100Cr+", label: "Transformation impact range", icon: IndianRupee, color: "warning" },
              { value: "2 Weeks", label: "CXO-ready roadmap delivery", icon: Calendar, color: "info" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-white p-6 text-center hover:shadow-lg transition-all">
                <div className={`h-11 w-11 rounded-xl bg-${item.color}-muted flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className={`h-5 w-5 text-${item.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{item.value}</div>
                <div className="text-sm text-muted mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final CTA Band */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="rounded-2xl bg-gradient-to-br from-navy to-accent p-10 lg:p-14">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Turn Enterprise Complexity Into a 90-Day AI Transformation Roadmap
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Explore the demo assessment and see how PulseIQ can support a 2-week CXO operating intelligence sprint.
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
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
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
