import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getTeam } from "@/lib/teams";
import { cn } from "@/lib/utils";
import { GameDTO } from "@/types";

function shortTime(kickoff: string): string {
  const d = new Date(kickoff);
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} ${time} ET`;
}

export function GameCard({ game, index = 0 }: { game: GameDTO; index?: number }) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const showScore = isLive || isFinal;

  // index is accepted for API compatibility but animation is handled by CSS
  void index;

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div
        className={cn(
          "flex border border-border bg-card rounded overflow-hidden card-hover",
          isLive && "border-[#FF6200]/40"
        )}
      >
        {/* Left color bar */}
        <div
          className="w-[3px] shrink-0"
          style={{
            background: `linear-gradient(180deg, ${away.color}, ${home.color})`,
          }}
        />

        <div className="flex-1 min-w-0 p-3">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              WK {game.week}
            </span>
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] font-black text-red-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            ) : isFinal ? (
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                FINAL
              </span>
            ) : (
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: "#00A8FF" }}
              >
                UPCOMING
              </span>
            )}
          </div>

          {/* Teams */}
          <div className="space-y-1.5">
            {/* Away */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded text-[10px] font-black text-white shrink-0"
                  style={{
                    background: away.color === "#000000" ? "#222" : away.color,
                  }}
                >
                  {away.abbr}
                </span>
                <span className="text-xs font-semibold truncate text-foreground/80">
                  {away.name}
                </span>
              </div>
              {showScore && (
                <span
                  className={cn(
                    "text-sm font-black tabular-nums shrink-0",
                    isLive && (game.awayScore ?? 0) > (game.homeScore ?? 0)
                      ? "text-[#FF6200]"
                      : "text-foreground"
                  )}
                >
                  {game.awayScore ?? 0}
                </span>
              )}
            </div>

            <div className="h-px bg-border/40 mx-9" />

            {/* Home */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded text-[10px] font-black text-white shrink-0"
                  style={{
                    background: home.color === "#000000" ? "#222" : home.color,
                  }}
                >
                  {home.abbr}
                </span>
                <span className="text-xs font-semibold truncate text-foreground/80">
                  {home.name}
                </span>
              </div>
              {showScore && (
                <span
                  className={cn(
                    "text-sm font-black tabular-nums shrink-0",
                    isLive && (game.homeScore ?? 0) > (game.awayScore ?? 0)
                      ? "text-[#FF6200]"
                      : "text-foreground"
                  )}
                >
                  {game.homeScore ?? 0}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 text-[10px] text-muted-foreground">
              {game.network && (
                <span
                  className="font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    background: "rgba(0,168,255,0.12)",
                    color: "#00A8FF",
                  }}
                >
                  {game.network}
                </span>
              )}
              <span className="truncate">{shortTime(game.kickoff)}</span>
            </div>
            <span
              className="flex items-center gap-0.5 text-[11px] font-bold shrink-0 group-hover:text-[#FF6200] transition-colors"
              style={{ color: "#FF6200" }}
            >
              Watch <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
