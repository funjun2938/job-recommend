import type { AnalysisResult, PreferenceData, RecommendationCategory } from './types'

const PREF_KEY = 'preferenceData'

// ──────────────────────────────────────────────
// 저장/로드 헬퍼 (sessionStorage)
// ──────────────────────────────────────────────

export function savePreferences(prefs: PreferenceData) {
  try {
    sessionStorage.setItem(PREF_KEY, JSON.stringify(prefs))
  } catch { /* SSR/사파리 프라이빗 등 무시 */ }
}

export function loadPreferences(): PreferenceData | null {
  try {
    const raw = sessionStorage.getItem(PREF_KEY)
    return raw ? (JSON.parse(raw) as PreferenceData) : null
  } catch { return null }
}

// ──────────────────────────────────────────────
// 근무형태 / 회사유형 매칭 헬퍼
// ──────────────────────────────────────────────

const WORK_MODE_LABEL: Record<PreferenceData['workMode'], string> = {
  onsite: '출근 근무',
  remote: '재택 우선',
  hybrid: '하이브리드',
  any: '근무형태 무관',
}

/** 회사유형 선호와 추천 카테고리 문구의 매칭 점수 (0~1) */
function companyTypeAffinity(companyType: string, category: string): number {
  if (!companyType || companyType === '무관') return 0
  const c = category
  switch (companyType) {
    case '스타트업':
      return /스타트업|유니콘|토스|당근|뱅크샐러드|핀테크/.test(c) ? 1 : 0
    case '대기업':
      return /대기업|네이버|쿠팡|배민|삼성|LG|SK|KT|대형/.test(c) ? 1 : 0
    case '중견':
      return /중견|자산운용|투자/.test(c) ? 1 : 0
    case '외국계':
      return /외국계|Google|Microsoft|AWS|Salesforce|SaaS|IB|컨설팅/.test(c) ? 1 : 0
    case '공공':
      return /공공|공기업|기관/.test(c) ? 1 : 0
    default:
      return 0
  }
}

/** workMode가 onsite인데 카테고리가 명백히 원격 비친화면 약한 페널티는 주지 않음(데이터 부족) — 회사유형 위주로만 보정 */

// ──────────────────────────────────────────────
// 핵심: refineResult
// ──────────────────────────────────────────────

export function refineResult(base: AnalysisResult, prefs: PreferenceData): AnalysisResult {
  const modeLabel = WORK_MODE_LABEL[prefs.workMode]
  const topPriorities = prefs.priorities.slice(0, 2)

  // 1) 추천: 회사유형 선호로 순서 보정 + reason에 희망 조건 문구 추가
  const scored = base.recommendations.map((rec, idx) => {
    const affinity = companyTypeAffinity(prefs.companyType, rec.category)
    return { rec, affinity, idx }
  })

  scored.sort((a, b) => {
    if (b.affinity !== a.affinity) return b.affinity - a.affinity
    return a.idx - b.idx
  })

  const recommendations: RecommendationCategory[] = scored.map(({ rec, affinity }) => {
    const extras: string[] = []
    if (affinity > 0) {
      extras.push(`희망하신 ${prefs.companyType} 유형과 잘 맞는 선택지예요.`)
    }
    if (prefs.workMode !== 'any' && prefs.workMode !== 'onsite') {
      extras.push(`${modeLabel}를 선호하시는 만큼 채용공고의 근무 형태를 꼭 확인하세요.`)
    }
    if (topPriorities.length > 0) {
      extras.push(`'${topPriorities.join(', ')}'을(를) 중시하시는 방향과 부합합니다.`)
    }
    const suffix = extras.length > 0 ? ` ${extras.join(' ')}` : ''
    // 회사유형 affinity가 있으면 fitScore 소폭 가산 (최대 100)
    const fitScore = affinity > 0 ? Math.min(100, rec.fitScore + 4) : rec.fitScore
    return { ...rec, fitScore, reason: rec.reason + suffix }
  })

  // 2) directionSummary: 원하시는 기준 반영 문구 앞에 덧붙임
  const wantBits: string[] = []
  if (prefs.desiredSalary) wantBits.push(`희망 연봉 ${prefs.desiredSalary}`)
  if (prefs.workMode !== 'any') wantBits.push(modeLabel)
  if (topPriorities.length > 0) wantBits.push(topPriorities.join('·'))
  const wantPhrase = wantBits.length > 0
    ? `원하시는 기준(${wantBits.join(', ')})을 반영해 방향을 좁혔어요. `
    : ''
  const directionSummary = wantPhrase + base.directionSummary

  // 3) actionPlan: 선호 기반 1~2개 추가
  const actionPlan = [...base.actionPlan]
  if (prefs.desiredSalary) {
    actionPlan.push({
      action: `희망 연봉(${prefs.desiredSalary}) 기준으로 협상 시나리오와 근거 정리`,
      timeline: '2주 내',
    })
  }
  if (prefs.workMode === 'remote' || prefs.workMode === 'hybrid') {
    actionPlan.push({
      action: `${modeLabel} 가능한 포지션 위주로 채용공고 필터링 + 근무 정책 확인`,
      timeline: '이번 주',
    })
  } else if (topPriorities.includes('워라밸')) {
    actionPlan.push({
      action: '워라밸 핵심 지표(야근·온콜·휴가 사용률)를 면접에서 직접 질문할 리스트 준비',
      timeline: '2주 내',
    })
  }

  // 4) warnings: 선호 충돌 안내 보정
  const warnings = [...base.warnings]
  if (prefs.companyType === '스타트업' && topPriorities.includes('안정성')) {
    warnings.push('스타트업을 희망하시지만 안정성도 중시하시네요. 시리즈 C 이상·흑자 전환 기업 위주로 보면 두 조건을 절충할 수 있어요.')
  }
  if (prefs.companyType === '대기업' && topPriorities.includes('성장')) {
    warnings.push('대기업을 희망하시지만 빠른 성장을 중시하신다면, 대기업 내 신사업·CIC 조직을 함께 살펴보는 걸 권합니다.')
  }
  if (prefs.workMode === 'remote' && prefs.companyType === '대기업') {
    warnings.push('재택을 선호하시지만 대기업은 출근 중심인 곳이 많아요. 근무 정책을 지원 전에 반드시 확인하세요.')
  }
  if (prefs.dealbreakers.length > 0) {
    warnings.push(`기피 조건(${prefs.dealbreakers.join(', ')})은 면접·레퍼런스 체크 단계에서 꼭 확인해 미스매치를 줄이세요.`)
  }

  return {
    ...base,
    directionSummary,
    recommendations,
    actionPlan,
    warnings,
  }
}
