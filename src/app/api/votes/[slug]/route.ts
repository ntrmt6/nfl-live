import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Vote from "@/models/Vote";
import { getCurrentUser } from "@/lib/user-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();

  const [home, away, total] = await Promise.all([
    Vote.countDocuments({ gameSlug: slug, choice: "home" }),
    Vote.countDocuments({ gameSlug: slug, choice: "away" }),
    Vote.countDocuments({ gameSlug: slug }),
  ]);

  const cookieStore = await cookies();
  const fp = cookieStore.get("voter_fp")?.value;
  const user = await getCurrentUser();
  const voterKey = user ? `user:${user.userId}` : fp ? `fp:${fp}` : null;

  let userChoice: "home" | "away" | null = null;
  if (voterKey) {
    const existing = await Vote.findOne({ gameSlug: slug, voterKey }).lean();
    userChoice = existing?.choice ?? null;
  }

  return NextResponse.json({ home, away, total, userChoice });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { choice } = await req.json();

  if (choice !== "home" && choice !== "away") {
    return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
  }

  await connectDB();

  const cookieStore = await cookies();
  let fp = cookieStore.get("voter_fp")?.value;
  const isNewFp = !fp;
  if (!fp) fp = crypto.randomUUID();

  const user = await getCurrentUser();
  const voterKey = user ? `user:${user.userId}` : `fp:${fp}`;

  await Vote.findOneAndUpdate(
    { gameSlug: slug, voterKey },
    { $set: { choice, userId: user?.userId } },
    { upsert: true }
  );

  const [home, away, total] = await Promise.all([
    Vote.countDocuments({ gameSlug: slug, choice: "home" }),
    Vote.countDocuments({ gameSlug: slug, choice: "away" }),
    Vote.countDocuments({ gameSlug: slug }),
  ]);

  const res = NextResponse.json({ home, away, total, userChoice: choice });

  if (isNewFp) {
    res.cookies.set("voter_fp", fp, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}
