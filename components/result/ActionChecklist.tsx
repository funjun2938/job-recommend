'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import type { ActionItem } from '@/lib/types'

const TIMELINE_ORDER = ['이번 주', '2주 내', '1개월 내', '3개월 내']

interface Props {
  actionPlan: ActionItem[]
}

export function ActionChecklist({ actionPlan }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const progress = Math.round((checked.size / actionPlan.length) * 100)

  const sorted = [...actionPlan].sort(
    (a, b) =>
      (TIMELINE_ORDER.indexOf(a.timeline) ?? 99) -
      (TIMELINE_ORDER.indexOf(b.timeline) ?? 99)
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <h2 className="font-semibold text-gray-900">이직 준비 체크리스트</h2>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          progress === 100
            ? 'bg-emerald-100 text-emerald-700'
            : progress > 0
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {checked.size}/{actionPlan.length} 완료
        </span>
      </div>

      {/* 진행 바 */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {progress === 100 && (
        <div className="text-center py-2">
          <p className="text-sm font-bold text-emerald-600">🎉 모든 준비를 마쳤어요! 지금이 이직 적기예요</p>
        </div>
      )}

      {/* 항목 목록 */}
      <div className="space-y-2">
        {sorted.map((item, i) => {
          const originalIdx = actionPlan.indexOf(item)
          const done = checked.has(originalIdx)
          return (
            <button
              key={i}
              onClick={() => toggle(originalIdx)}
              className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all active:scale-[0.99] ${
                done
                  ? 'bg-emerald-50 border border-emerald-100'
                  : 'bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
            >
              {done
                ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Circle      size={20} className="text-gray-300    flex-shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {item.action}
                </p>
                <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  item.timeline === '이번 주'
                    ? 'bg-red-100 text-red-600'
                    : item.timeline === '2주 내'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {item.timeline}
                </span>
              </div>
              <ChevronRight size={14} className={`flex-shrink-0 mt-1 ${done ? 'text-emerald-300' : 'text-gray-300'}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
