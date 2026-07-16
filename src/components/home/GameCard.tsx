import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getTeam } from "@/lib/teams";
import { cn } from "@/lib/utils";
import { GameDTO, LiveGameScore } from "@/types";
import { TeamLogo } from "@/components/ui/TeamLogo";

function shortTime(kickoff: string): string {
  const d = new Date(kickoff);
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} ${time} ET`;
}

interface GameCardProps {
  game: GameDTO;
  index?: number;
  liveData?: LiveGameScore;
}

export function GameCard({ game, index = 0, liveData }: GameCardProps) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);

  // Merge live ESPN data on top of DB data
  const effectiveStatus = liveData?.status ?? game.status;
  const isLive = effectiveStatus === "live";
  const isHalftime = effectiveStatus === "halftime";
  const isFinal = effectiveStatus === "final";
  const showScore = isLive || isHalftime || isFinal;

  const homeScore = liveData?.homeScore ?? game.homeScore ?? 0;
  const awayScore = liveData?.awayScore ?? game.awayScore ?? 0;

  // index accepted for API compatibility
  void index;

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div
        className={cn(
          "flex border border-border bg-card rounded overflow-hidden card-hover",
          (isLive || isHalftime) && "border-[#FF6200]/40"
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
            {isHalftime ? (
              <span className="flex items-center gap-1 text-[10px] font-black text-orange-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                HALF
              </span>
            ) : isLive ? (
              <span className="flex items-center gap-1 text-[10px] font-black text-red-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                {liveData?.statusText ?? "LIVE"}
              </span>
            ) : isFinal ? (
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                {liveData?.statusText ?? "FINAL"}
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
                <TeamLogo abbr={away.abbr} size={28} />
                <span className="text-xs font-semibold truncate text-foreground/80">
                  {away.name}
                </span>
              </div>
              {showScore && (
                <span
                  className={cn(
                    "text-sm font-black tabular-nums shrink-0",
                    (isLive || isHalftime) && awayScore > homeScore
                      ? "text-[#FF6200]"
                      : "text-foreground"
                  )}
                >
                  {awayScore}
                </span>
              )}
            </div>

            <div className="h-px bg-border/40 mx-9" />

            {/* Home */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <TeamLogo abbr={home.abbr} size={28} />
                <span className="text-xs font-semibold truncate text-foreground/80">
                  {home.name}
                </span>
              </div>
              {showScore && (
                <span
                  className={cn(
                    "text-sm font-black tabular-nums shrink-0",
                    (isLive || isHalftime) && homeScore > awayScore
                      ? "text-[#FF6200]"
                      : "text-foreground"
                  )}
                >
                  {homeScore}
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
