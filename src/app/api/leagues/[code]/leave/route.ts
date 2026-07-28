import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { code } = await params;
  await connectDB();

  const league = await League.findOne({ code: code.toUpperCase() });
  if (!league) return NextResponse.json({ error: "League not found" }, { status: 404 });

  if (league.ownerId === user.userId) {
    return NextResponse.json(
      { error: "The league owner can't leave — delete the league instead" },
      { status: 400 }
    );
  }

  league.members = league.members.filter((m) => m.userId !== user.userId);
  await league.save();

  return NextResponse.json({ success: true });
}
