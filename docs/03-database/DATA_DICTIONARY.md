# 데이터 사전 (Data Dictionary)

## company_insights

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 자동 생성 |
| created_at | TIMESTAMPTZ | NOT NULL | 생성 시각 |
| job_category | TEXT | NOT NULL | 직군 (예: 개발·엔지니어) |
| experience_years | TEXT | NOT NULL | 경력 구간 (예: 3~5년) |
| salary_range | TEXT | NOT NULL | 연봉 구간 (예: 4~5천만원) |
| skills | TEXT[] | DEFAULT '{}' | 스킬/역량 배열 |
| company_size | TEXT | NOT NULL | 회사 규모 |
| company_name | TEXT | nullable | 회사명 (선택 입력) |
| job_level | TEXT | nullable | 직급 |
| actual_salary | INTEGER | 500~100000 | 실제 연봉 (만원) |
| resignation_reasons | TEXT[] | DEFAULT '{}' | 이직 고민 이유 배열 |
| pros | TEXT[] | DEFAULT '{}' | 회사 장점 배열 |
| cons | TEXT[] | DEFAULT '{}' | 회사 단점 배열 |
| mgmt_trust_score | SMALLINT | 1~5 | 경영진 신뢰도 |
| stay_probability | SMALLINT | 0~100 | 1년 후 재직 의향 (%) |
| nps_score | SMALLINT | 0~10 | 회사 추천 의향 (NPS) |
| is_verified | BOOLEAN | DEFAULT false | 인증 여부 (향후) |

---

## alert_subscriptions

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 자동 생성 |
| created_at | TIMESTAMPTZ | NOT NULL | 가입 시각 |
| email | TEXT | NOT NULL | 이메일 주소 |
| job_category | TEXT | nullable | 관심 직군 |
| company_size | TEXT | nullable | 선호 회사 규모 |
| timeline | TEXT | nullable | 이직 타임라인 |
| is_active | BOOLEAN | NOT NULL | 활성 여부 |
| unsubscribed_at | TIMESTAMPTZ | nullable | 구독 해제 시각 |

---

## analysis_cache

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 자동 생성 |
| created_at | TIMESTAMPTZ | NOT NULL | 캐시 생성 시각 |
| cache_key | TEXT | UNIQUE | MD5(stage1 JSON) |
| stage1_hash | TEXT | NOT NULL | 원본 해시 |
| result_json | JSONB | NOT NULL | AI 분석 결과 JSON |
| hit_count | INTEGER | DEFAULT 0 | 캐시 히트 횟수 |
| expires_at | TIMESTAMPTZ | NOT NULL | 만료 시각 (7일) |

---

## company_reputation

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| company_name | TEXT | UNIQUE | 회사명 |
| avg_nps | DECIMAL(4,2) | nullable | 평균 NPS |
| avg_mgmt_trust | DECIMAL(4,2) | nullable | 평균 경영진 신뢰도 |
| avg_stay_prob | DECIMAL(5,2) | nullable | 평균 재직 의향 (%) |
| top_pros | TEXT[] | DEFAULT '{}' | 상위 장점 목록 |
| top_cons | TEXT[] | DEFAULT '{}' | 상위 단점 목록 |
| top_exit_reasons | TEXT[] | DEFAULT '{}' | 주요 퇴사 이유 |
| insight_count | INTEGER | NOT NULL | 집계 기여 수 |

---

## salary_benchmarks

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| job_category | TEXT | NOT NULL | 직군 |
| company_size | TEXT | NOT NULL | 회사 규모 |
| experience_min | SMALLINT | nullable | 최소 경력 (년) |
| experience_max | SMALLINT | nullable | 최대 경력 (년) |
| salary_p25 | INTEGER | nullable | 하위 25% 연봉 (만원) |
| salary_p50 | INTEGER | nullable | 중앙값 연봉 (만원) |
| salary_p75 | INTEGER | nullable | 상위 25% 연봉 (만원) |
| sample_count | INTEGER | NOT NULL | 표본 수 |

---

## 코드값 정의

### job_category
`개발·엔지니어` `기획·PM` `마케팅·광고` `영업·BD` `디자인·UX` `금융·회계` `HR·총무` `제조·생산` `기타`

### company_size
`스타트업` `중소기업` `중견기업` `대기업` `외국계` `공기업`

### job_level
`사원·주임` `대리·선임` `과장·책임` `차부장·수석` `임원+` `스타트업-레벨`

### timeline (alert_subscriptions)
`3개월 내` `6개월 내` `1년 내` `미정`
