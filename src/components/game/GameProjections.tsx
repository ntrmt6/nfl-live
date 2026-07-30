"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TeamStats {
  pts_for?: number;
  pts_against?: number;
  win_rate?: number;
  pt_diff?: number;
}

interface Props {
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  homeStats: TeamStats;
  awayStats: TeamStats;
}

function projectScore(offPPG: number, defAllowed: number): number {
  return Math.round(((offPPG + defAllowed) / 2) * 10) / 10;
}

export function GameProjections({ homeTeam, awayTeam, homeTeamFull, awayTeamFull, homeStats, awayStats }: Props) {
  const homePPG = homeStats.pts_for ?? 22;
  const awayPPG = awayStats.pts_for ?? 22;
  const homeAllowed = homeStats.pts_against ?? 22;
  const awayAllowed = awayStats.pts_against ?? 22;

  const projHome = projectScore(homePPG, awayAllowed);
  const projAway = projectScore(awayPPG, homeAllowed);
  const projTotal = Math.round((projHome + projAway) * 10) / 10;
  const spread = Math.round((projHome - projAway) * 10) / 10;

  // Edge indicators
  const homeOffEdge = homePPG - awayAllowed; // positive = home offense favored vs away defense
  const awayOffEdge = awayPPG - homeAllowed;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-sm">Game Projections</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Derived from each team&apos;s last 6-game scoring averages vs opponent defense
        </p>
      </div>

      {/* Score projection */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">{awayTeam}</p>
          <p className="text-2xl font-bold tabular-nums">{projAway}</p>
          <p className="text-[10px] text-muted-foreground">proj pts</p>
        </div>
        <div className="rounded-lg bg-[#FF6200]/5 border border-[#FF6200]/20 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">Total O/U</p>
          <p className="text-2xl font-bold tabular-nums text-[#FF6200]">{projTotal}</p>
          <p className="text-[10px] text-muted-foreground">pts</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">{homeTeam}</p>
          <p className="text-2xl font-bold tabular-nums">{projHome}</p>
          <p className="text-[10px] text-muted-foreground">proj pts</p>
        </div>
      </div>

      {/* Spread */}
      <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">Projected Spread</span>
        <span className="font-bold">
          {spread === 0
            ? "Pick'em"
            : spread > 0
            ? `${homeTeam} -${spread}`
            : `${awayTeam} -${Math.abs(spread)}`}
        </span>
      </div>

      {/* Matchup edges */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scoring Edges</p>
        <EdgeRow
          label={`${homeTeamFull} Offense`}
          sub={`${homePPG.toFixed(1)} PPG vs ${awayTeamFull} (allows ${awayAllowed.toFixed(1)})`}
          edge={homeOffEdge}
        />
        <EdgeRow
          label={`${awayTeamFull} Offense`}
          sub={`${awayPPG.toFixed(1)} PPG vs ${homeTeamFull} (allows ${homeAllowed.toFixed(1)})`}
          edge={awayOffEdge}
        />
      </div>

      <p className="text-[10px] text-muted-foreground">
        Projections use rolling 6-game team averages. Not financial advice.
      </p>
    </div>
  );
}

function EdgeRow({ label, sub, edge }: { label: string; sub: string; edge: number }) {
  const favorable = edge > 2;
  const unfavorable = edge < -2;
  const Icon = favorable ? TrendingUp : unfavorable ? TrendingDown : Minus;
  const color = favorable ? "text-green-500" : unfavorable ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${color}`}>
        <Icon className="h-3.5 w-3.5" />
        {edge > 0 ? "+" : ""}{edge.toFixed(1)} pts/g
      </div>
    </div>
  );
}
