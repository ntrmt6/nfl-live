import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { postSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const includeUnpublished = admin && searchParams.get("all") === "true";

    const posts = await Post.find(includeUnpublished ? {} : { published: true })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = postSchema.parse(body);

    await connectDB();
    const baseSlug = slugify(parsed.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Post.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const post = await Post.create({
      ...parsed,
      coverImage: parsed.coverImage || undefined,
      slug,
    });

    revalidatePath("/blog");
    revalidatePath("/");
    if (parsed.published) {
      revalidatePath(`/blog/${slug}`);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
