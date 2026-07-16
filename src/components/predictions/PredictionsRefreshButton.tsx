"use client";

import { useState } from "react";
import { RefreshCw, Loader2, CheckCircle2, XCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function PredictionsRefreshButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [info, setInfo] = useState<string>("");

  const run = async () => {
    setStatus("loading");
    setInfo("");
    try {
      const res = await fetch("/api/admin/predictions/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatus("error");
        setInfo(data.details || data.error || "Script failed");
      } else {
        setStatus("success");
        setInfo(
          `${data.predictions ?? 0} predictions generated · Model accuracy: ${data.modelAccuracy ?? "?"}%`
        );
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
      setStatus("error");
      setInfo(String(e));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF6200] hover:bg-[#e55800] disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors shadow"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {status === "loading" ? "Running ML model (~2 min)…" : "Run ML Model"}
        </button>

        {status === "success" && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Done
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1.5 text-sm text-red-400">
            <XCircle className="h-4 w-4" />
            Error
          </span>
        )}
      </div>

      {info && (
        <p className={`text-xs max-w-2xl ${status === "error" ? "text-red-400/80 font-mono whitespace-pre-wrap" : "text-muted-foreground"}`}>
          {info}
        </p>
      )}
    </div>
  );
}
