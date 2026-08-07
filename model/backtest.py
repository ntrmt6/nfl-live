"""Step 4 — backtest: train through N-1, predict season N, score against actuals.

For each held-out season the model's expected-games PPR projection is compared
to what actually happened, alongside a naive baseline ("last season repeats":
the player's season N-1 PPR total, 0 if he had none). Metrics per position:
MAE, RMSE, Spearman rank correlation, and calibration by projection tier.
Positions where the model loses to the baseline are flagged loudly, not hidden.

Known caveats, stated up front:
  - Season-N rosters/depth charts are end-of-season state, not strictly
    preseason-known (nflverse has no as-of-date snapshots for older years).
    This mildly flatters both the model AND the baseline evaluation universe.
  - The 2025 depth chart file is a single late-season snapshot (new schema).

Usage: python -m model.backtest [--seasons 2023 2024 2025]
"""

from __future__ import annotations

import argparse
import json

import numpy as np
import pandas as pd

from model.combine import build_projections, fantasy_points
from model.config import DATA_VALIDATION
from model.datasets import player_seasons

TOP_K = {"QB": 40, "RB": 70, "WR": 100, "TE": 40}
TIERS = [(0, 50), (50, 100), (100, 150), (150, 200), (200, 250), (250, 10_000)]


def _spearman(a: pd.Series, b: pd.Series) -> float:
    ra, rb = a.rank(), b.rank()
    if ra.std() == 0 or rb.std() == 0:
        return float("nan")
    return float(np.corrcoef(ra, rb)[0, 1])


def backtest_season(season: int) -> dict:
    players, _ = build_projections(season, train_through=season - 1)
    players = players.set_index("player_id")

    actual = player_seasons([season]).set_index("player_id")
    actual["actual_ppr"] = fantasy_points(actual, rec_value=1.0)

    prior = player_seasons([season - 1]).set_index("player_id")
    prior["baseline_ppr"] = fantasy_points(prior, rec_value=1.0)

    result: dict = {"season": season, "positions": {}, "calibration": []}

    for pos, k in TOP_K.items():
        proj_pos = players[players.position == pos]
        act_pos = actual[actual.position == pos]
        universe = set(proj_pos.nlargest(k, "fpts_ppr_exp").index) | set(
            act_pos.nlargest(k, "actual_ppr").index
        )
        idx = pd.Index(sorted(universe))

        proj = proj_pos["fpts_ppr_exp"].reindex(idx).fillna(0)
        act = act_pos["actual_ppr"].reindex(idx).fillna(0)
        base = prior["baseline_ppr"].reindex(idx).fillna(0)

        err_model = proj - act
        err_base = base - act
        pos_result = {
            "n": int(len(idx)),
            "model_mae": float(err_model.abs().mean()),
            "model_rmse": float(np.sqrt((err_model ** 2).mean())),
            "model_spearman": _spearman(proj, act),
            "baseline_mae": float(err_base.abs().mean()),
            "baseline_rmse": float(np.sqrt((err_base ** 2).mean())),
            "baseline_spearman": _spearman(base, act),
        }
        pos_result["beats_baseline_mae"] = pos_result["model_mae"] < pos_result["baseline_mae"]
        result["positions"][pos] = pos_result

    # Calibration by projection tier, all positions pooled over the same universes.
    frames = []
    for pos, k in TOP_K.items():
        proj_pos = players[players.position == pos]
        universe = set(proj_pos.nlargest(k, "fpts_ppr_exp").index) | set(
            actual[actual.position == pos].nlargest(k, "actual_ppr").index
        )
        idx = pd.Index(sorted(universe))
        frames.append(pd.DataFrame({
            "proj": proj_pos["fpts_ppr_exp"].reindex(idx).fillna(0),
            "act": actual[actual.position == pos]["actual_ppr"].reindex(idx).fillna(0),
        }))
    pooled = pd.concat(frames)
    for lo, hi in TIERS:
        band = pooled[(pooled["proj"] >= lo) & (pooled["proj"] < hi)]
        if len(band) == 0:
            continue
        result["calibration"].append({
            "tier": f"{lo}-{hi if hi < 10_000 else '+'}",
            "n": int(len(band)),
            "mean_projected": float(band["proj"].mean()),
            "mean_actual": float(band["act"].mean()),
        })
    return result


def print_summary(results: list[dict]) -> None:
    lines: list[str] = []
    out = lines.append
    out("================ BACKTEST SUMMARY (PPR, expected-games line) ================")
    warnings = []
    for res in results:
        out(f"\n--- {res['season']} ---")
        out(f"{'pos':4} {'n':>4} {'MAE':>7} {'RMSE':>7} {'rho':>6} | {'base MAE':>8} {'base rho':>8}  verdict")
        for pos, m in res["positions"].items():
            verdict = "beats baseline" if m["beats_baseline_mae"] else "WORSE THAN BASELINE"
            if not m["beats_baseline_mae"]:
                warnings.append(f"{res['season']} {pos}: model MAE {m['model_mae']:.1f} vs baseline {m['baseline_mae']:.1f}")
            if m["model_spearman"] < m["baseline_spearman"]:
                warnings.append(
                    f"{res['season']} {pos}: baseline ranks better (rho {m['baseline_spearman']:.3f} vs model {m['model_spearman']:.3f})"
                )
            out(f"{pos:4} {m['n']:>4} {m['model_mae']:>7.1f} {m['model_rmse']:>7.1f} "
                f"{m['model_spearman']:>6.3f} | {m['baseline_mae']:>8.1f} {m['baseline_spearman']:>8.3f}  {verdict}")
        out("  calibration (projected tier -> mean projected / mean actual):")
        for c in res["calibration"]:
            out(f"    {c['tier']:>9}: n={c['n']:>3}  proj {c['mean_projected']:>6.1f}  actual {c['mean_actual']:>6.1f}")
    if warnings:
        out("\n!! CASES WHERE THE NAIVE 'LAST SEASON REPEATS' BASELINE WINS:")
        for w in warnings:
            out("   " + w)
    else:
        out("\nAll positions beat the naive baseline on MAE and rank correlation in every season.")

    text = "\n".join(lines)
    print("\n" + text)
    summary_path = DATA_VALIDATION / "summary.md"
    summary_path.write_text("```\n" + text + "\n```\n")
    print(f"\nwrote {summary_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seasons", nargs="+", type=int, default=[2023, 2024, 2025])
    args = parser.parse_args()

    DATA_VALIDATION.mkdir(parents=True, exist_ok=True)
    results = []
    for season in args.seasons:
        print(f"==> backtesting {season} (train through {season - 1})...", flush=True)
        res = backtest_season(season)
        results.append(res)
        out = DATA_VALIDATION / f"backtest_{season}.json"
        out.write_text(json.dumps(res, indent=2))
        print(f"    wrote {out}")

    print_summary(results)


if __name__ == "__main__":
    main()
