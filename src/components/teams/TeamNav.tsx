"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", path: "" },
  { label: "Games", path: "/games" },
  { label: "Blog", path: "/blog" },
];

export function TeamNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/teams/${slug}`;

  return (
    <div className="border-t border-white/10">
      <div className="container">
        <nav className="flex gap-1">
          {TABS.map((tab) => {
            const href = `${base}${tab.path}`;
            const isActive =
              tab.path === "" ? pathname === base : pathname.startsWith(href);
            return (
              <Link
                key={tab.label}
                href={href}
                className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-white/55 hover:text-white/90"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
