"""Tidy modeling tables built from the raw cache.

Everything here reads data/raw/ via data_loader.load() — no network. Two core
outputs:

  team_season_volume(): per team-season offensive volume/pace/PROE actuals
  player_seasons():     per player-season counting stats, shares, snap share,
                        age, draft capital, roster metadata
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from model.config import norm_team
from model.data_loader import load

PBP_COLS = [
    "season", "week", "game_id", "posteam", "play_type",
    "pass", "rush", "sack", "qb_dropback", "wp", "qtr", "pass_oe",
    "season_type",
]

WEEKLY_COLS = [
    "player_id", "player_display_name", "position", "recent_team", "season",
    "week", "season_type", "completions", "attempts", "passing_yards",
    "passing_tds", "interceptions", "sacks", "carries", "rushing_yards",
    "rushing_tds", "receptions", "targets", "receiving_yards", "receiving_tds",
]

OFFENSE_POSITIONS = ["QB", "RB", "WR", "TE"]


def _reg_season(df: pd.DataFrame) -> pd.DataFrame:
    if "season_type" in df.columns:
        return df[df["season_type"] == "REG"]
    if "game_type" in df.columns:
        return df[df["game_type"] == "REG"]
    return df


def team_season_volume(seasons: list[int]) -> pd.DataFrame:
    """Per team-season: games, offensive plays/gm, pass rate, PROE, neutral pace."""
    pbp = load("pbp", seasons=seasons, columns=PBP_COLS)
    pbp = _reg_season(pbp)
    plays = pbp[(pbp["pass"].fillna(0) + pbp["rush"].fillna(0)) > 0].copy()
    plays["posteam"] = plays["posteam"].map(norm_team)

    grp = plays.groupby(["season", "posteam"])
    per_team = grp.agg(
        plays=("game_id", "size"),
        games=("game_id", "nunique"),
        dropbacks=("qb_dropback", "sum"),
        pass_plays=("pass", "sum"),
        proe=("pass_oe", "mean"),  # pass_oe is in percentage points
    ).reset_index()

    neutral = plays[(plays["wp"].between(0.2, 0.8)) & (plays["qtr"] <= 3)]
    neutral_counts = (
        neutral.groupby(["season", "posteam"])
        .agg(neutral_plays=("game_id", "size"), neutral_games=("game_id", "nunique"))
        .reset_index()
    )

    df = per_team.merge(neutral_counts, on=["season", "posteam"], how="left")
    df["plays_per_game"] = df["plays"] / df["games"]
    df["pass_rate"] = df["pass_plays"] / df["plays"]
    df["neutral_pace"] = df["neutral_plays"] / df["neutral_games"]
    df = df.rename(columns={"posteam": "team"})
    return df[[
        "season", "team", "games", "plays", "plays_per_game", "pass_rate",
        "proe", "neutral_pace",
    ]]


def head_coaches(seasons: list[int]) -> pd.DataFrame:
    """Per team-season head coach (regular-season, most frequent listing)."""
    sched = load("schedules", seasons=seasons)
    sched = sched[sched["game_type"] == "REG"] if "game_type" in sched.columns else sched
    rows = []
    for side in ("home", "away"):
        part = sched[["season", f"{side}_team", f"{side}_coach"]].rename(
            columns={f"{side}_team": "team", f"{side}_coach": "coach"}
        )
        rows.append(part)
    coaches = pd.concat(rows, ignore_index=True).dropna(subset=["coach"])
    coaches["team"] = coaches["team"].map(norm_team)
    top = (
        coaches.groupby(["season", "team"])["coach"]
        .agg(lambda s: s.value_counts().index[0])
        .reset_index()
    )
    return top


def _snap_shares(seasons: list[int]) -> pd.DataFrame:
    """Per player-season offensive snap share, keyed to gsis id via the
    dynastyprocess id map (snap counts are pfr-keyed)."""
    snaps = load("snap_counts", seasons=seasons)
    snaps = _reg_season(snaps)
    snaps["team"] = snaps["team"].map(norm_team)

    agg = (
        snaps.groupby(["season", "pfr_player_id"])
        .agg(off_snaps=("offense_snaps", "sum"), off_pct=("offense_pct", "mean"))
        .reset_index()
    )

    ids = load("player_ids")
    id_map = ids[["pfr_id", "gsis_id"]].dropna().drop_duplicates("pfr_id")
    agg = agg.merge(id_map, left_on="pfr_player_id", right_on="pfr_id", how="left")
    return agg[["season", "gsis_id", "off_snaps", "off_pct"]].dropna(subset=["gsis_id"])


_PLAYER_SEASONS_CACHE: dict[tuple, pd.DataFrame] = {}


def player_seasons(seasons: list[int]) -> pd.DataFrame:
    """Per player-season-team stats + shares + roster context for QB/RB/WR/TE."""
    key = tuple(sorted(seasons))
    if key in _PLAYER_SEASONS_CACHE:
        return _PLAYER_SEASONS_CACHE[key].copy()
    weekly = load("weekly", seasons=seasons, columns=WEEKLY_COLS)
    weekly = _reg_season(weekly)
    weekly = weekly[weekly["position"].isin(OFFENSE_POSITIONS)].copy()
    weekly["team"] = weekly["recent_team"].map(norm_team)

    agg = weekly.groupby(["season", "player_id"]).agg(
        name=("player_display_name", "last"),
        position=("position", "last"),
        team=("team", "last"),  # last team of the season
        games=("week", "nunique"),
        completions=("completions", "sum"),
        attempts=("attempts", "sum"),
        passing_yards=("passing_yards", "sum"),
        passing_tds=("passing_tds", "sum"),
        interceptions=("interceptions", "sum"),
        sacks=("sacks", "sum"),
        carries=("carries", "sum"),
        rushing_yards=("rushing_yards", "sum"),
        rushing_tds=("rushing_tds", "sum"),
        receptions=("receptions", "sum"),
        targets=("targets", "sum"),
        receiving_yards=("receiving_yards", "sum"),
        receiving_tds=("receiving_tds", "sum"),
    ).reset_index()

    # Team totals -> shares. Shares are of the player's (last) team's totals,
    # which slightly misattributes midseason movers; acceptable at season grain.
    team_tot = agg.groupby(["season", "team"]).agg(
        team_carries=("carries", "sum"),
        team_targets=("targets", "sum"),
        team_attempts=("attempts", "sum"),
    ).reset_index()
    agg = agg.merge(team_tot, on=["season", "team"], how="left")
    agg["carry_share"] = agg["carries"] / agg["team_carries"].replace(0, np.nan)
    agg["target_share"] = agg["targets"] / agg["team_targets"].replace(0, np.nan)
    agg["attempt_share"] = agg["attempts"] / agg["team_attempts"].replace(0, np.nan)

    # Availability-adjusted shares: the player's share of team volume while he
    # was active. Raw full-season shares bake missed games into the number;
    # using them as priors would double-count availability once the games
    # model applies its own discount. Caps keep 3-game cameos from exploding.
    team_games = np.where(agg["season"] >= 2021, 17, 16)
    avail = (team_games / agg["games"].clip(lower=1)).clip(upper=17 / 4)
    for col, cap in [("carry_share", 0.88), ("target_share", 0.38), ("attempt_share", 1.0)]:
        agg[f"{col}_adj"] = (agg[col] * avail).clip(upper=cap)

    # Roster context: age, draft capital.
    rosters = load("seasonal_rosters", seasons=seasons)
    rosters = rosters.drop_duplicates(subset=["season", "player_id"], keep="last")
    ros_cols = rosters[["season", "player_id", "birth_date", "draft_number", "entry_year"]]
    agg = agg.merge(ros_cols, on=["season", "player_id"], how="left")
    agg["age"] = agg["season"] - pd.to_datetime(agg["birth_date"], errors="coerce").dt.year
    agg["draft_number"] = pd.to_numeric(agg["draft_number"], errors="coerce")
    agg["entry_year"] = pd.to_numeric(agg["entry_year"], errors="coerce")
    agg["years_in_league"] = agg["season"] - agg["entry_year"]

    snap = _snap_shares(seasons)
    agg = agg.merge(
        snap, left_on=["season", "player_id"], right_on=["season", "gsis_id"], how="left"
    ).drop(columns=["gsis_id"])

    result = agg.drop(columns=["birth_date"])
    _PLAYER_SEASONS_CACHE[key] = result
    return result.copy()
