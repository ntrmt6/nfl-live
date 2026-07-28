"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "unsupported" | "checking" | "off" | "on" | "denied";

export function PushOptIn({ variant = "card" }: { variant?: "card" | "compact" }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    }).catch(() => setStatus("off"));
  }, []);

  async function enable() {
    if (!user) {
      toast({ title: "Sign in first to enable alerts.", variant: "error" });
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const keyRes = await fetch("/api/push/vapid-public-key");
      if (!keyRes.ok) throw new Error("Push not configured");
      const { key } = await keyRes.json();

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      setStatus("on");
      toast({ title: "Game alerts enabled." });
    } catch {
      toast({ title: "Couldn't enable alerts. Try again later.", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported") return null;

  if (variant === "compact") {
    if (status === "checking" || status === "denied") return null;
    return (
      <button
        onClick={status === "on" ? disable : enable}
        disabled={busy}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary transition-colors border-t border-border disabled:opacity-50"
      >
        {status === "on" ? <BellRing className="h-4 w-4 text-[#FF6200]" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
        {status === "on" ? "Alerts On" : "Enable Game Alerts"}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
          {status === "on" ? <BellRing className="h-4 w-4 text-[#FF6200]" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
        </span>
        <div>
          <p className="font-semibold text-sm">Game Alerts</p>
          <p className="text-xs text-muted-foreground">Kickoff reminders and pick results, pushed to this device.</p>
        </div>
      </div>

      {status === "denied" ? (
        <p className="text-xs text-muted-foreground mt-3">
          Notifications are blocked for this site in your browser settings. Allow notifications, then reload this page.
        </p>
      ) : (
        <button
          onClick={status === "on" ? disable : enable}
          disabled={busy || status === "checking"}
          className={`mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
            status === "on"
              ? "border border-border text-muted-foreground hover:bg-secondary"
              : "bg-[#FF6200] text-white hover:brightness-110"
          }`}
        >
          {busy ? "Working…" : status === "on" ? "Turn Off Alerts" : "Enable Alerts"}
        </button>
      )}
    </div>
  );
}
