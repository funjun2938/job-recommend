'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, FileText, MessageCircle, Heart, Settings, ChevronRight } from 'lucide-react'
import { getFavorites, type FavoriteCompany } from '@/lib/favorites'

const QUICK_ACTIONS = [
  { href: '/analyze',      icon: TrendingUp,   label: '새 분석', color: 'bg-indigo-50 text-indigo-600' },
  { href: '/cover-letter', icon: FileText,      label: '자기소개서', color: 'bg-purple-50 text-purple-600' },
  { href: '/interview',    icon: MessageCircle, label: '면접 준비', color: 'bg-emerald-50 text-emerald-600' },
  { href: '/favorites',    icon: Heart,         label: '관심기업', color: 'bg-rose-50 text-rose-600' },
]

export default function DashboardPage() {
  const [favs, setFavs] = useState<FavoriteCompany[]>([])

  useEffect(() => {
    setFavs(getFavorites())
  }, [])

  const lastResult = typeof window !== 'undefined'
    ? sessionStorage.getItem('analysisResult')
    : null
  const lastStage1 = typeof window !== 'undefined'
    ? sessionStorage.getItem('stage1Data')
    : null

  const stage1 = lastStage1 ? JSON.parse(lastStage1) : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">이직추천</span>
          </Link>
          <Link href="/settings" className="p-2 text-gray-400">
            <Settings size={18} />
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-10">
        {/* 퀵 액션 */}
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 active:bg-gray-50">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{action.label}</span>
              </Link>
            )
          })}
        </div>

        {/* 마지막 분석 결과 */}
        {lastResult && stage1 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="font-semibold text-gray-900 text-sm">마지막 분석 결과</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-gray-500">{stage1.jobCategory} · {stage1.experienceYears} · {stage1.companySize}</p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {JSON.parse(lastResult).directionType} 방향 추천
              </p>
            </div>
            <Link href="/result"
              className="flex items-center justify-between px-5 py-3 bg-indigo-50 text-indigo-600 border-t border-indigo-100">
              <span className="text-sm font-semibold">결과 다시 보기</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* 관심 기업 */}
        {favs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="font-semibold text-gray-900 text-sm">관심 기업 {favs.length}개</p>
              <Link href="/favorites" className="text-xs text-indigo-600 font-semibold">전체 보기</Link>
            </div>
            <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              {favs.slice(0, 5).map((f) => (
                <div key={f.name}
                  className="flex-shrink-0 bg-rose-50 rounded-xl px-3 py-2 text-center min-w-[72px]">
                  <p className="font-bold text-rose-600 text-base">{f.name[0]}</p>
                  <p className="text-xs text-gray-600 mt-0.5 truncate max-w-[64px]">{f.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 시작 배너 (결과 없을 때) */}
        {!lastResult && (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-center text-white space-y-4">
            <p className="font-black text-xl">이직 분석을 시작해보세요</p>
            <p className="text-indigo-200 text-sm">3분만에 맞춤 기업군과 액션플랜을 받아보세요</p>
            <Link href="/analyze"
              className="flex items-center justify-center gap-2 py-3.5 bg-white text-indigo-600 rounded-2xl font-bold text-sm">
              분석 시작하기 <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
