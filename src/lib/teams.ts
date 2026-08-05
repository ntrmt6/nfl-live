export interface TeamInfo {
  name: string;
  abbr: string;
  color: string;
  colorTo: string;
}

// Primary/secondary brand colors used purely as accent gradients on cards —
// not official marks, just color references for the given team abbreviation.
export const TEAMS: Record<string, TeamInfo> = {
  ARI: { name: "Arizona Cardinals", abbr: "ARI", color: "#97233F", colorTo: "#000000" },
  ATL: { name: "Atlanta Falcons", abbr: "ATL", color: "#A71930", colorTo: "#000000" },
  BAL: { name: "Baltimore Ravens", abbr: "BAL", color: "#241773", colorTo: "#000000" },
  BUF: { name: "Buffalo Bills", abbr: "BUF", color: "#00338D", colorTo: "#C60C30" },
  CAR: { name: "Carolina Panthers", abbr: "CAR", color: "#0085CA", colorTo: "#101820" },
  CHI: { name: "Chicago Bears", abbr: "CHI", color: "#0B162A", colorTo: "#C83803" },
  CIN: { name: "Cincinnati Bengals", abbr: "CIN", color: "#FB4F14", colorTo: "#000000" },
  CLE: { name: "Cleveland Browns", abbr: "CLE", color: "#311D00", colorTo: "#FF3C00" },
  DAL: { name: "Dallas Cowboys", abbr: "DAL", color: "#041E42", colorTo: "#869397" },
  DEN: { name: "Denver Broncos", abbr: "DEN", color: "#FB4F14", colorTo: "#002244" },
  DET: { name: "Detroit Lions", abbr: "DET", color: "#0076B6", colorTo: "#B0B7BC" },
  GB:  { name: "Green Bay Packers", abbr: "GB", color: "#203731", colorTo: "#FFB612" },
  HOU: { name: "Houston Texans", abbr: "HOU", color: "#03202F", colorTo: "#A71930" },
  IND: { name: "Indianapolis Colts", abbr: "IND", color: "#002C5F", colorTo: "#A2AAAD" },
  JAX: { name: "Jacksonville Jaguars", abbr: "JAX", color: "#101820", colorTo: "#D7A22A" },
  KC:  { name: "Kansas City Chiefs", abbr: "KC", color: "#E31837", colorTo: "#FFB81C" },
  LV:  { name: "Las Vegas Raiders", abbr: "LV", color: "#000000", colorTo: "#A5ACAF" },
  LAC: { name: "Los Angeles Chargers", abbr: "LAC", color: "#0080C6", colorTo: "#FFC20E" },
  LAR: { name: "Los Angeles Rams", abbr: "LAR", color: "#003594", colorTo: "#FFA300" },
  MIA: { name: "Miami Dolphins", abbr: "MIA", color: "#008E97", colorTo: "#FC4C02" },
  MIN: { name: "Minnesota Vikings", abbr: "MIN", color: "#4F2683", colorTo: "#FFC62F" },
  NE:  { name: "New England Patriots", abbr: "NE", color: "#002244", colorTo: "#C60C30" },
  NO:  { name: "New Orleans Saints", abbr: "NO", color: "#D3BC8D", colorTo: "#101820" },
  NYG: { name: "New York Giants", abbr: "NYG", color: "#0B2265", colorTo: "#A71930" },
  NYJ: { name: "New York Jets", abbr: "NYJ", color: "#125740", colorTo: "#000000" },
  PHI: { name: "Philadelphia Eagles", abbr: "PHI", color: "#004C54", colorTo: "#A5ACAF" },
  PIT: { name: "Pittsburgh Steelers", abbr: "PIT", color: "#FFB612", colorTo: "#101820" },
  SF:  { name: "San Francisco 49ers", abbr: "SF", color: "#AA0000", colorTo: "#B3995D" },
  SEA: { name: "Seattle Seahawks", abbr: "SEA", color: "#002244", colorTo: "#69BE28" },
  TB:  { name: "Tampa Bay Buccaneers", abbr: "TB", color: "#D50A0A", colorTo: "#34302B" },
  TEN: { name: "Tennessee Titans", abbr: "TEN", color: "#0C2340", colorTo: "#4B92DB" },
  WAS: { name: "Washington Commanders", abbr: "WAS", color: "#5A1414", colorTo: "#FFB612" },
};

export function getTeam(abbr: string): TeamInfo {
  return (
    TEAMS[abbr?.toUpperCase()] || {
      name: abbr,
      abbr,
      color: "#39D2FF",
      colorTo: "#39FF88",
    }
  );
}

export const TEAM_LIST = Object.values(TEAMS);

export function teamToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function getTeamBySlug(slug: string): TeamInfo | null {
  return TEAM_LIST.find((t) => teamToSlug(t.name) === slug) ?? null;
}

export function extractTeamsFromText(...texts: string[]): string[] {
  const combined = texts.join(" ").toLowerCase();
  const found: string[] = [];
  for (const team of TEAM_LIST) {
    if (combined.includes(team.name.toLowerCase())) {
      found.push(team.abbr);
    }
  }
  return found;
}
