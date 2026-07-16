import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/user-auth";
import { calculateRank, getAutoBadges } from "@/lib/badge-system";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Login to like comments." }, { status: 401 });

  try {
    await connectDB();
    const comment = await Comment.findById(id);
    if (!comment || comment.status !== "approved") {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    const userId = new mongoose.Types.ObjectId(session.userId);
    const alreadyLiked = comment.likes.some((l) => l.equals(userId));

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((l) => !l.equals(userId));
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(userId);
      comment.likeCount += 1;
    }
    await comment.save();

    // update author reputation and badges
    const author = await User.findById(comment.userId);
    if (author && !comment.userId.equals(userId)) {
      author.reputationPoints = alreadyLiked
        ? Math.max(0, author.reputationPoints - 2)
        : author.reputationPoints + 2;
      author.rank = calculateRank(author.reputationPoints);
      const maxLikes = await Comment.findOne({ userId: author._id }).sort({ likeCount: -1 }).lean();
      author.badges = getAutoBadges(author, maxLikes?.likeCount || 0) as typeof author.badges;
      await author.save();
    }

    return NextResponse.json({ likeCount: comment.likeCount, liked: !alreadyLiked });
  } catch (err) {
    console.error("like error:", err);
    return NextResponse.json({ error: "Failed to like comment." }, { status: 500 });
  }
}
