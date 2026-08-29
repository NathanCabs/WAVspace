import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { isSupabaseConfigured } from "@/lib/constants";
import { requireAdmin } from "@/lib/data";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=Connect%20Supabase%20to%20use%20the%20admin%20desk.");
  }

  const { user, profile } = await requireAdmin();
  if (!user || profile?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</div>
    </div>
  );
}
