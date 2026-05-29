'use client'

import Link from 'next/link'
import { Lock, Zap } from 'lucide-react'

interface Props {
  feature: string
  description?: string
}

export function PremiumGate({ feature, description }: Props) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto">
        <Lock size={20} className="text-indigo-600" />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-gray-900">{feature}</p>
        <p className="text-sm text-gray-500">
          {description ?? 'Pro 플랜으로 업그레이드하면 이 기능을 사용할 수 있어요'}
        </p>
      </div>
      <Link
        href="/pricing"
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm"
      >
        <Zap size={15} /> Pro로 업그레이드
      </Link>
      <p className="text-xs text-gray-400">7일 무료 체험 · 언제든 해지 가능</p>
    </div>
  )
}
