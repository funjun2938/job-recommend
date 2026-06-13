-- Migration: 016_domain_notification
-- Created: 2026-06-13
-- Domain: 알림/개인화 (Notification & Personalization) — v3 엔터프라이즈 모델
-- Tables: 6 (notif_templates, notif_preferences, optimal_send_times,
--            notif_history, channel_fatigue, user_segments)
-- Note:
--   notif_templates 는 운영 마스터(service_role). 나머지는 사용자 소유 → 본인/service_role.

BEGIN;

-- ── 1. notif_templates (운영 마스터) ──────────────────────────────
CREATE TABLE IF NOT EXISTS notif_templates (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  template_name  TEXT        NOT NULL,
  notif_type     TEXT,
  channel        TEXT,
  target_segment TEXT,
  status         TEXT        DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_notif_templates_type ON notif_templates (notif_type);

-- ── 2. notif_preferences (사용자 소유) ────────────────────────────
CREATE TABLE IF NOT EXISTS notif_preferences (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id          UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notif_type       TEXT,
  allowed_channels TEXT[]      DEFAULT '{}',
  is_subscribed    BOOLEAN     DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_notif_preferences_user ON notif_preferences (user_id);

-- ── 3. optimal_send_times (사용자 소유) ───────────────────────────
CREATE TABLE IF NOT EXISTS optimal_send_times (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id          UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  channel          TEXT,
  avg_open_rate    FLOAT,
  model_confidence FLOAT
);
CREATE INDEX IF NOT EXISTS idx_optimal_send_times_user ON optimal_send_times (user_id);

-- ── 4. notif_history (사용자 소유) ────────────────────────────────
CREATE TABLE IF NOT EXISTS notif_history (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id      UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id  UUID        REFERENCES notif_templates(id) ON DELETE SET NULL,
  sent_channel TEXT,
  sent_status  TEXT,
  sent_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_history_user     ON notif_history (user_id);
CREATE INDEX IF NOT EXISTS idx_notif_history_template ON notif_history (template_id);

-- ── 5. channel_fatigue (사용자 소유) ──────────────────────────────
CREATE TABLE IF NOT EXISTS channel_fatigue (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id                     UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  channel                     TEXT,
  consecutive_no_response_days INT        DEFAULT 0,
  fatigue_level               TEXT
);
CREATE INDEX IF NOT EXISTS idx_channel_fatigue_user ON channel_fatigue (user_id);

-- ── 6. user_segments (사용자 소유) ────────────────────────────────
CREATE TABLE IF NOT EXISTS user_segments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id             UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_seeking_segment TEXT,
  activity_segment    TEXT,
  readiness_score     INT
);
CREATE INDEX IF NOT EXISTS idx_user_segments_user ON user_segments (user_id);

-- ────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────
-- notif_templates: 운영 마스터 → service_role 전용
ALTER TABLE notif_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_notif_templates" ON notif_templates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 사용자 소유: 본인 또는 service_role
DO $$
DECLARE
  t TEXT;
  owned TEXT[] := ARRAY[
    'notif_preferences','optimal_send_times','notif_history',
    'channel_fatigue','user_segments'
  ];
BEGIN
  FOREACH t IN ARRAY owned LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY "owner_or_service_%1$s" ON %1$I
      FOR ALL USING (
        user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
        OR auth.role() = 'service_role'
      )
      WITH CHECK (
        user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
        OR auth.role() = 'service_role'
      )
    $f$, t);
  END LOOP;
END $$;

COMMIT;
