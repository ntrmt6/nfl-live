import Link from "next/link";
import Image from "next/image";
import { PostDTO } from "@/types";
import { extractTeamsFromText } from "@/lib/teams";
import { TeamLogo } from "@/components/ui/TeamLogo";

function tagColor(tag: string): { bg: string; text: string } {
  const t = tag.toLowerCase();
  if (t.includes("pick") || t.includes("bet") || t.includes("odds")) {
    return { bg: "rgba(255,98,0,0.15)", text: "#FF6200" };
  }
  if (t.includes("injury") || t.includes("report")) {
    return { bg: "rgba(239,68,68,0.15)", text: "#ef4444" };
  }
  if (t.includes("trade") || t.includes("rumor")) {
    return { bg: "rgba(168,85,247,0.15)", text: "#a855f7" };
  }
  if (t.includes("draft") || t.includes("prospect")) {
    return { bg: "rgba(34,197,94,0.15)", text: "#22c55e" };
  }
  return { bg: "rgba(0,168,255,0.12)", text: "#00A8FF" };
}

export function BlogCard({
  post,
  compact = false,
}: {
  post: PostDTO;
  compact?: boolean;
}) {
  const firstTag = post.tags?.[0];
  const tc = firstTag ? tagColor(firstTag) : null;
  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const teams = extractTeamsFromText(post.title, post.tags?.join(" ") ?? "");

  if (compact) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="flex gap-3 py-2.5 border-b border-border/40 last:border-0">
          {/* Thumbnail */}
          <div className="relative h-16 w-24 shrink-0 rounded overflow-hidden bg-secondary">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : teams.length > 0 ? (
              <div className="h-full w-full flex items-center justify-center gap-1 bg-secondary">
                {teams.slice(0, 2).map((abbr) => (
                  <TeamLogo key={abbr} abbr={abbr} size={28} />
                ))}
              </div>
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#FF6200]/20 to-[#00A8FF]/20" />
            )}
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            {tc && firstTag && (
              <span
                className="inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded mb-1"
                style={{ background: tc.bg, color: tc.text }}
              >
                {firstTag}
              </span>
            )}
            <h3 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-[#FF6200] transition-colors">
              {post.title}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">{dateStr}</p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="h-full bg-card border border-border rounded card-hover overflow-hidden">
        {/* Cover image / team logos fallback */}
        <div className="relative aspect-[16/9] bg-secondary overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : teams.length > 0 ? (
            <div className="h-full w-full flex items-center justify-center gap-4 bg-gradient-to-br from-secondary to-secondary/60">
              {teams.slice(0, 2).map((abbr) => (
                <TeamLogo key={abbr} abbr={abbr} size={56} className="drop-shadow-lg" />
              ))}
            </div>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#FF6200]/20 to-[#00A8FF]/20" />
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {tc && firstTag && (
            <span
              className="inline-block text-[10px] font-black uppercase px-1.5 py-0.5 rounded mb-2"
              style={{ background: tc.bg, color: tc.text }}
            >
              {firstTag}
            </span>
          )}
          <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-[#FF6200] transition-colors mb-1.5">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="font-medium">{post.author}</span>
              <span className="text-border">·</span>
              <span>{dateStr}</span>
            </div>
            {teams.length > 0 && (
              <div className="flex items-center gap-1">
                {teams.slice(0, 2).map((abbr) => (
                  <TeamLogo key={abbr} abbr={abbr} size={20} />
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
