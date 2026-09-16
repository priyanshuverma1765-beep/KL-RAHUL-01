# KLR01 — The Rahul Archive

A cinematic, independent fan-made tribute exploring KL Rahul's career through editorial storytelling, responsive motion, interactive archive interfaces, and a foundation for verified cricket analytics.

## Current experience

- Layered, motion-led hero derived from the supplied structural reference
- Active floating navigation and touch-first mobile menu
- Compact 19-stage career Journey with measured hand-sketched connectors, separate ODI/T20I breakthrough chapters, and a wedding chapter
- Cricsheet-derived Stats Lab with four format views and annual trends
- Complete 28-innings Century Vault, sorted from highest to lowest score
- Supported format record wall, Form Index, and Impact Score exports
- Filterable, progressively loaded 158-image merged gallery with an accessible lightbox
- Trained runs regression and calibrated 30+/50+/100+ prediction API
- Retrieval-backed ASK KLR assistant for formats, opponents, centuries, batting positions, IPL seasons and role evolution
- Reduced-motion support and responsive layouts

## Stack

Next.js 16, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, and Next Image. Components follow the shadcn-compatible `components/ui` convention.

## Run locally

```bash
pnpm install
pnpm dev:api
pnpm dev
```

Open `http://localhost:3000`.

## Architecture

- `app/` — App Router entry and global design system
- `components/ui/` — reusable dialog and hero primitives
- `components/sections/` — Journey, Stats, Century Vault, Analytics, Gallery, and ASK KLR
- `components/archive-experience.tsx` — navigation, page composition, finale, and footer
- `data/archive.ts` — verified display data derived from the project snapshot
- `data/media.generated.json` — generated media routing from the supplied asset manifest
- `data/merged-image-manifest.json` / `.csv` — 119 recovered originals plus 41 supplemental assets, minus two same-frame duplicates
- `public/images/rahul/archive/` — organized Journey, Century Vault, Gallery, and background assets

## Data and ML

Run the reproducible pipeline and API:

```bash
python backend/ml/pipeline.py
pnpm dev:api
```

The pipeline streams the original ZIP archives without changing them, exports cleaned CSVs to `backend/data/processed`, persists fitted models to `backend/artifacts`, and produces the verified frontend snapshot at `public/data/klr-archive.json`. See `DATA_SOURCES.md` and `MODEL_CARD.md`.

The web app serves grounded ASK KLR responses at `/chat`. Predictor requests go through `/api/predict`, which keeps the backend origin server-side. Copy `.env.example` to `.env.local` when using non-default origins.

## Verification

```bash
pnpm lint
pnpm test
pnpm repair:media
python -m unittest discover -s backend/tests -p "test_*.py"
pnpm build
```

## Disclaimer

This is an independent fan-made project and is not affiliated with or endorsed by KL Rahul, BCCI, IPL, or any franchise. Supplied imagery remains subject to its respective ownership and must be rights-cleared before public deployment.
