import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/games/", "/predictions", "/contact", "/privacy", "/terms", "/disclaimer"],
        disallow: ["/admin/", "/api/", "/profile"],
      },
      {
        // Block AI training crawlers
        userAgent: ["GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Google-Extended", "Omgili", "Diffbot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
