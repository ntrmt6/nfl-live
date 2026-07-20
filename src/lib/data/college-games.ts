import { connectDB } from "@/lib/db";
import CollegeGame from "@/models/CollegeGame";
import { CollegeGameDTO } from "@/models/CollegeGame";

function serialize(doc: any): CollegeGameDTO {
  return {
    _id: doc._id.toString(),
    slug: doc.slug,
    espnId: doc.espnId,
    season: doc.season,
    week: doc.week,
    homeTeam: doc.homeTeam,
    awayTeam: doc.awayTeam,
    homeTeamFull: doc.homeTeamFull,
    awayTeamFull: doc.awayTeamFull,
    homeTeamLogo: doc.homeTeamLogo,
    awayTeamLogo: doc.awayTeamLogo,
    homeColor: doc.homeColor,
    awayColor: doc.awayColor,
    venue: doc.venue,
    city: doc.city,
    kickoff: new Date(doc.kickoff).toISOString(),
    network: doc.network,
    status: doc.status,
    homeScore: doc.homeScore,
    awayScore: doc.awayScore,
    conference: doc.conference,
    awayConference: doc.awayConference,
    isRivalry: doc.isRivalry,
    isBowlGame: doc.isBowlGame,
    bowlName: doc.bowlName,
    isPlayoff: doc.isPlayoff,
    neutral: doc.neutral,
    viewerCountBase: doc.viewerCountBase,
    featured: doc.featured,
    description: doc.description,
  };
}

export async function getUpcomingCollegeGames(limit = 100): Promise<CollegeGameDTO[]> {
  try {
    await connectDB();
    const games = await CollegeGame.find({})
      .sort({ kickoff: 1 })
      .limit(limit)
      .lean();
    return games.map(serialize);
  } catch (err) {
    console.warn("[getUpcomingCollegeGames] Falling back to empty list:", (err as Error).message);
    return [];
  }
}

export async function getCollegeGameBySlug(slug: string): Promise<CollegeGameDTO | null> {
  try {
    await connectDB();
    const game = await CollegeGame.findOne({ slug }).lean();
    if (!game) return null;
    return serialize(game);
  } catch (err) {
    console.warn("[getCollegeGameBySlug] DB unavailable:", (err as Error).message);
    return null;
  }
}

export async function getAllCollegeGameSlugs(): Promise<string[]> {
  try {
    await connectDB();
    const games = await CollegeGame.find({}, "slug").lean();
    return games.map((g: any) => g.slug);
  } catch {
    return [];
  }
}

export async function getFeaturedCollegeGames(limit = 6): Promise<CollegeGameDTO[]> {
  try {
    await connectDB();
    const games = await CollegeGame.find({ featured: true })
      .sort({ kickoff: 1 })
      .limit(limit)
      .lean();
    return games.map(serialize);
  } catch (err) {
    console.warn("[getFeaturedCollegeGames] Falling back to empty list:", (err as Error).message);
    return [];
  }
}

export async function getCollegeGamesByConference(
  conference: string,
  limit = 30
): Promise<CollegeGameDTO[]> {
  try {
    await connectDB();
    const games = await CollegeGame.find({ conference })
      .sort({ kickoff: 1 })
      .limit(limit)
      .lean();
    return games.map(serialize);
  } catch (err) {
    console.warn("[getCollegeGamesByConference] Falling back to empty list:", (err as Error).message);
    return [];
  }
}
