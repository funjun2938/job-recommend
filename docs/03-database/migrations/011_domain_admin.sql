-- Migration: 011_domain_admin
-- Created: 2026-06-13
-- Domain: 관리자/기업 (Admin & Company Manager) — v3 엔터프라이즈 모델
-- Tables: 7 (admin_roles, admin_accounts, admin_menus, admin_permissions,
--            company_managers, manager_permissions, company_offers)
-- Note: 내부 운영/기업 백오피스 데이터 → 전부 service_role 전용 RLS.

BEGIN;

-- ── 1. admin_roles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role_name   TEXT        NOT NULL,
  role_status TEXT        DEFAULT 'active'
);

-- ── 2. admin_accounts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_accounts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role_id        UUID        REFERENCES admin_roles(id) ON DELETE SET NULL,
  name           TEXT,
  email          TEXT        UNIQUE,
  account_status TEXT        DEFAULT 'active',
  two_fa_enabled BOOLEAN     DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_role ON admin_accounts (role_id);

-- ── 3. admin_menus (self FK) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_menus (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parent_menu_id UUID        REFERENCES admin_menus(id) ON DELETE SET NULL,
  menu_name      TEXT,
  menu_code      TEXT
);
CREATE INDEX IF NOT EXISTS idx_admin_menus_parent ON admin_menus (parent_menu_id);

-- ── 4. admin_permissions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_permissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role_id     UUID        NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  menu_id     UUID        NOT NULL REFERENCES admin_menus(id) ON DELETE CASCADE,
  can_read    BOOLEAN     DEFAULT FALSE,
  can_create  BOOLEAN     DEFAULT FALSE,
  can_update  BOOLEAN     DEFAULT FALSE,
  can_delete  BOOLEAN     DEFAULT FALSE,
  CONSTRAINT uq_admin_perm UNIQUE (role_id, menu_id)
);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_role ON admin_permissions (role_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_menu ON admin_permissions (menu_id);

-- ── 5. company_managers ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_managers (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id     UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name           TEXT,
  duty           TEXT,
  account_status TEXT        DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_company_managers_company ON company_managers (company_id);

-- ── 6. manager_permissions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS manager_permissions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  manager_id     UUID        NOT NULL REFERENCES company_managers(id) ON DELETE CASCADE,
  company_id     UUID        REFERENCES companies(id) ON DELETE CASCADE,
  can_post_jobs  BOOLEAN     DEFAULT FALSE,
  can_send_offers BOOLEAN    DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_manager_permissions_mgr ON manager_permissions (manager_id);

-- ── 7. company_offers ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_offers (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id     UUID        REFERENCES companies(id) ON DELETE CASCADE,
  manager_id     UUID        REFERENCES company_managers(id) ON DELETE SET NULL,
  user_id        UUID        REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_posting_id UUID        REFERENCES job_postings(id) ON DELETE SET NULL,
  offer_status   TEXT        DEFAULT 'sent'
);
CREATE INDEX IF NOT EXISTS idx_company_offers_company ON company_offers (company_id);
CREATE INDEX IF NOT EXISTS idx_company_offers_user    ON company_offers (user_id);

-- ────────────────────────────────────────────────────
-- RLS — 백오피스/운영 데이터: service_role 전용
--   단, company_offers 는 대상 사용자(user_id)가 자신에게 온 제안을 조회할 수 있어야 함.
-- ────────────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  svc TEXT[] := ARRAY[
    'admin_roles','admin_accounts','admin_menus','admin_permissions',
    'company_managers','manager_permissions'
  ];
BEGIN
  FOREACH t IN ARRAY svc LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY "service_all_%1$s" ON %1$I
      FOR ALL TO service_role USING (true) WITH CHECK (true)
    $f$, t);
  END LOOP;
END $$;

ALTER TABLE company_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "target_or_service_company_offers" ON company_offers
  FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.role() = 'service_role'
  );

COMMIT;
