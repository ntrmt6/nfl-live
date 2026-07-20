import Link from "next/link";
import { Brain, Twitter, Facebook, Youtube } from "lucide-react";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";

const FOOTER_LINKS = {
  Navigate: [
    { href: "/", label: "Home" },
    { href: "/predictions", label: "AI Picks" },
    { href: "/blog", label: "Analysis" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],

};

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/60">
      {/* Ambient top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF6200]/40 to-transparent" />

      <div className="container py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6200] to-[#FF8C00] shadow-glow group-hover:brightness-110 transition-all">
              <Brain className="h-5 w-5 text-white" />
            </span>
            <span className="font-black text-lg tracking-tight">
              NFL <span className="text-[#FF6200]">Predictions</span>{" "}
              <span className="text-muted-foreground font-medium">Hub</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
            AI-powered NFL game predictions, full 2026 schedule, matchup analysis,
            and expert fan coverage. Independent fan-operated site — not affiliated
            with or endorsed by the NFL.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://x.com/Nflpredictsml"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-secondary/50 text-muted-foreground hover:text-[#FF6200] hover:border-[#FF6200]/40 transition-all"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/share/1GJWAcF2xa/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-secondary/50 text-muted-foreground hover:text-[#FF6200] hover:border-[#FF6200]/40 transition-all"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.reddit.com/user/nflpredictshub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reddit"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-secondary/50 text-muted-foreground hover:text-[#FF6200] hover:border-[#FF6200]/40 transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </a>
            <a
              href="https://m.youtube.com/@nflpredictshub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-secondary/50 text-muted-foreground hover:text-[#FF6200] hover:border-[#FF6200]/40 transition-all"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section}>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FF6200] mb-4">{section}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {section === "Legal" && (
                <li>
                  <CookieSettingsButton />
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/40">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} NFL Predictions Hub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 text-center sm:text-right">
            NFL, team names &amp; logos are trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
