'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, MapPin, Briefcase, Clock, ChevronRight } from 'lucide-react'
import type { JobPosting } from '@/lib/jobs'

interface Props {
  jobCategory: string
}

export function LiveJobs({ jobCategory }: Props) {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [source, setSource] = useState<'saramin' | 'mock'>('mock')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/jobs?category=${encodeURIComponent(jobCategory)}`)
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.jobs ?? [])
        setSource(data.source)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [jobCategory])

  const isExpiringSoon = (deadline: string) => {
    if (deadline === '채용시까지' || deadline === '미정') return false
    const diff = new Date(deadline).getTime() - Date.now()
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
  }

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📌</span>
          <h2 className="font-semibold text-gray-900">지금 열린 채용공고</h2>
        </div>
        {!loading && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            source === 'saramin'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {source === 'saramin' ? '사람인 실시간' : '예시 데이터'}
          </span>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <a
              key={job.id}
              href={job.url === '#' ? undefined : job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl border border-gray-100 p-4 active:bg-gray-50 transition-colors group"
            >
              <div className="flex gap-3">
                {/* 회사 아바타 */}
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-indigo-600">
                    {job.company[0]}
                  </span>
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs text-gray-400 font-medium truncate">
                      {job.company}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors"
                    />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5 leading-snug line-clamp-2">
                    {job.title}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={11} />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Briefcase size={11} />
                      {job.experience}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-semibold text-indigo-600">
                      {job.salary}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${
                      isExpiringSoon(job.deadline)
                        ? 'text-red-500 font-semibold'
                        : 'text-gray-400'
                    }`}>
                      <Clock size={10} />
                      {job.deadline === '채용시까지' ? '상시채용' : `~${job.deadline}`}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {source === 'mock' && !loading && (
        <p className="text-xs text-gray-400 text-center pt-1">
          실제 공고 연동은 SARAMIN_API_KEY 설정 후 활성화돼요
        </p>
      )}
    </div>
  )
}
