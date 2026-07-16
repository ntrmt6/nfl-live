import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signUserToken, USER_COOKIE_NAME } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();
    if (!login || !password) {
      return NextResponse.json({ error: "Email/username and password are required." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { username: login }],
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    if (user.isBanned) {
      return NextResponse.json({ error: `Account suspended: ${user.banReason || "Contact support."}` }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = signUserToken({ userId: user._id!.toString(), username: user.username });

    const res = NextResponse.json({
      user: { id: user._id, username: user.username, email: user.email, rank: user.rank, badges: user.badges, avatar: user.avatar },
    });
    res.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
