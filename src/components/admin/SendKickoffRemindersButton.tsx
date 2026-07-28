"use client";

import { useState } from "react";
import { BellRing, Loader2 } from "lucide-react";

export function SendKickoffRemindersButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ gamesReminded: number; notificationsSent: number } | null>(null);

  async function send() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/push/kickoff-reminders", { method: "POST" });
      const data = await res.json();
      setResult({ gamesReminded: data.gamesReminded ?? 0, notificationsSent: data.notificationsSent ?? 0 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={send}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold hover:bg-secondary/80 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <BellRing className="h-4 w-4 text-[#FF6200]" />
      )}
      {result !== null
        ? `Reminded ${result.notificationsSent} (${result.gamesReminded} games)`
        : "Send Kickoff Reminders"}
    </button>
  );
}
