"use client";

import { useState } from "react";
import { getTeam } from "@/lib/teams";
import { cn } from "@/lib/utils";
import { BarChart2 } from "lucide-react";

interface StandingRow {
  abbr: string;
  w: number;
  l: number;
  t: number;
  playoff: boolean;
}

interface Division {
  label: string;
  teams: StandingRow[];
}

const DIVISIONS: Division[] = [
  {
    label: "AFC E",
    teams: [
      { abbr: "BUF", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "MIA", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "NE",  w: 0, l: 0, t: 0, playoff: true },
      { abbr: "NYJ", w: 0, l: 0, t: 0, playoff: false },
    ],
  },
  {
    label: "AFC N",
    teams: [
      { abbr: "BAL", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "PIT", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "CLE", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "CIN", w: 0, l: 0, t: 0, playoff: false },
    ],
  },
  {
    label: "AFC W",
    teams: [
      { abbr: "KC",  w: 0, l: 0, t: 0, playoff: true },
      { abbr: "LAC", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "LV",  w: 0, l: 0, t: 0, playoff: true },
      { abbr: "DEN", w: 0, l: 0, t: 0, playoff: false },
    ],
  },
  {
    label: "AFC S",
    teams: [
      { abbr: "HOU", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "IND", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "JAX", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "TEN", w: 0, l: 0, t: 0, playoff: false },
    ],
  },
  {
    label: "NFC E",
    teams: [
      { abbr: "PHI", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "DAL", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "NYG", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "WAS", w: 0, l: 0, t: 0, playoff: false },
    ],
  },
  {
    label: "NFC N",
    teams: [
      { abbr: "DET", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "GB",  w: 0, l: 0, t: 0, playoff: true },
      { abbr: "MIN", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "CHI", w: 0, l: 0, t: 0, playoff: false },
    ],
  },
  {
    label: "NFC W",
    teams: [
      { abbr: "SF",  w: 0, l: 0, t: 0, playoff: true },
      { abbr: "LAR", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "SEA", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "ARI", w: 0, l: 0, t: 0, playoff: false },
    ],
  },
  {
    label: "NFC S",
    teams: [
      { abbr: "TB",  w: 0, l: 0, t: 0, playoff: true },
      { abbr: "ATL", w: 0, l: 0, t: 0, playoff: true },
      { abbr: "NO",  w: 0, l: 0, t: 0, playoff: true },
      { abbr: "CAR", w: 0, l: 0, t: 0, playoff: false },
    ],
  },
];

function pct(w: number, l: number, t: number): string {
  const games = w + l + t;
  if (games === 0) return ".000";
  return (w / games).toFixed(3).replace(/^0/, "");
}

export function StandingsWidget() {
  const [activeIdx, setActiveIdx] = useState(0);
  const division = DIVISIONS[activeIdx];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pl-2 border-l-2 border-[#00A8FF]">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="h-3 w-3 text-[#00A8FF]" />
          <span className="section-label-blue">Standings</span>
        </div>
        <span className="text-[10px] text-muted-foreground">2026 Preseason</span>
      </div>

      {/* Division tabs */}
      <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-none pb-0.5">
        {DIVISIONS.map((div, i) => (
          <button
            key={div.label}
            onClick={() => setActiveIdx(i)}
            className={cn(
              "shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded transition-colors",
              activeIdx === i
                ? "bg-[rgba(0,168,255,0.18)] text-[#00A8FF]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            )}
          >
            {div.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="data-grid">
        <thead>
          <tr>
            <th className="text-left w-full">Team</th>
            <th className="text-center">W</th>
            <th className="text-center">L</th>
            <th className="text-center">T</th>
            <th className="text-center sorted">PCT</th>
          </tr>
        </thead>
        <tbody>
          {division.teams.map((row, i) => {
            const team = getTeam(row.abbr);
            const isPlayoff = row.playoff;
            // Show a subtle divider after position 3
            const isLast = i === 2;
            return (
              <tr
                key={row.abbr}
                className={cn(isLast && "border-b-2 border-[#00A8FF]/30")}
              >
                <td>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-sm shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                    <span
                      className={cn(
                        "font-semibold",
                        isPlayoff ? "playoff-team" : "text-foreground/70"
                      )}
                    >
                      {row.abbr}
                    </span>
                  </div>
                </td>
                <td className="text-center text-foreground/80">{row.w}</td>
                <td className="text-center text-foreground/80">{row.l}</td>
                <td className="text-center text-foreground/80">{row.t}</td>
                <td className={cn("text-center", isPlayoff ? "playoff-team" : "text-foreground/60")}>
                  {pct(row.w, row.l, row.t)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-[#00A8FF]" />
        <span className="text-[10px] text-muted-foreground">Playoff Position</span>
      </div>
    </div>
  );
}
