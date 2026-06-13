'use client'

import { useParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { getDomain, COLOR, type AdminTable } from '@/lib/admin/data'
import { Search, Database, Sparkles, ChevronRight, Table2 } from 'lucide-react'

export default function DomainPage() {
  const params = useParams<{ domain: string }>()
  const domain = getDomain(params.domain)

  const tablesWithRows = useMemo(
    () => (domain?.tables ?? []).filter((t) => t.rows && t.rows.length > 0),
    [domain]
  )
  const [selected, setSelected] = useState<string>(tablesWithRows[0]?.name ?? '')
  const [query, setQuery] = useState('')

  if (!domain) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-gray-500">존재하지 않는 도메인입니다.</p>
        <Link href="/admin" className="text-indigo-600 text-sm font-bold underline mt-2 inline-block">대시보드로</Link>
      </div>
    )
  }

  const c = COLOR[domain.color]
  const active: AdminTable | undefined = domain.tables.find((t) => t.name === selected)

  const filteredRows = (active?.rows ?? []).filter((row) =>
    query === '' ? true : Object.values(row).some((v) => String(v).toLowerCase().includes(query.toLowerCase()))
  )

  const totalRows = domain.tables.reduce((s, t) => s + t.rowCount, 0)

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/admin" className="hover:text-gray-600">대시보드</Link>
        <ChevronRight size={13} />
        <span className="text-gray-600 font-medium">{domain.name}</span>
      </div>

      <div className="flex items-start gap-3">
        <span className={`w-12 h-12 rounded-2xl ${c.soft} flex items-center justify-center text-2xl flex-shrink-0`}>{domain.icon}</span>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{domain.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{domain.desc} · 누적 {totalRows.toLocaleString()}행</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        {/* 테이블 목록 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 h-fit">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1.5">테이블 {domain.tables.length}개</p>
          <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
            {domain.tables.map((t) => {
              const hasData = !!(t.rows && t.rows.length)
              const isActive = t.name === selected
              return (
                <button
                  key={t.name}
                  onClick={() => hasData && setSelected(t.name)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition ${
                    isActive ? `${c.soft} ${c.ring} ring-1` : 'hover:bg-gray-50'
                  } ${hasData ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
                >
                  {hasData ? <Table2 size={14} className={c.text} /> : <Database size={14} className="text-gray-300" />}
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-gray-800 truncate">{t.label}</span>
                    <span className="block text-[10px] text-gray-400 font-mono truncate">{t.name}</span>
                  </span>
                  {t.isNew && <span className="text-[8px] font-black text-violet-600 bg-violet-100 px-1 py-0.5 rounded">NEW</span>}
                  <span className="text-[10px] text-gray-400 tabular-nums">{t.rowCount.toLocaleString()}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 선택된 테이블 데이터 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {active && active.rows && active.columns ? (
            <>
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="font-bold text-gray-900 text-sm truncate">{active.label}</h2>
                  <span className="text-[11px] font-mono text-gray-400 truncate">{active.name}</span>
                  {active.isNew && <Sparkles size={13} className="text-violet-500 flex-shrink-0" />}
                </div>
                <div className="relative flex-shrink-0">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="검색"
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-gray-400 bg-gray-50 border-b border-gray-100">
                      {active.columns.map((col) => (
                        <th key={col} className="px-5 py-2.5 font-semibold whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                        {active.columns!.map((col) => (
                          <td key={col} className="px-5 py-3 text-gray-700 whitespace-nowrap">
                            {typeof row[col] === 'string' && /^(active|completed|paid|opened|allowed|진행중|재직)$/.test(String(row[col])) ? (
                              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{String(row[col])}</span>
                            ) : typeof row[col] === 'string' && /^(failed|denied|locked|rejected|past_due|마감임박)$/.test(String(row[col])) ? (
                              <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{String(row[col])}</span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {filteredRows.length === 0 && (
                      <tr><td colSpan={active.columns.length} className="px-5 py-10 text-center text-gray-400 text-xs">검색 결과가 없어요</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="px-5 py-3 text-[11px] text-gray-400 border-t border-gray-50">
                전체 {active.rowCount.toLocaleString()}행 중 샘플 {active.rows.length}건 표시 · 목업 데이터
              </p>
            </>
          ) : (
            <div className="py-20 text-center">
              <Database size={28} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">샘플 데이터가 있는 테이블을 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
