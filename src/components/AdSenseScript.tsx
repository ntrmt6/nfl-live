"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function AdSenseScript({ clientId }: { clientId?: string }) {
  const pathname = usePathname();

  if (!clientId) return null;
  if (pathname?.startsWith("/games/")) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
