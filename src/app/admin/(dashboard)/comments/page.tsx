import { requireAdmin } from "@/lib/requireAdmin";
import { redirect } from "next/navigation";
import { CommentModerationTable } from "@/components/admin/CommentModerationTable";

export const metadata = { title: "Comment Moderation" };

export default async function AdminCommentsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Comment Moderation</h1>
        <p className="text-sm text-muted-foreground mt-1">Review, approve, or remove user comments.</p>
      </div>
      <CommentModerationTable />
    </div>
  );
}
