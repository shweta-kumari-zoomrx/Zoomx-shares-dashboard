# Shares Dashboard — Gyn DE ATU 2026

React + Plotly dashboard of **current (Q3.40)** and **future (Q6.10)** treatment shares,
built on the **exact deck methodology** (`../generate_slides.py`, slides 11–18).
Sibling of the Sankey dashboard (`../Sankey`).

## Dependencies — SELF-CONTAINED
The dashboard depends on **only the RD Excel** (`../ENH Gyn RD 2026.xlsx`) for data.
Survey-definition metadata (drug↔A-code maps, series, region map) lives in the local
`shares_maps.py` — extracted ONCE from the deck on 2026-06-12, then the deck import was
removed. **No runtime dependency on `generate_slides.py` or the PPTX.** Point at a moved
RD via the `SHARES_RD` env var. (`validate_shares.py` still imports the deck, but it's an
optional one-time correctness check, NOT part of build/deploy.)

## Architecture
- `shares_maps.py` — local, self-contained `MAPS_IHC3/IHC2/IHCU`, `ALL_SERIES`,
  `KNOWN_MISSING`, `REGION_MAP`, `map_region`. Regenerate only if survey options change.
- `build_shares_data.py` — reads the RD + `shares_maps.py`, derives current-share columns
  from future ones (`Q6_10Z_{EC}_..._OTH3_1` → `Q3_40Z_{E}_..._other`), reproduces the OL
  union inline, and writes:
  - `public/Shares_RD.xlsx` — one row per respondent (PII-stripped): RespID, OL flag,
    Practice Setting, Specialty, Region, + every mapped numeric column. `---` preserved.
  - `src/sharesConfig.json` — series, knownMissing, current/future column maps, weights.
- `src/utils/sharesBuilder.js` — JS clone of `stratum_atu` / `ihc_patient_volumes` /
  `overall_shares`, + weight capping (winsor95 / median3x). Computes live per filter.
- `validate_shares.py` — proves the JS clone == deck functions (last run: max diff 1e-16).

## Key facts
- Base: GLOBAL_OL dropped (61) → OL union excluded → **n=55 active** (= deck). OL flag in xlsx.
- **Product X (ENHERTU) has no current (Q3.40) column** at 2L/3L — not yet marketed; current
  share is 0 by construction (18 "missing column" warnings in build are these, expected).
- Weights = `Q3_25Z_{E/O/C}_{LoT}_{stratum}`. Overall = IHC-patient-volume blend of 3 strata.
- 3 weighted versions toggleable: **Deck (no cap)**, **Winsorize @95th pct**, **Cap @3× median**
  (capping applied within each stratum/LoT cell, then renormalised).
- Views: Shares Chart (percent-stacked 1L/2L/3L, Copy-Chart), Summary & Insights (auto), Methodology.

## Refresh / deploy
1. Update `../ENH Gyn RD 2026.xlsx`.
2. `npm run deploy` → `builddata` (python) → build → gh-pages.  (`npm run builddata` for data only.)
3. **Always re-run `python validate_shares.py` after a data refresh** — confirms math still == deck.

## NOT yet done
- No GitHub repo / Pages deploy yet (recommended: new repo `Zoomx-shares-dashboard`, separate
  from Sankey). Deploy is outward-facing — confirm with user before publishing.
