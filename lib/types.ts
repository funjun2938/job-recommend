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

// ──────────────────────────────────────────────
// 명함첩(리멤버 류) 외부 데이터 연동 타입
// ──────────────────────────────────────────────

/** 명함첩 연동 상태 (localStorage + /api/network/sync) */
export interface NamecardSync {
  provider: 'remember' | 'rolodex' | 'linkedin'
  syncedAt: string          // ISO
  cardCount: number         // 보유 명함 수
  companyCount: number      // 고유 회사 수
  contactCount: number      // 고유 연락처 수
}

/** 네트워크 맵 노드 — 내 인맥이 닿아있는 회사 1곳 */
export interface NetworkCompany {
  company: string
  connections: number       // 내 명함첩 내 해당 회사 인맥 수
  proximity: number         // 0~100 네트워크 근접도
  isRecommendable: boolean  // 추천 후보 여부 (현재 회사가 아님)
  topTitles: string[]       // 그 회사 인맥들의 대표 직함
  industry: string
}

/** 자산①: 명함첩 기반 네트워크 맵 */
export interface NetworkMap {
  totalConnections: number
  reachableCompanies: number
  companies: NetworkCompany[]   // proximity 내림차순
  insight: string               // 한줄 인사이트
}

/** 커리어 경로 추천 — "유사 커리어를 탄 사람들의 다음 회사" */
export interface PathRecommendation {
  company: string
  similarPeople: number     // 유사 궤적을 가진 사람 수
  matchRate: number         // 0~100 경로 유사도
  commonPath: string[]      // 대표 공통 경로 (예: 스타트업 → 네이버 → 토스)
  reason: string
}

/** 자산②: 유사 커리어 경로 분석 */
export interface CareerPathInsight {
  myPath: string[]              // 내 추정 커리어 경로
  peerCount: number             // 유사 경로 peer 수
  recommendations: PathRecommendation[]
  insight: string
}

/**
 * 3축 가중 합산 추천 점수 (recommendation_scores 테이블 대응)
 * final = surveyFit·w_survey + networkProximity·w_network + careerSimilarity·w_career
 */
export interface RecommendationScore {
  company: string
  surveyFit: number          // 0~1 서베이 적합도
  networkProximity: number   // 0~1 네트워크 근접도
  careerSimilarity: number   // 0~1 커리어 경로 유사도
  finalScore: number         // 0~1 가중 합산
}

/** 추천 점수 산출에 쓰인 가중치 */
export interface ScoreWeights {
  survey: number
  network: number
  career: number
}

/** 두 자산을 묶은 명함첩 연동 결과 */
export interface NetworkAnalysis {
  sync: NamecardSync
  networkMap: NetworkMap
  careerPath: CareerPathInsight
  weights: ScoreWeights
  scores: RecommendationScore[]   // finalScore 내림차순
}
