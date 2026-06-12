# Shares Dashboard — Gyn DE ATU 2026

React + Plotly dashboard of **current (Q3.40)** and **future (Q6.10)** treatment shares,
built on the **exact deck methodology** (`../generate_slides.py`, slides 11–18).
Sibling of the Sankey dashboard (`../Sankey`).

## Live / privacy
- **Live:** https://shweta-kumari-zoomrx.github.io/Zoomx-shares-dashboard/ (repo `Zoomx-shares-dashboard`, branch `gh-pages`).
- **AGGREGATE-ONLY — no microdata is ever published.** The site ships only
  `public/shares_agg.json` (computed weighted/unweighted shares per cell). Per-respondent
  rows stay local in `/data` (git-ignored). `public/Shares_RD.xlsx` is git-ignored and must
  never be committed. (An early commit accidentally pushed it; history was amended +
  force-pushed on 2026-06-12 to purge it. Don't reintroduce it.)
- Deploy is gated by the safety classifier for microdata — keep it aggregate-only.

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
  union inline, computes shares (incl. winsor95 / median3x weight caps) for a menu of
  single-segment selections, and writes:
  - `public/shares_agg.json` — **aggregate-only** (no microdata): computed weighted/
    unweighted shares per selection × timeframe × ind × stratum × LoT × series + n. ~430 KB.
  - `data/Shares_RD.xlsx` — de-identified microdata, **git-ignored, local only** (for validation).
- `src/utils/sharesBuilder.js` — pure **lookup** into `shares_agg.json` (no browser-side
  computation, no microdata). App = segment dropdown (one segment at a time; no cross combos).
- `validate_shares.py` — proves the Python clone == deck functions (last run: max diff 1e-16).
  Optional one-time check; imports the deck only here, not in build/deploy.

## Key facts
- Base: GLOBAL_OL dropped (61) → OL union excluded → **n=55 active** (= deck).
- **Product X (ENHERTU) has no current (Q3.40) column** at 2L/3L — not yet marketed; current
  share is 0 by construction (18 "missing column" warnings in build are these, expected).
- Weights = `Q3_25Z_{E/O/C}_{LoT}_{stratum}`. Overall = IHC-patient-volume blend of 3 strata.
- 3 weighted versions toggleable: **Deck (no cap)**, **Winsorize @95th pct**, **Cap @3× median**
  (capping applied within each stratum/LoT cell, then renormalised).
- Views: Shares Chart (percent-stacked 1L/2L/3L, Copy-Chart), Summary & Insights (auto), Methodology.

## Refresh / deploy
1. Update `../ENH Gyn RD 2026.xlsx`.
2. `npm run deploy` → `builddata` (python, rebuilds aggregates) → build → gh-pages.
   (`npm run builddata` for data only.) Publishes aggregates only — safe.
3. **Always re-run `python validate_shares.py` after a data refresh** — confirms math still == deck.

## Adding a new segment to filter
Edit the `selections` list in `build_shares_data.py` (currently All + each value of
Practice Setting / Specialty / Region). Only single-segment cells are precomputed — true
cross-segment combinations would need microdata (deliberately not shipped).
