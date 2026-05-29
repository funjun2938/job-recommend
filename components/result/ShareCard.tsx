'use client'

import { useState } from 'react'
import { Share2, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AnalysisResult, Stage1Data } from '@/lib/types'

interface Props {
  result: AnalysisResult
  stage1: Stage1Data | null
}

export function ShareCard({ result, stage1 }: Props) {
  const [copied, setCopied] = useState(false)

  const topRec = result.recommendations?.[0]

  async function handleShare() {
    const url = window.location.href
    const text = `${stage1?.jobCategory ?? '이직'} 분석 결과: ${result.directionType} 방향으로 ${topRec?.category}(${topRec?.fitScore}% 매칭) 추천받았어요!`

    if (navigator.share) {
      await navigator.share({ title: '내 이직 분석 결과', text, url })
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      toast.success('결과가 클립보드에 복사됐어요!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white space-y-4">
      {/* 결과 카드 미리보기 */}
      <div className="space-y-1">
        <p className="text-indigo-200 text-xs font-medium">나의 이직 분석 결과</p>
        <p className="font-bold text-lg leading-snug">
          {stage1?.jobCategory} · {result.directionType}
        </p>
        {topRec && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
              #{1} {topRec.category}
            </span>
            <span className="text-xs font-bold text-emerald-300">
              {topRec.fitScore}% 매칭
            </span>
          </div>
        )}
      </div>

      {/* 추천 미리보기 */}
      <div className="grid grid-cols-2 gap-2">
        {result.recommendations.slice(0, 2).map((rec, i) => (
          <div key={rec.category} className="bg-white/10 rounded-xl p-3 space-y-1">
            <p className="text-xs text-indigo-200">#{i + 1}</p>
            <p className="font-semibold text-sm leading-tight">{rec.category}</p>
            <p className="text-xs font-bold text-emerald-300">{rec.fitScore}%</p>
          </div>
        ))}
      </div>

      {/* 공유 버튼 */}
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm active:opacity-80 transition-opacity"
      >
        {copied
          ? <><CheckCircle2 size={16} /> 복사 완료!</>
          : <><Share2 size={16} /> 결과 공유하기</>
        }
      </button>

      <p className="text-xs text-indigo-300 text-center">
        친구에게 이 서비스를 소개해보세요
      </p>
    </div>
  )
}
