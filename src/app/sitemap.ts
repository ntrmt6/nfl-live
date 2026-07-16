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
    { url: `${SITE_URL}/`,             lastModified: BUILT_AT,              changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/predictions`,  lastModified: BUILT_AT,              changeFrequency: "daily",   priority: 0.95 },
    { url: `${SITE_URL}/blog`,         lastModified: BUILT_AT,              changeFrequency: "daily",   priority: 0.85 },
    { url: `${SITE_URL}/contact`,      lastModified: new Date("2026-07-01"), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`,      lastModified: new Date("2026-07-01"), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/terms`,        lastModified: new Date("2026-07-01"), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/disclaimer`,   lastModified: new Date("2026-07-01"), changeFrequency: "yearly",  priority: 0.2 },
  ];

  const now = Date.now();

  const gameRoutes: MetadataRoute.Sitemap = games.map(({ slug, updatedAt, kickoff }) => {
    const hoursToKickoff = (kickoff.getTime() - now) / 3_600_000;
    // Games within 72 hours get highest priority — prediction content is most relevant
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

  return [...staticRoutes, ...gameRoutes, ...postRoutes];
}
