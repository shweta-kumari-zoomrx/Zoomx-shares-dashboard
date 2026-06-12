import React from 'react';

const Block = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 10, padding: '16px 20px' }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 13, color: '#444', lineHeight: 1.75 }}>{children}</div>
  </div>
);
const Code = ({ children }) => (
  <code style={{ background: '#f3f2fb', color: '#5b48d9', padding: '1px 6px', borderRadius: 4, fontSize: 12.5 }}>{children}</code>
);

export default function MethodologyTab({ meta }) {
  const nTotal = meta?.nTotal ?? 61;
  const nActive = meta?.nActive ?? 55;
  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 880 }}>
      <Block title="Data & base">
        Survey <Code>ENH Gyn RD 2026.xlsx</Code>. Platform-flagged <Code>GLOBAL_OL</Code> respondents are
        dropped (→ {nTotal}). A patient-volume outlier union (from <Code>S0_80Z</Code>, midpoint
        IQR / Mean+2SD fence) is then flagged and <b>excluded</b> from all share math, leaving{' '}
        <b>n = {nActive}</b> active respondents — identical to the deck. Segment selections further
        subset this base; small-n cells are noted on each chart.
      </Block>

      <Block title="Current vs future shares">
        <b>Current (Q3.40):</b> columns <Code>Q3_40Z_&#123;E/O/C&#125;_&#123;stratum&#125;_&#123;LoT&#125;_&#123;drug&#125;</Code> —
        each respondent's reported present-day allocation of patients across regimens.<br />
        <b>Future (Q6.10):</b> columns <Code>Q6_10Z_&#123;EC/OC/CC&#125;_…</Code> — the projected allocation
        used on deck slides 11–18. Product&nbsp;X (ENHERTU) appears only in the future set (not yet marketed),
        so its current share is 0 by construction.
      </Block>

      <Block title="Weighted shares (deck method)">
        Per respondent <i>i</i>, share<sub>i</sub> = drug column ÷ 100, weighted by{' '}
        <Code>weight_i = Q3_25Z_&#123;E/O/C&#125;_&#123;LoT&#125;_&#123;stratum&#125;</Code> — that respondent's
        patient count in the relevant IHC stratum / line. Respondents whose question wasn't shown
        (<Code>---</Code>) are skipped for that line.
        <div style={{ background: '#faf9ff', borderLeft: `3px solid #7c6ee6`, padding: '8px 12px', margin: '8px 0', fontSize: 12.5 }}>
          weighted_share = Σ(weight<sub>i</sub> × share<sub>i</sub>) / Σ(weight<sub>i</sub>)
        </div>
        <b>Overall</b> blends IHC3+/IHC2+/IHC-Unknown by each stratum's summed patient volume
        (<Code>ihc_patient_volumes</Code>) — the actual IHC split of patients, not a simple average.
      </Block>

      <Block title="Unweighted shares">
        Simple mean of each respondent's share across those who answered — every physician counts equally,
        regardless of patient load. <b>Overall</b> unweighted = plain average of the three strata.
      </Block>

      <Block title="Why weighted ≠ unweighted (and the capped versions)">
        The <Code>Q3_25Z</Code> weights are sparse and concentrated: a handful of high-volume respondents (or
        thin IHCU / 3L cells with total weight 1–3) can dominate a weighted share, pulling it far from the
        unweighted average. The two capped versions stabilise this:
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          <li><b>Winsorize @95th pct</b> — cap each weight at the 95th percentile within its stratum/LoT cell, then renormalise. Tames extreme weights while preserving rank.</li>
          <li><b>Cap @3× median</b> — cap at 3× the cell median. Simpler, more aggressive on outliers.</li>
        </ul>
        Toggle these in the left panel to test how sensitive a number is to a few respondents. The
        <b> deck</b> uses no capping.
      </Block>

      <Block title="What this site publishes (no microdata)">
        Only <b>pre-aggregated shares</b> ship to the web — the computed weighted/unweighted numbers per
        cell (<Code>public/shares_agg.json</Code>). <b>No per-respondent rows</b> leave your machine; the raw
        RD and the de-identified microdata stay local and git-ignored. Segment selection is therefore
        one segment at a time (each pre-computed) — no arbitrary cross-segment combinations.
      </Block>

      <Block title="Reproducibility">
        All aggregates are computed in <Code>build_shares_data.py</Code> from the RD, using survey metadata
        in the local <Code>shares_maps.py</Code> (no deck dependency). The unfiltered weighted-deck numbers
        reconcile to the slides — <Code>validate_shares.py</Code> checks this to 1e-16. Refresh: update the
        raw RD, run <Code>npm run deploy</Code> (rebuilds aggregates → bundle → GitHub Pages).
      </Block>
    </div>
  );
}
