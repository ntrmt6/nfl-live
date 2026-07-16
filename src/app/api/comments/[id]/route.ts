import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { getCurrentUser } from "@/lib/user-auth";
import { requireAdmin } from "@/lib/requireAdmin";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentUser();
  const admin = await requireAdmin();
  if (!session && !admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const comment = await Comment.findById(id);
    if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });

    const isOwner = session && comment.userId.toString() === session.userId;
    if (!isOwner && !admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await comment.deleteOne();
    // cascade delete replies
    await Comment.deleteMany({ parentId: id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE comment error:", err);
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content } = await req.json();
    if (!content?.trim() || content.length > 2000) {
      return NextResponse.json({ error: "Invalid content." }, { status: 400 });
    }

    await connectDB();
    const comment = await Comment.findById(id);
    if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    if (comment.userId.toString() !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH comment error:", err);
    return NextResponse.json({ error: "Failed to edit comment." }, { status: 500 });
  }
}
