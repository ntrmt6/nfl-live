"""Step 3a — team volume: plays, pass rate over expected, neutral pace.

Projected from the last three seasons, recent-heavy, as deviations from the
league mean. A team keeps only part of its historical deviation; a team whose
head coach changed (playcaller-continuity proxy — the data has no OC feed)
keeps much less. Every retained-deviation factor lives in KEEP so the backtest
can interrogate the assumptions.
"""

from __future__ import annotations

import pandas as pd

from model.config import SITE_TEAMS
from model.datasets import head_coaches, team_season_volume

SEASON_WEIGHTS = [0.5, 0.3, 0.2]  # Y-1, Y-2, Y-3

# Fraction of a team's deviation from league mean that survives into the
# projection, by metric and coach continuity.
KEEP = {
    "plays_per_game": {"same": 0.55, "new": 0.30},
    "proe":           {"same": 0.70, "new": 0.35},
    "neutral_pace":   {"same": 0.60, "new": 0.30},
    "pass_rate":      {"same": 0.65, "new": 0.35},
}

METRICS = list(KEEP)


def project_team_volume(season: int) -> pd.DataFrame:
    """Project team volume for `season` using only seasons < `season`."""
    history = team_season_volume([season - 3, season - 2, season - 1])
    coaches = head_coaches([season - 1, season])

    prev = coaches[coaches.season == season - 1].set_index("team")["coach"]
    curr = coaches[coaches.season == season].set_index("team")["coach"]

    league_means = history.groupby("season")[METRICS].mean()

    rows = []
    for team in SITE_TEAMS:
        hist = history[history.team == team].set_index("season")
        continuity = "same"
        if team in curr.index and team in prev.index and curr[team] != prev[team]:
            continuity = "new"

        row: dict = {"team": team, "season": season, "coach_continuity": continuity,
                     "coach": curr.get(team)}
        for metric in METRICS:
            dev_sum, w_sum = 0.0, 0.0
            for lag, weight in enumerate(SEASON_WEIGHTS, start=1):
                yr = season - lag
                if yr in hist.index and yr in league_means.index:
                    dev_sum += weight * (hist.loc[yr, metric] - league_means.loc[yr, metric])
                    w_sum += weight
            latest_mean = league_means.iloc[-1][metric]
            dev = (dev_sum / w_sum) if w_sum else 0.0
            row[metric] = latest_mean + dev * KEEP[metric][continuity]
        rows.append(row)

    df = pd.DataFrame(rows)
    df["plays"] = df["plays_per_game"] * 17
    return df
