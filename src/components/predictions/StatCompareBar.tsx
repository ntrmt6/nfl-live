"use client";

import { getTeam } from "@/lib/teams";

interface Props {
  homeTeam: string;
  awayTeam: string;
  homeStats: Record<string, number>;
  awayStats: Record<string, number>;
}

function MiniBar({
  label,
  homeVal,
  awayVal,
  homeColor,
  awayColor,
  higherIsBetter = true,
}: {
  label: string;
  homeVal: number;
  awayVal: number;
  homeColor: string;
  awayColor: string;
  higherIsBetter?: boolean;
}) {
  const max = Math.max(homeVal, awayVal, 1);
  const homeW = (homeVal / max) * 100;
  const awayW = (awayVal / max) * 100;
  const homeWins = higherIsBetter ? homeVal >= awayVal : homeVal <= awayVal;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {/* away bar (left, grows right→left) */}
      <div className="flex items-center justify-end gap-1.5">
        <span className={`text-[10px] font-bold tabular-nums ${homeWins ? "text-muted-foreground" : "text-white"}`}>
          {awayVal.toFixed(1)}
        </span>
        <div className="h-1.5 rounded-full bg-white/5 w-16 overflow-hidden flex justify-end">
          <div
            className="h-full rounded-full"
            style={{ width: `${awayW}%`, background: awayColor }}
          />
        </div>
      </div>

      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center whitespace-nowrap">
        {label}
      </span>

      {/* home bar (right, grows left→right) */}
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 rounded-full bg-white/5 w-16 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${homeW}%`, background: homeColor }}
          />
        </div>
        <span className={`text-[10px] font-bold tabular-nums ${homeWins ? "text-white" : "text-muted-foreground"}`}>
          {homeVal.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

export function StatCompareBar({ homeTeam, awayTeam, homeStats, awayStats }: Props) {
  const home = getTeam(homeTeam);
  const away = getTeam(awayTeam);

  return (
    <div className="space-y-2">
      {/* column labels */}
      <div className="grid grid-cols-[1fr_auto_1fr] text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
        <span className="text-right">{awayTeam}</span>
        <span className="w-20 text-center">Stat</span>
        <span>{homeTeam}</span>
      </div>

      <MiniBar
        label="PPG"
        homeVal={homeStats.pts_for ?? 0}
        awayVal={awayStats.pts_for ?? 0}
        homeColor={home.color}
        awayColor={away.color}
      />
      <MiniBar
        label="PA/G"
        homeVal={homeStats.pts_against ?? 0}
        awayVal={awayStats.pts_against ?? 0}
        homeColor={home.color}
        awayColor={away.color}
        higherIsBetter={false}
      />
      <MiniBar
        label="+/-"
        homeVal={homeStats.pt_diff ?? 0}
        awayVal={awayStats.pt_diff ?? 0}
        homeColor={home.color}
        awayColor={away.color}
      />
      <MiniBar
        label="W%"
        homeVal={(homeStats.win_rate ?? 0) * 100}
        awayVal={(awayStats.win_rate ?? 0) * 100}
        homeColor={home.color}
        awayColor={away.color}
      />
    </div>
  );
}
