"use client";
import { useEffect, useState } from "react";
import { List } from "lucide-react";

type Heading = { id: string; text: string; level: number };

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const article = document.querySelector(".prose-nfl");
    if (!article) return;

    const els = Array.from(article.querySelectorAll("h2, h3")) as HTMLElement[];
    const parsed: Heading[] = els.map((el, i) => {
      if (!el.id) {
        el.id = `toc-${i}-${el.textContent?.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40) || i}`;
      }
      return { id: el.id, text: el.textContent || "", level: parseInt(el.tagName[1]) };
    });
    setHeadings(parsed);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length < 3) return null;

  return (
    <>
      {/* Desktop sticky sidebar */}
      <nav className="hidden lg:block bg-white border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <List className="h-3.5 w-3.5 text-[#FF6200]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Table of Contents
          </span>
        </div>
        <ul className="space-y-1.5">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
              <a
                href={`#${h.id}`}
                className={`block text-xs py-0.5 leading-snug transition-colors rounded ${
                  active === h.id
                    ? "text-[#FF6200] font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.level === 3 && <span className="mr-1 opacity-40">›</span>}
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile collapsible ToC */}
      <div className="lg:hidden mb-6 bg-secondary/60 border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-[#FF6200]" />
            <span className="text-xs font-bold">Table of Contents</span>
          </div>
          <span className="text-muted-foreground text-xs">{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <ul className="px-4 pb-4 space-y-2 border-t border-border pt-3">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                <a
                  href={`#${h.id}`}
                  onClick={() => setOpen(false)}
                  className="block text-xs text-muted-foreground hover:text-[#FF6200] transition-colors"
                >
                  {h.level === 3 && <span className="mr-1 opacity-40">›</span>}
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
