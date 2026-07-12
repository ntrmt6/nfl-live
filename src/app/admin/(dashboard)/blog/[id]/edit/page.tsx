import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { PostForm } from "@/components/admin/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post = null;
  try {
    await connectDB();
    post = await Post.findById(id).lean();
  } catch {
    post = null;
  }

  if (!post) notFound();

  const plain = JSON.parse(JSON.stringify(post));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      <PostForm initialValues={plain} />
    </div>
  );
}
