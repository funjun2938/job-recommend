'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2, ArrowRight, ArrowDown, Users, GitBranch,
  Briefcase, ChevronDown, ChevronUp, ShieldCheck, Plus, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  PROVIDERS, providerMeta, addSource, toStage1, type Provider, type UnifiedProfile,
} from '@/lib/connect'
import { getMockResult } from '@/lib/mock-result'
import { buildSync, setStoredSync } from '@/lib/network'

export function ConnectedProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<UnifiedProfile | null>(null)
  const [adding, setAdding] = useState<Provider | null>(null)
  const [showJson, setShowJson] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('unifiedProfile')
    if (!raw) { router.replace('/'); return }
    try { setProfile(JSON.parse(raw)) } catch { router.replace('/') }
  }, [router])

  async function addProvider(provider: Provider) {
    if (!profile || adding) return
    setAdding(provider)
    await new Promise((r) => setTimeout(r, 1200))
    const merged = addSource(profile, provider)
    setProfile(merged)
    sessionStorage.setItem('unifiedProfile', JSON.stringify(merged))
    sessionStorage.setItem('connectedProvider', merged.sources.join(','))
    setStoredSync(buildSync(toStage1(merged)))
    setAdding(null)
    toast.success(`${providerMeta(provider).name} 추가 연동 완료 — 데이터가 보강됐어요`)
  }

  function proceed() {
    if (!profile) return
    const stage1 = toStage1(profile)
    sessionStorage.setItem('analysisResult', JSON.stringify(getMockResult(stage1)))
    sessionStorage.setItem('stage1Data', JSON.stringify(stage1))
    router.push('/result')
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-9 h-9 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
      </div>
    )
  }

  const c = profile.canonical
  const remaining = PROVIDERS.filter((p) => !profile.sources.includes(p.key))

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* 연동 완료 헤더 */}
      <div className="bg-white border-b border-gray-100 px-5 pt-10 pb-6">
        {/* 연동된 소스 배지들 */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {profile.sources.map((s) => {
            const m = providerMeta(s)
            return (
              <span key={s} className="flex items-center gap-1 text-[11px] font-bold text-white px-2 py-1 rounded-full" style={{ background: m.brand }}>
                <CheckCircle2 size={11} /> {m.name}
              </span>
            )
          })}
          <span className="text-[11px] text-gray-400">{profile.sources.length}개 연동됨</span>
        </div>
        <h1 className="text-xl font-black text-gray-900">이렇게 분석했어요</h1>
        <p className="text-sm text-gray-500 mt-1">{profile.headline}</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${profile.completeness}%` }} />
          </div>
          <span className="text-xs font-bold text-indigo-600">완성도 {profile.completeness}%</span>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* 추가 연동 — 데이터 보강 */}
        {remaining.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-600" /> 데이터 더 보강하기
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">소스마다 가진 정보가 달라요. 추가 연동하면 추천이 더 정확해져요.</p>
            <div className="grid grid-cols-1 gap-2 mt-3">
              {remaining.map((p) => {
                const isAdding = adding === p.key
                return (
                  <button
                    key={p.key}
                    onClick={() => addProvider(p.key)}
                    disabled={!!adding}
                    className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 active:scale-[0.99] disabled:opacity-60 transition"
                  >
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: p.brand }}>
                      {isAdding ? <Loader2 size={16} className="animate-spin" /> : p.name[0]}
                    </span>
                    <span className="flex-1 text-left">
                      <span className="block text-sm font-bold text-gray-900">{isAdding ? `${p.name} 연동 중…` : `${p.name} 추가 연동`}</span>
                      <span className="block text-[11px] text-gray-400">{p.tagline}</span>
                    </span>
                    {!isAdding && <Plus size={16} className="text-indigo-400" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 표준 규격 배지 */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-white border border-gray-100 rounded-xl px-3 py-2">
          <ShieldCheck size={13} className="text-indigo-500 flex-shrink-0" />
          <span>어느 서비스로 연동하든 <b className="text-gray-700">동일한 표준 규격</b>으로 누적돼요</span>
          <code className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{profile.spec}</code>
        </div>

        {/* 표준 프로필 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-indigo-500" />
            <h2 className="font-bold text-gray-900 text-sm">표준 프로필</h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { k: '직군', v: c.jobCategory },
              { k: '시니어리티', v: c.seniority },
              { k: '경력', v: c.experienceYears },
              { k: '회사 규모', v: c.companySize },
              { k: '현재 회사', v: c.currentCompany },
              { k: '예상 연봉대', v: c.salaryRange },
            ].map((f) => (
              <div key={f.k} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-gray-400">{f.k}</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{f.v}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] text-gray-400 mb-1.5">핵심 스킬 <span className="text-indigo-500">({c.skills.length})</span></p>
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <span key={s} className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 mb-1.5 flex items-center gap-1"><GitBranch size={11} /> 커리어 경로</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {c.careerPath.map((step, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${i === c.careerPath.length - 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{step}</span>
                  {i < c.careerPath.length - 1 && <ArrowRight size={11} className="text-gray-300" />}
                </span>
              ))}
            </div>
          </div>

          {profile.networkReach && (
            <div className="flex items-center gap-2 bg-violet-50 rounded-xl px-3 py-2.5">
              <Users size={15} className="text-violet-500" />
              <p className="text-xs text-violet-700">
                인맥 <b>{profile.networkReach.connections.toLocaleString()}명</b> · 연결 회사 <b>{profile.networkReach.companies}곳</b>
              </p>
            </div>
          )}
        </div>

        {/* 소스별 정규화 매핑 */}
        {profile.contributions.map((contrib) => {
          const m = providerMeta(contrib.source)
          return (
            <div key={contrib.source} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: m.brand }}>{m.name[0]}</span>
                <h2 className="font-bold text-gray-900 text-sm">{m.name} → 표준 규격 변환</h2>
              </div>

              <div className="space-y-2">
                {contrib.mappings.map((mp, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-[11px] text-gray-400">{mp.rawField}</span>
                      <span className="text-gray-700 truncate">{mp.rawValue}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <ArrowDown size={12} className="text-indigo-400" />
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{mp.field}</span>
                      <span className="text-xs font-semibold text-gray-800">{mp.normalized}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {contrib.signals.map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <p className="text-[9px] text-gray-400">{s.label}</p>
                    <p className="text-[11px] font-medium text-gray-700 truncate">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* 표준 규격 JSON */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <button onClick={() => setShowJson((v) => !v)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
            {showJson ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 표준 규격 원본(JSON) {showJson ? '접기' : '보기'}
          </button>
          {showJson && (
            <pre className="text-[10px] leading-relaxed bg-gray-900 text-gray-100 rounded-xl p-3 overflow-x-auto mt-2">
{JSON.stringify({ spec: profile.spec, sources: profile.sources, canonical: c, networkReach: profile.networkReach }, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-[430px] mx-auto px-5 py-3 space-y-2">
          <button
            onClick={proceed}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 active:bg-indigo-800 text-white font-black text-sm rounded-2xl"
          >
            이 분석으로 이직 추천 받기 <ArrowRight size={17} />
          </button>
          <Link href="/" className="block text-center text-xs text-gray-400">처음부터 다시 연동</Link>
        </div>
      </div>
    </div>
  )
}
