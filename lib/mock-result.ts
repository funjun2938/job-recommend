import type { AnalysisResult, Stage1Data } from './types'
import { getCategory } from './categories'

export function getMockResult(stage1: Stage1Data): AnalysisResult {
  const cat = stage1.jobCategory
  const domain = getCategory(cat)

  // 직군 도메인에서 추천/방향/트렌딩 스킬을 가져온다 (전 직군 대응)
  const topTrending = domain.trendingSkills.slice(0, 3).join(', ')

  return {
    diagnosis: `${stage1.experienceYears} 경력의 ${cat} 전문가로서, 현재 ${stage1.companySize}에서 쌓아온 경험과 ${stage1.skills.length > 0 ? stage1.skills.slice(0, 2).join(', ') + ' 등의 역량을' : '다양한 역량을'} 바탕으로 이직을 고민하고 계시는군요. 현재 시장에서 이 프로필은 충분히 경쟁력 있는 위치에 있으며, 몇 가지 전략적 준비를 통해 목표하는 회사로의 이직이 충분히 가능합니다.`,

    directionType: domain.directionType,

    directionSummary: `현재 ${stage1.companySize}에서 쌓은 ${cat} 경험과 실적을 발판으로, 더 좋은 처우와 성장 기회를 제공하는 조직으로의 이직을 권장합니다. 시장에서 ${cat} 경험 있는 인재 수요가 견조한 만큼, ${topTrending} 등 핵심 역량을 보강해 전략적으로 접근한다면 목표 달성이 충분히 가능합니다.`,

    recommendations: domain.recommendations,

    strengths: [
      `${stage1.experienceYears} 경력으로 쌓인 실전 경험`,
      stage1.skills.length > 0 ? `${stage1.skills[0]} 등 검증된 핵심 역량` : '다양한 업무 경험',
      `${stage1.companySize} 환경에서의 적응력과 주도성`,
      '이직 의지와 명확한 방향성',
    ],

    gaps: [
      '포트폴리오 또는 성과 수치 정리 필요',
      '목표 기업 도메인 지식 추가 학습',
      '프로필(링크드인·이력서) 최신화 필요',
    ],

    actionPlan: [
      { action: '링크드인·채용 플랫폼 프로필 업데이트 — 성과 수치 중심으로', timeline: '이번 주' },
      { action: '목표 기업 3곳의 채용 페이지 즐겨찾기 + 지원 조건 분석', timeline: '이번 주' },
      { action: '이력서 초안 작성 — 현재 역할의 임팩트를 숫자로 표현', timeline: '2주 내' },
      { action: '내부 레퍼런스 또는 지인 네트워크를 통한 내부 정보 수집', timeline: '2주 내' },
      { action: '1~2곳에 실제 지원하여 면접 감각 익히기', timeline: '1개월 내' },
    ],

    warnings: [
      `현재 구직 시장에서 ${cat} 포지션 경쟁이 높아진 상태입니다. 포트폴리오와 이력서 준비에 충분한 시간을 투자하세요.`,
      '연봉 협상 시 현재 시장 중앙값(벤치마크)을 근거로 제시하면 더 유리한 결과를 얻을 수 있습니다.',
    ],
  }
}
