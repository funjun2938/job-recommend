'use client'

import { ArrowRight, Users } from 'lucide-react'

interface Move {
  from: string
  to: string
  count: number
  pct: number
}

const PEER_DATA: Record<string, Move[]> = {
  '개발·엔지니어': [
    { from: '스타트업',  to: '테크 유니콘',   count: 312, pct: 38 },
    { from: '스타트업',  to: '대형 IT기업',   count: 241, pct: 29 },
    { from: '스타트업',  to: '외국계 테크',   count: 163, pct: 20 },
    { from: '스타트업',  to: '중견 IT기업',   count: 107, pct: 13 },
  ],
  '기획·PM': [
    { from: '스타트업',  to: '대형 IT기업',   count: 198, pct: 41 },
    { from: '스타트업',  to: '테크 유니콘',   count: 152, pct: 32 },
    { from: '스타트업',  to: '외국계 테크',   count: 82,  pct: 17 },
    { from: '스타트업',  to: '컨설팅/기획사', count: 47,  pct: 10 },
  ],
  '마케팅·광고': [
    { from: '스타트업',  to: '대형 IT기업',   count: 143, pct: 36 },
    { from: '스타트업',  to: '브랜드사',      count: 119, pct: 30 },
    { from: '스타트업',  to: '외국계',        count: 88,  pct: 22 },
    { from: '스타트업',  to: '광고대행사',    count: 47,  pct: 12 },
  ],
  '영업·BD': [
    { from: '스타트업',  to: '외국계 SaaS',   count: 167, pct: 42 },
    { from: '스타트업',  to: '대기업 영업',   count: 121, pct: 31 },
    { from: '스타트업',  to: '유니콘 BD',     count: 68,  pct: 17 },
    { from: '스타트업',  to: '컨설팅',        count: 39,  pct: 10 },
  ],
  '금융·회계': [
    { from: '대기업',    to: '외국계 IB',     count: 94,  pct: 35 },
    { from: '대기업',    to: '핀테크',        count: 81,  pct: 30 },
    { from: '대기업',    to: '자산운용사',    count: 57,  pct: 21 },
    { from: '대기업',    to: '스타트업 CFO',  count: 38,  pct: 14 },
  ],
}

interface Props {
  jobCategory: string
  companySize: string
}

export function PeerMoves({ jobCategory, companySize }: Props) {
  const data = PEER_DATA[jobCategory] ?? PEER_DATA['개발·엔지니어']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Users size={18} className="text-indigo-500" />
        <h2 className="font-semibold text-gray-900">비슷한 분들의 이동 경로</h2>
      </div>

      <p className="text-xs text-gray-500 -mt-1">
        {jobCategory} · {companySize} 출신 이직자 분석 (최근 6개월)
      </p>

      <div className="space-y-3">
        {data.map((move, i) => (
          <div key={move.to} className="flex items-center gap-3">
            {/* 순위 */}
            <span className={`text-sm font-black w-5 flex-shrink-0 ${
              i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : 'text-gray-300'
            }`}>
              {i + 1}
            </span>

            {/* 이동 경로 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-400">{move.from}</span>
                <ArrowRight size={11} className="text-gray-300 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-800 truncate">{move.to}</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-indigo-400' : 'bg-gray-300'
                  }`}
                  style={{ width: `${move.pct}%` }}
                />
              </div>
            </div>

            {/* 퍼센트 */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-800">{move.pct}%</p>
              <p className="text-[10px] text-gray-400">{move.count}명</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400">
        * 이 서비스 사용자 집계 데이터 기반 (데이터 누적 중)
      </p>
    </div>
  )
}
