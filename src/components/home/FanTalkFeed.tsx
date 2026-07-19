"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { UserAvatar } from "@/components/comments/UserAvatar";

interface FanPost {
  id: string;
  content: string;
  createdAt: string;
  user: { username: string; avatar?: string; rank: string };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function FanTalkFeed() {
  const { user } = useUser();
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/comments?postSlug=fan-talk")
      .then((r) => r.json())
      .then((d) => {
        const sorted = (d.comments ?? []).slice(-20).reverse();
        setPosts(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postSlug: "fan-talk", content: text.trim() }),
    });
    const d = await res.json();
    if (d.comment) {
      setPosts((prev) => [d.comment, ...prev]);
      setText("");
    }
    setSending(false);
  }

  return (
    <section className="py-4 border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-[#00A8FF] to-[#0077cc]" />
        <MessageSquare className="h-4 w-4 text-[#00A8FF]" />
        <h2 className="text-base font-black tracking-tight text-foreground">
          Fan <span className="text-[#00A8FF]">Talk</span>
        </h2>
        <span className="text-xs text-muted-foreground font-medium ml-1">— share your take on today's games</span>
        <div className="flex-1 h-px bg-gradient-to-r from-border/80 to-transparent" />
      </div>

      {/* Post input */}
      {user ? (
        <form onSubmit={submit} className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-secondary/40 border border-border/60">
          <UserAvatar username={user.username} avatar={user.avatar} rank={user.rank} size="sm" />
          <div className="flex-1 min-w-0">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's your take on today's games? 🏈"
              rows={2}
              maxLength={280}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-muted-foreground/50">{text.length}/280</span>
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A8FF] hover:brightness-110 disabled:opacity-40 px-3 py-1.5 text-xs font-bold text-white transition-all"
              >
                {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Post
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-4 p-3 rounded-lg bg-secondary/40 border border-border/60 text-center">
          <p className="text-xs text-muted-foreground">
            <Link href="/profile" className="text-[#00A8FF] font-semibold hover:underline">Sign in</Link> to join the conversation
          </p>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-none pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No posts yet — be the first to share your take!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex gap-2.5 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors">
              <UserAvatar username={post.user.username} avatar={post.user.avatar} rank={post.user.rank as any} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-foreground">{post.user.username}</span>
                  <span className="text-[10px] text-muted-foreground/60">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed mt-0.5 break-words">{post.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
