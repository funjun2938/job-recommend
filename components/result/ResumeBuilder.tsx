'use client'

import { useState } from 'react'
import { FileDown, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Stage1Data, Stage2Data, AnalysisResult } from '@/lib/types'

interface ResumeData {
  headline: string
  summary: string
  experience: Array<{ title: string; company: string; period: string; bullets: string[] }>
  skills: { core: string[]; tools: string[]; soft: string[] }
  tips: string[]
}

interface Props {
  stage1: Stage1Data
  stage2: Stage2Data | null
  result: AnalysisResult
}

export function ResumeBuilder({ stage1, stage2, result }: Props) {
  const [loading, setLoading] = useState(false)
  const [resume,  setResume]  = useState<ResumeData | null>(null)
  const [target,  setTarget]  = useState(result.recommendations?.[0]?.category ?? '')

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage1, stage2, result, targetCategory: target }),
      })
      const data = await res.json()
      setResume(data)
    } catch {
      toast.error('다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  function downloadTxt() {
    if (!resume) return
    const lines = [
      `━━ 이력서 ━━`, ``, resume.headline, ``,
      `【요약】`, resume.summary, ``,
      `【경력】`,
      ...resume.experience.flatMap((e) => [
        `${e.title} | ${e.company} | ${e.period}`,
        ...e.bullets.map((b) => `  • ${b}`), ``
      ]),
      `【스킬】`,
      `핵심: ${resume.skills.core.join(', ')}`,
      `툴: ${resume.skills.tools.join(', ')}`,
      `소프트: ${resume.skills.soft.join(', ')}`, ``,
      `【작성 팁】`,
      ...resume.tips.map((t, i) => `${i + 1}. ${t}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = '이직추천_이력서템플릿.txt'; a.click()
    URL.revokeObjectURL(url)
    toast.success('이력서 템플릿이 다운로드됐어요!')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileDown size={18} className="text-indigo-500" />
        <h2 className="font-semibold text-gray-900">이력서 템플릿</h2>
      </div>

      {!resume ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">지원 기업군에 최적화된 이력서 초안을 AI가 작성해드려요</p>
          <div className="flex flex-col gap-2">
            {result.recommendations.slice(0, 3).map((rec) => (
              <button key={rec.category} onClick={() => setTarget(rec.category)}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                  target === rec.category ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                }`}>
                <span className={`font-medium ${target === rec.category ? 'text-indigo-700' : 'text-gray-700'}`}>{rec.category}</span>
                {target === rec.category && <CheckCircle2 size={16} className="text-indigo-600" />}
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={!target || loading}
            className="w-full py-3.5 bg-indigo-600 disabled:opacity-40 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />생성 중...</>
              : <><Sparkles size={15} />이력서 초안 생성</>
            }
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 헤드라인 */}
          <div className="bg-indigo-600 rounded-xl p-4 text-white">
            <p className="text-xs text-indigo-200 mb-1">포지셔닝</p>
            <p className="font-bold leading-snug">{resume.headline}</p>
          </div>

          {/* 요약 */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">요약</p>
            <p className="text-sm text-gray-700 leading-relaxed">{resume.summary}</p>
          </div>

          {/* 경력 */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">경력</p>
            {resume.experience.map((exp, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{exp.title}</p>
                  <p className="text-xs text-gray-500">{exp.company} · {exp.period}</p>
                </div>
                <ul className="space-y-1">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="text-xs text-gray-600 flex gap-1.5">
                      <span className="text-indigo-400 flex-shrink-0">•</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 스킬 */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">스킬</p>
            <div className="flex flex-wrap gap-1.5">
              {[...resume.skills.core, ...resume.skills.tools].map((s) => (
                <span key={s} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">{s}</span>
              ))}
            </div>
          </div>

          {/* 팁 */}
          <div className="bg-amber-50 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-bold text-amber-700">💡 이력서 팁</p>
            {resume.tips.map((t, i) => (
              <p key={i} className="text-xs text-amber-700 flex gap-1.5"><span>{i + 1}.</span>{t}</p>
            ))}
          </div>

          {/* 다운로드 */}
          <div className="flex gap-2">
            <button onClick={downloadTxt}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">
              <FileDown size={15} /> TXT 다운로드
            </button>
            <button onClick={() => setResume(null)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm">
              다시 생성
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
