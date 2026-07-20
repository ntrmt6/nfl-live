"use client";

import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/context/CookieConsentContext";

export function CookieSettingsButton() {
  const { openBanner } = useCookieConsent();
  return (
    <button
      onClick={openBanner}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all"
    >
      <Cookie className="h-3.5 w-3.5" />
      Cookie Settings
    </button>
  );
}
