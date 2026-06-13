-- Migration: 015_domain_social
-- Created: 2026-06-13
-- Domain: 소셜/네트워크 (Social & Network) — v3 엔터프라이즈 모델
-- Tables: 7 (social_accounts, user_connections, card_exchanges, network_signals,
--            linkedin_imports, remember_imports, connection_suggestions)
-- Note:
--   legacy 명함첩 축(namecards/contact_transitions/company_network_edges)의 v3 확장.
--   대부분 사용자 소유 데이터 → 본인/service_role RLS.
--   양방향 관계(user_connections / card_exchanges / connection_suggestions)는
--   from/to 양쪽 모두 본인이면 접근 허용.

BEGIN;

-- ── 1. social_accounts (사용자 소유) ──────────────────────────────
CREATE TABLE IF NOT EXISTS social_accounts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id           UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform          TEXT,
  last_synced_at    TIMESTAMPTZ,
  connection_status TEXT        DEFAULT 'connected'
);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts (user_id);

-- ── 2. user_connections (양방향) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS user_connections (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  from_user_id        UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  to_user_id          UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  connection_type     TEXT,
  connection_strength TEXT,
  connection_status   TEXT        DEFAULT 'active',
  CONSTRAINT uq_user_connection UNIQUE (from_user_id, to_user_id)
);
CREATE INDEX IF NOT EXISTS idx_user_connections_from ON user_connections (from_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_to   ON user_connections (to_user_id);

-- ── 3. card_exchanges (양방향) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS card_exchanges (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  from_user_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  to_user_id      UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exchange_method TEXT,
  exchanged_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_card_exchanges_from ON card_exchanges (from_user_id);
CREATE INDEX IF NOT EXISTS idx_card_exchanges_to   ON card_exchanges (to_user_id);

-- ── 4. network_signals (사용자 소유) ──────────────────────────────
CREATE TABLE IF NOT EXISTS network_signals (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id         UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id      UUID        REFERENCES companies(id) ON DELETE SET NULL,
  signal_type     TEXT,
  signal_strength FLOAT
);
CREATE INDEX IF NOT EXISTS idx_network_signals_user    ON network_signals (user_id);
CREATE INDEX IF NOT EXISTS idx_network_signals_company ON network_signals (company_id);

-- ── 5. linkedin_imports (사용자 소유) ─────────────────────────────
CREATE TABLE IF NOT EXISTS linkedin_imports (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id                UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  social_account_id      UUID        REFERENCES social_accounts(id) ON DELETE SET NULL,
  profile_mapping_status TEXT        DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_linkedin_imports_user ON linkedin_imports (user_id);

-- ── 6. remember_imports (사용자 소유) ─────────────────────────────
CREATE TABLE IF NOT EXISTS remember_imports (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id             UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  social_account_id   UUID        REFERENCES social_accounts(id) ON DELETE SET NULL,
  imported_card_count INT         DEFAULT 0,
  import_status       TEXT        DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_remember_imports_user ON remember_imports (user_id);

-- ── 7. connection_suggestions (사용자 소유) ───────────────────────
CREATE TABLE IF NOT EXISTS connection_suggestions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id           UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  suggested_user_id UUID        REFERENCES user_profiles(id) ON DELETE CASCADE,
  suggestion_reason TEXT,
  suggestion_score  FLOAT,
  user_response     TEXT
);
CREATE INDEX IF NOT EXISTS idx_connection_suggestions_user ON connection_suggestions (user_id);

-- ────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────
-- 단일 소유자(user_id) 테이블
DO $$
DECLARE
  t TEXT;
  owned TEXT[] := ARRAY[
    'social_accounts','network_signals','linkedin_imports',
    'remember_imports','connection_suggestions'
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

-- 양방향(from/to) 테이블: 양쪽 어느 한 쪽이 본인이면 접근
DO $$
DECLARE
  t TEXT;
  rel TEXT[] := ARRAY['user_connections','card_exchanges'];
BEGIN
  FOREACH t IN ARRAY rel LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY "party_or_service_%1$s" ON %1$I
      FOR ALL USING (
        from_user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
        OR to_user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
        OR auth.role() = 'service_role'
      )
      WITH CHECK (
        from_user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
        OR auth.role() = 'service_role'
      )
    $f$, t);
  END LOOP;
END $$;

COMMIT;
