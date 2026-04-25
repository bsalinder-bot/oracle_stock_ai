-- ============================================================
-- OracleStock AI — Supabase Database Initialization
-- Run this once in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE (mirrors auth.users with org metadata)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  org_id        UUID NOT NULL DEFAULT uuid_generate_v4(),
  role          TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'viewer', 'admin')),
  display_name  TEXT,
  is_master_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, is_master_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email = 'bsalinder@gmail.com'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- PRODUCTS TABLE (SKU cards)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL,
  sku             TEXT NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT,
  stock_level     INTEGER NOT NULL DEFAULT 0,
  reorder_point   INTEGER NOT NULL DEFAULT 100,
  lead_time_days  INTEGER NOT NULL DEFAULT 14,
  unit_cost       NUMERIC(12,2),
  supplier_id     UUID,
  status          TEXT NOT NULL DEFAULT 'healthy'
                  CHECK (status IN ('healthy', 'warning', 'critical', 'stockout')),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_user_id  ON public.products(user_id);
CREATE INDEX idx_products_org_id   ON public.products(org_id);
CREATE INDEX idx_products_status   ON public.products(status);

-- ============================================================
-- SUPPLIERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL,
  name            TEXT NOT NULL,
  region          TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  reliability_score NUMERIC(5,2) CHECK (reliability_score BETWEEN 0 AND 100),
  lead_time_days  INTEGER,
  contract_url    TEXT,
  is_backup       BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_suppliers_org_id  ON public.suppliers(org_id);

-- ============================================================
-- RISK_LOGS TABLE (Critical Risks + Oracle events)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.risk_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL,
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  supplier_id     UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  risk_type       TEXT NOT NULL
                  CHECK (risk_type IN (
                    'port_congestion', 'weather_disruption',
                    'supplier_failure', 'demand_spike',
                    'geopolitical', 'quality_issue', 'custom'
                  )),
  risk_score      NUMERIC(5,2) NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  title           TEXT NOT NULL,
  description     TEXT,
  oracle_reasoning TEXT,           -- Chain-of-thought from Claude
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'mitigated', 'escalated', 'dismissed')),
  contract_drafted BOOLEAN NOT NULL DEFAULT FALSE,
  contract_pdf_url TEXT,
  webhook_fired   BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX idx_risk_logs_user_id    ON public.risk_logs(user_id);
CREATE INDEX idx_risk_logs_org_id     ON public.risk_logs(org_id);
CREATE INDEX idx_risk_logs_risk_score ON public.risk_logs(risk_score DESC);
CREATE INDEX idx_risk_logs_status     ON public.risk_logs(status);

-- ============================================================
-- SUPPLIER_MESSAGES TABLE (ActionSheet outbox)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.supplier_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL,
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  risk_log_id     UUID REFERENCES public.risk_logs(id),
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  channel         TEXT NOT NULL DEFAULT 'email'
                  CHECK (channel IN ('email', 'sms', 'slack', 'whatsapp')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORACLE_SESSIONS TABLE (AI chain-of-thought audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.oracle_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL,
  input_context   JSONB NOT NULL DEFAULT '{}',
  full_reasoning  TEXT,
  risk_delta      JSONB,           -- before/after risk scores
  model_version   TEXT DEFAULT 'claude-sonnet-4-5',
  tokens_used     INTEGER,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY — ACTIVATION
-- ============================================================
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_sessions   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MASTER ADMIN HELPER FUNCTION
-- Returns TRUE if the current JWT belongs to bsalinder@gmail.com
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND is_master_admin = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES — USERS
-- ============================================================
CREATE POLICY "users_select_own_or_admin" ON public.users
  FOR SELECT USING (
    id = auth.uid() OR public.is_master_admin()
  );

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- RLS POLICIES — PRODUCTS
-- ============================================================
CREATE POLICY "products_select" ON public.products
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_master_admin()
  );

CREATE POLICY "products_insert" ON public.products
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_update" ON public.products
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "products_delete" ON public.products
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES — SUPPLIERS
-- ============================================================
CREATE POLICY "suppliers_select" ON public.suppliers
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_master_admin()
  );

CREATE POLICY "suppliers_insert" ON public.suppliers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "suppliers_update" ON public.suppliers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "suppliers_delete" ON public.suppliers
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES — RISK_LOGS
-- ============================================================
CREATE POLICY "risk_logs_select" ON public.risk_logs
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_master_admin()
  );

CREATE POLICY "risk_logs_insert" ON public.risk_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "risk_logs_update" ON public.risk_logs
  FOR UPDATE USING (user_id = auth.uid() OR public.is_master_admin());

-- ============================================================
-- RLS POLICIES — SUPPLIER_MESSAGES
-- ============================================================
CREATE POLICY "messages_select" ON public.supplier_messages
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_master_admin()
  );

CREATE POLICY "messages_insert" ON public.supplier_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES — ORACLE_SESSIONS
-- ============================================================
CREATE POLICY "oracle_select" ON public.oracle_sessions
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_master_admin()
  );

CREATE POLICY "oracle_insert" ON public.oracle_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- UPDATED_AT TRIGGER (products + users)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- SEED DATA — demo org for bsalinder@gmail.com
-- (Only runs if the master admin user already exists)
-- ============================================================
DO $$
DECLARE
  v_user_id UUID;
  v_org_id  UUID := uuid_generate_v4();
  v_sup1_id UUID := uuid_generate_v4();
  v_sup2_id UUID := uuid_generate_v4();
  v_prod1   UUID := uuid_generate_v4();
  v_prod2   UUID := uuid_generate_v4();
  v_prod3   UUID := uuid_generate_v4();
BEGIN
  SELECT id INTO v_user_id FROM public.users WHERE email = 'bsalinder@gmail.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Master admin not yet signed in — seed skipped. Run again after first login.';
    RETURN;
  END IF;

  UPDATE public.users SET org_id = v_org_id WHERE id = v_user_id;

  INSERT INTO public.suppliers (id, user_id, org_id, name, region, contact_email, reliability_score, lead_time_days, is_backup)
  VALUES
    (v_sup1_id, v_user_id, v_org_id, 'Shenzhen ProTech Ltd',  'Asia-Pacific', 'ops@shenzhen-protech.com', 91.2, 18, FALSE),
    (v_sup2_id, v_user_id, v_org_id, 'MexFab Industries',     'North America','contact@mexfab.com',        78.5, 9,  TRUE)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.products (id, user_id, org_id, sku, name, category, stock_level, reorder_point, lead_time_days, unit_cost, supplier_id, status)
  VALUES
    (v_prod1, v_user_id, v_org_id, 'SKU-7842', 'HDMI 4K Cables',        'Electronics', 2847, 500, 18, 4.20,  v_sup1_id, 'healthy'),
    (v_prod2, v_user_id, v_org_id, 'SKU-3391', 'USB-C Hubs',             'Electronics', 189,  300, 21, 14.99, v_sup1_id, 'critical'),
    (v_prod3, v_user_id, v_org_id, 'SKU-9104', 'Wireless Charger Pads',  'Electronics', 1203, 250, 14, 8.75,  v_sup2_id, 'warning')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.risk_logs (user_id, org_id, product_id, supplier_id, risk_type, risk_score, title, description, status)
  VALUES
    (v_user_id, v_org_id, v_prod2, v_sup1_id, 'port_congestion',    87.3, 'Port of Shanghai — Tier-1 Congestion',    'Vessel delays averaging 11 days. SKU-3391 shipment at risk.',  'active'),
    (v_user_id, v_org_id, v_prod3, v_sup2_id, 'weather_disruption', 62.1, 'Typhoon Mawar — South China Sea Track',   'Category 3 system 340nm from primary shipping lane.',          'active'),
    (v_user_id, v_org_id, v_prod1, v_sup1_id, 'demand_spike',       44.7, 'Q4 Demand Surge Detected',               'Forecast model projects +340% velocity in 72h window.',        'active')
  ON CONFLICT DO NOTHING;

END $$;

-- Done
SELECT 'OracleStock AI database initialized successfully.' AS result;
