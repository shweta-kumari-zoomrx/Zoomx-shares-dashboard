// Loads pre-aggregated shares (NO per-respondent microdata). Produced by
// build_shares_data.py → public/shares_agg.json. Contains only computed
// weighted/unweighted shares per cell for a fixed menu of segment selections.
export async function loadData() {
  const response = await fetch(`${process.env.PUBLIC_URL}/shares_agg.json`);
  if (!response.ok) throw new Error(`Failed to load shares_agg.json (${response.status})`);
  const agg = await response.json();
  return { agg };
}
