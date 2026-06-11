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
      <nav className="no-print border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center shadow-sm">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">PulseIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#built-for" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/#results" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Results
            </Link>
            <Link href="/demo" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Demo
            </Link>
            <Link href="/offerings" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Offerings
            </Link>
            <Link href="/openexo" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              OpenExO Support
            </Link>
            <Link href="/demo" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Book Demo
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" className="bg-navy hover:bg-navy/90 text-white shadow-sm font-semibold px-5">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. Dark Hero Section - Centered WinsProposal Style */}
      <section className="relative overflow-hidden bg-hero-bg hero-grid">
        <div className="hero-glow absolute inset-0" />
        <div className="max-w-[980px] mx-auto px-6 py-24 lg:py-28 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm text-white/90 font-medium mb-6 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            The operating intelligence engine powering the RightSense 48-Hour Diagnostic.
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-[3.75rem] font-bold leading-[1.05] text-white mb-4 tracking-tight">
            Enterprise Operating Intelligence for AI Transformation Leaders
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/80 leading-relaxed max-w-[760px] mx-auto mb-10">
            PulseIQ powers the RightSense 48-Hour Enterprise Intelligence, Compliance &amp; Standards Diagnostic — transforming disconnected systems, processes, and bottlenecks into a CXO-ready 90-day execution roadmap.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/assessment/bharat-heavy-fabrications/intake">
              <Button size="lg" className="text-base px-8 h-[52px] bg-green hover:bg-green/90 text-white shadow-lg font-semibold">
                Explore Demo Assessment
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-base px-8 h-[52px] border-white/20 text-white hover:bg-white/10 backdrop-blur-sm font-semibold">
                Open Dashboard
              </Button>
            </Link>
          </div>

          {/* Proof Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: Clock, value: "48-hour", label: "diagnostic sprint" },
              { icon: Calendar, value: "30/60/90", label: "execution roadmap" },
              { icon: Target, value: "CXO-ready", label: "operating model" },
              { icon: TrendingUp, value: "AI-ranked", label: "opportunity pipeline" },
              { icon: BarChart3, value: "Impact", label: "visibility for leadership" },
            ].map((tile) => (
              <div key={tile.label} className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/8 border border-white/15">
                <tile.icon className="h-4 w-4 text-green shrink-0" />
                <div className="text-center">
                  <div className="text-sm font-bold text-white leading-tight">{tile.value}</div>
                  <div className="text-xs text-white/60 leading-tight">{tile.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Role Tags */}
      <section className="bg-white border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["COO / CXO", "Transformation Leader", "ERP / IT Head", "Operations Excellence", "AI Program Owner"].map((tag) => (
              <span key={tag} className="inline-flex items-center px-4 py-1.5 rounded-full border border-border text-sm font-medium text-foreground bg-background">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Built For */}
      <section id="built-for" className="bg-background-alt">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Built for Enterprises Where Generic AI Tools Fall Short</h2>
            <p className="mt-3 text-foreground-secondary max-w-2xl mx-auto">
              PulseIQ is designed for complex operating environments with disconnected systems, manual handoffs, and leadership visibility gaps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: "Manufacturing", desc: "Production scheduling delays, manual quality tracking, no real-time OEE visibility.", tags: ["SAP ERP", "MES", "Excel"], outcome: "Target outcome: quality-related downtime reduction" },
              { title: "EPC & Infrastructure", desc: "Proposal cycle time, vendor coordination manual, project cost overruns.", tags: ["Oracle ERP", "MS Project", "WhatsApp"], outcome: "Target outcome: proposal cycle time reduction" },
              { title: "Financial Services & Operations", desc: "Month-end close delays, compliance reporting manual, no single source of truth.", tags: ["Tally", "Spreadsheets", "Manual Audit"], outcome: "Target outcome: faster month-end close" },
              { title: "Recruitment & Talent", desc: "Recruiter productivity, placement tracking manual, no pipeline visibility.", tags: ["Custom ATS", "Excel", "WhatsApp"], outcome: "Target outcome: recruiter throughput improvement" },
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

      {/* 3. Capability Section */}
      <section className="bg-background">
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

      {/* 4. From Diagnostic to Operating Cockpit */}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">From Diagnostic to Operating Cockpit</h2>
            <p className="mt-3 text-foreground-secondary max-w-2xl mx-auto">
              RightSense owns and delivers the diagnostic; PulseIQ powers the truth map, cockpit, scenarios, recommendations, and execution plan.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: "01", title: "48-Hour Diagnostic", desc: "Rapid discovery of systems, processes, risks, and readiness gaps across the enterprise." },
              { num: "02", title: "Enterprise Truth Map", desc: "Single source of operating truth connecting departments, systems, handoffs, and bottlenecks." },
              { num: "03", title: "Compliance & Standards Readiness", desc: "Readiness view for ISO, customer qualification, statutory documents, and technical standards." },
              { num: "04", title: "CXO Cockpit", desc: "Executive dashboard with headline metrics, variance, risk gap, and transformation score." },
              { num: "05", title: "What-If Scenarios", desc: "Simulate revenue, margin, or cost changes and see the ripple effects across your operating model." },
              { num: "06", title: "Recommendations", desc: "AI-ranked opportunities with impact estimates, priority tier, and timeframe." },
              { num: "07", title: "30/60/90 Execution Plan", desc: "Phased milestones with owners, KPIs, and expected business outcomes." },
            ].map((item) => (
              <div key={item.num} className="rounded-xl border border-border bg-white p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <div className="text-xs font-bold text-accent mb-2">{item.num}</div>
                <h3 className="font-semibold text-foreground mb-1.5 text-sm">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Before / With PulseIQ */}
      <section className="bg-background-alt">
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

      {/* 5. Executive Cockpit Preview */}
      <section className="bg-background">
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
                    <div className="text-xl font-bold text-white leading-tight">72</div>
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

      {/* 6. How It Works */}
      <section className="bg-background-alt">
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

      {/* 7. Trust & Governance */}
      <section className="bg-white border-y border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Trust &amp; Governance by Design</h2>
              <div className="space-y-4">
                {[
                  { title: "Read-only data intake", desc: "PulseIQ never writes to your ERP, CRM, HRMS, or production systems. All data is ingested via exports, extracts, or manual input." },
                  { title: "Human-in-the-loop validation", desc: "Every AI output — facts, gaps, recommendations — must be reviewed and confirmed before appearing in reports or cockpits." },
                  { title: "Source traceability", desc: "Every finding links back to its source document or input. No black-box recommendations." },
                  { title: "AI-output validation", desc: "All AI-generated analysis is flagged for review. The workbench shows what is AI-derived vs. human-confirmed." },
                  { title: "No ERP replacement", desc: "PulseIQ does not replace ERP, CRM, HRMS, BI, or any existing system. It layers intelligence on top of what you already run." },
                  { title: "Executive review before action", desc: "No recommendation reaches the dashboard or report without an executive review checkpoint." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background-alt rounded-2xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Standards &amp; Compliance Readiness</h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                PulseIQ helps organize readiness gaps related to ISO, customer qualification, statutory documents, technical standards, audit evidence, supplier qualification, and AI governance.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["ISO 9001", "ISO 14001", "ISO 45001", "IATF 16949", "Customer Audits", "Statutory Registers", "Technical Specs", "AI Governance"].map((tag) => (
                  <span key={tag} className="text-xs bg-background rounded-lg px-2.5 py-1 text-muted font-medium border border-border">{tag}</span>
                ))}
              </div>
              <div className="rounded-xl border border-warning/20 bg-warning-muted/50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-muted leading-relaxed">
                    PulseIQ and RightSense identify readiness gaps and workflow risks. They do not replace formal certification, legal review, statutory audit, regulatory approval, or customer approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Results / Outcomes */}
      <section id="results" className="bg-background">
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
              { value: "48-Hour", label: "diagnostic to roadmap delivery", icon: Calendar, color: "info" },
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
      <section className="bg-hero-bg hero-grid">
        <div className="hero-glow absolute inset-0" />
        <div className="max-w-[1200px] mx-auto px-6 py-16 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Turn Enterprise Complexity Into a 90-Day AI Transformation Roadmap
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              Delivered by RightSense Technologies and powered by PulseIQ. Start with a 48-Hour Diagnostic or explore the demo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://www.rightsense.in/48-hour-diagnostic" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-base px-8 bg-green hover:bg-green/90 text-white shadow-lg font-semibold">
                  Book Diagnostic via RightSense
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
              <Link href="/assessment/bharat-heavy-fabrications/intake">
                <Button variant="outline" size="lg" className="text-base px-8 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm font-semibold">
                  Explore Demo Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-foreground">PulseIQ</span>
                <span className="text-muted">operating intelligence engine by</span>
                <a href="https://www.rightsense.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:text-accent-hover">RightSense Technologies</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted">Co-Founder: Mohan Babu</span>
              <span className="hidden sm:inline text-muted">·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Enterprise Intelligence Platform</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
