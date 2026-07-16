import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { PostDTO } from "@/types";

function serialize(doc: any): PostDTO {
  return {
    _id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImage: doc.coverImage,
    author: doc.author,
    tags: doc.tags || [],
    published: doc.published,
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export async function getPublishedPosts(limit = 20): Promise<PostDTO[]> {
  try {
    await connectDB();
    const posts = await Post.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return posts.map(serialize);
  } catch (err) {
    console.warn("[getPublishedPosts] Falling back to empty list:", (err as Error).message);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostDTO | null> {
  try {
    await connectDB();
    const post = await Post.findOne({ slug, published: true }).lean();
    if (!post) return null;
    return serialize(post);
  } catch (err) {
    console.warn("[getPostBySlug] DB unavailable:", (err as Error).message);
    return null;
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    await connectDB();
    const posts = await Post.find({ published: true }, "slug").lean();
    return posts.map((p: any) => p.slug);
  } catch {
    return [];
  }
}

export async function getAllPostsForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  try {
    await connectDB();
    const posts = await Post.find({ published: true }, "slug updatedAt").lean();
    return posts.map((p: any) => ({ slug: p.slug, updatedAt: new Date(p.updatedAt) }));
  } catch {
    return [];
  }
}
