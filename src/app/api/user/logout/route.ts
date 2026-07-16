import { NextResponse } from "next/server";
import { USER_COOKIE_NAME } from "@/lib/user-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
