// ──────────────────────────────────────────────────────────────
// GitHub 실연동 — OAuth 토큰으로 프로필을 받아 우리 표준 규격(UnifiedProfile)으로 변환.
// 서버(route handler)에서만 사용. 클라이언트 import 금지.
// ──────────────────────────────────────────────────────────────

import type { UnifiedProfile } from './connect'

const GH_API = 'https://api.github.com'

interface GitHubUser {
  login: string
  name: string | null
  company: string | null
  bio: string | null
  public_repos: number
  followers: number
  created_at: string
}
interface GitHubRepo { language: string | null; fork: boolean }
interface GitHubOrg { login: string }

/** code → access_token 교환 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string | null> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? null
}

async function gh<T>(path: string, token: string): Promise<T | null> {
  const res = await fetch(`${GH_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'jobfit-recommend',
    },
  })
  if (!res.ok) return null
  return (await res.json()) as T
}

// 언어 → 직군/스킬 보정
const LANG_SKILL: Record<string, string> = {
  TypeScript: 'TypeScript', JavaScript: 'JavaScript', Python: 'Python', Java: 'Java',
  Go: 'Go', Kotlin: 'Kotlin', Swift: 'Swift', 'C++': 'C++', C: 'C', 'C#': 'C#',
  Rust: 'Rust', Ruby: 'Ruby', PHP: 'PHP', Scala: 'Scala', Dart: 'Dart', HTML: 'HTML/CSS',
}

function inferRole(langs: string[]): string {
  const has = (l: string) => langs.includes(l)
  if (has('Swift') || has('Kotlin') || has('Dart')) return '모바일 개발'
  if ((has('Python')) && !has('TypeScript') && !has('Java') && !has('Go')) return '데이터·AI'
  if ((has('TypeScript') || has('JavaScript')) && !has('Java') && !has('Go') && !has('Python')) return '프론트엔드 개발'
  return '백엔드 개발'
}

function seniorityOf(repos: number, ageYears: number): { seniority: string; exp: string; salary: string } {
  if (repos >= 30 || ageYears >= 7) return { seniority: '시니어', exp: '7~10년', salary: '6~8천만원' }
  if (repos >= 12 || ageYears >= 4) return { seniority: '미들', exp: '3~5년', salary: '5~6천만원' }
  return { seniority: '주니어', exp: '1~3년', salary: '4~5천만원' }
}

/** GitHub OAuth 토큰으로 표준 프로필 생성 (실연동) */
export async function buildProfileFromGitHub(token: string): Promise<UnifiedProfile | null> {
  const user = await gh<GitHubUser>('/user', token)
  if (!user) return null
  const repos = (await gh<GitHubRepo[]>('/user/repos?per_page=100&sort=pushed', token)) ?? []
  const orgs = (await gh<GitHubOrg[]>('/user/orgs', token)) ?? []

  // 언어 집계 (fork 제외)
  const langCount = new Map<string, number>()
  repos.filter((r) => !r.fork && r.language).forEach((r) => {
    const l = r.language as string
    langCount.set(l, (langCount.get(l) ?? 0) + 1)
  })
  const topLangs = [...langCount.entries()].sort((a, b) => b[1] - a[1]).map(([l]) => l).slice(0, 6)
  const skills = topLangs.map((l) => LANG_SKILL[l] ?? l)

  const ageYears = Math.max(0, (Date.now() - new Date(user.created_at).getTime()) / (365 * 864e5))
  const { seniority, exp, salary } = seniorityOf(user.public_repos, ageYears)
  const jobCategory = inferRole(topLangs)
  const currentCompany = user.company?.replace(/^@/, '') || orgs[0]?.login || '오픈소스/프리랜스'
  const careerPath = [...orgs.slice(0, 2).map((o) => o.login), `${currentCompany} (현재)`]

  const filled = [skills.length, user.public_repos, orgs.length, user.followers].filter(Boolean).length

  return {
    spec: 'jobfit.unified-profile/v1',
    sources: ['github'],
    displayName: `${user.name || user.login} · GitHub`,
    headline: user.bio?.slice(0, 60) || `${jobCategory} · GitHub @${user.login}`,
    canonical: {
      jobCategory,
      seniority,
      experienceYears: exp,
      currentCompany,
      companySize: '스타트업',
      salaryRange: salary,
      skills: skills.length ? skills : ['Git', 'GitHub'],
      careerPath: careerPath.length ? careerPath : ['오픈소스 (현재)'],
    },
    networkReach: user.followers > 0 ? { connections: user.followers, companies: orgs.length } : null,
    contributions: [{
      source: 'github',
      summary: '실제 GitHub 활동을 분석했어요',
      highlights: [
        skills.length ? `주력 언어 ${skills.slice(0, 3).join(', ')}` : '공개 레포 분석',
        `공개 레포 ${user.public_repos}개`,
        `GitHub 활동 ${Math.round(ageYears)}년차`,
        orgs.length ? `소속 조직 ${orgs.length}곳` : `팔로워 ${user.followers}명`,
      ],
    }],
    analysisCategories: [jobCategory],
    completeness: Math.min(95, 55 + filled * 8),
  }
}
