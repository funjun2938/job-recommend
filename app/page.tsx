import Link from 'next/link'
import { ArrowRight, CheckCircle2, Lock, Sparkles, TrendingUp, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 상단 상태바 영역 */}
      <div className="h-safe-top bg-white" />

      {/* Hero - 풀스크린 느낌 */}
      <div className="flex-1 flex flex-col px-6 pt-12 pb-6">
        {/* 로고 */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">이직추천</span>
        </div>

        {/* 메인 카피 */}
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <div className="inline-flex w-fit items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Sparkles size={12} />
            AI 기반 이직 방향 분석
          </div>

          <h1 className="text-[2rem] font-bold text-gray-900 leading-tight tracking-tight">
            당신의 이직,<br />
            <span className="text-indigo-600">AI가 먼저<br />찾아드립니다</span>
          </h1>

          <p className="text-gray-500 text-base leading-relaxed">
            현재 상황을 알려주시면<br />
            맞춤 기업군·갭 분석·채용공고까지<br />
            한번에 드려요
          </p>

          {/* 핵심 가치 */}
          <div className="flex flex-col gap-2 pt-2">
            {[
              { icon: Shield, text: '회사 정보 익명 처리' },
              { icon: Lock, text: '개인 식별 정보 미수집' },
              { icon: CheckCircle2, text: '완전 무료' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
                <Icon size={14} className="text-emerald-500" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-8">
          <Link
            href="/analyze"
            className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-200"
          >
            무료로 분석받기
            <ArrowRight size={18} />
          </Link>
          <p className="text-center text-xs text-gray-400">3분 소요 · 로그인 불필요</p>
        </div>
      </div>

      {/* 하단 — 어떻게 작동하나요 */}
      <div className="bg-gray-50 px-6 py-8 space-y-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">
          어떻게 작동하나요
        </p>
        <div className="space-y-4">
          {[
            { step: '01', title: '현황 입력', desc: '직무·경력·연봉을 버튼으로 빠르게' },
            { step: '02', title: '회사 정보 교환', desc: '실제 연봉·이직 이유를 익명으로 제공' },
            { step: '03', title: '맞춤 추천 공개', desc: '기업군·갭 분석·실채용공고 확인' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <span className="text-2xl font-black text-indigo-100 w-8 flex-shrink-0 leading-none">
                {item.step}
              </span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 미리보기 카드 */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white mt-6">
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">추천 기업군</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">상향이직</span>
            </div>
            {['테크 유니콘 · 92%', '대형 IT기업 · 78%'].map((t, i) => (
              <div key={t} className={`flex items-center gap-2 p-2.5 rounded-xl ${i === 0 ? 'blur-none' : 'blur-sm'} bg-gray-50`}>
                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700">{t}</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow border border-gray-200">
              <Lock size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">분석 후 공개</span>
            </div>
          </div>
        </div>

        <Link
          href="/analyze"
          className="flex items-center justify-center gap-1.5 w-full py-3.5 border-2 border-indigo-200 text-indigo-600 font-semibold text-sm rounded-2xl hover:bg-indigo-50 transition-all"
        >
          지금 시작하기 <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
