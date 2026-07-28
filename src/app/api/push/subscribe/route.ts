import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json();
  const { endpoint, keys } = body?.subscription ?? body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await connectDB();

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { $set: { userId: user.userId, endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });

  await connectDB();
  await PushSubscription.deleteOne({ endpoint, userId: user.userId });

  return NextResponse.json({ success: true });
}
