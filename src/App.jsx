import React, { useState, useEffect } from 'react';
import { loadData } from './utils/dataLoader';
import { buildShares } from './utils/sharesBuilder';
import SharesChart from './components/SharesChart';
import SummaryTab from './components/SummaryTab';
import MethodologyTab from './components/MethodologyTab';
import './App.css';

function RadioGroup({ label, options, value, onChange, accent, small }) {
  return (
    <div className="section">
      <div className="section-label">{label}</div>
      {Object.entries(options).map(([k, v]) => (
        <label key={k} className="radio-row" style={small ? { fontSize: 12 } : {}}>
          <input type="radio" checked={value === k} onChange={() => onChange(k)} style={{ accentColor: accent }} />
          <span>{v}</span>
        </label>
      ))}
    </div>
  );
}

export default function App() {
  const [agg, setAgg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [indication, setIndication] = useState('EC');
  const [timeframe, setTimeframe] = useState('future');
  const [stratum, setStratum] = useState('Overall');
  const [weightMode, setWeightMode] = useState('weighted');
  const [capMethod, setCapMethod] = useState('none');
  const [selection, setSelection] = useState('All');
  const [activeTab, setActiveTab] = useState('chart');

  const accentColor = '#7c6ee6';
  const bgColor = '#f5f6fa';

  useEffect(() => {
    loadData()
      .then(({ agg }) => { setAgg(agg); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div className="center-screen">Loading data…</div>;
  if (error) return <div className="center-screen" style={{ color: '#ef4444' }}>Error: {error}</div>;

  const M = agg.meta;
  const shares = buildShares(agg, selection, indication, stratum, timeframe, weightMode, capMethod);
  const selMeta = M.selections.find(s => s.key === selection) || { nActive: M.nActive, label: 'All respondents' };

  const chartTitle = `${M.indications[indication]} — ${M.strataLabels[stratum]}`;
  const chartSub = `${M.timeframes[timeframe]} · ${weightMode === 'weighted'
    ? `weighted (${M.capMethods[capMethod]})` : 'unweighted'} · ${selMeta.label} · n=${selMeta.nActive}`;

  return (
    <div className="app-layout" style={{ background: bgColor }}>
      {/* ── Sidebar ── */}
      <div className="controls-sidebar">
        <div className="brand">
          <span className="brand-dot" style={{ background: accentColor }} />
          <span className="brand-name">ZoomRx</span>
        </div>
        <div className="brand-sub">Gyn DE ATU 2026 · Shares</div>

        <div className="divider" />

        <div className="section">
          <div className="section-label">📊 View</div>
          {[['chart', 'Shares Chart'], ['summary', 'Summary & Insights'], ['methodology', 'Methodology']].map(([t, lbl]) => (
            <button key={t} className={`pill-btn ${activeTab === t ? 'active' : ''}`}
              style={activeTab === t ? { background: accentColor + '22', borderColor: accentColor, color: accentColor } : {}}
              onClick={() => setActiveTab(t)}>{lbl}</button>
          ))}
        </div>

        <div className="divider" />

        <div className="section">
          <div className="section-label">🔬 Indication</div>
          {Object.entries(M.indications).map(([k, v]) => (
            <label key={k} className="radio-row">
              <input type="radio" checked={indication === k} onChange={() => setIndication(k)} style={{ accentColor }} />
              <span>{v}</span>
              <span className="chip" style={{ background: accentColor + '22', color: accentColor }}>{k}</span>
            </label>
          ))}
        </div>

        <div className="divider" />
        <RadioGroup label="🗓️ Timeframe" options={M.timeframes} value={timeframe} onChange={setTimeframe} accent={accentColor} />

        <div className="divider" />
        <div className="section">
          <div className="section-label">🧬 IHC Stratum</div>
          {M.strata.map(k => (
            <label key={k} className="radio-row">
              <input type="radio" checked={stratum === k} onChange={() => setStratum(k)} style={{ accentColor }} />
              <span>{M.strataLabels[k]}</span>
            </label>
          ))}
        </div>

        <div className="divider" />
        <RadioGroup label="⚖️ Weighting" options={{ weighted: 'Weighted', unweighted: 'Unweighted' }}
          value={weightMode} onChange={setWeightMode} accent={accentColor} />

        {weightMode === 'weighted' && (
          <div className="section" style={{ marginTop: -4 }}>
            <div className="section-label" style={{ fontSize: 11 }}>Weight version</div>
            {Object.entries(M.capMethods).map(([k, v]) => (
              <label key={k} className="radio-row" style={{ fontSize: 12 }}>
                <input type="radio" checked={capMethod === k} onChange={() => setCapMethod(k)} style={{ accentColor }} />
                <span>{v}</span>
              </label>
            ))}
            <div style={{ fontSize: 10.5, color: '#aaa', marginTop: 4, lineHeight: 1.5 }}>
              "Deck" = no cap (matches slides). Capped versions stabilise a few high weights.
            </div>
          </div>
        )}

        <div className="divider" />
        <div className="section">
          <div className="section-label">🗂️ Segment</div>
          <select value={selection} onChange={e => setSelection(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', fontSize: 12.5, border: '1px solid #ddd', borderRadius: 6, color: '#333', background: '#fff' }}>
            {M.selections.map(s => (
              <option key={s.key} value={s.key}>{s.label} (n={s.nActive})</option>
            ))}
          </select>
          <div style={{ fontSize: 10.5, color: '#aaa', marginTop: 6, lineHeight: 1.5 }}>
            Aggregated cells only — one segment at a time (no cross-segment combinations).
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="main-content">
        <div className="main-header" style={{ borderLeft: `4px solid ${accentColor}` }}>
          <div>
            <div className="main-title">{chartTitle}</div>
            <div className="main-sub">{chartSub}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.keys(M.indications).map(k => (
              <button key={k} onClick={() => setIndication(k)} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${indication === k ? accentColor : '#ddd'}`,
                background: indication === k ? accentColor : '#fff',
                color: indication === k ? '#fff' : '#555', cursor: 'pointer',
              }}>{k}</button>
            ))}
          </div>
        </div>

        <div className="content-card">
          {activeTab === 'chart' && (
            <SharesChart shares={shares} title={chartTitle} subtitle={chartSub} accentColor={accentColor} />
          )}
          {activeTab === 'summary' && (
            <SummaryTab agg={agg} selection={selection} indication={indication} stratum={stratum}
              timeframe={timeframe} weightMode={weightMode} capMethod={capMethod} accentColor={accentColor} />
          )}
          {activeTab === 'methodology' && <MethodologyTab meta={M} />}
        </div>
      </div>
    </div>
  );
}
