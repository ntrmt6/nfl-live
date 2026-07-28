import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import Game from "@/models/Game";
import { getCurrentUser } from "@/lib/user-auth";

function randomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let code = "";
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function currentSeason(): Promise<number> {
  const latest = await Game.findOne().sort({ season: -1 }).select("season").lean();
  return latest?.season ?? new Date().getFullYear();
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  await connectDB();
  const leagues = await League.find({ "members.userId": user.userId })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ leagues });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string" || !name.trim() || name.trim().length > 40) {
    return NextResponse.json({ error: "League name must be 1-40 characters" }, { status: 400 });
  }

  await connectDB();
  const season = await currentSeason();

  let code = randomCode();
  for (let attempt = 0; attempt < 5 && (await League.exists({ code })); attempt++) {
    code = randomCode();
  }

  const league = await League.create({
    name: name.trim(),
    code,
    season,
    ownerId: user.userId,
    ownerUsername: user.username,
    members: [{ userId: user.userId, username: user.username, joinedAt: new Date() }],
  });

  return NextResponse.json({ league });
}
