"use client";

import { getTeam } from "@/lib/teams";

interface Props {
  homeTeam: string;
  awayTeam: string;
  homeWinPct: number;
  awayWinPct: number;
}

export function WinProbBar({ homeTeam, awayTeam, homeWinPct, awayWinPct }: Props) {
  const home = getTeam(homeTeam);
  const away = getTeam(awayTeam);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        <span>{awayTeam}</span>
        <span>{homeTeam}</span>
      </div>
      {/* tug-of-war bar */}
      <div className="relative h-5 rounded-full overflow-hidden bg-white/5">
        {/* away side */}
        <div
          className="absolute left-0 top-0 h-full transition-all duration-700"
          style={{ width: `${awayWinPct}%`, background: away.color }}
        />
        {/* home side */}
        <div
          className="absolute right-0 top-0 h-full transition-all duration-700"
          style={{ width: `${homeWinPct}%`, background: home.color }}
        />
        {/* center divider */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-px h-full bg-black/60" />
        </div>
        {/* pct labels inside bar */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className="text-[10px] font-black text-white drop-shadow">{awayWinPct.toFixed(0)}%</span>
          <span className="text-[10px] font-black text-white drop-shadow">{homeWinPct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
