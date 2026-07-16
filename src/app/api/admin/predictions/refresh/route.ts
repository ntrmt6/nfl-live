import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { exec } from "child_process";
import path from "path";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scriptPath = path.join(process.cwd(), "scripts", "ml_predictor.py");

  return new Promise<NextResponse>((resolve) => {
    exec(
      `python3 "${scriptPath}"`,
      { timeout: 360_000 },
      (error, stdout, stderr) => {
        if (error) {
          console.error("ml_predictor error:", stderr || error.message);
          resolve(
            NextResponse.json(
              { error: "Prediction script failed", details: (stderr || error.message).slice(0, 2000) },
              { status: 500 }
            )
          );
          return;
        }

        const match = stdout.match(/SUMMARY:(\{.+\})/);
        const summary = match ? JSON.parse(match[1]) : {};
        resolve(NextResponse.json({ success: true, ...summary }));
      }
    );
  });
}
