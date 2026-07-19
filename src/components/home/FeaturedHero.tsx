"use client";

import Link from "next/link";
import { Radio, MapPin, Tv, Calendar } from "lucide-react";
import { getTeam } from "@/lib/teams";
import { formatGameTime } from "@/lib/utils";
import { GameDTO } from "@/types";
import { cn } from "@/lib/utils";
import type { LiveScoresMap } from "@/hooks/useLiveScores";
import { TeamLogo } from "@/components/ui/TeamLogo";

interface FeaturedHeroProps {
  game: GameDTO | null;
  liveScores?: LiveScoresMap;
}

export function FeaturedHero({ game, liveScores }: FeaturedHeroProps) {
  if (!game) {
    return (
      <div className="w-full rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No Featured Game</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Check back when the schedule is set.
          </p>
        </div>
      </div>
    );
  }

  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const liveData = liveScores?.get(`${game.awayTeam}-${game.homeTeam}`);
  const effectiveStatus = liveData?.status ?? game.status;
  const isLive = effectiveStatus === "live";
  const isHalftime = effectiveStatus === "halftime";
  const isFinal = effectiveStatus === "final";

  const homeScore = liveData?.homeScore ?? game.homeScore ?? 0;
  const awayScore = liveData?.awayScore ?? game.awayScore ?? 0;

  return (
    <Link href={`/games/${game.slug}`} className="group block w-full">
      <div className="relative w-full rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-glow">
        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          {isHalftime ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-orange-400">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              HALFTIME
            </span>
          ) : isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-400">
              <span className="live-pulse" />
              {liveData?.statusText ?? "LIVE"}
            </span>
          ) : isFinal ? (
            <span className="inline-flex items-center rounded-full bg-secondary border border-border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {liveData?.statusText ?? "FINAL"}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-[rgba(0,168,255,0.12)] border border-[rgba(0,168,255,0.25)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#00A8FF]">
              UPCOMING
            </span>
          )}
        </div>

        {/* Split-screen matchup */}
        <div className="flex min-h-[220px]">
          {/* Away team half */}
          <div
            className="relative flex-1 flex flex-col items-center justify-center py-10 px-6 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${away.color}40 0%, ${away.color}15 60%, transparent 100%)`,
            }}
          >
            <span
              className="absolute inset-0 flex items-center justify-center text-[8rem] font-black opacity-[0.035] select-none pointer-events-none"
              aria-hidden
              style={{ color: away.color }}
            >
              {away.abbr}
            </span>

            <TeamLogo abbr={away.abbr} size={72} className="mb-3 drop-shadow-xl" />

            <span className="text-3xl font-black tracking-tighter text-foreground leading-none mb-1">
              {away.abbr}
            </span>
            <span className="text-xs text-muted-foreground text-center leading-tight font-medium">
              {away.name}
            </span>

            {(isLive || isHalftime || isFinal) && (
              <span className={cn(
                "mt-3 text-4xl font-black tabular-nums leading-none",
                (isLive || isHalftime) && awayScore > homeScore ? "text-[#FF6200]" : "text-foreground"
              )}>
                {awayScore}
              </span>
            )}

            <span className="mt-2 text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
              Away
            </span>
          </div>

          {/* Center divider */}
          <div className="flex flex-col items-center justify-center z-10 px-3 shrink-0 gap-2">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="flex flex-col items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-background border-2 border-border text-[11px] font-black text-foreground/80 shadow-lg">
                VS
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 bg-secondary/60 px-2 py-0.5 rounded-full border border-border/50">
                Wk {game.week}
              </span>
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          {/* Home team half */}
          <div
            className="relative flex-1 flex flex-col items-center justify-center py-10 px-6 overflow-hidden"
            style={{
              background: `linear-gradient(225deg, ${home.color}40 0%, ${home.color}15 60%, transparent 100%)`,
            }}
          >
            <span
              className="absolute inset-0 flex items-center justify-center text-[8rem] font-black opacity-[0.035] select-none pointer-events-none"
              aria-hidden
              style={{ color: home.color }}
            >
              {home.abbr}
            </span>

            <TeamLogo abbr={home.abbr} size={72} className="mb-3 drop-shadow-xl" />

            <span className="text-3xl font-black tracking-tighter text-foreground leading-none mb-1">
              {home.abbr}
            </span>
            <span className="text-xs text-muted-foreground text-center leading-tight font-medium">
              {home.name}
            </span>

            {(isLive || isHalftime || isFinal) && (
              <span className={cn(
                "mt-3 text-4xl font-black tabular-nums leading-none",
                (isLive || isHalftime) && homeScore > awayScore ? "text-[#FF6200]" : "text-foreground"
              )}>
                {homeScore}
              </span>
            )}

            <span className="mt-2 text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
              Home
            </span>
          </div>
        </div>

        {/* Bottom info strip */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border/50"
          style={{
            background: `linear-gradient(90deg, ${away.color}18 0%, transparent 40%, transparent 60%, ${home.color}18 100%)`,
          }}
        >
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Tv className="h-3 w-3 shrink-0" />
              {formatGameTime(game.kickoff)}
            </span>
            {game.network && (
              <span className="inline-flex items-center gap-1 rounded bg-secondary/60 border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground/70">
                {game.network}
              </span>
            )}
            {game.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {game.venue}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-black transition-all group-hover:brightness-110">
            <Radio className="h-3.5 w-3.5" />
            Watch Live →
          </span>
        </div>
      </div>
    </Link>
  );
}
