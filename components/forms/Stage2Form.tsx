'use client'

import { ChevronLeft } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { MultiButtonGrid, ButtonGrid } from './ButtonGrid'
import type { Stage2Data } from '@/lib/types'

const JOB_LEVELS = [
  { value: '사원·주임' },
  { value: '대리·선임' },
  { value: '과장·책임' },
  { value: '차부장·수석' },
  { value: '임원+' },
  { value: '스타트업-레벨' },
]

const RESIGNATION_REASONS = [
  { value: '연봉·처우가 낮아서' },
  { value: '성장·배움이 멈춘 느낌' },
  { value: '조직문화가 맞지 않아서' },
  { value: '업무 내용이 맞지 않아서' },
  { value: '경영진을 신뢰하기 어려워서' },
  { value: '회사 비전이 없어 보여서' },
  { value: '워라밸이 너무 안 좋아서' },
  { value: '기타' },
]

const COMPANY_ASPECTS = [
  { value: '안정적인 수입' },
  { value: '좋은 동료' },
  { value: '브랜드·인지도' },
  { value: '업무 자율성' },
  { value: '복지·혜택' },
  { value: '재택·유연근무' },
  { value: '기술적 배움' },
  { value: '직업 안정성' },
]

const NPS_LABELS: Record<number, string> = {
  0: '절대 비추천',
  5: '중립',
  10: '강력 추천',
}

interface Props {
  data: Stage2Data
  onChange: (data: Stage2Data) => void
  onBack: () => void
  onSubmit: () => void
}

const isValid = (data: Stage2Data) => data.jobLevel && data.resignationReasons.length > 0

export function Stage2Form({ data, onChange, onBack, onSubmit }: Props) {
  const set = <K extends keyof Stage2Data>(key: K) =>
    (value: Stage2Data[K]) => onChange({ ...data, [key]: value })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-500 whitespace-nowrap">회사 정보</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-indigo-500 rounded-full" />
          </div>
          <span className="text-sm text-gray-400 whitespace-nowrap">2 / 2</span>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-8 pb-28">
        {/* 회사명 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            지금 다니는 회사 이름이 뭔가요?
          </h2>
          <p className="text-sm text-gray-400 mb-3">선택사항 · 입력하면 추천이 더 정확해져요</p>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => set('companyName')(e.target.value)}
            placeholder="예: 카카오, 삼성전자, (주)OO"
            className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
          />
        </section>

        {/* 직급 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">직급이 어떻게 되세요?</h2>
          <ButtonGrid
            options={JOB_LEVELS}
            value={data.jobLevel}
            onChange={set('jobLevel')}
            columns={3}
          />
        </section>

        {/* 실제 연봉 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            실제로 받고 있는 연봉이 얼마예요?
          </h2>
          <p className="text-sm text-gray-400 mb-3">세전 연봉 · 단위: 만원</p>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={data.actualSalary || ''}
              onChange={(e) => set('actualSalary')(Number(e.target.value))}
              placeholder="4200"
              className="w-full h-12 pl-4 pr-14 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              만원
            </span>
          </div>
          <p className="text-xs text-indigo-600 mt-2">
            💡 이 정보가 업계 실제 연봉 데이터를 만드는 데 가장 중요합니다
          </p>
        </section>

        {/* 이직 이유 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            이직을 고민하는 가장 큰 이유는요?
          </h2>
          <p className="text-sm text-gray-400 mb-3">해당하는 것 모두 선택</p>
          <MultiButtonGrid
            options={RESIGNATION_REASONS}
            value={data.resignationReasons}
            onChange={set('resignationReasons')}
            columns={2}
          />
        </section>

        {/* 회사 장점 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            현재 회사의 좋은 점은요?
          </h2>
          <p className="text-sm text-gray-400 mb-3">최대 3개 선택</p>
          <MultiButtonGrid
            options={COMPANY_ASPECTS}
            value={data.pros}
            onChange={set('pros')}
            columns={2}
            maxSelect={3}
          />
        </section>

        {/* 회사 단점 */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            반대로 안 좋은 점은요?
          </h2>
          <p className="text-sm text-gray-400 mb-3">해당하는 것 선택</p>
          <MultiButtonGrid
            options={COMPANY_ASPECTS}
            value={data.cons}
            onChange={set('cons')}
            columns={2}
          />
        </section>

        {/* 경영진 신뢰도 */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              경영진·리더십을 얼마나 신뢰하세요?
            </h2>
            <span className="text-sm font-bold text-indigo-600">{data.mgmtTrustScore} / 5</span>
          </div>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[data.mgmtTrustScore]}
            onValueChange={(v) => set('mgmtTrustScore')(Array.isArray(v) ? v[0] : v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>전혀 신뢰 안 함</span>
            <span>매우 신뢰</span>
          </div>
        </section>

        {/* 재직 의향 */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              1년 후에도 여기 있을 것 같나요?
            </h2>
            <span className="text-sm font-bold text-indigo-600">{data.stayProbability}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[data.stayProbability]}
            onValueChange={(v) => set('stayProbability')(Array.isArray(v) ? v[0] : v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>지금 당장 나가고 싶다</span>
            <span>계속 다닐 것 같다</span>
          </div>
        </section>

        {/* NPS */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            이 회사를 지인에게 추천하시겠어요?
          </h2>
          <p className="text-sm text-gray-400 mb-3">0 = 절대 비추천, 10 = 강력 추천</p>
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => set('npsScore')(i)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                  data.npsScore === i
                    ? i <= 6
                      ? 'bg-red-500 text-white'
                      : i <= 8
                      ? 'bg-amber-400 text-white'
                      : 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>비추천</span>
            <span>추천</span>
          </div>
        </section>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 pb-safe">
        <div className="max-w-lg mx-auto px-4 py-3">
          <button
            onClick={onSubmit}
            disabled={!isValid(data)}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            ✨ AI 분석 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
