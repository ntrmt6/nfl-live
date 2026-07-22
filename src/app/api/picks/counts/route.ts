import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pick from "@/models/Pick";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameSlug = searchParams.get("gameSlug");

  if (!gameSlug) return NextResponse.json({ error: "gameSlug required" }, { status: 400 });

  await connectDB();

  const [homeCount, awayCount] = await Promise.all([
    Pick.countDocuments({ gameSlug, choice: "home" }),
    Pick.countDocuments({ gameSlug, choice: "away" }),
  ]);

  return NextResponse.json({ home: homeCount, away: awayCount, total: homeCount + awayCount });
}
