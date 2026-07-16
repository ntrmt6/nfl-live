import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import type { BadgeId, UserRank } from "@/models/User";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as {
      isBanned?: boolean;
      banReason?: string;
      rank?: UserRank;
      addBadge?: BadgeId;
      removeBadge?: BadgeId;
    };

    await connectDB();
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (body.isBanned !== undefined) user.isBanned = body.isBanned;
    if (body.banReason !== undefined) user.banReason = body.banReason;
    if (body.rank !== undefined) user.rank = body.rank;
    if (body.addBadge && !user.badges.includes(body.addBadge)) {
      user.badges.push(body.addBadge);
    }
    if (body.removeBadge) {
      user.badges = user.badges.filter((b) => b !== body.removeBadge) as typeof user.badges;
    }

    await user.save();
    const updated = await User.findById(id).select("-passwordHash").lean();
    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("admin update user error:", err);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}
