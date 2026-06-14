'use client'

import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import { DiagnosisCard } from '@/components/result/DiagnosisCard'
import { RecommendGrid } from '@/components/result/RecommendGrid'
import { GapAnalysis } from '@/components/result/GapAnalysis'
import { ActionChecklist } from '@/components/result/ActionChecklist'
import { Warnings } from '@/components/result/Warnings'
import { SalaryBenchmark } from '@/components/result/SalaryBenchmark'
import { PeerMoves } from '@/components/result/PeerMoves'
import { TrendingSkills } from '@/components/result/TrendingSkills'
import type { AnalysisResult, Stage1Data } from '@/lib/types'

interface Props {
  result: AnalysisResult
  stage1: Stage1Data
  createdAt: string
}

export function SharedResultView({ result, stage1, createdAt }: Props) {
  const date = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-bold text-indigo-600 text-base">careerly</Link>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
            공유된 결과
          </span>
        </div>
        <div>
          <h1 className="font-black text-lg text-gray-900">
            {stage1.jobCategory} · {result.directionType}
          </h1>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Calendar size={11} />
            {date} 분석
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-24">
        <DiagnosisCard
          diagnosis={result.diagnosis}
          directionType={result.directionType}
          directionSummary={result.directionSummary}
        />
        <RecommendGrid recommendations={result.recommendations} />
        <SalaryBenchmark stage1={stage1} />
        <PeerMoves jobCategory={stage1.jobCategory} companySize={stage1.companySize} />
        <TrendingSkills jobCategory={stage1.jobCategory} userSkills={stage1.skills} />
        <GapAnalysis strengths={result.strengths} gaps={result.gaps} />
        <ActionChecklist actionPlan={result.actionPlan} />
        {result.warnings?.length > 0 && <Warnings warnings={result.warnings} />}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 inset-x-0 pb-safe bg-white border-t border-gray-100">
        <div className="max-w-[430px] mx-auto px-4 py-3">
          <Link
            href="/analyze"
            className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm"
          >
            나도 분석받기 <ArrowRight size={16} />
          </Link>
          <p className="text-center text-xs text-gray-400 mt-2">무료 · 3분 · 로그인 불필요</p>
        </div>
      </div>
    </div>
  )
}
