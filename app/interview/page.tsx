'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MessageCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Stage1Data, AnalysisResult } from '@/lib/types'

interface InterviewQuestion {
  question: string
  intent: string
  answerGuide: string
  tip: string
}
interface InterviewCategory {
  name: string
  questions: InterviewQuestion[]
}
interface InterviewResult {
  categories: InterviewCategory[]
  overallTips: string[]
}

export default function InterviewPage() {
  const router = useRouter()
  const [result,    setResult]    = useState<AnalysisResult | null>(null)
  const [stage1,    setStage1]    = useState<Stage1Data | null>(null)
  const [target,    setTarget]    = useState('')
  const [interview, setInterview] = useState<InterviewResult | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [expanded,  setExpanded]  = useState<string | null>(null)

  useEffect(() => {
    const r  = sessionStorage.getItem('analysisResult')
    const s1 = sessionStorage.getItem('stage1Data')
    if (!r) { router.replace('/analyze'); return }
    const parsed = JSON.parse(r)
    setResult(parsed)
    if (s1) setStage1(JSON.parse(s1))
    if (parsed.recommendations?.[0]) setTarget(parsed.recommendations[0].category)
  }, [router])

  async function generate() {
    if (!target || !stage1 || !result) return
    setLoading(true)
    setInterview(null)

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage1, targetCategory: target, result }),
      })
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
      }
      const match = acc.match(/\{[\s\S]*\}/)
      if (match) setInterview(JSON.parse(match[0]))
    } catch {
      toast.error('다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const CATEGORY_COLORS = ['bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700']

  if (!result) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/result" className="p-2 -ml-2 text-gray-400"><ChevronLeft size={22} /></Link>
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-indigo-500" />
            <span className="font-bold text-gray-900 text-sm">AI 면접 질문</span>
          </div>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-10">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-purple-600" />
            <p className="font-bold text-gray-900">AI 면접 질문 예측</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">지원 기업군별 예상 질문 10개 + 모범 답변 가이드를 제공합니다</p>
        </div>

        {/* 기업군 선택 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="font-semibold text-gray-800 text-sm">어떤 기업군 면접을 준비할까요?</p>
          <div className="flex flex-col gap-2">
            {result.recommendations.map((rec) => (
              <button key={rec.category} onClick={() => setTarget(rec.category)}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                  target === rec.category ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-gray-50'
                }`}>
                <span className={`font-medium ${target === rec.category ? 'text-indigo-700' : 'text-gray-700'}`}>{rec.category}</span>
                <span className={`text-xs font-bold ${target === rec.category ? 'text-indigo-600' : 'text-gray-400'}`}>{rec.fitScore}% 매칭</span>
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={!target || loading}
            className="w-full py-4 bg-purple-600 disabled:opacity-40 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:bg-purple-800">
            {loading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />생성 중...</>
              : <><Sparkles size={16} />면접 질문 생성하기</>
            }
          </button>
        </div>

        {/* 결과 */}
        {interview && (
          <div className="space-y-3">
            {/* 전체 팁 */}
            {interview.overallTips?.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-indigo-800 text-sm">🎯 면접 전략</p>
                {interview.overallTips.map((tip, i) => (
                  <p key={i} className="text-sm text-indigo-700 flex gap-2"><span className="text-indigo-400">•</span>{tip}</p>
                ))}
              </div>
            )}

            {/* 카테고리별 질문 */}
            {interview.categories.map((cat, ci) => (
              <div key={cat.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[ci % CATEGORY_COLORS.length]}`}>{cat.name}</span>
                  <span className="text-xs text-gray-400">{cat.questions.length}문항</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {cat.questions.map((q, qi) => {
                    const key = `${ci}-${qi}`
                    const open = expanded === key
                    return (
                      <div key={qi}>
                        <button onClick={() => setExpanded(open ? null : key)}
                          className="w-full flex items-start justify-between gap-3 p-4 text-left active:bg-gray-50">
                          <div className="flex gap-2.5 flex-1">
                            <span className="text-xs font-black text-gray-300 mt-0.5 w-4 flex-shrink-0">Q{qi + 1}</span>
                            <p className="text-sm font-semibold text-gray-800 leading-snug">{q.question}</p>
                          </div>
                          {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />}
                        </button>
                        {open && (
                          <div className="px-4 pb-4 space-y-3">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400 font-semibold mb-1">질문 의도</p>
                              <p className="text-xs text-gray-600">{q.intent}</p>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-3">
                              <p className="text-xs text-indigo-600 font-semibold mb-1">답변 가이드</p>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{q.answerGuide}</p>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3">
                              <p className="text-xs text-amber-600 font-semibold mb-1">💡 실전 팁</p>
                              <p className="text-xs text-amber-700">{q.tip}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
