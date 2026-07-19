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
            <h1 className="text-lg font-black tracking-tight text-foreground leading-tight">
              NFL 2026 Season{" "}
              <span className="text-[#FF6200]">Live Scores, Predictions & Schedule</span>
            </h1>
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
