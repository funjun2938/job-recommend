-- Migration: 007_namecard_network
-- Created: 2026-06-10
-- Description:
--   명함첩(리멤버 류) 외부 데이터 연동 — 두 번째 데이터 자산 축.
--   ① 명함첩 = "내가 네트워킹하는 회사들의 맵" → 회사 추천 기반 데이터
--   ② 명함 교체 이력 = "개인의 이직 이력" → 유사 커리어 경로 기반 추천 데이터
--
--   기존 company_insights(서베이 기반)와 결합되어 추천 정확도를 끌어올린다.
--   (실제 외부 연동 가능 여부는 차치하고, 연동된다고 가정한 스키마/파이프라인)

BEGIN;

-- ────────────────────────────────────────────────────
-- 0. user_profiles
--    명함첩 연동을 위한 사용자 식별 (서베이는 익명, 연동은 식별 필요)
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Supabase auth.users 와 1:1 (있을 경우)
  auth_user_id       UUID        UNIQUE,
  session_id         TEXT,                                  -- 비로그인 사용자용 세션 키
  display_name       TEXT,
  current_company    TEXT,
  current_job_category TEXT,
  -- 명함첩 연동 상태
  namecard_provider  TEXT        DEFAULT 'remember',        -- 'remember' | 'rolodex' | 'linkedin'
  namecard_synced_at TIMESTAMPTZ,
  namecard_count     INTEGER     NOT NULL DEFAULT 0,        -- 보유 명함 수
  consent_network    BOOLEAN     NOT NULL DEFAULT FALSE     -- 익명 집계 활용 동의
);

CREATE INDEX idx_profiles_session   ON user_profiles (session_id);
CREATE INDEX idx_profiles_synced    ON user_profiles (namecard_synced_at) WHERE namecard_synced_at IS NOT NULL;

-- ────────────────────────────────────────────────────
-- 1. namecards
--    사용자 명함첩의 개별 명함 = 내가 아는 사람 1명 (네트워크 노드)
--    개인정보 최소화: 이름/연락처는 해시로만 저장, 회사·직군·산업만 활용
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS namecards (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 연락처 식별 (동일인 명함 버전 추적용 해시, 평문 저장 안 함)
  contact_hash    TEXT        NOT NULL,                     -- SHA256(name+phone/email)

  -- 네트워크/추천에 쓰는 비식별 속성
  company_name    TEXT        NOT NULL,
  job_title       TEXT,
  job_category    TEXT,
  industry        TEXT,
  company_size    TEXT,
  seniority       TEXT,                                     -- '실무' | '리더' | '임원'
  exchanged_at    DATE,                                     -- 명함 교환 시점 (대략)

  is_current      BOOLEAN     NOT NULL DEFAULT TRUE,        -- 이 연락처의 최신 명함 여부

  CONSTRAINT uq_owner_contact_company UNIQUE (owner_id, contact_hash, company_name)
);

CREATE INDEX idx_namecards_owner    ON namecards (owner_id);
CREATE INDEX idx_namecards_company  ON namecards (company_name);
CREATE INDEX idx_namecards_contact  ON namecards (contact_hash);
CREATE INDEX idx_namecards_category ON namecards (job_category);

-- ────────────────────────────────────────────────────
-- 2. contact_transitions
--    한 연락처(contact_hash)의 명함이 회사 A → 회사 B 로 바뀐 사건
--    = "그 사람의 이직" (명함 교체 = 이직 신호)
--    여러 사용자 명함첩에서 동일 연락처가 관찰되면 신뢰도 ↑
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_transitions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  contact_hash     TEXT        NOT NULL,                    -- 누구의 이직인지 (비식별)
  from_company     TEXT        NOT NULL,
  to_company       TEXT        NOT NULL,
  job_category     TEXT,
  from_seniority   TEXT,
  to_seniority     TEXT,
  transitioned_at  DATE,                                    -- 이직 추정 시점
  observed_count   INTEGER     NOT NULL DEFAULT 1,          -- 몇 개 명함첩에서 관측됐나 (교차검증)

  CONSTRAINT uq_transition UNIQUE (contact_hash, from_company, to_company)
);

CREATE INDEX idx_transitions_from   ON contact_transitions (from_company);
CREATE INDEX idx_transitions_to     ON contact_transitions (to_company);
CREATE INDEX idx_transitions_cat    ON contact_transitions (job_category);
CREATE INDEX idx_transitions_pair   ON contact_transitions (from_company, to_company);

-- ────────────────────────────────────────────────────
-- 3. company_network_edges  (집계 자산 ①: 회사 네트워크 맵)
--    회사 ↔ 회사 사이의 네트워크 밀도.
--    동일 명함첩에 두 회사 명함이 함께 등장 = 두 회사가 인접(co-occurrence).
--    "당신의 네트워크가 닿아있는 회사" 추천의 기반.
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_network_edges (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_a     TEXT        NOT NULL,
  company_b     TEXT        NOT NULL,
  job_category  TEXT,                                       -- 직군별 네트워크 분해
  edge_weight   INTEGER     NOT NULL DEFAULT 1,             -- 동시 등장/연결 횟수
  transition_weight INTEGER NOT NULL DEFAULT 0,             -- A→B 이직 흐름 횟수
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_edge_order CHECK (company_a < company_b),  -- 무방향 엣지 정규화
  CONSTRAINT uq_edge UNIQUE (company_a, company_b, job_category)
);

CREATE INDEX idx_edges_a ON company_network_edges (company_a);
CREATE INDEX idx_edges_b ON company_network_edges (company_b);

-- ────────────────────────────────────────────────────
-- 4. career_paths  (집계 자산 ②: 익명 커리어 경로 시퀀스)
--    한 연락처의 회사 이력을 순서대로 모은 "커리어 궤적".
--    유사 궤적을 탄 사람들의 '다음 회사'를 추천에 활용.
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_paths (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_hash  TEXT        NOT NULL UNIQUE,
  job_category  TEXT,
  -- 회사 시퀀스 (오래된 → 최신). 예: ['스타트업A','네이버','토스']
  company_seq   TEXT[]      NOT NULL DEFAULT '{}',
  seniority_seq TEXT[]      NOT NULL DEFAULT '{}',
  total_moves   SMALLINT    NOT NULL DEFAULT 0,             -- 이직 횟수
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paths_category ON career_paths (job_category);
-- 경로 부분일치 검색용 (GIN)
CREATE INDEX idx_paths_seq_gin  ON career_paths USING GIN (company_seq);

-- ────────────────────────────────────────────────────
-- 5. 트리거: namecard 인서트 시 네트워크 엣지 자동 집계
-- ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_network_edges()
RETURNS TRIGGER AS $$
DECLARE
  other RECORD;
  a TEXT;
  b TEXT;
BEGIN
  -- 같은 소유자의 다른 회사 명함들과 엣지 형성 (co-occurrence)
  FOR other IN
    SELECT DISTINCT company_name, job_category
    FROM namecards
    WHERE owner_id = NEW.owner_id
      AND company_name <> NEW.company_name
  LOOP
    -- 무방향 엣지 정규화 (사전순 작은 쪽이 company_a)
    IF NEW.company_name < other.company_name THEN
      a := NEW.company_name; b := other.company_name;
    ELSE
      a := other.company_name; b := NEW.company_name;
    END IF;

    INSERT INTO company_network_edges (company_a, company_b, job_category, edge_weight, updated_at)
    VALUES (a, b, COALESCE(NEW.job_category, other.job_category), 1, NOW())
    ON CONFLICT (company_a, company_b, job_category) DO UPDATE SET
      edge_weight = company_network_edges.edge_weight + 1,
      updated_at  = NOW();
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_network_edges
AFTER INSERT ON namecards
FOR EACH ROW EXECUTE FUNCTION update_network_edges();

-- ────────────────────────────────────────────────────
-- 6. 트리거: contact_transition 인서트 시 A→B 이직 흐름 가중치 반영
-- ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION apply_transition_flow()
RETURNS TRIGGER AS $$
DECLARE
  a TEXT;
  b TEXT;
BEGIN
  IF NEW.from_company < NEW.to_company THEN
    a := NEW.from_company; b := NEW.to_company;
  ELSE
    a := NEW.to_company; b := NEW.from_company;
  END IF;

  INSERT INTO company_network_edges (company_a, company_b, job_category, edge_weight, transition_weight, updated_at)
  VALUES (a, b, NEW.job_category, 0, 1, NOW())
  ON CONFLICT (company_a, company_b, job_category) DO UPDATE SET
    transition_weight = company_network_edges.transition_weight + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transition_flow
AFTER INSERT ON contact_transitions
FOR EACH ROW EXECUTE FUNCTION apply_transition_flow();

-- ────────────────────────────────────────────────────
-- 7. 뷰: 직군별 이직 흐름 랭킹 (from_company 기준 인기 목적지)
-- ────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_transition_destinations AS
SELECT
  from_company,
  to_company,
  job_category,
  SUM(observed_count) AS move_count
FROM contact_transitions
GROUP BY from_company, to_company, job_category
ORDER BY from_company, move_count DESC;

-- ────────────────────────────────────────────────────
-- 8. 함수: 커리어 경로 유사도 기반 회사 추천
--    입력한 회사 시퀀스와 겹치는 경로를 가진 사람들이
--    "다음에 간 회사"를 빈도순으로 반환.
-- ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION recommend_by_career_path(
  p_company_seq TEXT[],
  p_job_category TEXT DEFAULT NULL,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  recommended_company TEXT,
  similar_people      INT,
  avg_overlap         REAL
) LANGUAGE sql STABLE AS $$
  WITH peers AS (
    SELECT
      cp.contact_hash,
      cp.company_seq,
      -- 교집합 크기 = 유사도 점수
      cardinality(ARRAY(
        SELECT unnest(cp.company_seq) INTERSECT SELECT unnest(p_company_seq)
      )) AS overlap
    FROM career_paths cp
    WHERE (p_job_category IS NULL OR cp.job_category = p_job_category)
      AND cp.company_seq && p_company_seq          -- 최소 1개 회사 겹침
  ),
  next_moves AS (
    SELECT
      -- 내가 안 가본 회사 중, peer 들이 간 회사
      c AS recommended_company,
      p.overlap
    FROM peers p,
         LATERAL unnest(p.company_seq) AS c
    WHERE p.overlap > 0
      AND c <> ALL (p_company_seq)
  )
  SELECT
    recommended_company,
    COUNT(*)::INT          AS similar_people,
    AVG(overlap)::REAL     AS avg_overlap
  FROM next_moves
  GROUP BY recommended_company
  ORDER BY similar_people DESC, avg_overlap DESC
  LIMIT p_limit;
$$;

-- ────────────────────────────────────────────────────
-- 9. recommendation_scores
--    3개 축(서베이 적합도 × 네트워크 근접도 × 커리어 경로 유사도)을
--    가중 합산한 최종 추천 점수 영속화. 추천 재현/AB 테스트/튜닝에 활용.
-- ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendation_scores (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id             UUID        REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_name        TEXT        NOT NULL,                    -- 추천 대상 회사

  -- 3개 축 원점수 (0~1 정규화)
  survey_fit          DECIMAL(4,3) NOT NULL DEFAULT 0,         -- 서베이 적합도
  network_proximity   DECIMAL(4,3) NOT NULL DEFAULT 0,         -- 네트워크 근접도
  career_similarity   DECIMAL(4,3) NOT NULL DEFAULT 0,         -- 커리어 경로 유사도

  -- 가중치 (합 = 1.0 권장)
  weight_survey       DECIMAL(4,3) NOT NULL DEFAULT 0.50,
  weight_network      DECIMAL(4,3) NOT NULL DEFAULT 0.25,
  weight_career       DECIMAL(4,3) NOT NULL DEFAULT 0.25,

  final_score         DECIMAL(5,4) NOT NULL DEFAULT 0,         -- 가중 합산 결과
  calculated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recscore_user    ON recommendation_scores (user_id);
CREATE INDEX idx_recscore_company ON recommendation_scores (company_name);
CREATE INDEX idx_recscore_final   ON recommendation_scores (final_score DESC);

-- 최종 점수 자동 계산 (가중 합산)
CREATE OR REPLACE FUNCTION compute_final_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_score :=
      NEW.survey_fit        * NEW.weight_survey
    + NEW.network_proximity * NEW.weight_network
    + NEW.career_similarity * NEW.weight_career;
  NEW.calculated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_final_score
BEFORE INSERT OR UPDATE ON recommendation_scores
FOR EACH ROW EXECUTE FUNCTION compute_final_score();


-- ────────────────────────────────────────────────────
-- 10. RLS — 본인 데이터만 접근, 집계 테이블은 service_role 조회
-- ────────────────────────────────────────────────────
ALTER TABLE user_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE namecards             ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_transitions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 추천점수 접근" ON recommendation_scores
  FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "본인 프로필 접근" ON user_profiles
  FOR ALL USING (auth.uid() = auth_user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = auth_user_id OR auth.role() = 'service_role');

CREATE POLICY "본인 명함첩만 접근" ON namecards
  FOR ALL USING (
    owner_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    owner_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "transition INSERT 허용" ON contact_transitions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "transition service 조회" ON contact_transitions
  FOR SELECT USING (auth.role() = 'service_role');

COMMIT;
