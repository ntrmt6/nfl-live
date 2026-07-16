"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Send, LogIn } from "lucide-react";
import { CommentItem, type CommentData } from "./CommentItem";
import { UserAvatar } from "./UserAvatar";
import { AuthModal } from "./AuthModal";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/toast";

interface Props {
  postSlug: string;
}

export function CommentSection({ postSlug }: Props) {
  const { user } = useUser();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => { load(); }, [load]);

  const topLevel = comments.filter((c) => !c.parentId);
  const replies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setAuthTab("login"); setShowAuth(true); return; }
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, content }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      if (data.comment.status === "pending") {
        toast({ title: "Comment submitted for review!", description: "Your comment will appear after approval." });
      } else {
        setComments((prev) => [...prev, data.comment]);
        toast({ title: "Comment posted! 🏈", variant: "success" });
      }
      setContent("");
    } catch {
      toast({ title: "Failed to post comment.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyPosted = (reply: CommentData) => {
    setComments((prev) => [...prev, reply]);
  };

  const handleDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
  };

  const handleUpdated = (id: string, newContent: string) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, content: newContent, isEdited: true } : c));
  };

  return (
    <>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
      <section>
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">
            {loading ? "Comments" : `${comments.length} Comment${comments.length !== 1 ? "s" : ""}`}
          </h2>
        </div>

        {/* Comment form */}
        <div className="mb-8">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3">
                <UserAvatar username={user.username} avatar={user.avatar} rank={user.rank} size="sm" />
                <div className="flex-1">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts on this game…"
                    className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[80px]"
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{content.length}/2000</span>
                    <button
                      type="submit"
                      disabled={submitting || !content.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.98] transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submitting ? "Posting…" : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-border/50 bg-secondary/20 p-6 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Join the conversation</p>
              <p className="text-xs text-muted-foreground mb-4">Sign in to comment, like, and reply to other fans</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => { setAuthTab("login"); setShowAuth(true); }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </button>
                <button
                  onClick={() => { setAuthTab("register"); setShowAuth(true); }}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-105 transition-all"
                >
                  Join Free
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Comments list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-secondary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-secondary rounded w-32" />
                  <div className="h-3 bg-secondary rounded w-full" />
                  <div className="h-3 bg-secondary rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : topLevel.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No comments yet. Be the first to share your take! 🏈
          </div>
        ) : (
          <div className="space-y-6">
            {topLevel.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReplyPosted={handleReplyPosted}
                  onDeleted={handleDeleted}
                  onUpdated={handleUpdated}
                />
                {replies(comment.id).length > 0 && (
                  <div className="mt-4 space-y-4">
                    {replies(comment.id).map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        onReplyPosted={handleReplyPosted}
                        onDeleted={handleDeleted}
                        onUpdated={handleUpdated}
                        isReply
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
