"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, ShieldAlert, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { UserRank } from "@/models/User";

interface AdminComment {
  _id: string;
  postSlug: string;
  content: string;
  status: string;
  reportCount: number;
  createdAt: string;
  userId: { username: string; rank: UserRank };
}

const STATUSES = ["pending", "approved", "spam", "rejected"] as const;

export function CommentModerationTable() {
  const { toast } = useToast();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("pending");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?status=${status}&page=${page}`);
      const data = await res.json();
      setComments(data.comments || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast({ title: "Failed to load comments.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [status, page, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status]);

  const action = async (id: string, newStatus?: string, del?: boolean) => {
    try {
      if (del) {
        await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/admin/comments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      }
      setComments((prev) => prev.filter((c) => c._id !== id));
      setTotal((n) => n - 1);
      toast({ title: del ? "Comment deleted." : `Comment ${newStatus}.`, variant: "success" });
    } catch {
      toast({ title: "Action failed.", variant: "error" });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors capitalize",
              status === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground self-center">{total} total</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No {status} comments.</div>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c._id} className="glass rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm">{c.userId?.username ?? "deleted"}</span>
                    <span className="text-xs text-muted-foreground">on /{c.postSlug}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                    {c.reportCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-xs">
                        <ShieldAlert className="h-3 w-3" /> {c.reportCount} reports
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2">{c.content}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {status !== "approved" && (
                    <ActionBtn onClick={() => action(c._id, "approved")} color="green" title="Approve">
                      <Check className="h-4 w-4" />
                    </ActionBtn>
                  )}
                  {status !== "rejected" && (
                    <ActionBtn onClick={() => action(c._id, "rejected")} color="orange" title="Reject">
                      <X className="h-4 w-4" />
                    </ActionBtn>
                  )}
                  {status !== "spam" && (
                    <ActionBtn onClick={() => action(c._id, "spam")} color="yellow" title="Mark Spam">
                      <ShieldAlert className="h-4 w-4" />
                    </ActionBtn>
                  )}
                  <ActionBtn onClick={() => action(c._id, undefined, true)} color="red" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </ActionBtn>
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
    </div>
  );
}

function ActionBtn({ onClick, color, title, children }: { onClick: () => void; color: string; title: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    green: "hover:bg-green-500/20 hover:text-green-400",
    orange: "hover:bg-orange-500/20 hover:text-orange-400",
    yellow: "hover:bg-yellow-500/20 hover:text-yellow-400",
    red: "hover:bg-red-500/20 hover:text-red-400",
  };
  return (
    <button onClick={onClick} title={title} className={cn("rounded-lg p-1.5 text-muted-foreground transition-colors", colors[color])}>
      {children}
    </button>
  );
}
