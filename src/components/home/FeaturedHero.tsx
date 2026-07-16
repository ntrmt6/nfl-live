"use client";

import Link from "next/link";
import { Radio, MapPin, Tv, Calendar } from "lucide-react";
import { getTeam } from "@/lib/teams";
import { formatGameTime } from "@/lib/utils";
import { GameDTO } from "@/types";
import { cn } from "@/lib/utils";

interface FeaturedHeroProps {
  game: GameDTO | null;
}

export function FeaturedHero({ game }: FeaturedHeroProps) {
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
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <Link href={`/games/${game.slug}`} className="group block w-full">
      <div className="relative w-full rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-glow">
        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-400">
              <span className="live-pulse" />
              LIVE
            </span>
          ) : isFinal ? (
            <span className="inline-flex items-center rounded-full bg-secondary border border-border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              FINAL
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-[rgba(0,168,255,0.12)] border border-[rgba(0,168,255,0.25)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#00A8FF]">
              UPCOMING
            </span>
          )}
        </div>

        {/* Split-screen matchup */}
        <div className="flex min-h-[180px]">
          {/* Away team half */}
          <div
            className="relative flex-1 flex flex-col items-center justify-center py-8 px-4 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${away.color}55 0%, ${away.color}20 60%, transparent 100%)`,
            }}
          >
            {/* Subtle large abbr watermark */}
            <span
              className="absolute inset-0 flex items-center justify-center text-[6rem] font-black opacity-[0.04] select-none pointer-events-none"
              aria-hidden
              style={{ color: away.color }}
            >
              {away.abbr}
            </span>

            {/* Team swatch */}
            <span
              className="inline-flex items-center justify-center h-10 w-14 rounded-md text-sm font-black text-white shadow mb-2"
              style={{ backgroundColor: away.color }}
            >
              {away.abbr}
            </span>

            <span className="text-4xl font-black tracking-tighter text-foreground leading-none mb-1">
              {away.abbr}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {away.name}
            </span>

            {/* Score if live/final */}
            {(isLive || isFinal) && (
              <span className="mt-2 text-2xl font-black tabular-nums text-foreground">
                {game.awayScore ?? 0}
              </span>
            )}

            <span className="mt-1 text-[10px] text-muted-foreground/50 uppercase tracking-wide">
              Away
            </span>
          </div>

          {/* Center divider with VS */}
          <div className="flex flex-col items-center justify-center z-10 px-2 shrink-0">
            <div className="flex flex-col items-center gap-2">
              <div className="h-px w-px" />
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border text-[11px] font-black text-foreground/70 shadow">
                VS
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Wk {game.week}
              </span>
            </div>
          </div>

          {/* Home team half */}
          <div
            className="relative flex-1 flex flex-col items-center justify-center py-8 px-4 overflow-hidden"
            style={{
              background: `linear-gradient(225deg, ${home.color}55 0%, ${home.color}20 60%, transparent 100%)`,
            }}
          >
            {/* Subtle large abbr watermark */}
            <span
              className="absolute inset-0 flex items-center justify-center text-[6rem] font-black opacity-[0.04] select-none pointer-events-none"
              aria-hidden
              style={{ color: home.color }}
            >
              {home.abbr}
            </span>

            {/* Team swatch */}
            <span
              className="inline-flex items-center justify-center h-10 w-14 rounded-md text-sm font-black text-white shadow mb-2"
              style={{ backgroundColor: home.color }}
            >
              {home.abbr}
            </span>

            <span className="text-4xl font-black tracking-tighter text-foreground leading-none mb-1">
              {home.abbr}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {home.name}
            </span>

            {/* Score if live/final */}
            {(isLive || isFinal) && (
              <span className="mt-2 text-2xl font-black tabular-nums text-foreground">
                {game.homeScore ?? 0}
              </span>
            )}

            <span className="mt-1 text-[10px] text-muted-foreground/50 uppercase tracking-wide">
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
