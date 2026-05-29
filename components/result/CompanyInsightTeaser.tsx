'use client'

import { Lock, TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface Props {
  companyName?: string
}

// 실제 데이터가 없을 때 보여주는 "이런 인사이트가 생겨요" 티저
export function CompanyInsightTeaser({ companyName }: Props) {
  if (!companyName) return null

  return (
    <div className="relative rounded-2xl overflow-hidden border border-indigo-100 bg-indigo-50">
      {/* 블러 배경 컨텐츠 */}
      <div className="p-5 space-y-3 blur-sm select-none pointer-events-none">
        <p className="text-sm font-bold text-gray-800">{companyName} 내부 인사이트</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'NPS 평균', value: '4.2', icon: TrendingUp, color: 'text-emerald-600' },
            { label: '재직 의향', value: '38%', icon: TrendingDown, color: 'text-red-500' },
            { label: '경영진 신뢰', value: '3.1', icon: Minus, color: 'text-amber-500' },
            { label: '주요 퇴사 이유', value: '성장 한계', icon: TrendingDown, color: 'text-gray-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Icon size={13} className={color} />
                <p className={`font-bold text-sm ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 잠금 오버레이 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/80 backdrop-blur-[1px] p-5 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <Lock size={18} className="text-indigo-500" />
        </div>
        <p className="font-semibold text-indigo-900 text-sm">
          {companyName} 인사이트 준비 중
        </p>
        <p className="text-xs text-indigo-600 leading-relaxed">
          더 많은 재직자가 정보를 공유할수록<br />
          이 회사의 실제 내부 데이터가 공개돼요
        </p>
        <div className="bg-indigo-100 rounded-lg px-3 py-1.5">
          <p className="text-xs font-bold text-indigo-700">
            지금까지 3명이 기여했어요
          </p>
        </div>
      </div>
    </div>
  )
}
