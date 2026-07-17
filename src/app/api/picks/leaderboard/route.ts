import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pick from "@/models/Pick";

export const revalidate = 300;

export async function GET() {
  await connectDB();

  const agg = await Pick.aggregate([
    { $match: { correct: { $exists: true } } },
    {
      $group: {
        _id: "$userId",
        username: { $last: "$username" },
        total: { $sum: 1 },
        correct: { $sum: { $cond: ["$correct", 1, 0] } },
        // collect sorted correct flags to compute streak
        results: { $push: { correct: "$correct", createdAt: "$createdAt" } },
      },
    },
    {
      $addFields: {
        accuracy: {
          $cond: [
            { $gt: ["$total", 0] },
            { $multiply: [{ $divide: ["$correct", "$total"] }, 100] },
            0,
          ],
        },
      },
    },
    { $match: { total: { $gte: 3 } } }, // min 3 picks to appear
    { $sort: { correct: -1, accuracy: -1 } },
    { $limit: 50 },
  ]);

  // Compute streak per user from their individual picks (sorted by date)
  const leaderboard = await Promise.all(
    agg.map(async (entry) => {
      const picks = await Pick.find({ userId: entry._id, correct: { $exists: true } })
        .sort({ createdAt: -1 })
        .lean();

      let streak = 0;
      for (const p of picks) {
        if (p.correct) streak++;
        else break;
      }

      let bestStreak = 0;
      let cur = 0;
      for (const p of [...picks].reverse()) {
        if (p.correct) { cur++; bestStreak = Math.max(bestStreak, cur); }
        else cur = 0;
      }

      return {
        userId: entry._id,
        username: entry.username,
        total: entry.total,
        correct: entry.correct,
        accuracy: Math.round(entry.accuracy),
        streak,
        bestStreak,
      };
    })
  );

  leaderboard.sort((a, b) => b.streak - a.streak || b.accuracy - a.accuracy);

  return NextResponse.json({ leaderboard });
}
