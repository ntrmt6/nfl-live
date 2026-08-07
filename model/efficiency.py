"""Step 3c — per-player efficiency with empirical Bayes shrinkage.

Every rate is shrunk toward its positional mean with a sample-size-dependent
weight: shrunk = (n * observed + k * mu) / (n + k). The shrinkage constant k is
estimated from the data by method of moments — k = sigma2_within / tau2, where
tau2 is the between-player variance of true rates. Noisy stats (TD rates)
naturally get large k and shrink hard; stable stats (catch rate) keep more of
the observation. k is floored so no stat ever goes unshrunk.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from model.datasets import player_seasons

# stat -> (numerator, denominator, positions)
RATE_DEFS = {
    "ypc":          ("rushing_yards", "carries", ["RB", "WR", "QB"]),
    "ypt":          ("receiving_yards", "targets", ["RB", "WR", "TE"]),
    "catch_rate":   ("receptions", "targets", ["RB", "WR", "TE"]),
    "rush_td_rate": ("rushing_tds", "carries", ["RB", "WR", "QB"]),
    "rec_td_rate":  ("receiving_tds", "targets", ["RB", "WR", "TE"]),
    "ypa":          ("passing_yards", "attempts", ["QB"]),
    "comp_rate":    ("completions", "attempts", ["QB"]),
    "pass_td_rate": ("passing_tds", "attempts", ["QB"]),
    "int_rate":     ("interceptions", "attempts", ["QB"]),
}

MIN_N = {  # minimum denominator for a player-season to inform the priors
    "ypc": 25, "ypt": 20, "catch_rate": 20, "rush_td_rate": 25, "rec_td_rate": 20,
    "ypa": 100, "comp_rate": 100, "pass_td_rate": 100, "int_rate": 100,
}

# Per-trial variance for yardage stats (estimated once from play-by-play:
# rush attempts var ~= 43, targets var ~= 93, pass attempts var ~= 83).
SIGMA2_WITHIN = {"ypc": 43.0, "ypt": 93.0, "ypa": 83.0}

K_FLOOR = 20.0
PRIOR_SEASON_DECAY = 0.6  # weight on Y-2 counts vs Y-1


def _fit_k(obs: pd.Series, n: pd.Series, sigma2_within: pd.Series) -> float:
    """Method-of-moments shrinkage constant."""
    var_obs = float(np.var(obs, ddof=1))
    noise = float((sigma2_within / n).mean())
    tau2 = max(var_obs - noise, 1e-6)
    k = float(sigma2_within.mean() / tau2)
    return max(k, K_FLOOR)


def fit_priors(train_seasons: list[int]) -> dict:
    """Positional means and shrinkage constants for every rate stat."""
    ps = player_seasons(train_seasons)
    priors: dict = {}
    for stat, (num, den, positions) in RATE_DEFS.items():
        sub = ps[(ps["position"].isin(positions)) & (ps[den] >= MIN_N[stat])].copy()
        sub["rate"] = sub[num] / sub[den]
        for pos in positions:
            pos_sub = sub[sub["position"] == pos]
            if len(pos_sub) < 20:
                continue
            mu = float(np.average(pos_sub["rate"], weights=pos_sub[den]))
            if stat in SIGMA2_WITHIN:
                s2 = pd.Series(SIGMA2_WITHIN[stat], index=pos_sub.index)
            else:
                s2 = pd.Series(mu * (1 - mu), index=pos_sub.index)
            k = _fit_k(pos_sub["rate"], pos_sub[den], s2)
            priors[(stat, pos)] = {"mu": mu, "k": k, "n_fit": len(pos_sub)}
    return priors


def project_efficiency(train_through: int, priors: dict) -> pd.DataFrame:
    """Shrunk per-player rates using the last two seasons of observations."""
    recent = player_seasons([train_through - 1, train_through])
    y1 = recent[recent.season == train_through].set_index("player_id")
    y2 = recent[recent.season == train_through - 1].set_index("player_id")

    players = recent[["player_id", "position"]].drop_duplicates("player_id").set_index("player_id")
    out = players.copy()

    for stat, (num, den, positions) in RATE_DEFS.items():
        num_pooled = y1[num].reindex(players.index).fillna(0) + \
            PRIOR_SEASON_DECAY * y2[num].reindex(players.index).fillna(0)
        den_pooled = y1[den].reindex(players.index).fillna(0) + \
            PRIOR_SEASON_DECAY * y2[den].reindex(players.index).fillna(0)

        mus = players["position"].map(lambda p: priors.get((stat, p), {}).get("mu", np.nan))
        ks = players["position"].map(lambda p: priors.get((stat, p), {}).get("k", np.nan))

        shrunk = (num_pooled + ks * mus) / (den_pooled + ks)
        out[stat] = np.where(players["position"].isin(positions), shrunk, np.nan)
        out[f"{stat}_n"] = den_pooled

    return out.reset_index()


def league_rate(priors: dict, stat: str, position: str) -> float:
    return priors.get((stat, position), {}).get("mu", np.nan)
