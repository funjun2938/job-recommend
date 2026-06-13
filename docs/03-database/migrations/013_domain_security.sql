-- Migration: 013_domain_security
-- Created: 2026-06-13
-- Domain: 보안/개인정보 (Security & Privacy) — v3 엔터프라이즈 모델
-- Tables: 8 (terms, consent_history, terms_agreements, access_logs,
--            delete_requests, masking_policies, batch_jobs, error_logs)
-- Note:
--   사용자 동의/삭제요청은 본인 또는 service_role.
--   정책/배치/로그류는 service_role 전용.

BEGIN;

-- ── 1. terms (약관 마스터) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terms (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  terms_type     TEXT        NOT NULL,
  version        TEXT        NOT NULL,
  effective_date DATE,
  status         TEXT        DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_terms_type ON terms (terms_type);

-- ── 2. consent_history (사용자 소유) ──────────────────────────────
CREATE TABLE IF NOT EXISTS consent_history (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id      UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  consent_item TEXT,
  is_agreed    BOOLEAN     DEFAULT FALSE,
  consented_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consent_history_user ON consent_history (user_id);

-- ── 3. terms_agreements (사용자 소유) ─────────────────────────────
CREATE TABLE IF NOT EXISTS terms_agreements (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  terms_id   UUID        REFERENCES terms(id) ON DELETE SET NULL,
  is_agreed  BOOLEAN     DEFAULT FALSE,
  agreed_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_user  ON terms_agreements (user_id);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_terms ON terms_agreements (terms_id);

-- ── 4. access_logs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS access_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id       UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  accessor_type TEXT,
  accessed_item TEXT,
  access_result TEXT
);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs (user_id);

-- ── 5. delete_requests (사용자 소유) ──────────────────────────────
CREATE TABLE IF NOT EXISTS delete_requests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  request_type   TEXT,
  process_status TEXT        DEFAULT 'requested'
);
CREATE INDEX IF NOT EXISTS idx_delete_requests_user ON delete_requests (user_id);

-- ── 6. masking_policies ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS masking_policies (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_table   TEXT,
  masking_method TEXT,
  target_scope   TEXT
);

-- ── 7. batch_jobs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batch_jobs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  job_type        TEXT,
  processed_count INT         DEFAULT 0,
  job_status      TEXT        DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs (job_status);

-- ── 8. error_logs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  location       TEXT,
  process_status TEXT        DEFAULT 'open'
);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs (user_id);

-- ────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────
-- 사용자 소유: 본인 또는 service_role
DO $$
DECLARE
  t TEXT;
  owned TEXT[] := ARRAY['consent_history','terms_agreements','delete_requests'];
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

-- terms 는 공개 조회, service_role 변경
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_terms"   ON terms FOR SELECT USING (true);
CREATE POLICY "service_write_terms" ON terms FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 정책/배치/로그류: service_role 전용
DO $$
DECLARE
  t TEXT;
  svc TEXT[] := ARRAY['access_logs','masking_policies','batch_jobs','error_logs'];
BEGIN
  FOREACH t IN ARRAY svc LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY "service_all_%1$s" ON %1$I
      FOR ALL TO service_role USING (true) WITH CHECK (true)
    $f$, t);
  END LOOP;
END $$;

COMMIT;
