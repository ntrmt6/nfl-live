import { cn } from "@/lib/utils";
import type { UserRank } from "@/models/User";

const RANK_RING: Record<UserRank, string> = {
  Rookie: "ring-slate-500/60",
  Regular: "ring-green-500/70",
  Veteran: "ring-blue-500/70",
  "All-Pro": "ring-purple-500/80",
  "Hall of Famer": "ring-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
};

interface Props {
  username: string;
  avatar?: string;
  rank?: UserRank;
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl" };

export function UserAvatar({ username, avatar, rank = "Rookie", size = "md" }: Props) {
  const initial = username[0]?.toUpperCase() || "?";
  const ringClass = RANK_RING[rank];
  const sizeClass = SIZES[size];

  return (
    <span className={cn("relative shrink-0 rounded-full ring-2 overflow-hidden inline-flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30", sizeClass, ringClass)}>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={username} className="h-full w-full object-cover" />
      ) : (
        <span className="font-bold text-foreground/80">{initial}</span>
      )}
    </span>
  );
}
