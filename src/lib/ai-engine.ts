import type {
  EnterpriseProfile,
  Department,
  AIOpportunity,
  FutureModel,
  ExecutiveCockpit,
  RoadmapPhase,
} from "@/types/assessment";

type AIProvider = "mock" | "gemini";

interface AIEngineConfig {
  provider: AIProvider;
  geminiApiKey?: string;
}

interface AIEngine {
  generateOpportunities(
    profile: EnterpriseProfile,
    departments: Department[]
  ): Promise<AIOpportunity[]>;
  generateFutureModel(
    profile: EnterpriseProfile,
    departments: Department[]
  ): Promise<FutureModel[]>;
  generateCockpit(
    profile: EnterpriseProfile,
    opportunities: AIOpportunity[]
  ): Promise<ExecutiveCockpit>;
  generateRoadmap(
    opportunities: AIOpportunity[],
    profile: EnterpriseProfile
  ): Promise<RoadmapPhase[]>;
}

class MockAIEngine implements AIEngine {
  async generateOpportunities(
    profile: EnterpriseProfile,
    departments: Department[]
  ): Promise<AIOpportunity[]> {
    const opportunities: AIOpportunity[] = [];

    departments.forEach((dept) => {
      dept.processes.forEach((process) => {
        if (process.manualWorkPercent > 60) {
          opportunities.push({
            id: `opp-${dept.id}-${process.id}-automation`,
            function: dept.name,
            title: `Automate ${process.name}`,
            description: `Implement AI-driven automation for ${process.name} to reduce manual effort from ${process.manualWorkPercent}% to under 30%.`,
            impactType: "productivity",
            priorityTier:
              process.manualWorkPercent > 80 ? "quick_win" : "strategic",
            estimatedImpact: `${Math.round(process.manualWorkPercent * 0.4)}% productivity improvement`,
            complexity:
              process.manualWorkPercent > 80 ? "low" : "medium",
            recommendedOwner: `Head of ${dept.name}`,
            whyItMatters: `${process.name} currently has ${process.manualWorkPercent}% manual work, creating bottlenecks and error risk.`,
          });
        }
      });
    });

    profile.painPoints.forEach((pain, i) => {
      opportunities.push({
        id: `opp-pain-${i}`,
        function: "Operations",
        title: `Address: ${pain.split(" ").slice(0, 6).join(" ")}...`,
        description: `AI-powered solution to address the pain point: ${pain}`,
        impactType: i % 2 === 0 ? "cost" : "cycle_time",
        priorityTier: "quick_win",
        estimatedImpact: "15-25% improvement",
        complexity: "medium",
        recommendedOwner: "COO",
        whyItMatters: pain,
      });
    });

    return opportunities;
  }

  async generateFutureModel(
    profile: EnterpriseProfile,
    departments: Department[]
  ): Promise<FutureModel[]> {
    return departments.map((dept) => ({
      departmentId: dept.id,
      departmentName: dept.name,
      beforeState: `Current: ${dept.processes.length} processes with average ${Math.round(dept.processes.reduce((a, p) => a + p.manualWorkPercent, 0) / dept.processes.length)}% manual work`,
      afterState: `Future: AI-augmented operations with < 20% manual work, real-time visibility, predictive analytics`,
      recommendedAIAgents: [
        `${dept.name} Intelligence Agent`,
        `${dept.name} Automation Agent`,
      ],
      workflowAutomations: dept.processes
        .filter((p) => p.manualWorkPercent > 50)
        .map((p) => `Automate ${p.name}`),
      integrationSuggestions: [
        "ERP integration",
        "Real-time data feeds",
        "AI model outputs",
      ],
      governanceRecommendations: [
        `Define ${dept.name} AI usage policies`,
        "Establish monitoring and alerts",
      ],
    }));
  }

  async generateCockpit(
    profile: EnterpriseProfile,
    opportunities: AIOpportunity[]
  ): Promise<ExecutiveCockpit> {
    const quickWins = opportunities.filter(
      (o) => o.priorityTier === "quick_win"
    );
    const highComplexity = opportunities.filter(
      (o) => o.complexity === "high"
    );
    const avgManual =
      opportunities.reduce((a, o) => {
        const match = o.estimatedImpact.match(/(\d+)%/);
        return a + (match ? parseInt(match[1]) : 0);
      }, 0) / opportunities.length;

    return {
      transformationScore: Math.min(
        100,
        Math.round(avgManual * 2 + quickWins.length * 5)
      ),
      opportunityValue: `${quickWins.length * 5}-${highComplexity.length * 15}Cr`,
      quickWinsCount: quickWins.length,
      highComplexityCount: highComplexity.length,
      processesMapped: opportunities.length,
      topBottlenecks: profile.painPoints.slice(0, 5),
      executiveActions: [
        `Review ${quickWins.length} quick wins for immediate action`,
        "Allocate budget for top 3 strategic initiatives",
        "Establish AI governance committee",
        "Define success metrics for transformation",
        "Schedule 90-day review with CXO team",
      ],
      aiAdoptionReadiness:
        avgManual > 60
          ? "High opportunity — significant manual work to automate"
          : "Medium — some automation opportunities identified",
    };
  }

  async generateRoadmap(
    opportunities: AIOpportunity[],
    _profile: EnterpriseProfile
  ): Promise<RoadmapPhase[]> {
    const quickWins = opportunities.filter(
      (o) => o.priorityTier === "quick_win"
    );
    const strategic = opportunities.filter(
      (o) => o.priorityTier === "strategic"
    );

    return [
      {
        phase: "30_day",
        title: "Discovery & Quick Wins",
        milestones: quickWins.slice(0, 3).map((opp, i) => ({
          id: `m30-${i}`,
          title: `Implement ${opp.title}`,
          ownerFunction: opp.recommendedOwner,
          expectedOutcome: opp.description,
          measurableKPI: opp.estimatedImpact,
        })),
      },
      {
        phase: "60_day",
        title: "Workflow Implementation",
        milestones: strategic.slice(0, 3).map((opp, i) => ({
          id: `m60-${i}`,
          title: `Deploy ${opp.title}`,
          ownerFunction: opp.recommendedOwner,
          expectedOutcome: opp.description,
          measurableKPI: opp.estimatedImpact,
        })),
      },
      {
        phase: "90_day",
        title: "Scale & Governance",
        milestones: [
          {
            id: "m90-0",
            title: "Full scale deployment",
            ownerFunction: "C-Suite",
            expectedOutcome: "All quick wins and strategic initiatives live",
            measurableKPI: "Demonstrated ROI > 3x investment",
          },
          {
            id: "m90-1",
            title: "AI governance framework",
            ownerFunction: "COO + Compliance",
            expectedOutcome: "Documented AI policies and monitoring",
            measurableKPI: "100% AI models governed",
          },
          {
            id: "m90-2",
            title: "Executive ROI review",
            ownerFunction: "C-Suite",
            expectedOutcome: "Business impact documented",
            measurableKPI: "Phase 2 planning approved",
          },
        ],
      },
    ];
  }
}

class GeminiAIEngine implements AIEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  }

  async generateOpportunities(
    profile: EnterpriseProfile,
    departments: Department[]
  ): Promise<AIOpportunity[]> {
    const prompt = `Analyze this enterprise and generate AI transformation opportunities.
Company: ${profile.companyName}
Industry: ${profile.industry}
Revenue: ${profile.revenueRange}
Pain points: ${profile.painPoints.join("; ")}
Departments: ${departments.map((d) => d.name).join(", ")}
Return JSON array of opportunities with: id, function, title, description, impactType (revenue/cost/productivity/margin/cycle_time/governance/risk), priorityTier (quick_win/strategic/high_complexity/not_now), estimatedImpact, complexity (low/medium/high), recommendedOwner, whyItMatters`;

    const result = await this.callGemini(prompt);
    try {
      return JSON.parse(result);
    } catch {
      return [];
    }
  }

  async generateFutureModel(
    profile: EnterpriseProfile,
    departments: Department[]
  ): Promise<FutureModel[]> {
    const prompt = `Generate future operating model for ${profile.companyName}.
Departments: ${departments.map((d) => `${d.name} (${d.headCount} people)`).join(", ")}
Return JSON array with: departmentId, departmentName, beforeState, afterState, recommendedAIAgents, workflowAutomations, integrationSuggestions, governanceRecommendations`;

    const result = await this.callGemini(prompt);
    try {
      return JSON.parse(result);
    } catch {
      return [];
    }
  }

  async generateCockpit(
    profile: EnterpriseProfile,
    opportunities: AIOpportunity[]
  ): Promise<ExecutiveCockpit> {
    const mockEngine = new MockAIEngine();
    return mockEngine.generateCockpit(profile, opportunities);
  }

  async generateRoadmap(
    opportunities: AIOpportunity[],
    profile: EnterpriseProfile
  ): Promise<RoadmapPhase[]> {
    const mockEngine = new MockAIEngine();
    return mockEngine.generateRoadmap(opportunities, profile);
  }
}

function getConfig(): AIEngineConfig {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    return { provider: "gemini", geminiApiKey: apiKey };
  }
  return { provider: "mock" };
}

export function createAIEngine(): AIEngine {
  const config = getConfig();
  if (config.provider === "gemini" && config.geminiApiKey) {
    return new GeminiAIEngine(config.geminiApiKey);
  }
  return new MockAIEngine();
}
