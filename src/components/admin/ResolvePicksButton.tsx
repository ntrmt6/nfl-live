"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ResolvePicksButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  async function resolve() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/picks/resolve", { method: "POST" });
      const data = await res.json();
      setResult(data.resolved ?? 0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={resolve}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold hover:bg-secondary/80 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      )}
      {result !== null ? `Resolved ${result} picks` : "Resolve Picks"}
    </button>
  );
}
