# Gyn DE ATU 2026 – Treatment Shares Dashboard

Interactive dashboard of **current (Q3.40)** and **future (Q6.10)** treatment shares
for the Gyn DE ATU 2026 study (Endometrial, Ovarian, Cervical), built on the **same
methodology as the deck** (`generate_slides.py`, slides 11–18).

> **Privacy:** the site publishes **aggregate shares only** (`public/shares_agg.json`) — no
> per-respondent rows. De-identified microdata stays local in `/data` (git-ignored).
> **Live:** https://shweta-kumari-zoomrx.github.io/Zoomx-shares-dashboard/

## Views
- **Shares Chart** — percent-stacked 1L/2L/3L shares by regimen, per indication & IHC stratum (Overall / IHC3+ / IHC2+ / IHC Unknown), current or future, weighted or unweighted. Copy-to-clipboard for slides.
- **Summary & Insights** — auto-generated leaders per line, Product X (ENHERTU) future uptake, and the largest weighted-vs-unweighted gap for the current selection.
- **Methodology** — full description of base, weighting, and the capped weight variants.

Segment slicing is **one segment at a time** (Practice Setting / Specialty / Region), each pre-aggregated. Cross-segment combinations are intentionally not available (they'd require shipping microdata).

## Weighting
- **Weighted (deck)** — `Σ(Q3_25Z weight × share) / Σ weight`; Overall blended by IHC patient volume. Matches the slides exactly (validated to 1e-16).
- **Two stabilised versions** (toggleable): **Winsorize @95th pct** and **Cap @3× median** within each stratum/LoT cell — to test sensitivity to a few high-weight respondents.
- **Unweighted** — simple mean of respondent shares.

## Base
GLOBAL_OL dropped (→61), patient-volume outlier union excluded → **n=55 active**, identical to the deck. Segment filters (Practice Setting / Specialty / Region) further subset this base.

## Data refresh
1. Update `../ENH Gyn RD 2026.xlsx` (the shared raw file).
2. Run `npm run deploy` — this:
   - `npm run builddata` → `python build_shares_data.py` recomputes `public/shares_agg.json` (aggregates only) and refreshes the local `data/Shares_RD.xlsx` (git-ignored)
   - builds the production bundle
   - publishes to GitHub Pages (`gh-pages` branch)

`build_shares_data.py` is self-contained — it reads the RD plus local survey metadata in `shares_maps.py` (no deck dependency). `python validate_shares.py` re-checks the math against the deck's `generate_slides.py` (last run: 1e-16).

## Development
- `npm start` — dev server at http://localhost:3000
- `npm run build` — production bundle
- `npm run builddata` — rebuild data only
- `python validate_shares.py` — confirm dashboard math == deck math
