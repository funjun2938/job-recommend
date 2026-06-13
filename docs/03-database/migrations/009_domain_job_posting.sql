-- Migration: 009_domain_job_posting
-- Created: 2026-06-13
-- Domain: 채용 공고 (Job Posting) — v3 엔터프라이즈 모델
-- Tables: 7 (companies, job_roles, job_role_mappings, job_postings, posting_skills, applications, job_views)
-- Note:
--   companies / job_roles 는 다른 도메인(010/011/012/014)이 참조하는 핵심 마스터.
--   applications / job_views 는 사용자 소유 데이터 → RLS 적용.

BEGIN;

-- ── 1. companies ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name    TEXT        NOT NULL,
  ceo_name        TEXT,
  business_number TEXT,
  industry        TEXT,
  company_size    TEXT,
  founded_year    INT,
  employee_count  INT,
  location        TEXT,
  homepage        TEXT,
  is_listed       BOOLEAN     DEFAULT FALSE,
  status          TEXT        DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_companies_name     ON companies (company_name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies (industry);

-- ── 2. job_roles (직무 마스터, self FK) ───────────────────────────
CREATE TABLE IF NOT EXISTS job_roles (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  job_group          TEXT,
  job_role           TEXT,
  standard_role_name TEXT,
  parent_role_id     UUID        REFERENCES job_roles(id) ON DELETE SET NULL,
  description        TEXT
);
CREATE INDEX IF NOT EXISTS idx_job_roles_group  ON job_roles (job_group);
CREATE INDEX IF NOT EXISTS idx_job_roles_parent ON job_roles (parent_role_id);

-- ── 3. job_role_mappings (원시 직무명 → 표준 직무 매핑) ───────────
CREATE TABLE IF NOT EXISTS job_role_mappings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  job_role_id   UUID        NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  raw_role_name TEXT        NOT NULL,
  confidence    FLOAT
);
CREATE INDEX IF NOT EXISTS idx_job_role_mappings_role ON job_role_mappings (job_role_id);
CREATE INDEX IF NOT EXISTS idx_job_role_mappings_raw  ON job_role_mappings (raw_role_name);

-- ── 4. job_postings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_postings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id      UUID        REFERENCES companies(id) ON DELETE CASCADE,
  job_role_id     UUID        REFERENCES job_roles(id) ON DELETE SET NULL,
  title           TEXT        NOT NULL,
  employment_type TEXT,
  exp_min         INT,
  exp_max         INT,
  education_req   TEXT,
  location        TEXT,
  work_type       TEXT        CHECK (work_type IN ('onsite','remote','hybrid','flexible')),
  salary_min      INT,
  salary_max      INT,
  responsibilities TEXT,
  qualifications  TEXT,
  preferred       TEXT,
  start_date      DATE,
  end_date        DATE,
  status          TEXT        DEFAULT 'open'
);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings (company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_role    ON job_postings (job_role_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status  ON job_postings (status);

-- ── 5. posting_skills ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posting_skills (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  job_posting_id UUID        NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  skill_id       UUID        NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  is_required    BOOLEAN     DEFAULT FALSE,
  importance     INT,
  required_years INT,
  CONSTRAINT uq_posting_skill UNIQUE (job_posting_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_posting_skills_posting ON posting_skills (job_posting_id);
CREATE INDEX IF NOT EXISTS idx_posting_skills_skill   ON posting_skills (skill_id);

-- ── 6. applications (지원 이력 — 사용자 소유) ─────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id         UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_posting_id  UUID        REFERENCES job_postings(id) ON DELETE SET NULL,
  company_id      UUID        REFERENCES companies(id) ON DELETE SET NULL,
  applied_at      TIMESTAMPTZ DEFAULT NOW(),
  apply_channel   TEXT,
  status          TEXT        CHECK (status IN ('applied','document_passed','interview_1','interview_2','offer','accepted','rejected','withdrawn')) DEFAULT 'applied',
  document_result TEXT,
  interview_result TEXT,
  final_result    TEXT,
  is_hired        BOOLEAN     DEFAULT FALSE,
  hire_date       DATE
);
CREATE INDEX IF NOT EXISTS idx_applications_user    ON applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_posting ON applications (job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications (company_id);
CREATE INDEX IF NOT EXISTS idx_applications_status  ON applications (status);

-- ── 7. job_views (공고 조회 로그 — 사용자 소유) ──────────────────
CREATE TABLE IF NOT EXISTS job_views (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID        REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_posting_id UUID        REFERENCES job_postings(id) ON DELETE CASCADE,
  viewed_at      TIMESTAMPTZ DEFAULT NOW(),
  dwell_seconds  INT,
  inflow_channel TEXT        CHECK (inflow_channel IN ('recommendation','search','company_page','external'))
);
CREATE INDEX IF NOT EXISTS idx_job_views_user    ON job_views (user_id);
CREATE INDEX IF NOT EXISTS idx_job_views_posting ON job_views (job_posting_id);

-- ────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────
-- companies / job_postings: 공개 조회, service_role 변경
ALTER TABLE companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_companies"     ON companies    FOR SELECT USING (true);
CREATE POLICY "service_write_companies"   ON companies    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "public_read_job_postings"  ON job_postings FOR SELECT USING (true);
CREATE POLICY "service_write_job_postings" ON job_postings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- applications / job_views: 본인 또는 service_role
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views    ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_or_service_applications" ON applications
  FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );
CREATE POLICY "owner_or_service_job_views" ON job_views
  FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

COMMIT;
