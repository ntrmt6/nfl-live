import type { BadgeId, IUser, UserRank } from "@/models/User";

export const BADGES: Record<BadgeId, { label: string; description: string; color: string; emoji: string }> = {
  "first-down": {
    label: "First Down",
    description: "Posted your first comment",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    emoji: "🏈",
  },
  "fan-favorite": {
    label: "Fan Favorite",
    description: "A comment received 10+ likes",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    emoji: "⭐",
  },
  "top-commenter": {
    label: "Top Commenter",
    description: "Posted 50+ comments",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    emoji: "💬",
  },
  "century-club": {
    label: "Century Club",
    description: "Posted 100+ comments",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    emoji: "💯",
  },
  "nfl-expert": {
    label: "NFL Expert",
    description: "Recognized NFL knowledge expert",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    emoji: "🏆",
  },
  "verified-fan": {
    label: "Verified Fan",
    description: "Verified NFL fan",
    color: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    emoji: "✅",
  },
  mvp: {
    label: "MVP",
    description: "Most Valuable Poster — admin awarded",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    emoji: "🥇",
  },
};

export const RANKS: Record<UserRank, { min: number; color: string; gradient: string }> = {
  Rookie: { min: 0, color: "text-slate-400", gradient: "from-slate-500 to-slate-400" },
  Regular: { min: 10, color: "text-green-400", gradient: "from-green-600 to-green-400" },
  Veteran: { min: 50, color: "text-blue-400", gradient: "from-blue-600 to-blue-400" },
  "All-Pro": { min: 200, color: "text-purple-400", gradient: "from-purple-600 to-purple-400" },
  "Hall of Famer": { min: 1000, color: "text-amber-400", gradient: "from-amber-600 to-amber-400" },
};

export function calculateRank(reputationPoints: number): UserRank {
  if (reputationPoints >= 1000) return "Hall of Famer";
  if (reputationPoints >= 200) return "All-Pro";
  if (reputationPoints >= 50) return "Veteran";
  if (reputationPoints >= 10) return "Regular";
  return "Rookie";
}

export function getAutoBadges(user: Partial<IUser>, maxCommentLikes: number): BadgeId[] {
  const existing = new Set(user.badges || []);
  const earned: BadgeId[] = [...existing];

  const add = (id: BadgeId) => { if (!existing.has(id)) earned.push(id); };

  if ((user.approvedCommentCount || 0) >= 1) add("first-down");
  if ((user.commentCount || 0) >= 50) add("top-commenter");
  if ((user.commentCount || 0) >= 100) add("century-club");
  if (maxCommentLikes >= 10) add("fan-favorite");

  return earned;
}
