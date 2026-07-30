import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export const revalidate = 300;

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db!;
    const meta = await db.collection("predictions").findOne({ _type: "model_meta" });
    if (!meta) {
      return NextResponse.json({ error: "Model meta not found" }, { status: 404 });
    }
    return NextResponse.json({
      accuracy: meta.accuracy ?? null,
      trainAccuracy: meta.trainAccuracy ?? null,
      trainingSamples: meta.trainingSamples ?? null,
      seasons: meta.seasons ?? [],
      featureImportances: meta.featureImportances ?? [],
      confusionMatrix: meta.confusionMatrix ?? null,
      features: meta.features ?? [],
      updatedAt: meta.updatedAt ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load model data" }, { status: 500 });
  }
}
