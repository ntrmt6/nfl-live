import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Prediction from "@/models/Prediction";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const [predictions, meta] = await Promise.all([
      Prediction.find({
        _type: { $exists: false },
        kickoff: { $gte: now },
      })
        .sort({ kickoff: 1 })
        .limit(64)
        .lean(),
      Prediction.findOne({ _type: "model_meta" }).lean(),
    ]);

    return NextResponse.json(
      { predictions, meta },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("predictions GET error:", err);
    return NextResponse.json({ predictions: [], meta: null }, { status: 500 });
  }
}
