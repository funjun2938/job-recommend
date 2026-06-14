// ──────────────────────────────────────────────────────────────
// 전(全) 직군 도메인 카탈로그
//
// 이직추천 서비스의 IT 특화 하드코딩을 대체하는 단일 진실 공급원(SSOT).
// 각 직군마다 추천 아키타입(recommendations), 트렌딩 스킬, 그리고
// 명함첩 네트워크 맵에 등장할 회사 풀(networkCompanies)을 보유한다.
//
// 한국 채용시장 맥락에 맞춰 직군별로 현실적인 회사/포지션을 채운다.
// IT가 아닌 직군은 IT 회사로 채우지 않는다.
// ──────────────────────────────────────────────────────────────

export interface CategoryRec {
  category: string
  companies: string[]
  fitScore: number
  reason: string
}

export interface CategoryNetworkCompany {
  name: string
  industry: string
  titles: string[]
}

export interface CategoryDomain {
  key: string
  label: string // 예: '개발·엔지니어'
  emoji: string
  directionType: string // 예: '상향이직' | '수평이동' | '커리어전환'
  salaryBand: string // 예: '5~7천만원'
  trendingSkills: string[] // 6개
  recommendations: CategoryRec[] // 3개 (fitScore 내림차순, 90/78/65 식)
  networkCompanies: CategoryNetworkCompany[] // 8개 (name/industry/titles 2개)
  subcategories: string[] // 대기업 기준 상세 하위 직군 (5~12개)
}

export const CATEGORIES: CategoryDomain[] = [
  // ── 1. 개발·엔지니어 ──────────────────────────────
  {
    key: 'dev',
    label: '개발·엔지니어',
    emoji: '💻',
    directionType: '상향이직',
    salaryBand: '6~9천만원',
    trendingSkills: ['TypeScript', 'Kubernetes', 'AWS', 'Go', '시스템 설계', 'LLM 연동'],
    recommendations: [
      {
        category: '테크 유니콘 (토스·당근·카카오 계열)',
        companies: ['토스', '당근', '카카오페이', '뱅크샐러드'],
        fitScore: 91,
        reason: '빠른 성장 환경과 높은 연봉 밴드, 스톡옵션까지 제공합니다. 기술적 챌린지와 처우 모두를 잡을 수 있어요.',
      },
      {
        category: '대형 IT기업 (네이버·쿠팡·배민)',
        companies: ['네이버', '쿠팡', '배달의민족', '야놀자'],
        fitScore: 78,
        reason: '안정성과 규모 있는 프로젝트 경험을 동시에 원한다면 최선의 선택입니다. 복지와 시스템이 잘 갖춰져 있습니다.',
      },
      {
        category: '외국계 테크 (Google·Microsoft·AWS)',
        companies: ['Google Korea', 'Microsoft', 'AWS', 'Salesforce'],
        fitScore: 65,
        reason: '글로벌 수준의 연봉과 복지를 제공하지만 영어 커뮤니케이션과 높은 경쟁률이 요구됩니다. 중장기 준비로 도전 가능합니다.',
      },
    ],
    networkCompanies: [
      { name: '토스', industry: '핀테크', titles: ['백엔드 엔지니어', '프로덕트 오너'] },
      { name: '카카오', industry: 'IT 플랫폼', titles: ['서버 개발자', '플랫폼 엔지니어'] },
      { name: '네이버', industry: 'IT 플랫폼', titles: ['프론트엔드 개발자', 'AI 엔지니어'] },
      { name: '쿠팡', industry: '이커머스', titles: ['SDE', '데이터 엔지니어'] },
      { name: '배달의민족', industry: '푸드테크', titles: ['안드로이드 개발자', '백엔드 개발자'] },
      { name: '당근', industry: '커뮤니티 커머스', titles: ['iOS 개발자', '인프라 엔지니어'] },
      { name: '라인', industry: '메신저', titles: ['플랫폼 엔지니어', '보안 엔지니어'] },
      { name: '무신사', industry: '패션 커머스', titles: ['백엔드 개발자', 'DevOps 엔지니어'] },
    ],
    subcategories: [
      '백엔드 개발',
      '프론트엔드 개발',
      '풀스택 개발',
      '안드로이드 개발',
      'iOS 개발',
      '데브옵스/SRE',
      '인프라/클라우드',
      '보안 엔지니어',
      'QA 엔지니어',
      '임베디드/펌웨어',
      '게임 클라이언트 개발',
      '게임 서버 개발',
    ],
  },

  // ── 2. 데이터·AI ──────────────────────────────────
  {
    key: 'data-ai',
    label: '데이터·AI',
    emoji: '🤖',
    directionType: '상향이직',
    salaryBand: '6~1억',
    trendingSkills: ['Python', 'LLM/RAG', 'PyTorch', 'SQL', 'MLOps', '데이터 파이프라인'],
    recommendations: [
      {
        category: 'AI 스타트업·연구조직',
        companies: ['업스테이지', '뤼튼', '스캐터랩', '리벨리온'],
        fitScore: 90,
        reason: '생성형 AI 붐으로 가장 빠르게 성장하는 영역입니다. 최신 모델을 직접 다루며 임팩트를 낼 수 있어요.',
      },
      {
        category: '빅테크 데이터 조직',
        companies: ['네이버', '카카오', '쿠팡', '토스'],
        fitScore: 77,
        reason: '대규모 데이터와 견고한 MLOps 인프라를 경험할 수 있습니다. 추천·검색 등 핵심 도메인에서 성장 기회가 큽니다.',
      },
      {
        category: '대기업 AI/DT 부문',
        companies: ['삼성SDS', 'LG AI연구원', 'SK텔레콤', 'KT'],
        fitScore: 64,
        reason: '안정적인 처우와 풍부한 리소스로 장기 연구가 가능합니다. 단, 의사결정 속도는 상대적으로 느릴 수 있습니다.',
      },
    ],
    networkCompanies: [
      { name: '업스테이지', industry: 'AI', titles: ['ML 엔지니어', 'AI 리서처'] },
      { name: '네이버', industry: 'IT 플랫폼', titles: ['데이터 사이언티스트', 'AI 엔지니어'] },
      { name: '카카오', industry: 'IT 플랫폼', titles: ['ML 엔지니어', '추천 시스템 엔지니어'] },
      { name: '쿠팡', industry: '이커머스', titles: ['데이터 사이언티스트', '데이터 엔지니어'] },
      { name: '토스', industry: '핀테크', titles: ['데이터 분석가', 'ML 엔지니어'] },
      { name: 'LG AI연구원', industry: 'AI 연구', titles: ['AI 리서처', '연구 엔지니어'] },
      { name: '삼성SDS', industry: 'IT 서비스', titles: ['데이터 엔지니어', 'AI 컨설턴트'] },
      { name: '스캐터랩', industry: 'AI', titles: ['NLP 엔지니어', 'ML 리서처'] },
    ],
    subcategories: [
      '데이터 분석가',
      '데이터 엔지니어',
      '데이터 사이언티스트',
      '머신러닝 엔지니어',
      'AI 리서처',
      'MLOps 엔지니어',
      'BI/애널리틱스',
      'NLP 엔지니어',
      '컴퓨터비전 엔지니어',
      '추천/검색 엔지니어',
    ],
  },

  // ── 3. 기획·PM ────────────────────────────────────
  {
    key: 'pm',
    label: '기획·PM',
    emoji: '🧭',
    directionType: '상향이직',
    salaryBand: '5~8천만원',
    trendingSkills: ['프로덕트 전략', 'SQL', 'A/B 테스트', '데이터 분석', 'OKR', '그로스'],
    recommendations: [
      {
        category: '테크 유니콘 프로덕트 조직',
        companies: ['토스', '당근', '카카오', '쿠팡'],
        fitScore: 90,
        reason: '프로덕트 의사결정 권한이 크고 데이터 기반 문화가 강합니다. 임팩트를 빠르게 만들고 싶은 PM에게 최적입니다.',
      },
      {
        category: '대형 IT 서비스 기획',
        companies: ['네이버', '배달의민족', '야놀자', '무신사'],
        fitScore: 78,
        reason: '대규모 사용자를 대상으로 한 서비스 기획 경험을 쌓을 수 있습니다. 체계적인 프로세스 안에서 성장 가능합니다.',
      },
      {
        category: '대기업 신사업·DT 기획',
        companies: ['삼성전자', 'SK텔레콤', '현대자동차', 'CJ'],
        fitScore: 65,
        reason: '풍부한 리소스로 신사업을 기획할 수 있습니다. 안정성을 원하는 분께 적합하나 실행 속도는 더딜 수 있습니다.',
      },
    ],
    networkCompanies: [
      { name: '토스', industry: '핀테크', titles: ['프로덕트 매니저', '프로덕트 오너'] },
      { name: '카카오', industry: 'IT 플랫폼', titles: ['서비스 기획자', 'PM'] },
      { name: '네이버', industry: 'IT 플랫폼', titles: ['기획자', '프로덕트 매니저'] },
      { name: '쿠팡', industry: '이커머스', titles: ['프로덕트 매니저', '프로그램 매니저'] },
      { name: '당근', industry: '커뮤니티 커머스', titles: ['그로스 PM', '프로덕트 매니저'] },
      { name: '배달의민족', industry: '푸드테크', titles: ['서비스 기획', 'PO'] },
      { name: '야놀자', industry: '트래블테크', titles: ['PO', '플랫폼 기획'] },
      { name: '무신사', industry: '패션 커머스', titles: ['커머스 기획', 'PM'] },
    ],
    subcategories: [
      '서비스 기획',
      '프로덕트 매니저(PM)',
      '프로덕트 오너(PO)',
      '프로그램 매니저',
      '전략 기획',
      '사업 기획',
      '그로스 PM',
      '플랫폼 기획',
      '데이터 PM',
    ],
  },

  // ── 4. 디자인·UX ──────────────────────────────────
  {
    key: 'design',
    label: '디자인·UX',
    emoji: '🎨',
    directionType: '상향이직',
    salaryBand: '5~7천만원',
    trendingSkills: ['Figma', 'UX 리서치', '디자인 시스템', '프로토타이핑', '인터랙션', '데이터 기반 디자인'],
    recommendations: [
      {
        category: '테크 유니콘 프로덕트 디자인',
        companies: ['토스', '당근', '카카오', '뱅크샐러드'],
        fitScore: 90,
        reason: '디자인 시스템이 성숙하고 디자이너 발언권이 큰 조직입니다. 프로덕트 임팩트를 직접 체감할 수 있어요.',
      },
      {
        category: '대형 IT·커머스 디자인',
        companies: ['네이버', '쿠팡', '무신사', '배달의민족'],
        fitScore: 77,
        reason: '대규모 서비스의 UX를 다루며 체계적인 협업 프로세스를 경험할 수 있습니다. 안정성과 성장의 균형이 좋습니다.',
      },
      {
        category: '브랜드·디자인 에이전시',
        companies: ['플러스엑스', '디스트릭트', '제일기획', '비레모'],
        fitScore: 64,
        reason: '다양한 브랜드 프로젝트로 포트폴리오를 넓힐 수 있습니다. 인하우스보다 다채로운 경험을 원한다면 적합합니다.',
      },
    ],
    networkCompanies: [
      { name: '토스', industry: '핀테크', titles: ['프로덕트 디자이너', 'UX 디자이너'] },
      { name: '카카오', industry: 'IT 플랫폼', titles: ['UX 디자이너', 'UI 디자이너'] },
      { name: '네이버', industry: 'IT 플랫폼', titles: ['프로덕트 디자이너', 'UX 리서처'] },
      { name: '당근', industry: '커뮤니티 커머스', titles: ['프로덕트 디자이너', '브랜드 디자이너'] },
      { name: '무신사', industry: '패션 커머스', titles: ['UI 디자이너', '비주얼 디자이너'] },
      { name: '쿠팡', industry: '이커머스', titles: ['UX 디자이너', '프로덕트 디자이너'] },
      { name: '플러스엑스', industry: '디자인 에이전시', titles: ['브랜드 디자이너', 'BX 디자이너'] },
      { name: '제일기획', industry: '광고대행', titles: ['아트 디렉터', '디자인 컨설턴트'] },
    ],
    subcategories: [
      'UX 디자이너',
      'UI 디자이너',
      '프로덕트 디자이너',
      'BX/브랜드 디자이너',
      '그래픽 디자이너',
      '모션 디자이너',
      'UX 리서처',
      '비주얼 디자이너',
      '디자인 시스템 디자이너',
    ],
  },

  // ── 5. 마케팅·광고 ────────────────────────────────
  {
    key: 'marketing',
    label: '마케팅·광고',
    emoji: '📣',
    directionType: '수평이동',
    salaryBand: '4~7천만원',
    trendingSkills: ['퍼포먼스 마케팅', 'GA4', 'CRM', '콘텐츠 마케팅', 'SQL', '그로스 해킹'],
    recommendations: [
      {
        category: '테크·커머스 그로스 마케팅',
        companies: ['토스', '무신사', '쿠팡', '컬리'],
        fitScore: 89,
        reason: '데이터 기반 그로스 마케팅 역량을 가장 높이 평가하는 곳입니다. 예산 규모도 크고 실험 문화가 강합니다.',
      },
      {
        category: '대기업 브랜드 마케팅',
        companies: ['CJ제일제당', '아모레퍼시픽', 'LG생활건강', '오리온'],
        fitScore: 76,
        reason: '강력한 브랜드 자산을 다루며 통합 마케팅 캠페인을 경험할 수 있습니다. 안정적인 처우가 강점입니다.',
      },
      {
        category: '종합 광고대행사',
        companies: ['제일기획', '이노션', 'HS애드', '대홍기획'],
        fitScore: 63,
        reason: '대형 광고주의 캠페인을 다루며 크리에이티브 역량을 키울 수 있습니다. 다양한 산업 경험이 장점입니다.',
      },
    ],
    networkCompanies: [
      { name: '토스', industry: '핀테크', titles: ['그로스 마케터', '브랜드 마케터'] },
      { name: '무신사', industry: '패션 커머스', titles: ['퍼포먼스 마케터', 'CRM 마케터'] },
      { name: 'CJ제일제당', industry: 'F&B', titles: ['브랜드 매니저', '마케팅 기획'] },
      { name: '아모레퍼시픽', industry: '뷰티', titles: ['브랜드 매니저', '디지털 마케터'] },
      { name: '제일기획', industry: '광고대행', titles: ['AE', '미디어 플래너'] },
      { name: '컬리', industry: '이커머스', titles: ['그로스 마케터', 'CRM 마케터'] },
      { name: '이노션', industry: '광고대행', titles: ['AE', '디지털 플래너'] },
      { name: 'LG생활건강', industry: '뷰티/생활용품', titles: ['브랜드 매니저', '마케팅 전략'] },
    ],
    subcategories: [
      '퍼포먼스 마케팅',
      '브랜드 마케팅',
      '콘텐츠 마케팅',
      'CRM 마케팅',
      '그로스 마케팅',
      '디지털 마케팅',
      'PR/홍보',
      '광고 AE',
      '미디어 플래너',
      '제품/상품 마케팅',
    ],
  },

  // ── 6. 영업·BD ────────────────────────────────────
  {
    key: 'sales',
    label: '영업·BD',
    emoji: '🤝',
    directionType: '수평이동',
    salaryBand: '4~8천만원',
    trendingSkills: ['B2B 영업', 'CRM/Salesforce', '파트너십', '계약 협상', '영업 전략', '키 어카운트'],
    recommendations: [
      {
        category: '외국계 SaaS 기업',
        companies: ['Salesforce', 'HubSpot', 'SAP Korea', 'Oracle'],
        fitScore: 88,
        reason: '영업 실적과 B2B 경험을 가장 높이 평가합니다. 연봉 협상 여지가 크고 인센티브 구조가 명확합니다.',
      },
      {
        category: '테크 유니콘 BD·파트너십',
        companies: ['토스', '카카오', '쿠팡', '야놀자'],
        fitScore: 74,
        reason: '빠르게 성장하는 테크 기업에서 BD·파트너십 역할은 매우 중요합니다. 실적 중심 문화에서 빛을 발할 수 있어요.',
      },
      {
        category: '대기업 영업·전략',
        companies: ['삼성전자', 'LG전자', 'SK텔레콤', 'KT'],
        fitScore: 62,
        reason: '안정성과 브랜드 가치를 원한다면 선택지입니다. 단, 의사결정 속도가 느릴 수 있으니 방향을 먼저 고민해보세요.',
      },
    ],
    networkCompanies: [
      { name: 'Salesforce', industry: 'B2B SaaS', titles: ['Account Executive', 'SDR 리드'] },
      { name: 'SAP Korea', industry: '엔터프라이즈 SW', titles: ['세일즈 매니저', '솔루션 컨설턴트'] },
      { name: '토스', industry: '핀테크', titles: ['B2B 세일즈', '파트너십 매니저'] },
      { name: '쿠팡', industry: '이커머스', titles: ['셀러 BD', '카테고리 매니저'] },
      { name: '삼성전자', industry: '제조', titles: ['해외영업', 'B2B 영업'] },
      { name: 'AWS', industry: '클라우드', titles: ['Solutions Sales', '파트너 매니저'] },
      { name: 'HubSpot', industry: 'B2B SaaS', titles: ['Inbound Sales', 'Account Manager'] },
      { name: '야놀자', industry: '트래블테크', titles: ['제휴 BD', '파트너십 매니저'] },
    ],
    subcategories: [
      '국내영업',
      '해외영업',
      '기술영업',
      'B2B 세일즈',
      '파트너십/제휴',
      '영업관리',
      '채널영업',
      '솔루션 컨설팅',
      '키 어카운트 매니저',
    ],
  },

  // ── 7. 금융·회계 ──────────────────────────────────
  {
    key: 'finance',
    label: '금융·회계',
    emoji: '💰',
    directionType: '상향이직',
    salaryBand: '5~9천만원',
    trendingSkills: ['재무분석', 'IFRS', '리스크 관리', 'CPA/CFA', 'SQL', '데이터 기반 신용평가'],
    recommendations: [
      {
        category: '핀테크·디지털 금융',
        companies: ['카카오뱅크', '토스뱅크', '케이뱅크', '뱅크샐러드'],
        fitScore: 85,
        reason: '전통 금융 경험에 디지털 역량을 더한 인재를 가장 필요로 합니다. 연봉 수준이 높고 성장 기회가 풍부합니다.',
      },
      {
        category: '자산운용·투자 기관',
        companies: ['미래에셋', '한국투자증권', '삼성자산운용', 'KB자산운용'],
        fitScore: 73,
        reason: '안정적인 수익과 전문성 강화를 원한다면 최선의 선택입니다. CFA·CPA 자격이 있다면 경쟁력이 크게 올라갑니다.',
      },
      {
        category: '외국계 IB·회계법인',
        companies: ['골드만삭스', 'JP모건', '삼일PwC', '딜로이트안진'],
        fitScore: 58,
        reason: '최상위 처우를 원한다면 도전해볼 만합니다. 단, 준비 기간이 필요하고 경쟁이 매우 치열합니다.',
      },
    ],
    networkCompanies: [
      { name: '카카오뱅크', industry: '인터넷은행', titles: ['리스크 심사역', '재무 기획'] },
      { name: '토스뱅크', industry: '인터넷은행', titles: ['여신 기획', '자금 운용'] },
      { name: '미래에셋', industry: '증권', titles: ['애널리스트', 'IB 심사역'] },
      { name: '삼성자산운용', industry: '자산운용', titles: ['펀드매니저', '리서치'] },
      { name: 'KB국민은행', industry: '은행', titles: ['기업금융', '심사역'] },
      { name: '삼일PwC', industry: '회계', titles: ['회계사', '재무 컨설턴트'] },
      { name: '한국투자증권', industry: '증권', titles: ['PB', '리서치 애널리스트'] },
      { name: '신한카드', industry: '카드', titles: ['상품 기획', '리스크 관리'] },
    ],
    subcategories: [
      '재무',
      '회계',
      '세무',
      'IR',
      '자금',
      '리스크관리',
      '투자심사',
      '애널리스트',
      '여신/심사',
      '내부감사',
    ],
  },

  // ── 8. 인사·HR ────────────────────────────────────
  {
    key: 'hr',
    label: '인사·HR',
    emoji: '👥',
    directionType: '수평이동',
    salaryBand: '4~7천만원',
    trendingSkills: ['채용', 'HR 애널리틱스', '조직문화', '성과관리', 'HRBP', '보상 설계'],
    recommendations: [
      {
        category: '테크 기업 HRBP·People팀',
        companies: ['토스', '카카오', '쿠팡', '당근'],
        fitScore: 88,
        reason: '데이터 기반 People 운영과 전략적 HRBP 역할이 강조됩니다. 빠른 성장 조직에서 임팩트를 낼 수 있어요.',
      },
      {
        category: '대기업 인사·조직개발',
        companies: ['삼성전자', 'LG전자', 'SK', '현대자동차'],
        fitScore: 76,
        reason: '체계적인 인사 시스템과 대규모 조직개발을 경험할 수 있습니다. 안정적인 커리어를 원하는 분께 적합합니다.',
      },
      {
        category: 'HR 컨설팅·서치펌',
        companies: ['머서', '윌리스타워스왓슨', '커리어케어', '유니코써치'],
        fitScore: 63,
        reason: '보상·조직 컨설팅 또는 헤드헌팅으로 전문성을 넓힐 수 있습니다. 다양한 기업 사례를 경험하는 것이 강점입니다.',
      },
    ],
    networkCompanies: [
      { name: '토스', industry: '핀테크', titles: ['HRBP', '리크루터'] },
      { name: '카카오', industry: 'IT 플랫폼', titles: ['People 매니저', '조직문화 담당'] },
      { name: '삼성전자', industry: '제조', titles: ['인사 담당', '조직개발'] },
      { name: 'LG전자', industry: '제조', titles: ['HRD', '채용 담당'] },
      { name: '쿠팡', industry: '이커머스', titles: ['리크루터', 'HRBP'] },
      { name: 'SK', industry: '지주/에너지', titles: ['인사 기획', '보상 담당'] },
      { name: '머서', industry: 'HR 컨설팅', titles: ['보상 컨설턴트', '조직 컨설턴트'] },
      { name: '커리어케어', industry: '서치펌', titles: ['헤드헌터', '리서처'] },
    ],
    subcategories: [
      'HRM(인사운영)',
      'HRD(교육)',
      '채용(리크루터)',
      '보상/평가',
      '노무',
      '조직문화',
      'HRBP',
      'HR 애널리틱스',
    ],
  },

  // ── 9. 전략·컨설팅 ────────────────────────────────
  {
    key: 'strategy',
    label: '전략·컨설팅',
    emoji: '♟️',
    directionType: '상향이직',
    salaryBand: '6~1억',
    trendingSkills: ['전략 기획', '시장 분석', '재무 모델링', '데이터 분석', 'PMI', '신사업 개발'],
    recommendations: [
      {
        category: '글로벌 전략 컨설팅',
        companies: ['McKinsey', 'BCG', 'Bain', '베인앤컴퍼니'],
        fitScore: 89,
        reason: '최고 수준의 문제 해결 역량과 처우를 제공합니다. 빠른 성장과 강한 네트워크를 원한다면 최선의 선택입니다.',
      },
      {
        category: '대기업 전략·신사업 부문',
        companies: ['삼성', 'SK', '현대자동차', 'CJ'],
        fitScore: 77,
        reason: '그룹 차원의 전략과 신사업을 다루며 의사결정에 가까이 갈 수 있습니다. 안정성과 임팩트의 균형이 좋습니다.',
      },
      {
        category: '회계법인 어드바이저리·VC/PE',
        companies: ['삼일PwC', '딜로이트', 'IMM인베스트먼트', '한앤컴퍼니'],
        fitScore: 64,
        reason: 'M&A·투자 자문으로 전문성을 심화할 수 있습니다. 금융과 전략을 아우르는 커리어를 원한다면 적합합니다.',
      },
    ],
    networkCompanies: [
      { name: 'McKinsey', industry: '전략 컨설팅', titles: ['Associate', 'Engagement Manager'] },
      { name: 'BCG', industry: '전략 컨설팅', titles: ['컨설턴트', '프로젝트 리더'] },
      { name: 'Bain', industry: '전략 컨설팅', titles: ['Associate Consultant', 'Manager'] },
      { name: '삼성', industry: '대기업 지주', titles: ['전략 기획', '신사업 담당'] },
      { name: 'SK', industry: '지주/에너지', titles: ['경영 기획', '포트폴리오 전략'] },
      { name: '삼일PwC', industry: '회계/자문', titles: ['딜 어드바이저리', '전략 컨설턴트'] },
      { name: 'IMM인베스트먼트', industry: 'PE', titles: ['투자 심사역', '포트폴리오 매니저'] },
      { name: '현대자동차', industry: '모빌리티', titles: ['전략 기획', '신사업 개발'] },
    ],
    subcategories: [
      '경영전략',
      '경영컨설팅',
      '사업개발',
      'M&A/투자',
      'PMO',
      '신사업 기획',
      '포트폴리오 전략',
      '딜 어드바이저리',
    ],
  },

  // ── 10. 생산·제조 ─────────────────────────────────
  {
    key: 'manufacturing',
    label: '생산·제조',
    emoji: '🏭',
    directionType: '수평이동',
    salaryBand: '4~7천만원',
    trendingSkills: ['공정관리', '품질관리(QC)', '6시그마', 'ERP/SAP', '스마트팩토리', 'ISO'],
    recommendations: [
      {
        category: '2차전지·소재 대기업',
        companies: ['LG에너지솔루션', '삼성SDI', 'SK온', '포스코퓨처엠'],
        fitScore: 87,
        reason: '급성장하는 배터리 산업으로 증설과 채용이 활발합니다. 공정·품질 전문가 수요가 매우 높습니다.',
      },
      {
        category: '반도체·디스플레이',
        companies: ['삼성전자', 'SK하이닉스', 'LG디스플레이', 'DB하이텍'],
        fitScore: 75,
        reason: '첨단 제조 공정과 안정적인 처우를 제공합니다. 정밀 공정 경험을 쌓고 싶은 분께 적합합니다.',
      },
      {
        category: '자동차·중공업',
        companies: ['현대자동차', '현대모비스', 'HD현대', '한화'],
        fitScore: 63,
        reason: '대규모 생산 라인과 체계적인 생산관리 시스템을 경험할 수 있습니다. 견고한 제조 커리어를 원한다면 선택지입니다.',
      },
    ],
    networkCompanies: [
      { name: 'LG에너지솔루션', industry: '2차전지', titles: ['공정 엔지니어', '품질 관리'] },
      { name: '삼성SDI', industry: '2차전지', titles: ['생산기술', '공정 개발'] },
      { name: '삼성전자', industry: '반도체', titles: ['공정 엔지니어', '설비 기술'] },
      { name: 'SK하이닉스', industry: '반도체', titles: ['공정 엔지니어', '수율 관리'] },
      { name: '현대자동차', industry: '자동차', titles: ['생산관리', '품질 엔지니어'] },
      { name: '포스코퓨처엠', industry: '소재', titles: ['공정 개발', '생산기술'] },
      { name: 'LG디스플레이', industry: '디스플레이', titles: ['공정 엔지니어', '품질 관리'] },
      { name: '한화', industry: '중공업', titles: ['생산관리', '설비 엔지니어'] },
    ],
    subcategories: [
      '생산관리',
      '품질관리(QC/QA)',
      '공정기술',
      '설비/보전',
      '생산기술',
      '수율관리',
      '안전/환경(EHS)',
      '제조 자동화',
    ],
  },

  // ── 11. 연구·R&D ──────────────────────────────────
  {
    key: 'rnd',
    label: '연구·R&D',
    emoji: '🔬',
    directionType: '상향이직',
    salaryBand: '5~9천만원',
    trendingSkills: ['실험 설계', '데이터 분석', '특허/IP', '시뮬레이션', '소재 개발', '논문 작성'],
    recommendations: [
      {
        category: '대기업 중앙연구소',
        companies: ['삼성종합기술원', 'LG화학 기술연구원', 'SK이노베이션', '현대차 연구소'],
        fitScore: 88,
        reason: '풍부한 연구 인프라와 안정적인 처우로 장기 R&D가 가능합니다. 사업화 직전 단계 연구 경험을 쌓을 수 있습니다.',
      },
      {
        category: '바이오·제약 R&D',
        companies: ['삼성바이오로직스', '셀트리온', '한미약품', 'SK바이오팜'],
        fitScore: 76,
        reason: '신약·바이오 연구가 급성장하는 분야입니다. 임상·공정 개발 등 전문 트랙으로 성장할 수 있습니다.',
      },
      {
        category: '국책연구기관·대학',
        companies: ['ETRI', 'KIST', '한국화학연구원', 'KAIST'],
        fitScore: 64,
        reason: '기초·응용 연구에 집중할 수 있는 환경입니다. 학술적 성과와 안정성을 중시하는 분께 적합합니다.',
      },
    ],
    networkCompanies: [
      { name: 'LG화학', industry: '화학/소재', titles: ['연구원', '소재 개발'] },
      { name: '삼성종합기술원', industry: '연구소', titles: ['선임 연구원', '연구 엔지니어'] },
      { name: '삼성바이오로직스', industry: '바이오', titles: ['공정 개발 연구원', 'QC 연구원'] },
      { name: '셀트리온', industry: '제약/바이오', titles: ['연구원', '임상 개발'] },
      { name: 'SK이노베이션', industry: '에너지/화학', titles: ['연구원', '공정 연구'] },
      { name: 'ETRI', industry: '국책연구', titles: ['연구원', '책임 연구원'] },
      { name: 'KIST', industry: '국책연구', titles: ['연구원', '박사후 연구원'] },
      { name: '한미약품', industry: '제약', titles: ['신약 연구원', '제제 연구원'] },
    ],
    subcategories: [
      '선행연구',
      '제품개발(R&D)',
      '소재연구',
      '회로/하드웨어 설계',
      '임상/제제 연구',
      '신약 연구',
      '시뮬레이션/해석',
      '특허/IP 관리',
    ],
  },

  // ── 12. 의료·보건 ─────────────────────────────────
  {
    key: 'medical',
    label: '의료·보건',
    emoji: '🏥',
    directionType: '수평이동',
    salaryBand: '4~8천만원',
    trendingSkills: ['임상 지식', '의료 데이터', '환자 케어', '의료기기 인허가', '감염관리', '디지털 헬스'],
    recommendations: [
      {
        category: '대형 상급종합병원',
        companies: ['삼성서울병원', '서울아산병원', '세브란스병원', '서울대병원'],
        fitScore: 87,
        reason: '최고 수준의 임상 환경과 체계적인 시스템을 제공합니다. 전문성과 안정성을 동시에 추구하는 분께 적합합니다.',
      },
      {
        category: '제약·바이오 기업',
        companies: ['유한양행', '한미약품', '셀트리온', '대웅제약'],
        fitScore: 75,
        reason: '메디컬·임상·인허가 등 병원 밖 전문 트랙이 풍부합니다. 임상 경험을 산업으로 확장하고 싶은 분께 적합합니다.',
      },
      {
        category: '디지털 헬스케어',
        companies: ['루닛', '뷰노', '닥터나우', '카카오헬스케어'],
        fitScore: 64,
        reason: 'AI·디지털 기술과 의료를 결합한 신성장 영역입니다. 변화를 주도하고 싶은 분께 도전적인 선택지입니다.',
      },
    ],
    networkCompanies: [
      { name: '삼성서울병원', industry: '상급종합병원', titles: ['간호사', '의료 행정'] },
      { name: '서울아산병원', industry: '상급종합병원', titles: ['임상 전문가', '병원 코디네이터'] },
      { name: '세브란스병원', industry: '상급종합병원', titles: ['간호사', '의료기사'] },
      { name: '유한양행', industry: '제약', titles: ['메디컬 어드바이저', 'MR'] },
      { name: '셀트리온', industry: '제약/바이오', titles: ['임상 개발', '인허가 담당'] },
      { name: '루닛', industry: '디지털 헬스', titles: ['임상 연구', '메디컬 어피어스'] },
      { name: '닥터나우', industry: '디지털 헬스', titles: ['헬스케어 운영', '메디컬 매니저'] },
      { name: '대웅제약', industry: '제약', titles: ['MR', '임상 담당'] },
    ],
    subcategories: [
      '의사',
      '간호사',
      '약사',
      '의료기사',
      '보건관리',
      '임상연구(CRA)',
      '의료기기 인허가',
      '디지털헬스 기획',
    ],
  },

  // ── 13. 교육 ──────────────────────────────────────
  {
    key: 'education',
    label: '교육',
    emoji: '📚',
    directionType: '커리어전환',
    salaryBand: '3~6천만원',
    trendingSkills: ['교육과정 설계', '에듀테크', '콘텐츠 기획', 'LMS 운영', '학습 데이터 분석', '강의 운영'],
    recommendations: [
      {
        category: '에듀테크 기업',
        companies: ['패스트캠퍼스', '클래스101', '뤼이드', '에누마'],
        fitScore: 86,
        reason: '온라인 교육이 빠르게 성장하며 콘텐츠·기획 인재 수요가 높습니다. 교육 전문성을 디지털로 확장할 수 있어요.',
      },
      {
        category: '대형 교육기업·학원',
        companies: ['메가스터디', '대성학원', '에듀윌', '윤선생'],
        fitScore: 75,
        reason: '검증된 커리큘럼과 안정적인 운영 기반을 갖춘 곳입니다. 교육 운영·기획 전문성을 쌓기에 적합합니다.',
      },
      {
        category: '대학·공공교육기관',
        companies: ['주요 사립대학', '한국교육개발원', '직업능력개발원', '평생교육진흥원'],
        fitScore: 63,
        reason: '공공성과 안정성을 중시하는 교육 커리어입니다. 정책·연구·운영 등 다양한 트랙이 열려 있습니다.',
      },
    ],
    networkCompanies: [
      { name: '패스트캠퍼스', industry: '에듀테크', titles: ['콘텐츠 기획', '교육 운영'] },
      { name: '클래스101', industry: '에듀테크', titles: ['콘텐츠 PD', '크리에이터 매니저'] },
      { name: '뤼이드', industry: '에듀테크', titles: ['학습 데이터 분석', '교육 기획'] },
      { name: '메가스터디', industry: '교육', titles: ['교육 기획', '콘텐츠 운영'] },
      { name: '에듀윌', industry: '교육', titles: ['콘텐츠 기획', '강의 운영'] },
      { name: '에누마', industry: '에듀테크', titles: ['교육과정 설계', '콘텐츠 기획'] },
      { name: '한국교육개발원', industry: '공공교육', titles: ['연구원', '교육 정책'] },
      { name: '윤선생', industry: '교육', titles: ['교육 운영', '커리큘럼 기획'] },
    ],
    subcategories: [
      '교사/강사',
      '교육과정 기획',
      '에듀테크 콘텐츠',
      '입시/진학 컨설팅',
      'LMS 운영',
      '학습 데이터 분석',
      '교육 운영',
    ],
  },

  // ── 14. 법무 ──────────────────────────────────────
  {
    key: 'legal',
    label: '법무',
    emoji: '⚖️',
    directionType: '상향이직',
    salaryBand: '6~1.2억',
    trendingSkills: ['계약 검토', '컴플라이언스', 'M&A 자문', '개인정보보호', '리걸테크', '분쟁 대응'],
    recommendations: [
      {
        category: '대형 로펌',
        companies: ['김앤장', '광장', '태평양', '세종'],
        fitScore: 88,
        reason: '최고 수준의 케이스와 처우를 제공합니다. 전문 분야를 심화하고 강한 네트워크를 쌓고 싶다면 최선의 선택입니다.',
      },
      {
        category: '기업 사내 법무팀',
        companies: ['삼성전자', '쿠팡', '네이버', 'SK'],
        fitScore: 76,
        reason: '비즈니스와 밀접한 자문을 하며 워라밸과 안정성을 갖춘 트랙입니다. 산업 전문성을 키우고 싶은 분께 적합합니다.',
      },
      {
        category: '리걸테크·스타트업 법무',
        companies: ['로앤컴퍼니(로톡)', '리걸줌', '엘박스', '핀테크 스타트업'],
        fitScore: 64,
        reason: '법률 서비스 혁신을 주도하는 신성장 영역입니다. 변화를 만들고 싶은 분께 도전적인 선택지입니다.',
      },
    ],
    networkCompanies: [
      { name: '김앤장', industry: '로펌', titles: ['변호사', '전문위원'] },
      { name: '광장', industry: '로펌', titles: ['변호사', '외국변호사'] },
      { name: '태평양', industry: '로펌', titles: ['변호사', '컴플라이언스 자문'] },
      { name: '삼성전자', industry: '제조', titles: ['사내변호사', '컴플라이언스 담당'] },
      { name: '쿠팡', industry: '이커머스', titles: ['사내변호사', '법무 담당'] },
      { name: '네이버', industry: 'IT 플랫폼', titles: ['사내변호사', '개인정보보호 담당'] },
      { name: '로앤컴퍼니', industry: '리걸테크', titles: ['법무 담당', '리걸 오퍼레이션'] },
      { name: '세종', industry: '로펌', titles: ['변호사', 'M&A 자문'] },
    ],
    subcategories: [
      '사내변호사',
      '송무',
      '자문',
      '컴플라이언스',
      '특허/IP',
      '계약관리',
      '개인정보보호',
      '리걸 오퍼레이션',
    ],
  },

  // ── 15. 미디어·콘텐츠 ─────────────────────────────
  {
    key: 'media',
    label: '미디어·콘텐츠',
    emoji: '🎬',
    directionType: '커리어전환',
    salaryBand: '3~6천만원',
    trendingSkills: ['콘텐츠 기획', '영상 제작', '카피라이팅', '소셜 운영', '데이터 기반 콘텐츠', '브랜디드 콘텐츠'],
    recommendations: [
      {
        category: 'OTT·디지털 콘텐츠',
        companies: ['네이버웹툰', '카카오엔터', '왓챠', '티빙'],
        fitScore: 86,
        reason: 'IP·콘텐츠 산업이 급성장하며 기획·운영 인재 수요가 높습니다. 디지털 콘텐츠 전문성을 키울 수 있어요.',
      },
      {
        category: '방송·미디어 기업',
        companies: ['CJ ENM', 'SBS', 'JTBC', 'MBC'],
        fitScore: 74,
        reason: '대형 콘텐츠 제작 역량과 브랜드를 갖춘 곳입니다. 방송·영상 전문성을 심화하고 싶은 분께 적합합니다.',
      },
      {
        category: 'MCN·콘텐츠 스튜디오',
        companies: ['샌드박스', '트레져헌터', '뉴미디어 스튜디오', '브랜디드 에이전시'],
        fitScore: 63,
        reason: '크리에이터·소셜 콘텐츠 중심의 빠른 환경입니다. 트렌드를 직접 만들고 싶은 분께 적합합니다.',
      },
    ],
    networkCompanies: [
      { name: '네이버웹툰', industry: '콘텐츠 플랫폼', titles: ['콘텐츠 기획', 'IP 사업'] },
      { name: '카카오엔터', industry: '엔터테인먼트', titles: ['콘텐츠 PD', 'IP 기획'] },
      { name: 'CJ ENM', industry: '미디어', titles: ['콘텐츠 기획', '편성 PD'] },
      { name: '티빙', industry: 'OTT', titles: ['콘텐츠 기획', '서비스 운영'] },
      { name: 'SBS', industry: '방송', titles: ['PD', '콘텐츠 기획'] },
      { name: '샌드박스', industry: 'MCN', titles: ['크리에이터 매니저', '콘텐츠 PD'] },
      { name: 'JTBC', industry: '방송', titles: ['PD', '편성 기획'] },
      { name: '왓챠', industry: 'OTT', titles: ['콘텐츠 기획', '큐레이션'] },
    ],
    subcategories: [
      '콘텐츠 기획',
      '영상 편집/PD',
      '작가/에디터',
      '채널 운영',
      '사운드/음악',
      'IP 사업/기획',
      '소셜/커뮤니티 운영',
    ],
  },

  // ── 16. 고객·CS ───────────────────────────────────
  {
    key: 'cs',
    label: '고객·CS',
    emoji: '🎧',
    directionType: '수평이동',
    salaryBand: '3~5천만원',
    trendingSkills: ['고객 응대', 'VOC 분석', 'CRM', 'CS 운영', '챗봇/자동화', '고객 경험(CX)'],
    recommendations: [
      {
        category: '테크 기업 CX·CS 조직',
        companies: ['토스', '쿠팡', '배달의민족', '당근'],
        fitScore: 86,
        reason: '데이터 기반 CX 운영과 CS 자동화가 강조됩니다. 고객 경험 전문가로 성장하기 좋은 환경입니다.',
      },
      {
        category: '이커머스·플랫폼 CS',
        companies: ['네이버', '11번가', '컬리', '무신사'],
        fitScore: 75,
        reason: '대규모 고객 응대와 VOC 운영을 체계적으로 경험할 수 있습니다. CS 운영 전문성을 쌓기에 적합합니다.',
      },
      {
        category: '금융·통신 컨택센터',
        companies: ['삼성카드', 'KT', 'SK텔레콤', '현대카드'],
        fitScore: 63,
        reason: '안정적인 처우와 체계적인 고객관리 시스템을 갖춘 곳입니다. 정교한 응대 프로세스를 경험할 수 있습니다.',
      },
    ],
    networkCompanies: [
      { name: '토스', industry: '핀테크', titles: ['CX 매니저', 'CS 운영'] },
      { name: '쿠팡', industry: '이커머스', titles: ['CS 운영 매니저', 'VOC 분석'] },
      { name: '배달의민족', industry: '푸드테크', titles: ['CX 운영', 'CS 기획'] },
      { name: '당근', industry: '커뮤니티 커머스', titles: ['고객 운영', 'CX 매니저'] },
      { name: '컬리', industry: '이커머스', titles: ['CS 운영', '고객 경험'] },
      { name: '현대카드', industry: '카드', titles: ['고객 관리', 'CS 기획'] },
      { name: '무신사', industry: '패션 커머스', titles: ['CS 운영', 'VOC 담당'] },
      { name: 'SK텔레콤', industry: '통신', titles: ['고객 관리', '컨택센터 운영'] },
    ],
    subcategories: [
      'CS 상담',
      'CX 기획',
      'VOC 관리',
      '운영(오퍼레이션)',
      '커뮤니티 매니저',
      'CS 운영관리',
      '컨택센터 운영',
    ],
  },

  // ── 17. 물류·SCM ──────────────────────────────────
  {
    key: 'scm',
    label: '물류·SCM',
    emoji: '📦',
    directionType: '수평이동',
    salaryBand: '4~7천만원',
    trendingSkills: ['SCM 기획', '수요 예측', '물류 최적화', 'WMS/TMS', '구매/소싱', '데이터 분석'],
    recommendations: [
      {
        category: '이커머스 물류·풀필먼트',
        companies: ['쿠팡', '컬리', '네이버', 'CJ대한통운'],
        fitScore: 87,
        reason: '대규모 풀필먼트와 라스트마일 혁신이 활발합니다. 물류 데이터·운영 전문가 수요가 매우 높습니다.',
      },
      {
        category: '제조·유통 대기업 SCM',
        companies: ['삼성전자', 'LG전자', '현대자동차', '이마트'],
        fitScore: 75,
        reason: '글로벌 공급망과 체계적인 SCM 시스템을 경험할 수 있습니다. 안정적인 SCM 커리어를 원한다면 적합합니다.',
      },
      {
        category: '글로벌 물류·포워딩',
        companies: ['DHL', 'Maersk', '판토스', 'CJ대한통운 글로벌'],
        fitScore: 64,
        reason: '국제 물류와 무역 전문성을 키울 수 있습니다. 글로벌 SCM 커리어를 지향하는 분께 적합합니다.',
      },
    ],
    networkCompanies: [
      { name: '쿠팡', industry: '이커머스', titles: ['SCM 매니저', '풀필먼트 운영'] },
      { name: 'CJ대한통운', industry: '물류', titles: ['물류 기획', 'TMS 운영'] },
      { name: '컬리', industry: '이커머스', titles: ['SCM 기획', '물류 운영'] },
      { name: '삼성전자', industry: '제조', titles: ['SCM 담당', '구매/소싱'] },
      { name: 'LG전자', industry: '제조', titles: ['공급망 기획', '물류 관리'] },
      { name: '이마트', industry: '유통', titles: ['물류 기획', '수요 예측'] },
      { name: 'DHL', industry: '글로벌 물류', titles: ['포워딩 매니저', '물류 운영'] },
      { name: '판토스', industry: '물류', titles: ['국제물류 기획', 'SCM 운영'] },
    ],
    subcategories: [
      '물류관리',
      '구매/소싱',
      '무역/통관',
      '재고/창고관리',
      '수요예측(SCM 플래닝)',
      '풀필먼트 운영',
      '운송/포워딩',
    ],
  },

  // ── 18. 건설·부동산 ───────────────────────────────
  {
    key: 'construction',
    label: '건설·부동산',
    emoji: '🏗️',
    directionType: '수평이동',
    salaryBand: '4~8천만원',
    trendingSkills: ['공사관리', '시공/감리', '부동산 개발', 'PF/금융', '안전관리', 'BIM'],
    recommendations: [
      {
        category: '대형 건설사',
        companies: ['삼성물산', '현대건설', 'GS건설', 'DL이앤씨'],
        fitScore: 86,
        reason: '대규모 프로젝트와 안정적인 처우를 제공합니다. 시공·공사관리 전문성을 심화하기에 최적입니다.',
      },
      {
        category: '디벨로퍼·부동산 개발',
        companies: ['신세계프라퍼티', '엠디엠(MDM)', 'SK디앤디', '한화 건설부문'],
        fitScore: 75,
        reason: '기획부터 개발·운영까지 부동산 가치사슬을 경험할 수 있습니다. 사업 시행 역량을 키우고 싶은 분께 적합합니다.',
      },
      {
        category: '부동산 자산운용·프롭테크',
        companies: ['이지스자산운용', '코람코', '직방', '알스퀘어'],
        fitScore: 64,
        reason: '부동산 금융·데이터 기반 신영역으로 확장할 수 있습니다. 전통 건설을 넘어선 커리어를 원한다면 적합합니다.',
      },
    ],
    networkCompanies: [
      { name: '삼성물산', industry: '건설', titles: ['공사관리', '현장 소장'] },
      { name: '현대건설', industry: '건설', titles: ['시공 관리', '공무'] },
      { name: 'GS건설', industry: '건설', titles: ['공사관리', '안전관리'] },
      { name: 'DL이앤씨', industry: '건설', titles: ['현장 엔지니어', '품질관리'] },
      { name: '신세계프라퍼티', industry: '부동산 개발', titles: ['개발 기획', '자산 운용'] },
      { name: 'SK디앤디', industry: '디벨로퍼', titles: ['개발 사업', 'PF 금융'] },
      { name: '이지스자산운용', industry: '부동산 자산운용', titles: ['투자 심사', '자산 관리'] },
      { name: '직방', industry: '프롭테크', titles: ['부동산 데이터', '서비스 기획'] },
    ],
    subcategories: [
      '건축설계',
      '시공/현장관리',
      '구조/설비 엔지니어',
      '부동산 개발',
      '감리',
      '견적/적산',
      '안전관리',
      '부동산 자산운용',
    ],
  },

  // ── 19. 기타 (기본값/폴백) ────────────────────────
  {
    key: 'general',
    label: '기타',
    emoji: '🧩',
    directionType: '수평이동',
    salaryBand: '4~6천만원',
    trendingSkills: ['커뮤니케이션', '프로젝트 관리', '데이터 분석', '문서 작성', '협업 도구', '문제 해결'],
    recommendations: [
      {
        category: '성장하는 테크·플랫폼 기업',
        companies: ['토스', '카카오', '쿠팡', '배달의민족'],
        fitScore: 84,
        reason: '직무 전환과 성장 기회가 풍부한 환경입니다. 폭넓은 역량을 가진 인재가 다양한 역할로 안착하기 좋습니다.',
      },
      {
        category: '안정적인 대기업·공기업',
        companies: ['삼성', 'LG', 'SK', '현대자동차'],
        fitScore: 72,
        reason: '체계적인 시스템과 안정적인 처우를 제공합니다. 장기적인 커리어 안정성을 중시하는 분께 적합합니다.',
      },
      {
        category: '전문 서비스·중견기업',
        companies: ['CJ', '신세계', '한화', '롯데'],
        fitScore: 60,
        reason: '다양한 사업 영역에서 직무 경험을 넓힐 수 있습니다. 폭넓은 산업 경험을 원한다면 선택지입니다.',
      },
    ],
    networkCompanies: [
      { name: '삼성전자', industry: '제조', titles: ['경영 지원', '사업 관리'] },
      { name: 'LG전자', industry: '제조', titles: ['기획', '운영'] },
      { name: 'CJ제일제당', industry: 'F&B', titles: ['사업 기획', '운영'] },
      { name: 'SK', industry: '지주/에너지', titles: ['경영 기획', '사업 관리'] },
      { name: '현대자동차', industry: '모빌리티', titles: ['사업 기획', '운영'] },
      { name: '카카오', industry: 'IT 플랫폼', titles: ['서비스 운영', '사업 관리'] },
      { name: '쿠팡', industry: '이커머스', titles: ['오퍼레이션 매니저', '프로그램 매니저'] },
      { name: '신세계', industry: '유통', titles: ['사업 기획', '운영 관리'] },
    ],
    subcategories: [
      '일반사무',
      '총무',
      '비서',
      '운영지원',
      '경영지원',
      '사무행정',
    ],
  },
]

export const CATEGORY_OPTIONS: string[] = CATEGORIES.map((c) => c.label)

/**
 * 대분류 직군 그룹 (상세 하위 직군 포함).
 * 셀렉트/그룹 UI에서 대분류 → 상세 직군 선택 흐름에 사용한다.
 */
export interface CategoryGroup {
  key: string
  label: string
  emoji: string
  subs: string[]
}

export const CATEGORY_GROUPS: CategoryGroup[] = CATEGORIES.map((c) => ({
  key: c.key,
  label: c.label,
  emoji: c.emoji,
  subs: c.subcategories,
}))

/** 모든 상세 하위 직군을 평탄화(중복 제거)한 옵션 목록. */
export const SUBCATEGORY_OPTIONS: string[] = Array.from(
  new Set(CATEGORIES.flatMap((c) => c.subcategories))
)

/**
 * 입력된 직군 문자열에 대응하는 도메인을 찾는다.
 * - 1) 대분류 label 정확 일치 우선
 * - 2) 상세 하위 직군(subcategories) 정확 일치 → 부모 도메인 반환
 * - 3) label 부분 매칭(양방향 포함)
 * - 4) subcategory 부분 매칭(양방향 포함) → 부모 도메인 반환
 * - 5) 구분자(·, /, 공백) 토큰 단위 매칭
 * - 6) 못 찾으면 '기타' 기본값(없으면 첫 항목) 반환
 */
export function getCategory(jobCategory: string): CategoryDomain {
  const input = (jobCategory ?? '').trim()

  if (input) {
    // 1) 대분류 label 정확 일치
    const exact = CATEGORIES.find((c) => c.label === input)
    if (exact) return exact

    // 2) 상세 하위 직군 정확 일치 → 부모 도메인
    const exactSub = CATEGORIES.find((c) => c.subcategories.includes(input))
    if (exactSub) return exactSub

    // 3) label 부분 매칭 (양방향 포함)
    const partial = CATEGORIES.find(
      (c) => c.label.includes(input) || input.includes(c.label)
    )
    if (partial) return partial

    // 4) subcategory 부분 매칭 (양방향 포함) → 부모 도메인
    const partialSub = CATEGORIES.find((c) =>
      c.subcategories.some(
        (s) => s.includes(input) || input.includes(s)
      )
    )
    if (partialSub) return partialSub

    // 5) 구분자(·, /, 공백) 토큰 단위 매칭 (label + subcategory)
    const tokens = input.split(/[·/,\s]+/).filter(Boolean)
    if (tokens.length > 0) {
      const token = CATEGORIES.find(
        (c) =>
          tokens.some((t) => c.label.includes(t)) ||
          tokens.some((t) => c.subcategories.some((s) => s.includes(t)))
      )
      if (token) return token
    }
  }

  // 6) 폴백: '기타' → 없으면 첫 항목
  return CATEGORIES.find((c) => c.label === '기타') ?? CATEGORIES[0]
}
