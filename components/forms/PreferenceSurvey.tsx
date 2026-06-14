'use client'

import { ButtonGrid, MultiButtonGrid } from './ButtonGrid'
import type { PreferenceData } from '@/lib/types'

const SALARY_OPTIONS = [
  { value: '현재 유지' },
  { value: '4~5천만원' },
  { value: '5~6천만원' },
  { value: '6~8천만원' },
  { value: '8천~1억' },
  { value: '1억+' },
]

const LOCATION_OPTIONS = [
  { value: '서울 강남권' },
  { value: '서울 전역' },
  { value: '수도권' },
  { value: '지방 거점' },
  { value: '재택 우선' },
  { value: '무관' },
]

const WORK_MODE_OPTIONS: { value: PreferenceData['workMode']; label: string }[] = [
  { value: 'onsite', label: '출근' },
  { value: 'hybrid', label: '하이브리드' },
  { value: 'remote', label: '재택 우선' },
  { value: 'any',    label: '무관' },
]

const PRIORITY_OPTIONS = [
  { value: '연봉상승' },
  { value: '성장' },
  { value: '워라밸' },
  { value: '안정성' },
  { value: '조직문화' },
  { value: '커리어전환' },
  { value: '리더십' },
]

const COMPANY_TYPE_OPTIONS = [
  { value: '스타트업' },
  { value: '중견' },
  { value: '대기업' },
  { value: '외국계' },
  { value: '공공' },
  { value: '무관' },
]

const DEALBREAKER_OPTIONS = [
  { value: '잦은 야근' },
  { value: '연봉 동결' },
  { value: '경직된 문화' },
  { value: '지방 근무' },
  { value: '잦은 출장' },
  { value: '주말 근무' },
]

interface Props {
  data: PreferenceData
  onChange: (data: PreferenceData) => void
  onSubmit: () => void
  onBack: () => void
}

const isValid = (d: PreferenceData) =>
  !!d.desiredSalary && !!d.workLocation && d.priorities.length > 0 && !!d.companyType

export function PreferenceSurvey({ data, onChange, onSubmit, onBack }: Props) {
  const set = <K extends keyof PreferenceData>(key: K) =>
    (value: PreferenceData[K]) => onChange({ ...data, [key]: value })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-gray-400 active:text-gray-700 whitespace-nowrap">
            ← 뒤로
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-gray-900">원하는 조건 알려주기</span>
          </div>
          <span className="text-sm text-transparent select-none whitespace-nowrap">← 뒤로</span>
        </div>
      </div>

      {/* Intro */}
      <div className="px-4 pt-5 pb-1">
        <h1 className="font-black text-lg text-gray-900 leading-snug">
          어떤 곳으로 가고 싶으세요?
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          기본 커리어는 이미 받았어요. 이제 원하는 조건만 알려주면 추천이 더 정밀해져요.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 w-full px-4 py-5 space-y-7 pb-32">
        {/* 희망 연봉 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">희망 연봉대는요?</h2>
          <ButtonGrid
            options={SALARY_OPTIONS}
            value={data.desiredSalary}
            onChange={set('desiredSalary')}
            columns={3}
          />
        </section>

        {/* 희망 근무지 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">희망 근무지는요?</h2>
          <ButtonGrid
            options={LOCATION_OPTIONS}
            value={data.workLocation}
            onChange={set('workLocation')}
            columns={3}
          />
        </section>

        {/* 근무 형태 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">선호하는 근무 형태는요?</h2>
          <div className="grid grid-cols-2 gap-2">
            {WORK_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('workMode')(opt.value)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  data.workMode === opt.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* 우선순위 (다중) */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">가장 중요한 건 뭔가요?</h2>
          <p className="text-sm text-gray-500 mb-3">최대 3개까지 골라주세요</p>
          <MultiButtonGrid
            options={PRIORITY_OPTIONS}
            value={data.priorities}
            onChange={set('priorities')}
            columns={3}
            maxSelect={3}
          />
        </section>

        {/* 희망 회사유형 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">어떤 회사를 원하세요?</h2>
          <ButtonGrid
            options={COMPANY_TYPE_OPTIONS}
            value={data.companyType}
            onChange={set('companyType')}
            columns={3}
          />
        </section>

        {/* 기피 조건 (다중) */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">피하고 싶은 조건은요?</h2>
          <p className="text-sm text-gray-500 mb-3">없으면 안 골라도 돼요</p>
          <MultiButtonGrid
            options={DEALBREAKER_OPTIONS}
            value={data.dealbreakers}
            onChange={set('dealbreakers')}
            columns={2}
          />
        </section>

        {/* 이직 동기 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            이직으로 가장 이루고 싶은 건요?
          </h2>
          <p className="text-sm text-gray-500 mb-3">한 줄이면 충분해요 · 선택</p>
          <input
            type="text"
            value={data.motivation}
            onChange={(e) => set('motivation')(e.target.value)}
            placeholder="예: 연봉을 올리면서 성장할 수 있는 곳으로"
            maxLength={60}
            className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none"
          />
        </section>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 pb-safe">
        <div className="max-w-[430px] mx-auto px-4 py-3">
          <button
            onClick={onSubmit}
            disabled={!isValid(data)}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            정밀 추천 받기 →
          </button>
        </div>
      </div>
    </div>
  )
}
