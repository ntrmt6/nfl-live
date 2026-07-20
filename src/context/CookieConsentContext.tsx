"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CookiePreferences {
  essential: true;       // always on
  analytics: boolean;
  advertising: boolean;
}

type ConsentStatus = "pending" | "accepted" | "rejected" | "custom";

interface CookieConsentContextValue {
  status: ConsentStatus;
  preferences: CookiePreferences;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveCustom: (prefs: Omit<CookiePreferences, "essential">) => void;
  openBanner: () => void;
}

const DEFAULT_PREFS: CookiePreferences = { essential: true, analytics: false, advertising: false };
const STORAGE_KEY = "cookie_consent_v1";

const CookieConsentContext = createContext<CookieConsentContextValue>({
  status: "pending",
  preferences: DEFAULT_PREFS,
  showBanner: false,
  acceptAll: () => {},
  rejectAll: () => {},
  saveCustom: () => {},
  openBanner: () => {},
});

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>("pending");
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFS);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { status: ConsentStatus; preferences: CookiePreferences };
        setStatus(parsed.status);
        setPreferences(parsed.preferences);
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  const save = useCallback((newStatus: ConsentStatus, newPrefs: CookiePreferences) => {
    setStatus(newStatus);
    setPreferences(newPrefs);
    setShowBanner(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: newStatus, preferences: newPrefs }));
    } catch {}
  }, []);

  const acceptAll = useCallback(() => {
    save("accepted", { essential: true, analytics: true, advertising: true });
  }, [save]);

  const rejectAll = useCallback(() => {
    save("rejected", { essential: true, analytics: false, advertising: false });
  }, [save]);

  const saveCustom = useCallback((prefs: Omit<CookiePreferences, "essential">) => {
    save("custom", { essential: true, ...prefs });
  }, [save]);

  const openBanner = useCallback(() => setShowBanner(true), []);

  return (
    <CookieConsentContext.Provider value={{ status, preferences, showBanner, acceptAll, rejectAll, saveCustom, openBanner }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
