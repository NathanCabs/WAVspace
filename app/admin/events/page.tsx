import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EventsBoard } from "@/components/admin/events-board";
import { ButtonLink } from "@/components/ui/button-link";
import { localToday } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const [{ data }, { data: approved }] = await Promise.all([
    supabase
      .from("event_listings")
      .select("*")
      .order("event_date", { ascending: true }),
    supabase.from("registrations").select("event_id").eq("status", "APPROVED"),
  ]);

  const attendeeCounts: Record<string, number> = {};
  for (const row of approved ?? []) {
    attendeeCounts[row.event_id] = (attendeeCounts[row.event_id] ?? 0) + 1;
  }

  const today = localToday();

  return (
    <div>
      <AdminPageHeader
        title="Events"
        description="Publish nights, review approved guests, and archive cancelled dates without the clutter."
        error={error}
      >
        <ButtonLink href="/admin/events/new" className="rounded-full px-5">
          New event
        </ButtonLink>
      </AdminPageHeader>
      <EventsBoard
        events={data ?? []}
        attendeeCounts={attendeeCounts}
        today={today}
      />
    </div>
  );
}
