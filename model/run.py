"""Pipeline entrypoint — writes site-facing JSON to data/processed/.

The site build reads these files from disk and never runs model code.

Usage: python -m model.run [--season 2026]
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone

import numpy as np
import pandas as pd

from model.combine import build_projections
from model.config import DATA_PROCESSED, LATEST_COMPLETED_SEASON, PROJECTION_SEASON

PLAYER_ROUND = {
    "attempts": 0, "completions": 0, "passing_yards": 0, "passing_tds": 1,
    "interceptions": 1, "carries": 0, "rushing_yards": 0, "rushing_tds": 1,
    "targets": 0, "receptions": 0, "receiving_yards": 0, "receiving_tds": 1,
}


def slugify(name: str, player_id: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    suffix = player_id.split("-")[-1]  # gsis ids end in a unique number
    return f"{base}-{suffix}"


def _round_line(row: pd.Series, suffix: str) -> dict:
    line = {}
    for col, nd in PLAYER_ROUND.items():
        val = float(row[f"{col}{suffix}"] if suffix else row[col])
        line[col] = round(val, nd) if nd else int(round(val))
    return line


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--season", type=int, default=PROJECTION_SEASON)
    args = parser.parse_args()
    season = args.season
    train_through = min(season - 1, LATEST_COMPLETED_SEASON)

    print(f"==> building {season} projections (trained through {train_through})...")
    players, teams = build_projections(season, train_through=train_through)

    # Keep the site payload to fantasy-relevant players.
    players = players[
        (players["fpts_ppr_17"] >= 5) | (players["attempts"] > 10)
    ].reset_index(drop=True)

    player_rows = []
    for _, row in players.iterrows():
        entry = {
            "id": row["player_id"],
            "slug": slugify(row["name"], row["player_id"]),
            "name": row["name"],
            "position": row["position"],
            "team": row["team"],
            "age": None if pd.isna(row["age"]) else int(row["age"]),
            "isRookie": bool(row["is_rookie"]),
            "draftPick": None if pd.isna(row["draft_number"]) else int(row["draft_number"]),
            "depthRank": None if pd.isna(row["depth_rank"]) else int(row["depth_rank"]),
            "expectedGames": round(float(row["expected_games"]), 1),
            "shares": {
                "carry": round(float(row["carry_share"]), 4),
                "target": round(float(row["target_share"]), 4),
                "attempt": round(float(row["attempt_share"]), 4),
            },
            "efficiency": {
                k: (None if pd.isna(row[k]) else round(float(row[k]), 4))
                for k in ["ypc", "ypt", "catch_rate", "rush_td_rate", "rec_td_rate",
                          "ypa", "comp_rate", "pass_td_rate", "int_rate"]
            },
            "per17": _round_line(row, ""),
            "expected": _round_line(row, "_exp"),
            "fantasyPoints": {
                "per17": {s: round(float(row[f"fpts_{s}_17"]), 1) for s in ("std", "half", "ppr")},
                "expected": {s: round(float(row[f"fpts_{s}_exp"]), 1) for s in ("std", "half", "ppr")},
            },
        }
        player_rows.append(entry)

    team_rows = []
    for _, row in teams.sort_values("team").iterrows():
        team_rows.append({
            "team": row["team"],
            "slug": row["team"].lower(),
            "coach": row["coach"],
            "coachContinuity": row["coach_continuity"],
            "plays": int(round(row["plays"])),
            "playsPerGame": round(float(row["plays_per_game"]), 1),
            "passRate": round(float(row["pass_rate"]), 4),
            "proe": round(float(row["proe"]), 2),
            "neutralPace": round(float(row["neutral_pace"]), 1),
            "teamAttempts": int(round(row["team_attempts"])),
            "teamTargets": int(round(row["team_targets"])),
            "teamCarries": int(round(row["team_carries"])),
        })

    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    meta = {
        "season": season,
        "trainedThrough": train_through,
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "playerCount": len(player_rows),
        "dataSource": "nflverse via nfl_data_py",
    }
    (DATA_PROCESSED / "players.json").write_text(json.dumps({"meta": meta, "players": player_rows}))
    (DATA_PROCESSED / "teams.json").write_text(json.dumps({"meta": meta, "teams": team_rows}))
    (DATA_PROCESSED / "meta.json").write_text(json.dumps(meta, indent=2))
    print(f"==> wrote {len(player_rows)} players, {len(team_rows)} teams -> {DATA_PROCESSED}")


if __name__ == "__main__":
    main()
