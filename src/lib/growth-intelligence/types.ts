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
