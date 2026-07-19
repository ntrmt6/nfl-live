import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { resolveAllPendingPicks } from "@/lib/resolvePicks";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await resolveAllPendingPicks();
  return NextResponse.json({ success: true, resolved });
}
