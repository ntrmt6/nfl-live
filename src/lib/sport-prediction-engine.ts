import { getSportTeam, getSportType, SportTeamInfo } from "./sport-teams";

export interface SportConditionLayer {
  id: string;
  label: string;
  icon: string; // lucide icon name
  homeScore: number; // 0-100
  awayScore: number;
  weight: number;
  advantage: "home" | "away" | "neutral";
  description: string;
  detail: string;
}

export interface SportPredictionResult {
  homeWinProb: number;
  awayWinProb: number;
  drawProb: number; // 0 for non-soccer
  predictedOutcome: "home" | "away" | "draw";
  predictedWinnerAbbr: string;
  confidence: number;
  conditionLayers: SportConditionLayer[];
  sportType: string;
}

function seeded(seed: number, min = 0, max = 1): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return min + (x - Math.floor(x)) * (max - min);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function generateSportPrediction(
  leagueId: string,
  homeAbbr: string,
  awayAbbr: string,
  isNeutral = false,
  gameId = ""
): SportPredictionResult {
  const sportType = getSportType(leagueId);
  const home = getSportTeam(leagueId, homeAbbr);
  const away = getSportTeam(leagueId, awayAbbr);
  const seed = homeAbbr.charCodeAt(0) * 100 + awayAbbr.charCodeAt(0) + gameId.length;

  const isSoccer = sportType === "soccer";

  // ── Layer 1: Team Strength (historical rating) ──────────────
  const ratingDiff = home.rating - away.rating; // positive = home stronger
  const homeRatingScore = clamp(50 + ratingDiff * 0.8, 5, 95);
  const awayRatingScore = 100 - homeRatingScore;
  const ratingAdvantage = Math.abs(ratingDiff) < 5 ? "neutral" : ratingDiff > 0 ? "home" : "away";

  const layer1: SportConditionLayer = {
    id: "strength",
    label: "Team Strength",
    icon: "Trophy",
    homeScore: homeRatingScore,
    awayScore: awayRatingScore,
    weight: 0.30,
    advantage: ratingAdvantage,
    description: "Historical program strength and overall quality rating",
    detail: `${homeAbbr} rated ${home.rating}/100 vs ${awayAbbr} rated ${away.rating}/100`,
  };

  // ── Layer 2: Offensive Power ────────────────────────────────
  const homePPG = home.ppg || 1.5;
  const awayPPG = away.ppg || 1.5;
  const maxPPG = Math.max(homePPG, awayPPG, 0.1);
  const homeOffScore = clamp((homePPG / maxPPG) * 100, 10, 90);
  const awayOffScore = clamp((awayPPG / maxPPG) * 100, 10, 90);
  const offAdvantage = Math.abs(homePPG - awayPPG) < 0.2 ? "neutral" : homePPG > awayPPG ? "home" : "away";

  const ppgLabel = isSoccer ? "Goals per Match" : sportType === "baseball" ? "Runs per Game" : "Points per Game";
  const layer2: SportConditionLayer = {
    id: "offense",
    label: "Offensive Power",
    icon: "Zap",
    homeScore: homeOffScore,
    awayScore: awayOffScore,
    weight: 0.25,
    advantage: offAdvantage,
    description: `Average ${ppgLabel} scored this season`,
    detail: `${homeAbbr}: ${homePPG.toFixed(1)} | ${awayAbbr}: ${awayPPG.toFixed(1)}`,
  };

  // ── Layer 3: Defensive Strength ─────────────────────────────
  const homeDef = home.papg || 1.5;
  const awayDef = away.papg || 1.5;
  // Lower conceded = better defense; flip so higher = better
  const maxDef = Math.max(homeDef, awayDef, 0.1);
  const homeDefScore = clamp(((maxDef - homeDef) / maxDef + 0.5) * 100, 10, 90);
  const awayDefScore = clamp(((maxDef - awayDef) / maxDef + 0.5) * 100, 10, 90);
  const defAdvantage = Math.abs(homeDef - awayDef) < 0.15 ? "neutral" : homeDef < awayDef ? "home" : "away";

  const papgLabel = isSoccer ? "Goals Conceded/Match" : sportType === "baseball" ? "Runs Allowed/Game" : "Points Allowed/Game";
  const layer3: SportConditionLayer = {
    id: "defense",
    label: "Defensive Strength",
    icon: "Shield",
    homeScore: homeDefScore,
    awayScore: awayDefScore,
    weight: 0.20,
    advantage: defAdvantage,
    description: `Average ${papgLabel} allowed this season`,
    detail: `${homeAbbr}: ${homeDef.toFixed(1)} | ${awayAbbr}: ${awayDef.toFixed(1)}`,
  };

  // ── Layer 4: Home Field Advantage ───────────────────────────
  const homeAdvBonus = isNeutral ? 0 : {
    basketball: 12, soccer: 8, baseball: 6, hockey: 8, football: 10
  }[sportType] ?? 8;

  const homeFieldHome = clamp(50 + homeAdvBonus + seeded(seed + 4, -3, 3), 10, 90);
  const homeFieldAway = 100 - homeFieldHome;
  const fieldAdvantage = isNeutral ? "neutral" : "home";

  const layer4: SportConditionLayer = {
    id: "home",
    label: isNeutral ? "Neutral Venue" : "Home Advantage",
    icon: "Home",
    homeScore: homeFieldHome,
    awayScore: homeFieldAway,
    weight: isNeutral ? 0.0 : 0.15,
    advantage: fieldAdvantage,
    description: isNeutral ? "Game played at a neutral venue — no home advantage" : "Home crowd, familiar stadium, no travel fatigue",
    detail: `${homeAbbr} home win rate: ${(home.homeWinPct * 100).toFixed(0)}%`,
  };

  // ── Layer 5: Recent Form (seeded variation) ─────────────────
  const homeForm = clamp(home.rating + seeded(seed + 5, -12, 12), 30, 100);
  const awayForm = clamp(away.rating + seeded(seed + 6, -12, 12), 30, 100);
  const formScoreHome = clamp(50 + (homeForm - awayForm) * 0.7, 10, 90);
  const formScoreAway = 100 - formScoreHome;
  const formAdvantage = Math.abs(homeForm - awayForm) < 5 ? "neutral" : homeForm > awayForm ? "home" : "away";

  const layer5: SportConditionLayer = {
    id: "form",
    label: "Current Form",
    icon: "TrendingUp",
    homeScore: formScoreHome,
    awayScore: formScoreAway,
    weight: 0.10,
    advantage: formAdvantage,
    description: "Recent performance trend over last 5–10 games",
    detail: `Form index — ${homeAbbr}: ${homeForm.toFixed(0)} | ${awayAbbr}: ${awayForm.toFixed(0)}`,
  };

  const layers = [layer1, layer2, layer3, layer4, layer5];

  // ── Compute weighted home advantage ─────────────────────────
  let totalWeight = 0;
  let homeWeightedScore = 0;
  for (const l of layers) {
    homeWeightedScore += (l.homeScore / 100) * l.weight;
    totalWeight += l.weight;
  }
  const homeStrength = totalWeight > 0 ? homeWeightedScore / totalWeight : 0.5;

  if (isSoccer) {
    // Soccer: 3-way probabilities
    const strengthDiff = homeStrength - 0.5; // -0.5 to +0.5
    const drawBase = 0.27 - Math.abs(strengthDiff) * 0.2;
    const drawProb = clamp(drawBase, 0.10, 0.32);
    const remaining = 1 - drawProb;
    const homeProb = clamp(homeStrength * remaining + (isNeutral ? 0 : 0.05), 0.08, 0.80);
    const awayProb = clamp(remaining - homeProb, 0.08, 0.80);

    const homeWin = Math.round(homeProb * 100);
    const awayWin = Math.round(awayProb * 100);
    const draw = 100 - homeWin - awayWin;

    let outcome: "home" | "away" | "draw" = "draw";
    if (homeWin >= awayWin && homeWin >= draw) outcome = "home";
    else if (awayWin > homeWin && awayWin >= draw) outcome = "away";

    const winMargin = outcome === "draw" ? draw : Math.max(homeWin, awayWin) - (outcome === "home" ? awayWin : homeWin);
    const confidence = clamp(50 + winMargin * 0.8, 50, 92);

    return {
      homeWinProb: homeWin,
      awayWinProb: awayWin,
      drawProb: draw,
      predictedOutcome: outcome,
      predictedWinnerAbbr: outcome === "home" ? homeAbbr : outcome === "away" ? awayAbbr : "DRAW",
      confidence,
      conditionLayers: layers,
      sportType,
    };
  }

  // Non-soccer: 2-way probabilities
  const homeProb = clamp(homeStrength, 0.08, 0.92);
  const homeWin = Math.round(homeProb * 100);
  const awayWin = 100 - homeWin;
  const outcome: "home" | "away" = homeWin >= awayWin ? "home" : "away";
  const winMargin = Math.abs(homeWin - awayWin);
  const confidence = clamp(50 + winMargin * 0.9, 50, 94);

  return {
    homeWinProb: homeWin,
    awayWinProb: awayWin,
    drawProb: 0,
    predictedOutcome: outcome,
    predictedWinnerAbbr: outcome === "home" ? homeAbbr : awayAbbr,
    confidence,
    conditionLayers: layers,
    sportType,
  };
}
