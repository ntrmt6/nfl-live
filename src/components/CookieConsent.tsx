"use client";

import { useState } from "react";
import Link from "next/link";
import { Cookie, ChevronDown, ChevronUp, X, Shield, BarChart3, Megaphone, Check } from "lucide-react";
import { useCookieConsent } from "@/context/CookieConsentContext";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        checked ? "bg-[#FF6200]" : "bg-secondary border border-border",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

export function CookieConsent() {
  const { showBanner, acceptAll, rejectAll, saveCustom } = useCookieConsent();
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
      <div className="mx-auto max-w-4xl pointer-events-auto">
        <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden">

          {/* Main bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 sm:p-5">
            {/* Icon + text */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF6200]/10 border border-[#FF6200]/20">
                <Cookie className="h-4.5 w-4.5 text-[#FF6200]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">We use cookies</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  We use cookies to improve your experience, analyze traffic, and serve personalised ads.
                  See our{" "}
                  <Link href="/privacy" className="text-[#FF6200] hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              >
                Customize
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={rejectAll}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="rounded-lg bg-[#FF6200] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e55a00] active:scale-95 transition-all"
              >
                Accept All
              </button>
            </div>
          </div>

          {/* Customize panel */}
          {expanded && (
            <div className="border-t border-border bg-secondary/30 p-4 sm:p-5 space-y-3">
              <p className="text-xs text-muted-foreground mb-1">Choose which cookies you allow:</p>

              {/* Essential */}
              <div className="flex items-start gap-3 rounded-xl bg-card border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">Essential Cookies</p>
                    <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                      <Check className="h-3 w-3" /> Always On
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Required for the site to function — login sessions, security, preferences.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start gap-3 rounded-xl bg-card border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">Analytics Cookies</p>
                    <Toggle checked={analytics} onChange={setAnalytics} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Help us understand how visitors use the site (page views, traffic sources).
                  </p>
                </div>
              </div>

              {/* Advertising */}
              <div className="flex items-start gap-3 rounded-xl bg-card border border-border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF6200]/10">
                  <Megaphone className="h-4 w-4 text-[#FF6200]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">Advertising Cookies</p>
                    <Toggle checked={advertising} onChange={setAdvertising} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Used to show relevant ads (Google AdSense). Helps keep the site free.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => saveCustom({ analytics, advertising })}
                  className="rounded-lg bg-[#FF6200] px-5 py-2 text-xs font-bold text-white hover:bg-[#e55a00] active:scale-95 transition-all"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
