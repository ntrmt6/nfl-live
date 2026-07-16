"use client";

import Image from "next/image";
import { useState } from "react";
import { getTeam } from "@/lib/teams";

interface TeamLogoProps {
  abbr: string;
  size?: number;
  className?: string;
}

export function TeamLogo({ abbr, size = 32, className = "" }: TeamLogoProps) {
  const [error, setError] = useState(false);
  const team = getTeam(abbr);
  const src = `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;

  if (error) {
    return (
      <span
        className={`flex items-center justify-center rounded text-white font-black shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.32,
          background: team.color === "#000000" ? "#222" : team.color,
        }}
      >
        {abbr.slice(0, 3)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={team.name}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      onError={() => setError(true)}
      unoptimized
    />
  );
}
