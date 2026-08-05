import type { MetadataRoute } from "next";
import { getAllGamesForSitemap } from "@/lib/data/games";
import { getAllPostsForSitemap } from "@/lib/data/posts";
import { getAllCollegeGameSlugs } from "@/lib/data/college-games";
import { TEAM_LIST, teamToSlug } from "@/lib/teams";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const BUILT_AT = new Date();

// ── Sport leagues (matches SportsScheduleTabs + detail page config) ──
const SPORT_LEAGUES: { id: string; espnSlug: string }[] = [
  { id: "nba",    espnSlug: "basketball/nba" },
  { id: "ncaab",  espnSlug: "basketball/mens-college-basketball" },
  { id: "epl",    espnSlug: "soccer/eng.1" },
  { id: "laliga", espnSlug: "soccer/esp.1" },
  { id: "ucl",    espnSlug: "soccer/UEFA.CHAMPIONS" },
  { id: "mls",    espnSlug: "soccer/usa.1" },
  { id: "seriea", espnSlug: "soccer/ita.1" },
  { id: "bundes", espnSlug: "soccer/ger.1" },
  { id: "mlb",    espnSlug: "baseball/mlb" },
  { id: "nhl",    espnSlug: "hockey/nhl" },
];

async function fetchEspnGameIds(espnSlug: string, leagueId: string): Promise<{ id: string; date: string }[]> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSlug}/scoreboard?limit=50`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events || []).map((e: any) => ({ id: e.id as string, date: e.date as string }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, posts, collegeSlugs, ...sportGameArrays] = await Promise.all([
    getAllGamesForSitemap(),
    getAllPostsForSitemap(),
    getAllCollegeGameSlugs(),
    ...SPORT_LEAGUES.map(l => fetchEspnGameIds(l.espnSlug, l.id)),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                  lastModified: BUILT_AT,              changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/predictions`,        lastModified: BUILT_AT,              changeFrequency: "daily",   priority: 0.95 },
    { url: `${SITE_URL}/college-football`,   lastModified: BUILT_AT,              changeFrequency: "daily",   priority: 0.93 },
    { url: `${SITE_URL}/blog`,               lastModified: BUILT_AT,              changeFrequency: "daily",   priority: 0.85 },
    { url: `${SITE_URL}/teams`,              lastModified: BUILT_AT,              changeFrequency: "weekly",  priority: 0.82 },
    { url: `${SITE_URL}/leaderboard`,        lastModified: BUILT_AT,              changeFrequency: "daily",   priority: 0.7 },
    { url: `${SITE_URL}/contact`,            lastModified: new Date("2026-07-01"), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`,            lastModified: new Date("2026-07-01"), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/terms`,              lastModified: new Date("2026-07-01"), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/disclaimer`,         lastModified: new Date("2026-07-01"), changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Team hub pages — overview, games, blog for all 32 teams
  const teamRoutes: MetadataRoute.Sitemap = TEAM_LIST.flatMap((team) => {
    const slug = teamToSlug(team.name);
    const base = `${SITE_URL}/teams/${slug}`;
    return [
      { url: base,               lastModified: BUILT_AT, changeFrequency: "daily"  as const, priority: 0.80 },
      { url: `${base}/games`,    lastModified: BUILT_AT, changeFrequency: "daily"  as const, priority: 0.75 },
      { url: `${base}/blog`,     lastModified: BUILT_AT, changeFrequency: "weekly" as const, priority: 0.70 },
    ];
  });

  const now = Date.now();

  const gameRoutes: MetadataRoute.Sitemap = games.map(({ slug, updatedAt, kickoff }) => {
    const hoursToKickoff = (kickoff.getTime() - now) / 3_600_000;
    const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
      hoursToKickoff < 24 ? "hourly" : hoursToKickoff < 72 ? "daily" : "weekly";
    const priority = hoursToKickoff < 24 ? 0.95 : hoursToKickoff < 72 ? 0.85 : 0.7;
    return { url: `${SITE_URL}/games/${slug}`, lastModified: updatedAt, changeFrequency, priority };
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const collegeRoutes: MetadataRoute.Sitemap = collegeSlugs.map(slug => ({
    url: `${SITE_URL}/college-football/${slug}`,
    lastModified: BUILT_AT,
    changeFrequency: "weekly" as const,
    priority: 0.80,
  }));

  // Sport prediction pages — one entry per live ESPN game per league
  const sportRoutes: MetadataRoute.Sitemap = SPORT_LEAGUES.flatMap((league, i) =>
    (sportGameArrays[i] || []).map(({ id, date }) => {
      const gameDate = new Date(date);
      const hoursToGame = (gameDate.getTime() - now) / 3_600_000;
      const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
        hoursToGame < 24 ? "hourly" : "daily";
      const priority = hoursToGame < 24 ? 0.88 : 0.78;
      return {
        url: `${SITE_URL}/sport/${league.id}/${id}`,
        lastModified: gameDate,
        changeFrequency,
        priority,
      };
    })
  );

  return [...staticRoutes, ...teamRoutes, ...gameRoutes, ...postRoutes, ...collegeRoutes, ...sportRoutes];
}
