'use client'

import type { RecommendationCategory } from '@/lib/types'

interface CardProps {
  item: RecommendationCategory
  rank: number
}

function RecommendCard({ item, rank }: CardProps) {
  const scoreColor =
    item.fitScore >= 80
      ? 'text-emerald-600 bg-emerald-50'
      : item.fitScore >= 60
      ? 'text-amber-600 bg-amber-50'
      : 'text-gray-500 bg-gray-50'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-gray-400 font-medium">#{rank}</span>
          <h3 className="font-semibold text-gray-900 mt-0.5">{item.category}</h3>
        </div>
        <span className={`text-lg font-bold px-2.5 py-1 rounded-xl flex-shrink-0 ${scoreColor}`}>
          {item.fitScore}%
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${item.fitScore}%` }}
        />
      </div>

      {/* Companies */}
      <div className="flex flex-wrap gap-1.5">
        {item.companies.map((company) => (
          <span
            key={company}
            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md"
          >
            {company}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{item.reason}</p>
    </div>
  )
}

interface Props {
  recommendations: RecommendationCategory[]
}

export function RecommendGrid({ recommendations }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎯</span>
        <h2 className="font-semibold text-gray-900">추천 기업군</h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {recommendations.map((item, i) => (
          <RecommendCard key={item.category} item={item} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
