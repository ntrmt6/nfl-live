import { getUpcomingGames } from "@/lib/data/games";
import { getPublishedPosts } from "@/lib/data/posts";
import { BreakingNewsFeed } from "@/components/home/BreakingNewsFeed";
import { LiveScoresWrapper } from "@/components/home/LiveScoresWrapper";
import { StandingsWidget } from "@/components/home/StandingsWidget";
import { LeagueLeaders } from "@/components/home/LeagueLeaders";
import { BlogTeaser } from "@/components/blog/BlogTeaser";

export const revalidate = 60;

export default async function HomePage() {
  const [games, posts] = await Promise.all([
    getUpcomingGames(60),
    getPublishedPosts(15),
  ]);

  const featuredGame = games.find((g) => g.featured) ?? games[0] ?? null;

  return (
    <div className="bg-background min-h-screen">
      <div className="container py-4 xl:py-5">
        <div className="flex gap-4 xl:gap-5 items-start">

          {/* LEFT COLUMN — Breaking News, sticky */}
          <aside className="hidden xl:block w-56 shrink-0">
            <BreakingNewsFeed posts={posts} />
          </aside>

          {/* CENTER COLUMN — Featured + Schedule + Blog */}
          <main className="flex-1 min-w-0 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-[#FF6200] to-[#FF8C00]" />
                <h1 className="text-base font-black tracking-tight text-foreground">
                  NFL 2026 — <span className="text-gradient">Live Scores, Predictions & Schedule</span>
                </h1>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-border/80 to-transparent" />
            </div>
            <LiveScoresWrapper featuredGame={featuredGame} games={games} />
            {posts.length > 0 && <BlogTeaser posts={posts.slice(0, 3)} />}
          </main>

          {/* RIGHT COLUMN — Standings + Leaders */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-5">
            <StandingsWidget />
            <LeagueLeaders />
          </aside>

        </div>
      </div>
    </div>
  );
}
