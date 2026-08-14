import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { syncResults } from "@/lib/syncResults";

export const maxDuration = 60;

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) return true;
  const admin = await requireAdmin();
  return !!admin;
}

async function handle(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const seasonStr = url.searchParams.get("season");
  const weekStr = url.searchParams.get("week");
  const seasonTypeStr = url.searchParams.get("seasonType");

  const summary = await syncResults({
    season: seasonStr ? parseInt(seasonStr, 10) : undefined,
    week: weekStr ? parseInt(weekStr, 10) : undefined,
    seasonType: seasonTypeStr ? parseInt(seasonTypeStr, 10) : undefined,
  });

  return NextResponse.json({ success: true, ...summary });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
