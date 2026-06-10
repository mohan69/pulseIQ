export type GrowthMode = "rightsense" | "customer";

export type GrowthPipelineStatus =
  | "Target Identified"
  | "Researched"
  | "Outreach Drafted"
  | "Outreach Sent"
  | "Replied"
  | "Discovery Scheduled"
  | "Demo Completed"
  | "Proposal Shared"
  | "Pilot / Deal Won"
  | "Nurture / Lost";

export type GrowthAccountIntelligence = {
  companySummary: string;
  likelyBusinessModel: string;
  businessPriorities: string[];
  painSignals: string[];
  buyingTriggerHypothesis: string;
  bestPersonaToApproach: string;
  conversationAngle: string;
  recommendedNextAction: string;
};

export type GrowthFitScores = {
  productFit: number;
  urgencyFit: number;
  personaFit: number;
  revenuePotential: number;
  conversionProbability: number;
  strategicFit: number;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
  accountId: string;
  event:
    | "Account created"
    | "Intelligence generated"
    | "Outreach drafted"
    | "Outcome updated";
  summary: string;
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

