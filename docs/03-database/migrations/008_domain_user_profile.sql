-- Migration: 008_domain_user_profile
-- Created: 2026-06-13
-- Domain: 사용자 프로필 (User Profile) — v3 엔터프라이즈 모델
-- Tables: 15 (user_profiles 보강 ALTER + 14 신규)
-- Note:
--   기존 legacy user_profiles(007) 가 존재하므로 ALTER TABLE ... ADD COLUMN IF NOT EXISTS 로 보강한다.
--   나머지 14개 테이블은 user_profiles(id) 를 소유자 FK 로 참조한다.
--   사용자 소유 데이터는 RLS 활성화 + 본인/service_role 정책을 적용한다.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. user_profiles (legacy 보강) ────────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS residence              TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS desired_location       TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_experience_years INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS final_education        TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS major                  TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_salary         INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS desired_salary         INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS job_change_timing      TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS job_seeking_status     TEXT
  CHECK (job_seeking_status IN ('active','passive','inactive','hidden'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_public              BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completeness   INT DEFAULT 0;

-- ── 2. business_cards (명함 이력) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS business_cards (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id         UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_name    TEXT        NOT NULL,
  department      TEXT,
  job_group       TEXT,
  job_title       TEXT,
  job_role        TEXT,
  work_start_date DATE,
  work_end_date   DATE,
  status          TEXT        CHECK (status IN ('재직','이직','종료'))
);
CREATE INDEX IF NOT EXISTS idx_business_cards_user    ON business_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_business_cards_company ON business_cards (company_name);

-- ── 3. user_preferences ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id             UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  desired_job_group   TEXT,
  desired_role        TEXT,
  desired_industry    TEXT,
  desired_company_size TEXT,
  desired_salary_min  INT,
  desired_salary_max  INT,
  work_type           TEXT        CHECK (work_type IN ('onsite','remote','hybrid','flexible')),
  desired_location    TEXT,
  preferred_benefits  TEXT[]      DEFAULT '{}',
  excluded_companies  TEXT[]      DEFAULT '{}',
  excluded_industries TEXT[]      DEFAULT '{}',
  overtime_ok         BOOLEAN     DEFAULT TRUE,
  overseas_ok         BOOLEAN     DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences (user_id);

-- ── 4. skills (마스터, self FK) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  skill_name      TEXT        NOT NULL,
  skill_category  TEXT,
  parent_skill_id UUID        REFERENCES skills(id) ON DELETE SET NULL,
  standard_name   TEXT,
  synonyms        TEXT[]      DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_skills_name     ON skills (skill_name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills (skill_category);
CREATE INDEX IF NOT EXISTS idx_skills_parent   ON skills (parent_skill_id);

-- ── 5. user_skills ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_skills (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id         UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill_id        UUID        NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency     SMALLINT    CHECK (proficiency BETWEEN 1 AND 5),
  years_used      INT,
  last_used_date  DATE,
  evidence_source TEXT,
  is_primary      BOOLEAN     DEFAULT FALSE,
  CONSTRAINT uq_user_skill UNIQUE (user_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_user_skills_user  ON user_skills (user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills (skill_id);

-- ── 6. user_careers (경력 상세) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_careers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id         UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id      UUID,
  company_name    TEXT,
  department      TEXT,
  job_title       TEXT,
  job_role        TEXT,
  responsibilities TEXT,
  achievements    TEXT,
  tech_used       TEXT[]      DEFAULT '{}',
  work_start_date DATE,
  work_end_date   DATE,
  is_current      BOOLEAN     DEFAULT FALSE,
  visibility      TEXT        CHECK (visibility IN ('public','private','hidden')) DEFAULT 'private'
);
CREATE INDEX IF NOT EXISTS idx_user_careers_user    ON user_careers (user_id);
CREATE INDEX IF NOT EXISTS idx_user_careers_company ON user_careers (company_name);

-- ── 7. user_educations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_educations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id           UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  school_name       TEXT,
  major             TEXT,
  degree            TEXT        CHECK (degree IN ('high_school','bachelor','master','doctor')),
  admission_date    DATE,
  graduation_date   DATE,
  graduation_status TEXT        CHECK (graduation_status IN ('enrolled','graduated','leave','dropped','expected'))
);
CREATE INDEX IF NOT EXISTS idx_user_educations_user ON user_educations (user_id);

-- ── 8. user_resumes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_resumes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id       UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  resume_name   TEXT,
  file_id       TEXT,
  parse_status  TEXT        CHECK (parse_status IN ('uploaded','parsing','parsed','failed')) DEFAULT 'uploaded',
  is_primary    BOOLEAN     DEFAULT FALSE,
  visibility    TEXT        CHECK (visibility IN ('public','private','hidden')) DEFAULT 'private'
);
CREATE INDEX IF NOT EXISTS idx_user_resumes_user ON user_resumes (user_id);

-- ── 9. user_certificates ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_certificates (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id          UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  certificate_name TEXT,
  issuer           TEXT,
  acquired_date    DATE,
  expiry_date      DATE,
  evidence_file_id TEXT,
  verify_status    TEXT        CHECK (verify_status IN ('pending','verified','rejected','expired')) DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_user_certificates_user ON user_certificates (user_id);

-- ── 10. user_languages ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_languages (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id       UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  language      TEXT,
  level         TEXT        CHECK (level IN ('beginner','intermediate','advanced','native')),
  test_name     TEXT,
  score         TEXT,
  acquired_date DATE,
  expiry_date   DATE
);
CREATE INDEX IF NOT EXISTS idx_user_languages_user ON user_languages (user_id);

-- ── 11. user_projects ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_projects (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id      UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_name TEXT,
  description  TEXT,
  role         TEXT,
  tech_used    TEXT[]      DEFAULT '{}',
  metrics      TEXT,
  start_date   DATE,
  end_date     DATE,
  visibility   TEXT        CHECK (visibility IN ('public','private','hidden')) DEFAULT 'private'
);
CREATE INDEX IF NOT EXISTS idx_user_projects_user ON user_projects (user_id);

-- ── 12. user_portfolios ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_portfolios (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  portfolio_type TEXT        CHECK (portfolio_type IN ('github','blog','notion','website','pdf')),
  title          TEXT,
  url            TEXT,
  file_id        TEXT,
  is_primary     BOOLEAN     DEFAULT FALSE,
  visibility     TEXT        CHECK (visibility IN ('public','private','hidden')) DEFAULT 'private'
);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user ON user_portfolios (user_id);

-- ── 13. career_goals ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_goals (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id               UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  change_reason         TEXT,
  change_reason_priority JSONB,
  target_job_group      TEXT,
  target_job_title      TEXT,
  target_company_type   TEXT        CHECK (target_company_type IN ('startup','mid_size','enterprise','foreign','public','any')),
  target_salary_min     INT,
  target_salary_ideal   INT,
  three_year_goal       TEXT,
  important_benefits    JSONB,
  dealbreakers          JSONB
);
CREATE INDEX IF NOT EXISTS idx_career_goals_user ON career_goals (user_id);

-- ── 14. job_readiness ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_readiness (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id                UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  interview_availability TEXT        CHECK (interview_availability IN ('immediately','within_2w','within_1m','within_3m','undecided')),
  preferred_interview    TEXT,
  available_times        JSONB,
  ongoing_processes      INT         DEFAULT 0,
  available_start_date   DATE,
  readiness_stage        TEXT        CHECK (readiness_stage IN ('thinking','resume_ready','applying','interviewing','offer_stage')),
  readiness_score        INT,
  current_job_disclosable TEXT
);
CREATE INDEX IF NOT EXISTS idx_job_readiness_user ON job_readiness (user_id);

-- ── 15. user_activities ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activities (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id            UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type      TEXT,
  earned_points      INT         DEFAULT 0,
  total_points       INT         DEFAULT 0,
  activity_at        TIMESTAMPTZ DEFAULT NOW(),
  completeness_field TEXT,
  completeness_score INT
);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities (user_id);

-- ────────────────────────────────────────────────────
-- RLS: 사용자 소유 데이터 — 본인(user_profiles.auth_user_id) 또는 service_role
-- ────────────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  owned TEXT[] := ARRAY[
    'business_cards','user_preferences','user_skills','user_careers',
    'user_educations','user_resumes','user_certificates','user_languages',
    'user_projects','user_portfolios','career_goals','job_readiness','user_activities'
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

-- skills 는 공용 마스터: 누구나 조회, service_role 만 변경
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_skills"  ON skills FOR SELECT USING (true);
CREATE POLICY "service_write_skills" ON skills FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;
