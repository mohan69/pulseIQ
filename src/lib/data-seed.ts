import type { Assessment } from "@/types/assessment";

export const seedAssessments: Assessment[] = [
  {
    id: "bharat-heavy-fabrications",
    status: "complete",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    enterpriseProfile: {
      companyName: "Bharat Heavy Fabrications Pvt Ltd",
      industry: "Industrial Manufacturing",
      revenueRange: "₹500Cr",
      employeeCount: 1200,
      currentSystems: {
        erp: "SAP ERP",
        crm: "None",
        plm: "Legacy MES",
        hrms: "Basic HRMS",
        finance: "Tally",
        projectTools: "Excel",
        spreadsheets: "Extensive Excel tracking",
        other: "Legacy SCADA systems",
      },
      painPoints: [
        "Production scheduling delays of 3-5 days per cycle",
        "Manual material reconciliation causing ₹2-3Cr annual waste",
        "No real-time OEE visibility across 4 production lines",
        "Quality tracking in Excel with 48-hour data lag",
        "Disconnected maintenance scheduling leading to unplanned downtime",
      ],
      strategicPriorities: [
        "Achieve 85%+ OEE across all production lines",
        "Reduce material waste by 20% in 12 months",
        "Real-time production visibility for CXO team",
        "Predictive maintenance to reduce unplanned downtime",
        "Digital quality management system",
      ],
    },
    departments: [
      {
        id: "prod",
        name: "Production",
        headCount: 450,
        processes: [
          {
            id: "prod-1",
            name: "Production Scheduling",
            systemsUsed: ["SAP ERP", "Excel"],
            handoffs: ["Planning → Shop Floor", "Shop Floor → Quality"],
            manualWorkPercent: 70,
            reportingPainPoints: [
              "Manual scheduling takes 2 days",
              "No real-time capacity view",
            ],
            risks: ["Schedule conflicts", "Capacity overestimation"],
            dependencies: ["Material availability", "Machine maintenance"],
          },
          {
            id: "prod-2",
            name: "Quality Inspection",
            systemsUsed: ["Excel", "Manual logs"],
            handoffs: ["Production → QC", "QC → Documentation"],
            manualWorkPercent: 85,
            reportingPainPoints: [
              "48-hour data lag in quality reports",
              "No trend analysis capability",
            ],
            risks: ["Undetected defects", "Compliance gaps"],
            dependencies: ["Inspection equipment calibration"],
          },
        ],
      },
      {
        id: "scm",
        name: "Supply Chain",
        headCount: 120,
        processes: [
          {
            id: "scm-1",
            name: "Material Reconciliation",
            systemsUsed: ["SAP ERP", "Excel"],
            handoffs: ["Procurement → Warehouse", "Warehouse → Production"],
            manualWorkPercent: 80,
            reportingPainPoints: [
              "Manual counting causes discrepancies",
              "No real-time inventory visibility",
            ],
            risks: ["Stockouts", "Excess inventory"],
            dependencies: ["Supplier lead times"],
          },
        ],
      },
      {
        id: "maint",
        name: "Maintenance",
        headCount: 80,
        processes: [
          {
            id: "maint-1",
            name: "Equipment Maintenance",
            systemsUsed: ["Excel", "Paper-based"],
            handoffs: ["Production → Maintenance", "Maintenance → Stores"],
            manualWorkPercent: 90,
            reportingPainPoints: [
              "Reactive maintenance only",
              "No failure prediction",
            ],
            risks: ["Unplanned downtime", "Safety incidents"],
            dependencies: ["Spare parts availability"],
          },
        ],
      },
      {
        id: "fin",
        name: "Finance",
        headCount: 45,
        processes: [
          {
            id: "fin-1",
            name: "Cost Tracking",
            systemsUsed: ["Tally", "Excel"],
            handoffs: ["Production → Finance"],
            manualWorkPercent: 60,
            reportingPainPoints: [
              "Month-end cost reports take 5 days",
              "No real-time cost visibility",
            ],
            risks: ["Cost overruns undetected"],
            dependencies: ["Production data accuracy"],
          },
        ],
      },
    ],
    opportunities: [
      {
        id: "opp-bh-1",
        function: "Production",
        title: "AI-Powered Production Scheduling",
        description:
          "Deploy ML-based scheduling engine that optimizes production sequences based on capacity, material availability, and demand priorities.",
        impactType: "cycle_time",
        priorityTier: "quick_win",
        estimatedImpact: "₹8-12Cr annually through 40% reduction in scheduling cycle time",
        complexity: "medium",
        recommendedOwner: "VP Production",
        whyItMatters:
          "Current 2-day manual scheduling process creates cascading delays. AI scheduling can reduce this to 2 hours with 15% better resource utilization.",
      },
      {
        id: "opp-bh-2",
        function: "Quality",
        title: "Computer Vision Quality Inspection",
        description:
          "Implement AI-powered visual inspection at production line endpoints to detect defects in real-time with 99.5% accuracy.",
        impactType: "cost",
        priorityTier: "strategic",
        estimatedImpact: "₹4-6Cr annually through 60% reduction in defective output",
        complexity: "high",
        recommendedOwner: "Head of Quality",
        whyItMatters:
          "Manual inspection catches only 85% of defects. AI vision can achieve 99.5% detection, preventing costly rework and customer complaints.",
      },
      {
        id: "opp-bh-3",
        function: "Supply Chain",
        title: "Predictive Material Reconciliation",
        description:
          "Automate material tracking and reconciliation using IoT sensors and AI forecasting to eliminate manual counting.",
        impactType: "cost",
        priorityTier: "quick_win",
        estimatedImpact: "₹2-3Cr annually through elimination of material waste and stockouts",
        complexity: "low",
        recommendedOwner: "Head of SCM",
        whyItMatters:
          "Manual reconciliation causes ₹2-3Cr annual waste. Automated tracking provides real-time accuracy.",
      },
      {
        id: "opp-bh-4",
        function: "Maintenance",
        title: "Predictive Maintenance Platform",
        description:
          "Deploy IoT sensors on critical equipment with ML models to predict failures 72 hours in advance.",
        impactType: "productivity",
        priorityTier: "strategic",
        estimatedImpact: "₹5-8Cr annually through 50% reduction in unplanned downtime",
        complexity: "high",
        recommendedOwner: "Head of Maintenance",
        whyItMatters:
          "Unplanned downtime costs ₹10-15Cr annually. Predictive maintenance can prevent 50% of failures.",
      },
      {
        id: "opp-bh-5",
        function: "Finance",
        title: "Real-Time Cost Intelligence",
        description:
          "Implement automated cost tracking and margin analysis with real-time production data integration.",
        impactType: "margin",
        priorityTier: "quick_win",
        estimatedImpact: "₹3-4Cr through 2% margin improvement via better cost visibility",
        complexity: "low",
        recommendedOwner: "CFO",
        whyItMatters:
          "5-day month-end reporting delay prevents timely cost interventions. Real-time visibility enables same-day corrective actions.",
      },
      {
        id: "opp-bh-6",
        function: "Operations",
        title: "CXO Production Dashboard",
        description:
          "Executive dashboard with real-time OEE, production status, and AI-generated insights for leadership decision-making.",
        impactType: "governance",
        priorityTier: "quick_win",
        estimatedImpact: "30% faster executive decision-making",
        complexity: "low",
        recommendedOwner: "COO",
        whyItMatters:
          "Leadership lacks real-time visibility into operations. A unified dashboard enables data-driven decisions.",
      },
      {
        id: "opp-bh-7",
        function: "Production",
        title: "Digital Work Instructions",
        description:
          "Replace paper-based work instructions with AI-guided digital workflows that adapt to operator skill level.",
        impactType: "productivity",
        priorityTier: "strategic",
        estimatedImpact: "15% productivity improvement through standardized processes",
        complexity: "medium",
        recommendedOwner: "VP Production",
        whyItMatters:
          "Inconsistent work practices across shifts cause quality variations. Digital instructions ensure standardization.",
      },
      {
        id: "opp-bh-8",
        function: "Compliance",
        title: "Automated Compliance Reporting",
        description:
          "Generate regulatory and safety compliance reports automatically from production and quality data.",
        impactType: "governance",
        priorityTier: "strategic",
        estimatedImpact: "80% reduction in compliance reporting effort",
        complexity: "medium",
        recommendedOwner: "Head of Compliance",
        whyItMatters:
          "Manual compliance reporting consumes 200+ person-hours quarterly. Automation ensures timely, accurate submissions.",
      },
    ],
    futureModel: [
      {
        departmentId: "prod",
        departmentName: "Production",
        beforeState:
          "Manual scheduling, Excel-based tracking, reactive quality control, 48-hour data lag",
        afterState:
          "AI-optimized scheduling, real-time production tracking, computer vision quality, instant data visibility",
        recommendedAIAgents: [
          "Scheduling Optimizer Agent",
          "Quality Vision Agent",
          "OEE Monitor Agent",
        ],
        workflowAutomations: [
          "Auto-generate daily production schedules",
          "Real-time defect detection and alerts",
          "Automated production reporting",
        ],
        integrationSuggestions: [
          "SAP ERP integration for order data",
          "IoT sensors for machine data",
          "MES for shop floor execution",
        ],
        governanceRecommendations: [
          "Define AI scheduling override protocols",
          "Establish quality AI model retraining schedule",
        ],
      },
      {
        departmentId: "scm",
        departmentName: "Supply Chain",
        beforeState:
          "Manual material reconciliation, Excel-based inventory, reactive procurement",
        afterState:
          "Automated tracking, AI demand forecasting, predictive procurement",
        recommendedAIAgents: [
          "Inventory Intelligence Agent",
          "Demand Forecasting Agent",
        ],
        workflowAutomations: [
          "Auto-reorder based on AI demand signals",
          "Real-time inventory reconciliation",
        ],
        integrationSuggestions: [
          "Supplier portal integration",
          "IoT-based material tracking",
        ],
        governanceRecommendations: [
          "Set AI-driven reorder point thresholds",
          "Define supplier performance scoring criteria",
        ],
      },
    ],
    cockpit: {
      transformationScore: 32,
      opportunityValue: "₹22-33Cr",
      quickWinsCount: 4,
      highComplexityCount: 2,
      processesMapped: 5,
      topBottlenecks: [
        "Production scheduling takes 2 days manually",
        "Quality data lags by 48 hours",
        "Material reconciliation causes ₹2-3Cr waste",
        "Maintenance is purely reactive",
        "Finance reporting delayed by 5 days",
      ],
      executiveActions: [
        "Approve AI scheduling pilot for Line 1",
        "Commission IoT sensors for critical equipment",
        "Mandate digital quality tracking rollout",
        "Allocate budget for predictive maintenance PoC",
        "Establish real-time cost reporting for top 5 product lines",
      ],
      aiAdoptionReadiness: "Medium — Strong IT infrastructure, need change management",
    },
    roadmap: [
      {
        phase: "30_day",
        title: "Discovery & Quick Wins",
        milestones: [
          {
            id: "m1",
            title: "Complete production data audit",
            ownerFunction: "IT + Production",
            expectedOutcome: "Baseline data quality assessment",
            measurableKPI: "Data completeness score > 80%",
          },
          {
            id: "m2",
            title: "Deploy production scheduling AI pilot on Line 1",
            ownerFunction: "Production + IT",
            expectedOutcome: "AI scheduling reduces cycle from 2 days to 4 hours",
            measurableKPI: "Scheduling time < 4 hours",
          },
          {
            id: "m3",
            title: "Implement real-time OEE dashboard",
            ownerFunction: "IT",
            expectedOutcome: "Live visibility into all 4 production lines",
            measurableKPI: "Dashboard adopted by 100% of shift supervisors",
          },
        ],
      },
      {
        phase: "60_day",
        title: "Workflow Implementation",
        milestones: [
          {
            id: "m4",
            title: "Roll out AI scheduling to all 4 lines",
            ownerFunction: "Production",
            expectedOutcome: "Full production scheduling automation",
            measurableKPI: "15% improvement in resource utilization",
          },
          {
            id: "m5",
            title: "Deploy predictive maintenance on critical equipment",
            ownerFunction: "Maintenance + IT",
            expectedOutcome: "Predict failures 72 hours in advance",
            measurableKPI: "30% reduction in unplanned downtime",
          },
          {
            id: "m6",
            title: "Automate material reconciliation",
            ownerFunction: "Supply Chain",
            expectedOutcome: "Real-time inventory accuracy > 98%",
            measurableKPI: "Material waste reduced by 25%",
          },
        ],
      },
      {
        phase: "90_day",
        title: "Scale & Governance",
        milestones: [
          {
            id: "m7",
            title: "Deploy computer vision quality inspection",
            ownerFunction: "Quality + IT",
            expectedOutcome: "Automated defect detection on all lines",
            measurableKPI: "Defect detection rate > 99%",
          },
          {
            id: "m8",
            title: "Implement AI governance framework",
            ownerFunction: "COO + Compliance",
            expectedOutcome: "Documented AI usage policies and monitoring",
            measurableKPI: "100% AI models have retraining schedules",
          },
          {
            id: "m9",
            title: "CXO ROI review and Phase 2 planning",
            ownerFunction: "C-Suite",
            expectedOutcome: "Document business impact and plan next wave",
            measurableKPI: "Demonstrated ROI > 3x investment",
          },
        ],
      },
    ],
  },
  {
    id: "apex-epc-infrastructure",
    status: "complete",
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
    enterpriseProfile: {
      companyName: "Apex EPC Infrastructure Ltd",
      industry: "EPC (Engineering, Procurement, Construction)",
      revenueRange: "₹800Cr",
      employeeCount: 2500,
      currentSystems: {
        erp: "Oracle ERP",
        crm: "None — manual RFP tracking",
        plm: "AutoCAD + Excel",
        hrms: "Basic HRMS",
        finance: "Oracle Finance",
        projectTools: "MS Project",
        spreadsheets: "Heavy Excel usage across departments",
        other: "Manual RFP response process, WhatsApp for vendor communication",
      },
      painPoints: [
        "RFP response cycle takes 3-4 weeks per proposal",
        "Vendor coordination entirely manual via WhatsApp and email",
        "Project cost overruns averaging 12-18%",
        "No centralized project visibility for leadership",
        "Compliance tracking across 15+ ongoing projects is fragmented",
      ],
      strategicPriorities: [
        "Reduce proposal cycle time to under 1 week",
        "Implement project cost controls with real-time visibility",
        "Centralize vendor management and evaluation",
        "Achieve 90%+ project delivery on-time and on-budget",
        "Automate compliance reporting across all projects",
      ],
    },
    departments: [
      {
        id: "bizdev",
        name: "Business Development",
        headCount: 35,
        processes: [
          {
            id: "bizdev-1",
            name: "RFP Response Process",
            systemsUsed: ["Email", "Excel", "Word"],
            handoffs: ["BD → Technical", "Technical → Commercial", "Commercial → Legal"],
            manualWorkPercent: 90,
            reportingPainPoints: [
              "3-4 week proposal cycle",
              "No template reuse across proposals",
            ],
            risks: ["Missed deadlines", "Inconsistent pricing"],
            dependencies: ["Technical team availability", "Legal review"],
          },
        ],
      },
      {
        id: "projects",
        name: "Project Management",
        headCount: 180,
        processes: [
          {
            id: "proj-1",
            name: "Project Cost Control",
            systemsUsed: ["MS Project", "Oracle ERP", "Excel"],
            handoffs: ["Site → PMO", "PMO → Finance"],
            manualWorkPercent: 75,
            reportingPainPoints: [
              "Cost data reconciled monthly",
              "No early warning for overruns",
            ],
            risks: ["Budget overruns", "Schedule delays"],
            dependencies: ["Contractor payments", "Material deliveries"],
          },
        ],
      },
      {
        id: "procurement",
        name: "Procurement",
        headCount: 60,
        processes: [
          {
            id: "proc-1",
            name: "Vendor Management",
            systemsUsed: ["Oracle ERP", "WhatsApp", "Email"],
            handoffs: ["Procurement → Vendor", "Vendor → Quality", "Quality → Stores"],
            manualWorkPercent: 85,
            reportingPainPoints: [
              "No centralized vendor database",
              "Evaluation criteria inconsistent",
            ],
            risks: ["Single vendor dependency", "Quality inconsistencies"],
            dependencies: ["Vendor reliability", "Lead times"],
          },
        ],
      },
    ],
    opportunities: [
      {
        id: "opp-ae-1",
        function: "Business Development",
        title: "AI-Powered RFP Response Generator",
        description:
          "Deploy generative AI to auto-draft RFP responses from historical proposals, technical specifications, and company capabilities.",
        impactType: "cycle_time",
        priorityTier: "quick_win",
        estimatedImpact: "60% reduction in proposal cycle time from 3-4 weeks to 5-7 days",
        complexity: "medium",
        recommendedOwner: "Head of BD",
        whyItMatters:
          "Proposal cycle time directly impacts win rate. Faster responses mean more bid submissions and higher conversion.",
      },
      {
        id: "opp-ae-2",
        function: "Project Management",
        title: "Real-Time Project Cost Intelligence",
        description:
          "Implement AI-driven cost monitoring that predicts overruns 30 days in advance and recommends corrective actions.",
        impactType: "cost",
        priorityTier: "strategic",
        estimatedImpact: "₹40-60Cr through 40% reduction in cost overruns",
        complexity: "high",
        recommendedOwner: "CFO / Head of PMO",
        whyItMatters:
          "12-18% average cost overruns across projects translate to ₹100-140Cr annual impact. Early prediction enables intervention.",
      },
      {
        id: "opp-ae-3",
        function: "Procurement",
        title: "AI Vendor Intelligence Platform",
        description:
          "Centralize vendor data with AI-powered performance scoring, risk assessment, and automated bid comparison.",
        impactType: "cost",
        priorityTier: "quick_win",
        estimatedImpact: "₹15-20Cr through 8% procurement cost savings",
        complexity: "medium",
        recommendedOwner: "Head of Procurement",
        whyItMatters:
          "Fragmented vendor management leads to suboptimal pricing and quality issues. AI scoring ensures data-driven vendor decisions.",
      },
      {
        id: "opp-ae-4",
        function: "Projects",
        title: "Predictive Project Risk Engine",
        description:
          "AI models that analyze project signals to predict schedule delays and cost overruns before they materialize.",
        impactType: "risk",
        priorityTier: "strategic",
        estimatedImpact: "30% reduction in project delivery risks",
        complexity: "high",
        recommendedOwner: "Head of PMO",
        whyItMatters:
          "Proactive risk identification prevents costly reactive measures. Early warning enables preventive action.",
      },
      {
        id: "opp-ae-5",
        function: "Compliance",
        title: "Automated Multi-Project Compliance",
        description:
          "Centralized compliance tracking and automated report generation across all 15+ active projects.",
        impactType: "governance",
        priorityTier: "quick_win",
        estimatedImpact: "70% reduction in compliance reporting effort",
        complexity: "low",
        recommendedOwner: "Compliance Head",
        whyItMatters:
          "Fragmented compliance tracking creates regulatory risk. Centralized automation ensures consistent reporting.",
      },
    ],
    futureModel: [
      {
        departmentId: "bizdev",
        departmentName: "Business Development",
        beforeState:
          "3-4 week manual RFP response, template chaos, no knowledge reuse",
        afterState:
          "5-7 day AI-assisted proposal generation, template intelligence, automatic compliance check",
        recommendedAIAgents: [
          "RFP Response Generator",
          "Proposal Quality Checker",
          "Win Probability Predictor",
        ],
        workflowAutomations: [
          "Auto-draft RFP responses from knowledge base",
          "Automated compliance verification",
          "Historical bid analysis for pricing",
        ],
        integrationSuggestions: [
          "CRM integration for client history",
          "Document management system",
          "Financial systems for pricing data",
        ],
        governanceRecommendations: [
          "Human review required for all AI-drafted proposals",
          "Maintain proposal quality scoring system",
        ],
      },
      {
        departmentId: "projects",
        departmentName: "Project Management",
        beforeState:
          "Monthly cost reconciliation, reactive risk management, fragmented visibility",
        afterState:
          "Real-time cost intelligence, predictive risk alerts, unified project dashboard",
        recommendedAIAgents: [
          "Cost Prediction Agent",
          "Risk Forecast Agent",
          "Schedule Optimizer Agent",
        ],
        workflowAutomations: [
          "Daily automated cost reconciliation",
          "Weekly risk score updates",
          "Automated stakeholder alerts for deviations",
        ],
        integrationSuggestions: [
          "ERP integration for financial data",
          "Site progress tracking systems",
          "Weather and supply chain data feeds",
        ],
        governanceRecommendations: [
          "Define cost variance thresholds for AI alerts",
          "Establish escalation protocols for predicted overruns",
        ],
      },
    ],
    cockpit: {
      transformationScore: 28,
      opportunityValue: "₹55-80Cr",
      quickWinsCount: 3,
      highComplexityCount: 2,
      processesMapped: 3,
      topBottlenecks: [
        "RFP response takes 3-4 weeks",
        "No real-time project cost visibility",
        "Vendor management scattered across WhatsApp and email",
        "Compliance tracking fragmented across 15+ projects",
        "Project risk identified too late for intervention",
      ],
      executiveActions: [
        "Launch AI proposal generator pilot for next 3 RFPs",
        "Mandate project cost dashboard for top 5 projects",
        "Centralize vendor database and evaluation process",
        "Implement automated compliance reporting for all projects",
        "Establish project risk review cadence with AI alerts",
      ],
      aiAdoptionReadiness: "Medium — Strong project culture, need data standardization",
    },
    roadmap: [
      {
        phase: "30_day",
        title: "Discovery & Quick Wins",
        milestones: [
          {
            id: "m1",
            title: "Consolidate historical proposal data",
            ownerFunction: "BD + IT",
            expectedOutcome: "Knowledge base of 50+ past proposals",
            measurableKPI: "Knowledge base populated with 80% of past proposals",
          },
          {
            id: "m2",
            title: "Deploy AI RFP generator pilot",
            ownerFunction: "BD",
            expectedOutcome: "First AI-assisted proposal generated in < 1 week",
            measurableKPI: "Proposal cycle time < 7 days",
          },
          {
            id: "m3",
            title: "Implement project cost dashboard",
            ownerFunction: "PMO + IT",
            expectedOutcome: "Real-time cost tracking for top 5 projects",
            measurableKPI: "Cost dashboard adopted by all project managers",
          },
        ],
      },
      {
        phase: "60_day",
        title: "Workflow Implementation",
        milestones: [
          {
            id: "m4",
            title: "Scale AI proposals to all new RFPs",
            ownerFunction: "BD",
            expectedOutcome: "100% of new proposals use AI assistance",
            measurableKPI: "Average proposal time < 7 days",
          },
          {
            id: "m5",
            title: "Deploy predictive cost engine",
            ownerFunction: "PMO + Finance",
            expectedOutcome: "Cost overrun prediction 30 days in advance",
            measurableKPI: "Prediction accuracy > 85%",
          },
          {
            id: "m6",
            title: "Centralize vendor intelligence",
            ownerFunction: "Procurement",
            expectedOutcome: "All vendors in centralized scoring system",
            measurableKPI: "Vendor database covers 90% of active vendors",
          },
        ],
      },
      {
        phase: "90_day",
        title: "Scale & Governance",
        milestones: [
          {
            id: "m7",
            title: "Full project risk prediction engine",
            ownerFunction: "PMO",
            expectedOutcome: "AI predicts risks across all 15+ projects",
            measurableKPI: "30% reduction in project delivery risks",
          },
          {
            id: "m8",
            title: "Automated compliance for all projects",
            ownerFunction: "Compliance",
            expectedOutcome: "Zero manual compliance reports",
            measurableKPI: "100% compliance reports automated",
          },
          {
            id: "m9",
            title: "Executive ROI review",
            ownerFunction: "C-Suite",
            expectedOutcome: "Demonstrate business impact of AI transformation",
            measurableKPI: "ROI > 4x investment in 12 months",
          },
        ],
      },
    ],
  },
  {
    id: "careeraxis-talent",
    status: "complete",
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
    enterpriseProfile: {
      companyName: "CareerAxis Talent Solutions",
      industry: "Recruitment / Talent Services",
      revenueRange: "₹150Cr",
      employeeCount: 400,
      currentSystems: {
        erp: "None",
        crm: "None — WhatsApp based",
        plm: "N/A",
        hrms: "Basic HRMS",
        finance: "Tally",
        projectTools: "Custom ATS (limited features)",
        spreadsheets: "Extensive Excel trackers for pipeline",
        other: "WhatsApp for candidate communication, email for client updates",
      },
      painPoints: [
        "Recruiter productivity: only 3-4 placements per recruiter per month",
        "Manual placement tracking with Excel — no real-time pipeline visibility",
        "Candidate communication scattered across WhatsApp, email, phone",
        "No automated screening — 80% of resume screening is manual",
        "Client reporting takes 2 days per report — no self-service",
      ],
      strategicPriorities: [
        "Increase recruiter productivity to 6-8 placements per month",
        "Unified candidate and client management platform",
        "AI-powered resume screening and matching",
        "Real-time pipeline visibility for leadership",
        "Automated client reporting and analytics",
      ],
    },
    departments: [
      {
        id: "recruiting",
        name: "Recruiting Operations",
        headCount: 200,
        processes: [
          {
            id: "rec-1",
            name: "Candidate Sourcing & Screening",
            systemsUsed: ["Custom ATS", "LinkedIn", "Excel"],
            handoffs: ["Sourcing → Screening", "Screening → Interview", "Interview → Placement"],
            manualWorkPercent: 80,
            reportingPainPoints: [
              "80% resume screening is manual",
              "No quality-of-hire tracking",
            ],
            risks: ["Missed quality candidates", "Inconsistent screening"],
            dependencies: ["Job board access", "Client requirements"],
          },
        ],
      },
      {
        id: "client-rel",
        name: "Client Relations",
        headCount: 50,
        processes: [
          {
            id: "cr-1",
            name: "Client Reporting",
            systemsUsed: ["Excel", "Email", "WhatsApp"],
            handoffs: ["Recruiting → Client Relations", "Client Relations → Client"],
            manualWorkPercent: 85,
            reportingPainPoints: [
              "2 days to prepare each client report",
              "No real-time pipeline view for clients",
            ],
            risks: ["Client dissatisfaction", "Delayed updates"],
            dependencies: ["Recruiting data accuracy"],
          },
        ],
      },
      {
        id: "operations",
        name: "Operations",
        headCount: 30,
        processes: [
          {
            id: "ops-1",
            name: "Placement Tracking",
            systemsUsed: ["Excel", "ATS (partial)"],
            handoffs: ["Recruiting → Operations", "Operations → Finance"],
            manualWorkPercent: 70,
            reportingPainPoints: [
              "Manual reconciliation of placement data",
              "No real-time revenue tracking",
            ],
            risks: ["Revenue leakage", "Incorrect billing"],
            dependencies: ["Client payment terms"],
          },
        ],
      },
    ],
    opportunities: [
      {
        id: "opp-ct-1",
        function: "Recruiting",
        title: "AI Resume Screening & Matching",
        description:
          "Deploy NLP-powered resume parsing with skill matching algorithms to auto-rank candidates for each role.",
        impactType: "productivity",
        priorityTier: "quick_win",
        estimatedImpact: "100% improvement in screening throughput — from 50 to 100+ resumes per hour",
        complexity: "medium",
        recommendedOwner: "Head of Recruiting",
        whyItMatters:
          "80% manual screening is the biggest productivity bottleneck. AI screening can process 100x more resumes with better quality matching.",
      },
      {
        id: "opp-ct-2",
        function: "Recruiting",
        title: "AI Candidate Engagement Engine",
        description:
          "Automate candidate communication across WhatsApp, email with personalized messaging and status updates.",
        impactType: "productivity",
        priorityTier: "strategic",
        estimatedImpact: "40% improvement in candidate response rates",
        complexity: "medium",
        recommendedOwner: "Head of Recruiting",
        whyItMatters:
          "Scattered communication leads to candidate drop-off. Automated, personalized engagement improves conversion.",
      },
      {
        id: "opp-ct-3",
        function: "Client Relations",
        title: "Automated Client Reporting Portal",
        description:
          "Self-service client portal with real-time pipeline visibility, automated weekly reports, and analytics.",
        impactType: "revenue",
        priorityTier: "quick_win",
        estimatedImpact: "20% improvement in client retention through better transparency",
        complexity: "low",
        recommendedOwner: "Head of Client Relations",
        whyItMatters:
          "2-day report preparation per client is unsustainable. Self-service portal improves client satisfaction and reduces effort.",
      },
      {
        id: "opp-ct-4",
        function: "Operations",
        title: "Intelligent Placement Pipeline",
        description:
          "AI-powered pipeline analytics predicting placement probability and optimizing recruiter allocation.",
        impactType: "revenue",
        priorityTier: "strategic",
        estimatedImpact: "25% improvement in placement rate through better pipeline management",
        complexity: "high",
        recommendedOwner: "COO",
        whyItMatters:
          "Without pipeline intelligence, recruiters focus on wrong opportunities. AI routing improves conversion rates.",
      },
      {
        id: "opp-ct-5",
        function: "Operations",
        title: "Revenue Intelligence & Forecasting",
        description:
          "AI-based revenue forecasting from placement pipeline, client history, and market trends.",
        impactType: "revenue",
        priorityTier: "strategic",
        estimatedImpact: "15% improvement in revenue forecasting accuracy",
        complexity: "medium",
        recommendedOwner: "CFO",
        whyItMatters:
          "Revenue forecasting is currently spreadsheet-based with 30% variance. AI forecasting enables better resource planning.",
      },
    ],
    futureModel: [
      {
        departmentId: "recruiting",
        departmentName: "Recruiting Operations",
        beforeState:
          "80% manual screening, scattered communication, no quality tracking",
        afterState:
          "AI screening, automated engagement, quality-of-hire analytics",
        recommendedAIAgents: [
          "Resume Screening Agent",
          "Candidate Engagement Agent",
          "Skill Matching Agent",
        ],
        workflowAutomations: [
          "Auto-screen and rank resumes on submission",
          "Automated candidate status updates",
          "Interview scheduling optimization",
        ],
        integrationSuggestions: [
          "Job boards API integration",
          "WhatsApp Business API",
          "LinkedIn Recruiter API",
        ],
        governanceRecommendations: [
          "Bias detection in AI screening",
          "Human review required for final shortlist",
        ],
      },
    ],
    cockpit: {
      transformationScore: 25,
      opportunityValue: "₹18-25Cr",
      quickWinsCount: 2,
      highComplexityCount: 1,
      processesMapped: 3,
      topBottlenecks: [
        "80% resume screening is manual",
        "Client reports take 2 days to prepare",
        "Candidate communication scattered across 5+ channels",
        "No real-time pipeline visibility for leadership",
        "Placement tracking is manual and error-prone",
      ],
      executiveActions: [
        "Deploy AI resume screening for top 3 job categories",
        "Launch client self-service portal for top 10 clients",
        "Consolidate candidate communication to unified platform",
        "Implement real-time pipeline dashboard",
        "Automate placement tracking and revenue reporting",
      ],
      aiAdoptionReadiness: "High — Tech-savvy team, digital-first culture",
    },
    roadmap: [
      {
        phase: "30_day",
        title: "Discovery & Quick Wins",
        milestones: [
          {
            id: "m1",
            title: "Train AI screening model on historical data",
            ownerFunction: "IT + Recruiting",
            expectedOutcome: "AI model trained on 10,000+ past placements",
            measurableKPI: "Screening accuracy > 80% against recruiter judgment",
          },
          {
            id: "m2",
            title: "Deploy AI screening pilot for IT recruitment",
            ownerFunction: "Recruiting",
            expectedOutcome: "AI handles initial screening for IT roles",
            measurableKPI: "Screening time reduced by 60%",
          },
          {
            id: "m3",
            title: "Launch client portal beta",
            ownerFunction: "Client Relations + IT",
            expectedOutcome: "5 top clients on self-service portal",
            measurableKPI: "Client satisfaction score > 4.5/5",
          },
        ],
      },
      {
        phase: "60_day",
        title: "Workflow Implementation",
        milestones: [
          {
            id: "m4",
            title: "Scale AI screening to all job categories",
            ownerFunction: "Recruiting",
            expectedOutcome: "100% of resumes auto-screened",
            measurableKPI: "Recruiter productivity increased by 50%",
          },
          {
            id: "m5",
            title: "Deploy automated candidate engagement",
            ownerFunction: "Recruiting + IT",
            expectedOutcome: "Automated communication for all active candidates",
            measurableKPI: "Candidate response rate improved by 30%",
          },
          {
            id: "m6",
            title: "Roll out client portal to all clients",
            ownerFunction: "Client Relations",
            expectedOutcome: "All clients on self-service portal",
            measurableKPI: "Client report preparation time reduced by 80%",
          },
        ],
      },
      {
        phase: "90_day",
        title: "Scale & Governance",
        milestones: [
          {
            id: "m7",
            title: "Deploy intelligent pipeline routing",
            ownerFunction: "Operations",
            expectedOutcome: "AI optimizes recruiter allocation to opportunities",
            measurableKPI: "Placement rate improved by 20%",
          },
          {
            id: "m8",
            title: "Implement revenue forecasting",
            ownerFunction: "Finance + Operations",
            expectedOutcome: "AI-based revenue prediction",
            measurableKPI: "Forecasting accuracy > 90%",
          },
          {
            id: "m9",
            title: "Executive review and Phase 2 planning",
            ownerFunction: "C-Suite",
            expectedOutcome: "ROI assessment and expansion plan",
            measurableKPI: "Recruiter productivity doubled",
          },
        ],
      },
    ],
  },
  {
    id: "meridian-finance",
    status: "complete",
    createdAt: "2025-02-10T10:00:00Z",
    updatedAt: "2025-02-10T10:00:00Z",
    enterpriseProfile: {
      companyName: "Meridian Finance & Operations Group",
      industry: "Financial Services / Operations",
      revenueRange: "₹300Cr",
      employeeCount: 800,
      currentSystems: {
        erp: "None",
        crm: "None",
        plm: "N/A",
        hrms: "Basic HRMS",
        finance: "Tally",
        projectTools: "Excel for MIS",
        spreadsheets: "Extensive — primary tool for all reporting",
        other: "Manual audit trails, email-based approvals",
      },
      painPoints: [
        "Month-end close takes 2 weeks — industry best is 3-5 days",
        "Compliance reporting is entirely manual — 200+ person-hours per quarter",
        "No single source of truth — data scattered across 15+ spreadsheets",
        "Audit trail gaps creating regulatory risk",
        "Financial MIS reports take 5 days to produce — outdated by the time they reach leadership",
      ],
      strategicPriorities: [
        "Reduce month-end close to 5 days",
        "Automate compliance reporting",
        "Establish single source of truth for financial data",
        "Digital audit trail for regulatory compliance",
        "Real-time MIS dashboards for leadership",
      ],
    },
    departments: [
      {
        id: "finance",
        name: "Finance & Accounting",
        headCount: 120,
        processes: [
          {
            id: "fin-1",
            name: "Month-End Close",
            systemsUsed: ["Tally", "Excel"],
            handoffs: ["Accounts → Reconciliation → Reporting → Review"],
            manualWorkPercent: 90,
            reportingPainPoints: [
              "2-week close cycle",
              "Multiple spreadsheet reconciliations",
            ],
            risks: ["Regulatory penalties", "Late reporting"],
            dependencies: ["All departments submitting data on time"],
          },
        ],
      },
      {
        id: "compliance",
        name: "Compliance & Audit",
        headCount: 40,
        processes: [
          {
            id: "comp-1",
            name: "Regulatory Reporting",
            systemsUsed: ["Excel", "Manual templates"],
            handoffs: ["Data Collection → Validation → Filing"],
            manualWorkPercent: 95,
            reportingPainPoints: [
              "200+ person-hours per quarter",
              "Error-prone manual data entry",
            ],
            risks: ["Regulatory penalties", "Audit findings"],
            dependencies: ["Finance data accuracy"],
          },
        ],
      },
      {
        id: "ops",
        name: "Operations",
        headCount: 80,
        processes: [
          {
            id: "ops-1",
            name: "MIS Reporting",
            systemsUsed: ["Excel", "Email"],
            handoffs: ["Data → Analysis → Report → Distribution"],
            manualWorkPercent: 80,
            reportingPainPoints: [
              "5 days to produce MIS reports",
              "Data outdated by distribution",
            ],
            risks: ["Decisions based on stale data"],
            dependencies: ["Data from all departments"],
          },
        ],
      },
    ],
    opportunities: [
      {
        id: "opp-mf-1",
        function: "Finance",
        title: "AI-Automated Month-End Close",
        description:
          "Deploy AI to automate journal entries, reconciliations, and close workflows reducing cycle from 2 weeks to 5 days.",
        impactType: "cycle_time",
        priorityTier: "quick_win",
        estimatedImpact: "65% reduction in month-end close cycle — from 14 days to 5 days",
        complexity: "medium",
        recommendedOwner: "CFO",
        whyItMatters:
          "2-week close delays leadership decision-making. Faster close enables timely strategic actions.",
      },
      {
        id: "opp-mf-2",
        function: "Compliance",
        title: "Intelligent Compliance Automation",
        description:
          "AI-powered regulatory report generation with automated validation, reducing 200+ hours to 20 hours per quarter.",
        impactType: "productivity",
        priorityTier: "quick_win",
        estimatedImpact: "90% reduction in compliance reporting effort",
        complexity: "medium",
        recommendedOwner: "Head of Compliance",
        whyItMatters:
          "Manual compliance reporting is the largest operational bottleneck and creates regulatory risk.",
      },
      {
        id: "opp-mf-3",
        function: "Finance",
        title: "Single Source of Truth Platform",
        description:
          "Unified financial data platform replacing 15+ spreadsheets with a single, AI-validated data repository.",
        impactType: "governance",
        priorityTier: "strategic",
        estimatedImpact: "100% elimination of spreadsheet conflicts",
        complexity: "high",
        recommendedOwner: "CFO / CTO",
        whyItMatters:
          "Multiple spreadsheets create data conflicts and audit risks. A unified platform ensures consistency.",
      },
      {
        id: "opp-mf-4",
        function: "Operations",
        title: "Real-Time MIS Dashboard",
        description:
          "Live financial dashboards replacing 5-day-old static reports with real-time AI-analyzed insights.",
        impactType: "productivity",
        priorityTier: "quick_win",
        estimatedImpact: "100% faster reporting — from 5 days to real-time",
        complexity: "low",
        recommendedOwner: "COO",
        whyItMatters:
          "Leadership makes decisions on 5-day-old data. Real-time dashboards enable same-day action.",
      },
      {
        id: "opp-mf-5",
        function: "Compliance",
        title: "Digital Audit Trail System",
        description:
          "Automated audit trail capturing all financial transactions with AI-based anomaly detection.",
        impactType: "risk",
        priorityTier: "strategic",
        estimatedImpact: "80% reduction in audit preparation time",
        complexity: "medium",
        recommendedOwner: "Head of Compliance",
        whyItMatters:
          "Audit trail gaps create regulatory risk. Digital trails ensure complete, tamper-proof records.",
      },
      {
        id: "opp-mf-6",
        function: "Finance",
        title: "AI Cash Flow Forecasting",
        description:
          "Machine learning models predicting cash flow 90 days out with 90%+ accuracy.",
        impactType: "revenue",
        priorityTier: "strategic",
        estimatedImpact: "₹8-12Cr through optimized working capital",
        complexity: "high",
        recommendedOwner: "CFO",
        whyItMatters:
          "Cash flow surprises cause operational disruptions. AI forecasting enables proactive treasury management.",
      },
    ],
    futureModel: [
      {
        departmentId: "finance",
        departmentName: "Finance & Accounting",
        beforeState:
          "2-week month-end close, 15+ spreadsheets, manual reconciliations, 5-day MIS reports",
        afterState:
          "5-day AI-assisted close, unified data platform, real-time dashboards, automated reconciliations",
        recommendedAIAgents: [
          "Close Automation Agent",
          "Reconciliation Agent",
          "Cash Flow Predictor",
        ],
        workflowAutomations: [
          "Automated journal entry posting",
          "AI-powered bank reconciliation",
          "Real-time financial anomaly detection",
        ],
        integrationSuggestions: [
          "Banking APIs for real-time data",
          "GST portal integration",
          "Tally data migration",
        ],
        governanceRecommendations: [
          "Define AI authorization thresholds",
          "Establish data quality monitoring",
        ],
      },
      {
        departmentId: "compliance",
        departmentName: "Compliance & Audit",
        beforeState:
          "Manual regulatory reporting, 200+ hours per quarter, paper-based audit trails",
        afterState:
          "Automated report generation, 20 hours per quarter, digital audit trails with AI anomaly detection",
        recommendedAIAgents: [
          "Compliance Report Generator",
          "Audit Trail Monitor",
          "Regulatory Change Tracker",
        ],
        workflowAutomations: [
          "Auto-generate quarterly compliance reports",
          "Real-time audit trail validation",
          "Regulatory deadline tracking and alerts",
        ],
        integrationSuggestions: [
          "Regulatory portal APIs",
          "Document management system",
          "Internal audit tools",
        ],
        governanceRecommendations: [
          "Mandate human review for all regulatory filings",
          "Establish AI compliance model validation process",
        ],
      },
    ],
    cockpit: {
      transformationScore: 22,
      opportunityValue: "₹25-35Cr",
      quickWinsCount: 3,
      highComplexityCount: 2,
      processesMapped: 3,
      topBottlenecks: [
        "Month-end close takes 2 weeks — 4x industry average",
        "Compliance reporting consumes 200+ person-hours quarterly",
        "15+ spreadsheets create data conflicts and audit risk",
        "MIS reports are 5 days old by the time they reach leadership",
        "Audit trail gaps create regulatory exposure",
      ],
      executiveActions: [
        "Launch AI close automation pilot for current month-end",
        "Consolidate top 5 critical spreadsheets into unified platform",
        "Deploy automated compliance report generation",
        "Implement real-time financial dashboard",
        "Establish digital audit trail for all transactions",
      ],
      aiAdoptionReadiness: "Medium — Conservative culture, need strong compliance guardrails",
    },
    roadmap: [
      {
        phase: "30_day",
        title: "Discovery & Quick Wins",
        milestones: [
          {
            id: "m1",
            title: "Map current close process and identify automation targets",
            ownerFunction: "Finance + IT",
            expectedOutcome: "Process map with 80% of close activities cataloged",
            measurableKPI: "100% of close activities documented",
          },
          {
            id: "m2",
            title: "Deploy AI reconciliation pilot",
            ownerFunction: "Finance",
            expectedOutcome: "AI handles bank reconciliation for 3 accounts",
            measurableKPI: "Reconciliation time reduced by 50%",
          },
          {
            id: "m3",
            title: "Launch real-time financial dashboard",
            ownerFunction: "Finance + IT",
            expectedOutcome: "Live P&L and cash position for leadership",
            measurableKPI: "Dashboard adopted by all C-suite members",
          },
        ],
      },
      {
        phase: "60_day",
        title: "Workflow Implementation",
        milestones: [
          {
            id: "m4",
            title: "Scale AI reconciliation to all accounts",
            ownerFunction: "Finance",
            expectedOutcome: "Automated reconciliation for all bank accounts",
            measurableKPI: "Reconciliation accuracy > 99%",
          },
          {
            id: "m5",
            title: "Deploy automated compliance reporting",
            ownerFunction: "Compliance + IT",
            expectedOutcome: "Q1 compliance report auto-generated",
            measurableKPI: "Compliance reporting time < 30 hours",
          },
          {
            id: "m6",
            title: "Consolidate spreadsheets into unified platform",
            ownerFunction: "IT + Finance",
            expectedOutcome: "Top 5 spreadsheets replaced with single data source",
            measurableKPI: "Zero data conflicts in financial reporting",
          },
        ],
      },
      {
        phase: "90_day",
        title: "Scale & Governance",
        milestones: [
          {
            id: "m7",
            title: "Achieve 5-day month-end close",
            ownerFunction: "Finance",
            expectedOutcome: "Close cycle reduced from 14 days to 5 days",
            measurableKPI: "Close completed within 5 business days",
          },
          {
            id: "m8",
            title: "Deploy digital audit trail system",
            ownerFunction: "Compliance",
            expectedOutcome: "All financial transactions have digital audit trail",
            measurableKPI: "100% transaction traceability",
          },
          {
            id: "m9",
            title: "Executive ROI review",
            ownerFunction: "C-Suite",
            expectedOutcome: "Business case validated with measurable outcomes",
            measurableKPI: "Demonstrated ROI > 3x investment",
          },
        ],
      },
    ],
  },
];
