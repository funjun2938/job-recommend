-- Migration: 010_domain_recommendation
-- Created: 2026-06-13
-- Domain: 추천 시스템 (Recommendation) — v3 엔터프라이즈 모델
-- Tables: 9 (recommendations, recommend_models, recommend_scores, recommend_feedback,
--            feature_snapshots, experiments, experiment_groups, model_metrics, behavior_logs)
-- Note:
--   legacy recommendation_scores(007) 와 충돌 회피를 위해 점수 명세 테이블명은 recommend_scores 사용.
--   recommendations / recommend_feedback / behavior_logs 는 사용자 소유 데이터 → RLS 적용.

BEGIN;

-- ── 1. recommendations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id              UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_posting_id       UUID        REFERENCES job_postings(id) ON DELETE CASCADE,
  score                FLOAT,
  skill_match_score    FLOAT,
  career_match_score   FLOAT,
  salary_match_score   FLOAT,
  location_match_score FLOAT,
  industry_match_score FLOAT,
  reason               TEXT,
  model_version        TEXT,
  recommended_at       TIMESTAMPTZ DEFAULT NOW(),
  is_exposed           BOOLEAN     DEFAULT FALSE,
  status               TEXT        DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_recommendations_user    ON recommendations (user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_posting ON recommendations (job_posting_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score   ON recommendations (score DESC);

-- ── 2. recommend_models ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommend_models (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_name     TEXT        NOT NULL,
  model_version  TEXT        NOT NULL,
  algorithm_type TEXT,
  status         TEXT        DEFAULT 'active',
  params         JSONB
);
CREATE INDEX IF NOT EXISTS idx_recommend_models_name ON recommend_models (model_name);

-- ── 3. recommend_scores (점수 항목 분해) ──────────────────────────
CREATE TABLE IF NOT EXISTS recommend_scores (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recommendation_id UUID        NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  score_item        TEXT,
  raw_score         FLOAT,
  weight            FLOAT,
  final_score       FLOAT
);
CREATE INDEX IF NOT EXISTS idx_recommend_scores_rec ON recommend_scores (recommendation_id);

-- ── 4. recommend_feedback (사용자 소유) ───────────────────────────
CREATE TABLE IF NOT EXISTS recommend_feedback (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id           UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recommendation_id UUID        REFERENCES recommendations(id) ON DELETE CASCADE,
  feedback_type     TEXT
);
CREATE INDEX IF NOT EXISTS idx_recommend_feedback_user ON recommend_feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_recommend_feedback_rec  ON recommend_feedback (recommendation_id);

-- ── 5. feature_snapshots ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feature_snapshots (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recommendation_id UUID        REFERENCES recommendations(id) ON DELETE CASCADE,
  features_json     JSONB,
  model_version     TEXT
);
CREATE INDEX IF NOT EXISTS idx_feature_snapshots_rec ON feature_snapshots (recommendation_id);

-- ── 6. experiments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  experiment_name TEXT        NOT NULL,
  target_ratio    FLOAT,
  status          TEXT        DEFAULT 'draft'
);

-- ── 7. experiment_groups ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiment_groups (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  experiment_id  UUID        NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  group_name     TEXT,
  exposure_ratio FLOAT
);
CREATE INDEX IF NOT EXISTS idx_experiment_groups_exp ON experiment_groups (experiment_id);

-- ── 8. model_metrics ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS model_metrics (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_id         UUID        NOT NULL REFERENCES recommend_models(id) ON DELETE CASCADE,
  impressions      INT         DEFAULT 0,
  clicks           INT         DEFAULT 0,
  ctr              FLOAT,
  apply_conversion FLOAT
);
CREATE INDEX IF NOT EXISTS idx_model_metrics_model ON model_metrics (model_id);

-- ── 9. behavior_logs (사용자 소유) ────────────────────────────────
CREATE TABLE IF NOT EXISTS behavior_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID        REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_posting_id UUID        REFERENCES job_postings(id) ON DELETE SET NULL,
  event_type     TEXT,
  device         TEXT
);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_user  ON behavior_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_event ON behavior_logs (event_type);

-- ────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────
ALTER TABLE recommendations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommend_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_or_service_recommendations" ON recommendations
  FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );
CREATE POLICY "owner_or_service_recommend_feedback" ON recommend_feedback
  FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );
CREATE POLICY "owner_or_service_behavior_logs" ON behavior_logs
  FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

-- 모델/실험/메트릭은 service_role 전용
ALTER TABLE recommend_models  ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_metrics     ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_recommend_models"  ON recommend_models  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_experiments"       ON experiments       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_experiment_groups" ON experiment_groups FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_model_metrics"     ON model_metrics     FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;
