'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowRight, Sparkles, Shield, PenLine } from 'lucide-react'
import { PROVIDERS, buildUnifiedProfile, toStage1, type Provider } from '@/lib/connect'
import { buildSync, setStoredSync } from '@/lib/network'

// 브랜드 아이콘 (lucide 미제공 → 인라인 SVG)
const ICON: Record<Provider, React.ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  remember: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="currentColor" opacity="0.25" />
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="10.5" r="2" fill="currentColor" />
      <path d="M5 16c.4-1.4 1.4-2.2 2.5-2.2S9.6 14.6 10 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.5 9.5h5M13.5 12.5h5M13.5 15.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  ),
}

export function ConnectHero() {
  const router = useRouter()
  const [loading, setLoading] = useState<Provider | null>(null)

  async function connect(provider: Provider) {
    if (loading) return
    setLoading(provider)

    // 연동 지연 시뮬레이션
    await new Promise((r) => setTimeout(r, 1400))

    // 어느 provider든 우리 표준 규격(UnifiedProfile)으로 정규화
    const profile = buildUnifiedProfile(provider)
    const stage1 = toStage1(profile)

    // 명함첩/네트워크도 함께 연동된 상태로 (결과에서 즉시 네트워크 맵 노출)
    setStoredSync(buildSync(stage1))

    sessionStorage.setItem('unifiedProfile', JSON.stringify(profile))
    sessionStorage.setItem('stage1Data', JSON.stringify(stage1))
    sessionStorage.setItem('stage2Data', '')
    sessionStorage.setItem('skippedStage2', 'true')
    sessionStorage.setItem('connectedProvider', provider)

    // 먼저 "이렇게 분석했어요" 연동 결과 화면으로
    router.push('/connected')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 pt-16 pb-10">
      {/* 로고 */}
      <div className="flex items-center gap-2 mb-auto">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">J</div>
        <span className="font-bold text-gray-900">이직추천</span>
      </div>

      {/* 메인 카피 — 짧게 */}
      <div className="space-y-3 mt-10">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full">
          <Sparkles size={12} /> 원클릭 이직 추천
        </div>
        <h1 className="text-[2.3rem] font-black text-gray-900 leading-[1.12] tracking-tight">
          계정 하나로<br /><span className="text-indigo-600">이직처를 바로</span> 받아요
        </h1>
        <p className="text-gray-500 text-[15px]">연동만 하면 끝. 입력 없이 추천부터 받아보세요.</p>
      </div>

      {/* 진입 버튼 */}
      <div className="space-y-3 mt-9">
        {/* 커리어 직접 입력 — 연동과 동일 크기, 맨 위 */}
        <Link
          href="/career"
          className="w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 text-left transition active:scale-[0.98]"
        >
          <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 bg-indigo-600">
            <PenLine size={20} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-bold text-gray-900 text-[15px]">커리어 직접 입력</span>
            <span className="block text-xs text-gray-400 mt-0.5">연동 없이 바로 입력하고 시작해요</span>
          </span>
          <ArrowRight size={18} className="text-indigo-300 flex-shrink-0" />
        </Link>

        <div className="flex items-center gap-2 py-0.5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[11px] text-gray-300">또는 계정 연동</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {PROVIDERS.map((p) => {
          const isLoading = loading === p.key
          return (
            <button
              key={p.key}
              onClick={() => connect(p.key as Provider)}
              disabled={!!loading}
              className="w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition active:scale-[0.98] disabled:opacity-60"
              style={{ borderColor: isLoading ? p.brand : '#e5e7eb' }}
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: p.brand }}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : ICON[p.key as Provider]}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-gray-900 text-[15px]">
                  {isLoading ? `${p.name} 연동 중…` : `${p.name}로 시작`}
                </span>
                <span className="block text-xs text-gray-400 mt-0.5">{p.tagline}</span>
              </span>
              {!isLoading && <ArrowRight size={18} className="text-gray-300 flex-shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* 신뢰 한 줄 */}
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-6">
        <Shield size={12} className="text-emerald-500" /> 데모 · 더미 데이터로 동작 · 개인정보 미수집
      </p>
    </div>
  )
}
