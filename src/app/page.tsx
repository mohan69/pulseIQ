"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Brain,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Clock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="no-print border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold">PulseIQ</span>
              <span className="text-xs text-muted ml-1.5 hidden sm:inline">Enterprise Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-success/5" />
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-muted px-3 py-1 text-sm text-accent mb-6">
              <Zap className="h-3.5 w-3.5" />
              AI-Native Enterprise Intelligence
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
              Convert enterprise complexity into{" "}
              <span className="text-accent">AI-native operating intelligence</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl leading-relaxed">
              PulseIQ maps your current operating model, identifies AI
              transformation opportunities, estimates business impact, and gives
              your CXO team a 90-day execution roadmap.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="text-base px-8">
                  Start Enterprise Assessment
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard?demo=true">
                <Button variant="outline" size="lg" className="text-base px-8">
                  View Demo Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">What PulseIQ Delivers</h2>
            <p className="mt-4 text-muted max-w-2xl mx-auto">
              A complete enterprise intelligence platform that moves from
              assessment to execution roadmap in weeks, not months.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="h-10 w-10 rounded-lg bg-accent-muted flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Current State Mapping</h3>
              <p className="text-sm text-muted">
                Map departments, processes, systems, handoffs, and manual work
                across your enterprise. Identify bottlenecks and risks.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <Brain className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-semibold mb-2">AI Opportunity Discovery</h3>
              <p className="text-sm text-muted">
                AI analyzes your operating model and generates ranked
                transformation opportunities with measurable business impact
                estimates.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Executive Roadmap</h3>
              <p className="text-sm text-muted">
                30/60/90 day execution roadmap with milestones, owners, KPIs,
                and expected business outcomes ready for CXO discussion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Paid Pilot Promise
              </h2>
              <div className="rounded-xl border border-accent/20 bg-accent-muted p-6 mb-6">
                <p className="text-lg font-medium text-accent">
                  &quot;In 2 weeks, PulseIQ maps your current operating model,
                  identifies AI transformation opportunities, estimates business
                  impact, and gives your CXO team a 90-day execution
                  roadmap.&quot;
                </p>
              </div>
              <div className="space-y-3">
                {[
                  "Enterprise operating model assessment",
                  "AI transformation opportunity ranking",
                  "Measurable business impact estimates",
                  "30/60/90 day execution roadmap",
                  "Executive cockpit with KPIs",
                  "CXO-ready presentation deck",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Built For</h2>
              <div className="space-y-4">
                {[
                  {
                    industry: "Manufacturing",
                    desc: "Production optimization, OEE improvement, predictive maintenance",
                  },
                  {
                    industry: "EPC & Infrastructure",
                    desc: "Project cost control, proposal automation, vendor intelligence",
                  },
                  {
                    industry: "Financial Services",
                    desc: "Month-end close acceleration, compliance automation, MIS dashboards",
                  },
                  {
                    industry: "Recruitment & Talent",
                    desc: "Recruiter productivity, pipeline intelligence, client reporting",
                  },
                ].map((item) => (
                  <div
                    key={item.industry}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="font-semibold">{item.industry}</div>
                    <div className="text-sm text-muted mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Enterprise?
          </h2>
          <p className="text-muted max-w-xl mx-auto mb-8">
            Start with a free assessment. See your enterprise through the lens
            of AI transformation.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-base px-8">
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <Brain className="h-3 w-3 text-white" />
            </div>
            <div>
              <span className="font-medium">PulseIQ</span>
              <span className="mx-1.5">|</span>
              <span>RightSense Technologies Pvt Ltd</span>
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
