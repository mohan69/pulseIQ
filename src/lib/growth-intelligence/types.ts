export type GrowthMode = "rightsense" | "customer";

export type GrowthPipelineStatus =
  | "Target Identified"
  | "Diagnostic Angle Researched"
  | "Diagnostic Draft Prepared"
  | "Human Outreach Approved"
  | "Discovery Scheduled"
  | "Diagnostic Completed"
  | "Product Route Recommended"
  | "Pilot Proposed"
  | "Pilot / Deal Won"
  | "Nurture / Lost";

export type GrowthFinancialState =
  | "Financials found"
  | "Financial range only"
  | "Financials not found"
  | "Entity ambiguity detected"
  | "Requires internal validation";

export type GrowthEntityMatchStatus =
  | "Confirmed"
  | "Probable"
  | "Unconfirmed"
  | "Ambiguous";

export type GrowthFinancialSignals = {
  state: GrowthFinancialState;
  revenue: string;
  sourceName: string;
  sourceUrl: string;
  financialYear: string;
  confidence: GrowthContactConfidence;
  entityMatchStatus: GrowthEntityMatchStatus;
  validationNote: string;
  guidance: string[];
};

export type GrowthPublicContextProfile = {
  website: string;
  industry: string;
  location: string;
  employeeSignal: string;
  employeeSource: string;
  certifications: string[];
  certificationSource: string;
  certificationValidationNote: string;
  recommendedInternalDataRequest: string[];
};

export type GrowthAccountIntelligence = {
  companySummary: string;
  likelyBusinessModel: string;
  businessPriorities: string[];
  painSignals: string[];
  diagnosticEntryAngle: string;
  likelyReadinessGaps: string[];
  bestDiagnosticPillar: string;
  recommendedProductRouteAfterDiagnostic: string;
  buyingTriggerHypothesis: string;
  bestPersonaToApproach: string;
  conversationAngle: string;
  recommendedNextAction: string;
  financialSignals: GrowthFinancialSignals;
  publicContextProfile?: GrowthPublicContextProfile;
};

export type GrowthFitScores = {
  diagnosticFit: number;
  complianceStandardsSignal: number;
  vendorSupplierReadinessSignal: number;
  aiGovernanceSignal: number;
  productRouteFit: number;
  commercialReadiness: number;
};

export type RightSenseFitScores = {
  pulseIQ: number;
  winsProposal: number;
  talentPulse: number;
  rightSenseConsulting: number;
};

export type GrowthOutreachDrafts = {
  cxoEmail: string;
  functionalLeaderEmail: string;
  linkedInNote: string;
  whatsappMessage: string;
  followUpMessage: string;
  discoveryCallBrief: string;
};

export type GrowthDraftType =
  | "cxoEmail"
  | "functionalLeaderEmail"
  | "linkedInNote"
  | "whatsappMessage"
  | "followUpMessage";

export type GrowthApprovalStatus =
  | "Draft"
  | "Needs Review"
  | "Approved"
  | "Sent Manually"
  | "Replied"
  | "Nurture";

export type GrowthReplyClassification =
  | "Interested"
  | "Ask later"
  | "Wrong person"
  | "Referral provided"
  | "Needs more information"
  | "Not interested"
  | "Meeting requested";

export type GrowthContactRoleCategory =
  | "CXO"
  | "Sales Head"
  | "Proposal Head"
  | "Operations"
  | "Quality/Compliance"
  | "HR/Talent"
  | "Other";

export type GrowthContactConfidence = "High" | "Medium" | "Low";

export type GrowthContactSourceType =
  | "website"
  | "LinkedIn"
  | "public directory"
  | "existing relationship"
  | "manual input"
  | "unknown";

export type GrowthContactCandidate = {
  id: string;
  name: string;
  title: string;
  roleCategory: GrowthContactRoleCategory;
  email: string;
  phone: string;
  linkedInUrl: string;
  sourceUrl: string;
  sourceType: GrowthContactSourceType;
  confidence: GrowthContactConfidence;
  verificationNote: string;
  lastCheckedDate: string;
  allowedToContact: boolean;
  doNotContact: boolean;
};

export type GrowthResearchVerificationStatus =
  | "Draft"
  | "Needs Manual Verification"
  | "Verified";

export type GrowthPublicSignalCategory =
  | "Proposal / RFP complexity"
  | "Operating visibility"
  | "Margin / productivity leakage"
  | "Compliance and standards readiness"
  | "ISO readiness"
  | "Technical standards mapping"
  | "Statutory document readiness"
  | "Vendor registration readiness"
  | "Supplier qualification"
  | "Subcontractor governance"
  | "Customer prequalification readiness"
  | "AI governance and output validation"
  | "Talent / delivery capacity";

export type GrowthPublicSignal = {
  category: GrowthPublicSignalCategory;
  hypothesis: string;
  sourceNote: string;
};

export type GrowthResearchInput = {
  companyName: string;
  website: string;
  industry: string;
  segment: string;
  location: string;
  targetProductRoutePreference:
    | "PulseIQ"
    | "WinsProposal"
    | "TalentPulse"
    | "RightSense Consulting"
    | "Unknown";
  knownRelationshipNote: string;
  publicSourceNotes: string;
  targetRole:
    | "CEO / MD"
    | "COO"
    | "CFO"
    | "CIO"
    | "Sales Head"
    | "Proposal Head"
    | "Quality"
    | "Compliance"
    | "HR"
    | "Other";
};

export type GrowthResearchResult = {
  companyName: string;
  website: string;
  industry: string;
  location: string;
  segment: string;
  sizeBand: string;
  productsOrServices: string[];
  financialSignals: GrowthFinancialSignals;
  publicContextProfile?: GrowthPublicContextProfile;
  likelyBusinessModel: string;
  publicSignals: GrowthPublicSignal[];
  likelyReadinessGaps: string[];
  diagnosticEntryAngle: string;
  bestDiagnosticPillar: string;
  recommendedProductRouteAfterDiagnostic: string;
  confidence: GrowthContactConfidence;
  sourceNotes: string[];
  evidenceNeeded: string[];
  verificationStatus: GrowthResearchVerificationStatus;
  contactCandidates: GrowthContactCandidate[];
  providerMessage: string;
};

export type GrowthEmailTrackingStatus =
  | "Not Ready"
  | "Approved"
  | "Sent by Email"
  | "Sent Manually"
  | "Bounced"
  | "Replied"
  | "Follow-up Due";

export type GrowthEmailTracking = {
  status: GrowthEmailTrackingStatus;
  sentAt?: string;
  recipient?: string;
  subject?: string;
  providerMessageId?: string;
  threadId?: string;
  followUpDueAt?: string;
  replyClassification?: GrowthReplyClassification;
  replySummary?: string;
};

export type GrowthControlDraftState = {
  status: GrowthApprovalStatus;
  updatedAt: string;
  replyClassification?: GrowthReplyClassification;
};

export type GrowthControlState = {
  version: 3;
  drafts: Partial<Record<GrowthDraftType, GrowthControlDraftState>>;
  contacts: GrowthContactCandidate[];
  preferredContactId?: string;
  emailTracking?: GrowthEmailTracking;
  research?: GrowthResearchResult;
};

export type GrowthApprovalQueueItem = {
  id: string;
  accountId: string;
  draftType: GrowthDraftType;
  draftLabel: string;
  targetAccount: string;
  contactRole: string;
  diagnosticAngle: string;
  messagePreview: string;
  riskFlags: string[];
  status: GrowthApprovalStatus;
  replyClassification?: GrowthReplyClassification;
};

export type GrowthFollowUpPlan = {
  suggestedFollowUpDate: string;
  followUpReason: string;
  draftFollowUpMessage: string;
  previousTouchSummary: string;
  humanApprovalRequired: true;
};

export type GrowthDiscoveryBrief = {
  recommendedOpening: string;
  discoveryQuestions: string[];
  likelyReadinessGaps: string[];
  diagnosticPillarFocus: string;
  likelyProductRouteAfterDiagnostic: string;
  objectionsToExpect: string[];
  pilotSuccessCriteria: string[];
};

export type GrowthControlMetrics = {
  accountsByDiagnosticFit: { high: number; medium: number; developing: number };
  draftsPrepared: number;
  approvedDrafts: number;
  manualSendsLogged: number;
  repliesLogged: number;
  discoveryCallsScheduled: number;
  bestDiagnosticAngle: string;
  bestSegment: string;
  bestProductRoute: string;
};

export type GrowthRiskStatus = "Pass" | "Needs Review" | "Blocked";

export type GrowthRiskAssessment = {
  status: GrowthRiskStatus;
  flags: string[];
};

export type GrowthEmailExecutionPack = {
  subjectLineOption1: string;
  subjectLineOption2: string;
  selectedSubject: string;
  emailBody: string;
  shortFollowUpEmail: string;
  linkedInNote: string;
  whatsappMessage: string;
  callOpener: string;
  discoveryQuestions: string[];
};

export type GrowthDiagnosticSampleFinding = {
  finding: string;
  whyItMatters: string;
  evidenceNeeded: string;
  likelyDiagnosticPillar: string;
  recommendedNextStep: string;
};

export type GrowthDiagnosticSampleOutput = {
  title: "Sample 48-Hour Diagnostic Output";
  findings: GrowthDiagnosticSampleFinding[];
};

export type GrowthCollateralReference = {
  title: string;
  description: string;
  intendedAudience: string;
  status: "Draft needed" | "Ready";
  suggestedLink: string;
};

export type GrowthExecutionPack = {
  accountProfile: {
    companyName: string;
    industry: string;
    location: string;
    segment: string;
    diagnosticAngle: string;
    recommendedProductRouteAfterDiagnostic: string;
  };
  contacts: GrowthContactCandidate[];
  preferredContact?: GrowthContactCandidate;
  email: GrowthEmailExecutionPack;
  diagnosticSample: GrowthDiagnosticSampleOutput;
  collateral: GrowthCollateralReference[];
  risk: GrowthRiskAssessment;
  tracking: GrowthEmailTracking;
  followUp: GrowthFollowUpPlan;
};

export type GrowthOutcome = {
  status: GrowthPipelineStatus;
  nextAction: string;
  outcome: string;
  updatedAt: string;
};

export type GrowthAccount = {
  id: string;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  companyName: string;
  website: string;
  industry: string;
  location: string;
  segment: string;
  targetProductService: string;
  targetPersona: string;
  contactName: string;
  contactRole: string;
  linkedInUrl: string;
  notes: string;
  mode: GrowthMode;
  intelligence: GrowthAccountIntelligence;
  fitScores: GrowthFitScores;
  rightSenseFitScores?: RightSenseFitScores;
  outreachDrafts: GrowthOutreachDrafts;
  controlState: GrowthControlState;
  outcome: GrowthOutcome;
};

export type GrowthAuditLog = {
  id: string;
  orgId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  event:
    | "ACCOUNT_CREATED"
    | "ACCOUNT_UPDATED"
    | "INTELLIGENCE_GENERATED"
    | "OUTREACH_DRAFTED"
    | "OUTREACH_APPROVED"
    | "CONTACT_UPDATED"
    | "EMAIL_SEND_ATTEMPTED"
    | "EMAIL_SENT"
    | "MANUAL_SEND_LOGGED"
    | "REPLY_CLASSIFIED"
    | "OUTCOME_UPDATED";
  summary: string;
};

export type GrowthLearningInsight = {
  bestPerformingSegment: string;
  bestPersona: string;
  bestPainAngle: string;
  bestChannel: string;
  highestConvertingOffer: string;
  weakSegment: string;
  recommendedNextCampaign: string;
  recommendedMessageChange: string;
  confidenceScore: number;
};

export type GrowthWorkspaceSnapshot = {
  accounts: GrowthAccount[];
  auditLogs: GrowthAuditLog[];
  learning: GrowthLearningInsight;
};

export type GrowthAccountInput = Pick<
  GrowthAccount,
  | "companyName"
  | "website"
  | "industry"
  | "location"
  | "segment"
  | "targetProductService"
  | "targetPersona"
  | "contactName"
  | "contactRole"
  | "linkedInUrl"
  | "notes"
  | "mode"
>;
