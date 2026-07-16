import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, User, ChevronLeft } from "lucide-react";
import { getPostBySlug, getAllPostSlugs } from "@/lib/data/posts";
import { CommentSection } from "@/components/comments/CommentSection";
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

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

  return (
    <article className="container py-10 max-w-3xl">
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

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

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

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
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
      </div>

      {post.coverImage && (
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 border border-border">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="prose-nfl" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="mt-12 pt-8 border-t border-border">
        <CommentSection postSlug={slug} />
      </div>
    </article>
  );
}
