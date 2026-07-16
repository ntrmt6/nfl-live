"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { getTeam } from "@/lib/teams";
import { cn } from "@/lib/utils";

type StatTab = "PASS" | "RUSH" | "REC";

interface Leader {
  name: string;
  team: string;
  stat: number;
}

const LEADERS: Record<StatTab, { label: string; unit: string; data: Leader[] }> = {
  PASS: {
    label: "Passing Yards",
    unit: "YDS",
    data: [
      { name: "Mahomes",  team: "KC",  stat: 4839 },
      { name: "Allen",    team: "BUF", stat: 4712 },
      { name: "Jackson",  team: "BAL", stat: 4401 },
      { name: "Hurts",    team: "PHI", stat: 4280 },
      { name: "Purdy",    team: "SF",  stat: 4156 },
    ],
  },
  RUSH: {
    label: "Rushing Yards",
    unit: "YDS",
    data: [
      { name: "McCaffrey", team: "SF",  stat: 1534 },
      { name: "Robinson",  team: "ATL", stat: 1421 },
      { name: "Henry",     team: "TEN", stat: 1388 },
      { name: "Cook",      team: "BUF", stat: 1201 },
      { name: "Nix",       team: "DEN", stat: 891  },
    ],
  },
  REC: {
    label: "Receiving Yards",
    unit: "YDS",
    data: [
      { name: "Jefferson", team: "MIN", stat: 1589 },
      { name: "Chase",     team: "CIN", stat: 1467 },
      { name: "Hill",      team: "MIA", stat: 1398 },
      { name: "Lamb",      team: "DAL", stat: 1312 },
      { name: "Adams",     team: "NYJ", stat: 1189 },
    ],
  },
};

const TABS: StatTab[] = ["PASS", "RUSH", "REC"];

export function LeagueLeaders() {
  const [active, setActive] = useState<StatTab>("PASS");
  const { data, unit } = LEADERS[active];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pl-2 border-l-2 border-[#FF6200]">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3 text-[#FF6200]" />
          <span className="section-label-orange">League Leaders</span>
        </div>
        <span className="text-[10px] text-muted-foreground">2026 Projected</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "flex-1 text-[10px] font-bold uppercase tracking-wide py-1 rounded transition-colors",
              active === tab
                ? "bg-[rgba(255,98,0,0.15)] text-[#FF6200]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Leaders list */}
      <div className="space-y-0">
        {data.map((leader, i) => {
          const team = getTeam(leader.team);
          const isFirst = i === 0;

          return (
            <div
              key={leader.name}
              className="flex items-center gap-2 py-2 border-b border-border/25 last:border-0"
            >
              {/* Rank */}
              <span
                className={cn(
                  "w-4 shrink-0 text-center text-[10px] font-black tabular-nums",
                  isFirst ? "text-[#00A8FF]" : "text-muted-foreground/60"
                )}
              >
                {i + 1}
              </span>

              {/* Team color swatch */}
              <span
                className="inline-flex items-center justify-center h-5 w-8 shrink-0 rounded text-[9px] font-black text-white"
                style={{ backgroundColor: team.color }}
              >
                {leader.team}
              </span>

              {/* Name */}
              <span
                className={cn(
                  "flex-1 text-xs font-semibold truncate",
                  isFirst ? "text-[#00A8FF]" : "text-foreground/85"
                )}
              >
                {leader.name}
              </span>

              {/* Stat */}
              <span
                className={cn(
                  "text-xs font-black tabular-nums shrink-0",
                  isFirst ? "text-[#00A8FF]" : "text-foreground/70"
                )}
              >
                {leader.stat.toLocaleString()}
                <span className="text-[9px] font-normal text-muted-foreground ml-0.5">
                  {unit}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
