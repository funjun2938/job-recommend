# 이직추천 서비스 — ERD 설계

> 작성일: 2026-05-29

---

## 엔티티 관계도 (ERD)

```
┌─────────────────────────┐       ┌──────────────────────────────────┐
│      company_insights    │       │       alert_subscriptions         │
│─────────────────────────│       │──────────────────────────────────│
│ id           UUID PK     │       │ id            UUID PK             │
│ created_at   TIMESTAMPTZ │       │ created_at    TIMESTAMPTZ         │
│ session_id   TEXT        │       │ email         TEXT  UNIQUE        │
│ job_category TEXT        │       │ job_category  TEXT                │
│ experience_years TEXT    │       │ company_size  TEXT                │
│ salary_range TEXT        │       │ timeline      TEXT                │
│ skills       TEXT[]      │       │ is_active     BOOLEAN DEFAULT true│
│ company_size TEXT        │       │ unsubscribed_at TIMESTAMPTZ       │
│ company_name TEXT        │       └──────────────────────────────────┘
│ job_level    TEXT        │
│ actual_salary INT        │       ┌──────────────────────────────────┐
│ resignation_reasons TEXT[]│      │       analysis_cache              │
│ pros         TEXT[]      │       │──────────────────────────────────│
│ cons         TEXT[]      │       │ id            UUID PK             │
│ mgmt_trust   SMALLINT    │       │ created_at    TIMESTAMPTZ         │
│ stay_probability SMALLINT│       │ cache_key     TEXT UNIQUE         │
│ nps_score    SMALLINT    │       │ stage1_hash   TEXT                │
│ is_verified  BOOLEAN     │       │ result_json   JSONB               │
└─────────────────────────┘       │ hit_count     INT DEFAULT 0       │
                                   │ expires_at    TIMESTAMPTZ         │
                                   └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       salary_benchmarks                              │
│─────────────────────────────────────────────────────────────────────│
│ id              UUID PK                                              │
│ job_category    TEXT   NOT NULL                                      │
│ company_size    TEXT   NOT NULL                                      │
│ experience_min  SMALLINT                                             │
│ experience_max  SMALLINT                                             │
│ salary_p25      INT    (25th percentile, 만원)                       │
│ salary_p50      INT    (중앙값, 만원)                                 │
│ salary_p75      INT    (75th percentile, 만원)                       │
│ sample_count    INT                                                  │
│ updated_at      TIMESTAMPTZ                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       company_reputation                             │
│─────────────────────────────────────────────────────────────────────│
│ id              UUID PK                                              │
│ company_name    TEXT   NOT NULL UNIQUE                               │
│ industry        TEXT                                                 │
│ size_category   TEXT                                                 │
│ avg_nps         DECIMAL(4,2)                                         │
│ avg_mgmt_trust  DECIMAL(4,2)                                         │
│ avg_stay_prob   DECIMAL(5,2)                                         │
│ top_pros        TEXT[]   -- 집계된 상위 장점                          │
│ top_cons        TEXT[]   -- 집계된 상위 단점                          │
│ top_exit_reasons TEXT[]  -- 집계된 이직 이유                          │
│ insight_count   INT      -- 누적 응답 수                              │
│ updated_at      TIMESTAMPTZ                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 명함첩 연동 — 외부 데이터 자산 축 (v2, 2026-06-10)

> 교수 피드백 반영: 사용자 서베이뿐 아니라 **명함첩(리멤버 류) 외부 데이터**를 연동해
> 추천의 근거를 확장한다. (실제 연동 가능성은 차치, 연동된다고 가정한 설계)
>
> - **명함첩 = 네트워킹 회사 맵** → "내 인맥이 닿아있는 회사" 추천 근거 (자산①)
> - **명함 교체 = 그 사람의 이직** → "유사 커리어를 탄 사람들의 다음 회사" 추천 근거 (자산②)

```
┌──────────────────────────┐        ┌───────────────────────────────┐
│       user_profiles       │ 1    N │           namecards            │
│──────────────────────────│────────│───────────────────────────────│
│ id              UUID PK   │ owner  │ id            UUID PK          │
│ auth_user_id    UUID UQ   │◀───────│ owner_id      UUID FK          │
│ session_id      TEXT      │        │ contact_hash  TEXT (비식별)     │
│ current_company TEXT      │        │ company_name  TEXT             │
│ namecard_provider TEXT    │        │ job_title / job_category TEXT  │
│ namecard_count  INT       │        │ industry / company_size TEXT  │
│ namecard_synced_at TS     │        │ seniority     TEXT            │
│ consent_network BOOL      │        │ exchanged_at  DATE           │
└──────────────────────────┘        │ is_current    BOOL           │
                                     └───────────────────────────────┘
                                                 │ 명함 교체 감지
                                                 ▼
┌───────────────────────────────────┐  ┌──────────────────────────────┐
│       contact_transitions          │  │      company_network_edges    │
│───────────────────────────────────│  │──────────────────────────────│
│ id             UUID PK             │  │ id            UUID PK         │
│ contact_hash   TEXT (그 사람)      │  │ company_a     TEXT (a<b)      │
│ from_company   TEXT                │─▶│ company_b     TEXT            │
│ to_company     TEXT                │  │ job_category  TEXT            │
│ job_category   TEXT                │  │ edge_weight   INT (동시등장)   │
│ transitioned_at DATE              │  │ transition_weight INT (이직흐름)│
│ observed_count INT (교차검증)      │  └──────────────────────────────┘
└───────────────────────────────────┘
                 │ 회사 시퀀스로 누적
                 ▼
┌───────────────────────────────────────────────────────────────────┐
│                          career_paths                              │
│───────────────────────────────────────────────────────────────────│
│ id            UUID PK                                              │
│ contact_hash  TEXT UNIQUE                                          │
│ job_category  TEXT                                                 │
│ company_seq   TEXT[]   -- 오래된→최신 회사 궤적                      │
│ seniority_seq TEXT[]                                               │
│ total_moves   SMALLINT -- 이직 횟수                                 │
└───────────────────────────────────────────────────────────────────┘
        │ recommend_by_career_path(company_seq, job_category) 함수
        ▼  유사 궤적 peer 들이 "다음에 간 회사" 빈도순 추천

┌───────────────────────────────────────────────────────────────────┐
│                      recommendation_scores                         │
│───────────────────────────────────────────────────────────────────│
│ id                UUID PK                                          │
│ user_id           UUID FK → user_profiles                         │
│ company_name      TEXT   -- 추천 대상 회사                          │
│ survey_fit        DECIMAL(4,3)  -- 서베이 적합도 (0~1)             │
│ network_proximity DECIMAL(4,3)  -- 네트워크 근접도 (0~1)           │
│ career_similarity DECIMAL(4,3)  -- 커리어 경로 유사도 (0~1)        │
│ weight_survey/network/career    -- 축별 가중치                     │
│ final_score       DECIMAL(5,4)  -- 가중 합산 (트리거 자동 계산)     │
└───────────────────────────────────────────────────────────────────┘
   ▲ 3축 점수를 합산해 최종 추천 랭킹으로 영속화 (재현/AB/튜닝용)
```

---

## 엔티티 관계 설명

| 관계 | 설명 |
|------|------|
| company_insights → company_reputation | company_name 기반 집계 (논리적 연관, FK 없음) |
| company_insights → salary_benchmarks | job_category + company_size + experience로 조인 가능 |
| alert_subscriptions | company_insights와 독립 (이메일만 저장) |
| analysis_cache | stage1 입력 해시 기반 캐싱, company_insights와 무관 |
| user_profiles → namecards | 1:N — 사용자 한 명의 명함첩 (FK, ON DELETE CASCADE) |
| namecards → company_network_edges | 동일 소유자 명함 간 co-occurrence 엣지 자동 집계 (트리거) |
| namecards → contact_transitions | 동일 contact_hash 의 회사 변경 감지 = 이직 이벤트 |
| contact_transitions → company_network_edges | A→B 이직 흐름이 transition_weight 로 누적 (트리거) |
| contact_transitions → career_paths | contact_hash 별 회사 시퀀스로 누적 |
| career_paths → 추천 | recommend_by_career_path() 함수로 유사 경로 기반 회사 추천 |
| user_profiles → recommendation_scores | 1:N — 사용자별 추천 점수 결과 영속화 (FK) |
| recommendation_scores → company_reputation | company_name 기준 추천 회사 평판 조인 |

---

## 데이터 흐름

```
[A] 서베이 축 (기존)
사용자 입력
    ├─ Stage1 (익명) ──→ analysis_cache 조회 (캐시 히트 시 즉시 반환)
    ├─ Stage2 (회사 정보) ──→ company_insights ──(트리거)─→ company_reputation
    ├─ Gemini API ──→ 분석 결과 ──→ analysis_cache 저장
    └─ 알림 신청 ──→ alert_subscriptions

[B] 명함첩 축 (신규 — 외부 데이터 연동)
명함첩 연동(리멤버) 
    ├─ namecards 동기화 ──(트리거)─→ company_network_edges (네트워크 맵 집계)
    │       │
    │       └─ 동일 연락처 회사 변경 감지 ──→ contact_transitions (이직 이벤트)
    │                                            ├─(트리거)→ company_network_edges (이직 흐름)
    │                                            └────────→ career_paths (커리어 궤적 누적)
    │
    └─ 추천 시점:
         ├─ 네트워크 맵 → "내 인맥이 닿은 회사" 가중 (자산①)
         └─ recommend_by_career_path() → "유사 커리어 peer 의 다음 회사" (자산②)

[A]+[B] 결합 → 최종 추천 점수 = 서베이 적합도 × 네트워크 근접도 × 커리어경로 유사도
```
