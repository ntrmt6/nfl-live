"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, Reply, Flag, Trash2, Pencil, Check, X } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { BadgeDisplay } from "./BadgeDisplay";
import { AuthModal } from "./AuthModal";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { UserRank, BadgeId } from "@/models/User";

export interface CommentData {
  id: string;
  postSlug: string;
  content: string;
  parentId?: string | null;
  likeCount: number;
  isLikedByMe: boolean;
  isEdited: boolean;
  createdAt: string;
  status?: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    rank: UserRank;
    badges: BadgeId[];
  };
}

interface Props {
  comment: CommentData;
  onReplyPosted: (reply: CommentData) => void;
  onDeleted: (id: string) => void;
  onUpdated: (id: string, content: string) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, onReplyPosted, onDeleted, onUpdated, isReply }: Props) {
  const { user } = useUser();
  const { toast } = useToast();
  const [liked, setLiked] = useState(comment.isLikedByMe);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReply, setShowReply] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [reported, setReported] = useState(false);

  const isOwner = user?._id === comment.user._id;

  const handleLike = async () => {
    if (!user) { setShowAuth(true); return; }
    const prev = { liked, likeCount };
    setLiked((v) => !v);
    setLikeCount((n) => (liked ? n - 1 : n + 1));
    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
      if (!res.ok) { setLiked(prev.liked); setLikeCount(prev.likeCount); }
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
    }
  };

  const handleReport = async () => {
    if (!user) { setShowAuth(true); return; }
    if (reported) return;
    try {
      const res = await fetch(`/api/comments/${comment.id}/report`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      setReported(true);
      toast({ title: "Comment reported. Thanks for helping keep things clean.", variant: "success" });
    } catch {
      toast({ title: "Failed to report.", variant: "error" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      if (!res.ok) { toast({ title: "Failed to delete.", variant: "error" }); return; }
      onDeleted(comment.id);
    } catch {
      toast({ title: "Failed to delete.", variant: "error" });
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSubmittingEdit(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) { toast({ title: "Failed to edit.", variant: "error" }); return; }
      onUpdated(comment.id, editContent);
      setEditing(false);
      toast({ title: "Comment updated.", variant: "success" });
    } catch {
      toast({ title: "Failed to edit.", variant: "error" });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug: comment.postSlug, content: replyContent, parentId: comment.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      if (data.comment.status === "pending") {
        toast({ title: "Reply submitted for review.", description: "It will appear after moderation." });
      } else {
        onReplyPosted(data.comment);
        toast({ title: "Reply posted!", variant: "success" });
      }
      setReplyContent("");
      setShowReply(false);
    } catch {
      toast({ title: "Failed to post reply.", variant: "error" });
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <div className={cn("group", isReply && "ml-8 pl-4 border-l border-border/50")}>
        <div className="flex gap-3">
          <UserAvatar username={comment.user.username} avatar={comment.user.avatar} rank={comment.user.rank} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-foreground">{comment.user.username}</span>
              <BadgeDisplay rank={comment.user.rank} badges={comment.user.badges} />
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.isEdited && <span className="ml-1 italic">(edited)</span>}
              </span>
            </div>

            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  maxLength={2000}
                />
                <div className="flex gap-2">
                  <button onClick={handleEdit} disabled={submittingEdit} className="inline-flex items-center gap-1 rounded-md bg-primary/20 text-primary px-3 py-1 text-xs font-medium hover:bg-primary/30">
                    <Check className="h-3 w-3" /> Save
                  </button>
                  <button onClick={() => { setEditing(false); setEditContent(comment.content); }} className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleLike}
                className={cn("inline-flex items-center gap-1 text-xs transition-colors", liked ? "text-red-400" : "text-muted-foreground hover:text-red-400")}
              >
                <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                {likeCount > 0 && likeCount}
              </button>
              {!isReply && (
                <button
                  onClick={() => { if (!user) { setShowAuth(true); return; } setShowReply((v) => !v); }}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Reply className="h-3.5 w-3.5" /> Reply
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </>
              )}
              {!isOwner && (
                <button
                  onClick={handleReport}
                  disabled={reported}
                  className={cn("inline-flex items-center gap-1 text-xs transition-colors opacity-0 group-hover:opacity-100", reported ? "text-amber-400" : "text-muted-foreground hover:text-amber-400")}
                >
                  <Flag className="h-3.5 w-3.5" /> {reported ? "Reported" : "Report"}
                </button>
              )}
            </div>

            {showReply && (
              <form onSubmit={handleReply} className="mt-3 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.user.username}…`}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={2}
                  maxLength={2000}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="rounded-md bg-primary/20 text-primary px-3 py-1 text-xs font-semibold hover:bg-primary/30 disabled:opacity-60"
                  >
                    {submittingReply ? "Posting…" : "Post Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowReply(false); setReplyContent(""); }}
                    className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
