import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leagues | NFL Predictions Hub",
  description: "Create a private pick'em league, invite your friends, and see who really knows football.",
};

export default function LeaguesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
