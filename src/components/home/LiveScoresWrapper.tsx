"use client";

import { FeaturedHero } from "./FeaturedHero";
import { ScheduleGrid } from "./ScheduleGrid";
import { useLiveScores } from "@/hooks/useLiveScores";
import { GameDTO } from "@/types";

interface LiveScoresWrapperProps {
  featuredGame: GameDTO | null;
  games: GameDTO[];
}

export function LiveScoresWrapper({ featuredGame, games }: LiveScoresWrapperProps) {
  const liveScores = useLiveScores();

  return (
    <>
      <FeaturedHero game={featuredGame} liveScores={liveScores} />
      <ScheduleGrid games={games} liveScores={liveScores} />
    </>
  );
}
