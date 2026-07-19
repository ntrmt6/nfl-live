import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/user-auth";
import { checkSpam } from "@/lib/spam-filter";
import { calculateRank, getAutoBadges } from "@/lib/badge-system";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");
  if (!postSlug) return NextResponse.json({ error: "postSlug required" }, { status: 400 });

  try {
    await connectDB();
    const comments = await Comment.find({ postSlug, status: "approved" })
      .sort({ createdAt: 1 })
      .populate("userId", "username avatar rank badges")
      .lean();

    const session = await getCurrentUser();

    const result = comments.map((c) => ({
      id: c._id,
      postSlug: c.postSlug,
      content: c.content,
      parentId: c.parentId,
      likeCount: c.likeCount,
      isLikedByMe: session ? c.likes.some((id) => id.toString() === session.userId) : false,
      isEdited: c.isEdited,
      createdAt: c.createdAt,
      user: c.userId,
    }));

    return NextResponse.json({ comments: result });
  } catch (err) {
    console.error("GET comments error:", err);
    return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "You must be logged in to comment." }, { status: 401 });

  try {
    const { postSlug, content, parentId } = await req.json();
    if (!postSlug || !content?.trim()) {
      return NextResponse.json({ error: "Post and content are required." }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Comment must be under 2000 characters." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (user.isBanned) return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });

    const spamCheck = checkSpam(content, {
      isRookie: user.rank === "Rookie",
      lastCommentAt: user.lastCommentAt,
    });
    if (spamCheck.isSpam) {
      return NextResponse.json({ error: spamCheck.reason }, { status: 429 });
    }

    // fan-talk posts always auto-approve; new users' first 5 blog comments go to pending
    const status = postSlug === "fan-talk" ? "approved" : user.approvedCommentCount < 5 ? "pending" : "approved";

    const comment = await Comment.create({
      postSlug,
      userId: user._id,
      content: content.trim(),
      parentId: parentId || null,
      status,
    });

    // update user stats
    user.commentCount += 1;
    user.lastCommentAt = new Date();
    user.reputationPoints += 1;
    user.rank = calculateRank(user.reputationPoints);
    if (status === "approved") user.approvedCommentCount += 1;

    const maxLikes = await Comment.findOne({ userId: user._id }).sort({ likeCount: -1 }).lean();
    user.badges = getAutoBadges(user, maxLikes?.likeCount || 0) as typeof user.badges;
    await user.save();

    const populated = await comment.populate("userId", "username avatar rank badges");

    return NextResponse.json({
      comment: {
        id: comment._id,
        postSlug: comment.postSlug,
        content: comment.content,
        parentId: comment.parentId,
        likeCount: 0,
        isLikedByMe: false,
        isEdited: false,
        createdAt: comment.createdAt,
        user: populated.userId,
        status,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("POST comment error:", err);
    return NextResponse.json({ error: "Failed to post comment." }, { status: 500 });
  }
}
