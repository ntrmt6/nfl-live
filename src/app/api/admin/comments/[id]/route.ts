import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { connectDB } from "@/lib/db";
import Comment, { CommentStatus } from "@/models/Comment";
import User from "@/models/User";
import { calculateRank, getAutoBadges } from "@/lib/badge-system";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { status } = await req.json() as { status: CommentStatus };
    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const wasApproved = comment.status === "approved";
    const nowApproved = status === "approved";
    comment.status = status;
    await comment.save();

    // grant reputation when approving a previously pending comment
    if (!wasApproved && nowApproved) {
      const user = await User.findById(comment.userId);
      if (user) {
        user.approvedCommentCount += 1;
        user.reputationPoints += 1;
        user.rank = calculateRank(user.reputationPoints);
        const maxLikes = await Comment.findOne({ userId: user._id }).sort({ likeCount: -1 }).lean();
        user.badges = getAutoBadges(user, maxLikes?.likeCount || 0) as typeof user.badges;
        await user.save();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("moderate comment error:", err);
    return NextResponse.json({ error: "Failed to moderate comment." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    await Comment.findByIdAndDelete(id);
    await Comment.deleteMany({ parentId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin delete comment error:", err);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
