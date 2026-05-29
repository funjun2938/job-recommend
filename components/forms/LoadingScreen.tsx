'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

const STEPS = [
  '현황 데이터 분석 완료',
  '직군별 시장 현황 검토 중',
  '이직 방향 도출 중',
  '최적 기업군 매칭 중',
]

interface Props {
  streamText: string
}

export function LoadingScreen({ streamText }: Props) {
  const [visibleSteps, setVisibleSteps] = useState(0)

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setVisibleSteps(i + 1), i * 900 + 400)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const previewText = streamText.replace(/\{[\s\S]*\}/, '').trim().slice(0, 200)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Spinner */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <p className="text-gray-500 text-base font-medium">AI가 분석하고 있어요...</p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          {STEPS.map((step, i) => {
            const done = visibleSteps > i + 1
            const active = visibleSteps === i + 1
            const pending = visibleSteps <= i
            return (
              <div
                key={step}
                className={`flex items-center gap-3 transition-opacity duration-500 ${
                  pending ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {done ? (
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                ) : active ? (
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <Circle size={18} className="text-gray-200 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    done
                      ? 'text-gray-500 line-through'
                      : active
                      ? 'text-gray-800 font-medium'
                      : 'text-gray-300'
                  }`}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        {/* Streaming Preview */}
        {previewText.length > 10 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">{previewText}</p>
            <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-0.5 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  )
}
