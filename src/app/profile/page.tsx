"use client";

import { useRef, useState } from "react";
import { Camera, Save, LogOut, Trophy, MessageCircle, Star, Target } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/comments/UserAvatar";
import { BadgeDisplay } from "@/components/comments/BadgeDisplay";
import { RANKS } from "@/lib/badge-system";
import { useToast } from "@/components/ui/toast";
import { AuthModal } from "@/components/comments/AuthModal";
import { MyPicksTab } from "@/components/profile/MyPicksTab";
import { PushOptIn } from "@/components/PushOptIn";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, setUser, logout, isLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "picks">("profile");

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthModal open={true} onClose={() => router.push("/")} defaultTab="login" />
        <div className="container py-16 text-center text-muted-foreground">Sign in to view your profile.</div>
      </>
    );
  }

  const rankInfo = RANKS[user.rank];

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) { toast({ title: "Image must be under 2MB.", variant: "error" }); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setSaving(true);
      try {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: base64 }),
        });
        const data = await res.json();
        if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
        setUser({ ...user, avatar: base64 });
        toast({ title: "Avatar updated!", variant: "success" });
      } catch {
        toast({ title: "Failed to update avatar.", variant: "error" });
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUsername = async () => {
    if (!username.trim() || username === user.username) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      setUser({ ...user, username });
      setUsername("");
      toast({ title: "Username updated!", variant: "success" });
    } catch {
      toast({ title: "Failed to update username.", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const nextRanks = { Rookie: "Regular", Regular: "Veteran", Veteran: "All-Pro", "All-Pro": "Hall of Famer", "Hall of Famer": null } as const;
  const nextRankThresholds = { Rookie: 10, Regular: 50, Veteran: 200, "All-Pro": 1000, "Hall of Famer": null };
  const nextThreshold = nextRankThresholds[user.rank];
  const progress = nextThreshold ? Math.min(100, (user.reputationPoints / nextThreshold) * 100) : 100;

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-secondary/50 border border-border/60 w-fit">
        {([
          { id: "profile", label: "Overview", icon: <Star className="h-3.5 w-3.5" /> },
          { id: "picks", label: "My Picks", icon: <Target className="h-3.5 w-3.5" /> },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "picks" && <MyPicksTab />}
      {activeTab !== "picks" && <>

      <div className="glass rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="relative">
            <UserAvatar username={user.username} avatar={user.avatar} rank={user.rank} size="lg" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-black shadow-md hover:brightness-110"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <BadgeDisplay rank={user.rank} badges={user.badges} showAll />
            </div>
          </div>
        </div>

        {/* Rank progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">Reputation Progress</span>
            <span className={`text-xs font-bold ${rankInfo.color}`}>{user.reputationPoints} pts</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${rankInfo.gradient} transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {nextRanks[user.rank] && (
            <p className="text-xs text-muted-foreground mt-1">
              {nextThreshold! - user.reputationPoints} more points to reach <span className="font-medium">{nextRanks[user.rank]}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: <MessageCircle className="h-5 w-5" />, label: "Comments", value: user.commentCount },
          { icon: <Star className="h-5 w-5" />, label: "Reputation", value: user.reputationPoints },
          { icon: <Trophy className="h-5 w-5" />, label: "Badges", value: user.badges.length },
        ].map(({ icon, label, value }) => (
          <div key={label} className="glass rounded-xl border border-border p-4 text-center">
            <div className="flex justify-center text-primary mb-1">{icon}</div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Edit username */}
      <div className="glass rounded-2xl border border-border p-6 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Change Username</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={user.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field flex-1"
            minLength={3}
            maxLength={30}
          />
          <button
            onClick={handleSaveUsername}
            disabled={saving || !username.trim() || username === user.username}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 text-primary px-4 py-2 text-sm font-medium hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
        <p className="text-xs text-muted-foreground">3–30 characters, letters/numbers/underscores only.</p>
      </div>

      <div className="mb-6">
        <PushOptIn />
      </div>

      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
      </>}
    </div>
  );
}
