/* 추천 설계 검증 — 여러 더미 세트로 카테고리 해석·추천·네트워크·Hybrid v3·밍글 점검.
   실행: npx tsx scripts/verify-reco.ts
*/
import { getCategory, CATEGORIES } from '../lib/categories'
import { getMockResult } from '../lib/mock-result'
import { buildNetworkAnalysis } from '../lib/network'
import type { Stage1Data } from '../lib/types'

let pass = 0, fail = 0
const ok = (cond: boolean, msg: string) => { if (cond) { pass++; console.log('   ✅ ' + msg) } else { fail++; console.log('   ❌ ' + msg) } }

function show(label: string, stage1: Stage1Data, extra: string[] = []) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`▶ ${label}  | jobCategory="${stage1.jobCategory}"${extra.length ? ` + mingle[${extra.join(', ')}]` : ''}`)
  const dom = getCategory(stage1.jobCategory)
  console.log(`   해석된 대분류: ${dom.label} (${dom.directionType})`)

  const result = getMockResult(stage1)
  console.log(`   추천 방향: ${result.directionType}`)
  result.recommendations.slice(0, 3).forEach((r, i) =>
    console.log(`   추천${i + 1}: [${r.fitScore}] ${r.category} → ${r.companies.slice(0, 3).join(', ')}`))

  const analysis = buildNetworkAnalysis(stage1, extra)
  const topNet = analysis.networkMap.companies.slice(0, 5).map((c) => c.company)
  console.log(`   네트워크 맵 top5: ${topNet.join(', ')}`)
  const w = analysis.weights
  const top = analysis.scores[0]
  console.log(`   Hybrid v3 1위: ${top.company}  final=${top.finalScore} (cbf ${top.cbf}/cf ${top.cf}/graph ${top.graph}/net ${top.network})`)

  // 검증
  ok(dom.recommendations.length === 3, '대분류 추천 3개 보유')
  ok(result.recommendations.every((r) => r.fitScore >= 0 && r.fitScore <= 100), 'fitScore 0~100 범위')
  ok(Math.abs(w.cbf + w.cf + w.graph + w.network - 1) < 1e-9, `Hybrid 가중치 합=1 (${w.cbf}/${w.cf}/${w.graph}/${w.network})`)
  // final = cbf*0.4 + cf*0.3 + graph*0.2 + net*0.1 검산
  const recompute = +(top.cbf * w.cbf + top.cf * w.cf + top.graph * w.graph + top.network * w.network).toFixed(3)
  ok(Math.abs(recompute - top.finalScore) < 0.01, `final 가중합 일치 (계산 ${recompute} ≈ ${top.finalScore})`)
  ok(analysis.scores.every((s, i) => i === 0 || s.finalScore <= analysis.scores[i - 1].finalScore), 'final 내림차순 정렬')
  return { dom, analysis, topNet }
}

console.log('================ 추천 설계 검증 ================')
console.log(`등록된 대분류 수: ${CATEGORIES.length}`)

const base = { experienceYears: '3~5년', salaryRange: '5~6천만원', skills: [], companySize: '스타트업' }

// 1) 전 직군 대표 더미 세트
const cat = (jobCategory: string, skills: string[] = []): Stage1Data => ({ ...base, jobCategory, skills })
show('개발', cat('백엔드 개발', ['TypeScript', 'Node.js']))
show('금융', cat('재무', ['재무기획', 'IR']))
show('마케팅', cat('브랜드 마케팅', ['브랜드전략']))
show('의료', cat('간호사'))
show('제조', cat('생산관리'))
show('법무', cat('사내변호사'))
show('교육', cat('교육과정 기획'))
show('커스텀(미정의)', cat('핀테크 그로스 해커'))

// 2) 밍글 검증: 재무(직접입력 우선) + 백엔드(GitHub) 분석 결합
console.log('\n\n================ 밍글(다중 소스) 검증 ================')
const financeOnly = buildNetworkAnalysis(cat('재무'), [])
const mingled = show('재무(팩트) + 개발(분석 밍글)', cat('재무'), ['백엔드 개발'])
const devCos = new Set(getCategory('백엔드 개발').networkCompanies.map((c) => c.name))
const finCos = new Set(getCategory('재무').networkCompanies.map((c) => c.name))
const mingledCos = new Set(mingled.analysis.networkMap.companies.map((c) => c.company))
const hasDev = [...mingledCos].some((c) => devCos.has(c))
const hasFin = [...mingledCos].some((c) => finCos.has(c))
ok(hasFin, '밍글 결과에 재무(주직군) 회사 포함')
ok(hasDev, '밍글 결과에 개발(보조소스) 회사 포함')
ok(mingled.analysis.networkMap.companies.length >= financeOnly.networkMap.companies.length, '밍글 시 회사 풀이 단일보다 같거나 큼')

// 3) 전 직군 회귀: 모든 대분류가 추천/네트워크 정상 생성
console.log('\n\n================ 전 직군 회귀 ================')
let regOk = 0
for (const c of CATEGORIES) {
  const a = buildNetworkAnalysis(cat(c.label), [])
  const r = getMockResult(cat(c.label))
  if (r.recommendations.length === 3 && a.networkMap.companies.length > 0 && a.scores.length > 0) regOk++
  else console.log(`   ❌ ${c.label} 비정상`)
}
ok(regOk === CATEGORIES.length, `전 직군(${CATEGORIES.length}) 추천·네트워크 정상 생성 (${regOk}/${CATEGORIES.length})`)

console.log('\n================ 결과 ================')
console.log(`PASS ${pass} / FAIL ${fail}`)
if (fail > 0) process.exit(1)
