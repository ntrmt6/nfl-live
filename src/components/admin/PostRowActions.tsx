"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function PostRowActions({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Post deleted", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Failed to delete post", variant: "error" });
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/blog/${slug}`}
        target="_blank"
        className="p-2 text-muted-foreground hover:text-foreground"
        title="View post"
      >
        <ExternalLink className="h-4 w-4" />
      </Link>
      <Link
        href={`/admin/blog/${id}/edit`}
        className="p-2 text-muted-foreground hover:text-primary"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={handleDelete}
        className="p-2 text-muted-foreground hover:text-destructive"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
