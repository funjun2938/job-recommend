-- ================================================================
-- 이직추천 서비스 — Supabase PostgreSQL 스키마
-- ================================================================

-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────
-- 1. company_insights
--    이직 의향자가 제공하는 회사 내부 정보 (핵심 데이터 자산)
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_insights (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Stage 1 (현황)
  job_category         TEXT        NOT NULL,
  experience_years     TEXT        NOT NULL,
  salary_range         TEXT        NOT NULL,
  skills               TEXT[]      DEFAULT '{}',
  company_size         TEXT        NOT NULL,

  -- Stage 2 (회사 인사이트 — 핵심)
  company_name         TEXT,                          -- nullable (선택)
  job_level            TEXT,
  actual_salary        INTEGER,                       -- 만원 단위
  resignation_reasons  TEXT[]      DEFAULT '{}',
  pros                 TEXT[]      DEFAULT '{}',
  cons                 TEXT[]      DEFAULT '{}',
  mgmt_trust_score     SMALLINT    CHECK (mgmt_trust_score BETWEEN 1 AND 5),
  stay_probability     SMALLINT    CHECK (stay_probability BETWEEN 0 AND 100),
  nps_score            SMALLINT    CHECK (nps_score BETWEEN 0 AND 10),

  -- 메타
  is_verified          BOOLEAN     DEFAULT FALSE      -- 향후 인증 플래그
);

-- 인덱스
CREATE INDEX idx_insights_job_category    ON company_insights (job_category);
CREATE INDEX idx_insights_company_name    ON company_insights (company_name) WHERE company_name IS NOT NULL;
CREATE INDEX idx_insights_company_size    ON company_insights (company_size);
CREATE INDEX idx_insights_created_at      ON company_insights (created_at DESC);

-- RLS (Row Level Security) — 읽기 차단, 쓰기만 허용
ALTER TABLE company_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "누구나 INSERT 가능"
  ON company_insights FOR INSERT
  WITH CHECK (true);

-- SELECT는 서비스 롤(service_role)만 허용 (집계 대시보드용)
CREATE POLICY "service_role만 조회 가능"
  ON company_insights FOR SELECT
  USING (auth.role() = 'service_role');


-- ────────────────────────────────────────────────────
-- 2. alert_subscriptions
--    채용공고 알림 신청 이메일 목록
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email            TEXT        NOT NULL,
  job_category     TEXT,
  company_size     TEXT,
  timeline         TEXT,                              -- '3개월 내' | '6개월 내' | ...
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  unsubscribed_at  TIMESTAMPTZ,

  -- 중복 방지: 동일 이메일 + job_category 조합
  CONSTRAINT uq_email_category UNIQUE (email, job_category)
);

CREATE INDEX idx_alerts_email      ON alert_subscriptions (email);
CREATE INDEX idx_alerts_active     ON alert_subscriptions (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_alerts_category   ON alert_subscriptions (job_category);

ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "누구나 INSERT 가능"
  ON alert_subscriptions FOR INSERT
  WITH CHECK (true);


-- ────────────────────────────────────────────────────
-- 3. analysis_cache
--    동일 Stage1 조합에 대한 Gemini 응답 캐싱 (API 비용 절감)
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_cache (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cache_key    TEXT        NOT NULL UNIQUE,           -- MD5(stage1 JSON)
  stage1_hash  TEXT        NOT NULL,
  result_json  JSONB       NOT NULL,
  hit_count    INTEGER     NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_cache_key        ON analysis_cache (cache_key);
CREATE INDEX idx_cache_expires    ON analysis_cache (expires_at);

-- 만료된 캐시 자동 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
  DELETE FROM analysis_cache WHERE expires_at < NOW();
$$ LANGUAGE SQL;


-- ────────────────────────────────────────────────────
-- 4. salary_benchmarks
--    집계된 연봉 벤치마크 (company_insights 기반 자동 계산)
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_benchmarks (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_category     TEXT        NOT NULL,
  company_size     TEXT        NOT NULL,
  experience_min   SMALLINT,
  experience_max   SMALLINT,
  salary_p25       INTEGER,                           -- 하위 25% (만원)
  salary_p50       INTEGER,                           -- 중앙값 (만원)
  salary_p75       INTEGER,                           -- 상위 25% (만원)
  sample_count     INTEGER     NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_benchmark UNIQUE (job_category, company_size, experience_min, experience_max)
);

CREATE INDEX idx_benchmark_lookup ON salary_benchmarks (job_category, company_size);


-- ────────────────────────────────────────────────────
-- 5. company_reputation
--    회사별 집계 지표 (company_insights에서 자동 집계)
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_reputation (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name     TEXT        NOT NULL UNIQUE,
  industry         TEXT,
  size_category    TEXT,
  avg_nps          DECIMAL(4,2),
  avg_mgmt_trust   DECIMAL(4,2),
  avg_stay_prob    DECIMAL(5,2),
  top_pros         TEXT[]      DEFAULT '{}',
  top_cons         TEXT[]      DEFAULT '{}',
  top_exit_reasons TEXT[]      DEFAULT '{}',
  insight_count    INTEGER     NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reputation_name ON company_reputation (company_name);


-- ────────────────────────────────────────────────────
-- 6. 집계 자동화 — company_reputation 업데이트 트리거
-- ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_company_reputation()
RETURNS TRIGGER AS $$
DECLARE
  v_company TEXT := NEW.company_name;
BEGIN
  -- company_name이 없으면 건너뜀
  IF v_company IS NULL OR v_company = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO company_reputation (
    company_name,
    avg_nps,
    avg_mgmt_trust,
    avg_stay_prob,
    insight_count,
    updated_at
  )
  SELECT
    v_company,
    ROUND(AVG(nps_score)::NUMERIC, 2),
    ROUND(AVG(mgmt_trust_score)::NUMERIC, 2),
    ROUND(AVG(stay_probability)::NUMERIC, 2),
    COUNT(*),
    NOW()
  FROM company_insights
  WHERE company_name = v_company
    AND nps_score IS NOT NULL
  ON CONFLICT (company_name) DO UPDATE SET
    avg_nps        = EXCLUDED.avg_nps,
    avg_mgmt_trust = EXCLUDED.avg_mgmt_trust,
    avg_stay_prob  = EXCLUDED.avg_stay_prob,
    insight_count  = EXCLUDED.insight_count,
    updated_at     = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_reputation
AFTER INSERT ON company_insights
FOR EACH ROW EXECUTE FUNCTION update_company_reputation();


-- ────────────────────────────────────────────────────
-- 7. 연봉 벤치마크 뷰 (직접 company_insights에서 계산)
-- ────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_salary_benchmark AS
SELECT
  job_category,
  company_size,
  COUNT(*)                                         AS sample_count,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY actual_salary)::INT AS salary_p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY actual_salary)::INT AS salary_p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY actual_salary)::INT AS salary_p75,
  MIN(actual_salary)                               AS salary_min,
  MAX(actual_salary)                               AS salary_max
FROM company_insights
WHERE actual_salary IS NOT NULL
  AND actual_salary > 1000   -- 이상치 제외 (100만원 이하)
  AND actual_salary < 50000  -- 이상치 제외 (5억 이상)
GROUP BY job_category, company_size
HAVING COUNT(*) >= 3;        -- 최소 3건 이상만 표시 (익명성 보호)


-- ────────────────────────────────────────────────────
-- 8. 시드 데이터 — salary_benchmarks 초기값
-- ────────────────────────────────────────────────────
INSERT INTO salary_benchmarks (job_category, company_size, experience_min, experience_max, salary_p25, salary_p50, salary_p75, sample_count) VALUES
  ('개발·엔지니어', '스타트업',  1, 3,  3500, 4200, 5000, 50),
  ('개발·엔지니어', '스타트업',  3, 5,  4500, 5500, 7000, 40),
  ('개발·엔지니어', '스타트업',  5, 7,  6000, 7500, 9000, 30),
  ('개발·엔지니어', '대기업',    1, 3,  4000, 4800, 5500, 80),
  ('개발·엔지니어', '대기업',    3, 5,  5500, 6500, 8000, 70),
  ('개발·엔지니어', '대기업',    5, 7,  7000, 8500, 11000,50),
  ('개발·엔지니어', '외국계',    3, 5,  7000, 9000, 12000,30),
  ('개발·엔지니어', '외국계',    5, 10, 9000, 12000,18000,20),
  ('기획·PM',       '스타트업',  1, 3,  3200, 3800, 4500, 30),
  ('기획·PM',       '스타트업',  3, 5,  4000, 5000, 6500, 25),
  ('기획·PM',       '대기업',    3, 5,  5000, 6000, 7500, 40),
  ('마케팅·광고',   '스타트업',  1, 3,  3000, 3600, 4200, 25),
  ('마케팅·광고',   '대기업',    3, 5,  4500, 5500, 7000, 35),
  ('영업·BD',       '스타트업',  1, 3,  3500, 4500, 6000, 20),
  ('영업·BD',       '외국계',    3, 5,  6000, 8000, 12000,15),
  ('금융·회계',     '대기업',    3, 5,  5500, 7000, 9000, 30),
  ('금융·회계',     '외국계',    5, 10, 9000, 13000,20000,15)
ON CONFLICT (job_category, company_size, experience_min, experience_max) DO NOTHING;
