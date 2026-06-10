"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  Gauge,
  History,
  Lightbulb,
  MessageSquareText,
  Plus,
  RefreshCw,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  generateGrowthIntelligence,
  getCompositeFitScore,
} from "@/lib/growth-intelligence/generator";
import type {
  GrowthAccount,
  GrowthAccountInput,
  GrowthAuditLog,
  GrowthFitScores,
  GrowthMode,
  GrowthPipelineStatus,
  RightSenseFitScores,
} from "@/lib/growth-intelligence/types";

const DEMO_ORG_ID = "demo-rightsense-org";
const DEMO_USER_ID = "demo-admin-user";

const PIPELINE_STATUSES: GrowthPipelineStatus[] = [
  "Target Identified",
  "Researched",
  "Outreach Drafted",
  "Outreach Sent",
  "Replied",
  "Discovery Scheduled",
  "Demo Completed",
  "Proposal Shared",
  "Pilot / Deal Won",
  "Nurture / Lost",
];

const EMPTY_FORM: GrowthAccountInput = {
  companyName: "",
  website: "",
  industry: "Industrial Manufacturing",
  location: "",
  segment: "Mid-market manufacturer",
  targetProductService: "PulseIQ",
  targetPersona: "CEO / MD",
  contactName: "",
  contactRole: "",
  linkedInUrl: "",
  notes: "",
  mode: "rightsense",
};

type DraftKey =
  | "cxoEmail"
  | "functionalLeaderEmail"
  | "linkedInNote"
  | "whatsappMessage"
  | "followUpMessage"
  | "discoveryCallBrief";

type Props = {
  initialAccounts: GrowthAccount[];
  initialAuditLogs: GrowthAuditLog[];
};

export function GrowthIntelligenceWorkspace({
  initialAccounts,
  initialAuditLogs,
}: Props) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedId, setSelectedId] = useState(
    initialAccounts.find((account) => account.id === "growth-microfinish-valves")
      ?.id ?? initialAccounts[0]?.id,
  );
  const [form, setForm] = useState<GrowthAccountInput>(EMPTY_FORM);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [approvedDrafts, setApprovedDrafts] = useState<
    Record<string, DraftKey[]>
  >({});
  const [formMessage, setFormMessage] = useState("");
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  const selectedAccount =
    accounts.find((account) => account.id === selectedId) ?? accounts[0];
  const selectedApprovedDrafts = selectedAccount
    ? approvedDrafts[selectedAccount.id] ?? []
    : [];

  const kpis = useMemo(() => {
    const scored = accounts.map((account) => ({
      account,
      score: getCompositeFitScore(account.fitScores),
    }));
    const highFit = scored.filter(({ score }) => score >= 75).length;
    const drafted = accounts.filter((account) =>
      PIPELINE_STATUSES.slice(2).includes(account.outcome.status),
    ).length;
    const discoveryReady = accounts.filter((account) =>
      [
        "Replied",
        "Discovery Scheduled",
        "Demo Completed",
        "Proposal Shared",
        "Pilot / Deal Won",
      ].includes(account.outcome.status),
    ).length;
    const proposals = accounts.filter((account) =>
      ["Proposal Shared", "Pilot / Deal Won"].includes(account.outcome.status),
    ).length;
    const segmentScores = new Map<string, number[]>();
    for (const { account, score } of scored) {
      const scores = segmentScores.get(account.segment) ?? [];
      scores.push(score);
      segmentScores.set(account.segment, scores);
    }
    const bestSegment =
      Array.from(segmentScores.entries())
        .map(([segment, scores]) => ({
          segment,
          average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        }))
        .sort((a, b) => b.average - a.average)[0]?.segment ?? "No data";

    return [
      {
        label: "Target Accounts",
        value: accounts.length.toString(),
        hint: "Tenant-scoped accounts",
        icon: Target,
        tone: "accent",
      },
      {
        label: "High-Fit Accounts",
        value: highFit.toString(),
        hint: "Composite score 75+",
        icon: TrendingUp,
        tone: "success",
      },
      {
        label: "Outreach Drafted",
        value: drafted.toString(),
        hint: "Review required",
        icon: FileText,
        tone: "info",
      },
      {
        label: "Discovery Ready",
        value: discoveryReady.toString(),
        hint: "Reply or later stage",
        icon: UserRoundCheck,
        tone: "success",
      },
      {
        label: "Proposals / Pilots",
        value: proposals.toString(),
        hint: "Commercial validation",
        icon: BriefcaseBusiness,
        tone: "warning",
      },
      {
        label: "Best Segment",
        value: bestSegment,
        hint: "By average fit",
        icon: BarChart3,
        tone: "accent",
      },
    ];
  }, [accounts]);

  const setField = <K extends keyof GrowthAccountInput>(
    key: K,
    value: GrowthAccountInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const createAccount = () => {
    if (!form.companyName.trim()) {
      setFormMessage("Company Name is required.");
      return;
    }
    const now = new Date().toISOString();
    const generated = generateGrowthIntelligence(form);
    const account: GrowthAccount = {
      id: `growth-${form.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${accounts.length + 1}`,
      orgId: DEMO_ORG_ID,
      createdBy: DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
      ...form,
      ...generated,
      outcome: {
        status: "Outreach Drafted",
        nextAction: "Review intelligence and approve a draft",
        outcome: "Drafts generated; no outreach sent",
        updatedAt: now,
      },
    };
    const newAuditEvents: GrowthAuditLog[] = [
      {
        id: `audit-${account.id}-created`,
        orgId: DEMO_ORG_ID,
        createdBy: DEMO_USER_ID,
        createdAt: now,
        updatedAt: now,
        accountId: account.id,
        event: "Account created",
        summary: `${account.companyName} added to the tenant account list.`,
      },
      {
        id: `audit-${account.id}-intelligence`,
        orgId: DEMO_ORG_ID,
        createdBy: DEMO_USER_ID,
        createdAt: now,
        updatedAt: now,
        accountId: account.id,
        event: "Intelligence generated",
        summary: "Deterministic brief, fit scores, and review-only drafts generated.",
      },
    ];
    setAccounts((current) => [account, ...current]);
    setAuditLogs((current) => [...newAuditEvents, ...current].slice(0, 8));
    setSelectedId(account.id);
    setForm(EMPTY_FORM);
    setFormMessage("Account created and intelligence generated in memory.");
    setIsIntakeOpen(false);
  };

  const regenerateSelectedAccount = () => {
    if (!selectedAccount) return;
    const generated = generateGrowthIntelligence(selectedAccount);
    const now = new Date().toISOString();
    setAccounts((current) =>
      current.map((account) =>
        account.id === selectedAccount.id
          ? { ...account, ...generated, updatedAt: now }
          : account,
      ),
    );
    setAuditLogs((current) =>
      [
        {
          id: `audit-${selectedAccount.id}-${now}`,
          orgId: DEMO_ORG_ID,
          createdBy: DEMO_USER_ID,
          createdAt: now,
          updatedAt: now,
          accountId: selectedAccount.id,
          event: "Intelligence generated" as const,
          summary: "Account intelligence regenerated from the current safe fields.",
        },
        ...current,
      ].slice(0, 8),
    );
  };

  const toggleDraftApproval = (draftKey: DraftKey) => {
    if (!selectedAccount) return;
    setApprovedDrafts((current) => {
      const approved = current[selectedAccount.id] ?? [];
      const next = approved.includes(draftKey)
        ? approved.filter((key) => key !== draftKey)
        : [...approved, draftKey];
      return { ...current, [selectedAccount.id]: next };
    });
  };

  if (!selectedAccount) {
    return <Card className="text-sm text-muted">No demo accounts available.</Card>;
  }

  const learning = {
    segment: kpis[5].value,
    persona: "Proposal Head",
    pain: "Proposal speed and execution visibility",
    channel: "Human-approved email",
    campaign: "Industrial OEM bid-readiness campaign",
    confidence: "82%",
  };

  return (
    <div className="growth-intelligence-workspace space-y-8">
      <section className="overflow-hidden rounded-2xl bg-hero-bg text-white shadow-lg">
        <div className="relative px-6 py-7 md:px-8 md:py-9 hero-grid">
          <div className="absolute inset-0 hero-glow" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Customer-facing growth workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Growth Intelligence Agent
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
                Prioritize target accounts, identify business pain signals,
                prepare human-approved outreach, and learn from GTM outcomes.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 font-medium text-white">
                <ShieldCheck className="h-4 w-4 text-cyan" />
                Review-first by design
              </div>
              <div className="mt-1 text-xs text-white/70">
                Demo org · deterministic data · no outbound sending
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <SafetyNote
          icon={ClipboardCheck}
          text="Outreach drafts are generated for review and approval. The system does not send messages automatically."
        />
        <SafetyNote
          icon={BrainCircuit}
          text="Learning insights are based on captured GTM outcomes and scoring patterns."
        />
        <SafetyNote
          icon={ShieldCheck}
          text="Security & Governance controls keep records tenant-scoped, minimize sensitive data, and disable cross-customer sharing."
        />
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const toneClasses = getToneClasses(kpi.tone);
          return (
            <Card key={kpi.label} className="p-4">
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses.background}`}
              >
                <Icon className={`h-4.5 w-4.5 ${toneClasses.foreground}`} />
              </div>
              <div className="text-xl font-bold leading-tight text-foreground">
                {kpi.value}
              </div>
              <div className="mt-1 text-xs font-medium text-foreground-secondary">
                {kpi.label}
              </div>
              <div className="mt-1 text-[11px] text-muted">{kpi.hint}</div>
            </Card>
          );
        })}
      </section>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Plus className="h-4 w-4 text-accent" />
              Account intake
              <Badge variant="info">Demo only</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              {isIntakeOpen
                ? "Enter approved business context, then generate a new brief."
                : "Collapsed to keep account intelligence and GTM actions in focus."}
            </p>
            {!isIntakeOpen && formMessage && (
              <p className="mt-1 text-xs font-medium text-success" aria-live="polite">
                {formMessage}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsIntakeOpen((open) => !open)}
            aria-expanded={isIntakeOpen}
          >
            {isIntakeOpen ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Collapse intake
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add target account
              </>
            )}
          </Button>
        </div>
      </Card>

      <section
        className={
          isIntakeOpen
            ? "grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"
            : "grid gap-5"
        }
      >
        {isIntakeOpen && (
          <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-accent" />
                  Account intake
                </CardTitle>
                <CardDescription className="mt-1">
                  Create a safe, in-memory account record and generate its first
                  brief.
                </CardDescription>
              </div>
              <Badge variant="info">Demo only</Badge>
            </div>
          </CardHeader>
          <CardContent className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company Name" required>
                <input
                  className="growth-input"
                  value={form.companyName}
                  onChange={(event) =>
                    setField("companyName", event.target.value)
                  }
                  placeholder="Industrial company"
                />
              </Field>
              <Field label="Website">
                <input
                  className="growth-input"
                  type="url"
                  value={form.website}
                  onChange={(event) => setField("website", event.target.value)}
                  placeholder="https://example.com"
                />
              </Field>
              <Field label="Industry">
                <input
                  className="growth-input"
                  value={form.industry}
                  onChange={(event) => setField("industry", event.target.value)}
                />
              </Field>
              <Field label="Location">
                <input
                  className="growth-input"
                  value={form.location}
                  onChange={(event) => setField("location", event.target.value)}
                  placeholder="City, Country"
                />
              </Field>
              <Field label="Segment">
                <select
                  className="growth-input"
                  value={form.segment}
                  onChange={(event) => setField("segment", event.target.value)}
                >
                  <option>Mid-market manufacturer</option>
                  <option>Industrial OEM</option>
                  <option>Large enterprise</option>
                  <option>Growth-stage company</option>
                  <option>Professional services</option>
                </select>
              </Field>
              <Field label="Target Product / Service">
                <input
                  className="growth-input"
                  value={form.targetProductService}
                  onChange={(event) =>
                    setField("targetProductService", event.target.value)
                  }
                />
              </Field>
              <Field label="Target Persona">
                <select
                  className="growth-input"
                  value={form.targetPersona}
                  onChange={(event) =>
                    setField("targetPersona", event.target.value)
                  }
                >
                  <option>CEO / MD</option>
                  <option>Founder</option>
                  <option>COO</option>
                  <option>Sales Head</option>
                  <option>Proposal Head</option>
                  <option>HR / TA</option>
                </select>
              </Field>
              <Field label="Contact Name">
                <input
                  className="growth-input"
                  value={form.contactName}
                  onChange={(event) =>
                    setField("contactName", event.target.value)
                  }
                />
              </Field>
              <Field label="Contact Role">
                <input
                  className="growth-input"
                  value={form.contactRole}
                  onChange={(event) =>
                    setField("contactRole", event.target.value)
                  }
                />
              </Field>
              <Field label="LinkedIn URL">
                <input
                  className="growth-input"
                  type="url"
                  value={form.linkedInUrl}
                  onChange={(event) =>
                    setField("linkedInUrl", event.target.value)
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                className="growth-input min-h-24 py-2.5"
                value={form.notes}
                onChange={(event) => setField("notes", event.target.value)}
                placeholder="Approved account context, current priorities, and known signals"
              />
            </Field>
            <div className="rounded-lg border border-warning/25 bg-warning-muted px-3 py-2.5 text-xs leading-relaxed text-foreground-secondary">
              <strong className="text-warning">Data warning:</strong> Do not
              enter personal, sensitive, or confidential information unless
              approved for use in this workspace.
            </div>
            <Field label="Mode">
              <div className="grid grid-cols-2 gap-2">
                {(["rightsense", "customer"] as GrowthMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setField("mode", mode)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      form.mode === mode
                        ? "border-accent bg-accent-muted text-accent"
                        : "border-border bg-white text-foreground-secondary hover:bg-surface-hover"
                    }`}
                  >
                    {mode === "rightsense" ? "RightSense" : "Customer"}
                  </button>
                ))}
              </div>
            </Field>
            {formMessage && (
              <div
                className="text-sm text-foreground-secondary"
                aria-live="polite"
              >
                {formMessage}
              </div>
            )}
            <Button type="button" onClick={createAccount} className="w-full">
              <Sparkles className="h-4 w-4" />
              Generate Growth Intelligence Brief
            </Button>
          </CardContent>
          </Card>
        )}

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-accent" />
                    Active account
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Switch between seeded records to review deterministic output.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={regenerateSelectedAccount}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="mt-5">
              <div className="relative">
                <select
                  value={selectedAccount.id}
                  onChange={(event) => setSelectedId(event.target.value)}
                  className="growth-input appearance-none pr-10 font-medium"
                  aria-label="Select active account"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.companyName} · {account.targetProductService}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{selectedAccount.segment}</Badge>
                <Badge variant="outline">{selectedAccount.industry}</Badge>
                <Badge variant="info">{selectedAccount.targetPersona}</Badge>
                <Badge
                  variant={
                    selectedAccount.mode === "rightsense" ? "success" : "outline"
                  }
                >
                  {selectedAccount.mode === "rightsense"
                    ? "RightSense mode"
                    : "Customer mode"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-accent" />
                Account Intelligence Brief
              </CardTitle>
              <CardDescription>
                Hypotheses generated from the approved account fields above.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-5 grid gap-4 md:grid-cols-2">
              <IntelligenceItem
                label="Company Summary"
                value={selectedAccount.intelligence.companySummary}
              />
              <IntelligenceItem
                label="Likely Business Model"
                value={selectedAccount.intelligence.likelyBusinessModel}
              />
              <IntelligenceList
                label="Business Priorities"
                values={selectedAccount.intelligence.businessPriorities}
              />
              <IntelligenceList
                label="Pain Signals"
                values={selectedAccount.intelligence.painSignals}
              />
              <IntelligenceItem
                label="Buying Trigger Hypothesis"
                value={selectedAccount.intelligence.buyingTriggerHypothesis}
              />
              <IntelligenceItem
                label="Best Persona to Approach"
                value={selectedAccount.intelligence.bestPersonaToApproach}
              />
              <IntelligenceItem
                label="Conversation Angle"
                value={selectedAccount.intelligence.conversationAngle}
              />
              <IntelligenceItem
                label="Recommended Next Action"
                value={selectedAccount.intelligence.recommendedNextAction}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        className={
          selectedAccount.mode === "rightsense"
            ? "grid gap-5 xl:grid-cols-2"
            : "grid gap-5"
        }
      >
        <ScoreCard
          title="Generic Fit Scores"
          description="Portable account scoring for any customer workspace."
          scores={selectedAccount.fitScores}
        />
        {selectedAccount.mode === "rightsense" &&
        selectedAccount.rightSenseFitScores && (
          <RightSenseScoreCard scores={selectedAccount.rightSenseFitScores} />
        )}
      </section>

      <section>
        <SectionHeading
          icon={MessageSquareText}
          title="Outreach Studio"
          description="Human-approved draft cards. Approval changes review state only and never sends a message."
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["cxoEmail", "CXO Email"],
              ["functionalLeaderEmail", "Functional Leader Email"],
              ["linkedInNote", "LinkedIn Note"],
              ["whatsappMessage", "WhatsApp Message"],
              ["followUpMessage", "Follow-up Message"],
              ["discoveryCallBrief", "Discovery Call Brief"],
            ] as [DraftKey, string][]
          ).map(([key, title]) => {
            const approved = selectedApprovedDrafts.includes(key);
            return (
              <Card key={key} className="flex min-h-72 flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <Badge variant={approved ? "success" : "warning"}>
                      {approved ? "Approved" : "Review required"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="mt-4 flex flex-1 flex-col">
                  <div className="flex-1 whitespace-pre-line rounded-lg border border-border-subtle bg-background-alt p-3 text-sm leading-relaxed text-foreground-secondary">
                    {selectedAccount.outreachDrafts[key]}
                  </div>
                  <Button
                    type="button"
                    variant={approved ? "outline" : "default"}
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => toggleDraftApproval(key)}
                  >
                    {approved ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Approved for manual use
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Mark human-approved
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeading
          icon={Activity}
          title="Pipeline Tracker"
          description="In-memory GTM status tracking. Outreach Sent is a manually recorded outcome, not an action in PulseIQ."
        />
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-sm">
              <thead className="bg-background-alt">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  {[
                    "Company",
                    "Segment",
                    "Persona",
                    "Product / Service",
                    "Fit Score",
                    "Status",
                    "Next Action",
                    "Outcome",
                  ].map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className={`align-top ${
                      account.id === selectedAccount.id ? "bg-accent-muted" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-left font-medium text-foreground hover:text-accent"
                        onClick={() => setSelectedId(account.id)}
                      >
                        {account.companyName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground-secondary">
                      {account.segment}
                    </td>
                    <td className="px-4 py-3 text-foreground-secondary">
                      {account.targetPersona}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {account.targetProductService}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={getCompositeFitScore(account.fitScores)} />
                    </td>
                    <td className="px-4 py-3">
                      <PipelineStatusBadge status={account.outcome.status} />
                    </td>
                    <td className="max-w-56 px-4 py-3 text-foreground-secondary">
                      {account.outcome.nextAction}
                    </td>
                    <td className="max-w-56 px-4 py-3 text-foreground-secondary">
                      {account.outcome.outcome}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Learning Engine — based on captured GTM outcomes and scoring
                  patterns
                </CardTitle>
                <CardDescription className="mt-1">
                  Phase 1 placeholder using deterministic demo outcomes only.
                </CardDescription>
              </div>
              <Badge variant="info">82% confidence</Badge>
            </div>
          </CardHeader>
          <CardContent className="mt-5 grid gap-3 sm:grid-cols-2">
            <LearningMetric label="Best Performing Segment" value={learning.segment} />
            <LearningMetric label="Best Persona" value={learning.persona} />
            <LearningMetric label="Best Pain Angle" value={learning.pain} />
            <LearningMetric label="Best Channel" value={learning.channel} />
            <LearningMetric
              label="Recommended Next Campaign"
              value={learning.campaign}
            />
            <LearningMetric label="Confidence Score" value={learning.confidence} />
          </CardContent>
        </Card>

        <Card id="security-governance" className="ring-1 ring-success/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              Security & Governance
            </CardTitle>
            <CardDescription>
              Product controls applied to this Phase 1 workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-5 space-y-3">
            {[
              ["Human-approved outreach", "Enabled", true],
              ["Tenant-scoped records", "Enabled", true],
              ["Audit logging", "Enabled", true],
              ["Sensitive data minimization", "Enabled", true],
              ["Automatic outbound sending", "Disabled", true],
              ["Cross-customer data sharing", "Disabled", true],
              ["Learning source", "Aggregated GTM outcomes only", true],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between gap-4 border-b border-border-subtle pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm text-foreground-secondary">{label}</span>
                <span className="inline-flex items-center gap-1.5 text-right text-sm font-medium text-success">
                  <BadgeCheck className="h-4 w-4 shrink-0" />
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <SectionHeading
          icon={History}
          title="Recent Audit Events"
          description="Safe, tenant-scoped activity summaries without prompts, secrets, or internal payloads."
        />
        <Card className="mt-4">
          <div className="divide-y divide-border-subtle">
            {auditLogs.map((event) => {
              const account = accounts.find(
                (item) => item.id === event.accountId,
              );
              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-muted">
                      <History className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {event.event}
                        {account ? ` · ${account.companyName}` : ""}
                      </div>
                      <div className="mt-0.5 text-xs text-muted">
                        {event.summary}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(event.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <div className="rounded-xl border border-border bg-white px-4 py-3 text-xs leading-relaxed text-muted">
        <SendHorizontal className="mr-2 inline h-3.5 w-3.5 text-muted" />
        This Phase 1 module prepares and records GTM work only. It contains no
        email, LinkedIn, WhatsApp, or other outbound sending capability.
      </div>

      <style jsx>{`
        :global(.growth-input) {
          width: 100%;
          min-height: 40px;
          padding-left: 12px;
          padding-right: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--foreground);
          font-size: 14px;
          transition:
            border-color 0.15s,
            box-shadow 0.15s;
        }
        :global(.growth-input:focus) {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-muted);
        }
        :global(.growth-input::placeholder) {
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}

function SafetyNote({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info-muted px-4 py-3 text-sm text-foreground-secondary">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-info" />
      <span>{text}</span>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </span>
      {children}
    </label>
  );
}

function IntelligenceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background-alt p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
        {value}
      </p>
    </div>
  );
}

function IntelligenceList({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background-alt p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-2 space-y-2">
        {values.map((value) => (
          <div
            key={value}
            className="flex items-start gap-2 text-sm leading-relaxed text-foreground-secondary"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({
  title,
  description,
  scores,
}: {
  title: string;
  description: string;
  scores: GrowthFitScores;
}) {
  const rows = [
    ["Product Fit", scores.productFit],
    ["Urgency Fit", scores.urgencyFit],
    ["Persona Fit", scores.personaFit],
    ["Revenue Potential", scores.revenuePotential],
    ["Conversion Probability", scores.conversionProbability],
    ["Strategic Fit", scores.strategicFit],
  ] as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-accent" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-5 grid gap-4 sm:grid-cols-2">
        {rows.map(([label, score]) => (
          <ScoreRow key={label} label={label} score={score} />
        ))}
      </CardContent>
    </Card>
  );
}

function RightSenseScoreCard({ scores }: { scores: RightSenseFitScores }) {
  const rows = [
    ["PulseIQ", scores.pulseIQ],
    ["WinsProposal", scores.winsProposal],
    ["TalentPulse", scores.talentPulse],
    ["RightSense Consulting", scores.rightSenseConsulting],
  ] as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          RightSense Internal Fit Scores
        </CardTitle>
        <CardDescription>
          Visible only for RightSense mode accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-5 grid gap-4 sm:grid-cols-2">
        {rows.map(([label, score]) => (
          <ScoreRow key={label} label={label} score={score} />
        ))}
      </CardContent>
    </Card>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  const tone =
    score >= 80 ? "bg-success" : score >= 65 ? "bg-accent" : "bg-warning";
  return (
    <div className="rounded-xl border border-border-subtle bg-background-alt p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-lg font-bold text-foreground">{score}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-border-subtle">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <Badge
      variant={score >= 80 ? "success" : score >= 65 ? "default" : "warning"}
    >
      {score}
    </Badge>
  );
}

function PipelineStatusBadge({ status }: { status: GrowthPipelineStatus }) {
  const variant =
    status === "Pilot / Deal Won"
      ? "success"
      : status === "Nurture / Lost"
        ? "outline"
        : ["Replied", "Discovery Scheduled", "Demo Completed"].includes(status)
          ? "info"
          : ["Proposal Shared", "Outreach Drafted"].includes(status)
            ? "warning"
            : "default";

  return <Badge variant={variant}>{status}</Badge>;
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Icon className="h-5 w-5 text-accent" />
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

function LearningMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background-alt p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function getToneClasses(tone: string): {
  background: string;
  foreground: string;
} {
  if (tone === "success") {
    return { background: "bg-success-muted", foreground: "text-success" };
  }
  if (tone === "info") {
    return { background: "bg-info-muted", foreground: "text-info" };
  }
  if (tone === "warning") {
    return { background: "bg-warning-muted", foreground: "text-warning" };
  }
  return { background: "bg-accent-muted", foreground: "text-accent" };
}
