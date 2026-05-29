'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Zap, Building2, Gift, ArrowRight } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { toast } from 'sonner'

const ICONS = { free: Gift, pro: Zap, team: Building2 }
const COLORS = {
  free: { bg: 'bg-gray-50', border: 'border-gray-200', btn: 'border-2 border-gray-300 text-gray-700', badge: '' },
  pro:  { bg: 'bg-indigo-600', border: 'border-indigo-600', btn: 'bg-white text-indigo-600 font-black', badge: '가장 인기' },
  team: { bg: 'bg-slate-800',  border: 'border-slate-700',  btn: 'border-2 border-slate-300 text-slate-700', badge: 'B2B' },
}

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(plan: 'pro' | 'team') {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/dashboard?upgraded=1`,
          cancelUrl:  `${window.location.origin}/pricing`,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error('결제 페이지 이동에 실패했어요')
    } catch {
      toast.error('잠시 후 다시 시도해주세요')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex items-center px-4 h-14 gap-3">
          <Link href="/" className="p-2 -ml-2 text-gray-400"><ChevronLeft size={22} /></Link>
          <span className="font-bold text-gray-900 text-sm">요금제</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-5 pb-10">
        {/* 헤더 카피 */}
        <div className="text-center space-y-2 py-2">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Pricing</p>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            이직 성공까지<br />함께 달려드립니다
          </h1>
          <p className="text-sm text-gray-500">7일 무료 체험 · 언제든 해지 가능</p>
        </div>

        {/* 플랜 카드 */}
        {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
          const planKey = key as 'free' | 'pro' | 'team'
          const Icon    = ICONS[planKey]
          const colors  = COLORS[planKey]
          const isPro   = planKey === 'pro'

          return (
            <div key={key} className={`rounded-2xl border-2 overflow-hidden ${
              isPro ? 'border-indigo-600 shadow-xl shadow-indigo-100' : colors.border
            }`}>
              {/* 카드 헤더 */}
              <div className={`px-5 py-5 ${isPro ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isPro ? 'bg-white/20' : 'bg-indigo-50'
                    }`}>
                      <Icon size={16} className={isPro ? 'text-white' : 'text-indigo-600'} />
                    </div>
                    <span className="font-bold">{plan.name}</span>
                  </div>
                  {colors.badge && (
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      isPro ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>{colors.badge}</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">
                    {plan.priceKrw === 0 ? '무료' : `₩${plan.priceKrw.toLocaleString()}`}
                  </span>
                  {plan.priceKrw > 0 && (
                    <span className={`text-sm ${isPro ? 'text-indigo-200' : 'text-gray-400'}`}>/월</span>
                  )}
                </div>
                {planKey === 'pro' && (
                  <p className="text-indigo-200 text-xs mt-1">7일 무료 체험 후 결제</p>
                )}
              </div>

              {/* 기능 목록 */}
              <div className="bg-white px-5 py-4 space-y-2.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className={isPro ? 'text-indigo-500' : 'text-emerald-500'} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="bg-white px-5 pb-5">
                {planKey === 'free' ? (
                  <Link href="/analyze"
                    className="block w-full py-3.5 text-center border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-sm">
                    무료로 시작하기
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(planKey as 'pro' | 'team')}
                    disabled={loading === planKey}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                      isPro
                        ? 'bg-indigo-600 text-white active:bg-indigo-800 shadow-lg shadow-indigo-200'
                        : 'border-2 border-slate-300 text-slate-700 active:bg-slate-50'
                    }`}
                  >
                    {loading === planKey
                      ? <div className="w-4 h-4 rounded-full border-2 border-current/40 border-t-current animate-spin" />
                      : <>{isPro ? '7일 무료 체험 시작' : '문의하기'} <ArrowRight size={15} /></>
                    }
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* 신뢰 배지 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <p className="font-semibold text-gray-900 text-sm text-center">결제 안전 보장</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              '256-bit SSL 암호화',
              'Stripe 결제 보안',
              '언제든 해지 가능',
              '7일 환불 보장',
            ].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-gray-500">
                <CheckCircle2 size={12} className="text-emerald-500" />{t}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <p className="font-semibold text-gray-900 text-sm">자주 묻는 질문</p>
          {[
            { q: '무료 체험은 어떻게 되나요?', a: '7일 동안 Pro 기능을 무료로 사용하세요. 체험 종료 전에 해지하면 요금이 청구되지 않아요.' },
            { q: '해지는 어떻게 하나요?', a: '대시보드 > 설정에서 언제든 해지 가능합니다. 즉시 처리되고 남은 기간은 사용할 수 있어요.' },
            { q: 'B2B 기능이 뭔가요?', a: '기업 HR팀을 위한 직원 이탈 위험도 분석 리포트예요. 문의를 통해 맞춤 견적을 받아보세요.' },
          ].map((faq) => (
            <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-1.5">
              <p className="font-semibold text-gray-800 text-sm">{faq.q}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
