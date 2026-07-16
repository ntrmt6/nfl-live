import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/BlogCard";
import { getPublishedPosts } from "@/lib/data/posts";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "NFL Blog & Analysis",
  description:
    "In-depth NFL game previews, predictions, recaps, and storylines from the NFL Predictions Hub editorial team.",
  alternates: { canonical: absoluteUrl("/blog") },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts(60);

  return (
    <div className="container py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          NFL <span className="text-gradient">Blog</span>
        </h1>
        <p className="text-muted-foreground">
          Game previews, recaps, and storylines from every week of the season.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet. Check back soon.</p>
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
