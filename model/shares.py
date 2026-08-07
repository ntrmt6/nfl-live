"""Step 3b — per-player carry/target/attempt share allocation within a team.

A player's raw score blends:
  - prior-season shares (last two seasons, recent-weighted)
  - snap share (stabilizes small-sample share numbers)
  - depth chart slot (typical share of a rank-N player, fit from history)
  - draft capital for rookies (typical rookie share by position/round, fit
    from history)
  - a mild age multiplier

Raw scores are normalized so each team's shares sum to exactly 1.0 per phase.
Pre-normalization sums far from 1.0 are logged as violations rather than
silently absorbed.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from model.config import DATA_VALIDATION, norm_team
from model.data_loader import load
from model.datasets import player_seasons

PRIOR_SEASON_WEIGHTS = (0.7, 0.3)  # Y-1, Y-2

# Blend weights for the raw score components. Backtested: dropping W_DEPTH to
# 0.22 traded away rank correlation (RB rho 0.65 -> 0.60 in 2025) for a
# marginal calibration gain, so the heavier depth weight stays.
W_PRIOR = 0.62   # historical shares (+ snap share)
W_DEPTH = 0.38   # depth-chart-slot prior

AGE_MULT = {
    "RB": [(24, 1.03), (26, 1.00), (27, 0.97), (28, 0.93), (29, 0.88), (99, 0.80)],
    "WR": [(23, 1.02), (29, 1.00), (30, 0.96), (31, 0.92), (99, 0.85)],
    "TE": [(24, 0.97), (31, 1.00), (99, 0.90)],
    "QB": [(99, 1.00)],
}

PHASES = {
    "carry_share": ["QB", "RB", "WR", "TE"],
    "target_share": ["RB", "WR", "TE"],
    "attempt_share": ["QB"],
}


def _age_mult(position: str, age: float) -> float:
    if pd.isna(age):
        return 1.0
    for cutoff, mult in AGE_MULT.get(position, [(99, 1.0)]):
        if age <= cutoff:
            return mult
    return 1.0


def _depth_chart(season: int) -> pd.DataFrame:
    """Per player depth rank for `season`, normalized across both nflverse
    depth-chart schemas. Old schema: week-1 regular-season listing (as known
    entering the season). New schema (2025+): latest snapshot."""
    dc = load("depth_charts", seasons=[season])
    if "pos_rank" in dc.columns:  # new schema
        dc = dc[dc["dt"] == dc["dt"].max()]
        out = dc[["gsis_id", "team", "pos_abb", "pos_rank"]].rename(
            columns={"pos_abb": "position", "pos_rank": "depth_rank"}
        )
    else:  # old schema
        dc = dc[dc["formation"] == "Offense"]
        first_week = dc["week"].min()
        dc = dc[dc["week"] == first_week]
        out = dc[["gsis_id", "club_code", "position", "depth_team"]].rename(
            columns={"club_code": "team", "depth_team": "depth_rank"}
        )
    out = out.copy()
    out["team"] = out["team"].map(norm_team)
    out["depth_rank"] = pd.to_numeric(out["depth_rank"], errors="coerce")
    out = out[out["position"].isin(["QB", "RB", "WR", "TE"])]
    # A player can appear in several formations/slots; keep his best rank.
    return (
        out.dropna(subset=["gsis_id"])
        .sort_values("depth_rank")
        .drop_duplicates(subset=["gsis_id"], keep="first")
    )


def fit_depth_rank_priors(train_seasons: list[int]) -> pd.DataFrame:
    """Typical full-season share by (position, depth rank), fit from history."""
    frames = []
    for season in train_seasons:
        try:
            dc = _depth_chart(season)
        except FileNotFoundError:
            continue
        ps = player_seasons([season])
        merged = ps.merge(
            dc[["gsis_id", "depth_rank"]], left_on="player_id", right_on="gsis_id", how="inner"
        )
        frames.append(merged)
    hist = pd.concat(frames, ignore_index=True)
    hist["rank_bucket"] = hist["depth_rank"].clip(upper=4)
    prior = (
        hist.groupby(["position", "rank_bucket"])[
            ["carry_share", "target_share", "attempt_share"]
        ]
        .mean()
        .reset_index()
        .rename(columns={
            "carry_share": "depth_carry", "target_share": "depth_target",
            "attempt_share": "depth_attempt",
        })
    )
    return prior


def fit_rookie_priors(train_seasons: list[int]) -> pd.DataFrame:
    """Typical rookie-year share by (position, draft-round bucket)."""
    ps = player_seasons(train_seasons)
    rookies = ps[ps["years_in_league"] == 0].copy()
    rookies["round_bucket"] = (
        ((pd.to_numeric(rookies["draft_number"], errors="coerce").fillna(300) - 1) // 32 + 1).clip(upper=4).astype(int)
    )
    prior = (
        rookies.groupby(["position", "round_bucket"])[
            ["carry_share", "target_share", "attempt_share"]
        ]
        .mean()
        .reset_index()
        .rename(columns={
            "carry_share": "rookie_carry", "target_share": "rookie_target",
            "attempt_share": "rookie_attempt",
        })
    )
    return prior


def _universe(season: int) -> pd.DataFrame:
    """Rostered QB/RB/WR/TE for `season` with age/draft metadata."""
    rosters = load("seasonal_rosters", seasons=[season])
    rosters = rosters[rosters["position"].isin(["QB", "RB", "WR", "TE"])]
    rosters = rosters.drop_duplicates(subset=["player_id"], keep="last")
    uni = rosters[[
        "player_id", "player_name", "position", "team", "birth_date",
        "draft_number", "entry_year",
    ]].rename(columns={"player_name": "name"}).copy()
    uni["team"] = uni["team"].map(norm_team)
    uni["age"] = season - pd.to_datetime(uni["birth_date"], errors="coerce").dt.year
    uni["is_rookie"] = uni["entry_year"] == season
    uni["round_bucket"] = (
        ((pd.to_numeric(uni["draft_number"], errors="coerce").fillna(300) - 1) // 32 + 1).clip(upper=4).astype(int)
    )
    return uni.drop(columns=["birth_date"])


def project_shares(season: int, train_through: int) -> pd.DataFrame:
    """Project per-player shares for `season` using data <= train_through."""
    train_seasons = list(range(train_through - 7, train_through + 1))
    depth_priors = fit_depth_rank_priors(train_seasons[-4:])
    rookie_priors = fit_rookie_priors(train_seasons)

    uni = _universe(season)

    # Prior shares from the two most recent seasons.
    prior = player_seasons([train_through - 1, train_through])
    w1, w2 = PRIOR_SEASON_WEIGHTS
    p1 = prior[prior.season == train_through].set_index("player_id")
    p2 = prior[prior.season == train_through - 1].set_index("player_id")
    for col in ["carry_share", "target_share", "attempt_share", "off_pct"]:
        a = uni["player_id"].map(p1[col])
        b = uni["player_id"].map(p2[col])
        blended = np.where(
            a.notna() & b.notna(), w1 * a.fillna(0) + w2 * b.fillna(0),
            np.where(a.notna(), a.fillna(0), b.fillna(0)),
        )
        uni[f"prior_{col}"] = np.where(a.isna() & b.isna(), np.nan, blended)

    dc = _depth_chart(season)
    uni = uni.merge(dc[["gsis_id", "depth_rank"]], left_on="player_id", right_on="gsis_id", how="left")
    uni["rank_bucket"] = uni["depth_rank"].fillna(5).clip(upper=4).astype(int)
    uni = uni.merge(depth_priors, on=["position", "rank_bucket"], how="left")
    uni = uni.merge(rookie_priors, on=["position", "round_bucket"], how="left")

    violations: list[str] = []
    for phase, (share_col, depth_col, rookie_col) in {
        "carry": ("prior_carry_share", "depth_carry", "rookie_carry"),
        "target": ("prior_target_share", "depth_target", "rookie_target"),
        "attempt": ("prior_attempt_share", "depth_attempt", "rookie_attempt"),
    }.items():
        positions = PHASES[f"{'carry' if phase == 'carry' else phase}_share"]
        in_phase = uni["position"].isin(positions)

        # Snap share nudges the historical component for pass-catchers whose
        # raw share undersells their on-field role.
        prior_component = uni[share_col]
        if phase == "target":
            snap = uni["prior_off_pct"]
            boost = (snap * 0.12).where(snap.notna() & prior_component.notna(), 0)
            prior_component = prior_component + 0.3 * (boost - prior_component).clip(lower=0)

        depth_component = uni[depth_col].fillna(0)
        veteran_score = np.where(
            prior_component.notna(),
            W_PRIOR * prior_component.fillna(0) + W_DEPTH * depth_component,
            depth_component * 0.55,  # no NFL history and not a rookie: deep reserve
        )
        rookie_score = uni[rookie_col].fillna(0)
        score = np.where(uni["is_rookie"], np.maximum(rookie_score, depth_component * 0.6), veteran_score)
        age_mults = np.array([
            _age_mult(p, a) for p, a in zip(uni["position"], uni["age"])
        ])
        score = np.clip(score * age_mults, 0, None)
        score = np.where(in_phase, score, 0.0)
        uni[f"raw_{phase}"] = score

        sums = uni.groupby("team")[f"raw_{phase}"].transform("sum")
        team_sums = uni.groupby("team")[f"raw_{phase}"].sum()
        for team, s in team_sums.items():
            if not 0.8 <= s <= 1.25:
                violations.append(f"{season} {team} {phase}: pre-normalization sum {s:.3f}")
        uni[f"{phase}_share"] = np.where(sums > 0, uni[f"raw_{phase}"] / sums, 0.0)

    if violations:
        DATA_VALIDATION.mkdir(parents=True, exist_ok=True)
        log_path = DATA_VALIDATION / "share_violations.log"
        with open(log_path, "a") as fh:
            fh.write("\n".join(violations) + "\n")
        print(f"  [shares] {len(violations)} pre-normalization sum violations -> {log_path}")

    keep = uni[[
        "player_id", "name", "position", "team", "age", "is_rookie",
        "draft_number", "depth_rank", "carry_share", "target_share",
        "attempt_share", "prior_carry_share", "prior_target_share",
        "prior_attempt_share", "prior_off_pct",
    ]].copy()
    return keep
