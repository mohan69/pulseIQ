import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  Circle,
} from "lucide-react";
import {
  DIAGNOSTIC_DISCLAIMER,
  DIAGNOSTIC_PILLARS,
  DIAGNOSTIC_POSITIONING,
} from "@/lib/diagnostic-positioning";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header is provided by layout */}

      <main className="max-w-[1200px] mx-auto px-6 py-12 space-y-16">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Guided Demo Scenarios</h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            {DIAGNOSTIC_POSITIONING} Select a scenario to see a pre-configured
            truth map, readiness review, cockpit, and execution plan.
          </p>
        </div>

        <section className="rounded-2xl border border-accent/20 bg-accent-muted/30 p-6">
          <h2 className="text-lg font-bold text-foreground">
            Diagnostic pillars
          </h2>
          <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {DIAGNOSTIC_PILLARS.map((pillar) => (
              <div
                key={pillar}
                className="rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-medium text-foreground"
              >
                {pillar}
              </div>
            ))}
          </div>
        </section>

        {/* Manufacturing Scenario */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Manufacturing: Bharat Heavy Fabrications</h2>
          </div>
           <p className="text-sm text-muted mb-4">
             See operating, margin, ISO and technical standards, statutory
             documentation, supplier qualification, customer prequalification,
             and AI governance readiness for an industrial manufacturer.
           </p>
           <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-3">
               <h3 className="text-lg font-bold text-foreground mb-2">What You&#x27;ll See</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Mapped operating model across 4 departments
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 8 AI transformation opportunities identified
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> ISO and customer standards readiness evidence gaps
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Supplier qualification and statutory evidence status
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Human-approved AI governance and 30/60/90 plan
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Key Opportunities</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI-Powered Production Scheduling (Quick Win)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Computer Vision Quality Inspection (Strategic)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Predictive Material Reconciliation (Quick Win)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Predictive Maintenance Platform (Strategic)
                </span>
              </div>
            </div>
          </div>
          <Link href="/assessment/bharat-heavy-fabrications/intake">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-white shadow-md">
              Start Manufacturing Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* EPC Scenario */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">EPC: Apex EPC Infrastructure</h2>
          </div>
           <p className="text-sm text-muted mb-4">
             Review proposal response, project cost control, vendor and
             subcontractor governance, customer prequalification, technical
             standards mapping, and compliance evidence readiness.
           </p>
           <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-3">
               <h3 className="text-lg font-bold text-foreground mb-2">What You&#x27;ll See</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Mapped operating model across 4 departments
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 5 AI transformation opportunities identified
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> API / ASME / ANSI / IEC / ISA mapping gaps
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Vendor registration and subcontractor governance readiness
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Customer prequalification and audit evidence plan
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Key Opportunities</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI-Powered RFP Response Generator (Quick Win)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Real-Time Project Cost Intelligence (Strategic)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI Vendor Intelligence Platform (Quick Win)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Predictive Project Risk Engine (Strategic)
                </span>
              </div>
            </div>
          </div>
          <Link href="/assessment/apex-epc-infrastructure/intake">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-white shadow-md">
              Start EPC Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Financial Services Scenario */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Financial Services: Meridian Finance & Operations</h2>
          </div>
           <p className="text-sm text-muted mb-4">
             Explore month-end close, compliance reporting, statutory document
             readiness, audit trail coverage, source traceability, and
             human-approved AI output validation.
           </p>
           <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-3">
               <h3 className="text-lg font-bold text-foreground mb-2">What You&#x27;ll See</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Mapped operating model across 4 departments
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 6 AI transformation opportunities identified
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Statutory document and audit evidence gaps
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Source traceability and approval workflow coverage
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI governance controls and 30/60/90 plan
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Key Opportunities</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI-Automated Month-End Close (Quick Win)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Intelligent Compliance Automation (Quick Win)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Single Source of Truth Platform (Strategic)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Real-Time MIS Dashboard (Quick Win)
                </span>
              </div>
            </div>
          </div>
          <Link href="/assessment/meridian-finance/intake">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-white shadow-md">
              Start Financial Services Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Recruitment Scenario */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Trophy className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Recruitment: CareerAxis Talent Solutions</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            See talent and capacity truth, client prequalification
            documentation, partner readiness, source traceability, role-based
            controls, and human validation for AI-assisted workflows.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
               <h3 className="text-lg font-bold text-foreground mb-2">What You&#x27;ll See</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Mapped operating model across 3 departments
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 5 AI transformation opportunities identified
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Talent/capacity and client documentation readiness
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Prompt/output review and approval workflow coverage
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Human-in-the-loop AI governance and audit trail plan
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Key Opportunities</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI Resume Screening & Matching (Quick Win)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI Candidate Engagement Engine (Strategic)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Automated Client Reporting Portal (Quick Win)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Intelligent Placement Pipeline (Strategic)
                </span>
              </div>
            </div>
          </div>
          <Link href="/assessment/careeraxis-talent/intake">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-white shadow-md">
              Start Recruitment Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Ready for Your Own Assessment?</h2>
          <p className="text-lg text-foreground-secondary max-w-3xl mx-auto mb-8">
            These demos show how PulseIQ works for specific industries. 
            RightSense owns and delivers the diagnostic; PulseIQ powers the
            evidence-backed app experience.
          </p>
          <p className="text-sm text-muted max-w-4xl mx-auto mb-8">
            {DIAGNOSTIC_DISCLAIMER}
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-accent hover:bg-accent-hover text-white shadow-md">
                Open PulseIQ Dashboard
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" className="border-border text-foreground hover:bg-background-alt">
                Book Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
