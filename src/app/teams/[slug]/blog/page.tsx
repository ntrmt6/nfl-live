import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/BlogCard";
import { getTeamBySlug, TEAM_LIST, teamToSlug } from "@/lib/teams";
import { getTeamPosts } from "@/lib/data/posts";

export const revalidate = 60;

export async function generateStaticParams() {
  return TEAM_LIST.map((t) => ({ slug: teamToSlug(t.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) return {};
  return {
    title: `${team.name} Articles, Previews & Analysis`,
    description: `Game previews, predictions, streaming guides, and news coverage for the ${team.name} — curated by NFL Predictions Hub.`,
  };
}

export default async function TeamBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  const posts = await getTeamPosts(team.name, 60);

  return (
    <div>
      <div className="mb-8">
        <p className="text-muted-foreground text-sm">
          {posts.length > 0
            ? `${posts.length} article${posts.length === 1 ? "" : "s"} covering the ${team.name}`
            : `No articles for the ${team.name} yet.`}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-semibold">No articles yet.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Check back as the season gets underway.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
