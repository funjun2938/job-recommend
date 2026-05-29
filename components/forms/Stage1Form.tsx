'use client'

import { ButtonGrid } from './ButtonGrid'
import { TagInput } from './TagInput'
import type { Stage1Data } from '@/lib/types'

const JOB_CATEGORIES = [
  { value: '개발·엔지니어' },
  { value: '기획·PM' },
  { value: '마케팅·광고' },
  { value: '영업·BD' },
  { value: '디자인·UX' },
  { value: '금융·회계' },
  { value: 'HR·총무' },
  { value: '제조·생산' },
  { value: '기타' },
]

const EXPERIENCE_OPTIONS = [
  { value: '1년 미만' },
  { value: '1~3년' },
  { value: '3~5년' },
  { value: '5~7년' },
  { value: '7~10년' },
  { value: '10년+' },
]

const SALARY_OPTIONS = [
  { value: '~3천만원' },
  { value: '3~4천만원' },
  { value: '4~5천만원' },
  { value: '5~6천만원' },
  { value: '6~8천만원' },
  { value: '8천~1억' },
  { value: '1억+' },
]

const COMPANY_SIZE_OPTIONS = [
  { value: '스타트업' },
  { value: '중소기업' },
  { value: '중견기업' },
  { value: '대기업' },
  { value: '외국계' },
  { value: '공기업' },
]

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  '개발·엔지니어': ['React', 'TypeScript', 'Python', 'Java', 'Spring', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
  '기획·PM': ['프로덕트 기획', 'A/B 테스트', 'SQL', 'Jira', 'Figma', '데이터 분석', 'OKR'],
  '마케팅·광고': ['퍼포먼스 마케팅', 'GA4', 'Meta 광고', '콘텐츠 마케팅', 'SEO', 'CRM', 'SQL'],
  '영업·BD': ['B2B 영업', 'CRM', 'Salesforce', '파트너십', '계약 협상', '영업 전략'],
  '디자인·UX': ['Figma', 'UX 리서치', '프로토타이핑', 'Adobe XD', 'UI 디자인', '사용자 인터뷰'],
  '금융·회계': ['재무분석', 'IFRS', 'Excel', 'SAP', '세무', 'CPA', 'CFA', '리스크 관리'],
  'HR·총무': ['채용', '인사관리', '노무', '조직문화', '성과관리', 'HRD'],
  '제조·생산': ['공정관리', 'QC', '6시그마', 'ERP', 'SAP', '품질관리', 'ISO'],
}

interface Props {
  data: Stage1Data
  onChange: (data: Stage1Data) => void
  onNext: () => void
}

const isValid = (data: Stage1Data) =>
  data.jobCategory && data.experienceYears && data.salaryRange && data.companySize

export function Stage1Form({ data, onChange, onNext }: Props) {
  const set = <K extends keyof Stage1Data>(key: K) =>
    (value: Stage1Data[K]) => onChange({ ...data, [key]: value })

  const suggestions = SKILL_SUGGESTIONS[data.jobCategory] ?? []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-sm text-gray-500 whitespace-nowrap">현황 입력</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-indigo-500 rounded-full transition-all" />
          </div>
          <span className="text-sm text-gray-400 whitespace-nowrap">1 / 2</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-8 pb-28">
        {/* 직무 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            지금 어떤 일 하세요?
          </h2>
          <ButtonGrid
            options={JOB_CATEGORIES}
            value={data.jobCategory}
            onChange={set('jobCategory')}
            columns={2}
          />
        </section>

        {/* 경력 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">경력이 얼마나 되셨나요?</h2>
          <ButtonGrid
            options={EXPERIENCE_OPTIONS}
            value={data.experienceYears}
            onChange={set('experienceYears')}
            columns={3}
          />
        </section>

        {/* 연봉 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">현재 연봉 구간은요?</h2>
          <ButtonGrid
            options={SALARY_OPTIONS}
            value={data.salaryRange}
            onChange={set('salaryRange')}
            columns={3}
          />
        </section>

        {/* 스킬 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            주요 스킬이나 역량을 알려주세요
          </h2>
          <p className="text-sm text-gray-500 mb-3">최대 5개 · 없어도 괜찮아요</p>
          <TagInput
            value={data.skills}
            onChange={set('skills')}
            placeholder="예: React, 영업관리, 재무분석..."
            suggestions={suggestions}
          />
        </section>

        {/* 회사 규모 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">현재 회사 규모는요?</h2>
          <ButtonGrid
            options={COMPANY_SIZE_OPTIONS}
            value={data.companySize}
            onChange={set('companySize')}
            columns={3}
          />
        </section>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 pb-safe">
        <div className="max-w-lg mx-auto px-4 py-3">
          <button
            onClick={onNext}
            disabled={!isValid(data)}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            다음 단계 →
          </button>
        </div>
      </div>
    </div>
  )
}
