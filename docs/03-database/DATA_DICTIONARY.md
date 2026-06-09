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

---

# 명함첩 연동 테이블 (v2)

## user_profiles

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 자동 생성 |
| auth_user_id | UUID | UNIQUE | Supabase auth 사용자 (있을 경우) |
| session_id | TEXT | nullable | 비로그인 세션 키 |
| current_company | TEXT | nullable | 사용자 현재 회사 |
| current_job_category | TEXT | nullable | 사용자 직군 |
| namecard_provider | TEXT | DEFAULT 'remember' | 명함첩 제공자 |
| namecard_synced_at | TIMESTAMPTZ | nullable | 최근 동기화 시각 |
| namecard_count | INTEGER | DEFAULT 0 | 보유 명함 수 |
| consent_network | BOOLEAN | DEFAULT false | 익명 집계 활용 동의 |

## namecards

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 자동 생성 |
| owner_id | UUID | FK→user_profiles | 명함첩 소유자 |
| contact_hash | TEXT | NOT NULL | 연락처 해시 (이름/연락처 평문 미저장) |
| company_name | TEXT | NOT NULL | 명함의 회사 = 네트워크 노드 |
| job_title | TEXT | nullable | 직함 |
| job_category | TEXT | nullable | 직군 |
| industry | TEXT | nullable | 산업 |
| company_size | TEXT | nullable | 회사 규모 |
| seniority | TEXT | nullable | `실무`/`리더`/`임원` |
| exchanged_at | DATE | nullable | 명함 교환 시점 |
| is_current | BOOLEAN | DEFAULT true | 해당 연락처 최신 명함 여부 |

## contact_transitions

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 자동 생성 |
| contact_hash | TEXT | NOT NULL | 이직한 사람 (비식별) |
| from_company | TEXT | NOT NULL | 이전 회사 |
| to_company | TEXT | NOT NULL | 이직한 회사 |
| job_category | TEXT | nullable | 직군 |
| transitioned_at | DATE | nullable | 이직 추정 시점 |
| observed_count | INTEGER | DEFAULT 1 | 관측된 명함첩 수 (교차검증) |

## company_network_edges

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| company_a | TEXT | NOT NULL (a<b) | 무방향 엣지 한쪽 |
| company_b | TEXT | NOT NULL | 무방향 엣지 다른쪽 |
| job_category | TEXT | nullable | 직군별 분해 |
| edge_weight | INTEGER | DEFAULT 1 | 동시 등장(co-occurrence) 횟수 |
| transition_weight | INTEGER | DEFAULT 0 | A↔B 이직 흐름 횟수 |

## career_paths

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| contact_hash | TEXT | UNIQUE | 한 사람의 커리어 궤적 |
| job_category | TEXT | nullable | 직군 |
| company_seq | TEXT[] | DEFAULT '{}' | 회사 시퀀스 (오래된→최신) |
| seniority_seq | TEXT[] | DEFAULT '{}' | 직급 시퀀스 |
| total_moves | SMALLINT | DEFAULT 0 | 이직 횟수 |

## recommendation_scores

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 자동 생성 |
| user_id | UUID | FK→user_profiles | 추천 대상 사용자 |
| company_name | TEXT | NOT NULL | 추천 회사 |
| survey_fit | DECIMAL(4,3) | 0~1 | 축①: 서베이 적합도 |
| network_proximity | DECIMAL(4,3) | 0~1 | 축②: 네트워크 근접도 |
| career_similarity | DECIMAL(4,3) | 0~1 | 축③: 커리어 경로 유사도 |
| weight_survey | DECIMAL(4,3) | DEFAULT 0.50 | 서베이 가중치 |
| weight_network | DECIMAL(4,3) | DEFAULT 0.25 | 네트워크 가중치 |
| weight_career | DECIMAL(4,3) | DEFAULT 0.25 | 커리어 가중치 |
| final_score | DECIMAL(5,4) | 트리거 계산 | 가중 합산 최종 점수 |
| calculated_at | TIMESTAMPTZ | NOT NULL | 계산 시각 |

> `final_score = survey_fit·w_survey + network_proximity·w_network + career_similarity·w_career`
> (BEFORE INSERT/UPDATE 트리거 `compute_final_score()` 가 자동 계산)

---

### seniority (namecards / transitions)
`실무` `리더` `임원`

### namecard_provider
`remember` `rolodex` `linkedin`
