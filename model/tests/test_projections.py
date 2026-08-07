"""Model invariants, run against the cached data (offline).

Covers the spec's required checks: share sums, no negative/null projections,
valid team codes, and a small-fixture run of the backtest harness.
"""

import numpy as np
import pandas as pd
import pytest

from model.combine import STAT_COLS, build_projections, fantasy_points
from model.config import PROJECTION_SEASON, SITE_TEAMS


@pytest.fixture(scope="module")
def projections():
    players, teams = build_projections(PROJECTION_SEASON, train_through=PROJECTION_SEASON - 1)
    return players, teams


def test_shares_sum_to_one(projections):
    players, _ = projections
    for phase in ("carry_share", "target_share", "attempt_share"):
        sums = players.groupby("team")[phase].sum()
        assert ((sums - 1.0).abs() < 1e-6).all(), f"{phase} sums off: {sums[(sums - 1).abs() >= 1e-6]}"


def test_no_negative_or_null_projections(projections):
    players, _ = projections
    cols = STAT_COLS + [f"{c}_exp" for c in STAT_COLS] + [
        f"fpts_{s}_{v}" for s in ("std", "half", "ppr") for v in ("17", "exp")
    ]
    for col in cols:
        assert players[col].notna().all(), f"nulls in {col}"
        assert (players[col] >= 0).all() or col.startswith("fpts"), f"negatives in {col}"


def test_team_codes_valid(projections):
    players, teams = projections
    assert set(teams["team"]) == set(SITE_TEAMS)
    assert set(players["team"]).issubset(set(SITE_TEAMS))


def test_expected_never_exceeds_per17(projections):
    players, _ = projections
    for col in STAT_COLS:
        assert (players[f"{col}_exp"] <= players[col] + 1e-9).all(), col


def test_expected_games_bounds(projections):
    players, _ = projections
    assert players["expected_games"].between(8, 17).all()


def test_fantasy_points_formula():
    df = pd.DataFrame([{
        "passing_yards": 250, "passing_tds": 2, "interceptions": 1,
        "rushing_yards": 50, "receiving_yards": 50, "rushing_tds": 1,
        "receiving_tds": 0, "receptions": 4,
    }])
    std = fantasy_points(df, 0.0).iloc[0]
    ppr = fantasy_points(df, 1.0).iloc[0]
    assert std == pytest.approx(250 / 25 + 8 - 2 + 100 / 10 + 6)
    assert ppr == pytest.approx(std + 4)


def test_backtest_harness_small_fixture():
    """The harness runs end-to-end on a single season and emits sane metrics."""
    from model.backtest import backtest_season

    res = backtest_season(2025)
    assert set(res["positions"]) == {"QB", "RB", "WR", "TE"}
    for pos, m in res["positions"].items():
        assert m["n"] > 30, pos
        assert 0 < m["model_mae"] < 150, pos
        assert -1 <= m["model_spearman"] <= 1, pos
    assert len(res["calibration"]) >= 4
