"""Shared constants for the projection model pipeline."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = ROOT / "data" / "raw"
DATA_PROCESSED = ROOT / "data" / "processed"
DATA_VALIDATION = ROOT / "data" / "validation"

# Historical window pulled from nflverse. 2025 is the most recent completed
# season (the 2026 season hasn't kicked off yet as of this pipeline's writing).
SEASONS = list(range(2015, 2026))
LATEST_COMPLETED_SEASON = 2025
PROJECTION_SEASON = 2026

# A season that ended more than this many days ago is immutable — never refetch.
# The in-progress/most-recent season is refreshed when its cache is older than this.
STALE_AFTER_DAYS = 1

# nflverse team codes -> site codes (src/lib/teams.ts). nflverse uses "LA" for
# the Rams; franchise moves are collapsed onto the current identity so team
# history carries across relocations.
TEAM_CODE_TO_SITE = {
    "LA": "LAR",
    "STL": "LAR",
    "SD": "LAC",
    "OAK": "LV",
}

SITE_TEAMS = [
    "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN",
    "DET", "GB", "HOU", "IND", "JAX", "KC", "LV", "LAC", "LAR", "MIA",
    "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SF", "SEA", "TB",
    "TEN", "WAS",
]


def norm_team(code: str) -> str:
    """Normalize any nflverse team code to the site's canonical code."""
    if not isinstance(code, str):
        return code
    return TEAM_CODE_TO_SITE.get(code, code)
