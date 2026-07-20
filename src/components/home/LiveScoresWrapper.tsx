"use client";

import { FeaturedHero } from "./FeaturedHero";
import { SportsScheduleTabs } from "./SportsScheduleTabs";
import { useLiveScores } from "@/hooks/useLiveScores";
import { GameDTO } from "@/types";
import { CollegeGameDTO } from "@/models/CollegeGame";

interface LiveScoresWrapperProps {
  featuredGame: GameDTO | null;
  games: GameDTO[];
  cfbGames: CollegeGameDTO[];
}

export function LiveScoresWrapper({ featuredGame, games, cfbGames }: LiveScoresWrapperProps) {
  const liveScores = useLiveScores();

  return (
    <>
      <FeaturedHero game={featuredGame} liveScores={liveScores} />
      <SportsScheduleTabs nflGames={games} cfbGames={cfbGames} liveScores={liveScores} />
    </>
  );
}
