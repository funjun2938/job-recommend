'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Copy, CheckCircle2, RefreshCw, Sparkles, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { Stage1Data, Stage2Data, AnalysisResult } from '@/lib/types'

interface CoverLetterSection {
  question: string
  answer: string
}
interface CoverLetterResult {
  title: string
  targetInfo: string
  sections: CoverLetterSection[]
  writingTips: string[]
}

export default function CoverLetterPage() {
  const router = useRouter()
  const [result,   setResult]   = useState<AnalysisResult | null>(null)
  const [stage1,   setStage1]   = useState<Stage1Data | null>(null)
  const [stage2,   setStage2]   = useState<Stage2Data | null>(null)
  const [target,   setTarget]   = useState('')
  const [company,  setCompany]  = useState('')
  const [cl,       setCl]       = useState<CoverLetterResult | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [stream,   setStream]   = useState('')
  const [copied,   setCopied]   = useState<number | null>(null)

  useEffect(() => {
    const r  = sessionStorage.getItem('analysisResult')
    const s1 = sessionStorage.getItem('stage1Data')
    const s2 = sessionStorage.getItem('stage2Data')
    if (!r) { router.replace('/analyze'); return }
    const parsed = JSON.parse(r) as AnalysisResult
    setResult(parsed)
    if (s1) setStage1(JSON.parse(s1))
    if (s2 && s2 !== '') setStage2(JSON.parse(s2))
    if (parsed.recommendations?.[0]) setTarget(parsed.recommendations[0].category)
  }, [router])

  async function generate() {
    if (!target || !stage1) return
    setLoading(true)
    setCl(null)
    setStream('')

    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage1, stage2, targetCategory: target, targetCompany: company }),
      })
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        acc += chunk
        setStream(acc)
      }

      const match = acc.match(/\{[\s\S]*\}/)
      if (match) setCl(JSON.parse(match[0]))
    } catch {
      toast.error('생성 중 오류가 발생했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  function copySection(idx: number, text: string) {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    toast.success('복사됐어요!')
    setTimeout(() => setCopied(null), 2000)
  }

  function copyAll() {
    if (!cl) return
    const text = cl.sections
      .map((s) => `[${s.question}]\n${s.answer}`)
      .join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('전체 자기소개서가 복사됐어요!')
  }

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/result" className="p-2 -ml-2 text-gray-400">
            <ChevronLeft size={22} />
          </Link>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-500" />
            <span className="font-bold text-gray-900 text-sm">AI 자기소개서</span>
          </div>
          {cl && (
            <button onClick={copyAll} className="text-xs font-semibold text-indigo-600 px-2">
              전체복사
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-10">
        {/* 설명 */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <p className="font-bold text-gray-900">AI 자기소개서 자동 생성</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            분석 결과를 기반으로 지원할 기업군에 최적화된<br />
            자기소개서 4개 문항을 자동으로 작성해드려요
          </p>
        </div>

        {/* 타겟 선택 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="font-semibold text-gray-800 text-sm">어디에 지원할 예정인가요?</p>

          {/* 기업군 선택 */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">추천 기업군 선택</p>
            <div className="flex flex-col gap-2">
              {result.recommendations.map((rec) => (
                <button
                  key={rec.category}
                  onClick={() => setTarget(rec.category)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                    target === rec.category
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className={`font-medium ${target === rec.category ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {rec.category}
                  </span>
                  <span className={`text-xs font-bold ${target === rec.category ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {rec.fitScore}% 매칭
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 특정 기업명 입력 */}
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500">희망 기업명 (선택)</p>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="예: 카카오, 토스, 네이버..."
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            onClick={generate}
            disabled={!target || loading}
            className="w-full py-4 bg-indigo-600 disabled:opacity-40 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:bg-indigo-800"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                작성 중...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                자기소개서 생성하기
              </>
            )}
          </button>
        </div>

        {/* 스트리밍 미리보기 */}
        {loading && stream && !cl && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-5">
            <p className="text-xs text-indigo-600 font-semibold mb-2">작성 중...</p>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-6">
              {stream.replace(/\{[\s\S]*/, '').slice(0, 300)}
              <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle" />
            </p>
          </div>
        )}

        {/* 결과 */}
        {cl && (
          <div className="space-y-3">
            {/* 제목 */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
              <p className="text-xs text-indigo-200 mb-1">{cl.targetInfo}</p>
              <h2 className="font-black text-lg leading-tight">{cl.title}</h2>
            </div>

            {/* 문항별 */}
            {cl.sections.map((section, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="font-bold text-gray-900 text-sm">{section.question}</p>
                  </div>
                  <button
                    onClick={() => copySection(i, section.answer)}
                    className="p-1.5 text-gray-400 hover:text-indigo-500 flex-shrink-0"
                  >
                    {copied === i
                      ? <CheckCircle2 size={16} className="text-emerald-500" />
                      : <Copy size={16} />
                    }
                  </button>
                </div>
                <p className="text-sm text-gray-700 leading-[1.8] whitespace-pre-line">
                  {section.answer}
                </p>
                <p className="text-xs text-gray-400 text-right">
                  {section.answer.length}자
                </p>
              </div>
            ))}

            {/* 작성 팁 */}
            {cl.writingTips?.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-2">
                <p className="font-semibold text-amber-800 text-sm">💡 작성 팁</p>
                {cl.writingTips.map((tip, i) => (
                  <p key={i} className="text-sm text-amber-700 leading-relaxed flex gap-2">
                    <span className="text-amber-400">•</span>{tip}
                  </p>
                ))}
              </div>
            )}

            {/* 재생성 */}
            <button
              onClick={generate}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-indigo-200 text-indigo-600 rounded-2xl font-semibold text-sm"
            >
              <RefreshCw size={15} /> 다시 생성하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
