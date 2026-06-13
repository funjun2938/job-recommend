// ──────────────────────────────────────────────────────────────
// 원클릭 연동 — 링크드인 / 리멤버 / 깃허브 (목업)
// 버튼을 누르면 더미 프로필을 생성해 즉시 이직 추천으로 연결한다.
// 실제 OAuth 연동은 차치하고(연동된다고 가정), 연동 결과를 합성한다.
// ──────────────────────────────────────────────────────────────

import type { Stage1Data } from './types'

export type Provider = 'linkedin' | 'remember' | 'github'

export interface ProviderMeta {
  key: Provider
  name: string
  tagline: string       // 버튼 아래 한 줄
  brand: string         // 브랜드 컬러 (hex)
}

export const PROVIDERS: ProviderMeta[] = [
  { key: 'linkedin', name: 'LinkedIn', tagline: '경력·직무를 불러와요', brand: '#0A66C2' },
  { key: 'remember', name: '리멤버',   tagline: '명함첩으로 인맥까지', brand: '#2D3FE0' },
  { key: 'github',   name: 'GitHub',   tagline: '개발 활동을 분석해요', brand: '#181717' },
]

// 연동 시 합성되는 더미 프로필 (원클릭 추천의 시드)
const PROFILE: Record<Provider, Stage1Data> = {
  linkedin: {
    jobCategory: '기획·PM',
    experienceYears: '5~7년',
    salaryRange: '6~7천만원',
    skills: ['프로덕트 기획', '데이터 분석', 'A/B 테스트', '애자일'],
    companySize: '대기업',
  },
  remember: {
    jobCategory: '영업·BD',
    experienceYears: '7~10년',
    salaryRange: '7~8천만원',
    skills: ['B2B 세일즈', '파트너십', '협상', '계정 관리'],
    companySize: '중견기업',
  },
  github: {
    jobCategory: '개발·엔지니어',
    experienceYears: '3~5년',
    salaryRange: '5~6천만원',
    skills: ['TypeScript', 'React', 'Node.js', 'AWS'],
    companySize: '스타트업',
  },
}

export function buildProfileFromProvider(provider: Provider): Stage1Data {
  return { ...PROFILE[provider], skills: [...PROFILE[provider].skills] }
}

export function providerMeta(provider: Provider): ProviderMeta {
  return PROVIDERS.find((p) => p.key === provider)!
}
