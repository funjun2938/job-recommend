'use client'

interface Props {
  diagnosis: string
  directionType: string
  directionSummary: string
}

const DIRECTION_COLORS: Record<string, string> = {
  상향이직: 'bg-indigo-100 text-indigo-700',
  수평이동: 'bg-blue-100 text-blue-700',
  업종전환: 'bg-amber-100 text-amber-700',
  스타트업전환: 'bg-emerald-100 text-emerald-700',
  대기업이직: 'bg-purple-100 text-purple-700',
}

export function DiagnosisCard({ diagnosis, directionType, directionSummary }: Props) {
  const colorClass = DIRECTION_COLORS[directionType] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">📊</span>
        <h2 className="font-semibold text-gray-900">진단 요약</h2>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
          {directionType}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{diagnosis}</p>
      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-sm text-indigo-800 leading-relaxed">{directionSummary}</p>
      </div>
    </div>
  )
}
