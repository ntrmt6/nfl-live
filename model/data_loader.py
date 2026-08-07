"""nflverse data loader with a local parquet cache.

Every dataset is cached under data/raw/<dataset>/<season>.parquet (or a single
all.parquet for datasets nflverse publishes as one file). Completed seasons are
immutable: once cached they are never refetched. Datasets that can still change
during the offseason (the upcoming season's rosters, depth charts, draft picks,
schedules) are refreshed when the cached file is older than STALE_AFTER_DAYS.

The site build never calls this module — it only ever reads data/processed/.

Usage:
    python -m model.data_loader              # fetch everything missing/stale
    python -m model.data_loader --dataset pbp
    python -m model.data_loader --force      # ignore cache freshness
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from model.config import (
    DATA_RAW,
    PROJECTION_SEASON,
    SEASONS,
    STALE_AFTER_DAYS,
)

MANIFEST = DATA_RAW / "manifest.json"

# dataset -> (fetch fn name in nfl_data_py, seasons, per_season)
# Seasons listed with PROJECTION_SEASON are "live": they refresh on staleness.
DATASETS: dict[str, dict] = {
    "pbp":              {"fn": "import_pbp_data",         "seasons": SEASONS,                       "per_season": True},
    "weekly":           {"fn": "import_weekly_data",      "seasons": SEASONS,                       "per_season": True},
    "seasonal_rosters": {"fn": "import_seasonal_rosters", "seasons": SEASONS + [PROJECTION_SEASON], "per_season": True},
    "snap_counts":      {"fn": "import_snap_counts",      "seasons": SEASONS,                       "per_season": True},
    "depth_charts":     {"fn": "import_depth_charts",     "seasons": SEASONS + [PROJECTION_SEASON], "per_season": True},
    "schedules":        {"fn": "import_schedules",        "seasons": SEASONS + [PROJECTION_SEASON], "per_season": True},
    "injuries":         {"fn": "import_injuries",         "seasons": SEASONS,                       "per_season": True},
    "draft_picks":      {"fn": "import_draft_picks",      "seasons": None,                          "per_season": False},
    "player_ids":       {"fn": None,                      "seasons": None,                          "per_season": False},
}


def _load_manifest() -> dict:
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text())
    return {}


def _save_manifest(manifest: dict) -> None:
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True))


def _is_fresh(path: Path, season: int | None) -> bool:
    if not path.exists():
        return False
    # Completed seasons are immutable once cached.
    if season is not None and season < PROJECTION_SEASON:
        return True
    age_days = (time.time() - path.stat().st_mtime) / 86400
    return age_days < STALE_AFTER_DAYS


# Datasets mirrored in plain git trees (raw.githubusercontent.com), used in
# preference to GitHub release assets — some networks block the release-asset
# host but allow raw file access. Both mirrors are maintained by nflverse.
RAW_TREE_URLS = {
    "schedules": "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv",
    "player_ids": "https://raw.githubusercontent.com/dynastyprocess/data/master/files/db_playerids.csv",
}


# nflverse restructured player stats in 2025: the legacy player_stats_<year>
# assets stopped at 2024, replaced by stats_player_week_<year> with a few
# renamed columns. Fetch the new asset and map it back to the legacy names the
# rest of the pipeline uses.
NEW_WEEKLY_FROM = 2025
NEW_WEEKLY_URL = "https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_{season}.parquet"
NEW_WEEKLY_RENAMES = {
    "team": "recent_team",
    "passing_interceptions": "interceptions",
    "sacks_suffered": "sacks",
}


def _fetch(name: str, fn_name: str, seasons: list[int] | None) -> pd.DataFrame:
    if name == "weekly" and seasons and seasons[0] >= NEW_WEEKLY_FROM:
        df = pd.read_parquet(NEW_WEEKLY_URL.format(season=seasons[0]))
        return df.rename(columns=NEW_WEEKLY_RENAMES)

    if name in RAW_TREE_URLS:
        df = pd.read_csv(RAW_TREE_URLS[name], low_memory=False)
        if seasons is not None and "season" in df.columns:
            df = df[df["season"].isin(seasons)].reset_index(drop=True)
            if len(df) == 0:
                raise FileNotFoundError(f"no rows for seasons {seasons}")
        return df

    import nfl_data_py as nfl

    fn = getattr(nfl, fn_name)
    if seasons is None:
        return fn()
    if fn_name == "import_pbp_data":
        return fn(seasons, downcast=True, cache=False)
    return fn(seasons)


def fetch_dataset(name: str, force: bool = False) -> list[str]:
    """Fetch one dataset into the cache. Returns log lines."""
    spec = DATASETS[name]
    out_dir = DATA_RAW / name
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = _load_manifest()
    log: list[str] = []

    targets: list[tuple[Path, int | None]]
    if spec["per_season"]:
        targets = [(out_dir / f"{season}.parquet", season) for season in spec["seasons"]]
    else:
        targets = [(out_dir / "all.parquet", None)]

    for path, season in targets:
        label = f"{name}/{path.name}"
        if not force and _is_fresh(path, season):
            log.append(f"  cached  {label}")
            continue
        try:
            df = _fetch(name, spec["fn"], [season] if season is not None else None)
        except Exception as e:  # noqa: BLE001 — a missing upcoming-season file is expected
            if season == PROJECTION_SEASON:
                log.append(f"  absent  {label} (not published yet: {type(e).__name__})")
                continue
            log.append(f"  ERROR   {label}: {e}")
            continue
        if df is None or len(df) == 0:
            log.append(f"  empty   {label}")
            continue
        df.to_parquet(path, index=False)
        manifest[label] = {
            "rows": int(len(df)),
            "cols": int(df.shape[1]),
            "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
        log.append(f"  fetched {label}  ({len(df):,} rows)")
        del df

    _save_manifest(manifest)
    return log


def load(name: str, seasons: list[int] | None = None, columns: list[str] | None = None) -> pd.DataFrame:
    """Read a cached dataset (no network). Model code uses this exclusively."""
    spec = DATASETS[name]
    out_dir = DATA_RAW / name
    if not spec["per_season"]:
        return pd.read_parquet(out_dir / "all.parquet", columns=columns)
    frames = []
    for season in seasons or spec["seasons"]:
        path = out_dir / f"{season}.parquet"
        if path.exists():
            frames.append(pd.read_parquet(path, columns=columns))
    if not frames:
        raise FileNotFoundError(f"No cached files for {name}; run `python -m model.data_loader`")
    return pd.concat(frames, ignore_index=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", choices=sorted(DATASETS), help="fetch a single dataset")
    parser.add_argument("--force", action="store_true", help="refetch even if cached")
    args = parser.parse_args()

    names = [args.dataset] if args.dataset else list(DATASETS)
    for name in names:
        print(f"==> {name}", flush=True)
        for line in fetch_dataset(name, force=args.force):
            print(line, flush=True)


if __name__ == "__main__":
    sys.exit(main())
