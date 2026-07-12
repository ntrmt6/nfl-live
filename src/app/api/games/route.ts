import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import { gameSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const week = searchParams.get("week");
    const team = searchParams.get("team");

    const query: Record<string, unknown> = {};
    if (week) query.week = Number(week);
    if (team) query.$or = [{ homeTeam: team.toUpperCase() }, { awayTeam: team.toUpperCase() }];

    const games = await Game.find(query).sort({ kickoff: 1 }).lean();
    return NextResponse.json({ games });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = gameSchema.parse(body);

    await connectDB();
    const baseSlug = slugify(`${parsed.awayTeamFull}-at-${parsed.homeTeamFull}-week-${parsed.week}`, {
      lower: true,
      strict: true,
    });
    let slug = baseSlug;
    let counter = 1;
    while (await Game.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const game = await Game.create({ ...parsed, slug });
    return NextResponse.json({ game }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
