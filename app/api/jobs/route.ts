import { fetchSaraminJobs, getMockJobs } from '@/lib/jobs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobCategory = searchParams.get('category') ?? '개발·엔지니어'

  const saraminJobs = await fetchSaraminJobs(jobCategory, 8)
  const jobs = saraminJobs.length > 0 ? saraminJobs : getMockJobs(jobCategory)

  return Response.json({ jobs, source: saraminJobs.length > 0 ? 'saramin' : 'mock' })
}
