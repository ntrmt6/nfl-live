import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { avatar, username } = await req.json();
    const update: Record<string, string> = {};

    if (avatar !== undefined) {
      if (avatar && avatar.length > 200_000) {
        return NextResponse.json({ error: "Avatar image is too large (max ~150KB)." }, { status: 400 });
      }
      update.avatar = avatar;
    }

    if (username !== undefined) {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return NextResponse.json({ error: "Invalid username format." }, { status: 400 });
      }
      await connectDB();
      const taken = await User.findOne({ username, _id: { $ne: session.userId } });
      if (taken) return NextResponse.json({ error: "Username already taken." }, { status: 409 });
      update.username = username;
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(session.userId, { $set: update }, { new: true }).select("-passwordHash").lean();
    return NextResponse.json({ user });
  } catch (err) {
    console.error("profile update error:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
