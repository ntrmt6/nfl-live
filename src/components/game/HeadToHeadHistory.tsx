"use client"

import type { H2HStats } from "@/lib/data/head-to-head"

interface Props {
  stats: H2HStats
  homeTeam: string
  awayTeam: string
  homeTeamFull: string
  awayTeamFull: string
}

export function HeadToHeadHistory({ stats, homeTeam, awayTeam, homeTeamFull, awayTeamFull }: Props) {
  const total = stats.team1Wins + stats.team2Wins
  if (total === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-sm mb-2">Head-to-Head History</h3>
        <p className="text-sm text-muted-foreground">No recent matchup data available.</p>
      </div>
    )
  }

  const leaderName = stats.team1Wins > stats.team2Wins
    ? awayTeamFull
    : stats.team2Wins > stats.team1Wins
    ? homeTeamFull
    : null
  const recordText = leaderName
    ? `${leaderName} leads ${Math.max(stats.team1Wins, stats.team2Wins)}-${Math.min(stats.team1Wins, stats.team2Wins)}`
    : `Series tied ${stats.team1Wins}-${stats.team2Wins}`

  const shown = stats.lastMeetings.slice(0, 5)

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-sm">Head-to-Head History</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Last {total} meetings (regular season + playoffs)</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">{awayTeam}</p>
          <p className="text-2xl font-bold">{stats.team1Wins}</p>
          <p className="text-[10px] text-muted-foreground">wins</p>
        </div>
        <div className="rounded-lg bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">Avg Score</p>
          <p className="text-sm font-bold tabular-nums">{stats.team1AvgScore}–{stats.team2AvgScore}</p>
          <p className="text-[10px] text-muted-foreground">per game</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">{homeTeam}</p>
          <p className="text-2xl font-bold">{stats.team2Wins}</p>
          <p className="text-[10px] text-muted-foreground">wins</p>
        </div>
      </div>

      <p className="text-sm font-semibold text-center text-[#FF6200]">{recordText}</p>

      {shown.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Meetings</p>
          <div className="space-y-1.5">
            {shown.map((m, i) => {
              const winnerAbbr = m.winner
              const isAwayWin = winnerAbbr === awayTeam
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground text-xs">
                    {m.season} Wk {m.week}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {m.awayTeam} {m.awayScore} @ {m.homeTeam} {m.homeScore}
                  </span>
                  <span className={`text-xs font-bold ${isAwayWin ? "text-blue-500" : "text-[#FF6200]"}`}>
                    {winnerAbbr} W
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
