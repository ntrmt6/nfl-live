export interface InjuredPlayer {
  name: string
  position: string
  status: string
  details?: string
}

const TEAM_ESPN_IDS: Record<string, number> = {
  ARI: 22, ATL: 1,  BAL: 33, BUF: 2,  CAR: 29, CHI: 3,  CIN: 4,  CLE: 5,
  DAL: 6,  DEN: 7,  DET: 8,  GB: 9,   HOU: 34, IND: 11, JAX: 30, KC: 12,
  LV: 13,  LAC: 24, LAR: 14, MIA: 15, MIN: 16, NE: 17,  NO: 18,  NYG: 19,
  NYJ: 20, PHI: 21, PIT: 23, SF: 25,  SEA: 26, TB: 27,  TEN: 10, WAS: 28,
}

export async function fetchTeamInjuries(teamAbbr: string): Promise<InjuredPlayer[]> {
  try {
    const espnId = TEAM_ESPN_IDS[teamAbbr?.toUpperCase()]
    if (!espnId) return []

    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${espnId}/injuries`
    const res = await fetch(url, { next: { revalidate: 7200 } })
    if (!res.ok) return []

    const data = await res.json()
    const injuries: InjuredPlayer[] = []

    const items = data.injuries || data.items || []
    for (const item of items) {
      const athlete = item.athlete || item
      const name = athlete.displayName || athlete.fullName || athlete.name || ""
      const position = athlete.position?.abbreviation || athlete.position?.name || ""
      const status = item.status || item.type?.description || ""
      const details = item.longComment || item.shortComment || item.comment || undefined

      if (name) {
        injuries.push({ name, position, status, details })
      }
    }

    return injuries
  } catch {
    return []
  }
}
