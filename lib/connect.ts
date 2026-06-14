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
// 연동 소스 + 직접 입력
export type Source = Provider | 'manual'

export interface ProviderMeta {
  key: Source
  name: string
  tagline: string
  brand: string
}

// 연동 가능한 외부 소스 (홈/추가연동 버튼)
export const PROVIDERS: ProviderMeta[] = [
  { key: 'linkedin', name: 'LinkedIn', tagline: '경력·직무를 불러와요', brand: '#0A66C2' },
  { key: 'remember', name: '리멤버',   tagline: '명함첩으로 인맥까지', brand: '#2D3FE0' },
  { key: 'github',   name: 'GitHub',   tagline: '개발 활동을 분석해요', brand: '#181717' },
]

const MANUAL_META: ProviderMeta = {
  key: 'manual', name: '직접 입력', tagline: '커리어를 직접 입력했어요', brand: '#475569',
}

// 소스별 기여 (어디서 무엇을 알아냈는지)
export interface SourceContribution {
  source: Source
  summary: string                      // 사용자용 한 줄 요약
  highlights: string[]                 // 이 소스가 알려준 핵심 (자연어)
}

// ── 우리 표준 프로필 규격 (JobFit Unified Profile v1) ──────────
export interface UnifiedProfile {
  spec: 'jobfit.unified-profile/v1'
  sources: Source[]                    // 연동된 소스들 (누적, 직접입력 포함)
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
  // 금융 직군 예시 (비IT)
  linkedin: {
    headline: '재무팀 시니어 매니저 @ 대기업',
    canonical: {
      jobCategory: '재무',
      seniority: '시니어',
      experienceYears: '5~7년',
      currentCompany: '대기업 (제조)',
      companySize: '대기업',
      salaryRange: '6~7천만원',
      skills: ['재무기획', '자금관리', 'IR', '관리회계'],
      careerPath: ['회계법인', '중견기업 재무', '대기업 재무'],
    },
    networkReach: { connections: 642, companies: 28 },
    contribution: {
      summary: '경력과 직무, 인맥을 파악했어요',
      highlights: [
        '대기업 재무 시니어로 6년 경력',
        '회계법인 출신의 재무 커리어 궤적',
        '재무기획·IR·자금관리 역량',
        '업계 인맥 642명',
      ],
    },
    baseCompleteness: 88,
  },
  // 마케팅 직군 예시 (비IT)
  remember: {
    headline: '브랜드 마케팅 리드',
    canonical: {
      jobCategory: '브랜드 마케팅',
      seniority: '리드',
      experienceYears: '7~10년',
      currentCompany: '중견기업 (소비재)',
      companySize: '중견기업',
      salaryRange: '7~8천만원',
      skills: ['브랜드 전략', '캠페인 기획', 'IMC', 'CRM'],
      careerPath: ['광고대행사 AE', '대기업 마케팅', '중견 브랜드 리드'],
    },
    networkReach: { connections: 1204, companies: 47 },
    contribution: {
      summary: '명함첩에서 커리어와 인맥을 찾았어요',
      highlights: [
        '명함 직함 변화로 본 브랜드 마케팅 커리어',
        '명함첩 214장 · 47개 회사 인맥',
        '소비재·광고 업계 인맥 밀집',
        '레퍼럴(지인 추천) 가능성 높은 회사 다수',
      ],
    },
    baseCompleteness: 92,
  },
  // 개발 직군 예시 (GitHub은 본질상 개발)
  github: {
    headline: 'Backend-leaning Fullstack Engineer',
    canonical: {
      jobCategory: '백엔드 개발',
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
      summary: '실제 개발 스킬과 활동량을 분석했어요',
      highlights: [
        'TypeScript·React·Node.js 등 실사용 스킬',
        '최근 1년 기여 1,820건의 활발한 활동',
        '백엔드 중심 풀스택 역량',
        '미들급 엔지니어 수준으로 추정',
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

/**
 * 직접 입력으로 기존 프로필을 보강 (연동과 동일 레벨의 '추가 소스').
 * 핵심 필드(직군·경력·연봉·회사규모)는 **직접 입력을 우선**해 덮어쓰고,
 * 스킬·커리어 경로는 직접입력을 앞세워 누적한다.
 */
export function addManualSource(base: UnifiedProfile, input: ManualCareerInput): UnifiedProfile {
  const cc = input.currentCompany.trim()
  const skills = uniq([...input.skills.filter(Boolean), ...base.canonical.skills])
  const careerPath = cc
    ? uniq([`${cc} (현재)`, ...base.canonical.careerPath])
    : base.canonical.careerPath
  const sources: Source[] = base.sources.includes('manual') ? base.sources : [...base.sources, 'manual']

  const highlights: string[] = [`직군: ${input.jobCategory} · ${input.experienceYears} (직접 입력 우선)`]
  if (cc) highlights.push(`현재 회사: ${cc}`)
  highlights.push(`회사 규모 ${input.companySize} · 연봉대 ${input.salaryRange}`)
  if (input.skills.filter(Boolean).length) highlights.push(`스킬 추가: ${input.skills.filter(Boolean).slice(0, 3).join(', ')}`)

  // 직접입력 기여는 항상 1개만 유지 (재입력 시 갱신)
  const contributions = base.contributions
    .filter((c) => c.source !== 'manual')
    .concat({ source: 'manual', summary: '직접 입력을 우선 반영했어요', highlights })

  return {
    ...base,
    sources,
    displayName: `${sources.length}개 소스 연동 프로필`,
    headline: `${input.jobCategory} · ${input.experienceYears}`,
    // 핵심 필드는 직접 입력이 연동값을 덮어쓴다
    canonical: {
      jobCategory: input.jobCategory,
      seniority: seniorityFromExperience(input.experienceYears),
      experienceYears: input.experienceYears,
      currentCompany: cc || base.canonical.currentCompany,
      companySize: input.companySize,
      salaryRange: input.salaryRange,
      skills,
      careerPath,
    },
    contributions,
    completeness: Math.min(99, base.completeness + 8),
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

export function providerMeta(source: Source): ProviderMeta {
  if (source === 'manual') return MANUAL_META
  return PROVIDERS.find((p) => p.key === source)!
}

// ── 커리어 직접 입력 (연동과 동일한 표준 규격으로 랜딩) ──────────
export interface ManualCareerInput {
  jobCategory: string
  experienceYears: string
  companySize: string
  salaryRange: string
  currentCompany: string
  skills: string[]
}

function seniorityFromExperience(exp: string): string {
  if (exp.includes('신입') || exp.startsWith('1년')) return '주니어'
  if (exp.includes('10') || exp.includes('15')) return '리드'
  if (exp.includes('7') || exp.includes('5~7')) return '시니어'
  if (exp.includes('5')) return '시니어'
  return '미들'
}

export function buildManualProfile(input: ManualCareerInput): UnifiedProfile {
  const company = input.currentCompany.trim() || `${input.companySize} 재직`
  const skills = input.skills.filter(Boolean)
  const filled = [input.jobCategory, input.experienceYears, input.companySize, input.salaryRange, input.currentCompany, skills.length].filter(Boolean).length
  return {
    spec: 'jobfit.unified-profile/v1',
    sources: ['manual'],
    displayName: '직접 입력 프로필',
    headline: `${input.jobCategory} · ${input.experienceYears}`,
    canonical: {
      jobCategory: input.jobCategory,
      seniority: seniorityFromExperience(input.experienceYears),
      experienceYears: input.experienceYears,
      currentCompany: company,
      companySize: input.companySize,
      salaryRange: input.salaryRange,
      skills,
      careerPath: [`${company} (현재)`],
    },
    networkReach: null,
    contributions: [{
      source: 'manual',
      summary: '입력하신 커리어를 정리했어요',
      highlights: [
        `${input.jobCategory} · ${input.experienceYears} 경력`,
        `${input.companySize} 재직 · 희망 연봉대 ${input.salaryRange}`,
        skills.length ? `보유 스킬 ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? ' 등' : ''}` : '스킬은 추가 연동으로 보강 가능',
        '다른 소스를 추가 연동하면 더 정확해져요',
      ].filter(Boolean),
    }],
    completeness: Math.min(72, 40 + filled * 6),
  }
}
