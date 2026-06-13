-- Migration: 012_domain_billing
-- Created: 2026-06-13
-- Domain: 결제/정산 (Billing & Settlement) — v3 엔터프라이즈 모델
-- Tables: 12 (plans, contracts, billing_subscriptions, payment_methods, invoices,
--             invoice_items, payments, refunds, tax_invoices, success_fees, settlements, credits)
-- Note:
--   legacy subscriptions(006) 와 충돌 회피를 위해 구독 테이블명은 billing_subscriptions 사용.
--   기업(B2B) 정산 데이터 → service_role 전용 RLS.

BEGIN;

-- ── 1. plans ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  plan_code        TEXT        NOT NULL UNIQUE,
  monthly_fee      INT,
  annual_fee       INT,
  success_fee_rate FLOAT
);

-- ── 2. contracts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id      UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contract_type   TEXT,
  billing_method  TEXT,
  contract_status TEXT        DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_contracts_company ON contracts (company_id);

-- ── 3. billing_subscriptions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id          UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id             UUID        REFERENCES plans(id) ON DELETE SET NULL,
  contract_id         UUID        REFERENCES contracts(id) ON DELETE SET NULL,
  end_date            DATE,
  subscription_status TEXT        DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_company ON billing_subscriptions (company_id);

-- ── 4. payment_methods ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_methods (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  method_type TEXT,
  is_default  BOOLEAN     DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_payment_methods_company ON payment_methods (company_id);

-- ── 5. invoices ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id      UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscription_id UUID        REFERENCES billing_subscriptions(id) ON DELETE SET NULL,
  total_amount    INT,
  invoice_status  TEXT        DEFAULT 'issued'
);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices (company_id);

-- ── 6. invoice_items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoice_id  UUID        NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  charge_type TEXT,
  unit_price  INT,
  quantity    INT
);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id);

-- ── 7. payments ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id        UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id        UUID        REFERENCES invoices(id) ON DELETE SET NULL,
  payment_method_id UUID        REFERENCES payment_methods(id) ON DELETE SET NULL,
  total_amount      INT,
  payment_status    TEXT        DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_payments_company ON payments (company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments (invoice_id);

-- ── 8. refunds ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refunds (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_id    UUID        NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  refund_amount INT,
  refund_status TEXT        DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds (payment_id);

-- ── 9. tax_invoices ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tax_invoices (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_id   UUID        REFERENCES payments(id) ON DELETE SET NULL,
  invoice_id   UUID        REFERENCES invoices(id) ON DELETE SET NULL,
  issue_status TEXT        DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_payment ON tax_invoices (payment_id);

-- ── 10. success_fees ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS success_fees (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id     UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  application_id UUID        REFERENCES applications(id) ON DELETE SET NULL,
  fee_amount     INT,
  status         TEXT        DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_success_fees_company ON success_fees (company_id);

-- ── 11. settlements ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settlements (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id        UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  total_amount      INT,
  unpaid_amount     INT,
  settlement_status TEXT        DEFAULT 'open'
);
CREATE INDEX IF NOT EXISTS idx_settlements_company ON settlements (company_id);

-- ── 12. credits ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credits (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_id    UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  credit_type   TEXT,
  remaining_qty INT         DEFAULT 0,
  status        TEXT        DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_credits_company ON credits (company_id);

-- ────────────────────────────────────────────────────
-- RLS — B2B 정산 데이터: service_role 전용
-- ────────────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  svc TEXT[] := ARRAY[
    'plans','contracts','billing_subscriptions','payment_methods','invoices',
    'invoice_items','payments','refunds','tax_invoices','success_fees',
    'settlements','credits'
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

COMMIT;
