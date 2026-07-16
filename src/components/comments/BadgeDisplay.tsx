import { BADGES, RANKS } from "@/lib/badge-system";
import type { BadgeId, UserRank } from "@/models/User";
import { cn } from "@/lib/utils";

interface Props {
  rank: UserRank;
  badges: BadgeId[];
  showAll?: boolean;
}

export function BadgeDisplay({ rank, badges, showAll = false }: Props) {
  const rankInfo = RANKS[rank];
  const display = showAll ? badges : badges.slice(0, 3);

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", `text-gradient bg-gradient-to-r ${rankInfo.gradient}`, "border-white/10 bg-clip-text")}>
        <span className={cn("font-bold text-[10px]", rankInfo.color)}>{rank}</span>
      </span>
      {display.map((id) => {
        const badge = BADGES[id];
        if (!badge) return null;
        return (
          <span
            key={id}
            title={badge.description}
            className={cn("inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", badge.color)}
          >
            {badge.emoji} {badge.label}
          </span>
        );
      })}
      {!showAll && badges.length > 3 && (
        <span className="text-[10px] text-muted-foreground">+{badges.length - 3}</span>
      )}
    </span>
  );
}
