'use client'

import { useState } from 'react'
import { Bell, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Stage1Data } from '@/lib/types'

const TIMELINE_OPTIONS = [
  { value: '3개월 내', label: '3개월 내' },
  { value: '6개월 내', label: '6개월 내' },
  { value: '1년 내', label: '1년 내' },
  { value: '미정', label: '아직 미정' },
]

interface Props {
  stage1: Stage1Data | null
}

export function AlertSignup({ stage1 }: Props) {
  const [email, setEmail] = useState('')
  const [timeline, setTimeline] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !timeline) return
    setLoading(true)
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, timeline, stage1 }),
      })
      setSubmitted(true)
      toast.success('알림 신청 완료! 맞춤 채용공고가 올라오면 알려드릴게요.')
    } catch {
      toast.error('잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-2">
        <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
        <p className="font-semibold text-emerald-800">알림 신청 완료!</p>
        <p className="text-sm text-emerald-600">
          맞춤 채용공고가 올라오면 <strong>{email}</strong>으로 알려드릴게요.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Bell size={18} className="text-indigo-500" />
        <h2 className="font-semibold text-gray-900">맞춤 채용공고 알림</h2>
      </div>
      <p className="text-sm text-gray-500">
        추천 기업군에서 채용공고가 올라오면 이메일로 바로 알려드려요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          required
          className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        <div className="grid grid-cols-2 gap-2">
          {TIMELINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeline(opt.value)}
              className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                timeline === opt.value
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!email || !timeline || loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-all active:scale-98"
        >
          {loading ? '신청 중...' : '알림 신청하기 →'}
        </button>
      </form>

      <div className="flex gap-4 justify-center">
        {['스팸 없음', '언제든 해지 가능'].map((t) => (
          <span key={t} className="flex items-center gap-1 text-xs text-gray-400">
            <CheckCircle2 size={12} className="text-gray-300" />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
