import React, { useMemo } from 'react';
import { buildShares, topSeries, weightedGap } from '../utils/sharesBuilder';

function Stat({ label, value, sub, accent }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 10, padding: '14px 16px', flex: '1 1 160px' }}>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || '#1a1a2e', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function SummaryTab({ agg, selection, indication, stratum, timeframe, weightMode, capMethod, accentColor }) {
  const M = agg.meta;
  const insights = useMemo(() => {
    const w = buildShares(agg, selection, indication, stratum, timeframe, weightMode, capMethod);
    const gap = weightedGap(agg, selection, indication, stratum, timeframe, capMethod);
    const lines = [];
    w.lots.forEach((lot, i) => {
      const top = topSeries(w, i, 3);
      if (top.length) lines.push({ lot, n: w.n[lot], text: top.map(t => `${t.series} (${t.val.toFixed(0)}%)`).join(' · '), lead: top[0] });
    });
    const px = {};
    w.lots.forEach((lot, i) => { px[lot] = w.data['Product X'] ? w.data['Product X'][i] : 0; });
    return { w, gap, lines, px };
  }, [agg, selection, indication, stratum, timeframe, weightMode, capMethod]);

  const { gap, lines, px } = insights;
  const selLabel = (M.selections.find(s => s.key === selection) || {}).label || 'All respondents';

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
          {M.indications[indication]} — {M.strataLabels[stratum]} · {M.timeframes[timeframe]} · {weightMode}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
          {selLabel} · auto-generated from the pre-aggregated cells (deck methodology).
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {lines.map(l => (
          <Stat key={l.lot} label={`${l.lot} leader (n=${l.n})`} value={`${l.lead.val.toFixed(0)}%`} sub={l.lead.series} accent={accentColor} />
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 10, padding: '16px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 10 }}>📌 Key takeaways</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#333', lineHeight: 1.7 }}>
          {lines.map(l => <li key={l.lot}><b>{l.lot}:</b> {l.text}</li>)}
          {timeframe === 'future' && (px['1L'] + px['2L'] + px['3L'] > 0.1) && (
            <li><b>Product X (ENHERTU)</b> projected future share — 1L {px['1L'].toFixed(0)}% · 2L {px['2L'].toFixed(0)}% · 3L {px['3L'].toFixed(0)}%.</li>
          )}
          {weightMode === 'weighted' && gap.where && (
            <li>
              Largest weighted-vs-unweighted gap: <b>{gap.maxGap.toFixed(0)} pts</b> on {gap.where.series} at {gap.where.lot}
              {capMethod === 'none'
                ? ' — try a capped weight version (left panel) to test sensitivity to a few high-weight respondents.'
                : ` (with ${capMethod} capping applied).`}
            </li>
          )}
        </ul>
      </div>

      <div style={{ fontSize: 11, color: '#aaa' }}>
        Shares use OL-removed active respondents (deck: n={M.nActive} unfiltered). Segment cells have smaller bases —
        interpret small-n with care.
      </div>
    </div>
  );
}
