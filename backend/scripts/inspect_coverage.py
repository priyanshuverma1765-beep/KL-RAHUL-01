"""Read-only coverage audit for KL Rahul in Cricsheet JSON ZIP archives."""

from __future__ import annotations

import json
import sys
import zipfile
from collections import Counter
from pathlib import Path


PLAYER_NAME = "KL Rahul"


def innings_for_player(match: dict) -> list[dict]:
    batting_innings: list[dict] = []
    for innings_number, innings in enumerate(match.get("innings", []), start=1):
        runs = balls = fours = sixes = 0
        appeared = False
        dismissals: list[str] = []
        for over in innings.get("overs", []):
            for delivery in over.get("deliveries", []):
                if delivery.get("batter") == PLAYER_NAME:
                    appeared = True
                    batter_runs = delivery.get("runs", {}).get("batter", 0)
                    runs += batter_runs
                    fours += batter_runs == 4
                    sixes += batter_runs == 6
                    # Wides do not count as a ball faced. No-balls do count as a
                    # ball faced when the batter receives the delivery.
                    balls += "wides" not in delivery.get("extras", {})
                for wicket in delivery.get("wickets", []):
                    if wicket.get("player_out") == PLAYER_NAME:
                        dismissals.append(wicket.get("kind", "unknown"))
        if appeared or dismissals:
            batting_innings.append(
                {
                    "innings_number": innings_number,
                    "team": innings.get("team"),
                    "super_over": innings.get("super_over", False),
                    "runs": runs,
                    "balls": balls,
                    "fours": fours,
                    "sixes": sixes,
                    "dismissals": dismissals,
                }
            )
    return batting_innings


def audit_archive(path: Path) -> dict:
    archive_types: Counter[str] = Counter()
    rahul_variants: Counter[str] = Counter()
    covered_matches: list[dict] = []

    with zipfile.ZipFile(path) as archive:
        json_entries = [name for name in archive.namelist() if name.endswith(".json")]
        for entry in json_entries:
            match = json.loads(archive.read(entry))
            info = match.get("info", {})
            archive_types[info.get("match_type", "unknown")] += 1

            player_team = None
            for team, players in info.get("players", {}).items():
                for player in players:
                    if "rahul" in player.lower():
                        rahul_variants[player] += 1
                    if player == PLAYER_NAME:
                        player_team = team

            if player_team is None:
                continue

            dates = info.get("dates", [])
            covered_matches.append(
                {
                    "match_id": Path(entry).stem,
                    "date": str(dates[0]) if dates else None,
                    "match_type": info.get("match_type"),
                    "team": player_team,
                    "innings": innings_for_player(match),
                }
            )

    batting = [inn for match in covered_matches for inn in match["innings"]]
    dates = [match["date"] for match in covered_matches if match["date"]]
    return {
        "archive": path.name,
        "json_matches_in_archive": sum(archive_types.values()),
        "archive_match_types": dict(archive_types),
        "rahul_name_variants": dict(rahul_variants),
        "matches_in_squad": len(covered_matches),
        "batting_innings": len(batting),
        "regulation_batting_innings": sum(not inn["super_over"] for inn in batting),
        "super_over_batting_innings": sum(inn["super_over"] for inn in batting),
        "matches_without_batting_innings": sum(not match["innings"] for match in covered_matches),
        "coverage_start": min(dates, default=None),
        "coverage_end": max(dates, default=None),
        "delivery_derived_totals": {
            "runs": sum(inn["runs"] for inn in batting),
            "balls": sum(inn["balls"] for inn in batting),
            "fours": sum(inn["fours"] for inn in batting),
            "sixes": sum(inn["sixes"] for inn in batting),
            "dismissed_innings": sum(bool(inn["dismissals"]) for inn in batting),
        },
        "sample_match_ids": [match["match_id"] for match in covered_matches[:3]],
    }


def main() -> None:
    raw_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "backend/data/raw")
    result = {path.stem: audit_archive(path) for path in sorted(raw_dir.glob("*.zip"))}
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
