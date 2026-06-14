// ──────────────────────────────────────────────────────────────
// 명함첩(리멤버 류) 외부 데이터 연동 — 네트워크 맵 & 커리어 경로 생성기
//
// 실제 외부 연동 가능 여부는 차치하고(연동된다고 가정), 명함첩 데이터가
// 들어왔을 때 만들어질 두 가지 데이터 자산을 시뮬레이션한다.
//   ① 네트워크 맵: 내 명함첩 = 내가 네트워킹하는 회사들의 맵
//   ② 커리어 경로: 명함 교체 = 그 사람의 이직 → 유사 궤적 peer 의 다음 회사
//
// 결정론적(deterministic) 시드를 써서 같은 입력엔 같은 결과가 나오도록 한다.
// ──────────────────────────────────────────────────────────────

import type {
  Stage1Data,
  NamecardSync,
  NetworkMap,
  NetworkCompany,
  CareerPathInsight,
  PathRecommendation,
  NetworkAnalysis,
  RecommendationScore,
  ScoreWeights,
} from './types'
import { getCategory } from './categories'

// 4-신호 하이브리드 가중치 (Hybrid v3)
// Hybrid v3 = 0.40×CBF(콘텐츠/LTR) + 0.30×CF(협업) + 0.20×Graph(커리어전이) + 0.10×Network(소셜)
export const SCORE_WEIGHTS: ScoreWeights = { cbf: 0.4, cf: 0.3, graph: 0.2, network: 0.1 }

// 직군 도메인 카탈로그(lib/categories.ts)에서 직군별 네트워크 회사 풀을 가져온다.
// 전(全) 직군에서 직군 맥락에 맞는 명함첩 네트워크 맵/커리어 경로가 생성된다.
function poolFor(jobCategory: string) {
  const domain = getCategory(jobCategory)
  return { key: domain.key, pool: domain.networkCompanies }
}

// 여러 직군의 네트워크 회사를 섞어(mingle) 하나의 풀로 — 다중 소스 분석용.
// 첫 직군(주 직군)을 앞세우고 나머지 소스 직군의 회사를 이어붙여 중복 제거.
function pooledCompanies(categories: string[]) {
  const seen = new Set<string>()
  const out: { name: string; industry: string; titles: string[] }[] = []
  for (const cat of categories) {
    for (const c of getCategory(cat).networkCompanies) {
      if (!seen.has(c.name)) { seen.add(c.name); out.push(c) }
    }
  }
  return out
}

// 간단한 결정론적 해시 → 시드
function seedFrom(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function seededRand(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/** 경력 구간 → 대략적인 거쳐온 회사 수 */
function movesFromExperience(exp: string): number {
  if (exp.includes('1년') || exp.includes('신입')) return 1
  if (exp.includes('1~3') || exp.includes('1-3')) return 2
  if (exp.includes('3~5') || exp.includes('3-5')) return 2
  if (exp.includes('5~7') || exp.includes('5-7')) return 3
  if (exp.includes('7~10') || exp.includes('7-10')) return 3
  if (exp.includes('10')) return 4
  return 2
}

/**
 * 명함첩 기반 네트워크 맵 생성 (자산①)
 * 내 명함첩에 등장하는 회사들 = 내가 네트워킹하는 회사 맵
 */
export function buildNetworkMap(stage1: Stage1Data, extraCategories: string[] = []): NetworkMap {
  const pool = pooledCompanies([stage1.jobCategory, ...extraCategories])
  const rand = seededRand(seedFrom(stage1.jobCategory + stage1.experienceYears + stage1.companySize))

  const myCompany = (stage1 as Stage1Data & { companyName?: string }).companyName || ''

  const companies: NetworkCompany[] = pool.map((c) => {
    const connections = 1 + Math.floor(rand() * 8)
    const proximity = Math.min(98, 35 + connections * 7 + Math.floor(rand() * 12))
    return {
      company: c.name,
      connections,
      proximity,
      isRecommendable: c.name !== myCompany,
      topTitles: c.titles.slice(0, 2),
      industry: c.industry,
    }
  })
    .sort((a, b) => b.proximity - a.proximity)
    .slice(0, 8)

  const totalConnections = companies.reduce((s, c) => s + c.connections, 0)
  const top = companies[0]

  return {
    totalConnections,
    reachableCompanies: companies.length,
    companies,
    insight: `명함첩 분석 결과, 당신의 인맥은 ${companies.length}개 회사에 걸쳐 ${totalConnections}명이 연결돼 있어요. 특히 ${top.company}(연결 ${top.connections}명)와 네트워크 근접도가 가장 높아, 레퍼럴(지인 추천) 입사 가능성이 큽니다.`,
  }
}

/**
 * 유사 커리어 경로 기반 추천 생성 (자산②)
 * "나와 비슷한 커리어를 탄 사람들이 다음에 간 회사"
 */
export function buildCareerPath(stage1: Stage1Data, extraCategories: string[] = []): CareerPathInsight {
  const pool = pooledCompanies([stage1.jobCategory, ...extraCategories])
  const rand = seededRand(seedFrom('path' + stage1.jobCategory + stage1.experienceYears))

  // 내 추정 커리어 경로
  const moves = movesFromExperience(stage1.experienceYears)
  const myPath: string[] = []
  const start =
    stage1.companySize.includes('스타트업') ? '스타트업'
    : stage1.companySize.includes('대기업') ? '대기업'
    : stage1.companySize.includes('외국계') ? '외국계'
    : '중견기업'
  myPath.push(`${start}(현재)`)
  // 거쳐온 흔적 (오래된 순으로 앞에)
  const shuffled = [...pool].sort(() => rand() - 0.5)
  for (let i = 0; i < Math.min(moves - 1, 2); i++) {
    myPath.unshift(shuffled[i].name)
  }

  // 추천: peer 들이 다음에 간 회사
  const recommendations: PathRecommendation[] = shuffled
    .slice(2, 7)
    .map((c, i) => {
      const similarPeople = 40 - i * 6 + Math.floor(rand() * 8)
      const matchRate = 92 - i * 5 - Math.floor(rand() * 4)
      const commonPath = [start, shuffled[(i + 1) % shuffled.length].name, c.name]
      return {
        company: c.name,
        similarPeople,
        matchRate,
        commonPath,
        reason: `당신과 비슷한 ${stage1.jobCategory} 커리어를 밟은 ${similarPeople}명 중 다수가 ${c.name}(으)로 이동했어요. ${commonPath.join(' → ')} 경로가 가장 흔합니다.`,
      }
    })
    .sort((a, b) => b.matchRate - a.matchRate)

  const peerCount = recommendations.reduce((s, r) => s + r.similarPeople, 0)
  const topRec = recommendations[0]

  return {
    myPath,
    peerCount,
    recommendations,
    insight: `명함 교체 이력으로 추정한 ${peerCount}명의 유사 커리어 데이터를 분석했어요. 당신과 가장 닮은 경로를 가진 사람들은 ${topRec.company}(경로 일치율 ${topRec.matchRate}%)로 가장 많이 이동했습니다.`,
  }
}

/** 명함첩 동기화 결과 (mock) */
export function buildSync(stage1: Stage1Data): NamecardSync {
  const rand = seededRand(seedFrom('sync' + stage1.jobCategory))
  const cardCount = 80 + Math.floor(rand() * 220)
  return {
    provider: 'remember',
    syncedAt: new Date().toISOString(),
    cardCount,
    companyCount: 18 + Math.floor(rand() * 30),
    contactCount: cardCount - Math.floor(rand() * 15),
  }
}

const r3 = (n: number) => Math.round(n * 1000) / 1000

/**
 * 4-신호 하이브리드 추천 점수 산출 (Hybrid v3)
 * 후보생성(네트워크 ∪ 커리어 경로) → 다신호 점수화 → 하이브리드 랭킹.
 *   - CBF:     콘텐츠 적합도(스킬·연봉·경력·근무형태) → LTR 주요 입력
 *   - CF:      협업 필터링(유사 행동 유저의 선택) — 가장 큰 기여 신호
 *   - Graph:   커리어 전이 경로 유사도
 *   - Network: 명함첩 기반 사회적 연결 신호
 */
export function buildRecommendationScores(
  stage1: Stage1Data,
  networkMap: NetworkMap,
  careerPath: CareerPathInsight,
  weights: ScoreWeights = SCORE_WEIGHTS
): RecommendationScore[] {
  // Network 신호 = 명함첩 근접도, Graph 신호 = 커리어 경로 일치율
  const netByCompany = new Map<string, number>()
  networkMap.companies.forEach((c) => netByCompany.set(c.company, c.proximity / 100))
  const graphByCompany = new Map<string, number>()
  careerPath.recommendations.forEach((r) => graphByCompany.set(r.company, r.matchRate / 100))

  // 후보 생성: 네트워크 ∪ 커리어 경로에 등장한 회사
  const companies = new Set<string>([...netByCompany.keys(), ...graphByCompany.keys()])

  const scores: RecommendationScore[] = [...companies].map((company) => {
    const network = netByCompany.get(company) ?? 0
    const graph = graphByCompany.get(company) ?? 0
    // CBF: 콘텐츠 적합도 (스킬·연봉·경력·근무형태 매칭) — 회사별 결정론적 추정 0.55~0.92
    const cbf = r3(0.55 + seededRand(seedFrom('cbf' + company + stage1.jobCategory))() * 0.37)
    // CF: 협업 필터링 (유사 행동 유저) — 방법론상 가장 강한 신호, 0.62~0.96
    const cf = r3(0.62 + seededRand(seedFrom('cf' + company + stage1.experienceYears))() * 0.34)
    const finalScore = r3(
      cbf * weights.cbf + cf * weights.cf + graph * weights.graph + network * weights.network
    )
    return { company, cbf, cf, graph: r3(graph), network: r3(network), finalScore }
  })

  return scores.sort((a, b) => b.finalScore - a.finalScore)
}

/** 전체 명함첩 분석 묶음 (extraCategories로 다중 소스 직군을 섞어 분석) */
export function buildNetworkAnalysis(stage1: Stage1Data, extraCategories: string[] = []): NetworkAnalysis {
  const networkMap = buildNetworkMap(stage1, extraCategories)
  const careerPath = buildCareerPath(stage1, extraCategories)
  const scores = buildRecommendationScores(stage1, networkMap, careerPath)
  return {
    sync: buildSync(stage1),
    networkMap,
    careerPath,
    weights: SCORE_WEIGHTS,
    scores,
  }
}

// ── localStorage 연동 상태 관리 ───────────────────────────
const SYNC_KEY = 'namecardSync'

export function getStoredSync(): NamecardSync | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SYNC_KEY)
    return raw ? (JSON.parse(raw) as NamecardSync) : null
  } catch {
    return null
  }
}

export function setStoredSync(sync: NamecardSync) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SYNC_KEY, JSON.stringify(sync))
}

export function clearStoredSync() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SYNC_KEY)
}
