// ──────────────────────────────────────────────────────────────
// 관리자 페이지 — 모니터링 대시보드용 목업 데이터 & 도메인 구성
// 78테이블 / 9도메인 엔터프라이즈 모델을 조회 중심으로 보여준다.
// (Supabase 미연동 상태에서도 항상 동작하도록 결정론적 목업)
// ──────────────────────────────────────────────────────────────

export interface ColumnRow {
  [key: string]: string | number | boolean
}

export interface AdminTable {
  name: string          // DB 테이블명
  label: string         // 한글 표시명
  rowCount: number      // 보유 행 수(목업 통계)
  isNew?: boolean       // v3 신규 여부
  columns?: string[]    // 샘플 행 컬럼 (있으면 데이터 테이블 렌더)
  rows?: ColumnRow[]    // 샘플 행
}

export interface AdminDomain {
  key: string
  name: string
  icon: string
  color: string         // tailwind 색 토큰 (bg-/text- 베이스)
  desc: string
  tables: AdminTable[]
}

// ── 대시보드 KPI ───────────────────────────────────────────────
export interface Kpi {
  label: string
  value: string
  delta: string         // 전주 대비
  positive: boolean
  icon: string
}

export const KPIS: Kpi[] = [
  { label: '총 사용자', value: '48,213', delta: '+5.2%', positive: true, icon: '👤' },
  { label: '활성 공고', value: '3,180', delta: '+1.8%', positive: true, icon: '📋' },
  { label: '주간 추천 노출', value: '912,440', delta: '+12.4%', positive: true, icon: '🤖' },
  { label: '추천 CTR', value: '8.7%', delta: '+0.6%p', positive: true, icon: '🎯' },
  { label: '지원 전환율', value: '3.1%', delta: '-0.2%p', positive: false, icon: '📨' },
  { label: '월 매출(MRR)', value: '₩142.6M', delta: '+9.1%', positive: true, icon: '💳' },
]

// ── 차트용 시계열/분포 ─────────────────────────────────────────
export const SIGNUP_TREND = [
  { label: '월', value: 420 }, { label: '화', value: 510 }, { label: '수', value: 480 },
  { label: '목', value: 620 }, { label: '금', value: 710 }, { label: '토', value: 350 },
  { label: '일', value: 300 },
]

export const REC_FUNNEL = [
  { label: '추천 노출', value: 912440, pct: 100 },
  { label: '클릭', value: 79382,  pct: 8.7 },
  { label: '공고 조회', value: 41200, pct: 4.5 },
  { label: '지원', value: 28286,  pct: 3.1 },
  { label: '서류 합격', value: 6420, pct: 0.7 },
]

export const REVENUE_TREND = [
  { label: '1월', value: 98 }, { label: '2월', value: 110 }, { label: '3월', value: 119 },
  { label: '4월', value: 126 }, { label: '5월', value: 134 }, { label: '6월', value: 143 },
]

export const MODEL_METRICS = [
  { model: 'hybrid-v3.2', ctr: 8.7, conv: 3.1, status: '운영중', traffic: '70%' },
  { model: 'cf-v2.8',     ctr: 7.9, conv: 2.8, status: '실험중', traffic: '20%' },
  { model: 'content-v1.5',ctr: 6.4, conv: 2.2, status: '실험중', traffic: '10%' },
]

// ── 9개 도메인 / 78개 테이블 ───────────────────────────────────
export const DOMAINS: AdminDomain[] = [
  {
    key: 'user', name: '사용자 프로필', icon: '👤', color: 'violet',
    desc: '이직자 프로필·경력·스킬·이력서 등 15개 테이블',
    tables: [
      {
        name: 'user_profiles', label: '사용자 프로필', rowCount: 48213,
        columns: ['user_id', '거주지', '경력', '현재연봉', '이직의향', '완성도'],
        rows: [
          { user_id: 'u_10241', 거주지: '서울 강남', 경력: '5년', 현재연봉: '5,800만', 이직의향: 'active', 완성도: '92%' },
          { user_id: 'u_10242', 거주지: '경기 성남', 경력: '8년', 현재연봉: '7,200만', 이직의향: 'passive', 완성도: '78%' },
          { user_id: 'u_10243', 거주지: '서울 마포', 경력: '3년', 현재연봉: '4,400만', 이직의향: 'active', 완성도: '85%' },
          { user_id: 'u_10244', 거주지: '부산 해운대', 경력: '11년', 현재연봉: '9,500만', 이직의향: 'inactive', 완성도: '64%' },
          { user_id: 'u_10245', 거주지: '서울 송파', 경력: '2년', 현재연봉: '3,900만', 이직의향: 'active', 완성도: '88%' },
        ],
      },
      {
        name: 'business_cards', label: '명함 이력', rowCount: 131204, isNew: true,
        columns: ['명함id', 'user_id', '회사명', '직군', '상태'],
        rows: [
          { 명함id: 'bc_88201', user_id: 'u_10241', 회사명: '토스', 직군: '개발', 상태: '재직' },
          { 명함id: 'bc_88202', user_id: 'u_10241', 회사명: '네이버', 직군: '개발', 상태: '이직' },
          { 명함id: 'bc_88203', user_id: 'u_10242', 회사명: '카카오', 직군: '기획', 상태: '재직' },
        ],
      },
      { name: 'user_preferences', label: '사용자 선호조건', rowCount: 41880 },
      { name: 'skills', label: '스킬 마스터', rowCount: 1842 },
      { name: 'user_skills', label: '사용자 스킬', rowCount: 287310 },
      { name: 'user_careers', label: '사용자 경력 상세', rowCount: 158920 },
      { name: 'user_educations', label: '사용자 학력', rowCount: 52040 },
      { name: 'user_resumes', label: '사용자 이력서', rowCount: 38110 },
      { name: 'user_certificates', label: '사용자 자격증', rowCount: 64200, isNew: true },
      { name: 'user_languages', label: '사용자 언어능력', rowCount: 71030, isNew: true },
      { name: 'user_projects', label: '사용자 프로젝트', rowCount: 49920, isNew: true },
      { name: 'user_portfolios', label: '사용자 포트폴리오', rowCount: 30240, isNew: true },
      { name: 'career_goals', label: '커리어 목표', rowCount: 33180, isNew: true },
      { name: 'job_readiness', label: '이직 준비 상태', rowCount: 33180, isNew: true },
      { name: 'user_activities', label: '사용자 활동/포인트', rowCount: 902331, isNew: true },
    ],
  },
  {
    key: 'job', name: '채용 공고', icon: '📋', color: 'sky',
    desc: '회사·직무·공고·지원 등 7개 테이블',
    tables: [
      {
        name: 'job_postings', label: '채용공고', rowCount: 3180,
        columns: ['공고id', '회사', '직무', '근무형태', '연봉', '상태'],
        rows: [
          { 공고id: 'jp_2001', 회사: '토스', 직무: '백엔드 엔지니어', 근무형태: 'hybrid', 연봉: '6,000~9,000만', 상태: '진행중' },
          { 공고id: 'jp_2002', 회사: '쿠팡', 직무: '프로덕트 매니저', 근무형태: 'onsite', 연봉: '7,000~1억', 상태: '진행중' },
          { 공고id: 'jp_2003', 회사: '당근', 직무: 'iOS 개발자', 근무형태: 'remote', 연봉: '5,500~8,000만', 상태: '마감임박' },
          { 공고id: 'jp_2004', 회사: '카카오페이', 직무: '데이터 분석가', 근무형태: 'hybrid', 연봉: '5,800~8,500만', 상태: '진행중' },
        ],
      },
      {
        name: 'applications', label: '지원 이력', rowCount: 89220,
        columns: ['지원id', 'user_id', '공고', '전형상태', '입사'],
        rows: [
          { 지원id: 'ap_5501', user_id: 'u_10241', 공고: '토스 백엔드', 전형상태: 'interview_2', 입사: 'no' },
          { 지원id: 'ap_5502', user_id: 'u_10243', 공고: '당근 iOS', 전형상태: 'offer', 입사: 'no' },
          { 지원id: 'ap_5503', user_id: 'u_10245', 공고: '쿠팡 PM', 전형상태: 'rejected', 입사: 'no' },
        ],
      },
      { name: 'companies', label: '회사', rowCount: 12840 },
      { name: 'job_roles', label: '직무 마스터', rowCount: 642 },
      { name: 'job_role_mappings', label: '직무명 매핑', rowCount: 4210 },
      { name: 'posting_skills', label: '공고 요구 스킬', rowCount: 28900 },
      { name: 'job_views', label: '공고 조회 이력', rowCount: 1204330 },
    ],
  },
  {
    key: 'rec', name: '추천 시스템', icon: '🤖', color: 'blue',
    desc: '추천 모델·점수·실험·로그 등 9개 테이블',
    tables: [
      {
        name: 'recommendations', label: '추천 결과', rowCount: 912440,
        columns: ['추천id', 'user_id', '공고', '추천점수', '모델버전'],
        rows: [
          { 추천id: 'rc_99001', user_id: 'u_10241', 공고: '토스 백엔드', 추천점수: '0.91', 모델버전: 'hybrid-v3.2' },
          { 추천id: 'rc_99002', user_id: 'u_10242', 공고: '카카오 기획', 추천점수: '0.86', 모델버전: 'hybrid-v3.2' },
          { 추천id: 'rc_99003', user_id: 'u_10245', 공고: '당근 iOS', 추천점수: '0.83', 모델버전: 'cf-v2.8' },
        ],
      },
      {
        name: 'recommend_scores', label: '추천 점수 항목', rowCount: 4562200,
        columns: ['항목', '원점수', '가중치', '최종점수'],
        rows: [
          { 항목: '스킬매칭', 원점수: '0.88', 가중치: '0.35', 최종점수: '0.308' },
          { 항목: '경력매칭', 원점수: '0.92', 가중치: '0.25', 최종점수: '0.230' },
          { 항목: '네트워크', 원점수: '0.79', 가중치: '0.20', 최종점수: '0.158' },
          { 항목: '연봉매칭', 원점수: '0.85', 가중치: '0.20', 최종점수: '0.170' },
        ],
      },
      { name: 'recommend_models', label: '추천 모델', rowCount: 14 },
      { name: 'recommend_feedback', label: '추천 피드백', rowCount: 142090 },
      { name: 'feature_snapshots', label: '피처 스냅샷', rowCount: 912440 },
      { name: 'experiments', label: '실험(A/B)', rowCount: 38 },
      { name: 'experiment_groups', label: '실험 그룹', rowCount: 96 },
      { name: 'model_metrics', label: '모델 성능지표', rowCount: 520 },
      { name: 'behavior_logs', label: '행동 로그', rowCount: 8842100 },
    ],
  },
  {
    key: 'admin', name: '관리자/기업', icon: '🏢', color: 'amber',
    desc: '관리자 권한·메뉴·기업담당자 등 7개 테이블',
    tables: [
      {
        name: 'admin_accounts', label: '관리자 계정', rowCount: 24,
        columns: ['admin_id', '이름', '이메일', '권한', '2FA', '상태'],
        rows: [
          { admin_id: 'adm_01', 이름: '김운영', 이메일: 'ops@jobrec.io', 권한: 'super_admin', '2FA': 'on', 상태: 'active' },
          { admin_id: 'adm_02', 이름: '이심사', 이메일: 'review@jobrec.io', 권한: 'content_admin', '2FA': 'on', 상태: 'active' },
          { admin_id: 'adm_03', 이름: '박정산', 이메일: 'billing@jobrec.io', 권한: 'billing_admin', '2FA': 'off', 상태: 'locked' },
        ],
      },
      { name: 'admin_roles', label: '관리자 권한', rowCount: 6 },
      { name: 'admin_menus', label: '관리자 메뉴', rowCount: 42 },
      { name: 'admin_permissions', label: '메뉴별 권한', rowCount: 252 },
      {
        name: 'company_managers', label: '기업 담당자', rowCount: 1840,
        columns: ['manager_id', '회사', '이름', '담당', '상태'],
        rows: [
          { manager_id: 'mgr_201', 회사: '토스', 이름: '정채용', 담당: '개발 리크루팅', 상태: 'active' },
          { manager_id: 'mgr_202', 회사: '쿠팡', 이름: '한HR', 담당: 'PM 리크루팅', 상태: 'active' },
        ],
      },
      { name: 'manager_permissions', label: '담당자 권한', rowCount: 1840 },
      { name: 'company_offers', label: '기업 제안', rowCount: 6420 },
    ],
  },
  {
    key: 'billing', name: '결제/정산', icon: '💳', color: 'green',
    desc: '요금제·구독·청구·정산 등 12개 테이블',
    tables: [
      {
        name: 'subscriptions', label: '구독', rowCount: 1240,
        columns: ['구독id', '회사', '요금제', '종료일', '상태'],
        rows: [
          { 구독id: 'sb_701', 회사: '토스', 요금제: 'Enterprise', 종료일: '2026-12-31', 상태: 'active' },
          { 구독id: 'sb_702', 회사: '당근', 요금제: 'Pro', 종료일: '2026-09-30', 상태: 'active' },
          { 구독id: 'sb_703', 회사: '야놀자', 요금제: 'Pro', 종료일: '2026-07-15', 상태: 'past_due' },
        ],
      },
      {
        name: 'payments', label: '결제', rowCount: 18420,
        columns: ['결제id', '회사', '금액', '수단', '상태'],
        rows: [
          { 결제id: 'pm_3301', 회사: '토스', 금액: '₩4,900,000', 수단: '카드', 상태: 'paid' },
          { 결제id: 'pm_3302', 회사: '당근', 금액: '₩990,000', 수단: '계좌이체', 상태: 'paid' },
          { 결제id: 'pm_3303', 회사: '야놀자', 금액: '₩990,000', 수단: '카드', 상태: 'failed' },
        ],
      },
      { name: 'plans', label: '요금제', rowCount: 5 },
      { name: 'contracts', label: '계약', rowCount: 1240 },
      { name: 'payment_methods', label: '결제수단', rowCount: 1980 },
      { name: 'invoices', label: '청구서', rowCount: 22140 },
      { name: 'invoice_items', label: '청구 항목', rowCount: 64800 },
      { name: 'refunds', label: '환불', rowCount: 820 },
      { name: 'tax_invoices', label: '세금계산서', rowCount: 18020 },
      { name: 'success_fees', label: '성공보수', rowCount: 1420 },
      { name: 'settlements', label: '정산', rowCount: 3720 },
      { name: 'credits', label: '크레딧', rowCount: 2410 },
    ],
  },
  {
    key: 'sec', name: '보안/개인정보', icon: '🔒', color: 'pink',
    desc: '약관·동의·접근로그·삭제요청 등 8개 테이블',
    tables: [
      {
        name: 'access_logs', label: '접근 로그', rowCount: 4820110,
        columns: ['log_id', 'user_id', '접근자', '접근항목', '결과'],
        rows: [
          { log_id: 'lg_77001', user_id: 'u_10241', 접근자: 'company_manager', 접근항목: '이력서', 결과: 'allowed' },
          { log_id: 'lg_77002', user_id: 'u_10244', 접근자: 'admin', 접근항목: '연봉정보', 결과: 'masked' },
          { log_id: 'lg_77003', user_id: 'u_10242', 접근자: 'company_manager', 접근항목: '연락처', 결과: 'denied' },
        ],
      },
      {
        name: 'delete_requests', label: '삭제 요청', rowCount: 412,
        columns: ['request_id', 'user_id', '요청유형', '처리상태'],
        rows: [
          { request_id: 'dr_091', user_id: 'u_19920', 요청유형: '계정삭제', 처리상태: 'completed' },
          { request_id: 'dr_092', user_id: 'u_18840', 요청유형: '데이터삭제', 처리상태: 'processing' },
        ],
      },
      { name: 'terms', label: '약관', rowCount: 12 },
      { name: 'consent_history', label: '동의 이력', rowCount: 192040 },
      { name: 'terms_agreements', label: '약관 동의', rowCount: 144060 },
      { name: 'masking_policies', label: '마스킹 정책', rowCount: 28 },
      { name: 'batch_jobs', label: '배치 작업', rowCount: 8420 },
      { name: 'error_logs', label: '에러 로그', rowCount: 23110 },
    ],
  },
  {
    key: 'intel', name: '커리어 인텔리전스', icon: '🧠', color: 'indigo',
    desc: '연봉벤치마크·스킬트렌드·평판 등 6개 테이블',
    tables: [
      {
        name: 'salary_benchmark_v3', label: '연봉 벤치마크', rowCount: 3120,
        columns: ['직무', '경력구간', '중위값', '평균', '출처'],
        rows: [
          { 직무: '백엔드', 경력구간: '3~5년', 중위값: '6,000만', 평균: '6,200만', 출처: '내부+공고' },
          { 직무: 'PM', 경력구간: '5~7년', 중위값: '7,500만', 평균: '7,800만', 출처: '내부' },
          { 직무: '데이터분석', 경력구간: '1~3년', 중위값: '4,800만', 평균: '4,950만', 출처: '공고' },
        ],
      },
      {
        name: 'skill_trends', label: '스킬 트렌드', rowCount: 1842,
        columns: ['스킬', '공고등장', '연봉프리미엄', '방향'],
        rows: [
          { 스킬: 'Kubernetes', 공고등장: '+18%', 연봉프리미엄: '+700만', 방향: '상승' },
          { 스킬: 'LLM/RAG', 공고등장: '+42%', 연봉프리미엄: '+1,200만', 방향: '급상승' },
          { 스킬: 'jQuery', 공고등장: '-12%', 연봉프리미엄: '-300만', 방향: '하락' },
        ],
      },
      { name: 'hiring_trends', label: '채용 트렌드', rowCount: 480 },
      { name: 'skill_gap_analyses', label: '스킬 갭 분석', rowCount: 38210 },
      { name: 'company_reputation_v3', label: '회사 평판', rowCount: 12840 },
      { name: 'career_paths_v3', label: '커리어 경로', rowCount: 9240 },
    ],
  },
  {
    key: 'social', name: '소셜/네트워크', icon: '🤝', color: 'purple',
    desc: '명함첩 연동·인맥·네트워크 신호 등 7개 테이블',
    tables: [
      {
        name: 'remember_imports', label: '리멤버 임포트', rowCount: 18420, isNew: true,
        columns: ['import_id', 'user_id', '명함수', '상태'],
        rows: [
          { import_id: 'ri_4401', user_id: 'u_10241', 명함수: 214, 상태: 'completed' },
          { import_id: 'ri_4402', user_id: 'u_10242', 명함수: 98, 상태: 'completed' },
          { import_id: 'ri_4403', user_id: 'u_10245', 명함수: 167, 상태: 'syncing' },
        ],
      },
      {
        name: 'network_signals', label: '네트워크 신호', rowCount: 421300, isNew: true,
        columns: ['signal_id', 'user_id', '회사', '신호유형', '강도'],
        rows: [
          { signal_id: 'ns_8801', user_id: 'u_10241', 회사: '토스', 신호유형: '인맥밀집', 강도: '0.88' },
          { signal_id: 'ns_8802', user_id: 'u_10241', 회사: '카카오', 신호유형: '레퍼럴가능', 강도: '0.74' },
        ],
      },
      { name: 'social_accounts', label: '소셜 계정', rowCount: 24800 },
      { name: 'user_connections', label: '사용자 인맥', rowCount: 1842300 },
      { name: 'card_exchanges', label: '명함 교환', rowCount: 312400 },
      { name: 'linkedin_imports', label: '링크드인 임포트', rowCount: 9240 },
      { name: 'connection_suggestions', label: '인맥 추천', rowCount: 88200 },
    ],
  },
  {
    key: 'notify', name: '알림/개인화', icon: '🔔', color: 'fuchsia',
    desc: '알림 템플릿·발송·세그먼트 등 6개 테이블',
    tables: [
      {
        name: 'notif_history', label: '알림 발송 이력', rowCount: 3204110,
        columns: ['notif_id', 'user_id', '채널', '상태'],
        rows: [
          { notif_id: 'nt_5501', user_id: 'u_10241', 채널: 'push', 상태: 'opened' },
          { notif_id: 'nt_5502', user_id: 'u_10242', 채널: 'email', 상태: 'sent' },
          { notif_id: 'nt_5503', user_id: 'u_10245', 채널: 'push', 상태: 'failed' },
        ],
      },
      {
        name: 'user_segments', label: '사용자 세그먼트', rowCount: 48213,
        columns: ['segment_id', 'user_id', '이직의향', '활동', '준비도'],
        rows: [
          { segment_id: 'sg_01', user_id: 'u_10241', 이직의향: '적극', 활동: '고활동', 준비도: 88 },
          { segment_id: 'sg_02', user_id: 'u_10244', 이직의향: '소극', 활동: '저활동', 준비도: 41 },
        ],
      },
      { name: 'notif_templates', label: '알림 템플릿', rowCount: 64 },
      { name: 'notif_preferences', label: '알림 설정', rowCount: 46120 },
      { name: 'optimal_send_times', label: '최적 발송시간', rowCount: 48213 },
      { name: 'channel_fatigue', label: '채널 피로도', rowCount: 48213 },
    ],
  },
]

export const TOTAL_TABLES = DOMAINS.reduce((s, d) => s + d.tables.length, 0)

export function getDomain(key: string): AdminDomain | undefined {
  return DOMAINS.find((d) => d.key === key)
}

// tailwind 색상 매핑 (도메인 color 토큰 → 클래스)
export const COLOR: Record<string, { bg: string; text: string; soft: string; ring: string }> = {
  violet:  { bg: 'bg-violet-600',  text: 'text-violet-600',  soft: 'bg-violet-50',  ring: 'ring-violet-200' },
  sky:     { bg: 'bg-sky-600',     text: 'text-sky-600',     soft: 'bg-sky-50',     ring: 'ring-sky-200' },
  blue:    { bg: 'bg-blue-600',    text: 'text-blue-600',    soft: 'bg-blue-50',    ring: 'ring-blue-200' },
  amber:   { bg: 'bg-amber-600',   text: 'text-amber-600',   soft: 'bg-amber-50',   ring: 'ring-amber-200' },
  green:   { bg: 'bg-emerald-600', text: 'text-emerald-600', soft: 'bg-emerald-50', ring: 'ring-emerald-200' },
  pink:    { bg: 'bg-pink-600',    text: 'text-pink-600',    soft: 'bg-pink-50',    ring: 'ring-pink-200' },
  indigo:  { bg: 'bg-indigo-600',  text: 'text-indigo-600',  soft: 'bg-indigo-50',  ring: 'ring-indigo-200' },
  purple:  { bg: 'bg-purple-600',  text: 'text-purple-600',  soft: 'bg-purple-50',  ring: 'ring-purple-200' },
  fuchsia: { bg: 'bg-fuchsia-600', text: 'text-fuchsia-600', soft: 'bg-fuchsia-50', ring: 'ring-fuchsia-200' },
}
