"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  Gauge,
  History,
  Lightbulb,
  Link2,
  Mail,
  MessageSquareText,
  Phone,
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
  getCompositeFitScore,
} from "@/lib/growth-intelligence/generator";
import {
  createGrowthAccountAction,
  regenerateGrowthAccountAction,
  sendApprovedGrowthEmailAction,
  updateGrowthControlDraftAction,
  updateGrowthContactAction,
  updateGrowthEmailTrackingAction,
  updateGrowthOutcomeAction,
  updateGrowthStatusAction,
} from "@/app/app/growth-intelligence/actions";
import {
  approvalStatusFor,
  buildApprovalQueue,
  buildDiscoveryBrief,
  buildFollowUpPlan,
  buildGrowthExecutionPack,
  calculateControlMetrics,
  recommendedDraftType,
} from "@/lib/growth-intelligence/control-center";
import type {
  GrowthAccount,
  GrowthAccountInput,
  GrowthApprovalStatus,
  GrowthAuditLog,
  GrowthContactCandidate,
  GrowthDraftType,
  GrowthFitScores,
  GrowthLearningInsight,
  GrowthMode,
  GrowthPipelineStatus,
  RightSenseFitScores,
  GrowthWorkspaceSnapshot,
} from "@/lib/growth-intelligence/types";

const PIPELINE_STATUSES: GrowthPipelineStatus[] = [
  "Target Identified",
  "Diagnostic Angle Researched",
  "Diagnostic Draft Prepared",
  "Human Outreach Approved",
  "Discovery Scheduled",
  "Diagnostic Completed",
  "Product Route Recommended",
  "Pilot Proposed",
  "Pilot / Deal Won",
  "Nurture / Lost",
];

const EMPTY_FORM: GrowthAccountInput = {
  companyName: "",
  website: "",
  industry: "Industrial Manufacturing",
  location: "",
  segment: "Mid-market manufacturer",
  targetProductService: "RightSense Consulting",
  targetPersona: "CEO / MD",
  contactName: "",
  contactRole: "",
  linkedInUrl: "",
  notes: "",
  mode: "rightsense",
};

type DraftKey =
  | GrowthDraftType
  | "discoveryCallBrief";

type Props = {
  initialAccounts: GrowthAccount[];
  initialAuditLogs: GrowthAuditLog[];
  initialLearning: GrowthLearningInsight;
  persistenceAvailable: boolean;
  persistenceMessage: string;
};

export function GrowthIntelligenceWorkspace({
  initialAccounts,
  initialAuditLogs,
  initialLearning,
  persistenceAvailable,
  persistenceMessage,
}: Props) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedId, setSelectedId] = useState(
    initialAccounts.find((account) => account.id === "growth-microfinish-valves")
      ?.id ?? initialAccounts[0]?.id,
  );
  const [form, setForm] = useState<GrowthAccountInput>(EMPTY_FORM);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [learning, setLearning] = useState(initialLearning);
  const [formMessage, setFormMessage] = useState("");
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [outcomeDrafts, setOutcomeDrafts] = useState<
    Record<string, { nextAction: string; outcome: string }>
  >({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [contactDrafts, setContactDrafts] = useState<
    Record<string, GrowthContactCandidate>
  >({});

  const selectedAccount =
    accounts.find((account) => account.id === selectedId) ?? accounts[0];
  const approvalQueue = useMemo(() => buildApprovalQueue(accounts), [accounts]);
  const controlMetrics = useMemo(
    () => calculateControlMetrics(accounts),
    [accounts],
  );
  const followUpPlan = selectedAccount
    ? buildFollowUpPlan(selectedAccount)
    : undefined;
  const discoveryBrief = selectedAccount
    ? buildDiscoveryBrief(selectedAccount)
    : undefined;
  const executionPack = selectedAccount
    ? buildGrowthExecutionPack(selectedAccount)
    : undefined;
  const contactDraft =
    selectedAccount && executionPack?.preferredContact
      ? contactDrafts[selectedAccount.id] ?? executionPack.preferredContact
      : undefined;
  const executionDraftType = selectedAccount
    ? recommendedDraftType(selectedAccount)
    : undefined;
  const executionApprovalStatus =
    selectedAccount && executionDraftType
      ? approvalStatusFor(selectedAccount, executionDraftType)
      : "Draft";
  const outcomeDraft = selectedAccount
    ? outcomeDrafts[selectedAccount.id] ?? {
        nextAction: selectedAccount.outcome.nextAction,
        outcome: selectedAccount.outcome.outcome,
      }
    : { nextAction: "", outcome: "" };

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
        "Human Outreach Approved",
        "Discovery Scheduled",
        "Diagnostic Completed",
        "Product Route Recommended",
        "Pilot Proposed",
        "Pilot / Deal Won",
      ].includes(account.outcome.status),
    ).length;
    const proposals = accounts.filter((account) =>
      ["Product Route Recommended", "Pilot Proposed", "Pilot / Deal Won"].includes(
        account.outcome.status,
      ),
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
        label: "High Diagnostic Fit",
        value: highFit.toString(),
        hint: "Composite score 75+",
        icon: TrendingUp,
        tone: "success",
      },
      {
        label: "Diagnostic Drafts",
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
        label: "Routes / Pilots",
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

  const applySnapshot = (snapshot: GrowthWorkspaceSnapshot) => {
    setAccounts(snapshot.accounts);
    setAuditLogs(snapshot.auditLogs);
    setLearning(snapshot.learning);
  };

  const createAccount = async () => {
    if (!form.companyName.trim()) {
      setFormMessage("Company Name is required.");
      return;
    }
    setIsSaving(true);
    const result = await createGrowthAccountAction(form);
    setIsSaving(false);
    setFormMessage(result.message);
    if (!result.ok) return;
    applySnapshot(result.snapshot);
    setSelectedId(result.snapshot.accounts[0]?.id);
    setForm(EMPTY_FORM);
    setIsIntakeOpen(false);
  };

  const regenerateSelectedAccount = async () => {
    if (!selectedAccount) return;
    setIsSaving(true);
    const result = await regenerateGrowthAccountAction(selectedAccount.id);
    setIsSaving(false);
    setFormMessage(result.message);
    if (result.ok) applySnapshot(result.snapshot);
  };

  const updatePipelineStatus = async (
    accountId: string,
    status: GrowthPipelineStatus,
  ) => {
    setIsSaving(true);
    const result = await updateGrowthStatusAction(accountId, status);
    setIsSaving(false);
    setFormMessage(result.message);
    if (result.ok) applySnapshot(result.snapshot);
  };

  const saveOutcome = async () => {
    if (!selectedAccount) return;
    setIsSaving(true);
    const result = await updateGrowthOutcomeAction(selectedAccount.id, {
      status: selectedAccount.outcome.status,
      nextAction: outcomeDraft.nextAction,
      outcome: outcomeDraft.outcome,
    });
    setIsSaving(false);
    setFormMessage(result.message);
    if (result.ok) {
      applySnapshot(result.snapshot);
      setOutcomeDrafts((current) => {
        const next = { ...current };
        delete next[selectedAccount.id];
        return next;
      });
    }
  };

  const updateControlDraft = async (
    accountId: string,
    draftType: GrowthDraftType,
    status: GrowthApprovalStatus,
    replyText?: string,
  ) => {
    setIsSaving(true);
    const result = await updateGrowthControlDraftAction(accountId, {
      draftType,
      status,
      replyText,
    });
    setIsSaving(false);
    setFormMessage(result.message);
    if (result.ok) {
      applySnapshot(result.snapshot);
      if (status === "Replied") {
        setReplyDrafts((current) => ({ ...current, [accountId]: "" }));
      }
    }
  };

  const saveContact = async () => {
    if (!selectedAccount || !contactDraft) return;
    setIsSaving(true);
    const result = await updateGrowthContactAction(
      selectedAccount.id,
      contactDraft,
      true,
    );
    setIsSaving(false);
    setFormMessage(result.message);
    if (result.ok) {
      applySnapshot(result.snapshot);
      setContactDrafts((current) => {
        const next = { ...current };
        delete next[selectedAccount.id];
        return next;
      });
    }
  };

  const attemptApprovedEmailSend = async () => {
    if (!selectedAccount) return;
    setIsSaving(true);
    const result = await sendApprovedGrowthEmailAction(selectedAccount.id);
    setIsSaving(false);
    setFormMessage(result.message);
  };

  const updateEmailTracking = async (status: "Bounced" | "Follow-up Due") => {
    if (!selectedAccount) return;
    setIsSaving(true);
    const result = await updateGrowthEmailTrackingAction(
      selectedAccount.id,
      status,
    );
    setIsSaving(false);
    setFormMessage(result.message);
    if (result.ok) applySnapshot(result.snapshot);
  };

  if (!selectedAccount) {
    return <Card className="text-sm text-muted">No demo accounts available.</Card>;
  }

  return (
    <div className="growth-intelligence-workspace space-y-8">
      <section className="overflow-hidden rounded-2xl bg-hero-bg text-white shadow-lg">
        <div className="relative px-6 py-7 md:px-8 md:py-9 hero-grid">
          <div className="absolute inset-0 hero-glow" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Diagnostic-led growth workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Diagnostic-Led GTM Control Center
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
                Convert public business signals into a RightSense 48-Hour
                Diagnostic entry angle, readiness hypotheses, human-reviewed
                outreach, and a likely post-diagnostic product route. PulseIQ
                powers the intelligence engine; RightSense owns and delivers
                the diagnostic.
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
              <div className="mt-2 flex items-center gap-1.5 text-xs text-white/80">
                <BadgeCheck className="h-3.5 w-3.5 text-cyan" />
                {persistenceAvailable
                  ? "Persistent workspace enabled"
                  : "Read-only fallback mode"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {!persistenceAvailable && (
        <div
          className="rounded-xl border border-warning/30 bg-warning-muted px-4 py-3 text-sm text-foreground-secondary"
          role="status"
        >
          {persistenceMessage}
        </div>
      )}

      <section className="grid gap-3 lg:grid-cols-3">
        <SafetyNote
          icon={ClipboardCheck}
          text="Outreach drafts are generated for review and approval. The system does not send messages automatically."
        />
        <SafetyNote
          icon={BrainCircuit}
          text="Learning insights use aggregated GTM outcomes and scoring patterns only, without private account notes."
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
              <Badge variant="info">Persistent</Badge>
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
                  Create a tenant-scoped account record and generate its first
                  persisted brief.
                </CardDescription>
              </div>
              <Badge variant="info">Persistent</Badge>
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
              <Field label="Likely Product Route After Diagnostic">
                <select
                  className="growth-input"
                  value={form.targetProductService}
                  onChange={(event) =>
                    setField("targetProductService", event.target.value)
                  }
                >
                  <option>PulseIQ</option>
                  <option>WinsProposal</option>
                  <option>TalentPulse</option>
                  <option>RightSense Consulting</option>
                </select>
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
            <Button
              type="button"
              onClick={createAccount}
              className="w-full"
              disabled={!persistenceAvailable || isSaving}
            >
              <Sparkles className="h-4 w-4" />
              Generate Diagnostic Account Brief
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
                  disabled={!persistenceAvailable || isSaving}
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
                Diagnostic Account Brief
              </CardTitle>
              <CardDescription>
                Public-context hypotheses for a readiness diagnostic. No
                confidential data access is assumed.
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
                label="Diagnostic Entry Angle"
                value={selectedAccount.intelligence.diagnosticEntryAngle}
              />
              <IntelligenceList
                label="Likely Readiness Gaps"
                values={selectedAccount.intelligence.likelyReadinessGaps}
              />
              <IntelligenceItem
                label="Best Diagnostic Pillar"
                value={selectedAccount.intelligence.bestDiagnosticPillar}
              />
              <IntelligenceItem
                label="Recommended Product Route After Diagnostic"
                value={
                  selectedAccount.intelligence
                    .recommendedProductRouteAfterDiagnostic
                }
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
          title="Diagnostic Fit & Readiness Signals"
          description="Internal prioritization signals based only on supplied public or approved context."
          scores={selectedAccount.fitScores}
        />
        {selectedAccount.mode === "rightsense" &&
        selectedAccount.rightSenseFitScores && (
          <RightSenseScoreCard scores={selectedAccount.rightSenseFitScores} />
        )}
      </section>

      {executionPack && contactDraft && executionDraftType && (
        <>
          <section>
            <SectionHeading
              icon={BriefcaseBusiness}
              title="GTM Execution Pack"
              description="Everything needed to prepare, approve, send through a configured provider, or log manual outreach for the selected account."
            />
            <Card className="mt-4">
              <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                <IntelligenceItem
                  label="Account Profile"
                  value={`${executionPack.accountProfile.companyName} · ${executionPack.accountProfile.industry} · ${executionPack.accountProfile.segment} · ${executionPack.accountProfile.location}`}
                />
                <IntelligenceItem
                  label="Diagnostic Angle"
                  value={executionPack.accountProfile.diagnosticAngle}
                />
                <IntelligenceItem
                  label="Recommended Product Route"
                  value={
                    executionPack.accountProfile
                      .recommendedProductRouteAfterDiagnostic
                  }
                />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRoundCheck className="h-4 w-4 text-accent" />
                  Contact Intelligence
                </CardTitle>
                <CardDescription>
                  Supplied contact context is not treated as verified. Unknown
                  email and phone fields remain explicitly empty.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      className="growth-input"
                      value={contactDraft.name}
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            name: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Title">
                    <input
                      className="growth-input"
                      value={contactDraft.title}
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            title: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Role Category">
                    <select
                      className="growth-input"
                      value={contactDraft.roleCategory}
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            roleCategory: event.target
                              .value as GrowthContactCandidate["roleCategory"],
                          },
                        }))
                      }
                    >
                      {[
                        "CXO",
                        "Sales Head",
                        "Proposal Head",
                        "Operations",
                        "Quality/Compliance",
                        "HR/Talent",
                        "Other",
                      ].map((role) => (
                        <option key={role}>{role}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Confidence">
                    <select
                      className="growth-input"
                      value={contactDraft.confidence}
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            confidence: event.target
                              .value as GrowthContactCandidate["confidence"],
                          },
                        }))
                      }
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </Field>
                  <Field label="Email">
                    <input
                      className="growth-input"
                      type="email"
                      value={contactDraft.email}
                      placeholder="Not found / needs manual verification"
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            email: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      className="growth-input"
                      value={contactDraft.phone}
                      placeholder="Not found / needs manual verification"
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            phone: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="LinkedIn URL">
                    <input
                      className="growth-input"
                      type="url"
                      value={contactDraft.linkedInUrl}
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            linkedInUrl: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Source URL">
                    <input
                      className="growth-input"
                      type="url"
                      value={contactDraft.sourceUrl}
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            sourceUrl: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Last Checked Date">
                    <input
                      className="growth-input"
                      type="date"
                      value={contactDraft.lastCheckedDate}
                      onChange={(event) =>
                        setContactDrafts((current) => ({
                          ...current,
                          [selectedAccount.id]: {
                            ...contactDraft,
                            lastCheckedDate: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                </div>
                <Field label="Verification Note">
                  <textarea
                    className="growth-input min-h-20 py-2"
                    value={contactDraft.verificationNote}
                    onChange={(event) =>
                      setContactDrafts((current) => ({
                        ...current,
                        [selectedAccount.id]: {
                          ...contactDraft,
                          verificationNote: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
                <label className="flex items-start gap-3 rounded-lg border border-border-subtle bg-background-alt p-3 text-sm text-foreground-secondary">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={contactDraft.allowedToContact}
                    onChange={(event) =>
                      setContactDrafts((current) => ({
                        ...current,
                        [selectedAccount.id]: {
                          ...contactDraft,
                          allowedToContact: event.target.checked,
                        },
                      }))
                    }
                  />
                  <span>
                    Allowed to contact after manual verification. This does not
                    approve or send an email.
                  </span>
                </label>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveContact}
                  disabled={!persistenceAvailable || isSaving}
                >
                  Save verified contact
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-accent" />
                      Email Execution Pack
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Diagnostic-led copy with explicit approval and execution
                      gates.
                    </CardDescription>
                  </div>
                  <ApprovalStatusBadge status={executionApprovalStatus} />
                </div>
              </CardHeader>
              <CardContent className="mt-5 space-y-4">
                <IntelligenceItem
                  label="Subject Option 1"
                  value={executionPack.email.subjectLineOption1}
                />
                <IntelligenceItem
                  label="Subject Option 2"
                  value={executionPack.email.subjectLineOption2}
                />
                <IntelligenceItem
                  label="Selected Subject"
                  value={executionPack.email.selectedSubject}
                />
                <ExecutionMessage
                  label="Email Body"
                  value={executionPack.email.emailBody}
                />
                <ExecutionMessage
                  label="Short Follow-up Email"
                  value={executionPack.email.shortFollowUpEmail}
                />
                <ExecutionMessage
                  label="LinkedIn Note"
                  value={executionPack.email.linkedInNote}
                />
                <ExecutionMessage
                  label="WhatsApp-style Message"
                  value={executionPack.email.whatsappMessage}
                />
                <ExecutionMessage
                  label="30-Second Call Opener"
                  value={executionPack.email.callOpener}
                />
                <IntelligenceList
                  label="Discovery Questions"
                  values={executionPack.email.discoveryQuestions}
                />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sample 48-Hour Diagnostic Output</CardTitle>
                <CardDescription>
                  Illustrative hypotheses only. Each finding requires approved
                  evidence before it can be treated as factual.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-5 space-y-4">
                {executionPack.diagnosticSample.findings.map(
                  (finding, index) => (
                    <div
                      key={finding.finding}
                      className="rounded-xl border border-border-subtle bg-background-alt p-4"
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                        Critical finding hypothesis {index + 1}
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {finding.finding}
                      </p>
                      <div className="mt-3 space-y-2 text-xs leading-relaxed text-foreground-secondary">
                        <p>
                          <strong>Why it matters:</strong>{" "}
                          {finding.whyItMatters}
                        </p>
                        <p>
                          <strong>Evidence needed:</strong>{" "}
                          {finding.evidenceNeeded}
                        </p>
                        <p>
                          <strong>Likely pillar:</strong>{" "}
                          {finding.likelyDiagnosticPillar}
                        </p>
                        <p>
                          <strong>Recommended next step:</strong>{" "}
                          {finding.recommendedNextStep}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-accent" />
                  Collateral Pack
                </CardTitle>
                <CardDescription>
                  Metadata references only; no binary deck files were created.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-5 space-y-3">
                {executionPack.collateral.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border-subtle bg-background-alt p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">
                          {item.title}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          {item.description}
                        </p>
                      </div>
                      <Badge
                        variant={item.status === "Ready" ? "success" : "warning"}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-foreground-secondary">
                      Intended audience: {item.intendedAudience}
                    </p>
                    <a
                      href={item.suggestedLink}
                      target={item.suggestedLink.startsWith("http") ? "_blank" : undefined}
                      rel={
                        item.suggestedLink.startsWith("http")
                          ? "noreferrer"
                          : undefined
                      }
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <Link2 className="h-3 w-3" />
                      {item.suggestedLink}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <SendHorizontal className="h-4 w-4 text-accent" />
                      Send & Track
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Provider sending is unavailable until a supported email
                      integration is configured.
                    </CardDescription>
                  </div>
                  <RiskStatusBadge status={executionPack.risk.status} />
                </div>
              </CardHeader>
              <CardContent className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <ContactDatum
                    icon={Mail}
                    label="Recipient"
                    value={
                      executionPack.preferredContact?.email ||
                      "Not found / needs manual verification"
                    }
                  />
                  <ContactDatum
                    icon={Phone}
                    label="Phone"
                    value={
                      executionPack.preferredContact?.phone ||
                      "Not found / needs manual verification"
                    }
                  />
                  <ContactDatum
                    icon={Link2}
                    label="LinkedIn"
                    value={
                      executionPack.preferredContact?.linkedInUrl ||
                      "Not found / needs manual verification"
                    }
                  />
                </div>
                <div className="rounded-xl border border-border-subtle bg-background-alt p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Safety checks
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {executionPack.risk.flags.map((flag) => (
                      <Badge
                        key={flag}
                        variant={
                          executionPack.risk.status === "Pass"
                            ? "success"
                            : "warning"
                        }
                      >
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(executionApprovalStatus === "Draft" ||
                    executionApprovalStatus === "Needs Review") && (
                    <Button
                      type="button"
                      disabled={!persistenceAvailable || isSaving}
                      onClick={() =>
                        updateControlDraft(
                          selectedAccount.id,
                          executionDraftType,
                          "Approved",
                        )
                      }
                    >
                      Approve execution email
                    </Button>
                  )}
                  <Button
                    type="button"
                    disabled={
                      !persistenceAvailable ||
                      isSaving ||
                      executionApprovalStatus !== "Approved" ||
                      executionPack.risk.status !== "Pass" ||
                      !executionPack.preferredContact?.email ||
                      !executionPack.preferredContact.allowedToContact
                    }
                    onClick={attemptApprovedEmailSend}
                  >
                    <Mail className="h-4 w-4" />
                    Send approved email
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      !persistenceAvailable ||
                      isSaving ||
                      executionApprovalStatus !== "Approved"
                    }
                    onClick={() =>
                      updateControlDraft(
                        selectedAccount.id,
                        executionDraftType,
                        "Sent Manually",
                      )
                    }
                  >
                    Mark as sent manually
                  </Button>
                  {[
                    "Sent by Email",
                    "Sent Manually",
                    "Follow-up Due",
                  ].includes(executionPack.tracking.status) && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!persistenceAvailable || isSaving}
                        onClick={() => updateEmailTracking("Follow-up Due")}
                      >
                        Mark follow-up due
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!persistenceAvailable || isSaving}
                        onClick={() => updateEmailTracking("Bounced")}
                      >
                        Mark bounced
                      </Button>
                    </>
                  )}
                </div>
                <div className="rounded-lg border border-info/20 bg-info-muted px-3 py-2 text-xs text-foreground-secondary">
                  Email sending not configured. No SMTP credentials or secrets
                  are stored in this application.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-accent" />
                  Follow-up Timeline
                </CardTitle>
                <CardDescription>
                  Execution and diagnostic progress recorded for this account.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-5 space-y-3">
                <TimelineItem
                  label="Approval"
                  value={executionApprovalStatus}
                />
                <TimelineItem
                  label="Send status"
                  value={executionPack.tracking.status}
                />
                <TimelineItem
                  label="Sent timestamp"
                  value={executionPack.tracking.sentAt ?? "Not sent"}
                />
                <TimelineItem
                  label="Follow-up due"
                  value={
                    executionPack.tracking.followUpDueAt ??
                    executionPack.followUp.suggestedFollowUpDate
                  }
                />
                <TimelineItem
                  label="Reply classification"
                  value={
                    executionPack.tracking.replyClassification ??
                    "No reply logged"
                  }
                />
                <TimelineItem
                  label="Pipeline tracking"
                  value={selectedAccount.outcome.status}
                />
                <TimelineItem
                  label="Diagnostic proposed"
                  value={
                    [
                      "Human Outreach Approved",
                      "Discovery Scheduled",
                      "Diagnostic Completed",
                      "Product Route Recommended",
                      "Pilot Proposed",
                      "Pilot / Deal Won",
                    ].includes(selectedAccount.outcome.status)
                      ? "Logged"
                      : "Not yet logged"
                  }
                />
                <TimelineItem
                  label="Next action"
                  value={selectedAccount.outcome.nextAction}
                />
              </CardContent>
            </Card>
          </section>
        </>
      )}

      <section>
        <SectionHeading
          icon={BarChart3}
          title="GTM Control Center"
          description="Review-first operating metrics derived from tenant-scoped account, queue, and outcome state."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ControlMetric
            label="Accounts by Diagnostic Fit"
            value={`${controlMetrics.accountsByDiagnosticFit.high} high · ${controlMetrics.accountsByDiagnosticFit.medium} medium · ${controlMetrics.accountsByDiagnosticFit.developing} developing`}
          />
          <ControlMetric
            label="Drafts Prepared"
            value={String(controlMetrics.draftsPrepared)}
          />
          <ControlMetric
            label="Approved Drafts"
            value={String(controlMetrics.approvedDrafts)}
          />
          <ControlMetric
            label="Manual Sends Logged"
            value={String(controlMetrics.manualSendsLogged)}
          />
          <ControlMetric
            label="Replies Logged"
            value={String(controlMetrics.repliesLogged)}
          />
          <ControlMetric
            label="Discovery Calls Scheduled"
            value={String(controlMetrics.discoveryCallsScheduled)}
          />
          <ControlMetric
            label="Best Diagnostic Angle"
            value={controlMetrics.bestDiagnosticAngle}
          />
          <ControlMetric
            label="Best Segment"
            value={controlMetrics.bestSegment}
          />
          <ControlMetric
            label="Best Product Route"
            value={controlMetrics.bestProductRoute}
          />
        </div>
      </section>

      <section>
        <SectionHeading
          icon={ClipboardCheck}
          title="Outreach Approval Queue"
          description="Approve preparation, log external manual sends, and classify replies. PulseIQ never transmits a message."
        />
        <div className="mt-4 space-y-3">
          {approvalQueue.map((item) => {
            const replyText = replyDrafts[item.accountId] ?? "";
            return (
              <Card key={item.id} className="p-4">
                <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.draftLabel}</Badge>
                      <ApprovalStatusBadge status={item.status} />
                      {item.replyClassification && (
                        <Badge variant="info">{item.replyClassification}</Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      className="mt-3 text-left font-semibold text-foreground hover:text-accent"
                      onClick={() => setSelectedId(item.accountId)}
                    >
                      {item.targetAccount}
                    </button>
                    <p className="mt-1 text-xs text-muted">{item.contactRole}</p>
                    <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
                      {item.diagnosticAngle}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.riskFlags.map((flag) => (
                        <Badge key={flag} variant="warning">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-52 overflow-auto whitespace-pre-line rounded-lg border border-border-subtle bg-background-alt p-3 text-xs leading-relaxed text-foreground-secondary">
                    {item.messagePreview}
                  </div>
                  <div className="flex min-w-48 flex-col gap-2">
                    {(item.status === "Draft" ||
                      item.status === "Needs Review") && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={!persistenceAvailable || isSaving}
                        onClick={() =>
                          updateControlDraft(
                            item.accountId,
                            item.draftType,
                            "Approved",
                          )
                        }
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Approve for manual use
                      </Button>
                    )}
                    {item.status === "Approved" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!persistenceAvailable || isSaving}
                        onClick={() =>
                          updateControlDraft(
                            item.accountId,
                            item.draftType,
                            "Sent Manually",
                          )
                        }
                      >
                        <Check className="h-3.5 w-3.5" />
                        Log manual send
                      </Button>
                    )}
                    {item.status === "Sent Manually" && (
                      <>
                        <textarea
                          className="growth-input min-h-24 py-2"
                          value={replyText}
                          maxLength={2000}
                          placeholder="Paste a reply for classification. It is not included in audit summaries."
                          onChange={(event) =>
                            setReplyDrafts((current) => ({
                              ...current,
                              [item.accountId]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            !persistenceAvailable ||
                            isSaving ||
                            !replyText.trim()
                          }
                          onClick={() =>
                            updateControlDraft(
                              item.accountId,
                              item.draftType,
                              "Replied",
                              replyText,
                            )
                          }
                        >
                          Classify reply
                        </Button>
                      </>
                    )}
                    {item.status !== "Nurture" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={!persistenceAvailable || isSaving}
                        onClick={() =>
                          updateControlDraft(
                            item.accountId,
                            item.draftType,
                            "Nurture",
                          )
                        }
                      >
                        Move to nurture
                      </Button>
                    )}
                    <p className="text-[11px] leading-relaxed text-muted">
                      Human approval is required. This control records workflow
                      state only.
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {followUpPlan && discoveryBrief && (
        <section className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-accent" />
                Follow-up Planner
              </CardTitle>
              <CardDescription>
                Suggested preparation for {selectedAccount.companyName}. No
                follow-up is sent automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-5 space-y-4">
              <IntelligenceItem
                label="Suggested Follow-up Date"
                value={followUpPlan.suggestedFollowUpDate}
              />
              <IntelligenceItem
                label="Follow-up Reason"
                value={followUpPlan.followUpReason}
              />
              <IntelligenceItem
                label="Previous Touch Summary"
                value={followUpPlan.previousTouchSummary}
              />
              <div className="whitespace-pre-line rounded-xl border border-border-subtle bg-background-alt p-4 text-sm leading-relaxed text-foreground-secondary">
                {followUpPlan.draftFollowUpMessage}
              </div>
              <Badge variant="warning">Human approval required</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-accent" />
                Discovery Brief Generator
              </CardTitle>
              <CardDescription>
                Structured diagnostic preparation based on public or approved
                account context.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-5 space-y-4">
              <IntelligenceItem
                label="Recommended Opening"
                value={discoveryBrief.recommendedOpening}
              />
              <IntelligenceList
                label="5 Discovery Questions"
                values={discoveryBrief.discoveryQuestions}
              />
              <IntelligenceList
                label="Likely Readiness Gaps"
                values={discoveryBrief.likelyReadinessGaps}
              />
              <IntelligenceItem
                label="Diagnostic Pillar Focus"
                value={discoveryBrief.diagnosticPillarFocus}
              />
              <IntelligenceItem
                label="Likely Product Route After Diagnostic"
                value={discoveryBrief.likelyProductRouteAfterDiagnostic}
              />
              <IntelligenceList
                label="Objections to Expect"
                values={discoveryBrief.objectionsToExpect}
              />
              <IntelligenceList
                label="30-Day Pilot Success Criteria"
                values={discoveryBrief.pilotSuccessCriteria}
              />
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <SectionHeading
          icon={MessageSquareText}
          title="Diagnostic Outreach Studio"
          description="Every draft leads with the diagnostic, requires human review, assumes no confidential access, and never sends a message."
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
            const isOutreachDraft = key !== "discoveryCallBrief";
            const status = isOutreachDraft
              ? approvalStatusFor(selectedAccount, key)
              : "Needs Review";
            return (
              <Card key={key} className="flex min-h-72 flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <ApprovalStatusBadge status={status} />
                  </div>
                </CardHeader>
                <CardContent className="mt-4 flex flex-1 flex-col">
                  <div className="flex-1 whitespace-pre-line rounded-lg border border-border-subtle bg-background-alt p-3 text-sm leading-relaxed text-foreground-secondary">
                    {selectedAccount.outreachDrafts[key]}
                  </div>
                  {isOutreachDraft &&
                    (status === "Draft" || status === "Needs Review") && (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-4 w-full"
                        disabled={!persistenceAvailable || isSaving}
                        onClick={() =>
                          updateControlDraft(
                            selectedAccount.id,
                            key,
                            "Approved",
                          )
                        }
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Approve for manual use
                      </Button>
                    )}
                  {isOutreachDraft && status === "Approved" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      disabled={!persistenceAvailable || isSaving}
                      onClick={() =>
                        updateControlDraft(
                          selectedAccount.id,
                          key,
                          "Sent Manually",
                        )
                      }
                    >
                      <Check className="h-3.5 w-3.5" />
                      Log manual send
                    </Button>
                  )}
                  {!isOutreachDraft && (
                    <div className="mt-4 rounded-lg border border-warning/25 bg-warning-muted px-3 py-2 text-xs text-foreground-secondary">
                      Discovery preparation only. Human review is required.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeading
          icon={Activity}
          title="Diagnostic-Led Pipeline Tracker"
          description="Persisted GTM status tracking from target research through diagnostic, product routing, and pilot. No status sends outreach."
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
                    "Likely Product Route",
                    "Diagnostic Fit Score",
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
                      <select
                        className="growth-input min-w-44"
                        value={account.outcome.status}
                        disabled={!persistenceAvailable || isSaving}
                        onChange={(event) =>
                          updatePipelineStatus(
                            account.id,
                            event.target.value as GrowthPipelineStatus,
                          )
                        }
                        aria-label={`Pipeline status for ${account.companyName}`}
                      >
                        {PIPELINE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Update selected outcome</CardTitle>
            <CardDescription>
              Capture safe next steps and results for the learning engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Next Action">
              <input
                className="growth-input"
                value={outcomeDraft.nextAction}
                onChange={(event) =>
                  setOutcomeDrafts((current) => ({
                    ...current,
                    [selectedAccount.id]: {
                      ...outcomeDraft,
                      nextAction: event.target.value,
                    },
                  }))
                }
                maxLength={500}
              />
            </Field>
            <Field label="Outcome">
              <input
                className="growth-input"
                value={outcomeDraft.outcome}
                onChange={(event) =>
                  setOutcomeDrafts((current) => ({
                    ...current,
                    [selectedAccount.id]: {
                      ...outcomeDraft,
                      outcome: event.target.value,
                    },
                  }))
                }
                maxLength={500}
              />
            </Field>
            <div className="flex items-center justify-between gap-3 md:col-span-2">
              <p className="text-xs text-muted">
                Private account notes are never included in aggregated learning
                output.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={saveOutcome}
                disabled={!persistenceAvailable || isSaving}
              >
                Save outcome
              </Button>
            </div>
          </CardContent>
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
                  Aggregated from persisted account outcomes without private
                  notes.
                </CardDescription>
              </div>
              <Badge variant="info">{learning.confidenceScore}% confidence</Badge>
            </div>
          </CardHeader>
          <CardContent className="mt-5 grid gap-3 sm:grid-cols-2">
            <LearningMetric
              label="Best Performing Segment"
              value={learning.bestPerformingSegment}
            />
            <LearningMetric label="Best Persona" value={learning.bestPersona} />
            <LearningMetric
              label="Best Pain Angle"
              value={learning.bestPainAngle}
            />
            <LearningMetric label="Best Channel" value={learning.bestChannel} />
            <LearningMetric
              label="Highest Converting Product Route"
              value={learning.highestConvertingOffer}
            />
            <LearningMetric label="Weak Segment" value={learning.weakSegment} />
            <LearningMetric
              label="Recommended Next Campaign"
              value={learning.recommendedNextCampaign}
            />
            <LearningMetric
              label="Recommended Message Change"
              value={learning.recommendedMessageChange}
            />
            <LearningMetric
              label="Confidence Score"
              value={`${learning.confidenceScore}%`}
            />
          </CardContent>
        </Card>

        <Card id="security-governance" className="ring-1 ring-success/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              Security & Governance
            </CardTitle>
            <CardDescription>
              Diagnostic-led controls applied to this persistent workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-5 space-y-3">
            {[
              ["Human-approved outreach", "Enabled", true],
              ["Approval and manual-send audit events", "Enabled", true],
              ["Tenant-scoped records", "Enabled", true],
              ["Audit logging", "Enabled", true],
              ["Sensitive data minimization", "Enabled", true],
              ["Confidential data access assumed", "No", true],
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
                        {auditEventLabel(event.event)}
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
        This module prepares and records GTM work only. It contains no
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
    ["Diagnostic Fit", scores.diagnosticFit],
    ["Compliance / Standards Signal", scores.complianceStandardsSignal],
    ["Vendor / Supplier Readiness Signal", scores.vendorSupplierReadinessSignal],
    ["AI Governance Signal", scores.aiGovernanceSignal],
    ["Product Route Fit", scores.productRouteFit],
    ["Commercial Readiness", scores.commercialReadiness],
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
          Product Route Fit After Diagnostic
        </CardTitle>
        <CardDescription>
          Internal routing guidance visible only for RightSense mode accounts.
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

function ControlMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
        {value}
      </div>
    </Card>
  );
}

function ExecutionMessage({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background-alt p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground-secondary">
        {value}
      </div>
    </div>
  );
}

function ContactDatum({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background-alt p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="max-w-64 text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function RiskStatusBadge({
  status,
}: {
  status: "Pass" | "Needs Review" | "Blocked";
}) {
  return (
    <Badge
      variant={
        status === "Pass"
          ? "success"
          : status === "Blocked"
            ? "destructive"
            : "warning"
      }
    >
      {status}
    </Badge>
  );
}

function ApprovalStatusBadge({ status }: { status: GrowthApprovalStatus }) {
  const variant =
    status === "Approved" || status === "Replied"
      ? "success"
      : status === "Sent Manually"
        ? "info"
        : status === "Nurture"
          ? "outline"
          : "warning";
  return <Badge variant={variant}>{status}</Badge>;
}

function auditEventLabel(event: GrowthAuditLog["event"]): string {
  return {
    ACCOUNT_CREATED: "Account created",
    ACCOUNT_UPDATED: "Account updated",
    INTELLIGENCE_GENERATED: "Intelligence generated",
    OUTREACH_DRAFTED: "Outreach drafted",
    OUTREACH_APPROVED: "Outreach approved",
    CONTACT_UPDATED: "Contact updated",
    EMAIL_SEND_ATTEMPTED: "Email send attempted",
    EMAIL_SENT: "Email sent",
    MANUAL_SEND_LOGGED: "Manual send logged",
    REPLY_CLASSIFIED: "Reply classified",
    OUTCOME_UPDATED: "Outcome updated",
  }[event];
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
