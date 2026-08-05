"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, TrendingUp, User, LogOut, ChevronDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { UserAvatar } from "@/components/comments/UserAvatar";
import { AuthModal } from "@/components/comments/AuthModal";
import { ScoreTicker } from "@/components/layout/ScoreTicker";
import { PushOptIn } from "@/components/PushOptIn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#schedule", label: "Scores" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/predictions", label: "NFL Picks" },
  { href: "/college-football", label: "CFB Picks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/leagues", label: "Leagues" },
  { href: "/teams", label: "Teams" },
  { href: "/blog", label: "Analysis" },
  { href: "/blog?tag=NFL+Picks", label: "Picks" },
  { href: "/blog?tag=Fantasy+Football+2026", label: "Fantasy" },
  { href: "/contact", label: "More" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />

      <header className="sticky top-0 z-50 w-full glass shadow-header">
        {/* TIER 1 — Score Ticker */}
        <ScoreTicker />

        {/* TIER 2 — Brand bar */}
        <div className="h-12 border-b border-border/40">
          <div className="container h-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6200] to-[#FF8C00] shadow-glow">
                <Brain className="h-4 w-4 text-white" />
              </span>
              <span className="font-bold text-base tracking-tight leading-none">
                NFL{" "}
                <span className="text-[#FF6200] font-black">Predictions</span>{" "}
                <span className="text-muted-foreground font-medium">Hub</span>
              </span>
            </Link>

            {/* Desktop right: Watch Live + user menu */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/predictions"
                className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#FF6200] to-[#FF8C00] hover:brightness-110 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-all shadow-sm"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                AI Picks
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary transition-colors"
                  >
                    <UserAvatar
                      username={user.username}
                      avatar={user.avatar}
                      rank={user.rank}
                      size="sm"
                    />
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {user.username}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-full mt-1.5 z-20 w-48 glass rounded-xl border border-border shadow-lg overflow-hidden"
                        >
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            My Profile
                          </Link>
                          <PushOptIn variant="compact" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors border-t border-border"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setShowAuth(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-foreground"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* TIER 3 — Navigation tabs (desktop) */}
        <div className="hidden md:block h-9 border-b border-border/50">
          <div className="container h-full">
            <nav className="flex items-center h-full overflow-x-auto scrollbar-none gap-0">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className={cn(
                      "flex items-center h-full px-4 text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2",
                      isActive
                        ? "border-[#FF6200] text-white"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <nav className="container flex flex-col gap-1 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary transition-colors",
                      pathname === link.href
                        ? "text-foreground bg-secondary/50"
                        : "text-foreground/80"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/predictions"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6200] to-[#FF8C00] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <TrendingUp className="h-4 w-4" />
                  AI Picks
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-secondary mt-1"
                    >
                      <UserAvatar
                        username={user.username}
                        avatar={user.avatar}
                        rank={user.rank}
                        size="sm"
                      />
                      {user.username}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setShowAuth(true);
                      setOpen(false);
                    }}
                    className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-secondary"
                  >
                    <User className="h-4 w-4" />
                    Sign In / Register
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
