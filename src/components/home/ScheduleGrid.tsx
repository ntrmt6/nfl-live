"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Search } from "lucide-react";
import { GameCard } from "@/components/home/GameCard";
import { Input } from "@/components/ui/input";
import { TEAM_LIST } from "@/lib/teams";
import { GameDTO } from "@/types";
import { cn } from "@/lib/utils";

export function ScheduleGrid({ games }: { games: GameDTO[] }) {
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");

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
    <section id="schedule" className="container py-16 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent mb-2">
            <CalendarDays className="h-4 w-4" />
            GAME SCHEDULE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Upcoming <span className="text-gradient">Matchups</span>
          </h2>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 mb-2">
        {weeks.map((w) => (
          <button
            key={w}
            onClick={() => setWeekFilter(w)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
              weekFilter === w
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Week {w}
          </button>
        ))}
        <button
          onClick={() => setWeekFilter("ALL")}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
            weekFilter === "ALL"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All Weeks
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-6">
        <button
          onClick={() => setTeamFilter("ALL")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
            teamFilter === "ALL"
              ? "bg-accent text-accent-foreground border-accent"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All Teams
        </button>
        {TEAM_LIST.map((t) => (
          <button
            key={t.abbr}
            onClick={() => setTeamFilter(t.abbr)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
              teamFilter === t.abbr
                ? "text-black border-transparent"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            style={teamFilter === t.abbr ? { backgroundColor: t.color } : undefined}
          >
            {t.abbr}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-muted-foreground"
        >
          No games match your filters. Try a different team or week.
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((game, i) => (
            <GameCard key={game._id} game={game} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
