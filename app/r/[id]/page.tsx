import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SharedResultView } from './SharedResultView'
import type { AnalysisResult, Stage1Data } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function fetchResult(id: string) {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:4200'

  const res = await fetch(`${base}/api/results/${id}`, { next: { revalidate: 300 } })
  if (!res.ok) return null
  return res.json() as Promise<{ result: AnalysisResult; stage1: Stage1Data; createdAt: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const data = await fetchResult(id)
  if (!data) return { title: '결과를 찾을 수 없어요 — 이직추천' }

  return {
    title: `${data.stage1.jobCategory} ${data.result.directionType} 분석 — 이직추천`,
    description: data.result.diagnosis?.slice(0, 120),
    openGraph: {
      title: `${data.stage1.jobCategory} 이직 분석 결과`,
      description: `${data.result.directionType} 방향 · ${data.result.recommendations?.[0]?.fitScore ?? 0}% 매칭`,
    },
  }
}

export default async function SharedResultPage({ params }: PageProps) {
  const { id } = await params
  const data = await fetchResult(id)
  if (!data) notFound()

  return <SharedResultView result={data.result} stage1={data.stage1} createdAt={data.createdAt} />
}
