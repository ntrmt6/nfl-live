import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Invite code required" }, { status: 400 });
  }

  await connectDB();

  const league = await League.findOne({ code: code.trim().toUpperCase() });
  if (!league) return NextResponse.json({ error: "No league found with that code" }, { status: 404 });

  const alreadyMember = league.members.some((m) => m.userId === user.userId);
  if (!alreadyMember) {
    league.members.push({ userId: user.userId, username: user.username, joinedAt: new Date() });
    await league.save();
  }

  return NextResponse.json({ league });
}
