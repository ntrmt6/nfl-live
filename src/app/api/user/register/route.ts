import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signUserToken, USER_COOKIE_NAME } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: "Username must be 3–30 characters." }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "Email" : "Username";
      return NextResponse.json({ error: `${field} is already taken.` }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email: email.toLowerCase(), passwordHash });

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
    console.error("register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
