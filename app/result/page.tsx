'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Share2, FileText, MessageCircle, Sparkles, Heart } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { toast } from 'sonner'
import { FadeIn, SlideUp, ScaleIn } from '@/components/result/FadeIn'
import { DiagnosisCard } from '@/components/result/DiagnosisCard'
import { RecommendGrid } from '@/components/result/RecommendGrid'
import { GapAnalysis } from '@/components/result/GapAnalysis'
import { ActionChecklist } from '@/components/result/ActionChecklist'
import { AlertSignup } from '@/components/result/AlertSignup'
import { LiveJobs } from '@/components/result/LiveJobs'
import { SalaryBenchmark } from '@/components/result/SalaryBenchmark'
import { ReadinessScore } from '@/components/result/ReadinessScore'
import { ShareCard } from '@/components/result/ShareCard'
import { CompanyInsightTeaser } from '@/components/result/CompanyInsightTeaser'
import { NetworkSection } from '@/components/result/NetworkSection'
import { loadPreferences } from '@/lib/preferences'
import type { AnalysisResult, Stage1Data, Stage2Data, PreferenceData } from '@/lib/types'

const WORK_MODE_LABEL: Record<PreferenceData['workMode'], string> = {
  onsite: '출근',
  remote: '재택 우선',
  hybrid: '하이브리드',
  any: '근무형태 무관',
}

export default function ResultPage() {
  const router = useRouter()
  const [result,  setResult]  = useState<AnalysisResult | null>(null)
  const [stage1,  setStage1]  = useState<Stage1Data | null>(null)
  const [stage2,  setStage2]  = useState<Stage2Data | null>(null)
  const [prefs,    setPrefs]    = useState<PreferenceData | null>(null)
  const [ready,    setReady]    = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  useEffect(() => {
    const stored  = sessionStorage.getItem('analysisResult')
    const s1      = sessionStorage.getItem('stage1Data')
    const s2      = sessionStorage.getItem('stage2Data')

    if (!stored) { router.replace('/analyze'); return }
    try {
      setResult(JSON.parse(stored))
      if (s1) setStage1(JSON.parse(s1))
      if (s2 && s2 !== '') setStage2(JSON.parse(s2))
      setPrefs(loadPreferences())
      setTimeout(() => setReady(true), 50) // 마운트 후 애니메이션 시작
    } catch { router.replace('/analyze') }
  }, [router])

  async function handleShare() {
    // 영구 저장 URL 생성 (없으면 생성)
    let url = shareUrl ?? window.location.href
    if (!shareUrl && result && stage1) {
      try {
        const res = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result, stage1 }),
        })
        const data = await res.json()
        if (data.shareId) {
          const generated = `${window.location.origin}/r/${data.shareId}`
          setShareUrl(generated)
          url = generated
        }
      } catch { /* 실패 시 현재 URL 사용 */ }
    }

    if (navigator.share) {
      navigator.share({ title: '내 이직 분석 결과', url })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('공유 링크가 복사됐어요!')
    }
  }

  if (!result || !ready) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="space-y-3 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mx-auto" />
        <p className="text-xs text-gray-400">결과 불러오는 중...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 active:text-gray-700">
            <ChevronLeft size={22} />
          </button>
          <span className="font-bold text-gray-900 text-sm">이직 분석 결과</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={handleShare} className="p-2 text-gray-400 active:text-gray-700">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3 pb-28">

        {/* 완료 타이틀 */}
        <ScaleIn delay={0}>
          <div className="text-center pt-3 pb-1">
            <div className="text-4xl mb-2">✨</div>
            <h1 className="font-black text-xl text-gray-900">분석 완료!</h1>
            {stage1 && (
              <p className="text-xs text-gray-400 mt-1">
                {stage1.jobCategory} · {stage1.experienceYears} · {stage1.companySize}
              </p>
            )}
          </div>
        </ScaleIn>

        {/* ① 이직 준비도 점수 */}
        {stage1 && (
          <FadeIn delay={0.1}>
            <ReadinessScore result={result} stage1={stage1} stage2={stage2} />
          </FadeIn>
        )}

        {/* ② 진단 요약 */}
        <FadeIn delay={0.15}>
          <DiagnosisCard
            diagnosis={result.diagnosis}
            directionType={result.directionType}
            directionSummary={result.directionSummary}
          />
        </FadeIn>

        {/* ②b 원하는 조건 반영됨 — 선호 서베이 완료 시 */}
        {prefs && (
          <FadeIn delay={0.17}>
            <div className="bg-white border border-indigo-100 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles size={14} className="text-indigo-500" />
                <span className="text-xs font-bold text-indigo-600">원하시는 조건 반영됨</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {prefs.desiredSalary && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                    희망연봉 {prefs.desiredSalary}
                  </span>
                )}
                {prefs.workMode !== 'any' && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {WORK_MODE_LABEL[prefs.workMode]}
                  </span>
                )}
                {prefs.workLocation && prefs.workLocation !== '무관' && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {prefs.workLocation}
                  </span>
                )}
                {prefs.companyType && prefs.companyType !== '무관' && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {prefs.companyType}
                  </span>
                )}
                {prefs.priorities.slice(0, 3).map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">
                    #{p}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ③ 추천 기업군 */}
        <SlideUp delay={0.2}>
          <RecommendGrid recommendations={result.recommendations} />
        </SlideUp>

        {/* ③b 정밀 추천 게이트 — 선호 미입력 시 원하는 조건 받기 유도 */}
        {!prefs && (
          <SlideUp delay={0.22}>
            <Link
              href="/analyze"
              className="block bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white active:opacity-90"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={16} className="text-white" />
                <span className="font-black text-base">원하는 조건으로 정밀 추천</span>
              </div>
              <p className="text-indigo-100 text-xs leading-relaxed">
                원하는 조건(희망연봉·근무지·재택 등)을 알려주면 추천 정확도가 크게 올라가요. 1분이면 돼요.
              </p>
              <span className="inline-flex items-center gap-1 mt-3 bg-white/15 px-3 py-1.5 rounded-xl text-xs font-bold">
                정밀 추천 받기 <ChevronLeft size={14} className="rotate-180" />
              </span>
            </Link>
          </SlideUp>
        )}

        {/* ④ 실시간 채용공고 */}
        {stage1 && (
          <FadeIn delay={0.25}>
            <LiveJobs jobCategory={stage1.jobCategory} />
          </FadeIn>
        )}

        {/* ⑤ 연봉 시장 위치 */}
        {stage1 && (
          <FadeIn delay={0.28}>
            <SalaryBenchmark stage1={stage1} stage2={stage2 ?? undefined} />
          </FadeIn>
        )}

        {/* ⑥ 명함첩 연동 — 네트워크 맵 + 유사 커리어 경로 (외부 데이터) */}
        {stage1 && (
          <SlideUp delay={0.32}>
            <NetworkSection stage1={stage1} />
          </SlideUp>
        )}

        {/* ⑧ 갭 분석 */}
        <FadeIn delay={0.35}>
          <GapAnalysis strengths={result.strengths} gaps={result.gaps} />
        </FadeIn>

        {/* ⑨ 이직 준비 체크리스트 */}
        <FadeIn delay={0.38}>
          <ActionChecklist actionPlan={result.actionPlan} />
        </FadeIn>

        {/* ⑪ 회사 인사이트 티저 */}
        {stage2?.companyName && (
          <FadeIn delay={0.42}>
            <CompanyInsightTeaser companyName={stage2.companyName} />
          </FadeIn>
        )}

        {/* ⑫b 공유 카드 */}
        {stage1 && (
          <SlideUp delay={0.45}>
            <ShareCard result={result} stage1={stage1} />
          </SlideUp>
        )}

        {/* ⑬ 알림 신청 */}
        <FadeIn delay={0.48}>
          <AlertSignup stage1={stage1} />
        </FadeIn>

        {/* ⑮ 즐겨찾기 바로가기 */}
        <FadeIn delay={0.52}>
          <Link
            href="/favorites"
            className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4"
          >
            <Heart size={18} className="text-rose-500 fill-rose-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">관심 기업 보기</p>
              <p className="text-xs text-gray-500 mt-0.5">하트 누른 기업들을 한 눈에</p>
            </div>
            <ChevronLeft size={16} className="rotate-180 text-rose-300" />
          </Link>
        </FadeIn>

        {/* ⑯ 면접 질문 배너 */}
        <FadeIn delay={0.5}>
          <Link
            href="/interview"
            className="flex items-center gap-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white active:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-base">AI 면접 질문 예측</p>
              <p className="text-purple-200 text-xs mt-0.5">
                지원 기업군별 예상 질문 10개 + 답변 가이드
              </p>
            </div>
            <ChevronLeft size={20} className="rotate-180 text-purple-300 flex-shrink-0" />
          </Link>
        </FadeIn>

        {/* ⑮ 자기소개서 생성 배너 */}
        <FadeIn delay={0.5}>
          <Link
            href="/cover-letter"
            className="flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white active:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-base">AI 자기소개서 자동 작성</p>
              <p className="text-indigo-200 text-xs mt-0.5">
                분석 결과로 맞춤 자소서 4개 문항을 즉시 생성
              </p>
            </div>
            <ChevronLeft size={20} className="rotate-180 text-indigo-300 flex-shrink-0" />
          </Link>
        </FadeIn>

      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 pb-safe bg-white/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex gap-3">
          <Link
            href="/analyze"
            className="flex-1 py-3.5 border-2 border-indigo-200 text-indigo-600 rounded-2xl font-bold text-sm text-center active:bg-indigo-50"
          >
            다시 분석
          </Link>
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 bg-indigo-600 active:bg-indigo-800 text-white rounded-2xl font-bold text-sm"
          >
            결과 공유
          </button>
        </div>
      </div>
    </div>
  )
}
