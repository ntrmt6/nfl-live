import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, User, ChevronLeft, Clock, ChevronRight } from "lucide-react";
import { getPostBySlug, getAllPostSlugs, getRelatedPosts, getPostsForAutoLink, getAdjacentPosts } from "@/lib/data/posts";
import { autoLinkContent } from "@/lib/auto-link";
import { CommentSection } from "@/components/comments/CommentSection";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogShareButtons } from "@/components/blog/BlogShareButtons";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/schema-org";
import { absoluteUrl } from "@/lib/utils";
import { extractTeamsFromText } from "@/lib/teams";
import { TeamLogo } from "@/components/ui/TeamLogo";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  return {
    title,
    description,
    keywords: post.tags?.length ? post.tags : ["NFL", "NFL schedule", "NFL preview"],
    alternates: { canonical: absoluteUrl(`/blog/${post.slug}`) },
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl(`/blog/${post.slug}`),
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 675, alt: title }] : undefined,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "NFL Predictions Hub",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 230));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [relatedPosts, allPosts, adjacent] = await Promise.all([
    getRelatedPosts(slug, post.tags, 3),
    getPostsForAutoLink(),
    getAdjacentPosts(slug),
  ]);
  const linkedContent = autoLinkContent(post.content, allPosts, slug);
  const jsonLd = blogPostingSchema(post as any);
  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  let extraSchemas: object[] = [];
  if (post.schemaMarkup) {
    try {
      const parsed = JSON.parse(post.schemaMarkup);
      extraSchemas = Array.isArray(parsed) ? parsed : [parsed];
    } catch {}
  }

  const teams = extractTeamsFromText(post.title, post.tags?.join(" ") ?? "");
  const minutes = readingTime(post.content);

  return (
    <>
      <ReadingProgress />
      <div className="container py-8 max-w-6xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        />
        {extraSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start">
          {/* ── Main article column ── */}
          <article>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to blog
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Team logos */}
            {teams.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                {teams.slice(0, 2).map((abbr, i) => (
                  <div key={abbr} className="flex items-center gap-2">
                    {i > 0 && <span className="text-muted-foreground/40 font-bold text-sm">vs</span>}
                    <TeamLogo abbr={abbr} size={40} className="drop-shadow" />
                  </div>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {minutes} min read
              </span>
            </div>

            {/* Mobile ToC */}
            <TableOfContents />

            {/* Cover image */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 border border-border bg-secondary shadow-sm">
              {teams.length > 0 ? (
                <div className="h-full w-full flex items-center justify-center gap-6 bg-gradient-to-br from-secondary to-secondary/60">
                  {teams.slice(0, 2).map((abbr) => (
                    <TeamLogo key={abbr} abbr={abbr} size={96} className="drop-shadow-xl" />
                  ))}
                </div>
              ) : post.coverImage ? (
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#FF6200]/10 via-white to-[#00A8FF]/10" />
              )}
            </div>

            {/* Article body */}
            <div className="prose-nfl" dangerouslySetInnerHTML={{ __html: linkedContent }} />

            {/* Share */}
            <div className="mt-10 pt-8 border-t border-border">
              <BlogShareButtons
                title={post.title}
                excerpt={post.excerpt || ""}
                tags={post.tags}
                url={absoluteUrl(`/blog/${post.slug}`)}
              />
            </div>

            {/* Prev / Next navigation */}
            {(adjacent.prev || adjacent.next) && (
              <div className="mt-10 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adjacent.prev ? (
                  <Link
                    href={`/blog/${adjacent.prev.slug}`}
                    className="group flex flex-col gap-1.5 p-4 rounded-xl border border-border bg-card hover:border-[#FF6200]/40 hover:shadow-sm transition-all"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <ChevronLeft className="h-3 w-3" /> Previous
                    </span>
                    <span className="text-sm font-bold leading-snug group-hover:text-[#FF6200] transition-colors line-clamp-2">
                      {adjacent.prev.title}
                    </span>
                  </Link>
                ) : <div />}
                {adjacent.next && (
                  <Link
                    href={`/blog/${adjacent.next.slug}`}
                    className="group flex flex-col gap-1.5 p-4 rounded-xl border border-border bg-card hover:border-[#FF6200]/40 hover:shadow-sm transition-all text-right"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1 justify-end">
                      Next <ChevronRight className="h-3 w-3" />
                    </span>
                    <span className="text-sm font-bold leading-snug group-hover:text-[#FF6200] transition-colors line-clamp-2">
                      {adjacent.next.title}
                    </span>
                  </Link>
                )}
              </div>
            )}

            {/* Related articles */}
            {relatedPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-lg font-bold mb-4">Keep Reading</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((p) => (
                    <BlogCard key={p._id} post={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="mt-12 pt-8 border-t border-border">
              <CommentSection postSlug={slug} />
            </div>
          </article>

          {/* ── Sticky sidebar (desktop only) ── */}
          <aside className="hidden lg:flex flex-col gap-6 sticky top-24 self-start">
            <TableOfContents />

            {/* Mini related articles in sidebar */}
            {relatedPosts.length > 0 && (
              <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                  More Articles
                </p>
                <div className="space-y-1">
                  {relatedPosts.map((p) => (
                    <BlogCard key={p._id} post={p} compact />
                  ))}
                </div>
              </div>
            )}

            {/* CTA card */}
            <div className="rounded-xl border border-[#FF6200]/30 bg-gradient-to-br from-[#FF6200]/5 to-[#00A8FF]/5 p-5 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-[#FF6200] mb-2">
                NFL Predictions Hub
              </p>
              <p className="text-sm text-muted-foreground mb-4 leading-snug">
                Get AI-powered picks, live scores, and expert analysis every week.
              </p>
              <Link
                href="/"
                className="inline-block bg-[#FF6200] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#e55a00] transition-colors"
              >
                See This Week&apos;s Picks →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
