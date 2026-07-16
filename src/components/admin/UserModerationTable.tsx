"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldBan, ShieldCheck, Trophy, Plus, X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { UserAvatar } from "@/components/comments/UserAvatar";
import { BadgeDisplay } from "@/components/comments/BadgeDisplay";
import { BADGES } from "@/lib/badge-system";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { BadgeId, UserRank } from "@/models/User";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  rank: UserRank;
  badges: BadgeId[];
  reputationPoints: number;
  commentCount: number;
  isBanned: boolean;
  createdAt: string;
}

const ADMIN_BADGES: BadgeId[] = ["nfl-expert", "verified-fan", "mvp"];
const RANKS: UserRank[] = ["Rookie", "Regular", "Veteran", "All-Pro", "Hall of Famer"];

export function UserModerationTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast({ title: "Failed to load users.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => { load(); }, [load]);

  const patchUser = async (id: string, body: object) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { toast({ title: data.error, variant: "error" }); return null; }
    return data.user as AdminUser;
  };

  const toggleBan = async (user: AdminUser) => {
    const updated = await patchUser(user._id, { isBanned: !user.isBanned });
    if (!updated) return;
    setUsers((prev) => prev.map((u) => u._id === user._id ? updated : u));
    toast({ title: updated.isBanned ? "User suspended." : "User restored.", variant: "success" });
  };

  const setRank = async (user: AdminUser, rank: UserRank) => {
    const updated = await patchUser(user._id, { rank });
    if (!updated) return;
    setUsers((prev) => prev.map((u) => u._id === user._id ? updated : u));
    if (editingUser?._id === user._id) setEditingUser(updated);
    toast({ title: `Rank set to ${rank}.`, variant: "success" });
  };

  const addBadge = async (user: AdminUser, badge: BadgeId) => {
    const updated = await patchUser(user._id, { addBadge: badge });
    if (!updated) return;
    setUsers((prev) => prev.map((u) => u._id === user._id ? updated : u));
    if (editingUser?._id === user._id) setEditingUser(updated);
    toast({ title: `Badge "${BADGES[badge].label}" awarded.`, variant: "success" });
  };

  const removeBadge = async (user: AdminUser, badge: BadgeId) => {
    const updated = await patchUser(user._id, { removeBadge: badge });
    if (!updated) return;
    setUsers((prev) => prev.map((u) => u._id === user._id ? updated : u));
    if (editingUser?._id === user._id) setEditingUser(updated);
    toast({ title: "Badge removed.", variant: "success" });
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search username or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
        <button type="submit" className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">Search</button>
        {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); }} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>}
        <span className="ml-auto text-sm text-muted-foreground self-center">{total} users</span>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No users found.</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className={cn("glass rounded-xl border border-border p-4 transition-colors", u.isBanned && "border-destructive/30 bg-destructive/5")}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar username={u.username} avatar={u.avatar} rank={u.rank} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{u.username}</span>
                      {u.isBanned && <span className="text-xs text-destructive font-medium">Suspended</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <BadgeDisplay rank={u.rank} badges={u.badges} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground hidden md:block">{u.commentCount} comments</span>
                  <button
                    onClick={() => setEditingUser(u)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Trophy className="h-3.5 w-3.5" /> Manage
                  </button>
                  <button
                    onClick={() => toggleBan(u)}
                    className={cn("rounded-lg p-1.5 transition-colors", u.isBanned ? "text-green-400 hover:bg-green-500/20" : "text-muted-foreground hover:bg-destructive/20 hover:text-destructive")}
                    title={u.isBanned ? "Restore account" : "Suspend account"}
                  >
                    {u.isBanned ? <ShieldCheck className="h-4 w-4" /> : <ShieldBan className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="rounded-lg p-2 hover:bg-secondary disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">{page} / {pages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page === pages} className="rounded-lg p-2 hover:bg-secondary disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative w-full max-w-md glass rounded-2xl border border-border p-6 shadow-2xl">
            <button onClick={() => setEditingUser(null)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <UserAvatar username={editingUser.username} avatar={editingUser.avatar} rank={editingUser.rank} size="md" />
              <div>
                <p className="font-bold">{editingUser.username}</p>
                <BadgeDisplay rank={editingUser.rank} badges={editingUser.badges} />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Override Rank</label>
                <div className="flex flex-wrap gap-2">
                  {RANKS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRank(editingUser, r)}
                      className={cn("rounded-full px-3 py-1 text-xs font-medium border transition-colors", editingUser.rank === r ? "bg-primary/20 text-primary border-primary/40" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground")}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Admin Badges</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editingUser.badges.map((b) => {
                    const badge = BADGES[b];
                    if (!badge) return null;
                    return (
                      <span key={b} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs", badge.color)}>
                        {badge.emoji} {badge.label}
                        <button onClick={() => removeBadge(editingUser, b)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                  {editingUser.badges.length === 0 && <span className="text-xs text-muted-foreground">No badges yet.</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ADMIN_BADGES.filter((b) => !editingUser.badges.includes(b)).map((b) => {
                    const badge = BADGES[b];
                    return (
                      <button
                        key={b}
                        onClick={() => addBadge(editingUser, b)}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" /> {badge.emoji} {badge.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
