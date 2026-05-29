import type { MetadataRoute } from 'next'

const BASE = 'https://job-recommend-phi.vercel.app'

const JOB_CATEGORIES = [
  '개발-엔지니어',
  '기획-PM',
  '마케팅-광고',
  '영업-BD',
  '디자인-UX',
  '금융-회계',
  'HR-총무',
  '제조-생산',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,            lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/analyze`,  lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/pricing`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/dashboard`,lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
  ]

  return [...staticPages]
}
