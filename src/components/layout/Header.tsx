"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Radio, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { UserAvatar } from "@/components/comments/UserAvatar";
import { AuthModal } from "@/components/comments/AuthModal";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
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
      <header className="sticky top-0 z-50 w-full glass">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow">
              <Radio className="h-5 w-5 text-black" />
            </span>
            <span className="font-bold text-lg tracking-tight">
              NFL <span className="text-gradient">Live Zone</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  pathname === link.href && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/#schedule"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-black shadow-glow transition-all hover:shadow-glow-blue hover:brightness-105 active:scale-[0.98]"
            >
              <Radio className="h-4 w-4" />
              Watch Live
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary transition-colors"
                >
                  <UserAvatar username={user.username} avatar={user.avatar} rank={user.rank} size="sm" />
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.username}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
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
                onClick={() => { setAuthTab("login"); setShowAuth(true); }}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

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
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/#schedule"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-black"
                >
                  <Radio className="h-4 w-4" />
                  Watch Live
                </Link>
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-secondary mt-1">
                      <UserAvatar username={user.username} avatar={user.avatar} rank={user.rank} size="sm" />
                      {user.username}
                    </Link>
                    <button onClick={() => { handleLogout(); setOpen(false); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setAuthTab("login"); setShowAuth(true); setOpen(false); }}
                    className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-secondary"
                  >
                    <User className="h-4 w-4" /> Sign In / Register
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
