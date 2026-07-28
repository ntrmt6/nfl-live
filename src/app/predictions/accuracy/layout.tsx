import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Model Accuracy Scoreboard | NFL Predictions Hub",
  description: "How accurate are our AI game predictions, really? Real hit-rate tracked against final scores, broken down by week and confidence level.",
};

export default function AccuracyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
