'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite, isFavorite } from '@/lib/favorites'
import { toast } from 'sonner'
import type { RecommendationCategory } from '@/lib/types'

interface CardProps {
  item: RecommendationCategory
  rank: number
}

function RecommendCard({ item, rank }: CardProps) {
  const [favored, setFavored] = useState(false)

  useEffect(() => {
    // 대표 기업명(첫 번째)으로 즐겨찾기 확인
    if (item.companies[0]) setFavored(isFavorite(item.companies[0]))
  }, [item.companies])

  function handleFav() {
    if (!item.companies[0]) return
    const added = toggleFavorite({
      name: item.companies[0],
      category: item.category,
      fitScore: item.fitScore,
      savedAt: new Date().toISOString(),
    })
    setFavored(added)
    toast[added ? 'success' : 'info'](
      added ? `${item.companies[0]}을(를) 관심 기업에 저장했어요` : `관심 기업에서 제거했어요`
    )
  }

  const scoreColor =
    item.fitScore >= 80 ? 'text-emerald-600 bg-emerald-50' :
    item.fitScore >= 60 ? 'text-amber-600  bg-amber-50'   :
                          'text-gray-500   bg-gray-50'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <span className="text-xs text-gray-400 font-medium">#{rank}</span>
          <h3 className="font-semibold text-gray-900 mt-0.5">{item.category}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-base font-bold px-2.5 py-1 rounded-xl flex-shrink-0 ${scoreColor}`}>
            {item.fitScore}%
          </span>
          <button
            onClick={handleFav}
            className={`p-1.5 rounded-lg transition-colors ${
              favored
                ? 'text-rose-500 bg-rose-50'
                : 'text-gray-300 hover:text-rose-400 hover:bg-rose-50'
            }`}
          >
            <Heart size={16} className={favored ? 'fill-rose-500' : ''} />
          </button>
        </div>
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
          <span key={company} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
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
