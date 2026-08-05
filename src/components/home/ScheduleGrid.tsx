"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, CalendarDays } from "lucide-react";
import { GameCard } from "@/components/home/GameCard";
import { Input } from "@/components/ui/input";
import { TEAM_LIST } from "@/lib/teams";
import { GameDTO } from "@/types";
import { cn } from "@/lib/utils";
import type { LiveScoresMap } from "@/hooks/useLiveScores";

interface ScheduleGridProps {
  games: GameDTO[];
  liveScores?: LiveScoresMap;
}

export function ScheduleGrid({ games, liveScores }: ScheduleGridProps) {
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [teamExpanded, setTeamExpanded] = useState(false);

  const weeks = useMemo(() => {
    const set = new Set(games.map((g) => g.week));
    return Array.from(set).sort((a, b) => a - b);
  }, [games]);

  const [weekFilter, setWeekFilter] = useState<number | "ALL">(weeks[0] ?? "ALL");

  const filtered = games.filter((g) => {
    const matchesTeam =
      teamFilter === "ALL" || g.homeTeam === teamFilter || g.awayTeam === teamFilter;
    const matchesWeek = weekFilter === "ALL" || g.week === weekFilter;
    const matchesQuery =
      query.trim() === "" ||
      `${g.homeTeamFull} ${g.awayTeamFull}`.toLowerCase().includes(query.toLowerCase());
    return matchesTeam && matchesWeek && matchesQuery;
  });

  return (
    <section id="schedule" className="scroll-mt-20">
      {/* Compact header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#FF6200]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#FF6200]">
            2026 NFL Schedule
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {filtered.length} game{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="relative w-full sm:w-44">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-7 text-xs"
          />
        </div>
      </div>

      {/* Week filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-2">
        <button
          onClick={() => setWeekFilter("ALL")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
            weekFilter === "ALL"
              ? "bg-[#FF6200] text-white border-[#FF6200]"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
          )}
        >
          All
        </button>
        {weeks.map((w) => (
          <button
            key={w}
            onClick={() => setWeekFilter(w)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
              weekFilter === w
                ? "bg-[#FF6200] text-white border-[#FF6200]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
          >
            Wk {w}
          </button>
        ))}
      </div>

      {/* Team filter — collapsible */}
      <div className="mb-3">
        <button
          onClick={() => setTeamExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1.5"
        >
          Filter by Team
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              teamExpanded && "rotate-180"
            )}
          />
          {teamFilter !== "ALL" && (
            <span
              className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-black text-white"
              style={{ background: "#FF6200" }}
            >
              {teamFilter}
            </span>
          )}
        </button>

        {teamExpanded && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            <button
              onClick={() => setTeamFilter("ALL")}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors",
                teamFilter === "ALL"
                  ? "bg-[#FF6200] text-white border-[#FF6200]"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              ALL
            </button>
            {TEAM_LIST.map((t) => (
              <button
                key={t.abbr}
                onClick={() => {
                  setTeamFilter(t.abbr);
                  setTeamExpanded(false);
                }}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors",
                  teamFilter === t.abbr
                    ? "text-white border-transparent"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
                style={
                  teamFilter === t.abbr
                    ? { backgroundColor: t.color === "#000000" ? "#222" : t.color }
                    : undefined
                }
              >
                {t.abbr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarDays className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-sm font-semibold">No games match your filters.</p>
          <p className="text-xs mt-1">Try a different team or week.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((game, i) => (
            <GameCard
              key={game._id}
              game={game}
              index={i}
              liveData={liveScores?.get(`${game.awayTeam}-${game.homeTeam}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
