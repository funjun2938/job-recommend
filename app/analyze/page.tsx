'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stage1Form } from '@/components/forms/Stage1Form'
import { PreviewLockScreen } from '@/components/forms/PreviewLockScreen'
import { Stage2Form } from '@/components/forms/Stage2Form'
import { LoadingScreen } from '@/components/forms/LoadingScreen'
import type { Stage1Data, Stage2Data } from '@/lib/types'

const defaultStage1: Stage1Data = {
  jobCategory: '',
  experienceYears: '',
  salaryRange: '',
  skills: [],
  companySize: '',
}

const defaultStage2: Stage2Data = {
  companyName: '',
  jobLevel: '',
  actualSalary: '',
  resignationReasons: [],
  pros: [],
  cons: [],
  mgmtTrustScore: 3,
  stayProbability: 50,
  npsScore: 5,
}

type Step = 'stage1' | 'preview' | 'stage2' | 'loading'

export default function AnalyzePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('stage1')
  const [stage1, setStage1] = useState<Stage1Data>(defaultStage1)
  const [stage2, setStage2] = useState<Stage2Data>(defaultStage2)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState('')

  async function runAnalysis(s2: Stage2Data | null) {
    setStep('loading')
    setStreamText('')
    setError('')

    // Save company insight in background (fire and forget)
    if (s2 && s2.resignationReasons.length > 0) {
      fetch('/api/save-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage1, stage2: s2 }),
      }).catch(() => {})
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage1, stage2: s2 }),
      })

      if (!response.ok || !response.body) {
        throw new Error('분석 요청에 실패했어요')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setStreamText((prev) => prev + chunk)
      }

      const jsonMatch = accumulated.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('결과를 파싱할 수 없어요')

      const result = JSON.parse(jsonMatch[0])
      sessionStorage.setItem('analysisResult', JSON.stringify(result))
      sessionStorage.setItem('stage1Data', JSON.stringify(stage1))
      sessionStorage.setItem('stage2Data', s2 ? JSON.stringify(s2) : '')
      sessionStorage.setItem('skippedStage2', s2 ? 'false' : 'true')

      router.push('/result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요. 다시 시도해주세요.')
      setStep('stage2')
    }
  }

  return (
    <>
      {step === 'stage1' && (
        <Stage1Form data={stage1} onChange={setStage1} onNext={() => setStep('preview')} />
      )}
      {step === 'preview' && (
        <PreviewLockScreen
          stage1={stage1}
          onUnlock={() => setStep('stage2')}
          onSkip={() => runAnalysis(null)}
          onBack={() => setStep('stage1')}
        />
      )}
      {step === 'stage2' && (
        <>
          <Stage2Form
            data={stage2}
            onChange={setStage2}
            onBack={() => setStep('preview')}
            onSubmit={() => runAnalysis(stage2)}
          />
          {error && (
            <div className="fixed bottom-20 inset-x-0 flex justify-center px-4">
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl shadow-sm max-w-sm w-full text-center">
                {error}
              </div>
            </div>
          )}
        </>
      )}
      {step === 'loading' && <LoadingScreen streamText={streamText} />}
    </>
  )
}
