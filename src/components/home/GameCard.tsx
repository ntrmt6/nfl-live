"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Radio, Tv, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getTeam } from "@/lib/teams";
import { formatGameTime } from "@/lib/utils";
import { GameDTO } from "@/types";

export function GameCard({ game, index = 0 }: { game: GameDTO; index?: number }) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link href={`/games/${game.slug}`} className="group block h-full">
        <div className="relative h-full rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-glow hover:-translate-y-1">
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${away.color}, ${home.color})`,
            }}
          />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground">
                Week {game.week}
              </span>
              {isLive ? (
                <Badge variant="live" className="gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </Badge>
              ) : isFinal ? (
                <Badge variant="secondary">FINAL</Badge>
              ) : (
                <Badge variant="neon">UPCOMING</Badge>
              )}
            </div>

            <div className="space-y-3">
              <TeamRow abbr={away.abbr} name={away.name} color={away.color} score={game.awayScore} showScore={isFinal || isLive} />
              <TeamRow abbr={home.abbr} name={home.name} color={home.color} score={game.homeScore} showScore={isFinal || isLive} />
            </div>

            <div className="mt-5 pt-4 border-t border-border flex flex-col gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Tv className="h-3.5 w-3.5" />
                {formatGameTime(game.kickoff)} &middot; {game.network || "TBD"}
              </div>
              {game.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {game.venue}
                </div>
              )}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
              <Radio className="h-4 w-4" />
              Watch Game Coverage
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function TeamRow({
  abbr,
  name,
  color,
  score,
  showScore,
}: {
  abbr: string;
  name: string;
  color: string;
  score?: number;
  showScore?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-bold text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {abbr}
        </span>
        <span className="text-sm font-medium text-foreground/90 truncate">{name}</span>
      </div>
      {showScore && (
        <span className="text-sm font-bold text-foreground tabular-nums">{score ?? "-"}</span>
      )}
    </div>
  );
}
