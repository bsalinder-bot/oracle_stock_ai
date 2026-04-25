// app/page.tsx — OracleStock AI Dashboard
// Full production build: live DB, Oracle streaming, CRT aesthetics
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase }         from '@/lib/supabase/client';
import {
  fetchDashboardMetrics, fetchSKUCards,
  fetchRiskCards, fetchSupplierScoreCards,
  SyncEngine, updateRiskStatus,
} from '@/lib/sync-engine';
import { ActionSheet }      from '@/components/ActionSheet';
import type {
  DashboardMetrics, SKUCard,
  RiskCard, SupplierScoreCard,
} from '@/types/database';
import type { User }        from '@supabase/supabase-js';

// ─── Status helpers ───────────────────────────────────────────────────
const STATUS_COLOR = {
  healthy:  '#20dca0',
  warning:  '#f5a623',
  critical: '#ff3c5a',
  stockout: '#cc0033',
};

const RISK_TYPE_LABEL: Record<string, string> = {
  port_congestion:    '⚓ PORT',
  weather_disruption: '🌀 WEATHER',
  supplier_failure:   '⛔ SUPPLIER',
  demand_spike:       '📈 DEMAND',
  geopolitical:       '🌐 GEO',
  quality_issue:      '⚠ QUALITY',
  custom:             '● CUSTOM',
};

// ─── Root page ────────────────────────────────────────────────────────
export default function OracleStockDashboard() {
  const [user,        setUser]        = useState<User | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [metrics,     setMetrics]     = useState<DashboardMetrics | null>(null);
  const [skus,        setSkus]        = useState<SKUCard[]>([]);
  const [risks,       setRisks]       = useState<RiskCard[]>([]);
  const [suppliers,   setSuppliers]   = useState<SupplierScoreCard[]>([]);
  const [orgId,       setOrgId]       = useState('');

  // Oracle sidebar state
  const [oracleText,  setOracleText]  = useState('');
  const [oracleRunning, setOracleRunning] = useState(false);
  const [oracleMeta,  setOracleMeta]  = useState<{ skusAnalyzed: number; tokens: number } | null>(null);
  const oracleEndRef = useRef<HTMLDivElement>(null);

  // ActionSheet
  const [sheetOpen,   setSheetOpen]   = useState(false);
  const [activeRisk,  setActiveRisk]  = useState<RiskCard | null>(null);

  // Active tab (mobile)
  const [activeTab,   setActiveTab]   = useState<'overview' | 'risks' | 'suppliers' | 'oracle'>('overview');

  // Flicker control
  const [flicker, setFlicker] = useState(false);

  // ── Auth ────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data ────────────────────────────────────────────────
  const loadAll = useCallback(async (uid: string) => {
    try {
      const [m, s, r, sup] = await Promise.all([
        fetchDashboardMetrics(uid),
        fetchSKUCards(uid),
        fetchRiskCards(uid),
        fetchSupplierScoreCards(uid),
      ]);
      setMetrics(m);
      setSkus(s);
      setRisks(r);
      setSuppliers(sup);

      // Get org_id from user row
      const { data: userRow } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', uid)
        .single();
      if (userRow) setOrgId(userRow.org_id);
    } catch (err) {
      console.error('[LoadAll] Error:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadAll(user.id);

    // Real-time sync
    const engine = new SyncEngine(user.id);
    engine.subscribe((event, table) => {
      console.log(`[SyncEngine] ${event} on ${table}`);
      loadAll(user.id);
    });
    return () => { engine.destroy(); };
  }, [user, loadAll]);

  // ── Oracle random flicker ────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        setFlicker(true);
        setTimeout(() => setFlicker(false), 80 + Math.random() * 120);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // ── Oracle scroll-to-bottom ──────────────────────────────────
  useEffect(() => {
    oracleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [oracleText]);

  // ── Run Oracle analysis ──────────────────────────────────────
  const runOracle = async () => {
    if (!user || oracleRunning) return;
    setOracleRunning(true);
    setOracleText('');
    setOracleMeta(null);
    setActiveTab('oracle');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/oracle-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const msg = JSON.parse(line.slice(6));
            if (msg.type === 'token') {
              setOracleText(prev => prev + msg.text);
            } else if (msg.type === 'meta') {
              setOracleMeta({ skusAnalyzed: msg.skusAnalyzed, tokens: 0 });
            } else if (msg.type === 'done') {
              setOracleMeta(prev => prev ? { ...prev, tokens: msg.tokensUsed } : null);
            } else if (msg.type === 'webhook_trigger') {
              // Fire webhook for contract drafting
              fireWebhook(risks[0]);
            }
          } catch {}
        }
      }
    } catch (err) {
      setOracleText(`[ERROR] Oracle connection failed: ${err}\n\nEnsure ANTHROPIC_API_KEY is set in your environment.`);
    } finally {
      setOracleRunning(false);
    }
  };

  // ── Fire webhook ─────────────────────────────────────────────
  const fireWebhook = async (risk: RiskCard) => {
    if (!risk || !user) return;
    const backup = suppliers.find(s => s.isBackup) ?? suppliers[0];
    if (!backup) return;

    try {
      await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event:           'RISK_THRESHOLD_BREACH',
          riskId:          risk.id,
          userId:          user.id,
          riskScore:       risk.riskScore,
          riskTitle:       risk.title,
          productSku:      risk.productSku   ?? '',
          productName:     risk.productName  ?? '',
          primarySupplier: risk.supplierName ?? '',
          backupSupplier:  backup.name,
          backupEmail:     backup.contactEmail,
          orgName:         user.email?.split('@')[0] ?? 'Unknown Org',
        }),
      });
      await loadAll(user.id);
    } catch {}
  };

  // ── Sign in ──────────────────────────────────────────────────
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: window.location.origin },
    });
  };

  const signOut = () => supabase.auth.signOut();

  // ── Login screen ─────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="login-screen">
          <div className="scanlines" />
          <div className="login-card">
            <div className="login-logo">ORACLE<span>STOCK</span></div>
            <div className="login-sub">AI SUPPLY CHAIN INTELLIGENCE</div>
            <div className="login-divider" />
            <p className="login-desc">
              Predict disruptions before they happen.<br />
              Powered by Claude + real-time data ingestion.
            </p>
            <button className="login-btn" onClick={signIn}>
              ◉ AUTHENTICATE WITH GOOGLE
            </button>
            <div className="login-security">
              256-bit AES · Row Level Security · Zero Trust
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="boot-screen">
          <div className="scanlines" />
          <div className="boot-text">ORACLESTOCK AI · INITIALIZING...</div>
          <div className="boot-bar"><div className="boot-fill" /></div>
        </div>
      </>
    );
  }

  const isMasterAdmin = user?.email === 'bsalinder@gmail.com';
  const highestRisk   = risks.reduce((max, r) => r.riskScore > max ? r.riskScore : max, 0);

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="app">
        {/* Scanline overlay */}
        <div className="scanlines" aria-hidden="true" />

        {/* ── NAV ──────────────────────────────────────────── */}
        <nav className="navbar">
          <div className="nav-brand">
            ORACLE<span>STOCK</span>
            {isMasterAdmin && <span className="nav-admin-badge">MASTER ADMIN</span>}
          </div>
          <div className="nav-status">
            {highestRisk >= 75 && (
              <span className="nav-alert pulse-red">⬛ CRITICAL RISK DETECTED</span>
            )}
            <span className="nav-user">{user?.email}</span>
            <button className="nav-signout" onClick={signOut}>SIGN OUT</button>
          </div>
        </nav>

        {/* ── MOBILE TAB BAR ──────────────────────────────── */}
        <div className="mobile-tabs">
          {(['overview', 'risks', 'suppliers', 'oracle'] as const).map(tab => (
            <button
              key={tab}
              className={`mobile-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? '◎ OVERVIEW' :
               tab === 'risks'    ? '⚠ RISKS' :
               tab === 'suppliers'? '◈ SUPPLY' : '◉ ORACLE'}
            </button>
          ))}
        </div>

        {/* ── MAIN LAYOUT ──────────────────────────────────── */}
        <div className="main-layout">

          {/* LEFT COLUMN ─────────────────────────────────── */}
          <div className={`left-col ${activeTab !== 'overview' && activeTab !== 'risks' && activeTab !== 'suppliers' ? 'hidden-mobile' : ''}`}>

            {/* KPI Metrics */}
            <div className={`section ${activeTab !== 'overview' ? 'hidden-mobile' : ''}`}>
              <div className="section-header">
                <span className="section-title">● GLOBAL METRICS</span>
                {isMasterAdmin && <span className="admin-scope">ALL ORGS</span>}
              </div>
              <div className="kpi-grid">
                <KpiCard label="TOTAL SKUs"       value={metrics?.totalSkus ?? 0}       unit=""  color="#20dca0" />
                <KpiCard label="CRITICAL"         value={metrics?.criticalCount ?? 0}   unit=""  color="#ff3c5a" />
                <KpiCard label="ACTIVE RISKS"     value={metrics?.activeRisks ?? 0}     unit=""  color="#f5a623" />
                <KpiCard label="AVG RISK SCORE"   value={metrics?.avgRiskScore ?? 0}    unit="%" color={
                  (metrics?.avgRiskScore ?? 0) >= 70 ? '#ff3c5a' :
                  (metrics?.avgRiskScore ?? 0) >= 50 ? '#f5a623' : '#20dca0'
                } />
                <KpiCard label="SUPPLIER SCORE"   value={metrics?.avgSupplierScore ?? 0} unit="%" color="#20dca0" />
                <KpiCard label="HIGH RISK"        value={metrics?.highRisks ?? 0}       unit=""  color="#ff3c5a" />
              </div>
            </div>

            {/* SKU Cards */}
            <div className={`section ${activeTab !== 'overview' ? 'hidden-mobile' : ''}`}>
              <div className="section-header">
                <span className="section-title">◈ INVENTORY SKUs</span>
                <span className="section-count">{skus.length}</span>
              </div>
              <div className="sku-list">
                {skus.length === 0 && <EmptyState label="No SKUs found" />}
                {skus.map(sku => (
                  <SkuCard key={sku.id} sku={sku} />
                ))}
              </div>
            </div>

            {/* Risk Cards */}
            <div className={`section ${activeTab !== 'risks' ? 'hidden-mobile' : ''}`}>
              <div className="section-header">
                <span className="section-title">⚠ CRITICAL RISKS</span>
                <span className="section-count">{risks.length}</span>
              </div>
              <div className="risk-list">
                {risks.length === 0 && <EmptyState label="No active risks" />}
                {risks.map(risk => (
                  <RiskCardUI
                    key={risk.id}
                    risk={risk}
                    onMitigate={() => {
                      setActiveRisk(risk);
                      setSheetOpen(true);
                    }}
                    onDismiss={async () => {
                      await updateRiskStatus(risk.id, 'dismissed');
                      await loadAll(user!.id);
                    }}
                    onDraftContract={() => fireWebhook(risk)}
                  />
                ))}
              </div>
            </div>

            {/* Supplier Score Cards */}
            <div className={`section ${activeTab !== 'suppliers' ? 'hidden-mobile' : ''}`}>
              <div className="section-header">
                <span className="section-title">◎ SUPPLIER SCORES</span>
                <span className="section-count">{suppliers.length}</span>
              </div>
              <div className="supplier-list">
                {suppliers.length === 0 && <EmptyState label="No suppliers found" />}
                {suppliers.map(s => (
                  <SupplierCard key={s.id} supplier={s} />
                ))}
              </div>
            </div>

          </div>

          {/* ORACLE SIDEBAR ──────────────────────────────── */}
          <div className={`oracle-sidebar ${activeTab !== 'oracle' ? 'hidden-mobile' : ''} ${flicker ? 'crt-flicker' : ''}`}>
            {/* CRT scanlines */}
            <div className="crt-lines" aria-hidden="true" />

            <div className="oracle-header">
              <div className="oracle-title-row">
                <span className="oracle-dot pulse-green" />
                <span className="oracle-title">THE ORACLE</span>
                <span className="oracle-model">claude-sonnet-4-5</span>
              </div>
              {oracleMeta && (
                <div className="oracle-meta">
                  {oracleMeta.skusAnalyzed} SKUs · {oracleMeta.tokens} tokens
                </div>
              )}
            </div>

            <div className="oracle-body">
              {!oracleText && !oracleRunning && (
                <div className="oracle-idle">
                  <div className="oracle-idle-icon">◉</div>
                  <div className="oracle-idle-text">
                    ORACLE STANDBY<br />
                    <span>Awaiting analysis command.</span>
                    <br /><br />
                    Ingests: port congestion · weather events · live inventory
                  </div>
                </div>
              )}
              {oracleRunning && !oracleText && (
                <div className="oracle-boot">
                  <span className="oracle-cursor">INGESTING LIVE DATA FEEDS...</span>
                </div>
              )}
              <div className="oracle-text">
                {oracleText}
                {oracleRunning && <span className="oracle-cursor">█</span>}
              </div>
              <div ref={oracleEndRef} />
            </div>

            <div className="oracle-footer">
              <button
                className={`oracle-run-btn ${oracleRunning ? 'running' : ''}`}
                onClick={runOracle}
                disabled={oracleRunning}
              >
                {oracleRunning ? '◉ ANALYZING...' : '◉ RUN ORACLE ANALYSIS'}
              </button>
              <div className="oracle-disclaimer">
                Chain-of-thought · Port + Weather ingestion · Auto webhook at 75%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ActionSheet */}
      <ActionSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        risk={activeRisk}
        suppliers={suppliers}
        userId={user?.id ?? ''}
        orgId={orgId}
      />
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

function KpiCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-value" style={{ color }}>{value}{unit}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function SkuCard({ sku }: { sku: SKUCard }) {
  const pct = Math.min(100, (sku.stockLevel / Math.max(sku.reorderPoint * 3, 1)) * 100);
  return (
    <div className={`sku-card ${sku.status}`}>
      <div className="sku-row1">
        <span className="sku-id">{sku.sku}</span>
        <span className="sku-status" style={{ color: STATUS_COLOR[sku.status] }}>
          {sku.status.toUpperCase()}
        </span>
      </div>
      <div className="sku-name">{sku.name}</div>
      <div className="sku-bar-wrap">
        <div className="sku-bar" style={{ width: `${pct}%`, background: STATUS_COLOR[sku.status] }} />
      </div>
      <div className="sku-row2">
        <span>{sku.stockLevel.toLocaleString()} units</span>
        <span>{sku.daysOfStock}d stock</span>
        <span>{sku.supplierName}</span>
      </div>
    </div>
  );
}

function RiskCardUI({ risk, onMitigate, onDismiss, onDraftContract }: {
  risk:             RiskCard;
  onMitigate:       () => void;
  onDismiss:        () => void;
  onDraftContract:  () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor =
    risk.riskScore >= 75 ? '#ff3c5a' :
    risk.riskScore >= 50 ? '#f5a623' : '#20dca0';

  return (
    <div className={`risk-card ${risk.severity}`}>
      <div className="risk-header" onClick={() => setExpanded(e => !e)}>
        <div className="risk-left">
          <span className="risk-type-tag">{RISK_TYPE_LABEL[risk.riskType] ?? '● RISK'}</span>
          <span className="risk-title-text">{risk.title}</span>
        </div>
        <div className="risk-score" style={{ color: scoreColor }}>
          {risk.riskScore.toFixed(0)}%
        </div>
      </div>

      <div className="risk-score-bar-wrap">
        <div
          className="risk-score-bar"
          style={{ width: `${risk.riskScore}%`, background: scoreColor }}
        />
      </div>

      {expanded && (
        <div className="risk-expanded">
          <p className="risk-desc">{risk.description}</p>
          {risk.productSku && (
            <div className="risk-detail">
              SKU: <strong>{risk.productSku}</strong> — {risk.productName}
            </div>
          )}
          {risk.oracleReasoning && (
            <div className="risk-oracle-note">
              <span className="risk-oracle-label">◉ ORACLE:</span> {risk.oracleReasoning.slice(0, 240)}...
            </div>
          )}
          {risk.contractDrafted && risk.contractPdfUrl && (
            <a
              href={risk.contractPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="risk-pdf-link"
            >
              ↓ VIEW DRAFTED CONTRACT PDF
            </a>
          )}
        </div>
      )}

      <div className="risk-actions">
        <button className="risk-btn-mitigate" onClick={onMitigate}>⚡ MITIGATE</button>
        {!risk.contractDrafted && risk.riskScore >= 75 && (
          <button className="risk-btn-contract" onClick={onDraftContract}>📄 DRAFT CONTRACT</button>
        )}
        <button className="risk-btn-dismiss" onClick={onDismiss}>✕</button>
      </div>
    </div>
  );
}

function SupplierCard({ supplier }: { supplier: SupplierScoreCard }) {
  const gradeColor = { A: '#20dca0', B: '#7bdfca', C: '#f5a623', D: '#ff3c5a' }[supplier.grade];
  return (
    <div className="supplier-card">
      <div className="sup-row1">
        <span className="sup-name">{supplier.name}</span>
        <span className="sup-grade" style={{ color: gradeColor }}>{supplier.grade}</span>
      </div>
      <div className="sup-row2">
        <span>{supplier.region}</span>
        <span>{supplier.reliabilityScore}% reliable</span>
        <span>{supplier.leadTimeDays}d lead</span>
      </div>
      <div className="sup-bar-wrap">
        <div className="sup-bar" style={{ width: `${supplier.reliabilityScore}%`, background: gradeColor }} />
      </div>
      {supplier.isBackup && <span className="sup-backup-badge">BACKUP SUPPLIER</span>}
      {supplier.activeRisks > 0 && (
        <span className="sup-risk-badge">⚠ {supplier.activeRisks} active risks</span>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="empty-state">― {label} ―</div>;
}

// ─── CSS ──────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #060b14;
    --surface:   #0a1020;
    --surface2:  #0d1628;
    --border:    rgba(32,220,160,0.12);
    --green:     #20dca0;
    --green-dim: rgba(32,220,160,0.5);
    --red:       #ff3c5a;
    --amber:     #f5a623;
    --text:      rgba(220,235,255,0.9);
    --text-dim:  rgba(160,180,210,0.5);
    --font-mono: 'Share Tech Mono', 'JetBrains Mono', monospace;
    --font-hud:  'Orbitron', sans-serif;
  }

  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-mono); overflow-x: hidden; }

  /* ── Scanlines ── */
  .scanlines {
    position: fixed; inset: 0; pointer-events: none; z-index: 9000;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px, transparent 3px,
      rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px
    );
    animation: scanline-scroll 8s linear infinite;
  }
  @keyframes scanline-scroll {
    from { background-position: 0 0; }
    to   { background-position: 0 400px; }
  }

  /* ── CRT flicker ── */
  .crt-flicker { animation: crt-flick 0.08s steps(1) forwards !important; }
  @keyframes crt-flick {
    0%   { opacity: 1; }
    33%  { opacity: 0.82; }
    66%  { opacity: 0.95; }
    100% { opacity: 1; }
  }

  /* ── Pulse animations ── */
  .pulse-red  { animation: pulseRed  1.4s ease-in-out infinite; }
  .pulse-green { animation: pulseGreen 2s ease-in-out infinite; }
  @keyframes pulseRed   { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
  @keyframes pulseGreen { 0%,100% { opacity:1; } 50% { opacity:0.5;  } }

  /* ── Login ── */
  .login-screen, .boot-screen {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg);
  }
  .login-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 48px 40px; max-width: 420px; width: 90%;
    text-align: center;
    box-shadow: 0 0 80px rgba(32,220,160,0.07), 0 0 0 1px rgba(32,220,160,0.08);
  }
  .login-logo {
    font-family: var(--font-hud); font-size: 28px; font-weight: 900; color: #fff;
    letter-spacing: 0.08em;
  }
  .login-logo span { color: var(--green); }
  .login-sub { font-size: 10px; color: var(--text-dim); letter-spacing: 0.2em; margin-top: 4px; }
  .login-divider { height: 1px; background: var(--border); margin: 28px 0; }
  .login-desc { font-size: 13px; color: var(--text-dim); line-height: 1.7; margin-bottom: 28px; }
  .login-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, rgba(32,220,160,0.15), rgba(32,220,160,0.08));
    border: 1px solid var(--green-dim); border-radius: 10px;
    color: var(--green); font-family: var(--font-mono); font-size: 12px;
    letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s;
  }
  .login-btn:hover { background: rgba(32,220,160,0.2); box-shadow: 0 0 20px rgba(32,220,160,0.15); }
  .login-security { font-size: 9px; color: var(--text-dim); margin-top: 16px; letter-spacing: 0.12em; }

  /* ── Boot ── */
  .boot-text { font-family: var(--font-hud); font-size: 14px; color: var(--green); letter-spacing: 0.15em; margin-bottom: 16px; }
  .boot-bar { width: 260px; height: 2px; background: rgba(32,220,160,0.1); border-radius: 2px; }
  .boot-fill { height: 100%; width: 70%; background: var(--green); border-radius: 2px; animation: boot-load 1.5s ease forwards; }
  @keyframes boot-load { from { width: 0; } to { width: 100%; } }

  /* ── App layout ── */
  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── Navbar ── */
  .navbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; height: 52px;
    background: rgba(6,11,20,0.95); border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(12px);
  }
  .nav-brand {
    font-family: var(--font-hud); font-size: 16px; font-weight: 900; color: #fff;
    letter-spacing: 0.06em;
  }
  .nav-brand span { color: var(--green); }
  .nav-admin-badge {
    display: inline-block; margin-left: 10px; padding: 2px 8px;
    background: rgba(32,220,160,0.15); border: 1px solid var(--green-dim);
    border-radius: 4px; font-size: 8px; color: var(--green); letter-spacing: 0.12em;
    font-family: var(--font-mono);
  }
  .nav-status { display: flex; align-items: center; gap: 12px; }
  .nav-alert { font-size: 10px; letter-spacing: 0.1em; color: var(--red); }
  .nav-user { font-size: 10px; color: var(--text-dim); display: none; }
  @media (min-width: 640px) { .nav-user { display: block; } }
  .nav-signout {
    font-size: 9px; color: var(--text-dim); background: none;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;
    padding: 4px 10px; cursor: pointer; letter-spacing: 0.1em;
    font-family: var(--font-mono); transition: all 0.15s;
  }
  .nav-signout:hover { color: var(--red); border-color: rgba(255,60,90,0.3); }

  /* ── Mobile tabs ── */
  .mobile-tabs {
    display: flex; background: var(--surface); border-bottom: 1px solid var(--border);
    overflow-x: auto; -webkit-overflow-scrolling: touch;
  }
  .mobile-tab {
    flex: 1; min-width: 80px; padding: 10px 8px;
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em;
    color: var(--text-dim); background: none; border: none; cursor: pointer;
    border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap;
  }
  .mobile-tab.active { color: var(--green); border-bottom-color: var(--green); }
  @media (min-width: 1024px) { .mobile-tabs { display: none; } }

  /* ── Main layout ── */
  .main-layout {
    flex: 1; display: flex;
    gap: 0;
    overflow: hidden;
    min-height: calc(100vh - 52px - 40px);
  }

  /* ── Left column ── */
  .left-col {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 16px;
  }
  @media (min-width: 1024px) { .left-col { padding: 20px; } }
  .left-col::-webkit-scrollbar { width: 4px; }
  .left-col::-webkit-scrollbar-thumb { background: var(--border); }

  /* Mobile hiding */
  .hidden-mobile { display: none; }
  @media (min-width: 1024px) { .hidden-mobile { display: flex !important; flex-direction: column; gap: 16px; } }

  /* ── Section ── */
  .section {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
  }
  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-bottom: 1px solid var(--border);
  }
  .section-title {
    font-family: var(--font-hud); font-size: 10px; font-weight: 700;
    color: var(--green); letter-spacing: 0.15em;
  }
  .section-count {
    font-size: 10px; color: var(--text-dim);
    background: rgba(255,255,255,0.05); border-radius: 10px; padding: 1px 8px;
  }
  .admin-scope {
    font-size: 8px; color: var(--green); background: rgba(32,220,160,0.1);
    border: 1px solid var(--green-dim); border-radius: 4px; padding: 1px 6px;
    letter-spacing: 0.1em;
  }

  /* ── KPI grid ── */
  .kpi-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: var(--border);
  }
  @media (min-width: 480px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
  .kpi-card {
    background: var(--surface); padding: 16px 12px; text-align: center;
    transition: background 0.15s;
  }
  .kpi-card:hover { background: var(--surface2); }
  .kpi-value { font-family: var(--font-hud); font-size: 22px; font-weight: 700; }
  .kpi-label { font-size: 8px; color: var(--text-dim); letter-spacing: 0.12em; margin-top: 4px; }

  /* ── SKU list ── */
  .sku-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
  .sku-card {
    background: var(--surface); padding: 12px 16px;
    border-left: 3px solid transparent; transition: all 0.15s;
  }
  .sku-card.critical { border-left-color: var(--red); }
  .sku-card.warning  { border-left-color: var(--amber); }
  .sku-card.healthy  { border-left-color: var(--green); }
  .sku-card:hover { background: var(--surface2); }
  .sku-row1 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
  .sku-id { font-size: 11px; color: var(--green); font-weight: 700; }
  .sku-status { font-size: 9px; letter-spacing: 0.12em; }
  .sku-name { font-size: 12px; color: var(--text); margin-bottom: 8px; }
  .sku-bar-wrap { height: 2px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-bottom: 6px; overflow: hidden; }
  .sku-bar { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
  .sku-row2 { display: flex; gap: 12px; font-size: 10px; color: var(--text-dim); flex-wrap: wrap; }

  /* ── Risk list ── */
  .risk-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
  .risk-card { background: var(--surface); padding: 12px 16px; transition: background 0.15s; }
  .risk-card.critical { border-left: 3px solid var(--red); }
  .risk-card.high     { border-left: 3px solid var(--amber); }
  .risk-card.medium   { border-left: 3px solid rgba(255,255,255,0.2); }
  .risk-header { display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer; gap: 8px; }
  .risk-left { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .risk-type-tag { font-size: 9px; color: var(--text-dim); letter-spacing: 0.08em; }
  .risk-title-text { font-size: 12px; color: var(--text); line-height: 1.4; }
  .risk-score { font-family: var(--font-hud); font-size: 20px; font-weight: 700; flex-shrink: 0; }
  .risk-score-bar-wrap { height: 2px; background: rgba(255,255,255,0.06); margin: 8px 0; overflow: hidden; }
  .risk-score-bar { height: 100%; transition: width 0.5s ease; }
  .risk-expanded { padding: 8px 0; border-top: 1px solid var(--border); margin-top: 4px; }
  .risk-desc { font-size: 11px; color: var(--text-dim); line-height: 1.6; margin-bottom: 8px; }
  .risk-detail { font-size: 10px; color: var(--text-dim); margin-bottom: 6px; }
  .risk-detail strong { color: var(--text); }
  .risk-oracle-note {
    font-size: 10px; color: rgba(32,220,160,0.7); background: rgba(32,220,160,0.05);
    border: 1px solid rgba(32,220,160,0.1); border-radius: 6px;
    padding: 8px 10px; margin-bottom: 8px; line-height: 1.5;
  }
  .risk-oracle-label { font-weight: 700; color: var(--green); }
  .risk-pdf-link {
    display: inline-block; font-size: 10px; color: var(--green); text-decoration: none;
    border: 1px solid var(--green-dim); border-radius: 4px; padding: 4px 10px;
    margin-bottom: 8px; letter-spacing: 0.08em;
  }
  .risk-pdf-link:hover { background: rgba(32,220,160,0.1); }
  .risk-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .risk-btn-mitigate, .risk-btn-contract, .risk-btn-dismiss {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
    border-radius: 6px; padding: 5px 12px; cursor: pointer; border: none; transition: all 0.15s;
  }
  .risk-btn-mitigate {
    background: rgba(32,220,160,0.15); color: var(--green);
    border: 1px solid var(--green-dim);
  }
  .risk-btn-mitigate:hover { background: rgba(32,220,160,0.25); }
  .risk-btn-contract {
    background: rgba(245,166,35,0.1); color: var(--amber);
    border: 1px solid rgba(245,166,35,0.3);
  }
  .risk-btn-contract:hover { background: rgba(245,166,35,0.2); }
  .risk-btn-dismiss {
    background: rgba(255,255,255,0.04); color: var(--text-dim);
    border: 1px solid rgba(255,255,255,0.08); margin-left: auto;
  }
  .risk-btn-dismiss:hover { color: var(--red); border-color: rgba(255,60,90,0.3); }

  /* ── Supplier list ── */
  .supplier-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
  .supplier-card { background: var(--surface); padding: 12px 16px; transition: background 0.15s; }
  .supplier-card:hover { background: var(--surface2); }
  .sup-row1 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .sup-name { font-size: 12px; color: var(--text); }
  .sup-grade { font-family: var(--font-hud); font-size: 20px; font-weight: 700; }
  .sup-row2 { display: flex; gap: 12px; font-size: 10px; color: var(--text-dim); flex-wrap: wrap; margin-bottom: 8px; }
  .sup-bar-wrap { height: 2px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-bottom: 6px; overflow: hidden; }
  .sup-bar { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
  .sup-backup-badge {
    display: inline-block; font-size: 8px; color: var(--green);
    background: rgba(32,220,160,0.1); border: 1px solid var(--green-dim);
    border-radius: 4px; padding: 1px 8px; letter-spacing: 0.1em; margin-right: 6px;
  }
  .sup-risk-badge {
    display: inline-block; font-size: 8px; color: var(--amber);
    background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.3);
    border-radius: 4px; padding: 1px 8px;
  }

  /* ── Oracle sidebar ── */
  .oracle-sidebar {
    width: 100%; flex-shrink: 0;
    display: flex; flex-direction: column;
    background: #060b14;
    border-left: 1px solid rgba(32,220,160,0.15);
    position: relative; overflow: hidden;
    min-height: calc(100vh - 52px - 40px);
  }
  @media (min-width: 1024px) {
    .oracle-sidebar { width: 380px; }
    .oracle-sidebar.hidden-mobile { display: flex !important; }
  }
  @media (min-width: 1280px) { .oracle-sidebar { width: 440px; } }

  /* Inner CRT scanlines (denser, more visible) */
  .crt-lines {
    position: absolute; inset: 0; pointer-events: none; z-index: 1;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px, transparent 2px,
      rgba(0,255,160,0.03) 2px, rgba(0,255,160,0.03) 3px
    );
  }

  .oracle-header {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(32,220,160,0.12);
    background: rgba(8,16,32,0.8);
    position: relative; z-index: 2; flex-shrink: 0;
  }
  .oracle-title-row { display: flex; align-items: center; gap: 8px; }
  .oracle-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green); flex-shrink: 0;
    box-shadow: 0 0 6px var(--green);
  }
  .oracle-title {
    font-family: var(--font-hud); font-size: 13px; font-weight: 700;
    color: var(--green); letter-spacing: 0.2em;
  }
  .oracle-model {
    margin-left: auto; font-size: 8px; color: var(--text-dim); letter-spacing: 0.1em;
  }
  .oracle-meta { font-size: 9px; color: var(--text-dim); margin-top: 4px; letter-spacing: 0.08em; }

  .oracle-body {
    flex: 1; overflow-y: auto; padding: 16px; position: relative; z-index: 2;
    display: flex; flex-direction: column;
  }
  .oracle-body::-webkit-scrollbar { width: 3px; }
  .oracle-body::-webkit-scrollbar-thumb { background: rgba(32,220,160,0.2); }

  .oracle-idle {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center; gap: 12px; padding: 40px 20px;
  }
  .oracle-idle-icon {
    font-size: 48px; color: rgba(32,220,160,0.15);
    text-shadow: 0 0 40px rgba(32,220,160,0.3);
    animation: pulseGreen 3s ease-in-out infinite;
  }
  .oracle-idle-text { font-size: 12px; color: var(--text-dim); line-height: 1.8; letter-spacing: 0.06em; }
  .oracle-idle-text span { color: var(--green); }

  .oracle-boot {
    padding: 8px 0;
    font-size: 12px; color: var(--green);
    animation: pulseGreen 1s ease-in-out infinite;
  }
  .oracle-text {
    font-size: 11.5px; line-height: 1.75; color: rgba(180,220,200,0.9);
    white-space: pre-wrap; word-break: break-word;
    text-shadow: 0 0 8px rgba(32,220,160,0.1);
  }
  .oracle-cursor {
    display: inline-block; animation: blink 0.7s step-end infinite;
    color: var(--green);
  }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }

  .oracle-footer {
    padding: 14px 16px; border-top: 1px solid rgba(32,220,160,0.12);
    background: rgba(8,16,32,0.8); position: relative; z-index: 2; flex-shrink: 0;
  }
  .oracle-run-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, rgba(32,220,160,0.18), rgba(32,220,160,0.06));
    border: 1px solid var(--green-dim); border-radius: 10px;
    color: var(--green); font-family: var(--font-mono); font-size: 12px;
    letter-spacing: 0.12em; cursor: pointer; transition: all 0.2s; margin-bottom: 8px;
    box-shadow: 0 0 20px rgba(32,220,160,0.08), inset 0 1px 0 rgba(32,220,160,0.1);
  }
  .oracle-run-btn:hover:not(:disabled) {
    background: rgba(32,220,160,0.22);
    box-shadow: 0 0 30px rgba(32,220,160,0.18), inset 0 1px 0 rgba(32,220,160,0.15);
    transform: translateY(-1px);
  }
  .oracle-run-btn.running { opacity: 0.6; cursor: not-allowed; }
  .oracle-run-btn:disabled { cursor: not-allowed; }
  .oracle-disclaimer { font-size: 8.5px; color: var(--text-dim); text-align: center; letter-spacing: 0.06em; }

  /* ── Empty state ── */
  .empty-state { padding: 32px; text-align: center; font-size: 11px; color: var(--text-dim); letter-spacing: 0.1em; }

  /* ── Desktop show overrides ── */
  @media (min-width: 1024px) {
    .section { display: block !important; }
  }
`;
 
