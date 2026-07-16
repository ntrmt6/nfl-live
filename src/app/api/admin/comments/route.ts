import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;

  try {
    await connectDB();
    const [comments, total] = await Promise.all([
      Comment.find({ status })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "username avatar rank")
        .lean(),
      Comment.countDocuments({ status }),
    ]);

    return NextResponse.json({ comments, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("admin comments error:", err);
    return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });
  }
}
