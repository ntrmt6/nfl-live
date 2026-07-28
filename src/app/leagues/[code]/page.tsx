"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Crown, Flame, Copy, LogOut, Trash2, Trophy } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/toast";

interface LeaderboardEntry {
  userId: string;
  username: string;
  total: number;
  correct: number;
  wrong: number;
  resolved: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
}

interface LeagueDetail {
  _id: string;
  name: string;
  code: string;
  season: number;
  ownerId: string;
  ownerUsername: string;
  members: { userId: string; username: string; joinedAt: string }[];
}

export default function LeagueDetailPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (!user) { setLoading(false); return; }

    fetch(`/api/leagues/${code}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setError(d.error || "Couldn't load this league"); return; }
        setLeague(d.league);
        setLeaderboard(d.leaderboard ?? []);
      })
      .catch(() => setError("Couldn't load this league"))
      .finally(() => setLoading(false));
  }, [code, user, userLoading]);

  async function leaveLeague() {
    if (!confirm("Leave this league?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/leagues/${code}/leave`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      router.push("/leagues");
    } finally {
      setBusy(false);
    }
  }

  async function deleteLeague() {
    if (!confirm("Delete this league for everyone? This can't be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/leagues/${code}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      router.push("/leagues");
    } finally {
      setBusy(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(String(code));
    toast({ title: "Invite code copied!" });
  }

  return (
    <div className="container py-10 max-w-2xl">
      <Link href="/leagues" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to leagues
      </Link>

      {loading || userLoading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : !user ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Sign in to view this league.
        </div>
      ) : error || !league ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {error ?? "League not found"}
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">{league.name}</h1>
              <p className="text-sm text-muted-foreground">
                {league.season} season · {league.members.length} member{league.members.length !== 1 ? "s" : ""} · commissioner {league.ownerUsername}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-bold tracking-widest hover:bg-secondary/80 shrink-0"
            >
              <Copy className="h-3.5 w-3.5" />
              {code}
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center mb-6">
              <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold">No picks yet this season</p>
              <p className="text-sm text-muted-foreground mt-1">Once members start picking games, standings show up here.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden mb-6">
              <div className="grid grid-cols-[40px_1fr_80px_80px_80px] gap-0 border-b border-border bg-secondary/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <span>#</span>
                <span>Member</span>
                <span className="text-center">Streak</span>
                <span className="text-center">Record</span>
                <span className="text-center">Accuracy</span>
              </div>
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-[40px_1fr_80px_80px_80px] gap-0 items-center px-4 py-3 border-b border-border/50 last:border-0 ${
                    i === 0 ? "bg-[#FF6200]/5" : ""
                  }`}
                >
                  <span className={`text-sm font-bold ${i === 0 ? "text-[#FF6200]" : "text-muted-foreground/50"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <p className="font-semibold text-sm flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{entry.username}</span>
                    {entry.userId === league.ownerId && <Crown className="h-3 w-3 text-[#FF6200] shrink-0" />}
                  </p>
                  <div className="text-center">
                    {entry.streak > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-sm font-bold text-[#FF6200]">
                        <Flame className="h-3.5 w-3.5" />{entry.streak}
                      </span>
                    ) : <span className="text-sm text-muted-foreground">—</span>}
                  </div>
                  <div className="text-center text-sm font-medium">
                    {entry.resolved > 0 ? `${entry.correct}–${entry.wrong}` : <span className="text-muted-foreground">—</span>}
                  </div>
                  <div className="text-center">
                    {entry.resolved > 0 ? (
                      <span className={`text-sm font-bold ${entry.accuracy >= 60 ? "text-green-500" : "text-foreground"}`}>{entry.accuracy}%</span>
                    ) : <span className="text-xs text-muted-foreground">pending</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Members</p>
            <div className="flex flex-wrap gap-2">
              {league.members.map((m) => (
                <span key={m.userId} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium max-w-[calc(100vw-4rem)]">
                  <span className="truncate">{m.username}</span>
                  {m.userId === league.ownerId && <Crown className="h-3 w-3 text-[#FF6200] shrink-0" />}
                </span>
              ))}
            </div>
          </div>

          {league.ownerId === user._id ? (
            <button
              onClick={deleteLeague}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Delete league
            </button>
          ) : (
            <button
              onClick={leaveLeague}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" /> Leave league
            </button>
          )}
        </>
      )}
    </div>
  );
}
