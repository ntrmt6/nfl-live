"use client";

import { useState } from "react";
import { Download, Share2, Loader2 } from "lucide-react";

interface SportShareButtonsProps {
  away: string;
  home: string;
  awayFull: string;
  homeFull: string;
  awayProb: number;
  homeProb: number;
  drawProb: number;
  winner: string; // full name or "DRAW"
  confidence: number;
  league: string;
  awayLogo?: string;
  homeLogo?: string;
  awayColor?: string;
  homeColor?: string;
  gameUrl: string;
}

function buildCardUrl(p: SportShareButtonsProps): string {
  const params = new URLSearchParams({
    away: p.away,
    home: p.home,
    awayFull: p.awayFull,
    homeFull: p.homeFull,
    awayProb: p.awayProb.toFixed(0),
    homeProb: p.homeProb.toFixed(0),
    drawProb: p.drawProb.toFixed(0),
    winner: p.winner,
    confidence: p.confidence.toFixed(0),
    league: p.league,
  });
  if (p.awayLogo) params.set("awayLogo", p.awayLogo);
  if (p.homeLogo) params.set("homeLogo", p.homeLogo);
  if (p.awayColor) params.set("awayColor", p.awayColor.replace("#", ""));
  if (p.homeColor) params.set("homeColor", p.homeColor.replace("#", ""));
  return `/api/og/sport?${params.toString()}`;
}

async function triggerDownload(imageUrl: string, filename: string) {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
}

const platforms = [
  {
    id: "x",
    label: "X / Twitter",
    bg: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    bg: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "tumblr",
    label: "Tumblr",
    bg: "#35465C",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.304 1.406z" />
      </svg>
    ),
  },
  {
    id: "reddit",
    label: "Reddit",
    bg: "#FF4500",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
];

export function SportShareButtons(props: SportShareButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const cardPath = buildCardUrl(props);
  const filename = `${props.away}-vs-${props.home}-${props.league}-prediction.png`;
  const isDraw = props.winner === "DRAW";
  const winnerDisplay = isDraw ? "DRAW" : props.winner;

  const shareText = `${props.league.toUpperCase()} AI Prediction\n${props.awayFull} vs ${props.homeFull}\nModel Pick: ${winnerDisplay} (${props.confidence.toFixed(0)}% confidence)\n\nFull analysis 👇`;

  async function handlePlatform(id: string) {
    setLoading(id);
    try {
      const imageUrl = window.location.origin + cardPath;
      await triggerDownload(imageUrl, filename);

      const u = encodeURIComponent(props.gameUrl);
      const t = encodeURIComponent(shareText);
      const ti = encodeURIComponent(`${props.league}: ${props.awayFull} vs ${props.homeFull} – AI Prediction`);

      const urls: Record<string, string> = {
        x:        `https://twitter.com/intent/tweet?text=${t}&url=${u}&via=Nflpredictsml`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        tumblr:   `https://www.tumblr.com/share/photo?source=${encodeURIComponent(imageUrl)}&caption=${t}&clickthru=${u}`,
        reddit:   `https://www.reddit.com/submit?url=${u}&title=${ti}`,
      };

      if (urls[id]) window.open(urls[id], "_blank", "noopener,noreferrer,width=600,height=500");
      setDone(id);
      setTimeout(() => setDone(null), 3000);
    } catch {
      // silently ignore
    } finally {
      setLoading(null);
    }
  }

  async function handleDownload() {
    setLoading("download");
    try {
      await triggerDownload(window.location.origin + cardPath, filename);
      setDone("download");
      setTimeout(() => setDone(null), 3000);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Share2 className="h-4 w-4 text-[#FF6200]" />
        <h3 className="font-semibold text-sm">Share Prediction</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Download prediction card PNG and share across platforms.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {platforms.map((p) => {
          const isLoading = loading === p.id;
          const isDone = done === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePlatform(p.id)}
              disabled={!!loading}
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 active:scale-95"
              style={{ background: p.bg }}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isDone ? <span>✓</span> : p.icon}
              {isDone ? "Downloaded!" : p.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleDownload}
        disabled={!!loading}
        className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-[#FF6200]/40 bg-[#FF6200]/10 px-3 py-2.5 text-xs font-semibold text-[#FF6200] transition-all hover:bg-[#FF6200]/20 active:scale-95 disabled:opacity-50"
      >
        {loading === "download" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : done === "download" ? <span>✓</span> : <Download className="h-3.5 w-3.5" />}
        {done === "download" ? "Saved!" : "Download PNG Card"}
      </button>

      <p className="mt-3 text-[10px] text-muted-foreground/50 text-center">
        Image downloads automatically before opening share dialog
      </p>
    </div>
  );
}
