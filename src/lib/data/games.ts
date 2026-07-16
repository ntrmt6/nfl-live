import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import { GameDTO } from "@/types";

function serialize(doc: any): GameDTO {
  return {
    _id: doc._id.toString(),
    slug: doc.slug,
    season: doc.season,
    week: doc.week,
    homeTeam: doc.homeTeam,
    awayTeam: doc.awayTeam,
    homeTeamFull: doc.homeTeamFull,
    awayTeamFull: doc.awayTeamFull,
    venue: doc.venue,
    kickoff: new Date(doc.kickoff).toISOString(),
    network: doc.network,
    status: doc.status,
    homeScore: doc.homeScore,
    awayScore: doc.awayScore,
    affiliateUrl: doc.affiliateUrl,
    viewerCountBase: doc.viewerCountBase,
    featured: doc.featured,
    description: doc.description,
  };
}

export async function getUpcomingGames(limit = 60): Promise<GameDTO[]> {
  try {
    await connectDB();
    const games = await Game.find({})
      .sort({ kickoff: 1 })
      .limit(limit)
      .lean();
    return games.map(serialize);
  } catch (err) {
    console.warn("[getUpcomingGames] Falling back to empty list:", (err as Error).message);
    return [];
  }
}

export async function getGameBySlug(slug: string): Promise<GameDTO | null> {
  try {
    await connectDB();
    const game = await Game.findOne({ slug }).lean();
    if (!game) return null;
    return serialize(game);
  } catch (err) {
    console.warn("[getGameBySlug] DB unavailable:", (err as Error).message);
    return null;
  }
}

export async function getAllGameSlugs(): Promise<string[]> {
  try {
    await connectDB();
    const games = await Game.find({}, "slug").lean();
    return games.map((g: any) => g.slug);
  } catch {
    return [];
  }
}

export async function getAllGamesForSitemap(): Promise<{ slug: string; updatedAt: Date; kickoff: Date }[]> {
  try {
    await connectDB();
    const games = await Game.find({}, "slug updatedAt kickoff").lean();
    return games.map((g: any) => ({
      slug: g.slug,
      updatedAt: new Date(g.updatedAt),
      kickoff: new Date(g.kickoff),
    }));
  } catch {
    return [];
  }
}
