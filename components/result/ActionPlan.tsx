'use client'

import type { ActionItem } from '@/lib/types'

interface Props {
  actionPlan: ActionItem[]
}

const TIMELINE_COLORS = [
  'bg-indigo-500',
  'bg-indigo-400',
  'bg-indigo-300',
]

export function ActionPlan({ actionPlan }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h2 className="font-semibold text-gray-900">지금 당장 해야 할 것들</h2>
      </div>
      <div className="space-y-3">
        {actionPlan.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                  TIMELINE_COLORS[i] ?? 'bg-gray-300'
                }`}
              >
                {i + 1}
              </div>
              {i < actionPlan.length - 1 && (
                <div className="w-px flex-1 bg-gray-100 mt-1" />
              )}
            </div>
            <div className="pb-3">
              <p className="text-sm font-medium text-gray-800">{item.action}</p>
              <span className="text-xs text-indigo-600 font-medium">{item.timeline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
