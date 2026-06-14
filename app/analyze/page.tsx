'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PreferenceSurvey } from '@/components/forms/PreferenceSurvey'
import { LoadingScreen } from '@/components/forms/LoadingScreen'
import { getMockResult } from '@/lib/mock-result'
import { refineResult, savePreferences } from '@/lib/preferences'
import type { Stage1Data, PreferenceData } from '@/lib/types'

const defaultPrefs: PreferenceData = {
  desiredSalary: '',
  workLocation: '',
  workMode: 'any',
  priorities: [],
  companyType: '',
  dealbreakers: [],
  motivation: '',
}

type Step = 'survey' | 'loading'

export default function AnalyzePage() {
  const router = useRouter()
  const [step,   setStep]   = useState<Step>('survey')
  const [stage1, setStage1] = useState<Stage1Data | null>(null)
  const [prefs,  setPrefs]  = useState<PreferenceData>(defaultPrefs)

  // 진입 시 기본 커리어 로드 — 없으면 홈으로
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('stage1Data')
      if (!raw) { router.replace('/'); return }
      setStage1(JSON.parse(raw) as Stage1Data)
    } catch {
      router.replace('/')
    }
  }, [router])

  async function handleSubmit() {
    if (!stage1) { router.replace('/'); return }
    setStep('loading')

    // 정밀화: 목업 결과 → 선호 반영
    const base = getMockResult(stage1)
    const refined = refineResult(base, prefs)

    sessionStorage.setItem('analysisResult', JSON.stringify(refined))
    sessionStorage.setItem('stage1Data', JSON.stringify(stage1))
    sessionStorage.setItem('skippedStage2', 'false')
    savePreferences(prefs)

    // 로딩 화면을 잠깐 보여주고 이동
    await new Promise((r) => setTimeout(r, 1600))
    router.push('/result')
  }

  if (!stage1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
      </div>
    )
  }

  if (step === 'loading') return <LoadingScreen streamText="" />

  return (
    <PreferenceSurvey
      data={prefs}
      onChange={setPrefs}
      onSubmit={handleSubmit}
      onBack={() => router.back()}
    />
  )
}
