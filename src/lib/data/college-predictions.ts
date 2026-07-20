import { connectDB } from "@/lib/db";
import CollegePrediction, { ICollegePrediction, CollegePredictionDTO } from "@/models/CollegePrediction";

function serialize(doc: any): CollegePredictionDTO {
  return {
    _id: doc._id.toString(),
    gameId: doc.gameId?.toString(),
    slug: doc.slug,
    espnId: doc.espnId,
    season: doc.season,
    week: doc.week,
    homeTeam: doc.homeTeam,
    awayTeam: doc.awayTeam,
    homeTeamFull: doc.homeTeamFull,
    awayTeamFull: doc.awayTeamFull,
    kickoff: doc.kickoff ? new Date(doc.kickoff).toISOString() : undefined,
    homeWinProbability: doc.homeWinProbability,
    awayWinProbability: doc.awayWinProbability,
    predictedWinner: doc.predictedWinner,
    confidence: doc.confidence,
    modelAccuracy: doc.modelAccuracy,
    homeTeamStats: doc.homeTeamStats,
    awayTeamStats: doc.awayTeamStats,
    conditionLayers: doc.conditionLayers,
    historicalH2H: doc.historicalH2H,
    seasonRecords: doc.seasonRecords,
    generatedAt: doc.generatedAt,
    _type: doc._type,
    accuracy: doc.accuracy,
    trainingSamples: doc.trainingSamples,
    seasons: doc.seasons,
    updatedAt: doc.updatedAt,
  };
}

export async function getCollegePredictionForGame(
  homeTeam: string,
  awayTeam: string,
  season: number
): Promise<CollegePredictionDTO | null> {
  try {
    await connectDB();
    const pred = await CollegePrediction.findOne({
      homeTeam,
      awayTeam,
      season,
      _type: { $exists: false },
    }).lean();
    if (!pred) return null;
    return serialize(pred);
  } catch (err) {
    console.warn("[getCollegePredictionForGame] DB unavailable:", (err as Error).message);
    return null;
  }
}

export async function getCollegePredictionBySlug(slug: string): Promise<CollegePredictionDTO | null> {
  try {
    await connectDB();
    const pred = await CollegePrediction.findOne({ slug }).lean();
    if (!pred) return null;
    return serialize(pred);
  } catch (err) {
    console.warn("[getCollegePredictionBySlug] DB unavailable:", (err as Error).message);
    return null;
  }
}

export async function getAllCollegePredictions(limit = 200): Promise<CollegePredictionDTO[]> {
  try {
    await connectDB();
    const preds = await CollegePrediction.find({ _type: { $exists: false } })
      .sort({ kickoff: 1 })
      .limit(limit)
      .lean();
    return preds.map(serialize);
  } catch (err) {
    console.warn("[getAllCollegePredictions] Falling back to empty list:", (err as Error).message);
    return [];
  }
}
