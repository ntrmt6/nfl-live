import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, FileText, ChevronRight } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { TeamGameCard } from "@/components/teams/TeamGameCard";
import { getTeamBySlug, TEAM_LIST, teamToSlug } from "@/lib/teams";
import { getTeamGames } from "@/lib/data/games";
import { getTeamPosts } from "@/lib/data/posts";

export const revalidate = 60;

export async function generateStaticParams() {
  return TEAM_LIST.map((t) => ({ slug: teamToSlug(t.name) }));
}

export default async function TeamOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  const [games, posts] = await Promise.all([
    getTeamGames(team.abbr, 5),
    getTeamPosts(team.name, 6),
  ]);

  return (
    <div className="space-y-12">
      {/* Games preview */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#FF6200]" />
            Schedule
          </h2>
          {games.length > 0 && (
            <Link
              href={`/teams/${slug}/games`}
              className="text-sm text-[#FF6200] font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {games.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center border border-dashed border-border rounded-xl">
            No games on schedule yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-2">
            {games.map((game) => (
              <TeamGameCard key={game._id} game={game} highlightAbbr={team.abbr} />
            ))}
          </div>
        )}
      </section>

      {/* Blog preview */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#FF6200]" />
            Latest Articles
          </h2>
          {posts.length > 0 && (
            <Link
              href={`/teams/${slug}/blog`}
              className="text-sm text-[#FF6200] font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center border border-dashed border-border rounded-xl">
            No articles for {team.name} yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
