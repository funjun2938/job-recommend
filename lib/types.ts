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

export interface PreferenceData {
  desiredSalary: string          // 희망 연봉대 (예: '7천~8천만원')
  workLocation: string           // 희망 근무지 (예: '서울 강남권', '수도권', '재택 우선', '무관')
  workMode: 'onsite' | 'remote' | 'hybrid' | 'any'   // 근무 형태
  priorities: string[]           // 가장 중요한 것 (연봉상승/성장/워라밸/안정성/조직문화/커리어전환/리더십) 다중
  companyType: string            // 희망 회사유형 (스타트업/중견/대기업/외국계/공공/무관)
  dealbreakers: string[]         // 기피 조건 (잦은 야근/연봉동결/경직된문화/지방근무/잦은출장 등) 다중
  motivation: string             // 이직으로 가장 이루고 싶은 것 (한 줄)
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
 * 4-신호 하이브리드 추천 점수 (Hybrid v3)
 * 후보생성 → 다신호 점수화 → 하이브리드 랭킹 파이프라인의 점수 레이어.
 * final = cbf·w_cbf + cf·w_cf + graph·w_graph + network·w_network
 *   - cbf:     콘텐츠 적합도(스킬·연봉·경력·근무형태) → LTR 주요 입력
 *   - cf:      협업 필터링(유사 행동 유저의 선택)
 *   - graph:   커리어 전이 경로 유사도
 *   - network: 사회적 연결(명함첩 인맥) 신호
 */
export interface RecommendationScore {
  company: string
  cbf: number          // 0~1 콘텐츠 적합도
  cf: number           // 0~1 협업 필터링
  graph: number        // 0~1 커리어 전이 경로
  network: number      // 0~1 사회적 연결
  finalScore: number   // 0~1 하이브리드 가중 합산
}

/** 추천 점수 산출에 쓰인 가중치 (Hybrid v3) */
export interface ScoreWeights {
  cbf: number
  cf: number
  graph: number
  network: number
}

/** 두 자산을 묶은 명함첩 연동 결과 */
export interface NetworkAnalysis {
  sync: NamecardSync
  networkMap: NetworkMap
  careerPath: CareerPathInsight
  weights: ScoreWeights
  scores: RecommendationScore[]   // finalScore 내림차순
}
