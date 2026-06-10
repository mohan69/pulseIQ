import {
  generateGrowthIntelligence,
} from "@/lib/growth-intelligence/generator";
import type {
  GrowthAccount,
  GrowthAccountInput,
  GrowthAuditLog,
  GrowthPipelineStatus,
} from "@/lib/growth-intelligence/types";

export const DEMO_GROWTH_ORG_ID = "demo-rightsense-org";
export const DEMO_GROWTH_USER_ID = "demo-admin-user";

const CREATED_AT = "2026-06-02T09:30:00.000Z";

type SeedAccount = GrowthAccountInput & {
  id: string;
  status: GrowthPipelineStatus;
  nextAction: string;
  outcome: string;
};

const seedInputs: SeedAccount[] = [
  {
    id: "growth-bharat-heavy-fabrications",
    companyName: "Bharat Heavy Fabrications Pvt Ltd",
    website: "https://example.com/bharat-heavy-fabrications",
    industry: "Heavy Fabrication",
    location: "Pune, India",
    segment: "Mid-market manufacturer",
    targetProductService: "PulseIQ",
    targetPersona: "CEO / MD",
    contactName: "Arun Mehta",
    contactRole: "Managing Director",
    linkedInUrl: "https://linkedin.com/in/demo-arun-mehta",
    notes: "Manufacturing, fabrication, ERP, MIS, margin and execution visibility.",
    mode: "rightsense",
    status: "Discovery Scheduled",
    nextAction: "Confirm discovery agenda with the MD",
    outcome: "Positive response to margin visibility angle",
  },
  {
    id: "growth-microfinish-valves",
    companyName: "Microfinish Valves",
    website: "https://example.com/microfinish-valves",
    industry: "Industrial Valves",
    location: "Hubballi, India",
    segment: "Industrial OEM",
    targetProductService: "WinsProposal",
    targetPersona: "Proposal Head",
    contactName: "Neha Kulkarni",
    contactRole: "Head of Proposals",
    linkedInUrl: "https://linkedin.com/in/demo-neha-kulkarni",
    notes: "Valve RFQ, tender, proposal, drawing and compliance workflow.",
    mode: "rightsense",
    status: "Proposal Shared",
    nextAction: "Review pilot scope and success measures",
    outcome: "Pilot proposal under evaluation",
  },
  {
    id: "growth-generic-epc",
    companyName: "Generic EPC Projects Company",
    website: "https://example.com/generic-epc",
    industry: "EPC Projects",
    location: "Ahmedabad, India",
    segment: "Large enterprise",
    targetProductService: "WinsProposal",
    targetPersona: "Sales Head",
    contactName: "Rohit Shah",
    contactRole: "Sales Head",
    linkedInUrl: "https://linkedin.com/in/demo-rohit-shah",
    notes: "EPC tender pipeline with bid readiness and compliance needs.",
    mode: "rightsense",
    status: "Outreach Drafted",
    nextAction: "Approve the functional leader email",
    outcome: "Awaiting human outreach approval",
  },
  {
    id: "growth-pump-oem",
    companyName: "Pump OEM",
    website: "https://example.com/pump-oem",
    industry: "Pump Manufacturing",
    location: "Coimbatore, India",
    segment: "Industrial OEM",
    targetProductService: "PulseIQ",
    targetPersona: "COO",
    contactName: "Vikram Rao",
    contactRole: "Chief Operating Officer",
    linkedInUrl: "https://linkedin.com/in/demo-vikram-rao",
    notes: "Manufacturing productivity, execution, ERP and margin improvement.",
    mode: "rightsense",
    status: "Demo Completed",
    nextAction: "Share quantified productivity hypothesis",
    outcome: "Operations team requested a value case",
  },
  {
    id: "growth-industrial-automation",
    companyName: "Industrial Automation Company",
    website: "https://example.com/industrial-automation",
    industry: "Industrial Automation",
    location: "Bengaluru, India",
    segment: "Growth-stage company",
    targetProductService: "Growth advisory",
    targetPersona: "Founder",
    contactName: "Sanjay Iyer",
    contactRole: "Founder & CEO",
    linkedInUrl: "https://linkedin.com/in/demo-sanjay-iyer",
    notes: "Revenue growth, sales visibility and strategic account execution.",
    mode: "customer",
    status: "Researched",
    nextAction: "Validate account expansion priorities",
    outcome: "Research brief ready",
  },
  {
    id: "growth-fabrication-company",
    companyName: "Fabrication Company",
    website: "https://example.com/fabrication-company",
    industry: "Metal Fabrication",
    location: "Nashik, India",
    segment: "Mid-market manufacturer",
    targetProductService: "PulseIQ",
    targetPersona: "COO",
    contactName: "Priya Deshmukh",
    contactRole: "Operations Director",
    linkedInUrl: "https://linkedin.com/in/demo-priya-deshmukh",
    notes: "Fabrication execution, productivity, MIS and margin leakage.",
    mode: "rightsense",
    status: "Replied",
    nextAction: "Offer two discovery call slots",
    outcome: "Interested in an operating visibility discussion",
  },
  {
    id: "growth-recruitment-services",
    companyName: "Recruitment Services Company",
    website: "https://example.com/recruitment-services",
    industry: "Recruitment Services",
    location: "Mumbai, India",
    segment: "Professional services",
    targetProductService: "TalentPulse",
    targetPersona: "HR / TA",
    contactName: "Meera Nair",
    contactRole: "Talent Acquisition Head",
    linkedInUrl: "https://linkedin.com/in/demo-meera-nair",
    notes: "Recruitment, hiring, talent productivity and HR visibility.",
    mode: "rightsense",
    status: "Pilot / Deal Won",
    nextAction: "Capture pilot outcomes for learning",
    outcome: "Hiring productivity pilot approved",
  },
  {
    id: "growth-general-manufacturing",
    companyName: "General Manufacturing Company",
    website: "https://example.com/general-manufacturing",
    industry: "General Manufacturing",
    location: "Chennai, India",
    segment: "Mid-market manufacturer",
    targetProductService: "RightSense Consulting",
    targetPersona: "CEO / MD",
    contactName: "Karthik Menon",
    contactRole: "Chief Executive Officer",
    linkedInUrl: "https://linkedin.com/in/demo-karthik-menon",
    notes: "Manufacturing growth, margin, productivity and management visibility.",
    mode: "rightsense",
    status: "Target Identified",
    nextAction: "Review intelligence and select an outreach angle",
    outcome: "New target account",
  },
];

export const demoGrowthAccounts: GrowthAccount[] = seedInputs.map(
  (input, index) => {
    const generated = generateGrowthIntelligence(input);
    const updatedAt = `2026-06-${String(index + 2).padStart(2, "0")}T11:00:00.000Z`;
    return {
      ...input,
      ...generated,
      orgId: DEMO_GROWTH_ORG_ID,
      createdBy: DEMO_GROWTH_USER_ID,
      createdAt: CREATED_AT,
      updatedAt,
      outcome: {
        status: input.status,
        nextAction: input.nextAction,
        outcome: input.outcome,
        updatedAt,
      },
    };
  },
);

export const demoGrowthAuditLogs: GrowthAuditLog[] = [
  {
    id: "audit-growth-004",
    orgId: DEMO_GROWTH_ORG_ID,
    createdBy: DEMO_GROWTH_USER_ID,
    createdAt: "2026-06-10T08:45:00.000Z",
    updatedAt: "2026-06-10T08:45:00.000Z",
    accountId: "growth-general-manufacturing",
    event: "Account created",
    summary: "General Manufacturing Company added to the tenant account list.",
  },
  {
    id: "audit-growth-003",
    orgId: DEMO_GROWTH_ORG_ID,
    createdBy: DEMO_GROWTH_USER_ID,
    createdAt: "2026-06-10T08:46:00.000Z",
    updatedAt: "2026-06-10T08:46:00.000Z",
    accountId: "growth-general-manufacturing",
    event: "Intelligence generated",
    summary: "Deterministic account brief and fit scores generated.",
  },
  {
    id: "audit-growth-002",
    orgId: DEMO_GROWTH_ORG_ID,
    createdBy: DEMO_GROWTH_USER_ID,
    createdAt: "2026-06-10T08:47:00.000Z",
    updatedAt: "2026-06-10T08:47:00.000Z",
    accountId: "growth-generic-epc",
    event: "Outreach drafted",
    summary: "Review-only outreach drafts prepared; no message was sent.",
  },
  {
    id: "audit-growth-001",
    orgId: DEMO_GROWTH_ORG_ID,
    createdBy: DEMO_GROWTH_USER_ID,
    createdAt: "2026-06-10T08:48:00.000Z",
    updatedAt: "2026-06-10T08:48:00.000Z",
    accountId: "growth-recruitment-services",
    event: "Outcome updated",
    summary: "Pipeline outcome updated to Pilot / Deal Won.",
  },
];

export function getDemoGrowthAccounts(orgId: string): GrowthAccount[] {
  return demoGrowthAccounts.filter((account) => account.orgId === orgId);
}

export function getDemoGrowthAuditLogs(orgId: string): GrowthAuditLog[] {
  return demoGrowthAuditLogs.filter((event) => event.orgId === orgId);
}

