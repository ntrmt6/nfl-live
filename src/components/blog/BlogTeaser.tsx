import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { PostDTO } from "@/types";

export function BlogTeaser({ posts }: { posts: PostDTO[] }) {
  return (
    <section className="container py-16 border-t border-border">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent mb-2">
            <Newspaper className="h-4 w-4" />
            LATEST COVERAGE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            From the <span className="text-gradient">Blog</span>
          </h2>
        </div>
        <Link
          href="/blog"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          View all posts <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
