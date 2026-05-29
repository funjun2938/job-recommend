'use client'

interface Props {
  current: 1 | 2
}

const STEPS = [
  { label: '현황 입력', sub: '직무·경력·스킬' },
  { label: '회사 정보', sub: '연봉·이직 이유' },
]

export function ProgressSteps({ current }: Props) {
  return (
    <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
      {STEPS.map((step, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                done    ? 'bg-emerald-500 text-white' :
                active  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                          'bg-gray-100 text-gray-400'
              }`}>
                {done ? '✓' : num}
              </div>
              <div className="hidden">
                <p className={`text-xs font-semibold ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400">{step.sub}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                done ? 'bg-emerald-400' : 'bg-gray-100'
              }`} />
            )}
          </div>
        )
      })}
      <span className={`ml-2 text-xs font-medium ${current === 1 ? 'text-gray-500' : 'text-indigo-600'}`}>
        {current} / {STEPS.length}
      </span>
    </div>
  )
}
