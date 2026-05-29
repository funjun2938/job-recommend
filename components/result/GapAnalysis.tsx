'use client'

import { CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  strengths: string[]
  gaps: string[]
}

export function GapAnalysis({ strengths, gaps }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <h2 className="font-semibold text-gray-900">갭 분석</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">강점</p>
          {strengths.map((s) => (
            <div key={s} className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{s}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">보완 포인트</p>
          {gaps.map((g) => (
            <div key={g} className="flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{g}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
