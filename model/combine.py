"""Step 3d — combine volume x share x efficiency into player stat lines.

Team-level calibration factors (sack rate, targets per dropback) are fit from
the training window so projected league totals match observed league totals.
Outputs one row per player with 17-game and expected-games stat lines plus
fantasy points in standard/half/PPR, and a per-team volume summary.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from model.datasets import player_seasons, team_season_volume
from model.efficiency import fit_priors, project_efficiency
from model.games_played import fit_position_base, project_games
from model.shares import project_shares
from model.team_volume import project_team_volume

STAT_COLS = [
    "attempts", "completions", "passing_yards", "passing_tds", "interceptions",
    "carries", "rushing_yards", "rushing_tds",
    "targets", "receptions", "receiving_yards", "receiving_tds",
]


def fantasy_points(df: pd.DataFrame, rec_value: float) -> pd.Series:
    return (
        df["passing_yards"] / 25
        + df["passing_tds"] * 4
        - df["interceptions"] * 2
        + (df["rushing_yards"] + df["receiving_yards"]) / 10
        + (df["rushing_tds"] + df["receiving_tds"]) * 6
        + df["receptions"] * rec_value
    )


def _league_factors(train_through: int) -> dict[str, float]:
    """Fit sack rate and targets-per-pass-play from recent league data."""
    recent = list(range(train_through - 2, train_through + 1))
    tv = team_season_volume(recent)
    ps = player_seasons(recent)
    league = ps.groupby("season")[["attempts", "targets", "carries"]].sum()
    plays = tv.groupby("season")[["plays"]].sum()
    pass_plays = (tv["plays"] * tv["pass_rate"]).groupby(tv["season"]).sum()
    att_per_pass_play = (league["attempts"] / pass_plays).mean()
    tgt_per_attempt = (league["targets"] / league["attempts"]).mean()
    carries_per_run_play = (league["carries"] / (plays["plays"] - pass_plays)).mean()
    return {
        "att_per_pass_play": float(att_per_pass_play),
        "tgt_per_attempt": float(tgt_per_attempt),
        "carries_per_run_play": float(carries_per_run_play),
    }


def build_projections(season: int, train_through: int) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Full pipeline for `season` trained on data <= train_through.

    Returns (players, teams).
    """
    teams = project_team_volume(season)
    shares = project_shares(season, train_through)
    priors = fit_priors(list(range(train_through - 7, train_through + 1)))
    eff = project_efficiency(train_through, priors)
    games_base = fit_position_base(train_through)
    games = project_games(train_through, games_base)
    factors = _league_factors(train_through)

    teams = teams.copy()
    teams["pass_plays"] = teams["plays"] * teams["pass_rate"]
    teams["team_attempts"] = teams["pass_plays"] * factors["att_per_pass_play"]
    teams["team_targets"] = teams["team_attempts"] * factors["tgt_per_attempt"]
    teams["team_carries"] = (teams["plays"] - teams["pass_plays"]) * factors["carries_per_run_play"]

    df = shares.merge(
        teams[["team", "team_attempts", "team_targets", "team_carries"]], on="team", how="inner"
    )
    df = df.merge(eff.drop(columns=["position"]), on="player_id", how="left")
    df = df.merge(games, on="player_id", how="left")

    pos_default_games = {p: min(v, 16.5) for p, v in games_base.items()}
    df["expected_games"] = df["expected_games"].fillna(
        df["position"].map(pos_default_games).fillna(14.5)
    )

    # League-mean efficiency for players without enough history (incl. rookies).
    for stat in ["ypc", "ypt", "catch_rate", "rush_td_rate", "rec_td_rate",
                 "ypa", "comp_rate", "pass_td_rate", "int_rate"]:
        mus = df["position"].map(lambda p, s=stat: priors.get((s, p), {}).get("mu", np.nan))
        df[stat] = df[stat].fillna(mus)

    # Expected-games counting stats. Historical shares already embed typical
    # availability (an oft-injured player's past shares are season totals), so
    # share x team volume is naturally an expected-season line — availability
    # is priced exactly once. The 17-game line scales it back up.
    df["attempts"] = (df["attempt_share"] * df["team_attempts"]).fillna(0)
    df["completions"] = df["attempts"] * df["comp_rate"].fillna(0)
    df["passing_yards"] = df["attempts"] * df["ypa"].fillna(0)
    df["passing_tds"] = df["attempts"] * df["pass_td_rate"].fillna(0)
    df["interceptions"] = df["attempts"] * df["int_rate"].fillna(0)
    df["carries"] = (df["carry_share"] * df["team_carries"]).fillna(0)
    df["rushing_yards"] = df["carries"] * df["ypc"].fillna(0)
    df["rushing_tds"] = df["carries"] * df["rush_td_rate"].fillna(0)
    df["targets"] = (df["target_share"] * df["team_targets"]).fillna(0)
    df["receptions"] = df["targets"] * df["catch_rate"].fillna(0)
    df["receiving_yards"] = df["targets"] * df["ypt"].fillna(0)
    df["receiving_tds"] = df["targets"] * df["rec_td_rate"].fillna(0)

    # Rename expected-line columns to *_exp, then derive the per-17 line.
    per17_mult = (17.0 / df["expected_games"]).clip(upper=17 / 12)
    for col in STAT_COLS:
        df[f"{col}_exp"] = df[col]
        df[col] = df[col] * per17_mult

    for scoring, rec_value in [("std", 0.0), ("half", 0.5), ("ppr", 1.0)]:
        df[f"fpts_{scoring}_17"] = fantasy_points(df, rec_value)
    exp_view = df[[f"{c}_exp" for c in STAT_COLS]].rename(
        columns={f"{c}_exp": c for c in STAT_COLS}
    )
    for scoring, rec_value in [("std", 0.0), ("half", 0.5), ("ppr", 1.0)]:
        df[f"fpts_{scoring}_exp"] = fantasy_points(exp_view, rec_value)

    df["season"] = season
    players = df.sort_values("fpts_ppr_exp", ascending=False).reset_index(drop=True)
    return players, teams
