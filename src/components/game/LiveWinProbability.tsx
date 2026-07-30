"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import type { LiveGameScore } from "@/types";

interface Props {
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  preGameHomeProb: number; // 0-100
}

function parseClock(clock: string): number {
  const parts = clock.split(":");
  if (parts.length === 2) {
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }
  return 0;
}

function calcLiveProb(
  preGameHomeProb: number,
  homeScore: number,
  awayScore: number,
  period: number,
  clock: string,
  status: string,
): { home: number; away: number } {
  const isOvertime = period >= 5;
  const periodDuration = isOvertime ? 600 : 900; // 10 min OT, 15 min quarters
  const totalSeconds = isOvertime ? 3600 + 600 : 3600;

  const clockSeconds = parseClock(clock);
  const elapsedInPeriod = Math.max(0, periodDuration - clockSeconds);
  const regularPeriods = Math.min(period - 1, 4);
  const elapsed = regularPeriods * 900 + elapsedInPeriod;
  const timeRatio = Math.min(elapsed / totalSeconds, 1);

  // Halftime: treat as end of period 2
  const effectiveRatio = status === "halftime" ? 0.5 : timeRatio;

  // Score-based probability: each point ≈ 3.5% shift, clamped
  const scoreDiff = homeScore - awayScore;
  const scoreProb = Math.max(0.03, Math.min(0.97, 0.5 + scoreDiff * 0.035));

  // Weight toward score-based as game progresses (square-root curve = faster ramp)
  const weight = Math.pow(effectiveRatio, 0.6);
  const homeProb = (preGameHomeProb / 100) * (1 - weight) + scoreProb * weight;

  const home = Math.round(homeProb * 100);
  return { home, away: 100 - home };
}

export function LiveWinProbability({ homeTeam, awayTeam, homeTeamFull, awayTeamFull, preGameHomeProb }: Props) {
  const [liveGame, setLiveGame] = useState<LiveGameScore | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/live-scores");
      const data = await res.json();
      const games: LiveGameScore[] = data.games ?? [];
      const match = games.find(
        (g) => g.homeTeam === homeTeam && g.awayTeam === awayTeam
      );
      if (match && (match.status === "live" || match.status === "halftime")) {
        setLiveGame(match);
        setLastUpdate(new Date());
      } else {
        setLiveGame(null);
      }
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeTeam, awayTeam]);

  if (!liveGame) return null;

  const { home, away } = calcLiveProb(
    preGameHomeProb,
    liveGame.homeScore,
    liveGame.awayScore,
    liveGame.period,
    liveGame.clock,
    liveGame.status,
  );

  const homeLeading = liveGame.homeScore > liveGame.awayScore;
  const awayLeading = liveGame.awayScore > liveGame.homeScore;

  return (
    <div className="rounded-xl border border-[#FF6200]/30 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-sm font-semibold text-red-500">LIVE</span>
          <span className="text-sm text-muted-foreground ml-1">{liveGame.statusText}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          Win Probability
        </div>
      </div>

      {/* Scoreboard */}
      <div className="flex items-center justify-between text-center">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground truncate">{awayTeamFull}</p>
          <p className={`text-3xl font-bold tabular-nums ${awayLeading ? "text-[#FF6200]" : ""}`}>
            {liveGame.awayScore}
          </p>
        </div>
        <div className="px-4 text-muted-foreground text-sm font-medium">at</div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground truncate">{homeTeamFull}</p>
          <p className={`text-3xl font-bold tabular-nums ${homeLeading ? "text-[#FF6200]" : ""}`}>
            {liveGame.homeScore}
          </p>
        </div>
      </div>

      {/* Live probability bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span>{awayTeam} {away}%</span>
          <span>{homeTeam} {home}%</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
          <div
            className="h-full bg-blue-500 transition-all duration-700"
            style={{ width: `${away}%` }}
          />
          <div
            className="h-full bg-[#FF6200] transition-all duration-700"
            style={{ width: `${home}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{awayTeamFull}</span>
          <span>{homeTeamFull}</span>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-[10px] text-muted-foreground text-right">
          Updated {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · refreshes every 30s
        </p>
      )}
    </div>
  );
}
