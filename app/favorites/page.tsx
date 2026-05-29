'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Heart, Trash2, ArrowRight } from 'lucide-react'
import { getFavorites, toggleFavorite, type FavoriteCompany } from '@/lib/favorites'

export default function FavoritesPage() {
  const [favs, setFavs] = useState<FavoriteCompany[]>([])

  useEffect(() => { setFavs(getFavorites()) }, [])

  function remove(name: string) {
    toggleFavorite({ name, category: '', fitScore: 0, savedAt: '' })
    setFavs(getFavorites())
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/result" className="p-2 -ml-2 text-gray-400"><ChevronLeft size={22} /></Link>
          <div className="flex items-center gap-2">
            <Heart size={15} className="text-rose-500 fill-rose-500" />
            <span className="font-bold text-gray-900 text-sm">관심 기업</span>
          </div>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 px-4 py-5 pb-10">
        {favs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <div className="text-5xl">🏢</div>
            <p className="font-semibold text-gray-700">저장된 관심 기업이 없어요</p>
            <p className="text-sm text-gray-400">추천 결과에서 하트를 눌러 기업을 저장하세요</p>
            <Link href="/result" className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
              결과 보기 <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium">{favs.length}개 기업 저장됨</p>
            {favs.map((fav) => (
              <div key={fav.name} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-rose-600">{fav.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{fav.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fav.category} · {fav.fitScore}% 매칭</p>
                </div>
                <button onClick={() => remove(fav.name)} className="p-2 text-gray-300 hover:text-rose-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
