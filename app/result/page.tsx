'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { DiagnosisCard } from '@/components/result/DiagnosisCard'
import { RecommendGrid } from '@/components/result/RecommendGrid'
import { GapAnalysis } from '@/components/result/GapAnalysis'
import { ActionPlan } from '@/components/result/ActionPlan'
import { Warnings } from '@/components/result/Warnings'
import { AlertSignup } from '@/components/result/AlertSignup'
import { LiveJobs } from '@/components/result/LiveJobs'
import { SalaryBenchmark } from '@/components/result/SalaryBenchmark'
import { ReadinessScore } from '@/components/result/ReadinessScore'
import { ShareCard } from '@/components/result/ShareCard'
import type { AnalysisResult, Stage1Data, Stage2Data } from '@/lib/types'

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [stage1, setStage1] = useState<Stage1Data | null>(null)
  const [stage2, setStage2] = useState<Stage2Data | null>(null)
  const [skipped, setSkipped] = useState(false)

  useEffect(() => {
    const stored    = sessionStorage.getItem('analysisResult')
    const s1        = sessionStorage.getItem('stage1Data')
    const s2        = sessionStorage.getItem('stage2Data')
    const didSkip   = sessionStorage.getItem('skippedStage2')

    if (!stored) { router.replace('/analyze'); return }
    try {
      setResult(JSON.parse(stored))
      if (s1) setStage1(JSON.parse(s1))
      if (s2) setStage2(JSON.parse(s2))
      setSkipped(didSkip === 'true')
    } catch { router.replace('/analyze') }
  }, [router])

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: '내 이직 분석 결과', url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('링크가 복사됐어요!')
    }
  }

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400">
            <ChevronLeft size={22} />
          </button>
          <span className="font-bold text-gray-900 text-sm">이직 분석 결과</span>
          <button onClick={handleShare} className="p-2 -mr-2 text-gray-400">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-24">
        {/* 완료 타이틀 */}
        <div className="text-center pt-2 pb-1">
          <div className="text-3xl mb-1">✨</div>
          <h1 className="font-bold text-xl text-gray-900">분석 완료!</h1>
          {stage1 && (
            <p className="text-xs text-gray-400 mt-1">
              {stage1.jobCategory} · {stage1.experienceYears} · {stage1.companySize}
            </p>
          )}
        </div>

        {/* ① 이직 준비도 점수 */}
        {stage1 && (
          <ReadinessScore result={result} stage1={stage1} stage2={stage2} />
        )}

        {/* ② 진단 요약 */}
        <DiagnosisCard
          diagnosis={result.diagnosis}
          directionType={result.directionType}
          directionSummary={result.directionSummary}
        />

        {/* ③ 추천 기업군 */}
        <RecommendGrid recommendations={result.recommendations} />

        {/* ④ 실시간 채용공고 — 추천 직후 바로 노출 */}
        {stage1 && <LiveJobs jobCategory={stage1.jobCategory} />}

        {/* ⑤ 연봉 벤치마크 */}
        {stage1 && (
          <SalaryBenchmark
            stage1={stage1}
            stage2={stage2 ?? undefined}
          />
        )}

        {/* ⑥ 갭 분석 */}
        <GapAnalysis strengths={result.strengths} gaps={result.gaps} />

        {/* ⑦ 액션 플랜 */}
        <ActionPlan actionPlan={result.actionPlan} />

        {/* ⑧ 주의사항 */}
        <Warnings warnings={result.warnings} />

        {/* ⑨ 공유 카드 */}
        {stage1 && (
          <ShareCard result={result} stage1={stage1} />
        )}

        {/* ⑩ 알림 신청 */}
        <AlertSignup stage1={stage1} />

        {/* 건너뛰기 배너 */}
        {skipped && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-amber-700">
              회사 정보를 추가하면 연봉 분석·추천 정확도가 올라가요{' '}
              <Link href="/analyze" className="underline font-semibold">다시 분석</Link>
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 pb-safe bg-white border-t border-gray-100">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex gap-3">
          <Link
            href="/analyze"
            className="flex-1 py-3.5 border border-indigo-200 text-indigo-600 rounded-2xl font-semibold text-sm text-center"
          >
            다시 분석
          </Link>
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold text-sm"
          >
            결과 공유
          </button>
        </div>
      </div>
    </div>
  )
}
