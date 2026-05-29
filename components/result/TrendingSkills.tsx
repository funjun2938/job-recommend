'use client'

import { TrendingUp } from 'lucide-react'

interface SkillTrend {
  name: string
  demand: number    // 0~100
  growth: number    // 전월 대비 %
  hot: boolean
}

const SKILL_DATA: Record<string, SkillTrend[]> = {
  '개발·엔지니어': [
    { name: 'TypeScript', demand: 94, growth: 12, hot: true  },
    { name: 'Next.js',    demand: 87, growth: 18, hot: true  },
    { name: 'Kubernetes', demand: 78, growth: 9,  hot: false },
    { name: 'Rust',       demand: 55, growth: 31, hot: true  },
    { name: 'Python/AI',  demand: 91, growth: 22, hot: true  },
  ],
  '기획·PM': [
    { name: '데이터 분석',  demand: 89, growth: 15, hot: true  },
    { name: 'SQL',         demand: 82, growth: 11, hot: false },
    { name: 'AI 프롬프팅', demand: 76, growth: 45, hot: true  },
    { name: 'A/B 테스트',  demand: 74, growth: 8,  hot: false },
    { name: 'Figma',       demand: 68, growth: 5,  hot: false },
  ],
  '마케팅·광고': [
    { name: 'GA4',          demand: 91, growth: 25, hot: true  },
    { name: '퍼포먼스 마케팅', demand: 88, growth: 10, hot: false },
    { name: 'AI 콘텐츠',   demand: 79, growth: 52, hot: true  },
    { name: 'CRM/이메일',  demand: 72, growth: 14, hot: false },
    { name: 'SQL',          demand: 65, growth: 18, hot: true  },
  ],
  '영업·BD': [
    { name: 'B2B SaaS 영업', demand: 87, growth: 20, hot: true  },
    { name: 'Salesforce CRM', demand: 81, growth: 12, hot: false },
    { name: 'LinkedIn 세일즈', demand: 74, growth: 28, hot: true },
    { name: '계약 협상',    demand: 79, growth: 5,  hot: false },
    { name: 'HubSpot',     demand: 62, growth: 16, hot: false },
  ],
  '금융·회계': [
    { name: 'Python 재무',  demand: 83, growth: 31, hot: true  },
    { name: 'SQL/BI',      demand: 79, growth: 18, hot: true  },
    { name: 'ESG 리포팅',  demand: 72, growth: 41, hot: true  },
    { name: 'IFRS 17',     demand: 76, growth: 8,  hot: false },
    { name: 'Power BI',    demand: 68, growth: 22, hot: false },
  ],
}

interface Props {
  jobCategory: string
  userSkills: string[]
}

export function TrendingSkills({ jobCategory, userSkills }: Props) {
  const skills = SKILL_DATA[jobCategory] ?? SKILL_DATA['개발·엔지니어']
  const lowerSkills = userSkills.map((s) => s.toLowerCase())
  const hasSkill = (name: string) =>
    lowerSkills.some((s) => name.toLowerCase().includes(s) || s.includes(name.toLowerCase().split('/')[0]))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-indigo-500" />
        <h2 className="font-semibold text-gray-900">지금 뜨는 스킬</h2>
        <span className="ml-auto text-xs text-gray-400">{jobCategory}</span>
      </div>

      <div className="space-y-2.5">
        {skills.map((skill) => {
          const have = hasSkill(skill.name)
          return (
            <div key={skill.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${have ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {skill.name}
                  </span>
                  {skill.hot && (
                    <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                      HOT
                    </span>
                  )}
                  {have && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full">
                      보유
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-emerald-600 font-semibold">
                    +{skill.growth}%
                  </span>
                  <span className="text-xs text-gray-400">{skill.demand}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    have ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${skill.demand}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400">
        * 수요 지수는 최근 30일 채용공고 기준 추산
      </p>
    </div>
  )
}
