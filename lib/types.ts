export interface Stage1Data {
  jobCategory: string
  experienceYears: string
  salaryRange: string
  skills: string[]
  companySize: string
}

export interface Stage2Data {
  companyName: string
  jobLevel: string
  actualSalary: number | string
  resignationReasons: string[]
  pros: string[]
  cons: string[]
  mgmtTrustScore: number
  stayProbability: number
  npsScore: number
}

export interface ActionItem {
  action: string
  timeline: string
}

export interface RecommendationCategory {
  category: string
  companies: string[]
  fitScore: number
  reason: string
}

export interface AnalysisResult {
  diagnosis: string
  directionType: string
  directionSummary: string
  recommendations: RecommendationCategory[]
  strengths: string[]
  gaps: string[]
  actionPlan: ActionItem[]
  warnings: string[]
}
