import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { postSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/requireAdmin";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await connectDB();
    const post = await Post.findById(id).lean();
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = postSchema.partial().parse(body);

    await connectDB();
    const post = await Post.findByIdAndUpdate(id, parsed, { new: true });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    revalidatePath("/blog");
    revalidatePath("/");
    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await connectDB();
    const post = await Post.findByIdAndDelete(id).lean() as { slug?: string } | null;
    if (post?.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }
    revalidatePath("/blog");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
