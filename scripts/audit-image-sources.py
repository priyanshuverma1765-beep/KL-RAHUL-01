"""Inventory the two user-supplied photograph collections and create contact sheets."""

from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "image-audit"
SOURCES = {
    "original_collection": ROOT / "USEABLE IMAGES",
    "codex_asset_pack": ROOT / "_asset_pack" / "KL_Rahul_Codex_Asset_Pack" / "01_originals_renamed",
    "supplemental_collection": ROOT / "_verified_image_pack" / "KL_Rahul_Verified_Image_Pack" / "02_enhanced_web",
}
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}


def visual_hash(image: Image.Image) -> str:
    rgb = ImageOps.exif_transpose(image).convert("RGB")
    digest = hashlib.sha256()
    digest.update(f"{rgb.width}x{rgb.height}:RGB".encode())
    digest.update(rgb.tobytes())
    return digest.hexdigest()


def difference_hash(image: Image.Image, size: int = 16) -> str:
    grayscale = ImageOps.exif_transpose(image).convert("L").resize((size + 1, size), Image.Resampling.LANCZOS)
    pixels = list(grayscale.get_flattened_data())
    bits = []
    for row in range(size):
        start = row * (size + 1)
        bits.extend(pixels[start + col] > pixels[start + col + 1] for col in range(size))
    value = sum(int(bit) << index for index, bit in enumerate(bits))
    return f"{value:0{size * size // 4}x}"


def inventory() -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for source_name, directory in SOURCES.items():
        for path in sorted(directory.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
                continue
            record: dict[str, object] = {
                "filename": path.name,
                "source_collection": source_name,
                "source_path": path.relative_to(ROOT).as_posix(),
                "byte_size": path.stat().st_size,
                "valid": False,
            }
            if path.stat().st_size == 0:
                record["invalid_reason"] = "zero-byte file"
                records.append(record)
                continue
            try:
                with Image.open(path) as image:
                    image.load()
                    normalized = ImageOps.exif_transpose(image)
                    record.update({
                        "valid": normalized.width > 0 and normalized.height > 0,
                        "width": normalized.width,
                        "height": normalized.height,
                        "visual_hash": visual_hash(normalized),
                        "difference_hash": difference_hash(normalized),
                    })
            except Exception as error:  # pragma: no cover - audit diagnostic
                record["invalid_reason"] = f"decode failure: {error}"
            records.append(record)
    return records


def contact_sheet(records: list[dict[str, object]], source_name: str, per_sheet: int = 24) -> None:
    valid = [record for record in records if record["source_collection"] == source_name and record["valid"]]
    cols, tile_width, tile_height, label_height = 4, 360, 250, 52
    for offset in range(0, len(valid), per_sheet):
        page = valid[offset: offset + per_sheet]
        rows = (len(page) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tile_width, rows * (tile_height + label_height)), "#101114")
        draw = ImageDraw.Draw(sheet)
        for index, record in enumerate(page):
            col, row = index % cols, index // cols
            x, y = col * tile_width, row * (tile_height + label_height)
            path = ROOT / str(record["source_path"])
            with Image.open(path) as opened:
                image = ImageOps.exif_transpose(opened).convert("RGB")
                fitted = ImageOps.fit(image, (tile_width, tile_height), Image.Resampling.LANCZOS)
            sheet.paste(fitted, (x, y))
            label = f"{offset + index + 1:02d} · {record['filename']}"
            draw.text((x + 10, y + tile_height + 8), label, fill="#f4f0e7", font=ImageFont.load_default())
            draw.text((x + 10, y + tile_height + 27), f"{record.get('width')}×{record.get('height')}", fill="#cba45e", font=ImageFont.load_default())
        destination = OUTPUT / f"contact-{source_name}-{offset // per_sheet + 1}.jpg"
        sheet.save(destination, quality=90, optimize=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = inventory()
    groups: dict[str, list[str]] = defaultdict(list)
    for record in records:
        if record.get("valid"):
            groups[str(record["visual_hash"])].append(str(record["source_path"]))
    duplicates = [paths for paths in groups.values() if len(paths) > 1]
    valid_records = [record for record in records if record.get("valid")]
    perceptual_candidates = []
    for left_index, left in enumerate(valid_records):
        for right in valid_records[left_index + 1:]:
            if left["source_collection"] == right["source_collection"]:
                continue
            left_ratio = int(left["width"]) / int(left["height"])
            right_ratio = int(right["width"]) / int(right["height"])
            if abs(left_ratio - right_ratio) / max(left_ratio, right_ratio) > 0.025:
                continue
            distance = (int(str(left["difference_hash"]), 16) ^ int(str(right["difference_hash"]), 16)).bit_count()
            if distance <= 12:
                perceptual_candidates.append({
                    "distance": distance,
                    "left": left["source_path"],
                    "right": right["source_path"],
                })
    perceptual_candidates.sort(key=lambda item: int(item["distance"]))
    report = {
        "counts": {
            name: {
                "found": sum(record["source_collection"] == name for record in records),
                "valid": sum(record["source_collection"] == name and record["valid"] for record in records),
                "invalid": sum(record["source_collection"] == name and not record["valid"] for record in records),
            }
            for name in SOURCES
        },
        "exact_visual_duplicate_groups": duplicates,
        "perceptual_duplicate_candidates": perceptual_candidates,
        "records": records,
    }
    (OUTPUT / "raw-inventory.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    for source_name in SOURCES:
        contact_sheet(records, source_name)
    print(json.dumps({"counts": report["counts"], "duplicate_groups": duplicates, "perceptual_candidates": perceptual_candidates}, indent=2))


if __name__ == "__main__":
    main()
