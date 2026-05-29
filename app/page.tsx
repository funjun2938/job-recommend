import Link from 'next/link'
import { ArrowRight, CheckCircle2, Lock, Sparkles, TrendingUp, Shield, Star, Zap } from 'lucide-react'
import { SocialProof } from '@/components/landing/SocialProof'

const TESTIMONIALS = [
  { text: '"막막했던 이직 방향이 3분 만에 잡혔어요"', role: '개발 5년차' },
  { text: '"실제 연봉 비교까지 해줘서 협상할 때 도움됐어요"', role: '마케터 3년차' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Hero */}
      <div className="flex-1 flex flex-col px-5 pt-12 pb-6">
        {/* 로고 */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">이직추천</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/pricing" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              <Zap size={11} /> Pro
            </Link>
            <Link href="/dashboard" className="text-xs text-gray-400 font-medium">대시보드</Link>
          </div>
        </div>

        {/* 메인 카피 */}
        <div className="flex-1 flex flex-col justify-center space-y-5">
          <div className="inline-flex w-fit items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Sparkles size={12} />
            Gemini AI 기반 · 이직 방향 분석
          </div>

          <h1 className="text-[2.1rem] font-black text-gray-900 leading-[1.15] tracking-tight">
            당신의 이직,<br />
            <span className="text-indigo-600">AI가 먼저<br />찾아드립니다</span>
          </h1>

          <p className="text-gray-500 text-[15px] leading-relaxed">
            현재 상황을 알려주시면<br />
            맞춤 기업군 · 갭 분석 · 실채용공고까지<br />
            한 번에 드려요
          </p>

          {/* 소셜 증거 카운터 */}
          <SocialProof />

          {/* 신뢰 배지 */}
          <div className="flex flex-col gap-1.5 pt-1">
            {[
              { icon: Shield,       text: '회사 정보 익명 처리 — 집계 데이터로만 활용' },
              { icon: Lock,         text: '개인 식별 정보 미수집' },
              { icon: CheckCircle2, text: '완전 무료 · 로그인 불필요' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                <Icon size={13} className="text-emerald-500 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-6">
          <Link
            href="/analyze"
            className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 active:bg-indigo-800 text-white font-black text-base rounded-2xl transition-all active:scale-[0.97] shadow-xl shadow-indigo-200"
          >
            무료로 분석받기
            <ArrowRight size={18} />
          </Link>
          <p className="text-center text-xs text-gray-400">평균 38초 · 결과 즉시 공유 가능</p>
        </div>
      </div>

      {/* 어떻게 작동하나요 */}
      <div className="bg-gray-50 px-5 py-8 space-y-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
          How it works
        </p>

        <div className="space-y-4">
          {[
            { n: '01', emoji: '📋', title: '현황 입력 (1분)', desc: '직무·경력·연봉·스킬을 버튼 탭으로 빠르게' },
            { n: '02', emoji: '🔒', title: '회사 정보 교환 (1분)', desc: '실제 연봉·퇴사 이유를 익명으로 — 더 정확한 추천의 열쇠' },
            { n: '03', emoji: '✨', title: '맞춤 추천 공개', desc: '추천 기업군·이직 준비도·연봉 시장 위치·실채용공고 확인' },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-4 bg-white rounded-2xl p-4 border border-gray-100">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 후기 */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
            사용자 후기
          </p>
          {TESTIMONIALS.map((t) => (
            <div key={t.text} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{t.text}</p>
              <p className="text-xs text-gray-400 mt-1.5">{t.role}</p>
            </div>
          ))}
        </div>

        {/* 미리보기 결과 */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">🎯 추천 기업군</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">상향이직</span>
            </div>
            {[
              { name: '테크 유니콘', score: 92, blur: false },
              { name: '대형 IT기업', score: 78, blur: true  },
              { name: '외국계 테크', score: 65, blur: true  },
            ].map((c) => (
              <div key={c.name} className={`flex items-center justify-between p-3 rounded-xl bg-gray-50 ${c.blur ? 'blur-sm select-none' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100" />
                  <span className="text-sm font-medium text-gray-700">{c.name}</span>
                </div>
                <span className="text-sm font-bold text-indigo-600">{c.score}%</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow border border-gray-200">
              <Lock size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-600">분석 후 전체 공개</span>
            </div>
          </div>
        </div>

        <Link
          href="/analyze"
          className="flex items-center justify-center gap-1.5 w-full py-4 bg-indigo-600 text-white font-bold text-sm rounded-2xl active:opacity-80 transition-opacity shadow-lg shadow-indigo-200"
        >
          지금 바로 시작하기 <ArrowRight size={16} />
        </Link>
      </div>

      <footer className="border-t border-gray-100 py-5 text-center text-[11px] text-gray-400 bg-white">
        © 2025 이직추천 · 익명 집계 · 개인정보 미수집
      </footer>
    </div>
  )
}
