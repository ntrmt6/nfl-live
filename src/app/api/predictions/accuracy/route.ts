import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import Prediction from "@/models/Prediction";
import CollegeGame from "@/models/CollegeGame";
import CollegePrediction from "@/models/CollegePrediction";
import { computeAccuracy } from "@/lib/predictionAccuracy";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const league = searchParams.get("league") === "cfb" ? "cfb" : "nfl";
  const seasonParam = searchParams.get("season");

  const GameModel = (league === "cfb" ? CollegeGame : Game) as typeof Game;
  const PredictionModel = (league === "cfb" ? CollegePrediction : Prediction) as typeof Prediction;

  const seasons: number[] = (await GameModel.distinct("season", { status: "final" })).sort(
    (a: number, b: number) => b - a
  );
  const season = seasonParam ? Number(seasonParam) : seasons[0];

  const gameQuery: Record<string, unknown> = {
    status: "final",
    homeScore: { $exists: true },
    awayScore: { $exists: true },
  };
  if (season) gameQuery.season = season;

  const finalGames = await GameModel.find(gameQuery)
    .select("season week homeTeam awayTeam homeScore awayScore")
    .lean();

  const predictionQuery: Record<string, unknown> = { _type: { $exists: false } };
  if (season) predictionQuery.season = season;

  const predictions = await PredictionModel.find(predictionQuery)
    .select("season week homeTeam awayTeam predictedWinner confidence")
    .lean();

  const summary = computeAccuracy(
    finalGames as any,
    predictions as any
  );

  return NextResponse.json({ league, season: season ?? null, seasons, ...summary });
}
