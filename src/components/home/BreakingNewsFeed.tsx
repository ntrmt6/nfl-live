import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";
import { PostDTO } from "@/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function tagColor(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes("pick") || t.includes("bet") || t.includes("odds"))
    return "text-[#FF6200] bg-[rgba(255,98,0,0.12)]";
  if (t.includes("live") || t.includes("stream") || t.includes("watch"))
    return "text-red-400 bg-red-500/10";
  if (t.includes("fantasy"))
    return "text-purple-400 bg-purple-500/10";
  if (t.includes("power rank") || t.includes("ranking"))
    return "text-yellow-400 bg-yellow-500/10";
  return "text-[#00A8FF] bg-[rgba(0,168,255,0.12)]";
}

export function BreakingNewsFeed({ posts }: { posts: PostDTO[] }) {
  const items = posts.slice(0, 12);

  return (
    <div className="sticky top-[5.5rem]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pl-2 border-l-2 border-[#FF6200]">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-[#FF6200]" />
          <span className="section-label-orange">Breaking News</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {items[0]
            ? timeAgo(items[0].updatedAt)
            : timeAgo(new Date().toISOString())}
        </span>
      </div>

      {/* Feed */}
      <div className="space-y-0">
        {items.map((post) => {
          const firstTag = post.tags[0] ?? "NFL";
          return (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group flex gap-2.5 py-2.5 border-b border-border/30 hover:bg-secondary/20 transition-colors px-1 rounded"
            >
              {post.coverImage && (
                <div className="relative h-12 w-12 shrink-0 rounded overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span
                  className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1 ${tagColor(firstTag)}`}
                >
                  {firstTag.length > 18 ? firstTag.slice(0, 18) : firstTag}
                </span>
                <p className="text-xs font-bold leading-snug text-foreground/90 group-hover:text-[#FF6200] transition-colors line-clamp-2">
                  {post.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {timeAgo(post.createdAt)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/blog"
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#00A8FF] hover:underline"
      >
        See all analysis <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
