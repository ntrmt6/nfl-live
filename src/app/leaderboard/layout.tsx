import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pick'em Leaderboard | NFL Predictions Hub",
  description: "See who's on the hottest pick'em streak. The NFL Predictions Hub community leaderboard — ranked by current streak and prediction accuracy.",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
