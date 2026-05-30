'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stage1Form } from '@/components/forms/Stage1Form'
import { PreviewLockScreen } from '@/components/forms/PreviewLockScreen'
import { Stage2Form } from '@/components/forms/Stage2Form'
import { LoadingScreen } from '@/components/forms/LoadingScreen'
import { getMockResult } from '@/lib/mock-result'
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

function saveAndNavigate(
  result: object,
  stage1: Stage1Data,
  s2: Stage2Data | null,
  router: ReturnType<typeof useRouter>
) {
  sessionStorage.setItem('analysisResult', JSON.stringify(result))
  sessionStorage.setItem('stage1Data', JSON.stringify(stage1))
  sessionStorage.setItem('stage2Data', s2 ? JSON.stringify(s2) : '')
  sessionStorage.setItem('skippedStage2', s2 ? 'false' : 'true')
  router.push('/result')
}

export default function AnalyzePage() {
  const router = useRouter()
  const [step,       setStep]       = useState<Step>('stage1')
  const [stage1,     setStage1]     = useState<Stage1Data>(defaultStage1)
  const [stage2,     setStage2]     = useState<Stage2Data>(defaultStage2)
  const [streamText, setStreamText] = useState('')
  const [error,      setError]      = useState('')

  async function runAnalysis(s2: Stage2Data | null) {
    setStep('loading')
    setStreamText('')
    setError('')

    // 회사 정보 백그라운드 저장
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

      if (!response.ok || !response.body) throw new Error('api_error')

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

      // 마크다운 코드블록 제거 후 JSON 추출
      const cleaned = accumulated
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        saveAndNavigate(result, stage1, s2, router)
        return
      }

      // JSON 파싱 실패 → 목업으로 폴백
      console.warn('API 응답 파싱 실패, 목업 데이터 사용')
      saveAndNavigate(getMockResult(stage1), stage1, s2, router)

    } catch {
      // API 호출 자체 실패 → 목업으로 폴백
      console.warn('API 호출 실패, 목업 데이터 사용')
      // 로딩 화면을 2초간 보여주고 목업 결과로 이동
      await new Promise((r) => setTimeout(r, 2000))
      saveAndNavigate(getMockResult(stage1), stage1, s2, router)
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
        <Stage2Form
          data={stage2}
          onChange={setStage2}
          onBack={() => setStep('preview')}
          onSubmit={() => runAnalysis(stage2)}
        />
      )}
      {step === 'loading' && <LoadingScreen streamText={streamText} />}
    </>
  )
}
