import { connectDB } from "@/lib/db";
import Prediction, { IPrediction } from "@/models/Prediction";

function serialize(doc: any): IPrediction {
  return {
    _id: doc._id.toString(),
    gameId: doc.gameId?.toString(),
    slug: doc.slug,
    season: doc.season,
    week: doc.week,
    homeTeam: doc.homeTeam,
    awayTeam: doc.awayTeam,
    homeTeamFull: doc.homeTeamFull,
    awayTeamFull: doc.awayTeamFull,
    kickoff: doc.kickoff,
    homeWinProbability: doc.homeWinProbability,
    awayWinProbability: doc.awayWinProbability,
    predictedWinner: doc.predictedWinner,
    confidence: doc.confidence,
    modelAccuracy: doc.modelAccuracy,
    homeTeamStats: doc.homeTeamStats,
    awayTeamStats: doc.awayTeamStats,
    generatedAt: doc.generatedAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getPredictionForGame(
  homeTeam: string,
  awayTeam: string,
  week: number,
  season: number
): Promise<IPrediction | null> {
  try {
    await connectDB();
    const pred = await Prediction.findOne({
      homeTeam,
      awayTeam,
      week,
      season,
      _type: { $exists: false },
    }).lean();
    if (!pred) return null;
    return serialize(pred);
  } catch (err) {
    console.warn("[getPredictionForGame] DB unavailable:", (err as Error).message);
    return null;
  }
}
