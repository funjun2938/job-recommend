-- Migration: 003_views_and_functions
-- Created: 2026-05-30
-- Description: 분석용 뷰 + 유틸 함수

BEGIN;

-- ── 연봉 벤치마크 뷰 ──────────────────────────────────────────────
CREATE OR REPLACE VIEW v_salary_benchmark AS
SELECT
  job_category,
  company_size,
  COUNT(*)                                                      AS sample_count,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY actual_salary)::INT AS salary_p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY actual_salary)::INT AS salary_p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY actual_salary)::INT AS salary_p75,
  MIN(actual_salary)                                            AS salary_min,
  MAX(actual_salary)                                           AS salary_max,
  ROUND(AVG(actual_salary)::NUMERIC, 0)::INT                   AS salary_avg
FROM company_insights
WHERE actual_salary IS NOT NULL
  AND actual_salary BETWEEN 1500 AND 50000
GROUP BY job_category, company_size
HAVING COUNT(*) >= 3; -- 익명성 보호: 최소 3건

-- ── 이직 이유 집계 뷰 ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_exit_reasons AS
SELECT
  job_category,
  company_size,
  unnest(resignation_reasons) AS reason,
  COUNT(*)                    AS freq
FROM company_insights
GROUP BY job_category, company_size, reason
ORDER BY job_category, freq DESC;

-- ── 주간 유입 통계 뷰 ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_weekly_stats AS
SELECT
  DATE_TRUNC('week', created_at) AS week_start,
  COUNT(*)                        AS total_insights,
  COUNT(DISTINCT job_category)    AS job_categories,
  AVG(actual_salary)::INT         AS avg_salary,
  AVG(nps_score)::DECIMAL(4,2)    AS avg_nps
FROM company_insights
GROUP BY 1
ORDER BY 1 DESC;

-- ── 회사 검색 함수 (트라이그램 유사 검색) ─────────────────────────
CREATE OR REPLACE FUNCTION search_companies(query TEXT, lim INT DEFAULT 10)
RETURNS TABLE (
  company_name TEXT,
  insight_count INT,
  avg_nps DECIMAL,
  similarity REAL
) LANGUAGE sql STABLE AS $$
  SELECT
    cr.company_name,
    cr.insight_count,
    cr.avg_nps,
    SIMILARITY(cr.company_name, query) AS similarity
  FROM company_reputation cr
  WHERE cr.company_name % query -- 트라이그램 매칭
    AND cr.insight_count >= 5
  ORDER BY similarity DESC
  LIMIT lim;
$$;

-- ── 연봉 퍼센타일 계산 함수 ───────────────────────────────────────
CREATE OR REPLACE FUNCTION get_salary_percentile(
  p_job_category TEXT,
  p_company_size TEXT,
  p_salary       INTEGER
) RETURNS INTEGER LANGUAGE sql STABLE AS $$
  SELECT
    ROUND(
      (COUNT(*) FILTER (WHERE actual_salary <= p_salary)::FLOAT /
       NULLIF(COUNT(*), 0) * 100)
    )::INT
  FROM company_insights
  WHERE job_category = p_job_category
    AND company_size  = p_company_size
    AND actual_salary IS NOT NULL;
$$;

COMMIT;
