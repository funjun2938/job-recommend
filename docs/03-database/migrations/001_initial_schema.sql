-- Migration: 001_initial_schema
-- Created: 2026-05-30
-- Description: 이직추천 서비스 초기 스키마

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 회사명 유사 검색용

-- ── company_insights ──────────────────────────────────────────────
CREATE TABLE company_insights (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  job_category         TEXT        NOT NULL,
  experience_years     TEXT        NOT NULL,
  salary_range         TEXT        NOT NULL,
  skills               TEXT[]      DEFAULT '{}',
  company_size         TEXT        NOT NULL,
  company_name         TEXT,
  job_level            TEXT,
  actual_salary        INTEGER     CHECK (actual_salary > 500 AND actual_salary < 100000),
  resignation_reasons  TEXT[]      DEFAULT '{}',
  pros                 TEXT[]      DEFAULT '{}',
  cons                 TEXT[]      DEFAULT '{}',
  mgmt_trust_score     SMALLINT    CHECK (mgmt_trust_score BETWEEN 1 AND 5),
  stay_probability     SMALLINT    CHECK (stay_probability BETWEEN 0 AND 100),
  nps_score            SMALLINT    CHECK (nps_score BETWEEN 0 AND 10),
  is_verified          BOOLEAN     DEFAULT FALSE
);

CREATE INDEX idx_insights_job_category ON company_insights (job_category);
CREATE INDEX idx_insights_company_name ON company_insights USING GIN (company_name gin_trgm_ops) WHERE company_name IS NOT NULL;
CREATE INDEX idx_insights_created_at   ON company_insights (created_at DESC);
CREATE INDEX idx_insights_salary       ON company_insights (actual_salary) WHERE actual_salary IS NOT NULL;

-- ── alert_subscriptions ───────────────────────────────────────────
CREATE TABLE alert_subscriptions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email            TEXT        NOT NULL,
  job_category     TEXT,
  company_size     TEXT,
  timeline         TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  unsubscribed_at  TIMESTAMPTZ,
  CONSTRAINT uq_email_category UNIQUE (email, job_category)
);

CREATE INDEX idx_alerts_active   ON alert_subscriptions (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_alerts_category ON alert_subscriptions (job_category);

-- ── analysis_cache ────────────────────────────────────────────────
CREATE TABLE analysis_cache (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cache_key    TEXT        NOT NULL UNIQUE,
  stage1_hash  TEXT        NOT NULL,
  result_json  JSONB       NOT NULL,
  hit_count    INTEGER     NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_cache_key     ON analysis_cache (cache_key);
CREATE INDEX idx_cache_expires ON analysis_cache (expires_at);

-- ── company_reputation ────────────────────────────────────────────
CREATE TABLE company_reputation (
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

-- ── salary_benchmarks ─────────────────────────────────────────────
CREATE TABLE salary_benchmarks (
  id               UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  job_category     TEXT     NOT NULL,
  company_size     TEXT     NOT NULL,
  experience_min   SMALLINT,
  experience_max   SMALLINT,
  salary_p25       INTEGER,
  salary_p50       INTEGER,
  salary_p75       INTEGER,
  sample_count     INTEGER  NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_benchmark UNIQUE (job_category, company_size, experience_min, experience_max)
);

COMMIT;
