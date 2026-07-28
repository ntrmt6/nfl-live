"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, KeyRound, ChevronRight, Crown } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/toast";
import { AuthModal } from "@/components/comments/AuthModal";

interface LeagueSummary {
  _id: string;
  name: string;
  code: string;
  season: number;
  ownerId: string;
  members: { userId: string; username: string }[];
}

export default function LeaguesPage() {
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const refresh = () => {
    setLoading(true);
    fetch("/api/leagues")
      .then((r) => r.json())
      .then((d) => setLeagues(d.leagues ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function createLeague(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      setCreateName("");
      toast({ title: `League "${data.league.name}" created!`, variant: "success" });
      refresh();
    } finally {
      setCreating(false);
    }
  }

  async function joinLeague(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await fetch("/api/leagues/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      setJoinCode("");
      toast({ title: `Joined "${data.league.name}"!`, variant: "success" });
      refresh();
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="container py-10 max-w-2xl">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} defaultTab="login" />

      <div className="flex items-center gap-3 mb-6">
        <Users className="h-7 w-7 text-[#FF6200]" />
        <div>
          <h1 className="text-2xl font-bold">Leagues</h1>
          <p className="text-sm text-muted-foreground">Private pick'em standings, just you and your friends.</p>
        </div>
      </div>

      {userLoading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : !user ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-semibold mb-1">Sign in to create or join a league</p>
          <p className="text-sm text-muted-foreground mb-4">Leagues track picks made on this account.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="rounded-lg bg-[#FF6200] px-4 py-2 text-sm font-bold text-white"
          >
            Login / Register
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <form onSubmit={createLeague} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Plus className="h-4 w-4 text-[#FF6200]" /> Create a League
              </h2>
              <input
                type="text"
                placeholder="e.g. Office Pick'em"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                maxLength={40}
                className="input-field w-full"
              />
              <button
                type="submit"
                disabled={creating || !createName.trim()}
                className="w-full rounded-lg bg-[#FF6200] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create League"}
              </button>
            </form>

            <form onSubmit={joinLeague} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="h-4 w-4 text-[#FF6200]" /> Join with a Code
              </h2>
              <input
                type="text"
                placeholder="e.g. AB12CD"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="input-field w-full uppercase tracking-widest"
              />
              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-bold hover:bg-secondary/80 disabled:opacity-50"
              >
                {joining ? "Joining…" : "Join League"}
              </button>
            </form>
          </div>

          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Leagues</h2>

          {loading ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : leagues.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              You're not in any leagues yet. Create one or join with a code above.
            </div>
          ) : (
            <div className="space-y-2">
              {leagues.map((league) => (
                <Link
                  key={league._id}
                  href={`/leagues/${league.code}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-[#FF6200]/40 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      {league.name}
                      {league.ownerId === user._id && <Crown className="h-3.5 w-3.5 text-[#FF6200]" />}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {league.members.length} member{league.members.length !== 1 ? "s" : ""} · {league.season} season · code {league.code}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
