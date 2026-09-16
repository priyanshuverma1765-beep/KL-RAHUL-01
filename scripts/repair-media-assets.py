"""Repair zero-byte WebP derivatives in the supplied asset pack.

The source ZIP contains a small number of empty generated files. This script
rebuilds only those files from each row's intact, renamed original and then
decodes every published WebP as a final integrity check.
"""

from __future__ import annotations

import csv
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "_asset_pack" / "KL_Rahul_Codex_Asset_Pack"
PUBLIC = ROOT / "public" / "images" / "rahul" / "archive"
MANIFEST = ROOT / "data" / "asset-manifest.csv"


def crop_ratio(image: Image.Image, ratio: float, vertical_focus: float = 0.5) -> Image.Image:
    width, height = image.size
    current_ratio = width / height
    if current_ratio > ratio:
        crop_width = round(height * ratio)
        left = round((width - crop_width) * 0.5)
        box = (left, 0, left + crop_width, height)
    else:
        crop_height = round(width / ratio)
        top = round((height - crop_height) * vertical_focus)
        box = (0, top, width, top + crop_height)
    return image.crop(box)


def resize_down(image: Image.Image, maximum: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(maximum, Image.Resampling.LANCZOS)
    return copy


def save_webp(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(destination, "WEBP", quality=86, method=6)


def rebuild(row: dict[str, str], column: str, destination: Path) -> None:
    source = PACK / row["renamed_original"]
    if not source.is_file() or source.stat().st_size == 0:
        raise RuntimeError(f"Missing original for {destination}: {source}")

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        if column == "gallery_webp":
            output = resize_down(image, (1920, 1920))
        elif column == "journey_card_webp":
            output = resize_down(crop_ratio(image, 4 / 5, vertical_focus=0.42), (1200, 1500))
        elif column == "century_vault_webp":
            output = resize_down(crop_ratio(image, 16 / 9), (1920, 1080))
        else:
            raise RuntimeError(f"Unsupported media column: {column}")
        save_webp(output, destination)


def repair() -> list[Path]:
    repaired: list[Path] = []
    with MANIFEST.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))

    for row in rows:
        for column in ("gallery_webp", "journey_card_webp", "century_vault_webp"):
            pack_path = row.get(column, "")
            if not pack_path:
                continue
            destination = PUBLIC / Path(pack_path).relative_to("02_web_ready")
            if destination.is_file() and destination.stat().st_size > 0:
                continue
            rebuild(row, column, destination)
            repaired.append(destination)
    return repaired


def verify() -> int:
    files = sorted(PUBLIC.rglob("*.webp"))
    for path in files:
        if path.stat().st_size == 0:
            raise RuntimeError(f"Zero-byte media remains: {path}")
        with Image.open(path) as image:
            image.load()
            if image.width < 1 or image.height < 1:
                raise RuntimeError(f"Invalid dimensions: {path}")
    return len(files)


if __name__ == "__main__":
    repaired_paths = repair()
    verified_count = verify()
    print(f"Repaired {len(repaired_paths)} media files; decoded {verified_count} published WebPs.")
    for repaired_path in repaired_paths:
        print(repaired_path.relative_to(ROOT))
