import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export const PLANS = {
  free: {
    name: 'Free',
    priceKrw: 0,
    priceId: null,
    features: [
      '이직 분석 월 1회',
      '기본 추천 기업군',
      '갭 분석',
      '액션 플랜',
    ],
    limits: { analysisPerMonth: 1, coverLetter: 0, interview: 0 },
  },
  pro: {
    name: 'Pro',
    priceKrw: 9900,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      '무제한 이직 분석',
      'AI 자기소개서 월 5회',
      'AI 면접 질문 무제한',
      'AI 이력서 빌더',
      '결과 저장 30일',
      '채용 알림 이메일',
      '연봉 시장 상세 분석',
    ],
    limits: { analysisPerMonth: Infinity, coverLetter: 5, interview: Infinity },
    highlight: true,
  },
  team: {
    name: 'Team / B2B',
    priceKrw: 49000,
    priceId: process.env.STRIPE_TEAM_PRICE_ID,
    features: [
      'Pro 모든 기능',
      'B2B HR 이탈 리포트',
      '기업 인사이트 API',
      '팀원 5인 공유',
      '전담 지원',
    ],
    limits: { analysisPerMonth: Infinity, coverLetter: Infinity, interview: Infinity },
  },
} as const

export type PlanKey = keyof typeof PLANS
