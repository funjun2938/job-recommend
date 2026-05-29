'use client'

import { Shield, Lock, EyeOff, Database } from 'lucide-react'

export function DataPrivacyBadge() {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Shield size={16} className="text-slate-500" />
        <p className="text-sm font-semibold text-slate-700">데이터 보호 안내</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: EyeOff,   text: '개인 식별 정보 없음' },
          { icon: Lock,     text: '회사명 선택 입력' },
          { icon: Database, text: '집계 통계로만 활용' },
          { icon: Shield,   text: 'Supabase RLS 보호' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
            <Icon size={13} className="flex-shrink-0" />
            {text}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        입력하신 정보는 암호화되어 저장되며, 특정 개인을 식별하는 데 사용되지 않습니다.
        익명 집계 데이터는 서비스 품질 향상에만 활용됩니다.
      </p>
    </div>
  )
}
