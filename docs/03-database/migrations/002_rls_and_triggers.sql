-- Migration: 002_rls_and_triggers
-- Created: 2026-05-30
-- Description: RLS 정책 + 자동 집계 트리거

BEGIN;

-- ── RLS 활성화 ────────────────────────────────────────────────────
ALTER TABLE company_insights     ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_cache       ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_reputation   ENABLE ROW LEVEL SECURITY;

-- company_insights: anon은 INSERT만, service_role은 SELECT 가능
CREATE POLICY "anon_insert_insights"
  ON company_insights FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "service_select_insights"
  ON company_insights FOR SELECT TO service_role USING (true);

-- alert_subscriptions: anon INSERT + email 본인만 SELECT
CREATE POLICY "anon_insert_alerts"
  ON alert_subscriptions FOR INSERT TO anon WITH CHECK (true);

-- analysis_cache: service_role 전용
CREATE POLICY "service_all_cache"
  ON analysis_cache FOR ALL TO service_role USING (true);

-- company_reputation: 누구나 SELECT (공개 데이터)
CREATE POLICY "public_read_reputation"
  ON company_reputation FOR SELECT USING (insight_count >= 10); -- 최소 10건 이상만 공개

CREATE POLICY "service_write_reputation"
  ON company_reputation FOR ALL TO service_role USING (true);

-- ── 회사 평판 자동 집계 트리거 ────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_company_reputation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.company_name IS NULL OR NEW.company_name = '' THEN
    RETURN NEW;
  END IF;

  WITH agg AS (
    SELECT
      NEW.company_name                                          AS company_name,
      ROUND(AVG(nps_score)::NUMERIC, 2)                        AS avg_nps,
      ROUND(AVG(mgmt_trust_score)::NUMERIC, 2)                 AS avg_mgmt_trust,
      ROUND(AVG(stay_probability)::NUMERIC, 2)                 AS avg_stay_prob,
      COUNT(*)                                                  AS cnt
    FROM company_insights
    WHERE company_name = NEW.company_name
      AND nps_score IS NOT NULL
  )
  INSERT INTO company_reputation (company_name, avg_nps, avg_mgmt_trust, avg_stay_prob, insight_count, updated_at)
  SELECT company_name, avg_nps, avg_mgmt_trust, avg_stay_prob, cnt, NOW()
  FROM agg
  ON CONFLICT (company_name) DO UPDATE SET
    avg_nps        = EXCLUDED.avg_nps,
    avg_mgmt_trust = EXCLUDED.avg_mgmt_trust,
    avg_stay_prob  = EXCLUDED.avg_stay_prob,
    insight_count  = EXCLUDED.insight_count,
    updated_at     = NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_company_reputation
  AFTER INSERT ON company_insights
  FOR EACH ROW EXECUTE FUNCTION fn_update_company_reputation();

-- ── 만료 캐시 자동 정리 (pg_cron 사용 시) ─────────────────────────
-- SELECT cron.schedule('cleanup-cache', '0 3 * * *', 'DELETE FROM analysis_cache WHERE expires_at < NOW()');

COMMIT;
