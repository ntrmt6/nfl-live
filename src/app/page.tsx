import { HeroSection } from "@/components/home/HeroSection";
import { ScheduleGrid } from "@/components/home/ScheduleGrid";
import { BlogTeaser } from "@/components/blog/BlogTeaser";
import { getUpcomingGames } from "@/lib/data/games";
import { getPublishedPosts } from "@/lib/data/posts";

export const revalidate = 60;

export default async function HomePage() {
  const [games, posts] = await Promise.all([
    getUpcomingGames(),
    getPublishedPosts(3),
  ]);

  return (
    <>
      <HeroSection />
      <ScheduleGrid games={games} />
      {posts.length > 0 && <BlogTeaser posts={posts} />}
    </>
  );
}
