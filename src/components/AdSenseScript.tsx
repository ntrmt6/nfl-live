"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Loads AdSense only on genuine-content pages (home, blog, legal, contact).
 * Deliberately excluded from /games/* pages, since those host the
 * click-to-redirect stream player — running Google ads alongside that
 * interaction is the combination most likely to trigger an AdSense policy
 * review or suspension.
 */
export function AdSenseScript() {
  const pathname = usePathname();
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!adsenseClient) return null;
  if (pathname?.startsWith("/games/")) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
