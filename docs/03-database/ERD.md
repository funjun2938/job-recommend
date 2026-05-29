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

## 엔티티 관계 설명

| 관계 | 설명 |
|------|------|
| company_insights → company_reputation | company_name 기반 집계 (논리적 연관, FK 없음) |
| company_insights → salary_benchmarks | job_category + company_size + experience로 조인 가능 |
| alert_subscriptions | company_insights와 독립 (이메일만 저장) |
| analysis_cache | stage1 입력 해시 기반 캐싱, company_insights와 무관 |

---

## 데이터 흐름

```
사용자 입력
    │
    ├─ Stage1 (익명) ──→ analysis_cache 조회 (캐시 히트 시 즉시 반환)
    │
    ├─ Stage2 (회사 정보) ──→ company_insights 저장
    │                          └─→ company_reputation 집계 업데이트 (트리거)
    │
    ├─ Claude/Gemini API ──→ 분석 결과
    │                         └─→ analysis_cache 저장
    │
    └─ 알림 신청 ──→ alert_subscriptions 저장
```
