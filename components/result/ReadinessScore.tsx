'use client'

import { useEffect, useState } from 'react'
import type { AnalysisResult, Stage1Data, Stage2Data } from '@/lib/types'

interface Props {
  result: AnalysisResult
  stage1: Stage1Data
  stage2?: Stage2Data | null
}

function calcScore(result: AnalysisResult, stage1: Stage1Data, stage2?: Stage2Data | null) {
  let score = 40 // 기본 점수

  // 스킬 입력 수 (최대 +15)
  score += Math.min(stage1.skills.length * 3, 15)

  // 강점 수 (최대 +15)
  score += Math.min((result.strengths?.length ?? 0) * 5, 15)

  // 갭 수에 따라 감점 (최대 -10)
  score -= Math.min((result.gaps?.length ?? 0) * 3, 10)

  // 회사 정보 제공 보너스 (+10)
  if (stage2?.resignationReasons?.length) score += 10

  // NPS 낮으면 이직 준비도 높음 (+5~10)
  if (stage2?.npsScore !== undefined) {
    if (stage2.npsScore <= 4) score += 10
    else if (stage2.npsScore <= 6) score += 5
  }

  // 타임라인: 빠를수록 점수 높음 (+5)
  score += 5

  return Math.max(20, Math.min(95, score))
}

const LABELS: Array<{ min: number; label: string; color: string; desc: string }> = [
  { min: 80, label: '이직 최적기!',    color: 'text-emerald-600', desc: '지금이 가장 좋은 타이밍이에요' },
  { min: 60, label: '준비 양호',        color: 'text-indigo-600',  desc: '조금만 더 준비하면 완벽해요' },
  { min: 40, label: '준비 필요',        color: 'text-amber-600',   desc: '갭을 먼저 채워보세요' },
  { min: 0,  label: '기반 다지는 중',   color: 'text-gray-500',    desc: '경험을 더 쌓고 도전해보세요' },
]

export function ReadinessScore({ result, stage1, stage2 }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const target = calcScore(result, stage1, stage2)

  useEffect(() => {
    let frame: ReturnType<typeof requestAnimationFrame>
    const start = Date.now()
    const duration = 1200

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayed(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    const t = setTimeout(() => { frame = requestAnimationFrame(animate) }, 300)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [target])

  const info = LABELS.find((l) => displayed >= l.min) ?? LABELS[LABELS.length - 1]
  const circumference = 2 * Math.PI * 44
  const dashOffset = circumference - (displayed / 100) * circumference

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎯</span>
        <h2 className="font-semibold text-gray-900">이직 준비도</h2>
      </div>

      <div className="flex items-center gap-5">
        {/* 원형 게이지 */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#EEF2FF" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke={displayed >= 80 ? '#10B981' : displayed >= 60 ? '#4F46E5' : displayed >= 40 ? '#F59E0B' : '#9CA3AF'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-gray-900">{displayed}</span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
        </div>

        {/* 설명 */}
        <div className="flex-1 space-y-2">
          <p className={`font-bold text-base ${info.color}`}>{info.label}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{info.desc}</p>

          {/* 구성 요소 */}
          <div className="space-y-1.5 pt-1">
            {[
              { label: '스킬 완성도', value: Math.min(stage1.skills.length / 5, 1) },
              { label: '강점 명확성', value: Math.min((result.strengths?.length ?? 0) / 4, 1) },
              { label: '이직 의지',   value: stage2?.npsScore != null ? (10 - stage2.npsScore) / 10 : 0.5 },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-20">{label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
