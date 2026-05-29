'use client'

import type { Stage1Data, Stage2Data } from '@/lib/types'

interface Props {
  stage1: Stage1Data
  stage2?: { actualSalary: number | string } | null
}

// 시드 벤치마크 데이터 (서버 없이 클라이언트에서 바로 계산)
const BENCHMARKS: Record<string, Record<string, { p25: number; p50: number; p75: number }>> = {
  '개발·엔지니어': {
    '스타트업': { p25: 4500, p50: 5500, p75: 7000 },
    '중소기업': { p25: 3800, p50: 4500, p75: 5500 },
    '중견기업': { p25: 4500, p50: 5500, p75: 7000 },
    '대기업':   { p25: 5500, p50: 6500, p75: 8000 },
    '외국계':   { p25: 7000, p50: 9000, p75: 12000 },
    '공기업':   { p25: 4000, p50: 4800, p75: 5800 },
  },
  '기획·PM': {
    '스타트업': { p25: 4000, p50: 5000, p75: 6500 },
    '대기업':   { p25: 5000, p50: 6000, p75: 7500 },
    '외국계':   { p25: 6000, p50: 8000, p75: 11000 },
  },
  '마케팅·광고': {
    '스타트업': { p25: 3600, p50: 4500, p75: 5500 },
    '대기업':   { p25: 4500, p50: 5500, p75: 7000 },
  },
  '영업·BD': {
    '스타트업': { p25: 4000, p50: 5000, p75: 7000 },
    '대기업':   { p25: 5000, p50: 6500, p75: 9000 },
    '외국계':   { p25: 6000, p50: 8000, p75: 12000 },
  },
  '금융·회계': {
    '대기업':   { p25: 5500, p50: 7000, p75: 9000 },
    '외국계':   { p25: 8000, p50: 12000, p75: 18000 },
  },
}

function getBenchmark(jobCategory: string, companySize: string) {
  return (
    BENCHMARKS[jobCategory]?.[companySize] ??
    BENCHMARKS[jobCategory]?.['대기업'] ??
    { p25: 4000, p50: 5500, p75: 7500 }
  )
}

function formatSalary(v: number) {
  return v >= 10000
    ? `${(v / 10000).toFixed(1)}억`
    : `${(v / 1000).toFixed(0)}천만원`
}

export function SalaryBenchmark({ stage1, stage2 }: Props) {
  const bm = getBenchmark(stage1.jobCategory, stage1.companySize)
  const mySalary = stage2?.actualSalary ? Number(stage2.actualSalary) : null

  // 내 연봉이 전체 범위 중 어디 있는지 퍼센트 계산
  const rangeMin = bm.p25 * 0.8
  const rangeMax = bm.p75 * 1.2
  const rangeWidth = rangeMax - rangeMin

  const toPercent = (v: number) =>
    Math.max(2, Math.min(98, ((v - rangeMin) / rangeWidth) * 100))

  const p25Pct = toPercent(bm.p25)
  const p50Pct = toPercent(bm.p50)
  const p75Pct = toPercent(bm.p75)
  const myPct = mySalary ? toPercent(mySalary) : null

  let myPosition: 'low' | 'mid' | 'high' | null = null
  if (mySalary) {
    if (mySalary < bm.p25) myPosition = 'low'
    else if (mySalary < bm.p75) myPosition = 'mid'
    else myPosition = 'high'
  }

  const positionLabel = {
    low: '시장 하위권 — 인상 여력 큼',
    mid: '시장 중간 수준',
    high: '시장 상위권 — 우량한 조건',
  }

  const positionColor = {
    low: 'text-red-600 bg-red-50',
    mid: 'text-amber-600 bg-amber-50',
    high: 'text-emerald-600 bg-emerald-50',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">💰</span>
        <h2 className="font-semibold text-gray-900">연봉 시장 위치</h2>
        <span className="ml-auto text-xs text-gray-400">{stage1.jobCategory} · {stage1.companySize}</span>
      </div>

      {/* 바 시각화 */}
      <div className="space-y-3">
        <div className="relative h-3 bg-gray-100 rounded-full overflow-visible">
          {/* p25~p75 구간 강조 */}
          <div
            className="absolute top-0 h-full bg-indigo-100 rounded-full"
            style={{ left: `${p25Pct}%`, width: `${p75Pct - p25Pct}%` }}
          />
          {/* p50 중앙선 */}
          <div
            className="absolute top-0 w-0.5 h-full bg-indigo-400"
            style={{ left: `${p50Pct}%` }}
          />
          {/* 내 연봉 마커 */}
          {myPct !== null && (
            <div
              className="absolute -top-1 w-3 h-5 bg-indigo-600 rounded-sm shadow-sm transition-all"
              style={{ left: `${myPct - 1.5}%` }}
            />
          )}
        </div>

        {/* 범례 */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>하위 25%<br />{formatSalary(bm.p25)}</span>
          <span className="text-center text-indigo-600 font-semibold">
            중앙값<br />{formatSalary(bm.p50)}
          </span>
          <span className="text-right">상위 25%<br />{formatSalary(bm.p75)}</span>
        </div>
      </div>

      {/* 내 연봉 포지션 */}
      {mySalary && myPosition && (
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${positionColor[myPosition]}`}>
          <div>
            <p className="text-xs font-medium opacity-70">내 연봉</p>
            <p className="font-bold text-lg">{formatSalary(mySalary)}</p>
          </div>
          <p className="text-xs font-semibold text-right leading-tight max-w-[140px]">
            {positionLabel[myPosition]}
          </p>
        </div>
      )}

      {!mySalary && (
        <p className="text-xs text-gray-400 text-center">
          회사 정보를 입력하면 내 연봉 위치를 확인할 수 있어요
        </p>
      )}
    </div>
  )
}
