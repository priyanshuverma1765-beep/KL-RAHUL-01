# KL Rahul — Codex Asset Pack

Ready-to-use image system for the KL Rahul fan analytics website.

## What is included

- **79 unique originals**, renamed and grouped chronologically (one exact duplicate removed).
- **79 gallery images** in WebP, up to 1920 px, retaining their natural aspect ratio.
- **79 journey cards** at 1200×1500 (4:5), ready for uniform UI cards.
- **25 Century Vault images** at 1920×1080 (16:9).
- **20 4K background candidates** at 3840×2160.
- `asset-manifest.csv` maps every original to every derivative and suggested role.
- `CODEX_INSTRUCTIONS.md` is the direct implementation brief.

## Important quality note

Some source files are historical low-resolution web images. Their 4K versions have clean dimensions,
consistent crops and restrained sharpening, but no upscaler can recover detail that was absent in the
source. Use 4K files as atmospheric/full-bleed backgrounds with overlays; use the 1920 px WebPs for
normal content. This keeps the site sharp without wasting bandwidth.

## Folder usage

- `01_originals_renamed/`: archival source files; do not serve these directly unless needed.
- `02_web_ready/gallery/`: masonry gallery and lightbox.
- `02_web_ready/journey_cards_4x5/`: Journey timeline/cards.
- `02_web_ready/century_vault_16x9/`: Century Vault tiles and modal headers.
- `03_4k_background_candidates/`: section backgrounds, parallax panels and cinematic dividers.
