export const DIAGNOSTIC_POSITIONING =
  "PulseIQ powers the RightSense 48-Hour Enterprise Intelligence, Compliance & Standards Diagnostic.";

export const DIAGNOSTIC_DISCLAIMER =
  "PulseIQ and RightSense identify readiness gaps, workflow risks, documentation gaps, and improvement opportunities. They do not provide ISO certification, legal certification, statutory audit, regulatory approval, or formal customer approval.";

export const DIAGNOSTIC_PILLARS = [
  "Revenue & Proposal Intelligence",
  "Operating Intelligence",
  "Margin & Productivity Leakage",
  "Compliance & Standards Readiness",
  "Vendor / Supplier / Ecosystem Readiness",
  "AI Governance & Trusted Agent Readiness",
] as const;

export const READINESS_AREAS = [
  {
    title: "Compliance & standards readiness",
    items: [
      "ISO 9001, ISO 14001, ISO 45001, ISO/IEC 27001, and ISO/IEC 42001 readiness",
      "ISO 50001 readiness where energy management is relevant",
      "API, ASME, ANSI, IEC, ISA, and customer-specific standards mapping",
      "Statutory document and audit evidence readiness",
    ],
  },
  {
    title: "Vendor & ecosystem readiness",
    items: [
      "Supplier qualification and subcontractor governance",
      "Vendor registration documentation readiness",
      "Customer prequalification readiness",
      "Partner and competitor ecosystem visibility",
    ],
  },
  {
    title: "AI governance readiness",
    items: [
      "Human-in-the-loop validation and AI output review",
      "Source traceability and audit trail coverage",
      "Approval workflows, policy controls, and role-based access",
      "No autonomous irreversible action without approval",
    ],
  },
] as const;

export const TRUTH_CATEGORIES = [
  "Financial truth",
  "Operational truth",
  "Proposal / revenue truth",
  "Compliance and standards truth",
  "Vendor / supplier ecosystem truth",
  "Talent / capacity truth",
  "AI governance truth",
] as const;

