/* ──────────────────────────────────────────────
   채용공고 공통 타입 + 사람인 OpenAPI 클라이언트
   ────────────────────────────────────────────── */

export interface JobPosting {
  id: string
  company: string
  title: string
  location: string
  experience: string
  salary: string
  deadline: string      // "YYYY-MM-DD" or "채용시까지"
  url: string
  source: 'saramin' | 'mock'
}

/* ── 사람인 응답 타입 ── */
interface SaraminJob {
  id: string
  url: string
  'expiration-date'?: string
  'expiration-timestamp'?: string
  'close-type'?: { name: string }
  company: { detail: { name: string } }
  position: {
    title: string
    location: { name: string }
    'job-type': { name: string }
    'experience-level': { name: string; min?: number; max?: number }
    salary?: { name: string }
  }
}

interface SaraminResponse {
  jobs: { job: SaraminJob[] | SaraminJob; total: string }
}

/* ── 직무 → 검색 키워드 매핑 ── */
const JOB_KEYWORDS: Record<string, string> = {
  '개발·엔지니어': '개발자',
  '기획·PM': '서비스기획 PM',
  '마케팅·광고': '마케팅 광고',
  '영업·BD': '영업 BD',
  '디자인·UX': 'UI UX 디자이너',
  '금융·회계': '금융 회계',
  'HR·총무': 'HR 인사',
  '제조·생산': '생산관리 엔지니어',
}

/* ── 사람인 API 호출 ── */
export async function fetchSaraminJobs(
  jobCategory: string,
  count = 8
): Promise<JobPosting[]> {
  const key = process.env.SARAMIN_API_KEY
  if (!key) return []

  const keyword = JOB_KEYWORDS[jobCategory] ?? jobCategory
  const params = new URLSearchParams({
    'access-key': key,
    keywords: keyword,
    job_type: '1',        // 정규직
    count: String(count),
    start: '1',
    sort: 'date',
  })

  const res = await fetch(
    `https://oapi.saramin.co.kr/job-search?${params}`,
    { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }
  )

  if (!res.ok) return []

  const data: SaraminResponse = await res.json()
  const raw = data?.jobs?.job
  if (!raw) return []

  const jobs = Array.isArray(raw) ? raw : [raw]

  return jobs.map((j): JobPosting => {
    const exp = j.position['experience-level']
    let expStr = exp.name
    if (exp.min != null && exp.max != null && exp.min > 0) {
      expStr = `경력 ${exp.min}~${exp.max}년`
    } else if (exp.min != null && exp.min > 0) {
      expStr = `경력 ${exp.min}년+`
    }

    const tsNum = j['expiration-timestamp'] ? Number(j['expiration-timestamp']) : 0
    const deadline =
      j['close-type']?.name === '채용시' || j['close-type']?.name === '채용시까지'
        ? '채용시까지'
        : j['expiration-date'] ??
          (tsNum > 0 ? new Date(tsNum * 1000).toISOString().slice(0, 10) : '미정')

    return {
      id: j.id,
      company: j.company.detail.name,
      title: j.position.title,
      location: j.position.location.name.replace(/&gt;/g, '>'),
      experience: expStr,
      salary: j.position.salary?.name ?? '면접 후 결정',
      deadline,
      url: j.url,
      source: 'saramin',
    }
  })
}

/* ── Mock 데이터 (API 키 없을 때 fallback) ── */
const MOCK_JOBS: Record<string, JobPosting[]> = {
  '개발·엔지니어': [
    { id: 'm1', company: '카카오', title: '프론트엔드 개발자 (React)', location: '경기 성남', experience: '경력 3~5년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'm2', company: '토스', title: 'iOS 개발자', location: '서울 강남', experience: '경력 2년+', salary: '면접 후 결정', deadline: '2025-07-31', url: '#', source: 'mock' },
    { id: 'm3', company: '당근', title: '백엔드 엔지니어 (Golang)', location: '서울 강남', experience: '경력 3년+', salary: '6,000만원+', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'm4', company: '네이버', title: '풀스택 개발자', location: '경기 성남', experience: '경력 5년+', salary: '7,000만원+', deadline: '2025-08-15', url: '#', source: 'mock' },
  ],
  '기획·PM': [
    { id: 'm5', company: '카카오', title: '서비스 기획자 (커머스)', location: '경기 성남', experience: '경력 3~5년', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'm6', company: '쿠팡', title: 'Product Manager', location: '서울 송파', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2025-07-20', url: '#', source: 'mock' },
    { id: 'm7', company: '야놀자', title: '서비스 기획 PM', location: '서울 강남', experience: '경력 2~4년', salary: '4,000~5,500만원', deadline: '2025-08-01', url: '#', source: 'mock' },
  ],
  '마케팅·광고': [
    { id: 'm8', company: '무신사', title: '퍼포먼스 마케터', location: '서울 성동', experience: '경력 2~4년', salary: '4,000~5,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'm9', company: '오늘의집', title: '그로스 마케터', location: '서울 강남', experience: '경력 2년+', salary: '면접 후 결정', deadline: '2025-07-25', url: '#', source: 'mock' },
  ],
  '영업·BD': [
    { id: 'm10', company: 'AWS', title: '기업고객 영업 (Enterprise)', location: '서울 강남', experience: '경력 5년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'm11', company: '세일즈포스', title: 'Account Executive', location: '서울 강남', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2025-08-10', url: '#', source: 'mock' },
  ],
  '금융·회계': [
    { id: 'm12', company: '카카오뱅크', title: '재무기획 담당자', location: '경기 성남', experience: '경력 3~5년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'm13', company: '토스증권', title: '투자심사 / 리스크관리', location: '서울 강남', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2025-07-31', url: '#', source: 'mock' },
  ],
}

export function getMockJobs(jobCategory: string): JobPosting[] {
  return MOCK_JOBS[jobCategory] ?? MOCK_JOBS['개발·엔지니어']
}
