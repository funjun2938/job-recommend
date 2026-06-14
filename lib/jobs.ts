/* ──────────────────────────────────────────────
   채용공고 공통 타입 + 사람인 OpenAPI 클라이언트
   ────────────────────────────────────────────── */

import { getCategory } from './categories'

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

/* ── Mock 데이터 (API 키 없을 때 fallback) ──
   대분류 19개 전부. 직군 맥락에 맞는 실제 회사/직무. 비IT는 비IT 회사. */
const MOCK_JOBS: Record<string, JobPosting[]> = {
  '개발·엔지니어': [
    { id: 'dev1', company: '카카오', title: '프론트엔드 개발자 (React)', location: '경기 성남', experience: '경력 3~5년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'dev2', company: '토스', title: 'iOS 개발자 (Swift)', location: '서울 강남', experience: '경력 2년+', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'dev3', company: '당근', title: '백엔드 엔지니어 (Go)', location: '서울 강남', experience: '경력 3년+', salary: '6,000~8,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'dev4', company: '네이버', title: '풀스택 개발자 (Node/React)', location: '경기 성남', experience: '경력 5년+', salary: '7,000만원+', deadline: '2026-09-15', url: '#', source: 'mock' },
    { id: 'dev5', company: '배달의민족', title: 'Android 개발자', location: '서울 송파', experience: '경력 3~6년', salary: '6,000~9,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'dev6', company: '쿠팡', title: 'DevOps / SRE 엔지니어', location: '서울 송파', experience: '경력 4년+', salary: '면접 후 결정', deadline: '2026-08-20', url: '#', source: 'mock' },
    { id: 'dev7', company: '라인', title: '보안 엔지니어', location: '경기 성남', experience: '경력 5년+', salary: '7,000만원+', deadline: '2026-10-31', url: '#', source: 'mock' },
    { id: 'dev8', company: '무신사', title: 'QA 엔지니어 (자동화)', location: '서울 성동', experience: '경력 2~4년', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '데이터·AI': [
    { id: 'data1', company: '네이버', title: '데이터 사이언티스트 (검색)', location: '경기 성남', experience: '경력 3~6년', salary: '6,000~9,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'data2', company: '카카오', title: '머신러닝 엔지니어 (추천)', location: '경기 성남', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-09-30', url: '#', source: 'mock' },
    { id: 'data3', company: '쿠팡', title: '데이터 엔지니어 (Spark)', location: '서울 송파', experience: '경력 4년+', salary: '7,000만원+', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'data4', company: '업스테이지', title: 'AI 리서처 (LLM)', location: '경기 성남', experience: '경력 2~5년', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'data5', company: '토스', title: '데이터 분석가 (프로덕트)', location: '서울 강남', experience: '경력 3년+', salary: '5,500~7,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'data6', company: 'LG AI연구원', title: 'NLP 엔지니어', location: '서울 강서', experience: '경력 3~6년', salary: '6,000~9,000만원', deadline: '2026-10-15', url: '#', source: 'mock' },
    { id: 'data7', company: '스캐터랩', title: 'MLOps 엔지니어', location: '서울 강남', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '기획·PM': [
    { id: 'pm1', company: '카카오', title: '서비스 기획자 (커머스)', location: '경기 성남', experience: '경력 3~5년', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'pm2', company: '쿠팡', title: 'Product Manager (물류)', location: '서울 송파', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-08-20', url: '#', source: 'mock' },
    { id: 'pm3', company: '야놀자', title: '서비스 기획 PM', location: '서울 강남', experience: '경력 2~4년', salary: '4,000~5,500만원', deadline: '2026-09-01', url: '#', source: 'mock' },
    { id: 'pm4', company: '토스', title: '프로덕트 오너 (PO)', location: '서울 강남', experience: '경력 4년+', salary: '6,000~8,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'pm5', company: '당근', title: '그로스 PM', location: '서울 강남', experience: '경력 3~6년', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'pm6', company: '배달의민족', title: '플랫폼 기획자', location: '서울 송파', experience: '경력 3년+', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'pm7', company: '네이버', title: '데이터 PM', location: '경기 성남', experience: '경력 4년+', salary: '5,500~7,500만원', deadline: '2026-10-10', url: '#', source: 'mock' },
  ],
  '디자인·UX': [
    { id: 'ux1', company: '토스', title: '프로덕트 디자이너', location: '서울 강남', experience: '경력 3~6년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'ux2', company: '배달의민족', title: 'UX 디자이너', location: '서울 송파', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-08-25', url: '#', source: 'mock' },
    { id: 'ux3', company: '카카오', title: 'UI 디자이너', location: '경기 성남', experience: '경력 2~4년', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'ux4', company: '무신사', title: 'BX / 브랜드 디자이너', location: '서울 성동', experience: '경력 3년+', salary: '5,000~6,500만원', deadline: '2026-09-15', url: '#', source: 'mock' },
    { id: 'ux5', company: '플러스엑스', title: '브랜드 디자이너 (에이전시)', location: '서울 강남', experience: '경력 2~5년', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'ux6', company: '네이버', title: 'UX 리서처', location: '경기 성남', experience: '경력 3년+', salary: '5,000~7,000만원', deadline: '2026-10-01', url: '#', source: 'mock' },
    { id: 'ux7', company: '당근', title: '디자인 시스템 디자이너', location: '서울 강남', experience: '경력 4년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '마케팅·광고': [
    { id: 'mkt1', company: '무신사', title: '퍼포먼스 마케터', location: '서울 성동', experience: '경력 2~4년', salary: '4,000~5,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mkt2', company: 'CJ제일제당', title: '브랜드 매니저 (BM)', location: '서울 중구', experience: '경력 3~6년', salary: '5,000~7,000만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'mkt3', company: '아모레퍼시픽', title: '디지털 마케터', location: '서울 용산', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mkt4', company: '제일기획', title: '광고 AE', location: '서울 용산', experience: '경력 2~5년', salary: '4,000~6,000만원', deadline: '2026-09-10', url: '#', source: 'mock' },
    { id: 'mkt5', company: '이노션', title: '미디어 플래너', location: '서울 강남', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mkt6', company: '컬리', title: 'CRM 마케터', location: '서울 강남', experience: '경력 2~4년', salary: '4,500~6,000만원', deadline: '2026-08-20', url: '#', source: 'mock' },
    { id: 'mkt7', company: 'LG생활건강', title: 'PR / 홍보 담당', location: '서울 종로', experience: '경력 3~5년', salary: '5,000~6,500만원', deadline: '2026-10-05', url: '#', source: 'mock' },
  ],
  '영업·BD': [
    { id: 'sal1', company: 'Salesforce', title: 'Account Executive (B2B)', location: '서울 강남', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-08-10', url: '#', source: 'mock' },
    { id: 'sal2', company: '삼성전자', title: '해외영업 (반도체)', location: '경기 수원', experience: '경력 3~6년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'sal3', company: 'SAP Korea', title: '솔루션 세일즈 (엔터프라이즈)', location: '서울 강남', experience: '경력 5년+', salary: '면접 후 결정', deadline: '2026-09-30', url: '#', source: 'mock' },
    { id: 'sal4', company: '유한양행', title: '제약 영업 (MR)', location: '서울 동작', experience: '경력 2~5년', salary: '4,000~5,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'sal5', company: 'LG전자', title: 'B2B 기술영업', location: '서울 영등포', experience: '경력 3년+', salary: '5,000~6,500만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'sal6', company: '쿠팡', title: '셀러 BD / 파트너십', location: '서울 송파', experience: '경력 2~4년', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'sal7', company: '야놀자', title: '제휴 BD 매니저', location: '서울 강남', experience: '경력 3년+', salary: '4,500~6,000만원', deadline: '2026-10-15', url: '#', source: 'mock' },
  ],
  '금융·회계': [
    { id: 'fin1', company: '카카오뱅크', title: '재무기획 담당자', location: '경기 성남', experience: '경력 3~5년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'fin2', company: '미래에셋증권', title: '투자심사 / 리스크관리', location: '서울 중구', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'fin3', company: '삼일PwC', title: '회계사 (Audit)', location: '서울 용산', experience: '경력 2~5년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'fin4', company: 'KB국민은행', title: '기업금융 심사역', location: '서울 영등포', experience: '경력 3~6년', salary: '5,500~7,500만원', deadline: '2026-09-20', url: '#', source: 'mock' },
    { id: 'fin5', company: '신한카드', title: '리스크관리 (신용평가)', location: '서울 중구', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'fin6', company: '삼성자산운용', title: 'IR / 재무 담당', location: '서울 서초', experience: '경력 4년+', salary: '6,000~8,000만원', deadline: '2026-10-10', url: '#', source: 'mock' },
    { id: 'fin7', company: '토스증권', title: '세무 담당자', location: '서울 강남', experience: '경력 2~4년', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '인사·HR': [
    { id: 'hr1', company: '삼성전자', title: '인사 담당 (HRM)', location: '경기 수원', experience: '경력 3~5년', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'hr2', company: '토스', title: 'HRBP', location: '서울 강남', experience: '경력 4년+', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'hr3', company: 'LG전자', title: 'HRD (교육기획)', location: '서울 영등포', experience: '경력 3년+', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'hr4', company: '쿠팡', title: '리크루터 (채용)', location: '서울 송파', experience: '경력 2~4년', salary: '4,500~6,000만원', deadline: '2026-09-15', url: '#', source: 'mock' },
    { id: 'hr5', company: 'SK이노베이션', title: '보상 / 평가 담당', location: '서울 종로', experience: '경력 3~6년', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'hr6', company: '머서코리아', title: '보상 컨설턴트 (HR컨설팅)', location: '서울 강남', experience: '경력 3년+', salary: '5,000~7,000만원', deadline: '2026-10-01', url: '#', source: 'mock' },
    { id: 'hr7', company: '카카오', title: '조직문화 담당 (People)', location: '경기 성남', experience: '경력 3년+', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '전략·컨설팅': [
    { id: 'str1', company: 'McKinsey', title: 'Associate (전략 컨설팅)', location: '서울 종로', experience: '경력 2~4년', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'str2', company: 'BCG', title: '컨설턴트', location: '서울 중구', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'str3', company: '삼성', title: '그룹 전략기획', location: '서울 서초', experience: '경력 4~7년', salary: '7,000만원+', deadline: '2026-09-30', url: '#', source: 'mock' },
    { id: 'str4', company: 'Bain & Company', title: 'Associate Consultant', location: '서울 강남', experience: '경력 2~4년', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'str5', company: '딜로이트', title: '딜 어드바이저리 (M&A)', location: '서울 영등포', experience: '경력 3~6년', salary: '6,000~9,000만원', deadline: '2026-10-15', url: '#', source: 'mock' },
    { id: 'str6', company: '현대자동차', title: '신사업 개발 / 전략', location: '서울 서초', experience: '경력 4년+', salary: '6,000~8,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'str7', company: 'IMM인베스트먼트', title: '투자 심사역 (PE)', location: '서울 강남', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-08-20', url: '#', source: 'mock' },
  ],
  '생산·제조': [
    { id: 'mfg1', company: '삼성전자', title: '반도체 공정 엔지니어', location: '경기 화성', experience: '경력 3~6년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mfg2', company: 'SK하이닉스', title: '수율관리 엔지니어', location: '경기 이천', experience: '경력 3년+', salary: '5,500~7,500만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'mfg3', company: 'LG에너지솔루션', title: '품질관리 (QC/QA)', location: '충북 청주', experience: '경력 2~5년', salary: '4,500~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mfg4', company: '삼성SDI', title: '생산기술 / 공정개발', location: '경기 용인', experience: '경력 3~6년', salary: '면접 후 결정', deadline: '2026-09-10', url: '#', source: 'mock' },
    { id: 'mfg5', company: '현대자동차', title: '생산관리', location: '울산', experience: '경력 3년+', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mfg6', company: '포스코', title: '설비 / 보전 엔지니어', location: '경북 포항', experience: '경력 3~6년', salary: '4,500~6,500만원', deadline: '2026-10-05', url: '#', source: 'mock' },
    { id: 'mfg7', company: '포스코퓨처엠', title: '공정기술 (소재)', location: '전남 광양', experience: '경력 2~5년', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '연구·R&D': [
    { id: 'rnd1', company: 'LG화학', title: '소재 연구원 (배터리)', location: '대전 유성', experience: '경력 3~6년', salary: '5,500~7,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'rnd2', company: '삼성종합기술원', title: '선임 연구원', location: '경기 수원', experience: '경력 4년+', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'rnd3', company: '한미약품', title: '신약 연구원', location: '경기 화성', experience: '경력 3~6년', salary: '5,000~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'rnd4', company: '삼성바이오로직스', title: '공정개발 연구원', location: '인천 연수', experience: '경력 2~5년', salary: '5,000~6,500만원', deadline: '2026-09-20', url: '#', source: 'mock' },
    { id: 'rnd5', company: 'SK이노베이션', title: '공정 연구 (화학)', location: '대전 유성', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'rnd6', company: 'ETRI', title: '책임 연구원 (통신)', location: '대전 유성', experience: '경력 5년+', salary: '6,000~8,000만원', deadline: '2026-10-31', url: '#', source: 'mock' },
    { id: 'rnd7', company: '현대차 연구소', title: '회로 / 하드웨어 설계', location: '경기 화성', experience: '경력 3~6년', salary: '5,500~7,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '의료·보건': [
    { id: 'med1', company: '서울아산병원', title: '간호사 (병동)', location: '서울 송파', experience: '경력 무관', salary: '4,000~5,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'med2', company: '삼성서울병원', title: '의료 행정 / 코디네이터', location: '서울 강남', experience: '경력 2~5년', salary: '3,500~5,000만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'med3', company: '셀트리온', title: '임상연구 (CRA)', location: '인천 연수', experience: '경력 2~4년', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'med4', company: '유한양행', title: '약사 (학술 / 메디컬)', location: '서울 동작', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-09-15', url: '#', source: 'mock' },
    { id: 'med5', company: '대웅제약', title: '의료기기 인허가 담당', location: '서울 강남', experience: '경력 3~6년', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'med6', company: '루닛', title: '디지털헬스 기획 (메디컬)', location: '서울 강남', experience: '경력 2~5년', salary: '면접 후 결정', deadline: '2026-10-10', url: '#', source: 'mock' },
    { id: 'med7', company: '세브란스병원', title: '보건관리 / 감염관리', location: '서울 서대문', experience: '경력 3년+', salary: '4,000~5,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '교육': [
    { id: 'edu1', company: '메가스터디', title: '교육과정 기획', location: '서울 서초', experience: '경력 2~5년', salary: '4,000~5,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'edu2', company: '패스트캠퍼스', title: '교육 콘텐츠 기획 (에듀테크)', location: '서울 강남', experience: '경력 2~4년', salary: '4,000~5,500만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'edu3', company: '이투스', title: '입시 / 진학 컨설턴트', location: '서울 서초', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'edu4', company: '클래스101', title: '콘텐츠 PD', location: '서울 강남', experience: '경력 2~5년', salary: '4,000~5,500만원', deadline: '2026-09-20', url: '#', source: 'mock' },
    { id: 'edu5', company: '뤼이드', title: '학습 데이터 분석', location: '서울 강남', experience: '경력 3년+', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'edu6', company: '에듀윌', title: '강의 운영 / LMS', location: '서울 구로', experience: '경력 2~4년', salary: '3,500~5,000만원', deadline: '2026-10-05', url: '#', source: 'mock' },
    { id: 'edu7', company: '한국교육개발원', title: '교육 정책 연구원', location: '충북 진천', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '법무': [
    { id: 'law1', company: '김앤장', title: '변호사 (송무)', location: '서울 종로', experience: '경력 2~6년', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'law2', company: '광장', title: '변호사 (M&A 자문)', location: '서울 중구', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'law3', company: '삼성전자', title: '사내변호사 (법무팀)', location: '경기 수원', experience: '경력 3~6년', salary: '7,000만원+', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'law4', company: '쿠팡', title: '컴플라이언스 담당', location: '서울 송파', experience: '경력 3년+', salary: '6,000~8,000만원', deadline: '2026-09-15', url: '#', source: 'mock' },
    { id: 'law5', company: '네이버', title: '개인정보보호 담당 (법무)', location: '경기 성남', experience: '경력 3~5년', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'law6', company: '태평양', title: '특허 / IP 전문위원', location: '서울 강남', experience: '경력 4년+', salary: '면접 후 결정', deadline: '2026-10-20', url: '#', source: 'mock' },
    { id: 'law7', company: '로앤컴퍼니', title: '리걸 오퍼레이션 (리걸테크)', location: '서울 강남', experience: '경력 2~5년', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '미디어·콘텐츠': [
    { id: 'mda1', company: '네이버웹툰', title: '콘텐츠 기획 (IP)', location: '경기 성남', experience: '경력 3년+', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mda2', company: 'CJ ENM', title: '편성 / 콘텐츠 PD', location: '서울 마포', experience: '경력 3~6년', salary: '면접 후 결정', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'mda3', company: '카카오엔터', title: 'IP 사업 기획', location: '경기 성남', experience: '경력 3년+', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mda4', company: '티빙', title: '콘텐츠 큐레이션 / 운영', location: '서울 마포', experience: '경력 2~4년', salary: '4,000~5,500만원', deadline: '2026-09-10', url: '#', source: 'mock' },
    { id: 'mda5', company: 'SBS', title: '방송 PD', location: '서울 양천', experience: '경력 무관', salary: '면접 후 결정', deadline: '2026-10-15', url: '#', source: 'mock' },
    { id: 'mda6', company: '샌드박스', title: '영상 편집 / 콘텐츠 PD (유튜브)', location: '서울 영등포', experience: '경력 1~4년', salary: '3,500~5,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'mda7', company: '왓챠', title: '작가 / 에디터', location: '서울 강남', experience: '경력 2~5년', salary: '4,000~5,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '고객·CS': [
    { id: 'cs1', company: '토스', title: 'CX 매니저', location: '서울 강남', experience: '경력 3년+', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'cs2', company: '쿠팡', title: 'CS 운영 매니저', location: '서울 송파', experience: '경력 2~5년', salary: '4,000~5,500만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'cs3', company: '배달의민족', title: 'CX 기획 / VOC 분석', location: '서울 송파', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'cs4', company: '컬리', title: '고객 경험 운영', location: '서울 강남', experience: '경력 2~4년', salary: '3,800~5,200만원', deadline: '2026-09-20', url: '#', source: 'mock' },
    { id: 'cs5', company: '현대카드', title: '고객 관리 / CS 기획', location: '서울 영등포', experience: '경력 3년+', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'cs6', company: 'SK텔레콤', title: '컨택센터 운영 관리', location: '서울 중구', experience: '경력 3~6년', salary: '면접 후 결정', deadline: '2026-10-10', url: '#', source: 'mock' },
    { id: 'cs7', company: '무신사', title: '커뮤니티 / CS 운영', location: '서울 성동', experience: '경력 1~4년', salary: '3,500~5,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '물류·SCM': [
    { id: 'scm1', company: '쿠팡', title: 'SCM 매니저 (풀필먼트)', location: '서울 송파', experience: '경력 3년+', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'scm2', company: 'CJ대한통운', title: '물류 기획 / TMS 운영', location: '서울 중구', experience: '경력 2~5년', salary: '4,500~6,000만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'scm3', company: '삼성전자', title: '구매 / 소싱 담당', location: '경기 수원', experience: '경력 3~6년', salary: '5,000~6,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'scm4', company: '컬리', title: 'SCM 기획 (수요예측)', location: '서울 강남', experience: '경력 3년+', salary: '면접 후 결정', deadline: '2026-09-15', url: '#', source: 'mock' },
    { id: 'scm5', company: 'LG전자', title: '공급망 기획 (글로벌)', location: '서울 영등포', experience: '경력 4년+', salary: '5,500~7,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'scm6', company: '판토스', title: '국제물류 / 포워딩', location: '서울 중구', experience: '경력 2~5년', salary: '4,000~5,500만원', deadline: '2026-10-05', url: '#', source: 'mock' },
    { id: 'scm7', company: '이마트', title: '재고 / 창고관리 기획', location: '경기 용인', experience: '경력 3년+', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '건설·부동산': [
    { id: 'con1', company: '삼성물산', title: '공사관리 / 현장 엔지니어', location: '서울 강동', experience: '경력 3~6년', salary: '5,500~7,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'con2', company: '현대건설', title: '시공 관리 (토목)', location: '서울 종로', experience: '경력 3년+', salary: '5,000~7,000만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'con3', company: 'GS건설', title: '안전관리자', location: '경기 과천', experience: '경력 2~5년', salary: '4,500~6,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'con4', company: 'DL이앤씨', title: '건축설계 / 구조설계', location: '서울 종로', experience: '경력 3~6년', salary: '면접 후 결정', deadline: '2026-09-20', url: '#', source: 'mock' },
    { id: 'con5', company: '신세계프라퍼티', title: '부동산 개발 기획', location: '서울 중구', experience: '경력 3년+', salary: '5,500~7,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'con6', company: 'SK디앤디', title: '개발 사업 / PF 금융', location: '서울 종로', experience: '경력 4년+', salary: '면접 후 결정', deadline: '2026-10-15', url: '#', source: 'mock' },
    { id: 'con7', company: '이지스자산운용', title: '부동산 자산운용 / 투자심사', location: '서울 중구', experience: '경력 3~6년', salary: '6,000~8,000만원', deadline: '채용시까지', url: '#', source: 'mock' },
  ],
  '기타': [
    { id: 'etc1', company: '삼성전자', title: '경영지원 / 사업관리', location: '경기 수원', experience: '경력 2~5년', salary: '4,000~5,500만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'etc2', company: 'CJ제일제당', title: '총무 / 운영지원', location: '서울 중구', experience: '경력 2~4년', salary: '3,800~5,000만원', deadline: '2026-08-31', url: '#', source: 'mock' },
    { id: 'etc3', company: 'LG전자', title: '일반사무 / 사무행정', location: '서울 영등포', experience: '경력 무관', salary: '3,500~4,800만원', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'etc4', company: '신세계', title: '운영 관리', location: '서울 중구', experience: '경력 2~5년', salary: '4,000~5,500만원', deadline: '2026-09-15', url: '#', source: 'mock' },
    { id: 'etc5', company: 'SK', title: '경영기획 지원', location: '서울 종로', experience: '경력 3년+', salary: '면접 후 결정', deadline: '채용시까지', url: '#', source: 'mock' },
    { id: 'etc6', company: '롯데', title: '비서 / 사무지원', location: '서울 송파', experience: '경력 2~4년', salary: '3,500~4,800만원', deadline: '2026-10-10', url: '#', source: 'mock' },
  ],
}

/**
 * 입력 직군(상세/커스텀 포함)을 대분류 label로 해석 후 해당 버킷 반환.
 * 못 찾으면 getCategory가 '기타'(없으면 첫 항목)로 폴백한다.
 */
export function getMockJobs(jobCategory: string): JobPosting[] {
  const label = getCategory(jobCategory).label
  return MOCK_JOBS[label] ?? MOCK_JOBS['기타'] ?? Object.values(MOCK_JOBS)[0]
}
