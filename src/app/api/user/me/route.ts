import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ user: null });

  try {
    await connectDB();
    const user = await User.findById(session.userId).select("-passwordHash").lean();
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
