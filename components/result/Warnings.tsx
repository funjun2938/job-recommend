'use client'

import { AlertTriangle } from 'lucide-react'

interface Props {
  warnings: string[]
}

export function Warnings({ warnings }: Props) {
  if (!warnings.length) return null

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} className="text-amber-500" />
        <h2 className="font-semibold text-amber-800">현실적으로 알아두세요</h2>
      </div>
      <ul className="space-y-2">
        {warnings.map((w, i) => (
          <li key={i} className="text-sm text-amber-700 leading-relaxed flex gap-2">
            <span className="text-amber-400 flex-shrink-0">•</span>
            {w}
          </li>
        ))}
      </ul>
    </div>
  )
}
