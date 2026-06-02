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

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header is provided by layout */}

      <main className="max-w-[1200px] mx-auto px-6 py-12 space-y-16">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Guided Demo Scenarios</h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Explore how PulseIQ works for different industries through guided assessments.
            Select a scenario to see a pre-configured enterprise intelligence assessment.
          </p>
        </div>

        {/* Manufacturing Scenario */}
        <section className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Manufacturing: Bharat Heavy Fabrications</h2>
          </div>
           <p className="text-sm text-muted mb-4">
             See how PulseIQ identifies AI opportunities in production scheduling, quality inspection, 
             supply chain, maintenance, and finance for an industrial manufacturing company.
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
                  <Circle className="h-3 w-3" /> ₹22-33Cr estimated annual opportunity value
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Executive cockpit with transformation score
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 90-day execution roadmap with owners and KPIs
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
             Discover how PulseIQ transforms proposal response, project cost control, vendor management, 
             and compliance tracking for an engineering, procurement, and construction company.
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
                  <Circle className="h-3 w-3" /> ₹55-80Cr estimated annual opportunity value
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Executive cockpit with transformation score
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 90-day execution roadmap with owners and KPIs
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
             Explore how PulseIQ automates month-end close, compliance reporting, establishes a single source of truth, 
             and provides real-time MIS dashboards for a financial services company.
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
                  <Circle className="h-3 w-3" /> ₹25-35Cr estimated annual opportunity value
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Executive cockpit with transformation score
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 90-day execution roadmap with owners and KPIs
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
            See how PulseIQ transforms resume screening, candidate engagement, client reporting, 
            placement tracking, and revenue forecasting for a recruitment and talent services company.
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
                  <Circle className="h-3 w-3" /> ₹18-25Cr estimated annual opportunity value
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> Executive cockpit with transformation score
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Circle className="h-3 w-3" /> 90-day execution roadmap with owners and KPIs
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
            For a custom assessment of your enterprise, explore the dashboard or book a live demo.
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