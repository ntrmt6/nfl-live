import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import { GameDTO } from "@/types";
import { syncResults } from "@/lib/syncResults";

const STALE_AFTER_MS = 4 * 60 * 60 * 1000; // 4h after kickoff
const lazySyncCooldown = new Map<string, number>();
const COOLDOWN_MS = 10 * 60 * 1000;

function maybeLazySync(game: { slug: string; season: number; week: number; kickoff: Date | string; status: string }) {
  if (game.status === "final") return;
  const kickoffMs = new Date(game.kickoff).getTime();
  if (Date.now() - kickoffMs < STALE_AFTER_MS) return;
  const last = lazySyncCooldown.get(game.slug) ?? 0;
  if (Date.now() - last < COOLDOWN_MS) return;
  lazySyncCooldown.set(game.slug, Date.now());
  syncResults({ season: game.season, week: game.week }).catch(() => {});
}

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
    maybeLazySync(game);
    return serialize(game);
  } catch (err) {
    console.warn("[getGameBySlug] DB unavailable:", (err as Error).message);
    return null;
  }
}

export async function getRelatedGames(opts: {
  season: number;
  week: number;
  homeTeam: string;
  awayTeam: string;
  excludeSlug: string;
  limit?: number;
}): Promise<GameDTO[]> {
  try {
    await connectDB();
    const games = await Game.find({
      season: opts.season,
      $or: [
        { week: opts.week },
        { homeTeam: { $in: [opts.homeTeam, opts.awayTeam] } },
        { awayTeam: { $in: [opts.homeTeam, opts.awayTeam] } },
      ],
      slug: { $ne: opts.excludeSlug },
    })
      .sort({ kickoff: 1 })
      .limit(opts.limit ?? 20)
      .lean();
    return games.map(serialize);
  } catch {
    return [];
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

export async function getTeamGames(abbr: string, limit = 40): Promise<GameDTO[]> {
  try {
    await connectDB();
    const games = await Game.find({ $or: [{ homeTeam: abbr }, { awayTeam: abbr }] })
      .sort({ kickoff: 1 })
      .limit(limit)
      .lean();
    return games.map(serialize);
  } catch (err) {
    console.warn("[getTeamGames] DB unavailable:", (err as Error).message);
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
