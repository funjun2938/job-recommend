'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Network, GitBranch, ArrowRight, Sparkles, Loader2, ShieldCheck, RefreshCw, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { getStoredSync, setStoredSync, clearStoredSync } from '@/lib/network'
import type { Stage1Data, NetworkAnalysis } from '@/lib/types'

interface Props {
  stage1: Stage1Data
}

/**
 * 명함첩(리멤버 류) 연동 섹션.
 * 미연동: 연동 유도 CTA → 연동: 네트워크 맵 + 유사 커리어 경로 추천.
 */
export function NetworkSection({ stage1 }: Props) {
  const [analysis, setAnalysis] = useState<NetworkAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 이미 연동돼 있으면 자동으로 분석 재요청
    if (getStoredSync()) void runSync(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runSync(silent = false) {
    setLoading(true)
    try {
      // 다중 소스 직군을 섞어 분석하도록 저장된 통합 프로필의 분석 직군을 함께 전송
      let categories: string[] = []
      try {
        const raw = sessionStorage.getItem('unifiedProfile')
        if (raw) categories = (JSON.parse(raw)?.analysisCategories as string[]) ?? []
      } catch { categories = [] }

      const res = await fetch('/api/network/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage1, categories }),
      })
      if (!res.ok) throw new Error('sync_failed')
      const data = (await res.json()) as NetworkAnalysis
      setAnalysis(data)
      setStoredSync(data.sync)
      if (!silent) toast.success(`명함첩 연동 완료! ${data.sync.cardCount}장 분석`)
    } catch {
      if (!silent) toast.error('명함첩 연동에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  function disconnect() {
    clearStoredSync()
    setAnalysis(null)
    toast.success('명함첩 연동을 해제했어요.')
  }

  if (!mounted) return null

  // ── 미연동 상태: 연동 유도 CTA ───────────────────────
  if (!analysis) {
    return (
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">명함첩 연동하기 (NEW)</h2>
            <p className="text-[11px] text-violet-600 font-medium">리멤버 · 로열로 · 링크드인</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          내 명함첩을 연동하면 <b className="text-violet-700">설문만으로는 알 수 없던</b> 두 가지 추천을 추가로 받아요.
        </p>

        <div className="space-y-2">
          <div className="flex items-start gap-2.5 bg-white/70 rounded-xl p-3">
            <Network size={15} className="text-violet-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-gray-600 leading-relaxed">
              <b className="text-gray-800">인맥 네트워크 맵</b> — 내 인맥이 닿아있는 회사를 찾아 레퍼럴(지인 추천) 가능성이 높은 곳을 추천
            </p>
          </div>
          <div className="flex items-start gap-2.5 bg-white/70 rounded-xl p-3">
            <GitBranch size={15} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-gray-600 leading-relaxed">
              <b className="text-gray-800">유사 커리어 경로</b> — 나와 비슷한 길을 걸은 사람들이 <b>다음에 이직한 회사</b>를 분석해 추천
            </p>
          </div>
        </div>

        <button
          onClick={() => runSync(false)}
          disabled={loading}
          className="w-full py-3.5 bg-violet-600 active:bg-violet-800 disabled:opacity-60 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> 명함첩 분석 중...</>
          ) : (
            <><Sparkles size={16} /> 명함첩 연동하고 추천 받기</>
          )}
        </button>

        <p className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
          <ShieldCheck size={11} /> 이름·연락처는 저장하지 않고 회사/직군만 익명 분석해요
        </p>
      </div>
    )
  }

  // ── 연동 후: 네트워크 맵 + 커리어 경로 ───────────────
  const { sync, networkMap, careerPath, scores, weights } = analysis

  return (
    <div className="space-y-3">
      {/* 연동 요약 헤더 */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <CreditCard size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">명함첩 연동됨 · 리멤버</p>
            <p className="text-[11px] text-gray-500">
              명함 {sync.cardCount}장 · 회사 {sync.companyCount}곳 분석
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => runSync(false)} className="p-2 text-violet-400 active:text-violet-700" title="새로고침">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={disconnect} className="text-[11px] text-gray-400 underline px-1">해제</button>
        </div>
      </div>

      {/* 통합 추천 점수 (3축 가중 합산 = recommendation_scores) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <h2 className="font-semibold text-gray-900">통합 추천 점수</h2>
          <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Hybrid v3</span>
        </div>

        <p className="text-xs text-gray-500 -mt-1 leading-relaxed">
          콘텐츠 적합도(CBF {Math.round(weights.cbf * 100)}%) · 협업필터링(CF {Math.round(weights.cf * 100)}%) · 커리어 전이(Graph {Math.round(weights.graph * 100)}%) · 인맥(Network {Math.round(weights.network * 100)}%) 4개 신호를 하이브리드 랭킹한 결과예요.
        </p>
        <p className="text-[10px] text-gray-400 -mt-2">후보생성 → 다신호 점수화 → 하이브리드 랭킹 → 피드백 루프</p>

        <div className="space-y-2.5">
          {scores.slice(0, 5).map((s, i) => (
            <div key={s.company} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black w-5 ${
                    i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : 'text-gray-300'
                  }`}>{i + 1}</span>
                  <span className="text-sm font-bold text-gray-900">{s.company}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-600">{Math.round(s.finalScore * 100)}</span>
                  <span className="text-[10px] text-gray-400 ml-0.5">점</span>
                </div>
              </div>
              {/* 4-신호 미니 막대 */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'CBF', val: s.cbf, color: 'bg-indigo-400' },
                  { label: 'CF', val: s.cf, color: 'bg-blue-400' },
                  { label: 'Graph', val: s.graph, color: 'bg-amber-400' },
                  { label: 'Net', val: s.network, color: 'bg-violet-400' },
                ].map((axis) => (
                  <div key={axis.label}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] text-gray-400">{axis.label}</span>
                      <span className="text-[9px] font-bold text-gray-500">{Math.round(axis.val * 100)}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${axis.color}`} style={{ width: `${axis.val * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400">
          * final = CBF×{weights.cbf} + CF×{weights.cf} + Graph×{weights.graph} + Network×{weights.network} (Hybrid v3 · recommendation_scores)
        </p>
      </div>

      {/* 자산①: 네트워크 맵 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Network size={18} className="text-violet-500" />
          <h2 className="font-semibold text-gray-900">내 인맥 네트워크 맵</h2>
          <span className="ml-auto text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">명함첩 기반</span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed -mt-1">{networkMap.insight}</p>

        <div className="space-y-2.5">
          {networkMap.companies.slice(0, 6).map((c, i) => (
            <div key={c.company} className="flex items-center gap-3">
              <span className={`text-sm font-black w-5 flex-shrink-0 ${
                i === 0 ? 'text-violet-500' : i === 1 ? 'text-violet-400' : 'text-gray-300'
              }`}>{i + 1}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-800 truncate">{c.company}</span>
                  <span className="text-[10px] text-gray-400">· {c.industry}</span>
                  {c.isRecommendable && i < 3 && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">레퍼럴 유망</span>
                  )}
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-400 transition-all duration-700"
                    style={{ width: `${c.proximity}%` }}
                  />
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-800">{c.connections}명</p>
                <p className="text-[10px] text-gray-400">근접 {c.proximity}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400">
          * 명함첩에 등장하는 회사·인맥 밀도로 계산한 네트워크 근접도
        </p>
      </div>

      {/* 자산②: 유사 커리어 경로 추천 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-900">나와 비슷한 커리어의 다음 회사</h2>
          <span className="ml-auto text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">이직 이력 기반</span>
        </div>

        {/* 내 경로 */}
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[11px] text-gray-400 mb-1.5">내 추정 커리어 경로</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {careerPath.myPath.map((step, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                  i === careerPath.myPath.length - 1 ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}>{step}</span>
                {i < careerPath.myPath.length - 1 && <ArrowRight size={11} className="text-gray-300" />}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">{careerPath.insight}</p>

        <div className="space-y-2.5">
          {careerPath.recommendations.slice(0, 4).map((r, i) => (
            <div key={r.company} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{r.company}</span>
                  {i === 0 && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">BEST 매치</span>}
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-indigo-600">{r.matchRate}%</span>
                  <span className="text-[10px] text-gray-400 ml-1">경로일치</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-wrap mb-1.5">
                {r.commonPath.map((p, j) => (
                  <span key={j} className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">{p}</span>
                    {j < r.commonPath.length - 1 && <ArrowRight size={9} className="text-gray-300" />}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{r.reason}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400">
          * 명함 교체 이력을 익명 집계한 커리어 궤적 {careerPath.peerCount.toLocaleString()}건 기반
        </p>
      </div>
    </div>
  )
}
