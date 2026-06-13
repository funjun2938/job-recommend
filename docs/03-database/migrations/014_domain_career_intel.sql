-- Migration: 014_domain_career_intel
-- Created: 2026-06-13
-- Domain: 커리어 인텔리전스 (Career Intelligence) — v3 엔터프라이즈 모델
-- Tables: 6 (salary_benchmark_v3, skill_trends, hiring_trends,
--            skill_gap_analyses, company_reputation_v3, career_paths_v3)
-- Note:
--   legacy salary_benchmarks / company_reputation / career_paths 충돌 회피를 위해 _v3 접미사 사용.
--   skill_gap_analyses 는 사용자 소유 → 본인/service_role. 나머지 집계는 공개 조회.

BEGIN;

-- ── 1. salary_benchmark_v3 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_benchmark_v3 (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  job_role_id   UUID        REFERENCES job_roles(id) ON DELETE CASCADE,
  exp_range     TEXT,
  salary_median INT,
  salary_avg    INT,
  data_source   TEXT
);
CREATE INDEX IF NOT EXISTS idx_salary_benchmark_v3_role ON salary_benchmark_v3 (job_role_id);

-- ── 2. skill_trends ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_trends (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  skill_id        UUID        REFERENCES skills(id) ON DELETE CASCADE,
  posting_count   INT         DEFAULT 0,
  salary_premium  INT,
  trend_direction TEXT
);
CREATE INDEX IF NOT EXISTS idx_skill_trends_skill ON skill_trends (skill_id);

-- ── 3. hiring_trends ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hiring_trends (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  industry           TEXT,
  new_posting_count  INT         DEFAULT 0,
  hiring_temperature TEXT
);
CREATE INDEX IF NOT EXISTS idx_hiring_trends_industry ON hiring_trends (industry);

-- ── 4. skill_gap_analyses (사용자 소유) ───────────────────────────
CREATE TABLE IF NOT EXISTS skill_gap_analyses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id             UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  target_job_role_id  UUID        REFERENCES job_roles(id) ON DELETE SET NULL,
  skill_match_rate    FLOAT,
  expected_prep_weeks INT
);
CREATE INDEX IF NOT EXISTS idx_skill_gap_analyses_user ON skill_gap_analyses (user_id);

-- ── 5. company_reputation_v3 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_reputation_v3 (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id     UUID        REFERENCES companies(id) ON DELETE CASCADE,
  overall_rating FLOAT,
  wlb_score      FLOAT,
  review_count   INT         DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_company_reputation_v3_company ON company_reputation_v3 (company_id);

-- ── 6. career_paths_v3 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_paths_v3 (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  from_job_role_id UUID       REFERENCES job_roles(id) ON DELETE CASCADE,
  to_job_role_id   UUID       REFERENCES job_roles(id) ON DELETE CASCADE,
  move_frequency  INT         DEFAULT 0,
  move_type       TEXT
);
CREATE INDEX IF NOT EXISTS idx_career_paths_v3_from ON career_paths_v3 (from_job_role_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_v3_to   ON career_paths_v3 (to_job_role_id);

-- ────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────
-- skill_gap_analyses: 본인 또는 service_role
ALTER TABLE skill_gap_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_or_service_skill_gap_analyses" ON skill_gap_analyses
  FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

-- 집계/인텔리전스: 공개 조회, service_role 변경
DO $$
DECLARE
  t TEXT;
  pub TEXT[] := ARRAY[
    'salary_benchmark_v3','skill_trends','hiring_trends',
    'company_reputation_v3','career_paths_v3'
  ];
BEGIN
  FOREACH t IN ARRAY pub LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "public_read_%1$s" ON %1$I FOR SELECT USING (true)', t);
    EXECUTE format($f$
      CREATE POLICY "service_write_%1$s" ON %1$I
      FOR ALL TO service_role USING (true) WITH CHECK (true)
    $f$, t);
  END LOOP;
END $$;

COMMIT;
