import type { MetadataRoute } from "next";
import { getAllGamesForSitemap } from "@/lib/data/games";
import { getAllPostsForSitemap } from "@/lib/data/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const BUILT_AT = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, posts] = await Promise.all([
    getAllGamesForSitemap(),
    getAllPostsForSitemap(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,           lastModified: BUILT_AT,                  changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/blog`,       lastModified: BUILT_AT,                  changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/contact`,    lastModified: new Date("2026-07-01"),     changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`,    lastModified: new Date("2026-07-01"),     changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/terms`,      lastModified: new Date("2026-07-01"),     changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/disclaimer`, lastModified: new Date("2026-07-01"),     changeFrequency: "yearly",  priority: 0.2 },
  ];

  const now = Date.now();

  const gameRoutes: MetadataRoute.Sitemap = games.map(({ slug, updatedAt, kickoff }) => {
    const hoursToKickoff = (kickoff.getTime() - now) / 3_600_000;
    const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
      hoursToKickoff < 24 ? "hourly" : "weekly";
    const priority = hoursToKickoff < 24 ? 0.9 : 0.7;
    return { url: `${SITE_URL}/games/${slug}`, lastModified: updatedAt, changeFrequency, priority };
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...gameRoutes, ...postRoutes];
}
