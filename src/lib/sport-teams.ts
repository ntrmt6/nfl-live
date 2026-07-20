// Team ratings per sport league (ESPN abbreviations → rating data)
// Rating: 0-100 historical strength; ppg = points/goals per game; papg = conceded per game

export interface SportTeamInfo {
  name: string;
  rating: number;
  ppg: number;
  papg: number;
  homeWinPct: number; // 0-1
}

const DEFAULT: SportTeamInfo = { name: "Unknown", rating: 70, ppg: 0, papg: 0, homeWinPct: 0.55 };

// ── NBA ────────────────────────────────────────────────────────
const NBA: Record<string, SportTeamInfo> = {
  BOS: { name: "Boston Celtics",         rating: 95, ppg: 120.4, papg: 110.6, homeWinPct: 0.72 },
  GSW: { name: "Golden State Warriors",  rating: 92, ppg: 118.1, papg: 113.2, homeWinPct: 0.69 },
  LAL: { name: "Los Angeles Lakers",     rating: 88, ppg: 115.5, papg: 115.0, homeWinPct: 0.63 },
  MIL: { name: "Milwaukee Bucks",        rating: 90, ppg: 118.7, papg: 113.8, homeWinPct: 0.67 },
  PHX: { name: "Phoenix Suns",           rating: 86, ppg: 116.8, papg: 115.9, homeWinPct: 0.62 },
  MIA: { name: "Miami Heat",             rating: 84, ppg: 111.2, papg: 111.5, homeWinPct: 0.62 },
  DAL: { name: "Dallas Mavericks",       rating: 85, ppg: 116.5, papg: 116.0, homeWinPct: 0.61 },
  PHI: { name: "Philadelphia 76ers",     rating: 84, ppg: 113.4, papg: 113.8, homeWinPct: 0.60 },
  DEN: { name: "Denver Nuggets",         rating: 89, ppg: 114.6, papg: 112.9, homeWinPct: 0.70 },
  MEM: { name: "Memphis Grizzlies",      rating: 82, ppg: 115.2, papg: 116.4, homeWinPct: 0.60 },
  SAC: { name: "Sacramento Kings",       rating: 78, ppg: 118.6, papg: 119.0, homeWinPct: 0.57 },
  CLE: { name: "Cleveland Cavaliers",    rating: 80, ppg: 110.3, papg: 110.1, homeWinPct: 0.60 },
  MIN: { name: "Minnesota Timberwolves", rating: 82, ppg: 112.8, papg: 111.4, homeWinPct: 0.58 },
  OKC: { name: "Oklahoma City Thunder",  rating: 83, ppg: 117.9, papg: 113.6, homeWinPct: 0.63 },
  IND: { name: "Indiana Pacers",         rating: 78, ppg: 121.4, papg: 121.8, homeWinPct: 0.56 },
  NYK: { name: "New York Knicks",        rating: 80, ppg: 113.2, papg: 112.3, homeWinPct: 0.60 },
  LAC: { name: "LA Clippers",            rating: 80, ppg: 113.0, papg: 114.2, homeWinPct: 0.58 },
  ATL: { name: "Atlanta Hawks",          rating: 75, ppg: 117.5, papg: 120.0, homeWinPct: 0.53 },
  BKN: { name: "Brooklyn Nets",          rating: 72, ppg: 112.5, papg: 116.8, homeWinPct: 0.50 },
  TOR: { name: "Toronto Raptors",        rating: 75, ppg: 112.8, papg: 116.2, homeWinPct: 0.54 },
  NOP: { name: "New Orleans Pelicans",   rating: 76, ppg: 114.0, papg: 117.5, homeWinPct: 0.54 },
  POR: { name: "Portland Trail Blazers", rating: 68, ppg: 109.8, papg: 118.3, homeWinPct: 0.50 },
  SAS: { name: "San Antonio Spurs",      rating: 65, ppg: 108.2, papg: 119.5, homeWinPct: 0.47 },
  HOU: { name: "Houston Rockets",        rating: 71, ppg: 113.5, papg: 117.8, homeWinPct: 0.51 },
  CHA: { name: "Charlotte Hornets",      rating: 65, ppg: 111.3, papg: 117.9, homeWinPct: 0.48 },
  WAS: { name: "Washington Wizards",     rating: 60, ppg: 108.5, papg: 120.1, homeWinPct: 0.44 },
  UTA: { name: "Utah Jazz",              rating: 68, ppg: 113.8, papg: 118.5, homeWinPct: 0.50 },
  DET: { name: "Detroit Pistons",        rating: 62, ppg: 108.0, papg: 119.8, homeWinPct: 0.44 },
  ORL: { name: "Orlando Magic",          rating: 74, ppg: 110.5, papg: 112.4, homeWinPct: 0.57 },
  CHI: { name: "Chicago Bulls",          rating: 72, ppg: 111.2, papg: 114.6, homeWinPct: 0.53 },
};

// ── NHL ────────────────────────────────────────────────────────
const NHL: Record<string, SportTeamInfo> = {
  COL: { name: "Colorado Avalanche",      rating: 92, ppg: 3.5, papg: 2.7, homeWinPct: 0.67 },
  TBL: { name: "Tampa Bay Lightning",     rating: 90, ppg: 3.4, papg: 2.8, homeWinPct: 0.65 },
  BOS: { name: "Boston Bruins",           rating: 89, ppg: 3.3, papg: 2.7, homeWinPct: 0.64 },
  NYR: { name: "New York Rangers",        rating: 86, ppg: 3.2, papg: 2.8, homeWinPct: 0.62 },
  CAR: { name: "Carolina Hurricanes",     rating: 87, ppg: 3.3, papg: 2.7, homeWinPct: 0.63 },
  FLA: { name: "Florida Panthers",        rating: 88, ppg: 3.4, papg: 2.8, homeWinPct: 0.63 },
  VGK: { name: "Vegas Golden Knights",    rating: 85, ppg: 3.2, papg: 2.9, homeWinPct: 0.62 },
  DAL: { name: "Dallas Stars",            rating: 84, ppg: 3.1, papg: 2.9, homeWinPct: 0.61 },
  EDM: { name: "Edmonton Oilers",         rating: 85, ppg: 3.5, papg: 3.1, homeWinPct: 0.60 },
  MIN: { name: "Minnesota Wild",          rating: 80, ppg: 3.0, papg: 2.9, homeWinPct: 0.58 },
  TOR: { name: "Toronto Maple Leafs",     rating: 83, ppg: 3.3, papg: 3.1, homeWinPct: 0.59 },
  PIT: { name: "Pittsburgh Penguins",     rating: 80, ppg: 3.1, papg: 3.1, homeWinPct: 0.57 },
  WSH: { name: "Washington Capitals",     rating: 79, ppg: 3.0, papg: 3.0, homeWinPct: 0.56 },
  STL: { name: "St. Louis Blues",         rating: 80, ppg: 3.0, papg: 2.9, homeWinPct: 0.57 },
  CGY: { name: "Calgary Flames",          rating: 78, ppg: 3.0, papg: 3.0, homeWinPct: 0.55 },
  NSH: { name: "Nashville Predators",     rating: 76, ppg: 2.9, papg: 3.1, homeWinPct: 0.54 },
  SEA: { name: "Seattle Kraken",          rating: 77, ppg: 2.9, papg: 3.0, homeWinPct: 0.55 },
  ANA: { name: "Anaheim Ducks",           rating: 62, ppg: 2.5, papg: 3.5, homeWinPct: 0.44 },
  CBJ: { name: "Columbus Blue Jackets",   rating: 62, ppg: 2.5, papg: 3.5, homeWinPct: 0.44 },
  SJS: { name: "San Jose Sharks",         rating: 60, ppg: 2.4, papg: 3.6, homeWinPct: 0.43 },
};

// ── MLB ────────────────────────────────────────────────────────
const MLB: Record<string, SportTeamInfo> = {
  HOU: { name: "Houston Astros",          rating: 90, ppg: 4.8, papg: 3.6, homeWinPct: 0.63 },
  ATL: { name: "Atlanta Braves",          rating: 89, ppg: 5.0, papg: 3.8, homeWinPct: 0.62 },
  LAD: { name: "Los Angeles Dodgers",     rating: 93, ppg: 5.2, papg: 3.5, homeWinPct: 0.65 },
  NYY: { name: "New York Yankees",        rating: 88, ppg: 4.9, papg: 3.9, homeWinPct: 0.61 },
  BOS: { name: "Boston Red Sox",          rating: 83, ppg: 4.7, papg: 4.2, homeWinPct: 0.58 },
  SD:  { name: "San Diego Padres",        rating: 82, ppg: 4.3, papg: 3.9, homeWinPct: 0.57 },
  NYM: { name: "New York Mets",           rating: 80, ppg: 4.2, papg: 4.0, homeWinPct: 0.55 },
  TOR: { name: "Toronto Blue Jays",       rating: 81, ppg: 4.6, papg: 4.1, homeWinPct: 0.57 },
  SEA: { name: "Seattle Mariners",        rating: 79, ppg: 4.0, papg: 3.8, homeWinPct: 0.56 },
  MIN: { name: "Minnesota Twins",         rating: 78, ppg: 4.4, papg: 4.2, homeWinPct: 0.55 },
  TB:  { name: "Tampa Bay Rays",          rating: 84, ppg: 4.1, papg: 3.6, homeWinPct: 0.58 },
  PHI: { name: "Philadelphia Phillies",   rating: 83, ppg: 4.7, papg: 4.1, homeWinPct: 0.58 },
  MIL: { name: "Milwaukee Brewers",       rating: 80, ppg: 4.2, papg: 4.0, homeWinPct: 0.56 },
  CHC: { name: "Chicago Cubs",            rating: 76, ppg: 4.3, papg: 4.4, homeWinPct: 0.54 },
  SF:  { name: "San Francisco Giants",    rating: 77, ppg: 4.1, papg: 4.2, homeWinPct: 0.54 },
  STL: { name: "St. Louis Cardinals",     rating: 78, ppg: 4.2, papg: 4.0, homeWinPct: 0.55 },
  CLE: { name: "Cleveland Guardians",     rating: 78, ppg: 4.0, papg: 3.9, homeWinPct: 0.55 },
  TEX: { name: "Texas Rangers",           rating: 82, ppg: 4.6, papg: 4.2, homeWinPct: 0.57 },
  ARI: { name: "Arizona Diamondbacks",    rating: 79, ppg: 4.4, papg: 4.2, homeWinPct: 0.54 },
  BAL: { name: "Baltimore Orioles",       rating: 85, ppg: 4.8, papg: 4.0, homeWinPct: 0.60 },
};

// ── EPL ────────────────────────────────────────────────────────
const EPL: Record<string, SportTeamInfo> = {
  MCI: { name: "Manchester City",   rating: 96, ppg: 2.8, papg: 0.9, homeWinPct: 0.78 },
  ARS: { name: "Arsenal",           rating: 91, ppg: 2.5, papg: 1.0, homeWinPct: 0.72 },
  LIV: { name: "Liverpool",         rating: 93, ppg: 2.6, papg: 1.1, homeWinPct: 0.75 },
  MUN: { name: "Manchester United", rating: 84, ppg: 1.8, papg: 1.4, homeWinPct: 0.60 },
  CHE: { name: "Chelsea",           rating: 86, ppg: 2.0, papg: 1.3, homeWinPct: 0.63 },
  TOT: { name: "Tottenham",         rating: 82, ppg: 1.8, papg: 1.5, homeWinPct: 0.59 },
  NEW: { name: "Newcastle United",  rating: 80, ppg: 1.8, papg: 1.3, homeWinPct: 0.60 },
  AVL: { name: "Aston Villa",       rating: 80, ppg: 1.9, papg: 1.4, homeWinPct: 0.59 },
  BHA: { name: "Brighton",          rating: 78, ppg: 1.7, papg: 1.4, homeWinPct: 0.57 },
  WHU: { name: "West Ham",          rating: 74, ppg: 1.5, papg: 1.7, homeWinPct: 0.52 },
  WOL: { name: "Wolves",            rating: 70, ppg: 1.3, papg: 1.7, homeWinPct: 0.49 },
  FUL: { name: "Fulham",            rating: 70, ppg: 1.4, papg: 1.6, homeWinPct: 0.50 },
  BRE: { name: "Brentford",         rating: 72, ppg: 1.5, papg: 1.7, homeWinPct: 0.52 },
  CRY: { name: "Crystal Palace",    rating: 68, ppg: 1.2, papg: 1.6, homeWinPct: 0.48 },
  EVE: { name: "Everton",           rating: 66, ppg: 1.1, papg: 1.7, homeWinPct: 0.47 },
  NFO: { name: "Nottm Forest",      rating: 70, ppg: 1.3, papg: 1.5, homeWinPct: 0.50 },
  BOU: { name: "Bournemouth",       rating: 65, ppg: 1.2, papg: 1.8, homeWinPct: 0.46 },
  LEI: { name: "Leicester City",    rating: 74, ppg: 1.5, papg: 1.6, homeWinPct: 0.52 },
  IPS: { name: "Ipswich Town",      rating: 62, ppg: 1.0, papg: 1.9, homeWinPct: 0.44 },
  SOU: { name: "Southampton",       rating: 60, ppg: 0.9, papg: 2.1, homeWinPct: 0.42 },
};

// ── La Liga ─────────────────────────────────────────────────────
const LALIGA: Record<string, SportTeamInfo> = {
  BAR: { name: "FC Barcelona",        rating: 95, ppg: 2.9, papg: 0.9, homeWinPct: 0.80 },
  MAD: { name: "Real Madrid",         rating: 97, ppg: 2.8, papg: 0.8, homeWinPct: 0.82 },
  ATM: { name: "Atletico Madrid",     rating: 88, ppg: 2.1, papg: 1.0, homeWinPct: 0.70 },
  ATH: { name: "Athletic Club",       rating: 80, ppg: 1.8, papg: 1.3, homeWinPct: 0.61 },
  RSO: { name: "Real Sociedad",       rating: 79, ppg: 1.7, papg: 1.3, homeWinPct: 0.59 },
  VIL: { name: "Villarreal",          rating: 78, ppg: 1.7, papg: 1.4, homeWinPct: 0.58 },
  BET: { name: "Real Betis",          rating: 76, ppg: 1.6, papg: 1.5, homeWinPct: 0.56 },
  GIR: { name: "Girona",              rating: 78, ppg: 1.9, papg: 1.4, homeWinPct: 0.58 },
  SEV: { name: "Sevilla",             rating: 76, ppg: 1.5, papg: 1.5, homeWinPct: 0.56 },
  OOS: { name: "Osasuna",             rating: 68, ppg: 1.2, papg: 1.6, homeWinPct: 0.49 },
  CEL: { name: "Celta Vigo",          rating: 68, ppg: 1.3, papg: 1.7, homeWinPct: 0.49 },
  VAL: { name: "Valencia",            rating: 66, ppg: 1.1, papg: 1.8, homeWinPct: 0.47 },
  RAY: { name: "Rayo Vallecano",      rating: 65, ppg: 1.2, papg: 1.7, homeWinPct: 0.48 },
  GET: { name: "Getafe",              rating: 64, ppg: 1.1, papg: 1.7, homeWinPct: 0.47 },
  LAS: { name: "Las Palmas",          rating: 62, ppg: 1.0, papg: 1.9, homeWinPct: 0.45 },
  ALA: { name: "Alavés",              rating: 61, ppg: 1.0, papg: 1.9, homeWinPct: 0.44 },
  MLL: { name: "Mallorca",            rating: 65, ppg: 1.1, papg: 1.7, homeWinPct: 0.47 },
  GRA: { name: "Granada",             rating: 58, ppg: 0.9, papg: 2.0, homeWinPct: 0.42 },
  CAD: { name: "Cadiz",               rating: 57, ppg: 0.8, papg: 2.1, homeWinPct: 0.41 },
  ALM: { name: "Almería",             rating: 56, ppg: 0.9, papg: 2.1, homeWinPct: 0.40 },
};

// ── Champions League (key clubs) ───────────────────────────────
const UCL: Record<string, SportTeamInfo> = {
  MAD: { name: "Real Madrid",          rating: 97, ppg: 2.8, papg: 0.8, homeWinPct: 0.82 },
  BAR: { name: "FC Barcelona",         rating: 94, ppg: 2.7, papg: 0.9, homeWinPct: 0.78 },
  MCI: { name: "Manchester City",      rating: 95, ppg: 2.6, papg: 0.9, homeWinPct: 0.78 },
  LIV: { name: "Liverpool",            rating: 90, ppg: 2.4, papg: 1.0, homeWinPct: 0.74 },
  BAY: { name: "Bayern Munich",        rating: 92, ppg: 2.6, papg: 1.0, homeWinPct: 0.76 },
  PSG: { name: "Paris Saint-Germain",  rating: 90, ppg: 2.5, papg: 1.1, homeWinPct: 0.73 },
  INT: { name: "Inter Milan",          rating: 87, ppg: 2.2, papg: 1.0, homeWinPct: 0.70 },
  MUN: { name: "Manchester United",    rating: 82, ppg: 1.8, papg: 1.4, homeWinPct: 0.61 },
  CHE: { name: "Chelsea",              rating: 83, ppg: 1.9, papg: 1.3, homeWinPct: 0.62 },
  ATM: { name: "Atletico Madrid",      rating: 86, ppg: 2.0, papg: 1.0, homeWinPct: 0.68 },
  JUV: { name: "Juventus",             rating: 82, ppg: 1.8, papg: 1.2, homeWinPct: 0.62 },
  BEN: { name: "Benfica",              rating: 78, ppg: 1.8, papg: 1.3, homeWinPct: 0.62 },
  POR: { name: "Porto",                rating: 77, ppg: 1.7, papg: 1.3, homeWinPct: 0.60 },
  AJA: { name: "Ajax",                 rating: 76, ppg: 1.8, papg: 1.4, homeWinPct: 0.60 },
  RBL: { name: "RB Leipzig",           rating: 78, ppg: 1.9, papg: 1.4, homeWinPct: 0.60 },
  BOR: { name: "Borussia Dortmund",    rating: 80, ppg: 2.0, papg: 1.4, homeWinPct: 0.62 },
};

// ── MLS ─────────────────────────────────────────────────────────
const MLS: Record<string, SportTeamInfo> = {
  LAG: { name: "LA Galaxy",            rating: 80, ppg: 1.7, papg: 1.3, homeWinPct: 0.60 },
  LAFC:{ name: "LAFC",                 rating: 82, ppg: 1.9, papg: 1.3, homeWinPct: 0.62 },
  SEA: { name: "Seattle Sounders",     rating: 80, ppg: 1.7, papg: 1.3, homeWinPct: 0.61 },
  PHI: { name: "Philadelphia Union",   rating: 78, ppg: 1.6, papg: 1.3, homeWinPct: 0.59 },
  ATL: { name: "Atlanta United",       rating: 76, ppg: 1.6, papg: 1.4, homeWinPct: 0.57 },
  NE:  { name: "New England Revolution",rating:74, ppg: 1.5, papg: 1.5, homeWinPct: 0.55 },
  COL: { name: "Colorado Rapids",      rating: 72, ppg: 1.4, papg: 1.5, homeWinPct: 0.53 },
  NYC: { name: "New York City FC",     rating: 74, ppg: 1.6, papg: 1.5, homeWinPct: 0.55 },
  NYCFC:{ name: "New York City FC",    rating: 74, ppg: 1.6, papg: 1.5, homeWinPct: 0.55 },
  SKC: { name: "Sporting KC",          rating: 72, ppg: 1.4, papg: 1.5, homeWinPct: 0.53 },
  POR: { name: "Portland Timbers",     rating: 73, ppg: 1.5, papg: 1.5, homeWinPct: 0.54 },
  ORL: { name: "Orlando City",         rating: 72, ppg: 1.5, papg: 1.5, homeWinPct: 0.53 },
  RBNY:{ name: "New York Red Bulls",   rating: 73, ppg: 1.5, papg: 1.5, homeWinPct: 0.54 },
  MIN: { name: "Minnesota United",     rating: 70, ppg: 1.4, papg: 1.6, homeWinPct: 0.51 },
  DAL: { name: "FC Dallas",            rating: 71, ppg: 1.4, papg: 1.5, homeWinPct: 0.52 },
  HOU: { name: "Houston Dynamo",       rating: 68, ppg: 1.3, papg: 1.6, homeWinPct: 0.50 },
  SJ:  { name: "San Jose Earthquakes", rating: 62, ppg: 1.1, papg: 1.8, homeWinPct: 0.44 },
  CHI: { name: "Chicago Fire",         rating: 65, ppg: 1.2, papg: 1.7, homeWinPct: 0.47 },
};

// ── Serie A ───────────────────────────────────────────────────
const SERIEA: Record<string, SportTeamInfo> = {
  INT: { name: "Inter Milan",          rating: 92, ppg: 2.6, papg: 0.9, homeWinPct: 0.76 },
  MIL: { name: "AC Milan",             rating: 85, ppg: 2.0, papg: 1.2, homeWinPct: 0.66 },
  JUV: { name: "Juventus",             rating: 84, ppg: 1.9, papg: 1.2, homeWinPct: 0.65 },
  NAP: { name: "Napoli",               rating: 87, ppg: 2.2, papg: 1.1, homeWinPct: 0.69 },
  ROM: { name: "AS Roma",              rating: 80, ppg: 1.8, papg: 1.4, homeWinPct: 0.61 },
  LAZ: { name: "Lazio",                rating: 79, ppg: 1.8, papg: 1.4, homeWinPct: 0.60 },
  ATL: { name: "Atalanta",             rating: 83, ppg: 2.1, papg: 1.3, homeWinPct: 0.64 },
  FIO: { name: "Fiorentina",           rating: 74, ppg: 1.5, papg: 1.6, homeWinPct: 0.54 },
  TOR: { name: "Torino",               rating: 68, ppg: 1.2, papg: 1.6, homeWinPct: 0.49 },
  BOL: { name: "Bologna",              rating: 72, ppg: 1.4, papg: 1.5, homeWinPct: 0.52 },
  MON: { name: "Monza",                rating: 65, ppg: 1.1, papg: 1.7, homeWinPct: 0.46 },
  GEN: { name: "Genoa",                rating: 64, ppg: 1.1, papg: 1.8, homeWinPct: 0.46 },
  EMP: { name: "Empoli",               rating: 64, ppg: 1.1, papg: 1.8, homeWinPct: 0.46 },
  SAL: { name: "Salernitana",          rating: 58, ppg: 0.8, papg: 2.1, homeWinPct: 0.40 },
  FRO: { name: "Frosinone",            rating: 58, ppg: 0.9, papg: 2.0, homeWinPct: 0.41 },
};

// ── Bundesliga ─────────────────────────────────────────────────
const BUNDESLIGA: Record<string, SportTeamInfo> = {
  BAY: { name: "Bayern Munich",        rating: 95, ppg: 3.1, papg: 1.0, homeWinPct: 0.80 },
  BVB: { name: "Borussia Dortmund",    rating: 84, ppg: 2.3, papg: 1.5, homeWinPct: 0.64 },
  RBL: { name: "RB Leipzig",           rating: 82, ppg: 2.1, papg: 1.4, homeWinPct: 0.63 },
  LEV: { name: "Bayer Leverkusen",     rating: 85, ppg: 2.4, papg: 1.3, homeWinPct: 0.66 },
  GLA: { name: "Borussia M'gladbach",  rating: 74, ppg: 1.6, papg: 1.7, homeWinPct: 0.54 },
  FRE: { name: "Freiburg",             rating: 75, ppg: 1.6, papg: 1.6, homeWinPct: 0.55 },
  UNB: { name: "Union Berlin",         rating: 73, ppg: 1.5, papg: 1.6, homeWinPct: 0.53 },
  EIN: { name: "Eintracht Frankfurt",  rating: 76, ppg: 1.7, papg: 1.6, homeWinPct: 0.56 },
  HOF: { name: "Hoffenheim",           rating: 71, ppg: 1.4, papg: 1.7, homeWinPct: 0.51 },
  WOL: { name: "VfL Wolfsburg",        rating: 72, ppg: 1.4, papg: 1.7, homeWinPct: 0.52 },
  MAI: { name: "Mainz 05",             rating: 70, ppg: 1.3, papg: 1.7, homeWinPct: 0.50 },
  AUG: { name: "Augsburg",             rating: 66, ppg: 1.1, papg: 1.9, homeWinPct: 0.46 },
  STU: { name: "VfB Stuttgart",        rating: 76, ppg: 1.8, papg: 1.6, homeWinPct: 0.57 },
  SCH: { name: "Schalke 04",           rating: 65, ppg: 1.1, papg: 1.9, homeWinPct: 0.45 },
  HEI: { name: "Hoffenheim",           rating: 70, ppg: 1.4, papg: 1.7, homeWinPct: 0.51 },
};

// ── NCAA Basketball (top programs) ─────────────────────────────
const NCAAB: Record<string, SportTeamInfo> = {
  DUKE: { name: "Duke Blue Devils",      rating: 93, ppg: 82.5, papg: 65.0, homeWinPct: 0.82 },
  KAN:  { name: "Kansas Jayhawks",       rating: 92, ppg: 79.8, papg: 64.5, homeWinPct: 0.81 },
  KY:   { name: "Kentucky Wildcats",     rating: 91, ppg: 81.0, papg: 66.0, homeWinPct: 0.80 },
  UNC:  { name: "North Carolina",        rating: 89, ppg: 79.5, papg: 66.5, homeWinPct: 0.78 },
  UCLA: { name: "UCLA Bruins",           rating: 86, ppg: 76.5, papg: 65.5, homeWinPct: 0.75 },
  VIL:  { name: "Villanova Wildcats",    rating: 85, ppg: 75.5, papg: 64.5, homeWinPct: 0.74 },
  CON:  { name: "UConn Huskies",         rating: 91, ppg: 79.0, papg: 62.0, homeWinPct: 0.80 },
  ARI:  { name: "Arizona Wildcats",      rating: 86, ppg: 80.0, papg: 67.0, homeWinPct: 0.75 },
  GNZ:  { name: "Gonzaga Bulldogs",      rating: 88, ppg: 83.5, papg: 66.5, homeWinPct: 0.78 },
  HOU:  { name: "Houston Cougars",       rating: 87, ppg: 73.5, papg: 59.5, homeWinPct: 0.77 },
  PUR:  { name: "Purdue Boilermakers",   rating: 85, ppg: 76.5, papg: 63.5, homeWinPct: 0.75 },
  ARK:  { name: "Arkansas Razorbacks",   rating: 80, ppg: 75.5, papg: 67.5, homeWinPct: 0.70 },
  IND:  { name: "Indiana Hoosiers",      rating: 78, ppg: 74.0, papg: 69.0, homeWinPct: 0.68 },
  MSU:  { name: "Michigan State",        rating: 82, ppg: 73.5, papg: 65.0, homeWinPct: 0.72 },
  TEX:  { name: "Texas Longhorns",       rating: 82, ppg: 75.0, papg: 64.5, homeWinPct: 0.72 },
};

const LEAGUE_MAP: Record<string, Record<string, SportTeamInfo>> = {
  nba: NBA,
  nhl: NHL,
  mlb: MLB,
  epl: EPL,
  laliga: LALIGA,
  ucl: UCL,
  mls: MLS,
  seriea: SERIEA,
  bundes: BUNDESLIGA,
  ncaab: NCAAB,
};

export function getSportTeam(leagueId: string, abbr: string): SportTeamInfo {
  const league = LEAGUE_MAP[leagueId.toLowerCase()];
  if (!league) return DEFAULT;
  const key = abbr.toUpperCase();
  return league[key] ?? { ...DEFAULT, name: abbr };
}

export function getSportType(leagueId: string): "basketball" | "baseball" | "hockey" | "soccer" | "football" {
  switch (leagueId.toLowerCase()) {
    case "nba": case "ncaab": return "basketball";
    case "mlb": return "baseball";
    case "nhl": return "hockey";
    case "epl": case "laliga": case "ucl": case "mls": case "seriea": case "bundes": return "soccer";
    default: return "football";
  }
}
