"use client";

import { useState } from "react";

export function SettingsForm({ adsenseClientId }: { adsenseClientId: string }) {
  const [clientId, setClientId] = useState(adsenseClientId);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adsenseClientId: clientId }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMsg("Settings saved.");
    } catch {
      setMsg("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Google AdSense Client ID
        </label>
        <input
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="ca-pub-0000000000000000"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave blank to disable AdSense. Changes take effect within 60 seconds.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </form>
  );
}
