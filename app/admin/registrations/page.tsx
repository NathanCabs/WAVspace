import { RegistrationTable } from "@/components/admin/registration-table";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registrations")
    .select("*, events(title), freebie_kits(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">Payment verification</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Open the receipt, then approve or reject. Pending holds a slot.
      </p>
      <div className="mt-6">
        <RegistrationTable registrations={data ?? []} />
      </div>
    </div>
  );
}
