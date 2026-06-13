// ──────────────────────────────────────────────────────────────
// 원클릭 연동 — 링크드인 / 리멤버 / 깃허브 (목업)
//
// 핵심: 어느 외부 시스템에서 연동하든 "우리만의 표준 프로필 규격"
// (JobFit Unified Profile v1)으로 정규화되어 동일한 양식으로 랜딩된다.
// 또한 여러 소스를 추가 연동하면 같은 규격 위에 데이터가 누적·보강된다.
//   - LinkedIn: 경력/직무/인맥
//   - 리멤버:   명함첩 네트워크/커리어 궤적
//   - GitHub:   개발 스킬/활동
// ──────────────────────────────────────────────────────────────

import type { Stage1Data } from './types'

export type Provider = 'linkedin' | 'remember' | 'github'

export interface ProviderMeta {
  key: Provider
  name: string
  tagline: string
  brand: string
}

export const PROVIDERS: ProviderMeta[] = [
  { key: 'linkedin', name: 'LinkedIn', tagline: '경력·직무를 불러와요', brand: '#0A66C2' },
  { key: 'remember', name: '리멤버',   tagline: '명함첩으로 인맥까지', brand: '#2D3FE0' },
  { key: 'github',   name: 'GitHub',   tagline: '개발 활동을 분석해요', brand: '#181717' },
]

// 소스별 기여 (어디서 무엇이 왔는지)
export interface SourceContribution {
  source: Provider
  signals: { label: string; value: string }[]
  mappings: { rawField: string; rawValue: string; field: string; normalized: string }[]
}

// ── 우리 표준 프로필 규격 (JobFit Unified Profile v1) ──────────
export interface UnifiedProfile {
  spec: 'jobfit.unified-profile/v1'
  sources: Provider[]                  // 연동된 소스들 (누적)
  displayName: string
  headline: string

  canonical: {
    jobCategory: string
    seniority: string
    experienceYears: string
    currentCompany: string
    companySize: string
    salaryRange: string
    skills: string[]                   // 소스 합집합
    careerPath: string[]               // 과거 → 현재 궤적 (병합)
  }

  networkReach: { connections: number; companies: number } | null
  contributions: SourceContribution[]  // 소스별 기여 내역
  completeness: number
}

// provider별 단일 소스 데이터
interface ProviderData {
  headline: string
  canonical: UnifiedProfile['canonical']
  networkReach: UnifiedProfile['networkReach']
  contribution: Omit<SourceContribution, 'source'>
  baseCompleteness: number
}

const DATA: Record<Provider, ProviderData> = {
  linkedin: {
    headline: 'Senior Product Manager @ 대기업',
    canonical: {
      jobCategory: '기획·PM',
      seniority: '시니어',
      experienceYears: '5~7년',
      currentCompany: '대기업 (IT 플랫폼)',
      companySize: '대기업',
      salaryRange: '6~7천만원',
      skills: ['프로덕트 기획', '데이터 분석', 'A/B 테스트', '애자일'],
      careerPath: ['스타트업 PM', '중견 IT 기획', '대기업 PO'],
    },
    networkReach: { connections: 842, companies: 31 },
    contribution: {
      signals: [
        { label: 'Headline', value: 'Senior Product Manager' },
        { label: 'Positions', value: '3개 경력 (6.5년)' },
        { label: 'Endorsed Skills', value: 'Product, Analytics, Agile' },
        { label: 'Connections', value: '842명' },
      ],
      mappings: [
        { rawField: 'headline', rawValue: 'Senior Product Manager', field: 'jobCategory + seniority', normalized: '기획·PM · 시니어' },
        { rawField: 'positions[]', rawValue: '3개 경력 6.5년', field: 'experienceYears + careerPath', normalized: '5~7년 · 3개 궤적' },
        { rawField: 'endorsements', rawValue: 'Product/Analytics/Agile', field: 'skills', normalized: '프로덕트 기획 등' },
        { rawField: 'connections', rawValue: '842', field: 'networkReach', normalized: '인맥 842 · 회사 31' },
      ],
    },
    baseCompleteness: 88,
  },
  remember: {
    headline: '영업총괄 · B2B Sales Lead',
    canonical: {
      jobCategory: '영업·BD',
      seniority: '리드',
      experienceYears: '7~10년',
      currentCompany: '중견기업 (B2B SaaS)',
      companySize: '중견기업',
      salaryRange: '7~8천만원',
      skills: ['B2B 세일즈', '파트너십', '협상', '계정 관리'],
      careerPath: ['스타트업 영업', '외국계 SaaS AE', '중견 영업총괄'],
    },
    networkReach: { connections: 1204, companies: 47 },
    contribution: {
      signals: [
        { label: '내 최신 명함', value: '영업총괄 / 중견 SaaS' },
        { label: '명함 이력', value: '3개 회사 (직함 변화)' },
        { label: '보유 명함', value: '214장 · 47개 회사' },
        { label: '인맥 밀집 회사', value: '토스·카카오·쿠팡' },
      ],
      mappings: [
        { rawField: '내 명함.직함', rawValue: '영업총괄', field: 'jobCategory + seniority', normalized: '영업·BD · 리드' },
        { rawField: '명함 이력', rawValue: '3개 회사 직함 변화', field: 'careerPath + experienceYears', normalized: '7~10년 · 3개 궤적' },
        { rawField: '명함첩(214장)', rawValue: '47개 회사 분포', field: 'networkReach', normalized: '인맥 1,204 · 회사 47' },
        { rawField: '명함 회사 규모', rawValue: '중견 SaaS', field: 'companySize', normalized: '중견기업' },
      ],
    },
    baseCompleteness: 92,
  },
  github: {
    headline: 'Backend-leaning Fullstack Engineer',
    canonical: {
      jobCategory: '개발·엔지니어',
      seniority: '미들',
      experienceYears: '3~5년',
      currentCompany: '스타트업 (시리즈 B)',
      companySize: '스타트업',
      salaryRange: '5~6천만원',
      skills: ['TypeScript', 'React', 'Node.js', 'AWS'],
      careerPath: ['SI 개발', '스타트업 백엔드'],
    },
    networkReach: null,
    contribution: {
      signals: [
        { label: 'Top Languages', value: 'TypeScript 41% · Go 22%' },
        { label: 'Public Repos', value: '38개' },
        { label: 'Contributions', value: '최근 1년 1,820' },
        { label: 'Org', value: '스타트업 1곳' },
      ],
      mappings: [
        { rawField: 'languages', rawValue: 'TypeScript/Go/React', field: 'skills', normalized: 'TypeScript 등' },
        { rawField: 'repos.topics', rawValue: 'backend/api/cloud', field: 'jobCategory', normalized: '개발·엔지니어' },
        { rawField: 'contributions', rawValue: '연 1,820 (활발)', field: 'seniority + experienceYears', normalized: '미들 · 3~5년' },
        { rawField: 'orgs', rawValue: '스타트업 1곳', field: 'currentCompany', normalized: '스타트업 (시리즈 B)' },
      ],
    },
    baseCompleteness: 76,
  },
}

const uniq = (arr: string[]) => Array.from(new Set(arr))

/** 단일 소스 연동 → 표준 프로필 */
export function buildUnifiedProfile(provider: Provider): UnifiedProfile {
  const d = DATA[provider]
  return {
    spec: 'jobfit.unified-profile/v1',
    sources: [provider],
    displayName: `${providerMeta(provider).name} 연동 프로필`,
    headline: d.headline,
    canonical: { ...d.canonical, skills: [...d.canonical.skills], careerPath: [...d.canonical.careerPath] },
    networkReach: d.networkReach ? { ...d.networkReach } : null,
    contributions: [{ source: provider, ...d.contribution }],
    completeness: d.baseCompleteness,
  }
}

/**
 * 기존 프로필에 새 소스를 추가 연동해 데이터를 보강.
 * 핵심 정체성(직군/시니어리티 등)은 첫 소스를 유지하고,
 * 스킬·커리어 경로·네트워크는 누적되며 완성도가 올라간다.
 */
export function addSource(base: UnifiedProfile, provider: Provider): UnifiedProfile {
  if (base.sources.includes(provider)) return base
  const d = DATA[provider]

  const networkReach =
    base.networkReach || d.networkReach
      ? {
          connections: (base.networkReach?.connections ?? 0) + (d.networkReach?.connections ?? 0),
          companies: (base.networkReach?.companies ?? 0) + (d.networkReach?.companies ?? 0),
        }
      : null

  return {
    ...base,
    sources: [...base.sources, provider],
    displayName: `${base.sources.length + 1}개 소스 연동 프로필`,
    canonical: {
      ...base.canonical,
      skills: uniq([...base.canonical.skills, ...d.canonical.skills]),
      careerPath: uniq([...base.canonical.careerPath, ...d.canonical.careerPath]),
    },
    networkReach,
    contributions: [...base.contributions, { source: provider, ...d.contribution }],
    completeness: Math.min(99, base.completeness + 7),
  }
}

/** 통합 프로필 → 분석 입력(Stage1) 투영 */
export function toStage1(profile: UnifiedProfile): Stage1Data {
  return {
    jobCategory: profile.canonical.jobCategory,
    experienceYears: profile.canonical.experienceYears,
    salaryRange: profile.canonical.salaryRange,
    skills: [...profile.canonical.skills],
    companySize: profile.canonical.companySize,
  }
}

export function buildProfileFromProvider(provider: Provider): Stage1Data {
  return toStage1(buildUnifiedProfile(provider))
}

export function providerMeta(provider: Provider): ProviderMeta {
  return PROVIDERS.find((p) => p.key === provider)!
}
