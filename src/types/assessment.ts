export interface CurrentSystems {
  erp: string
  crm: string
  plm: string
  hrms: string
  finance: string
  projectTools: string
  spreadsheets: string
  other: string
}

export interface EnterpriseProfile {
  companyName: string
  industry: string
  revenueRange: string
  employeeCount: number
  currentSystems: CurrentSystems
  painPoints: string[]
  strategicPriorities: string[]
}

export interface Process {
  id: string
  name: string
  systemsUsed: string[]
  handoffs: string[]
  manualWorkPercent: number
  reportingPainPoints: string[]
  risks: string[]
  dependencies: string[]
}

export interface Department {
  id: string
  name: string
  headCount: number
  processes: Process[]
}

export type ImpactType =
  | "revenue"
  | "cost"
  | "productivity"
  | "margin"
  | "cycle_time"
  | "governance"
  | "risk"

export type PriorityTier =
  | "quick_win"
  | "strategic"
  | "high_complexity"
  | "not_now"

export type Complexity = "low" | "medium" | "high"

export interface AIOpportunity {
  id: string
  function: string
  title: string
  description: string
  impactType: ImpactType
  priorityTier: PriorityTier
  estimatedImpact: string
  complexity: Complexity
  recommendedOwner: string
  whyItMatters: string
}

export interface FutureModel {
  departmentId: string
  departmentName: string
  beforeState: string
  afterState: string
  recommendedAIAgents: string[]
  workflowAutomations: string[]
  integrationSuggestions: string[]
  governanceRecommendations: string[]
}

export interface Milestone {
  id: string
  title: string
  ownerFunction: string
  expectedOutcome: string
  measurableKPI: string
}

export interface RoadmapPhase {
  phase: "30_day" | "60_day" | "90_day"
  title: string
  milestones: Milestone[]
}

export interface ExecutiveCockpit {
  transformationScore: number
  opportunityValue: string
  quickWinsCount: number
  highComplexityCount: number
  processesMapped: number
  topBottlenecks: string[]
  executiveActions: string[]
  aiAdoptionReadiness: string
}

export type AssessmentStatus =
  | "draft"
  | "intake"
  | "modeling"
  | "analyzing"
  | "complete"

export interface Assessment {
  id: string
  status: AssessmentStatus
  createdAt: string
  updatedAt: string
  enterpriseProfile: EnterpriseProfile
  departments: Department[]
  opportunities: AIOpportunity[]
  futureModel: FutureModel[]
  cockpit: ExecutiveCockpit
  roadmap: RoadmapPhase[]
}
