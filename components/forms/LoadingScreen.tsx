'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const STEPS = [
  '현황 데이터 분석 완료',
  '직군별 시장 현황 검토 중',
  '이직 방향 도출 중',
  '최적 기업군 매칭 중',
]

const TIPS = [
  '💡 연봉 협상 시 시장 중앙값을 기준점으로 제시하세요',
  '💡 이직 시기는 경쟁이 적은 1~2월, 7~8월이 유리해요',
  '💡 스킬보다 "어떤 문제를 해결했는가"를 강조하세요',
  '💡 이직 지원 전 링크드인 프로필을 먼저 정비하세요',
]

interface Props {
  streamText: string
}

export function LoadingScreen({ streamText }: Props) {
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setVisibleSteps(i + 1), i * 900 + 400)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // 스트리밍 텍스트에서 JSON 이전 부분만 미리보기
  const previewText = streamText.replace(/\{[\s\S]*/, '').trim().slice(0, 120)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 space-y-6">

      {/* 스피너 */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xl">🔍</div>
      </div>

      <div className="text-center space-y-1">
        <p className="font-bold text-gray-900">AI가 분석하고 있어요</p>
        <p className="text-xs text-gray-400">잠시만 기다려주세요...</p>
      </div>

      {/* 단계 체크 */}
      <div className="w-full bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3">
        {STEPS.map((step, i) => {
          const done   = visibleSteps > i + 1
          const active = visibleSteps === i + 1
          const pending = visibleSteps <= i
          return (
            <div
              key={step}
              className={`flex items-center gap-3 transition-all duration-500 ${
                pending ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
              }`}
            >
              {done ? (
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
              ) : active ? (
                <div className="w-[18px] h-[18px] rounded-full border-2 border-indigo-500 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                done   ? 'text-gray-400 line-through' :
                active ? 'text-gray-800 font-semibold' :
                         'text-gray-300'
              }`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* 스트리밍 미리보기 */}
      {previewText.length > 20 && (
        <div className="w-full bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
          <p className="text-xs text-indigo-500 font-semibold mb-1">AI 분석 중...</p>
          <p className="text-sm text-indigo-800 leading-relaxed line-clamp-3">
            {previewText}
            <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle" />
          </p>
        </div>
      )}

      {/* 팁 */}
      <div className="w-full bg-amber-50 rounded-2xl border border-amber-100 p-4 transition-all duration-700">
        <p className="text-xs text-amber-700 leading-relaxed">{TIPS[tipIndex]}</p>
      </div>
    </div>
  )
}
