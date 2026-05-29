'use client'

import { Lock, CheckCircle2, ChevronLeft } from 'lucide-react'
import type { Stage1Data } from '@/lib/types'

const PREVIEW_CARDS = [
  { label: '테크 유니콘', score: '92%', blur: false },
  { label: '대형 IT기업', score: '78%', blur: true },
  { label: '외국계 테크', score: '65%', blur: true },
]

interface Props {
  stage1: Stage1Data
  onUnlock: () => void
  onSkip: () => void
  onBack: () => void
}

export function PreviewLockScreen({ stage1, onUnlock, onSkip, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-indigo-500 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <div className="text-3xl mb-2">✨</div>
          <h1 className="text-xl font-bold text-gray-900">분석이 거의 완료됐어요!</h1>
          <p className="text-gray-500 text-sm">
            {stage1.jobCategory} · {stage1.experienceYears} · {stage1.companySize}
          </p>
        </div>

        {/* Blurred Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <div className="p-5 space-y-3">
            {PREVIEW_CARDS.map((card) => (
              <div
                key={card.label}
                className={`flex items-center justify-between p-3 rounded-xl bg-gray-50 ${
                  card.blur ? 'blur-sm select-none' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {card.score}
                  </div>
                  <span className="font-medium text-gray-800">{card.label}</span>
                </div>
                <div className="w-24 h-2 bg-indigo-200 rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: card.score }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Lock Overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <Lock size={22} className="text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">전체 결과 잠금 중</p>
            </div>
          </div>
        </div>

        {/* Unlock CTA */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">
              🔓 전체 결과를 보려면
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              현재 회사 정보를 알려주세요. 실제 연봉, 이직 이유, 회사의 장단점이
              추천의 정확도를 크게 높여줍니다.
            </p>
          </div>

          <div className="space-y-2">
            {[
              '익명으로 처리됩니다',
              '개인 식별 정보 수집 없음',
              '집계 데이터로만 활용됩니다',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>

          <button
            onClick={onUnlock}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-98"
          >
            회사 정보 입력하고 전체 결과 보기 →
          </button>
        </div>

        {/* Skip */}
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            건너뛰기 (기본 추천만 보기)
          </button>
        </div>
      </div>
    </div>
  )
}
