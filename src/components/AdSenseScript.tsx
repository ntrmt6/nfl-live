"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCookieConsent } from "@/context/CookieConsentContext";

export function AdSenseScript({ clientId }: { clientId?: string }) {
  const pathname = usePathname();
  const { preferences, status } = useCookieConsent();

  if (!clientId) return null;
  if (pathname?.startsWith("/games/")) return null;
  if (status === "pending") return null;
  if (!preferences.advertising) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
