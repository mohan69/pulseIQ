import Link from "next/link";
import { Button } from "@/components/ui/button";
import PrintButton from "@/components/report/PrintButton";
import {
  Brain,
  Zap,
  Server,
  Trophy,
  Activity,
  Circle,
  AlertTriangle,
} from "lucide-react";

export default function OfferingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="no-print sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground">PulseIQ</span>
              <span className="text-xs text-muted ml-2 hidden sm:inline">by RightSense Technologies</span>
            </div>
          </div>
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-background-alt">
                    Home
                  </Button>
                </Link>
                <PrintButton className="bg-accent hover:bg-accent-hover text-white shadow-sm">
                  Print / Save as PDF
                </PrintButton>
              </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-12 space-y-16">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">PulseIQ Offerings</h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Powered by PulseIQ, the operating intelligence engine behind the RightSense 48-Hour Enterprise Intelligence, Compliance &amp; Standards Diagnostic.
          </p>
        </div>

        {/* Quick Readiness Sprint */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">48-Hour Enterprise Diagnostic</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            The RightSense 48-Hour Enterprise Intelligence, Compliance &amp; Standards Diagnostic — a rapid assessment delivering your enterprise truth map, CXO cockpit, and 30/60/90 execution plan.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">What You Get</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Comprehensive Operating Model Assessment
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Bottleneck & Opportunity Analysis
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI Transformation Opportunity Register
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 90-Day Execution Roadmap
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Transformation Readiness Score
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Executive Presentation & Workshop
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Ideal For</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Executives seeking rapid insight
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Organizations new to AI transformation
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Time-boxed exploration initiatives
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Pre-pilot validation
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Edge Twin Blueprint */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Server className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">4-Week Edge Twin Blueprint</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            Design and validate your first AI-native workflow replica for risk-free experimentation and optimization.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">What You Get</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Critical Business Function Selection
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Detailed Process Mapping & Data Modeling
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Edge Twin Architecture Design
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Simulation & Validation Framework
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Risk-Free Experimentation Environment
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Performance Optimization Recommendations
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Ideal For</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Organizations with identified AI opportunities
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Process-intensive operations (manufacturing, logistics)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Data-rich functions seeking optimization
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Innovation teams validating concepts
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pilot to Advantage */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Trophy className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">8-12 Week Pilot to Advantage</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            Build, prove, and scale your first AI-native workflow while establishing the foundation for ongoing transformation.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">What You Get</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Minimum Viable AI-Native Workflow (MVP)
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Data Pipeline & Integration Setup
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Continuous Learning & Optimization System
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Change Management & Adoption Framework
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Performance Measurement & Reporting Dashboard
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Knowledge Transfer & Team Enablement
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Ideal For</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Organizations ready to implement AI solutions
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Functions with clear ROI potential
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Teams seeking hands-on AI experience
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Organizations building AI competency
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PulseIQ Cockpit */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Activity className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">PulseIQ Cockpit: Ongoing Intelligence Operations</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            Continuous monitoring, optimization, and evolution of your intelligence-enabled organization.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">What You Get</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Real-Time Operating Model Monitoring
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Ongoing Opportunity Identification
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Adaptive Roadmap Evolution
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Regular Twin Refinement & Updates
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Executive Intelligence Briefings
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Quarterly Transformation Reviews
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Ideal For</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Organizations committed to continuous transformation
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Companies seeking sustained competitive advantage
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Organizations building AI-native capabilities
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Leaders wanting data-driven decision making
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Start Your Transformation Journey</h2>
          <p className="text-lg text-foreground-secondary max-w-3xl mx-auto mb-8">
            Powered by PulseIQ and delivered by RightSense Technologies. Book a 48-Hour Diagnostic or explore the platform.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
            <a href="https://www.rightsense.in/48-hour-diagnostic" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-accent hover:bg-accent-hover text-white shadow-md">
                Book Diagnostic via RightSense
              </Button>
            </a>
            <Link href="/demo">
              <Button size="lg" className="border-border text-foreground hover:bg-background-alt">
                Explore Demo Assessment
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="border-border text-foreground hover:bg-background-alt">
                Open PulseIQ Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-warning/20 bg-warning-muted/50 p-4 mx-auto max-w-3xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              PulseIQ and RightSense identify readiness gaps and workflow risks. They do not replace formal certification, legal review, statutory audit, regulatory approval, or customer approval.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}