import Link from 'next/link'
import {
  KPIS, SIGNUP_TREND, REC_FUNNEL, REVENUE_TREND, MODEL_METRICS,
  DOMAINS, TOTAL_TABLES, COLOR,
} from '@/lib/admin/data'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const maxSignup = Math.max(...SIGNUP_TREND.map((d) => d.value))
  const maxRev = Math.max(...REVENUE_TREND.map((d) => d.value))

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* 타이틀 */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">9개 도메인 · {TOTAL_TABLES}개 테이블 운영 현황 (목업 데이터)</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg">{k.icon}</span>
              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${k.positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                {k.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{k.delta}
              </span>
            </div>
            <p className="text-xl font-black text-gray-900 mt-2">{k.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 가입 추세 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">주간 신규 가입</h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {SIGNUP_TREND.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full bg-indigo-100 rounded-t-md relative" style={{ height: `${(d.value / maxSignup) * 100}%` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-indigo-500 rounded-t-md h-full" />
                </div>
                <span className="text-[10px] text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 퍼널 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">추천 → 지원 퍼널</h2>
          <div className="space-y-2.5">
            {REC_FUNNEL.map((f, i) => (
              <div key={f.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-500">{f.label}</span>
                  <span className="font-bold text-gray-700">{f.value.toLocaleString()} <span className="text-gray-400 font-normal">({f.pct}%)</span></span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.max(f.pct, 2)}%`, opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 매출 추세 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">월 매출 추세 (백만원)</h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {REVENUE_TREND.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-600">{d.value}</span>
                <div className="w-full bg-emerald-500 rounded-t-md" style={{ height: `${(d.value / maxRev) * 100}%` }} />
                <span className="text-[10px] text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 추천 모델 성능 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 text-sm mb-4">추천 모델 성능 (A/B 운영 중)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                <th className="py-2 font-semibold">모델</th>
                <th className="py-2 font-semibold">CTR</th>
                <th className="py-2 font-semibold">지원전환</th>
                <th className="py-2 font-semibold">트래픽</th>
                <th className="py-2 font-semibold">상태</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_METRICS.map((m) => (
                <tr key={m.model} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 font-mono text-xs font-semibold text-gray-800">{m.model}</td>
                  <td className="py-2.5 text-gray-700">{m.ctr}%</td>
                  <td className="py-2.5 text-gray-700">{m.conv}%</td>
                  <td className="py-2.5 text-gray-500">{m.traffic}</td>
                  <td className="py-2.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${m.status === '운영중' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 도메인 개요 */}
      <div>
        <h2 className="font-bold text-gray-900 text-sm mb-3">도메인 바로가기</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {DOMAINS.map((d) => {
            const c = COLOR[d.color]
            const rows = d.tables.reduce((s, t) => s + t.rowCount, 0)
            return (
              <Link key={d.key} href={`/admin/${d.key}`}
                className="group bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition">
                <div className="flex items-center justify-between">
                  <span className={`w-9 h-9 rounded-xl ${c.soft} flex items-center justify-center text-lg`}>{d.icon}</span>
                  <ArrowRight size={15} className="text-gray-300 group-hover:text-gray-500 transition" />
                </div>
                <p className="font-bold text-gray-900 text-sm mt-3">{d.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{d.tables.length}개 테이블 · {rows.toLocaleString()}행</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
