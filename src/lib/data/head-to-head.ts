import { connectDB } from "@/lib/db"
import Game from "@/models/Game"

export interface LastMeeting {
  season: number
  week: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  winner: string
}

export interface H2HStats {
  team1Wins: number
  team2Wins: number
  lastMeetings: LastMeeting[]
  avgPointDiff: number
  team1AvgScore: number
  team2AvgScore: number
}

export async function getHeadToHeadStats(team1: string, team2: string): Promise<H2HStats> {
  const empty: H2HStats = {
    team1Wins: 0,
    team2Wins: 0,
    lastMeetings: [],
    avgPointDiff: 0,
    team1AvgScore: 0,
    team2AvgScore: 0,
  }

  try {
    await connectDB()
    const games = await Game.find({
      status: "final",
      $or: [
        { homeTeam: team1, awayTeam: team2 },
        { homeTeam: team2, awayTeam: team1 },
      ],
    })
      .sort({ kickoff: -1 })
      .limit(10)
      .lean()

    if (!games.length) return empty

    let team1Wins = 0
    let team2Wins = 0
    let team1TotalScore = 0
    let team2TotalScore = 0
    let totalDiff = 0
    const lastMeetings: LastMeeting[] = []

    for (const g of games) {
      const homeScore = g.homeScore ?? 0
      const awayScore = g.awayScore ?? 0
      const winner = homeScore > awayScore ? g.homeTeam : g.awayTeam

      if (winner === team1) team1Wins++
      else if (winner === team2) team2Wins++

      // Accumulate scores from team1's perspective
      if (g.homeTeam === team1) {
        team1TotalScore += homeScore
        team2TotalScore += awayScore
        totalDiff += homeScore - awayScore
      } else {
        team1TotalScore += awayScore
        team2TotalScore += homeScore
        totalDiff += awayScore - homeScore
      }

      lastMeetings.push({
        season: g.season,
        week: g.week,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        homeScore,
        awayScore,
        winner,
      })
    }

    const count = games.length
    return {
      team1Wins,
      team2Wins,
      lastMeetings,
      avgPointDiff: Math.round((totalDiff / count) * 10) / 10,
      team1AvgScore: Math.round((team1TotalScore / count) * 10) / 10,
      team2AvgScore: Math.round((team2TotalScore / count) * 10) / 10,
    }
  } catch {
    return empty
  }
}
