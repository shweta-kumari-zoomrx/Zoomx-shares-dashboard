# Gyn DE ATU 2026 – Treatment Shares Dashboard

Interactive dashboard of **current (Q3.40)** and **future (Q6.10)** treatment shares
for the Gyn DE ATU 2026 study (Endometrial, Ovarian, Cervical), built on the **same
methodology as the deck** (`generate_slides.py`, slides 11–18).

## Views
- **Shares Chart** — percent-stacked 1L/2L/3L shares by regimen, per indication & IHC stratum (Overall / IHC3+ / IHC2+ / IHC Unknown), current or future, weighted or unweighted. Copy-to-clipboard for slides.
- **Summary & Insights** — auto-generated leaders per line, Product X (ENHERTU) future uptake, and the largest weighted-vs-unweighted gap for the current selection.
- **Methodology** — full description of base, weighting, and the capped weight variants.

## Weighting
- **Weighted (deck)** — `Σ(Q3_25Z weight × share) / Σ weight`; Overall blended by IHC patient volume. Matches the slides exactly (validated to 1e-16).
- **Two stabilised versions** (toggleable): **Winsorize @95th pct** and **Cap @3× median** within each stratum/LoT cell — to test sensitivity to a few high-weight respondents.
- **Unweighted** — simple mean of respondent shares.

## Base
GLOBAL_OL dropped (→61), patient-volume outlier union excluded → **n=55 active**, identical to the deck. Segment filters (Practice Setting / Specialty / Region) further subset this base.

## Data refresh
1. Update `../ENH Gyn RD 2026.xlsx` (the shared raw file).
2. Run `npm run deploy` — this:
   - `npm run builddata` → `python build_shares_data.py` rebuilds `public/Shares_RD.xlsx` (PII-stripped per-respondent) + `src/sharesConfig.json` (column maps exported from the deck script)
   - builds the production bundle
   - publishes to GitHub Pages (`gh-pages` branch)

`build_shares_data.py` imports the deck's `MAPS_IHC3/IHC2/IHCU` and `ALL_SERIES` directly, so the dashboard can never drift from the slides. `validate_shares.py` re-checks the JS clone against the deck functions.

## Development
- `npm start` — dev server at http://localhost:3000
- `npm run build` — production bundle
- `npm run builddata` — rebuild data only
- `python validate_shares.py` — confirm dashboard math == deck math
