"""Step 3e — expected games played.

Availability is projected from a player's own recent games-played history
shrunk toward a positional base rate (fit from the 17-game era in the cache).
Both a 17-game and an expected-games stat line are published; the site labels
them explicitly. Games missed conflates injury with benching/healthy scratches
— documented as a known limitation in /methodology.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from model.datasets import player_seasons

SEVENTEEN_GAME_ERA_START = 2021
K_SEASONS = 1.5      # pseudo-seasons of positional base blended into each player
MIN_SHARE = 0.05     # role threshold for informing base rates
FLOOR, CEIL = 8.0, 16.5


def fit_position_base(train_through: int) -> dict[str, float]:
    seasons = [s for s in range(SEVENTEEN_GAME_ERA_START, train_through + 1)]
    ps = player_seasons(seasons)
    role = ps[
        (ps["carry_share"].fillna(0) > MIN_SHARE)
        | (ps["target_share"].fillna(0) > MIN_SHARE)
        | (ps["attempt_share"].fillna(0) > MIN_SHARE)
    ]
    return role.groupby("position")["games"].mean().to_dict()


def project_games(train_through: int, base: dict[str, float]) -> pd.DataFrame:
    """Expected games for every player seen in the last three seasons."""
    hist = player_seasons([train_through - 2, train_through - 1, train_through])
    per_player = hist.groupby("player_id").agg(
        position=("position", "last"),
        seasons_seen=("season", "nunique"),
        mean_games=("games", "mean"),
    ).reset_index()

    pos_base = per_player["position"].map(base).fillna(15.0)
    n = per_player["seasons_seen"]
    expected = (n * per_player["mean_games"] + K_SEASONS * pos_base) / (n + K_SEASONS)
    per_player["expected_games"] = expected.clip(FLOOR, CEIL)
    return per_player[["player_id", "expected_games"]]
