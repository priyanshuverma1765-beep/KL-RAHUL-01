# Instructions for Codex

Use this folder as the single source of truth for website imagery.

1. Preserve the existing hero section unless explicitly asked to change it.
2. Import assets from `02_web_ready`; do not reference the old `IMG_####` filenames.
3. Build the Journey section chronologically using its six subfolders in numeric order.
4. Use `journey_cards_4x5` for fixed cards with `object-fit: cover` and `object-position: center 42%`.
5. Populate the Century Vault from `century_vault_16x9`; lazy-load everything below the fold.
6. Use only 2–4 files from `03_4k_background_candidates` on a single page. Add a dark navy/black overlay
   (roughly 55–72%) so text remains readable; avoid making every section a photographic background.
7. Use `gallery` for a responsive masonry gallery and full-screen lightbox. Keep original aspect ratios.
8. Generate `srcset`/responsive sizes at build time if the framework supports it. Prefer AVIF/WebP,
   `loading=lazy`, `decoding=async`, and explicit width/height to prevent layout shift.
9. Never stretch images. Do not add fake AI faces, logos, watermarks, or invented match captions.
10. Consult `asset-manifest.csv` when mapping assets. If exact match/event metadata is unavailable,
    use era-level captions only rather than guessing a date, opponent, score or venue.
