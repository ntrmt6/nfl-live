import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { getCurrentUser } from "@/lib/user-auth";
import { buildLeaderboard } from "@/lib/leaderboard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { code } = await params;
  await connectDB();

  const league = await League.findOne({ code: code.toUpperCase() }).lean();
  if (!league) return NextResponse.json({ error: "League not found" }, { status: 404 });

  const isMember = league.members.some((m) => m.userId === user.userId);
  if (!isMember) return NextResponse.json({ error: "You're not a member of this league" }, { status: 403 });

  const memberIds = league.members.map((m) => m.userId);
  const leaderboard = await buildLeaderboard({ userId: { $in: memberIds }, season: league.season });

  return NextResponse.json({ league, leaderboard });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { code } = await params;
  await connectDB();

  const league = await League.findOne({ code: code.toUpperCase() });
  if (!league) return NextResponse.json({ error: "League not found" }, { status: 404 });
  if (league.ownerId !== user.userId) {
    return NextResponse.json({ error: "Only the league owner can delete it" }, { status: 403 });
  }

  await League.deleteOne({ _id: league._id });
  return NextResponse.json({ success: true });
}
