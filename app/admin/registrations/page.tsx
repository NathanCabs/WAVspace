import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RegistrationTable } from "@/components/admin/registration-table";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("registrations")
    .select("*, events(title), freebie_kits(name)")
    .in("status", ["PENDING", "REJECTED"])
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Payments"
        description="Open the receipt, then approve or reject. Pending holds a slot. Rejected rows stay here until you delete them. Approved guests move to the event's attendee list."
        error={error}
      />
      <div className="mt-8">
        {rows.length ? (
          <RegistrationTable registrations={rows} />
        ) : (
          <p className="glass-card rounded-3xl px-5 py-10 text-center text-sm text-muted-foreground">
            No receipts to review. Approved attendees live on each event.
          </p>
        )}
      </div>
    </div>
  );
}
