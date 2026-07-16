import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";

export const revalidate = 60;

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne().lean();
    return NextResponse.json({
      adsenseClientId: (settings as { adsenseClientId?: string } | null)?.adsenseClientId ?? "",
    });
  } catch {
    return NextResponse.json({ adsenseClientId: "" });
  }
}
