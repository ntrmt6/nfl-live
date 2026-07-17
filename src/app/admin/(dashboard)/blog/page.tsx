import Link from "next/link";
import { Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { Badge } from "@/components/ui/badge";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { GenerateMatchupPostsButton } from "@/components/admin/GenerateMatchupPostsButton";

async function getPosts() {
  try {
    await connectDB();
    const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(posts));
  } catch {
    return [];
  }
}

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <div className="flex items-center gap-2">
          <GenerateMatchupPostsButton />
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Author</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post: any) => (
              <tr key={post._id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{post.title}</td>
                <td className="p-3 text-muted-foreground">{post.author}</td>
                <td className="p-3">
                  <Badge variant={post.published ? "neon" : "secondary"}>
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="p-3">
                  <PostRowActions id={post._id} slug={post.slug} />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  No posts yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
