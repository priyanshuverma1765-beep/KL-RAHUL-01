"""Build the audited two-collection image manifest and Gallery-ready WebP assets.

The source folders are never modified. Exact-event fields intentionally remain
unverified unless the supplied material proves the pictured event.
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "data" / "image-audit" / "raw-inventory.json"
PACK_CSV = ROOT / "_asset_pack" / "KL_Rahul_Codex_Asset_Pack" / "asset-manifest.csv"
OLD_ROOT = ROOT / "USEABLE IMAGES"
OLD_PUBLIC = ROOT / "public" / "images" / "rahul" / "combined" / "original-collection"
OUTPUT = ROOT / "data" / "image-manifest.generated.json"

DUPLICATE_OLD = "OIP (9).webp"
DUPLICATE_PACK_ID = 3639

DOMESTIC = set(range(3621, 3627))
TEST = {
    3627, 3628, 3629, 3630, 3633, 3638, 3645, 3646, 3656, 3657,
    3658, 3659, 3682, 3683, 3684, 3685, 3686, 3695, 3696, 3697,
    3698, 3699, 3700,
}
ODI = {
    3631, 3632, 3634, 3641, 3647, 3648, 3649, 3650, 3651, 3652,
    3653, 3668, 3669, 3670, 3671, 3672, 3673, 3674, 3675, 3676,
    3677, 3678, 3679, 3680, 3681, 3692, 3694,
}
T20I = {3635}
RCB = {3636, 3637}
PUNJAB = {3642, 3643, 3644, 3654, 3655}
LSG = set(range(3660, 3667))
DC = set(range(3687, 3692))
OFF_FIELD = {3637, 3639, 3640, 3657, 3667, 3693}
TRAINING = {3639, 3640, 3693}
WICKETKEEPING = {3651, 3672, 3674, 3679}
CELEBRATIONS = {
    3621, 3622, 3623, 3625, 3627, 3628, 3630, 3633, 3635, 3641,
    3644, 3645, 3646, 3647, 3648, 3649, 3652, 3653, 3655, 3656,
    3657, 3658, 3659, 3660, 3661, 3663, 3666, 3668, 3669, 3673,
    3675, 3676, 3677, 3680, 3682, 3687, 3689, 3690, 3691, 3694,
    3697, 3698, 3699,
}

PERIODS = {
    "01_early_career": "2010–2016 · domestic foundations and early Tests",
    "02_india_breakthrough": "2014–2017 · India breakthrough",
    "03_established_india": "2018–2021 · established multi-format career",
    "04_captaincy_and_lsg": "2020–2023 · franchise leadership",
    "05_comeback_and_world_cup": "2023 · comeback and World Cup",
    "06_current_chapter": "2024–present · current chapter",
}

# Older-source classifications were made from full contact sheets and individual
# full-resolution checks. "limited" is deliberately used where the blue India kit
# is visible but the exact white-ball format cannot be proven from the file alone.
OLD_META: dict[str, tuple[str, list[str], list[str], list[str]]] = {
    "1f65a1f37eaae9d258f8ad662632b0c4.jpg": ("Off-field · formal appearance", [], [], ["Off Field", "Portrait"]),
    "42c89b9ddd8845c62f19f48951dd9ec6.jpg": ("Off-field · lifestyle", [], [], ["Off Field", "Portrait"]),
    "53661033ce99a0b5fbad5604d58540fb.jpg": ("Off-field · lifestyle", [], [], ["Off Field", "Portrait"]),
    "64e66dfd4d7fecb8f7eca85270c858d2.jpg": ("Off-field · stadium portrait", [], ["India"], ["Off Field", "Portrait"]),
    "6c7739ab919b19dd7b77d54496649dcd.jpg": ("Off-field · lifestyle collage", [], [], ["Off Field", "Portrait"]),
    "901e2fabea29f2b651c1b256c767066e.jpg": ("Off-field · formal appearance", [], [], ["Off Field", "Portrait"]),
    "9319fba70095d5f4a228f4428a6edefc.jpg": ("Off-field · portrait", [], [], ["Off Field", "Portrait"]),
    "940fab59829584aec58b465b569319f4.jpg": ("International · Test", ["Test"], ["India"], ["International", "Test"]),
    "9c3f93a6fd25993c8ece7c217ed6b9e0.jpg": ("International · white-ball celebration", ["International limited overs"], ["India"], ["International", "Centuries and Celebrations"]),
    "a08d5415d30cd7ad94956efd784d8f7d.jpg": ("Off-field · formal appearance", [], [], ["Off Field", "Portrait"]),
    "a17cbead54dbb4a4a6946eb6bf80de1f.jpg": ("International · current Test chapter", ["Test"], ["India"], ["International", "Test"]),
    "a9926b2f63597bb95235f5a5ae27f151.jpg": ("Off-field · lifestyle", [], [], ["Off Field", "Portrait"]),
    "ac505ad3b8fc65fa5b81673e903cd6fe.jpg": ("International · white-ball celebration", ["International limited overs"], ["India"], ["International", "Centuries and Celebrations"]),
    "download (1).webp": ("International · Test trophy", ["Test"], ["India"], ["International", "Test", "Centuries and Celebrations"]),
    "download.png": ("Mixed editorial collage · Test and Delhi Capitals", ["Test", "IPL"], ["India", "Delhi Capitals"], ["International", "Test", "IPL", "Delhi Capitals", "Centuries and Celebrations"]),
    "download.webp": ("IPL · Delhi Capitals", ["IPL"], ["Delhi Capitals"], ["IPL", "Delhi Capitals"]),
    "f03bbc8d879065bdf89957e2b87d6882.jpg": ("IPL · Delhi Capitals arrival", ["IPL"], ["Delhi Capitals"], ["IPL", "Delhi Capitals", "Off Field"]),
    "f8344e59a302c072f2169e9ac51f1ad4.jpg": ("Off-field · lifestyle", [], [], ["Off Field", "Portrait"]),
    "f93486a9be415c7904fc434d7f4d3cc3.jpg": ("IPL · RCB and Delhi Capitals collage", ["IPL"], ["RCB", "Delhi Capitals"], ["IPL", "RCB", "Delhi Capitals"]),
    "fcc80057e298a9f6ab13f6c42a37c4dc.jpg": ("International · ODI", ["ODI"], ["India"], ["International", "ODI"]),
    "fe2424c87ce180fb53c4ac07e0e007f2.jpg": ("IPL · Delhi Capitals editorial graphic", ["IPL"], ["Delhi Capitals"], ["IPL", "Delhi Capitals"]),
    "OIP (1).webp": ("International · ODI", ["ODI"], ["India"], ["International", "ODI"]),
    "OIP (10).webp": ("IPL · Punjab Kings", ["IPL"], ["Punjab Kings"], ["IPL", "Punjab Kings"]),
    "OIP (11).webp": ("IPL · LSG", ["IPL"], ["LSG"], ["IPL", "LSG"]),
    "OIP (12).webp": ("International · white-ball celebration", ["International limited overs"], ["India"], ["International", "Centuries and Celebrations"]),
    "OIP (13).webp": ("Early international career", ["International"], ["India"], ["International", "Domestic and Early Career"]),
    "OIP (14).webp": ("IPL · early RCB chapter", ["IPL"], ["RCB"], ["IPL", "RCB", "Domestic and Early Career"]),
    "OIP (15).webp": ("Domestic · Karnataka", ["Domestic"], ["Karnataka"], ["Domestic and Early Career"]),
    "OIP (16).webp": ("Off-field · lifestyle collage", [], [], ["Off Field", "Portrait"]),
    "OIP (17).webp": ("International · T20I", ["T20I"], ["India"], ["International", "T20I"]),
    "OIP (2).webp": ("International · Test training", ["Test"], ["India"], ["International", "Test", "Off Field", "Training"]),
    "OIP (3).webp": ("International · Test", ["Test"], ["India"], ["International", "Test"]),
    "OIP (4).webp": ("India training portrait", ["International"], ["India"], ["International", "Off Field", "Training", "Portrait"]),
    "OIP (5).webp": ("IPL · LSG", ["IPL"], ["LSG"], ["IPL", "LSG"]),
    "OIP (6).webp": ("International · ODI", ["ODI"], ["India"], ["International", "ODI"]),
    "OIP (7).webp": ("International · white-ball celebration", ["International limited overs"], ["India"], ["International", "Centuries and Celebrations"]),
    "OIP (8).webp": ("Off-field · portrait", [], [], ["Off Field", "Portrait"]),
    "OIP (9).webp": ("India training portrait", ["International"], ["India"], ["International", "Off Field", "Training", "Portrait"]),
    "OIP.webp": ("International · current Test chapter", ["Test"], ["India"], ["International", "Test", "Centuries and Celebrations"]),
    "th.webp": ("International · current Test chapter", ["Test"], ["India"], ["International", "Test", "Centuries and Celebrations"]),
}


def pack_metadata(asset_id: int, category: str) -> tuple[str, list[str], list[str], list[str]]:
    formats: list[str] = []
    teams: list[str] = []
    filters: list[str] = []
    if asset_id in DOMESTIC:
        formats, teams, filters = ["Domestic"], ["Karnataka"], ["Domestic and Early Career"]
    elif asset_id in TEST:
        formats, teams, filters = ["Test"], ["India"], ["International", "Test"]
    elif asset_id in ODI:
        formats, teams, filters = ["ODI"], ["India"], ["International", "ODI"]
    elif asset_id in T20I:
        formats, teams, filters = ["T20I"], ["India"], ["International", "T20I"]
    elif asset_id in RCB:
        formats, teams, filters = ["IPL"], ["RCB"], ["IPL", "RCB"]
    elif asset_id in PUNJAB:
        formats, teams, filters = ["IPL"], ["Punjab Kings"], ["IPL", "Punjab Kings"]
    elif asset_id in LSG:
        formats, teams, filters = ["IPL"], ["LSG"], ["IPL", "LSG"]
    elif asset_id in DC:
        formats, teams, filters = ["IPL"], ["Delhi Capitals"], ["IPL", "Delhi Capitals"]
    else:
        formats, teams, filters = ["International limited overs"], ["India"], ["International"]

    classifications: list[str] = []
    if asset_id in OFF_FIELD:
        filters.append("Off Field")
        classifications.append("Training" if asset_id in TRAINING else "Off Field")
    if asset_id in TRAINING:
        classifications.append("Training")
    if asset_id in WICKETKEEPING:
        filters.append("Wicketkeeping")
        classifications.append("Wicketkeeping")
    if asset_id in CELEBRATIONS:
        filters.append("Centuries and Celebrations")
        classifications.append("Century/Celebration")
    if category == "01_early_career" and "Domestic and Early Career" not in filters:
        filters.append("Domestic and Early Career")
    classifications.append("On-field" if asset_id not in OFF_FIELD else "Off-field")
    label = " · ".join(teams + formats) if formats else "Archive photograph"
    return label, formats, teams, list(dict.fromkeys(filters + classifications))


def convert_old(source: Path, destination: Path) -> tuple[int, int]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        if image.width > 1800:
            height = round(image.height * 1800 / image.width)
            image = image.resize((1800, height), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=84, method=6)
        return image.width, image.height


def main() -> None:
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    audited = {record["source_path"]: record for record in audit["records"]}
    pack_rows = list(csv.DictReader(PACK_CSV.open(encoding="utf-8-sig", newline="")))
    records: list[dict[str, object]] = []

    for row in pack_rows:
        asset_id = int(row["asset_id"])
        source_path = f"_asset_pack/KL_Rahul_Codex_Asset_Pack/{row['renamed_original']}"
        raw = audited[source_path]
        category = row["category"]
        label, formats, teams, tags = pack_metadata(asset_id, category)
        filters = [tag for tag in tags if tag in {
            "International", "Test", "ODI", "T20I", "IPL", "Domestic and Early Career",
            "Wicketkeeping", "Centuries and Celebrations", "Off Field", "RCB", "Punjab Kings", "LSG", "Delhi Capitals",
        }]
        classifications = [tag for tag in tags if tag not in filters]
        gallery_public = "/images/rahul/archive/" + row["gallery_webp"].removeprefix("02_web_ready/")
        records.append({
            "id": f"pack-{asset_id}",
            "asset_id": asset_id,
            "filename": raw["filename"],
            "source_collection": "KL_Rahul_Codex_Asset_Pack",
            "source_path": source_path,
            "public_path": gallery_public,
            "width": raw["width"],
            "height": raw["height"],
            "approximate_career_period": PERIODS[category],
            "match_event": "Unverified — era-level photograph",
            "event_verified": False,
            "format": formats,
            "team_franchise": teams,
            "field_context": "off-field" if asset_id in OFF_FIELD else "on-field",
            "classification": classifications,
            "gallery_filters": filters,
            "recommended_sections": ["Gallery"],
            "currently_used": True,
            "duplicate_of": None,
            "caption": label,
            "notes": "Format/team identified visually where the kit is distinctive; exact match is not claimed.",
        })

    old_raw = sorted(
        (record for record in audit["records"] if record["source_collection"] == "original_collection"),
        key=lambda record: str(record["filename"]).lower(),
    )
    for index, raw in enumerate(old_raw, 1):
        filename = str(raw["filename"])
        label, formats, teams, tags = OLD_META[filename]
        duplicate = filename == DUPLICATE_OLD
        safe = re.sub(r"[^a-z0-9]+", "-", Path(filename).stem.lower()).strip("-") or "image"
        public_path = None
        width, height = int(raw["width"]), int(raw["height"])
        if not duplicate:
            destination = OLD_PUBLIC / f"old-{index:02d}-{safe}.webp"
            width, height = convert_old(ROOT / str(raw["source_path"]), destination)
            public_path = "/" + destination.relative_to(ROOT / "public").as_posix()
        filters = [tag for tag in tags if tag in {
            "International", "Test", "ODI", "T20I", "IPL", "Domestic and Early Career",
            "Wicketkeeping", "Centuries and Celebrations", "Off Field", "RCB", "Punjab Kings", "LSG", "Delhi Capitals",
        }]
        classifications = [tag for tag in tags if tag not in filters]
        records.append({
            "id": f"old-{index:02d}",
            "asset_id": None,
            "filename": filename,
            "source_collection": "Original supplied collection",
            "source_path": raw["source_path"],
            "public_path": public_path,
            "width": width,
            "height": height,
            "approximate_career_period": "Mixed archive · exact period not supplied",
            "match_event": "Unverified — visual context only",
            "event_verified": False,
            "format": formats,
            "team_franchise": teams,
            "field_context": "off-field" if "Off Field" in filters else ("mixed" if len(formats) > 1 else "on-field"),
            "classification": classifications,
            "gallery_filters": filters,
            "recommended_sections": [] if duplicate else ["Gallery"],
            "currently_used": not duplicate,
            "duplicate_of": f"pack-{DUPLICATE_PACK_ID}" if duplicate else None,
            "caption": label,
            "notes": "Exact event is not claimed." if not duplicate else "Same frame as pack-3639; the higher-resolution pack source is used.",
        })

    used = [record for record in records if record["currently_used"]]
    category_order = [
        "International", "Test", "ODI", "T20I", "IPL", "Domestic and Early Career",
        "Wicketkeeping", "Centuries and Celebrations", "Off Field", "RCB", "Punjab Kings", "LSG", "Delhi Capitals",
    ]
    counts = {category: sum(category in record["gallery_filters"] for record in used) for category in category_order}
    output = {
        "generated_from": ["USEABLE IMAGES", "KL_Rahul_Codex_Asset_Pack/01_originals_renamed"],
        "audit_summary": {
            "old_collection_found": 40,
            "new_pack_found": 79,
            "invalid_source_files": 0,
            "exact_duplicate_files_removed": 1,
            "final_gallery_images": len(used),
            "duplicate_note": "OIP (9).webp is the same frame as pack-3639; pack-3639 is retained.",
        },
        "categories": [{"id": category, "count": counts[category]} for category in category_order],
        "records": records,
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"summary": output["audit_summary"], "category_counts": counts}, indent=2))


if __name__ == "__main__":
    main()
