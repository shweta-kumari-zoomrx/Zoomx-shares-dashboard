import React, { useMemo, useRef } from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist-min';

// Brand palette — consistent with the ENHERTU Gyn DE deck (slides 11–18)
const REGIMEN_COLORS = {
  'product x': '#EE7623',
  'pembrolizumab + lenvatinib': '#34A355',
  'pembrolizumab + chemotherapy': '#AED578',
  'pembrolizumab': '#71BF88',
  'pembrolizumab +/- bevacizumab + chemotherapy': '#0070C0',
  'durvalumab + chemotherapy +/- olaparib': '#C55A11',
  'cemiplimab': '#C55A11',
  'dostarlimab + chemotherapy': '#CDE059',
  'dostarlimab': '#A9D18E',
  'tisotumab vedotin': '#0070C0',
  'rucaparib': '#FFC000',
  'niraparib': '#00B050',
  'mirvetuximab soravtansine': '#7FB7DF',
  'bevacizumab + chemotherapy': '#548235',
  'olaparib +/- bevacizumab': '#002060',
  'endocrine therapy': '#BF9000',
  'clinical trial': '#7F7F7F',
};
const OTHER_COLOR = '#D9D9D9';

function colorFor(label) {
  const key = String(label).replace(/\s+/g, ' ').trim().toLowerCase();
  if (REGIMEN_COLORS[key]) return REGIMEN_COLORS[key];
  if (key.startsWith('chemotherapy')) return '#FFBFFF';
  if (key === 'other') return OTHER_COLOR;
  return '#B0B0B0';
}

export default function SharesChart({ shares, title, subtitle, accentColor = '#7c6ee6', height = 460 }) {
  const ref = useRef(null);

  const { traces, layout } = useMemo(() => {
    const xLabels = shares.lots.map((lot, i) => `${lot}  (n=${shares.n[lot] ?? 0})`);
    const traces = shares.series
      .filter(s => shares.data[s].some(v => v > 0.05)) // hide all-zero series
      .map(s => ({
        type: 'bar',
        name: s,
        x: xLabels,
        y: shares.data[s],
        marker: { color: colorFor(s), line: { width: 0.5, color: '#fff' } },
        text: shares.data[s].map(v => (v >= 4 ? `${v.toFixed(0)}%` : '')),
        textposition: 'inside',
        insidetextanchor: 'middle',
        textfont: { size: 11, color: '#fff' },
        hovertemplate: `<b>${s}</b><br>%{x}<br>%{y:.1f}%<extra></extra>`,
      }));
    const layout = {
      barmode: 'stack',
      barnorm: 'percent',          // normalise each LoT to 100%
      height,
      margin: { l: 40, r: 16, t: 16, b: 40 },
      yaxis: { range: [0, 100], ticksuffix: '%', gridcolor: '#eef0f4', zeroline: false },
      xaxis: { tickfont: { size: 12, color: '#333' } },
      legend: { orientation: 'h', y: -0.15, font: { size: 10 } },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      bargap: 0.45,
    };
    return { traces, layout };
  }, [shares, height]);

  const copyChart = async () => {
    try {
      const gd = ref.current?.el;
      if (!gd) return;
      const dataUrl = await Plotly.toImage(gd, { format: 'png', scale: 2, width: 900, height });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
      alert('Chart copied — paste into your slide.');
    } catch (e) {
      alert('Copy failed: ' + e.message);
    }
  };

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{subtitle}</div>}
        </div>
        <button onClick={copyChart} style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          border: `1.5px solid ${accentColor}`, background: accentColor + '14', color: accentColor,
        }}>📋 Copy Chart</button>
      </div>
      <Plot ref={ref} data={traces} layout={layout} useResizeHandler
        style={{ width: '100%' }} config={{ displayModeBar: false, responsive: true }} />
    </div>
  );
}
