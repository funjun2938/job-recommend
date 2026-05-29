'use client'

import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MonthData {
  month: string
  demand: 'high' | 'mid' | 'low'
  label?: string
}

const CALENDAR: MonthData[] = [
  { month: '1월',  demand: 'high', label: '채용 성수기' },
  { month: '2월',  demand: 'high' },
  { month: '3월',  demand: 'mid' },
  { month: '4월',  demand: 'mid' },
  { month: '5월',  demand: 'mid' },
  { month: '6월',  demand: 'low', label: '비수기 시작' },
  { month: '7월',  demand: 'high', label: '하반기 개막' },
  { month: '8월',  demand: 'high' },
  { month: '9월',  demand: 'mid' },
  { month: '10월', demand: 'mid' },
  { month: '11월', demand: 'low' },
  { month: '12월', demand: 'low', label: '연말 동결' },
]

const CURRENT_MONTH = new Date().getMonth() // 0-indexed

const COLOR: Record<string, string> = {
  high: 'bg-emerald-500',
  mid:  'bg-amber-400',
  low:  'bg-gray-200',
}
const TEXT_COLOR: Record<string, string> = {
  high: 'text-emerald-700',
  mid:  'text-amber-700',
  low:  'text-gray-400',
}

export function JobTimeline() {
  const currentDemand = CALENDAR[CURRENT_MONTH].demand

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-indigo-500" />
        <h2 className="font-semibold text-gray-900">채용 시장 캘린더</h2>
      </div>

      {/* 현재 상태 배너 */}
      <div className={`rounded-xl p-3.5 flex items-center gap-3 ${
        currentDemand === 'high' ? 'bg-emerald-50 border border-emerald-100' :
        currentDemand === 'mid'  ? 'bg-amber-50 border border-amber-100'    :
                                   'bg-gray-50 border border-gray-100'
      }`}>
        {currentDemand === 'high' ? <TrendingUp size={18} className="text-emerald-600" /> :
         currentDemand === 'mid'  ? <Minus      size={18} className="text-amber-600"   /> :
                                    <TrendingDown size={18} className="text-gray-400"  />}
        <div>
          <p className={`font-bold text-sm ${TEXT_COLOR[currentDemand]}`}>
            {currentDemand === 'high' ? '지금이 채용 성수기예요!' :
             currentDemand === 'mid'  ? '채용 보통 시기입니다' :
                                        '채용 비수기 — 다음 성수기 준비할 타이밍'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('ko-KR', { month: 'long' })} 기준
          </p>
        </div>
      </div>

      {/* 월별 히트맵 */}
      <div className="grid grid-cols-6 gap-1.5">
        {CALENDAR.map((m, i) => (
          <div key={m.month} className="flex flex-col items-center gap-1">
            <div className={`w-full h-6 rounded-lg ${COLOR[m.demand]} ${
              i === CURRENT_MONTH ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
            }`} />
            <span className={`text-[10px] font-medium ${
              i === CURRENT_MONTH ? 'text-indigo-600 font-bold' : 'text-gray-400'
            }`}>{m.month}</span>
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex gap-4 justify-center">
        {[
          { color: 'bg-emerald-500', label: '성수기' },
          { color: 'bg-amber-400',   label: '보통' },
          { color: 'bg-gray-200',    label: '비수기' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        일반적으로 1~2월, 7~8월이 채용 공고가 가장 많아요
      </p>
    </div>
  )
}
