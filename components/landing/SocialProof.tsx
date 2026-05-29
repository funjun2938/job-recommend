'use client'

import { useEffect, useState } from 'react'

// 숫자 카운터 훅
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let frame: ReturnType<typeof requestAnimationFrame>
    const start = Date.now()
    const animate = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) frame = requestAnimationFrame(animate)
    }
    const t = setTimeout(() => { frame = requestAnimationFrame(animate) }, 400)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [target, duration])
  return count
}

const STATS = [
  { value: 1247, label: '분석 완료', suffix: '건' },
  { value: 94,   label: '만족도',    suffix: '%' },
  { value: 38,   label: '평균 소요', suffix: '초' },
]

export function SocialProof() {
  const counts = [
    useCounter(STATS[0].value),
    useCounter(STATS[1].value),
    useCounter(STATS[2].value),
  ]

  return (
    <div className="grid grid-cols-3 gap-3 py-2">
      {STATS.map((stat, i) => (
        <div key={stat.label} className="text-center">
          <p className="text-xl font-black text-indigo-600 tabular-nums">
            {counts[i].toLocaleString()}{stat.suffix}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
