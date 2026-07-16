import { requireAdmin } from "@/lib/requireAdmin";
import { redirect } from "next/navigation";
import { UserModerationTable } from "@/components/admin/UserModerationTable";

export const metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage user ranks, badges, and account status.</p>
      </div>
      <UserModerationTable />
    </div>
  );
}
