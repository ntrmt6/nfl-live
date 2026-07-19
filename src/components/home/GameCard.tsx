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

  const effectiveStatus = liveData?.status ?? game.status;
  const isLive = effectiveStatus === "live";
  const isHalftime = effectiveStatus === "halftime";
  const isFinal = effectiveStatus === "final";
  const showScore = isLive || isHalftime || isFinal;

  const homeScore = liveData?.homeScore ?? game.homeScore ?? 0;
  const awayScore = liveData?.awayScore ?? game.awayScore ?? 0;

  void index;

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div
        className={cn(
          "relative flex flex-col border border-border/70 bg-card rounded-lg overflow-hidden card-hover",
          (isLive || isHalftime) && "border-[#FF6200]/50"
        )}
      >
        {/* Top accent bar — gradient of both team colors */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${away.color}, ${home.color})` }}
        />

        <div className="flex-1 min-w-0 p-3.5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
              Week {game.week}
            </span>
            {isHalftime ? (
              <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-black text-orange-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                HALFTIME
              </span>
            ) : isLive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                {liveData?.statusText ?? "LIVE"}
              </span>
            ) : isFinal ? (
              <span className="rounded-full bg-secondary/80 border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                FINAL
              </span>
            ) : (
              <span className="rounded-full bg-[rgba(0,168,255,0.08)] border border-[rgba(0,168,255,0.2)] px-2 py-0.5 text-[10px] font-bold uppercase text-[#00A8FF]">
                UPCOMING
              </span>
            )}
          </div>

          {/* Teams */}
          <div className="space-y-2">
            {/* Away */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <TeamLogo abbr={away.abbr} size={32} />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wide leading-none mb-0.5">Away</p>
                  <p className="text-sm font-bold truncate text-foreground">{away.name}</p>
                </div>
              </div>
              {showScore && (
                <span className={cn(
                  "text-xl font-black tabular-nums shrink-0",
                  (isLive || isHalftime) && awayScore > homeScore ? "text-[#FF6200]" : "text-foreground/90"
                )}>
                  {awayScore}
                </span>
              )}
            </div>

            <div className="h-px bg-border/50 mx-10" />

            {/* Home */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <TeamLogo abbr={home.abbr} size={32} />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wide leading-none mb-0.5">Home</p>
                  <p className="text-sm font-bold truncate text-foreground">{home.name}</p>
                </div>
              </div>
              {showScore && (
                <span className={cn(
                  "text-xl font-black tabular-nums shrink-0",
                  (isLive || isHalftime) && homeScore > awayScore ? "text-[#FF6200]" : "text-foreground/90"
                )}>
                  {homeScore}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 text-[10px] text-muted-foreground">
              {game.network && (
                <span className="font-black px-1.5 py-0.5 rounded-md shrink-0 bg-[rgba(0,168,255,0.1)] text-[#00A8FF] border border-[rgba(0,168,255,0.15)]">
                  {game.network}
                </span>
              )}
              <span className="truncate">{shortTime(game.kickoff)}</span>
            </div>
            <span className="flex items-center gap-0.5 text-[11px] font-bold shrink-0 text-[#FF6200] group-hover:gap-1.5 transition-all">
              Preview <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
