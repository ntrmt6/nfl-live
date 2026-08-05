import Link from "next/link";
import { Tv, MapPin } from "lucide-react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { getTeam } from "@/lib/teams";
import { formatGameTime, isLiveNow } from "@/lib/utils";
import type { GameDTO } from "@/types";

export function TeamGameCard({ game, highlightAbbr }: { game: GameDTO; highlightAbbr: string }) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const live = isLiveNow(game.kickoff);
  const final = game.status === "final";
  const upcoming = !live && !final;

  const isHighlightHome = game.homeTeam === highlightAbbr;

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-[#FF6200]/40 hover:shadow-sm transition-all">

        {/* Status pill */}
        <div className="shrink-0 w-14 text-center">
          {live ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              Live
            </span>
          ) : final ? (
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Final</span>
          ) : (
            <span className="text-[10px] font-bold text-[#FF6200] uppercase">
              {new Date(game.kickoff).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Away team */}
        <div className={`flex items-center gap-2 flex-1 ${!isHighlightHome ? "opacity-100" : "opacity-60"}`}>
          <TeamLogo abbr={game.awayTeam} size={32} />
          <span className="text-sm font-bold hidden sm:block">{away.name}</span>
          <span className="text-sm font-bold sm:hidden">{game.awayTeam}</span>
        </div>

        {/* Score / @ */}
        <div className="shrink-0 text-center min-w-[56px]">
          {final && game.homeScore != null && game.awayScore != null ? (
            <span className="text-base font-black tabular-nums">
              {game.awayScore}–{game.homeScore}
            </span>
          ) : live && game.homeScore != null && game.awayScore != null ? (
            <span className="text-base font-black tabular-nums text-red-400">
              {game.awayScore}–{game.homeScore}
            </span>
          ) : (
            <span className="text-muted-foreground/50 font-bold text-lg">@</span>
          )}
        </div>

        {/* Home team */}
        <div className={`flex items-center gap-2 flex-1 justify-end ${isHighlightHome ? "opacity-100" : "opacity-60"}`}>
          <span className="text-sm font-bold hidden sm:block">{home.name}</span>
          <span className="text-sm font-bold sm:hidden">{game.homeTeam}</span>
          <TeamLogo abbr={game.homeTeam} size={32} />
        </div>

        {/* Meta */}
        <div className="shrink-0 text-right hidden md:block space-y-0.5">
          {upcoming && (
            <p className="text-[10px] text-muted-foreground">
              {new Date(game.kickoff).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          )}
          {game.network && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
              <Tv className="h-3 w-3" />{game.network}
            </p>
          )}
          {game.venue && (
            <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1 justify-end">
              <MapPin className="h-3 w-3" />{game.venue}
            </p>
          )}
        </div>

        <span className="text-[#FF6200] text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          Predict →
        </span>
      </div>
    </Link>
  );
}
