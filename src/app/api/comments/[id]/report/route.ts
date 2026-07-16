import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { getCurrentUser } from "@/lib/user-auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Login to report comments." }, { status: 401 });

  try {
    await connectDB();
    const comment = await Comment.findById(id);
    if (!comment) return NextResponse.json({ error: "Comment not found." }, { status: 404 });

    const userId = new mongoose.Types.ObjectId(session.userId);
    if (comment.reportedBy.some((r) => r.equals(userId))) {
      return NextResponse.json({ error: "You already reported this comment." }, { status: 409 });
    }

    comment.reportedBy.push(userId);
    comment.reportCount += 1;
    if (comment.reportCount >= 3) {
      comment.status = "pending";
    }
    await comment.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("report error:", err);
    return NextResponse.json({ error: "Failed to report comment." }, { status: 500 });
  }
}
