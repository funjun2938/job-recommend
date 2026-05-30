import type { AnalysisResult, Stage1Data } from './types'

export function getMockResult(stage1: Stage1Data): AnalysisResult {
  const cat = stage1.jobCategory

  // 직군별로 약간 다른 목업 반환
  const isIT      = cat.includes('개발') || cat.includes('기획') || cat.includes('디자인')
  const isSales   = cat.includes('영업')
  const isFinance = cat.includes('금융')

  return {
    diagnosis: `${stage1.experienceYears} 경력의 ${cat} 전문가로서, 현재 ${stage1.companySize}에서 쌓아온 경험과 ${stage1.skills.length > 0 ? stage1.skills.slice(0, 2).join(', ') + ' 등의 역량을' : '다양한 역량을'} 바탕으로 이직을 고민하고 계시는군요. 현재 시장에서 이 프로필은 충분히 경쟁력 있는 위치에 있으며, 몇 가지 전략적 준비를 통해 목표하는 회사로의 이직이 충분히 가능합니다.`,

    directionType: isIT ? '상향이직' : isSales ? '수평이동' : isFinance ? '상향이직' : '상향이직',

    directionSummary: isIT
      ? `현재 ${stage1.companySize} 경험을 발판으로, 더 큰 규모의 테크 기업 또는 빠르게 성장 중인 스타트업으로의 이직이 가장 자연스러운 방향입니다. 기술적 역량은 충분히 검증되어 있으며, 규모가 더 큰 조직에서의 협업 경험을 추가한다면 이직 성공 가능성이 크게 높아집니다.`
      : `현재까지 쌓아온 도메인 경험과 실적을 적극 활용하여, 더 좋은 처우와 성장 기회를 제공하는 조직으로의 이직을 권장합니다. 현재 시장에서 이 분야의 경험 있는 인재 수요가 높은 만큼, 전략적으로 접근한다면 목표 달성이 가능합니다.`,

    recommendations: isIT ? [
      {
        category: '테크 유니콘 (토스·당근·카카오 계열)',
        companies: ['토스', '당근', '카카오페이', '뱅크샐러드'],
        fitScore: 91,
        reason: '빠른 성장 환경과 높은 연봉 밴드, 스톡옵션까지 제공하는 곳입니다. 스타트업 경험자에게 특히 적합하며, 기술적 챌린지와 처우 모두를 잡을 수 있어요.',
      },
      {
        category: '대형 IT기업 (네이버·쿠팡·배민)',
        companies: ['네이버', '쿠팡', '배달의민족', '야놀자'],
        fitScore: 78,
        reason: '안정성과 성장을 동시에 원한다면 최선의 선택입니다. 복지와 규모 있는 프로젝트 경험을 원하는 분께 적합합니다.',
      },
      {
        category: '외국계 테크 (Google·Microsoft·AWS)',
        companies: ['Google Korea', 'Microsoft', 'AWS', 'Salesforce'],
        fitScore: 65,
        reason: '글로벌 수준의 연봉과 복지를 제공하지만 영어 커뮤니케이션과 높은 경쟁률이 요구됩니다. 중장기적으로 준비하면 충분히 도전 가능합니다.',
      },
    ] : isSales ? [
      {
        category: '외국계 SaaS 기업',
        companies: ['Salesforce', 'HubSpot', 'SAP', 'Oracle'],
        fitScore: 88,
        reason: '영업 실적과 B2B 경험을 가장 높이 평가하는 곳입니다. 외국계 특성상 연봉 협상 여지도 크고, 인센티브 구조가 명확합니다.',
      },
      {
        category: '테크 유니콘 BD·파트너십',
        companies: ['토스', '카카오', '쿠팡', '야놀자'],
        fitScore: 74,
        reason: '빠르게 성장하는 테크 기업에서 BD 및 파트너십 역할은 매우 중요합니다. 실적 중심 문화에서 빛을 발할 수 있어요.',
      },
      {
        category: '대기업 영업/전략',
        companies: ['삼성전자', 'LG전자', 'SK텔레콤', 'KT'],
        fitScore: 62,
        reason: '안정성과 브랜드 가치를 원한다면 선택지입니다. 단, 의사결정 속도가 느릴 수 있으니 커리어 방향을 먼저 고민해보세요.',
      },
    ] : [
      {
        category: '핀테크·디지털 금융',
        companies: ['카카오뱅크', '토스뱅크', '케이뱅크', '뱅크샐러드'],
        fitScore: 85,
        reason: '전통 금융 경험에 디지털 역량을 더한 인재를 가장 필요로 하는 곳입니다. 연봉 수준도 높고 성장 기회가 풍부합니다.',
      },
      {
        category: '자산운용·투자 기관',
        companies: ['미래에셋', '한국투자증권', '삼성자산운용', 'KB자산운용'],
        fitScore: 73,
        reason: '안정적인 수익과 전문성 강화를 원한다면 최선의 선택입니다. CFA·CPA 등 자격증이 있다면 경쟁력이 크게 올라갑니다.',
      },
      {
        category: '외국계 IB·컨설팅',
        companies: ['골드만삭스', 'JP모건', 'McKinsey', 'BCG'],
        fitScore: 58,
        reason: '최상위 처우를 원한다면 도전해볼 만합니다. 단, 준비 기간이 필요하고 경쟁이 매우 치열합니다.',
      },
    ],

    strengths: [
      `${stage1.experienceYears} 경력으로 쌓인 실전 경험`,
      stage1.skills.length > 0 ? `${stage1.skills[0]} 등 검증된 핵심 역량` : '다양한 업무 경험',
      `${stage1.companySize} 환경에서의 적응력과 주도성`,
      '이직 의지와 명확한 방향성',
    ],

    gaps: [
      '포트폴리오 또는 성과 수치 정리 필요',
      '목표 기업 도메인 지식 추가 학습',
      '링크드인 프로필 최신화 필요',
    ],

    actionPlan: [
      { action: '링크드인·원티드 프로필 업데이트 — 성과 수치 중심으로', timeline: '이번 주' },
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
