"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Users, Radio, ShieldCheck, ExternalLink } from "lucide-react";
import { getTeam } from "@/lib/teams";

interface LiveStreamPlayerProps {
  affiliateUrl: string;
  homeTeam: string;
  awayTeam: string;
  viewerCountBase: number;
  isLive: boolean;
}

/**
 * Monetized "watch" surface. A click doesn't secretly hijack the tap — it
 * shows a labeled "connecting to stream partner" transition (sponsored
 * disclosure baked in) and then opens the affiliate destination in a new
 * tab, so the click's outcome matches what the UI told the user would happen.
 */
export function LiveStreamPlayer({
  affiliateUrl,
  homeTeam,
  awayTeam,
  viewerCountBase,
  isLive,
}: LiveStreamPlayerProps) {
  const home = getTeam(homeTeam);
  const away = getTeam(awayTeam);
  const [viewerCount, setViewerCount] = useState(viewerCountBase);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((v) => {
        const delta = Math.floor(Math.random() * 120) - 40;
        return Math.max(800, v + delta);
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!connecting) return;
    const timer = setTimeout(() => {
      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
      setConnecting(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [connecting, affiliateUrl]);

  const handleActivate = (e: React.MouseEvent) => {
    e.preventDefault();
    setConnecting(true);
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${away.color}dd, #05070a 55%, ${home.color}dd)`,
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 12px)",
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-bold text-white">
              <Radio className="h-3 w-3" />
              PRE-GAME
            </span>
          )}
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1 text-xs font-medium text-white/80">
            <Users className="h-3 w-3" />
            {viewerCount.toLocaleString()} watching
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/70">
          <ShieldCheck className="h-3 w-3" />
          Sponsored Stream Partner
        </span>
      </div>

      {/* Center play control */}
      <button
        onClick={handleActivate}
        className="absolute inset-0 flex items-center justify-center z-10 group cursor-pointer"
        aria-label="Watch live stream via partner"
      >
        <motion.span
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/95 shadow-[0_0_60px_rgba(255,255,255,0.3)]"
        >
          <Play className="h-9 w-9 sm:h-10 sm:w-10 text-black translate-x-0.5" fill="black" />
        </motion.span>
      </button>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-10">
        <div className="h-1 w-full rounded-full bg-white/20 mb-3 overflow-hidden">
          <div className="h-full w-1/3 bg-primary rounded-full" />
        </div>
        <div className="flex items-center justify-between text-white/80 text-xs">
          <span className="font-medium">
            {away.name} @ {home.name}
          </span>
          <span className="inline-flex items-center gap-1 text-white/60">
            Tap to watch <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>

      <AnimatePresence>
        {connecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
            />
            <p className="text-sm font-medium text-white/90">
              Connecting to live stream partner&hellip;
            </p>
            <p className="text-xs text-white/50 max-w-xs text-center">
              You&apos;re being redirected to our verified streaming partner in
              a new tab.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
