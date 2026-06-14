'use client'

import { TrendingUp } from 'lucide-react'
import { signInWithGoogle, signInWithKakao } from '@/lib/auth'
import { toast } from 'sonner'

export default function AuthPage() {
  async function handleGoogle() {
    try { await signInWithGoogle() }
    catch { toast.error('로그인 중 오류가 발생했어요') }
  }

  async function handleKakao() {
    try { await signInWithKakao() }
    catch { toast.error('로그인 중 오류가 발생했어요') }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white space-y-8">
      {/* 로고 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
          <TrendingUp size={24} className="text-white" />
        </div>
        <div>
          <p className="font-black text-xl text-gray-900">careerly</p>
          <p className="text-xs text-gray-400">AI 맞춤 이직처 분석</p>
        </div>
      </div>

      {/* 타이틀 */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900">로그인 / 회원가입</h1>
        <p className="text-sm text-gray-500">
          소셜 계정으로 바로 시작하세요<br />
          분석 결과와 히스토리가 저장돼요
        </p>
      </div>

      {/* 로그인 버튼 */}
      <div className="w-full space-y-3 max-w-xs">
        <button
          onClick={handleKakao}
          className="w-full flex items-center gap-3 py-4 px-5 rounded-2xl font-bold text-sm bg-[#FEE500] text-[#181600] active:opacity-80 transition-opacity shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.75 1.67 5.17 4.2 6.57L5.1 21l4.64-2.43c.74.13 1.51.2 2.26.2 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
          </svg>
          카카오로 로그인
        </button>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center gap-3 py-4 px-5 rounded-2xl font-bold text-sm bg-white border-2 border-gray-200 text-gray-800 active:bg-gray-50 transition-colors shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 로그인
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        로그인하면 개인정보처리방침에 동의한 것으로 간주합니다
      </p>
    </div>
  )
}
