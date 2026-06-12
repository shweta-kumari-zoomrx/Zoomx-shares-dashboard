// sharesBuilder.js — pure lookup into the pre-aggregated shares_agg.json.
// No microdata, no per-respondent computation in the browser. The aggregates were
// computed in build_shares_data.py with the deck's exact methodology (validated to 1e-16).

// Look up one indication / stratum / timeframe across the 3 LoTs for a selection.
// weightMode: 'weighted' | 'unweighted'   capMethod: 'none' | 'winsor95' | 'median3x'
// Returns { series:[...], lots:['1L','2L','3L'], data:{series:[v1L,v2L,v3L]}, n:{1L,2L,3L} }  (percent)
export function buildShares(agg, selection, ind, stratum, timeframe, weightMode, capMethod) {
  const cell = agg.data[selection][timeframe][ind][stratum];
  const series = agg.meta.series[ind];
  const src = weightMode === 'weighted' ? cell.weighted[capMethod] : cell.unweighted;
  const data = {};
  series.forEach(s => { data[s] = src[s] || [0, 0, 0]; });
  return { series, lots: agg.meta.lots, data, n: cell.n };
}

export function topSeries(sharesObj, lotIdx, k = 3) {
  return sharesObj.series
    .map(s => ({ series: s, val: sharesObj.data[s][lotIdx] }))
    .filter(x => x.val > 0.05)
    .sort((a, b) => b.val - a.val)
    .slice(0, k);
}

export function weightedGap(agg, selection, ind, stratum, timeframe, capMethod) {
  const w = buildShares(agg, selection, ind, stratum, timeframe, 'weighted', capMethod);
  const u = buildShares(agg, selection, ind, stratum, timeframe, 'unweighted', capMethod);
  let maxGap = 0, where = null;
  w.series.forEach(s => w.lots.forEach((lot, i) => {
    const g = Math.abs(w.data[s][i] - u.data[s][i]);
    if (g > maxGap) { maxGap = g; where = { series: s, lot }; }
  }));
  return { maxGap, where };
}
