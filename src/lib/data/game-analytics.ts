export interface GameAnalytics {
  projectedSpread: number
  projectedTotal: number
  homeEdgeFactors: string[]
  awayEdgeFactors: string[]
  bettingImplication: string
  momentumScore: { home: number; away: number }
  upset_probability: number
}

export function computeGameAnalytics(prediction: any, game: any): GameAnalytics {
  const homeStats = prediction?.homeTeamStats || {}
  const awayStats = prediction?.awayTeamStats || {}

  const homePPG = homeStats.pts_for ?? 22
  const awayPPG = awayStats.pts_for ?? 22
  const homeAllowed = homeStats.pts_against ?? 22
  const awayAllowed = awayStats.pts_against ?? 22
  const homeWinRate = homeStats.win_rate ?? 0.5
  const awayWinRate = awayStats.win_rate ?? 0.5

  const ppgDiff = homePPG - awayPPG
  const winRateDiff = (homeWinRate - awayWinRate) * 30
  const projectedSpread = Math.round((ppgDiff * 0.6 + winRateDiff * 0.4) * 10) / 10

  const projectedTotal = Math.round(((homePPG + awayPPG) * 1.05) * 10) / 10

  const homeEdgeFactors: string[] = []
  const awayEdgeFactors: string[] = []

  homeEdgeFactors.push("Home field advantage")
  if (homePPG > awayPPG + 3) homeEdgeFactors.push(`Superior scoring offense (+${(homePPG - awayPPG).toFixed(1)} PPG)`)
  if (homeAllowed < awayAllowed - 3) homeEdgeFactors.push(`Stronger pass defense (allows ${homeAllowed.toFixed(1)} vs ${awayAllowed.toFixed(1)})`)
  if (homeWinRate > awayWinRate + 0.1) homeEdgeFactors.push(`Better win percentage (${(homeWinRate * 100).toFixed(0)}% vs ${(awayWinRate * 100).toFixed(0)}%)`)
  if (homeStats.pt_diff != null && homeStats.pt_diff > 5) homeEdgeFactors.push(`Positive point differential (+${homeStats.pt_diff.toFixed(1)})`)
  if (homeEdgeFactors.length < 3) homeEdgeFactors.push("Familiar game-day environment")

  if (awayWinRate > homeWinRate + 0.05) awayEdgeFactors.push(`Road warrior mentality (${(awayWinRate * 100).toFixed(0)}% win rate)`)
  if (awayPPG > homePPG + 2) awayEdgeFactors.push(`Dynamic scoring attack (+${(awayPPG - homePPG).toFixed(1)} PPG edge)`)
  if (awayAllowed < homeAllowed - 2) awayEdgeFactors.push(`Suffocating defense (${awayAllowed.toFixed(1)} pts allowed)`)
  if (awayStats.pt_diff != null && awayStats.pt_diff > 3) awayEdgeFactors.push(`Strong point differential (+${awayStats.pt_diff.toFixed(1)})`)
  if (awayEdgeFactors.length < 2) awayEdgeFactors.push("Motivated road performance", "Proven consistency in tough environments")

  const homeEdge = homeEdgeFactors.length - awayEdgeFactors.length
  let bettingImplication: string
  if (Math.abs(projectedSpread) < 3) {
    bettingImplication = `This matchup projects as a near pick'em — expect a tight game decided in the fourth quarter.`
  } else if (projectedSpread > 0) {
    bettingImplication = `Our model favors ${game.homeTeamFull} by ${projectedSpread} points — look for value on the home side covering.`
  } else {
    bettingImplication = `Our model favors ${game.awayTeamFull} by ${Math.abs(projectedSpread)} points against the spread despite playing on the road.`
  }

  const homeMomentum = Math.min(100, Math.round(homeWinRate * 60 + (homePPG / 40) * 40))
  const awayMomentum = Math.min(100, Math.round(awayWinRate * 60 + (awayPPG / 40) * 40))

  const favoriteWinProb = prediction?.homeWinProbability ?? 0.5
  const upsetProb = favoriteWinProb > 0.5
    ? Math.round((1 - favoriteWinProb) * 100)
    : Math.round(favoriteWinProb * 100)

  return {
    projectedSpread,
    projectedTotal,
    homeEdgeFactors: homeEdgeFactors.slice(0, 5),
    awayEdgeFactors: awayEdgeFactors.slice(0, 5),
    bettingImplication,
    momentumScore: { home: homeMomentum, away: awayMomentum },
    upset_probability: upsetProb,
  }
}
