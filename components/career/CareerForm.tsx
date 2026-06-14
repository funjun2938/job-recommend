'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ArrowRight, X, Loader2 } from 'lucide-react'
import { CATEGORY_GROUPS } from '@/lib/categories'
import { buildManualProfile, addManualSource, toStage1, type ManualCareerInput, type UnifiedProfile } from '@/lib/connect'
import { buildSync, setStoredSync } from '@/lib/network'

const EXPERIENCE = ['신입', '1년 미만', '1~3년', '3~5년', '5~7년', '7~10년', '10년 이상']
const COMPANY_SIZE = ['스타트업', '중소기업', '중견기업', '대기업', '외국계', '공기업·공공']
const SALARY = ['3천만원 미만', '3~4천만원', '4~5천만원', '5~6천만원', '6~7천만원', '7~8천만원', '8천~1억', '1억 이상']

export function CareerForm() {
  const router = useRouter()
  // 기존 프로필이 있으면 '보강' 모드 (연동 후 직접입력 추가)
  const [addMode] = useState(
    () => typeof window !== 'undefined'
      && new URLSearchParams(window.location.search).get('mode') === 'add'
      && !!sessionStorage.getItem('unifiedProfile')
  )
  const [groupKey, setGroupKey] = useState('')
  const [sub, setSub] = useState('')              // 상세 직군 (또는 CUSTOM)
  const [customText, setCustomText] = useState('') // 직접 입력 직군명
  const [experienceYears, setExp] = useState('')
  const [companySize, setSize] = useState('')
  const [salaryRange, setSalary] = useState('')
  const [currentCompany, setCompany] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const CUSTOM = '__custom__'
  const group = CATEGORY_GROUPS.find((g) => g.key === groupKey)
  const isEtcGroup = group?.label === '기타'
  // 직접 입력이면 자유 텍스트, 아니면 선택한 상세 직군
  const jobCategory = sub === CUSTOM ? customText.trim() : sub

  const valid = jobCategory && experienceYears && companySize && salaryRange

  function addSkill() {
    const v = skillInput.trim()
    if (v && !skills.includes(v) && skills.length < 12) setSkills([...skills, v])
    setSkillInput('')
  }

  async function submit() {
    if (!valid || submitting) return
    setSubmitting(true)
    const input: ManualCareerInput = { jobCategory, experienceYears, companySize, salaryRange, currentCompany, skills }

    // 보강 모드: 기존 프로필에 직접입력 소스를 병합
    if (addMode) {
      const raw = sessionStorage.getItem('unifiedProfile')
      if (raw) {
        try {
          const base = JSON.parse(raw) as UnifiedProfile
          const merged = addManualSource(base, input)
          const s1 = toStage1(merged)
          setStoredSync(buildSync(s1))
          sessionStorage.setItem('unifiedProfile', JSON.stringify(merged))
          sessionStorage.setItem('stage1Data', JSON.stringify(s1))
          sessionStorage.setItem('connectedProvider', merged.sources.join(','))
          await new Promise((r) => setTimeout(r, 400))
          router.push('/connected')
          return
        } catch { /* 폴백: 새 프로필 */ }
      }
    }

    // 신규: 직접입력으로 새 프로필 생성
    const profile = buildManualProfile(input)
    const stage1 = toStage1(profile)
    setStoredSync(buildSync(stage1))
    sessionStorage.setItem('unifiedProfile', JSON.stringify(profile))
    sessionStorage.setItem('stage1Data', JSON.stringify(stage1))
    sessionStorage.setItem('stage2Data', '')
    sessionStorage.setItem('skippedStage2', 'true')
    sessionStorage.setItem('connectedProvider', 'manual')
    await new Promise((r) => setTimeout(r, 500))
    router.push('/connected')
  }

  const Chip = ({ value, selected, onClick }: { value: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium border transition ${
        selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
      }`}
    >
      {value}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-28">
      {/* 헤더 */}
      <div className="sticky top-11 z-30 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href={addMode ? '/connected' : '/'} className="p-1 -ml-1 text-gray-400"><ChevronLeft size={22} /></Link>
          <span className="font-bold text-gray-900 text-sm">{addMode ? '직접 입력으로 보강' : '커리어 직접 입력'}</span>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 space-y-6">
        <p className="text-sm text-gray-500">
          {addMode
            ? '입력한 내용은 기존 연동 프로필에 더해져 추천이 더 정확해져요.'
            : '간단히 입력하면 바로 추천을 받을 수 있어요. 나중에 계정 연동으로 더 보강할 수 있어요.'}
        </p>

        {/* 직군 — 1단계: 대분류 ('기타'는 '직접 입력'으로 표기) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">직군 대분류 <span className="text-indigo-500">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_GROUPS.map((g) => (
              <Chip
                key={g.key}
                value={g.label === '기타' ? '✏️ 직접 입력' : `${g.emoji} ${g.label}`}
                selected={groupKey === g.key}
                onClick={() => {
                  setGroupKey(g.key)
                  setCustomText('')
                  setSub(g.label === '기타' ? CUSTOM : '')   // 직접입력 그룹이면 바로 자유 입력
                }}
              />
            ))}
          </div>
        </div>

        {/* 직군 — 2단계: 상세 직군 (직접 입력 포함) */}
        {group && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              {isEtcGroup ? '직군 직접 입력' : '상세 직군'} <span className="text-indigo-500">*</span>
            </label>
            {!isEtcGroup && (
              <div className="flex flex-wrap gap-2">
                {group.subs.map((s) => (
                  <Chip key={s} value={s} selected={sub === s} onClick={() => setSub(s)} />
                ))}
                <Chip value="✏️ 직접 입력" selected={sub === CUSTOM} onClick={() => setSub(CUSTOM)} />
              </div>
            )}
            {sub === CUSTOM && (
              <input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="직군을 직접 입력하세요 (예: 핀테크 PM, 바이오 연구원)"
                className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            )}
          </div>
        )}

        {/* 경력 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">경력 <span className="text-indigo-500">*</span></label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE.map((c) => (
              <Chip key={c} value={c} selected={experienceYears === c} onClick={() => setExp(c)} />
            ))}
          </div>
        </div>

        {/* 회사 규모 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">현재 회사 규모 <span className="text-indigo-500">*</span></label>
          <div className="flex flex-wrap gap-2">
            {COMPANY_SIZE.map((c) => (
              <Chip key={c} value={c} selected={companySize === c} onClick={() => setSize(c)} />
            ))}
          </div>
        </div>

        {/* 연봉대 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">현재 연봉대 <span className="text-indigo-500">*</span></label>
          <div className="flex flex-wrap gap-2">
            {SALARY.map((c) => (
              <Chip key={c} value={c} selected={salaryRange === c} onClick={() => setSalary(c)} />
            ))}
          </div>
        </div>

        {/* 현재 회사 (선택) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">현재 회사 <span className="text-gray-300 font-normal">(선택)</span></label>
          <input
            value={currentCompany}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="예: 토스, 삼성전자"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* 스킬 (선택) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">핵심 스킬 <span className="text-gray-300 font-normal">(선택)</span></label>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="스킬 입력 후 Enter"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button type="button" onClick={addSkill} className="px-4 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold active:bg-gray-200">추가</button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 pl-2.5 pr-1.5 py-1 rounded-full">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-indigo-400"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-[430px] mx-auto px-5 py-3">
          <button
            onClick={submit}
            disabled={!valid || submitting}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 active:bg-indigo-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-sm rounded-2xl"
          >
            {submitting
              ? <><Loader2 size={17} className="animate-spin" /> {addMode ? '보강 중…' : '분석 준비 중…'}</>
              : <>{addMode ? '이 내용으로 보강하기' : '분석 결과 보기'} <ArrowRight size={17} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
