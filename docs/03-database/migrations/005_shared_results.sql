-- Migration: 005_shared_results
-- Created: 2026-05-30
-- Description: 영구 공유 결과 저장 테이블

BEGIN;

CREATE TABLE IF NOT EXISTS shared_results (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id     TEXT        NOT NULL UNIQUE,           -- 8자 랜덤 ID (URL용)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  result_json  JSONB       NOT NULL,
  stage1_json  JSONB       NOT NULL,
  view_count   INTEGER     NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_shared_share_id  ON shared_results (share_id);
CREATE INDEX idx_shared_expires   ON shared_results (expires_at);

ALTER TABLE shared_results ENABLE ROW LEVEL SECURITY;

-- 누구나 저장 가능
CREATE POLICY "anon_insert_shared"
  ON shared_results FOR INSERT TO anon WITH CHECK (true);

-- 누구나 share_id로 조회 가능 (만료 전)
CREATE POLICY "public_read_shared"
  ON shared_results FOR SELECT
  USING (expires_at > NOW());

-- 조회수 업데이트 함수
CREATE OR REPLACE FUNCTION increment_view_count(p_share_id TEXT)
RETURNS void LANGUAGE sql AS $$
  UPDATE shared_results SET view_count = view_count + 1 WHERE share_id = p_share_id;
$$;

COMMIT;
