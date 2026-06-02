import Link from "next/link";
import { Button } from "@/components/ui/button";
import PrintButton from "@/components/report/PrintButton";
import {
  Brain,
  Target,
  Server,
  RefreshCw,
  Circle,
  Activity,
  Download,
  Bot,
  TrendingUp,
} from "lucide-react";

export default function OpenExoPage() {
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
            <PrintButton className="bg-accent hover:bg-accent-hover text-white shadow-sm" />
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-12 space-y-16">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">OpenExO Alignment</h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            PulseIQ aligns with OpenExO principles to enable organizational singularity through intelligence-driven transformation.
          </p>
        </div>

        {/* ExO 3.0 = Destination Architecture */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">ExO 3.0: Destination Architecture</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            The desired future state of an organization operating at exponential scale, characterized by Massive Transformative Purpose (MTP), SCALE attributes, and IDEAS principles.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">SCALE Attributes</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Staff on Demand
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Community & Crowd
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Algorithms
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Leveraged Assets
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Engagement
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">IDEAS Principles</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Interfaces
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Dashboards
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Experimentation
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Autonomy
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Social Technologies
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Stack = Operating System */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Server className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Intelligence Stack: Operating System</h2>
          </div>
          <p className="text-sm text-muted mb-4">
             PulseIQ&apos;s integrated technology platform that enables organizations to sense, learn, and adapt at exponential speeds.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Sensing Layer</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Operating Model Mapping
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Process & Bottleneck Analysis
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Opportunity Identification
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Learning & Adaptation Layer</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> AI-Powered Insights
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Transformation Readiness Scoring
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 90-Day Execution Roadmaps
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* REWRITE = Playbook */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">REWRITE: Transformation Playbook</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            PulseIQ&apos;s systematic approach to organizational transformation, guiding organizations from current state to exponential future.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-accent-muted flex items-center justify-center">
                <Circle className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Backcast</h3>
                <p className="text-sm text-muted">Define Massive Transformative Purpose (MTP) and desired future state</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-accent-muted flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Assess</h3>
                <p className="text-sm text-muted">Map current operating model and identify transformation readiness</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-accent-muted flex items-center justify-center">
                <Download className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Extract</h3>
                <p className="text-sm text-muted">Identify and prioritize AI transformation opportunities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-accent-muted flex items-center justify-center">
                <Activity className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Diagnose</h3>
                <p className="text-sm text-muted">Analyze root causes and design intervention strategies</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-accent-muted flex items-center justify-center">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Build & Prove</h3>
                <p className="text-sm text-muted">Create minimum viable AI-native workflows and validate impact</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-accent-muted flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Rewire</h3>
                <p className="text-sm text-muted">Scale successful patterns and reorganize for exponential growth</p>
              </div>
            </div>
          </div>
        </section>

        {/* Edge Twin = First AI-Native Workflow */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Edge Twin: First AI-Native Workflow/Business-Function Replica</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            PulseIQ creates the first intelligent replica of a critical business function, enabling testing, optimization, and risk-free transformation.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Purpose</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Risk-free experimentation
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Performance optimization
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Data-driven decision making
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-2">Characteristics</h3>
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Mirrors real-world processes
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Continuously learns from data
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Simulates intervention outcomes
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Transform?</h2>
          <p className="text-lg text-foreground-secondary max-w-3xl mx-auto mb-8">
            PulseIQ provides the intelligence foundation for organizations pursuing exponential transformation aligned with OpenExO principles.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-accent hover:bg-accent-hover text-white shadow-md">
                Open PulseIQ Dashboard
              </Button>
            </Link>
             <PrintButton className="border-border text-foreground hover:bg-background-alt">
               Save Alignment Overview
             </PrintButton>
          </div>
        </div>
      </main>
    </div>
  );
}