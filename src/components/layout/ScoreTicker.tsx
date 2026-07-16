"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameDTO } from "@/types";
import { getTeam } from "@/lib/teams";

function formatTickerTime(kickoff: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(kickoff));
}

function TickerItem({ game }: { game: GameDTO }) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <Link
      href={`/games/${game.slug}`}
      className="flex items-center gap-2.5 px-5 py-0 shrink-0 hover:bg-white/5 transition-colors h-full border-r border-white/[0.08]"
    >
      {isLive && (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
          LIVE
        </span>
      )}
      {isFinal && (
        <span className="text-[10px] font-bold uppercase text-muted-foreground">
          FINAL
        </span>
      )}
      {!isLive && !isFinal && (
        <span className="text-[10px] font-semibold text-muted-foreground">
          {formatTickerTime(game.kickoff)}
        </span>
      )}

      <div className="flex items-center gap-1.5 text-sm">
        <span
          className="text-[11px] font-black tabular-nums"
          style={{ color: away.color === "#000000" ? "#aaaaaa" : away.color }}
        >
          {away.abbr}
        </span>
        {isLive || isFinal ? (
          <>
            <span className="font-black text-foreground tabular-nums">
              {game.awayScore ?? 0}
            </span>
            <span className="text-muted-foreground font-light">-</span>
            <span className="font-black text-foreground tabular-nums">
              {game.homeScore ?? 0}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground text-xs">vs</span>
        )}
        <span
          className="text-[11px] font-black tabular-nums"
          style={{ color: home.color === "#000000" ? "#aaaaaa" : home.color }}
        >
          {home.abbr}
        </span>
      </div>

      {game.network && (
        <span
          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ background: "rgba(0,168,255,0.15)", color: "#00A8FF" }}
        >
          {game.network}
        </span>
      )}
    </Link>
  );
}

export function ScoreTicker() {
  const [games, setGames] = useState<GameDTO[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/games?limit=20&status=live,scheduled")
      .then((r) => r.json())
      .then((data) => {
        const list: GameDTO[] = Array.isArray(data)
          ? data
          : (data.games ?? []);
        // Sort: live first, then by kickoff ascending
        list.sort((a, b) => {
          if (a.status === "live" && b.status !== "live") return -1;
          if (b.status === "live" && a.status !== "live") return 1;
          return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
        });
        setGames(list.slice(0, 20));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const Label = (
    <div className="px-3 h-full flex items-center bg-[#FF6200] shrink-0 z-10">
      <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">
        NFL Scores
      </span>
    </div>
  );

  if (!loaded || games.length === 0) {
    return (
      <div className="h-8 bg-[#0a0d14] flex items-center border-b border-border overflow-hidden">
        {Label}
        <div className="flex items-center gap-4 px-4 text-xs text-muted-foreground">
          {!loaded ? "Loading scores…" : "No games today — check the schedule."}
        </div>
      </div>
    );
  }

  // Duplicate items for seamless CSS loop (translateX(-50%) at 100% keyframe)
  const items = [...games, ...games];

  return (
    <div className="h-8 bg-[#0a0d14] flex items-center overflow-hidden border-b border-border">
      {Label}

      <div className="relative flex-1 overflow-hidden h-full">
        {/* Right-side fade-out gradient */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, #0a0d14 0%, transparent 100%)",
          }}
        />

        {/* Scrolling track — pause-on-hover handled by CSS .ticker-track:hover rule in globals.css */}
        <div className="ticker-track animate-ticker h-full flex items-center">
          {items.map((game, i) => (
            <TickerItem key={`${game._id}-${i}`} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}
