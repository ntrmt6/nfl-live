"use client"

import { BarChart3, Target, Zap, TrendingUp } from "lucide-react"
import type { GameAnalytics } from "@/lib/data/game-analytics"

interface Props {
  analytics: GameAnalytics
  homeTeamFull: string
  awayTeamFull: string
}

function MomentumBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium truncate max-w-[120px]">{label}</span>
        <span className="font-bold tabular-nums">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function AnalyticsBreakdown({ analytics, homeTeamFull, awayTeamFull }: Props) {
  const spreadLabel =
    analytics.projectedSpread === 0
      ? "Pick'em"
      : analytics.projectedSpread > 0
      ? `${homeTeamFull.split(" ").pop()} -${analytics.projectedSpread}`
      : `${awayTeamFull.split(" ").pop()} -${Math.abs(analytics.projectedSpread)}`

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#FF6200]" />
          Analytics Breakdown
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Model-derived betting metrics & edge factors</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary/50 p-3">
          <Target className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground">Proj Spread</p>
          <p className="text-sm font-bold mt-0.5">{spreadLabel}</p>
        </div>
        <div className="rounded-lg bg-[#FF6200]/5 border border-[#FF6200]/20 p-3">
          <Zap className="h-4 w-4 text-[#FF6200] mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground">Total O/U</p>
          <p className="text-sm font-bold text-[#FF6200] mt-0.5">{analytics.projectedTotal}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground">Upset %</p>
          <p className="text-sm font-bold mt-0.5">{analytics.upset_probability}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Momentum Score</p>
        <MomentumBar label={awayTeamFull} score={analytics.momentumScore.away} color="#3b82f6" />
        <MomentumBar label={homeTeamFull} score={analytics.momentumScore.home} color="#FF6200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EdgeList title={`${homeTeamFull} Edges`} factors={analytics.homeEdgeFactors} color="text-[#FF6200]" />
        <EdgeList title={`${awayTeamFull} Edges`} factors={analytics.awayEdgeFactors} color="text-blue-500" />
      </div>

      <div className="rounded-lg bg-secondary/30 px-4 py-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{analytics.bettingImplication}</p>
      </div>
    </div>
  )
}

function EdgeList({ title, factors, color }: { title: string; factors: string[]; color: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      {factors.map((f, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className={`mt-0.5 shrink-0 font-bold text-sm ${color}`}>✓</span>
          <p className="text-xs leading-snug">{f}</p>
        </div>
      ))}
    </div>
  )
}
