-- Migration: 006_subscriptions
-- Created: 2026-05-30
-- Description: Stripe 구독 + 사용자 인증 테이블

BEGIN;

-- Stripe 구독
CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email    TEXT        NOT NULL UNIQUE,
  stripe_customer   TEXT,
  stripe_session    TEXT,
  plan              TEXT        NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'team'
  status            TEXT        NOT NULL DEFAULT 'active',-- 'active' | 'canceled' | 'trialing'
  trial_end         TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sub_email    ON subscriptions (customer_email);
CREATE INDEX idx_sub_customer ON subscriptions (stripe_customer);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_subscriptions" ON subscriptions FOR ALL TO service_role USING (true);

-- 사용자 분석 히스토리
CREATE TABLE IF NOT EXISTS analysis_history (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email   TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stage1_json  JSONB       NOT NULL,
  result_json  JSONB       NOT NULL,
  share_id     TEXT
);

CREATE INDEX idx_history_email ON analysis_history (user_email);
CREATE INDEX idx_history_date  ON analysis_history (created_at DESC);

ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_history"
  ON analysis_history FOR SELECT
  USING (user_email = auth.email());

CREATE POLICY "user_insert_history"
  ON analysis_history FOR INSERT
  WITH CHECK (user_email = auth.email());

-- 월별 사용량 카운터
CREATE TABLE IF NOT EXISTS usage_counts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email   TEXT        NOT NULL,
  month_key    TEXT        NOT NULL,  -- 'YYYY-MM'
  analysis     INTEGER     NOT NULL DEFAULT 0,
  cover_letter INTEGER     NOT NULL DEFAULT 0,
  CONSTRAINT uq_usage UNIQUE (user_email, month_key)
);

ALTER TABLE usage_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_usage" ON usage_counts FOR ALL USING (user_email = auth.email());

COMMIT;
