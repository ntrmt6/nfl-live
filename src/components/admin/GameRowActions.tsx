"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function GameRowActions({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Delete this game? This cannot be undone.")) return;
    const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Game deleted", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Failed to delete game", variant: "error" });
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/games/${slug}`}
        target="_blank"
        className="p-2 text-muted-foreground hover:text-foreground"
        title="View live page"
      >
        <ExternalLink className="h-4 w-4" />
      </Link>
      <Link
        href={`/admin/games/${id}/edit`}
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
