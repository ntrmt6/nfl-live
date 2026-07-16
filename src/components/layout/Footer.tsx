import Link from "next/link";
import { TrendingUp, Twitter, Facebook, Instagram } from "lucide-react";

const FOOTER_LINKS = {
  Site: [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
  ],
  Legal: [
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6200] to-[#FF8C00]">
              <TrendingUp className="h-5 w-5 text-white" />
            </span>
            <span className="font-bold text-lg">
              NFL <span className="text-[#FF6200] font-black">Predictions</span>{" "}
              <span className="text-muted-foreground">Hub</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            AI-powered NFL game predictions, full schedule, matchup analysis,
            and expert fan coverage. NFL Predictions Hub is an independent
            fan-operated site and is not affiliated with or endorsed by the
            National Football League.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section}>
            <h4 className="font-semibold text-sm mb-4 text-foreground">{section}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} NFL Predictions Hub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            NFL, team names, and logos are trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
