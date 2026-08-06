"use client"

import type { InjuredPlayer } from "@/lib/data/injuries"

interface Props {
  homeTeam: string
  awayTeam: string
  homeTeamFull: string
  awayTeamFull: string
  homeInjuries: InjuredPlayer[]
  awayInjuries: InjuredPlayer[]
}

function statusColor(status: string): string {
  const s = status.toLowerCase()
  if (s.includes("out")) return "bg-red-500/15 text-red-600 dark:text-red-400"
  if (s.includes("doubtful")) return "bg-orange-500/15 text-orange-600 dark:text-orange-400"
  if (s.includes("questionable")) return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
  if (s.includes("probable")) return "bg-green-500/15 text-green-600 dark:text-green-400"
  return "bg-secondary text-muted-foreground"
}

function InjuryList({ players, teamFull }: { players: InjuredPlayer[]; teamFull: string }) {
  const shown = players.slice(0, 8)
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{teamFull}</p>
      {shown.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No injuries reported</p>
      ) : (
        shown.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.position}{p.details ? ` · ${p.details}` : ""}</p>
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${statusColor(p.status)}`}>
              {p.status}
            </span>
          </div>
        ))
      )}
    </div>
  )
}

export function InjuryReport({ homeTeam, awayTeam, homeTeamFull, awayTeamFull, homeInjuries, awayInjuries }: Props) {
  const noInjuries = homeInjuries.length === 0 && awayInjuries.length === 0

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-sm">Injury Report</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Latest injury designations from ESPN</p>
      </div>

      {noInjuries ? (
        <p className="text-sm text-muted-foreground text-center py-2">No significant injuries reported</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InjuryList players={awayInjuries} teamFull={awayTeamFull} />
          <InjuryList players={homeInjuries} teamFull={homeTeamFull} />
        </div>
      )}
    </div>
  )
}
