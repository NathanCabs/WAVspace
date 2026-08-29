import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EventBuilder } from "@/components/admin/event-builder";
import { ButtonLink } from "@/components/ui/button-link";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;
  let draft: Partial<Event> | undefined;
  let fromOrganizer: string | undefined;

  if (from) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("venue_requests")
      .select("*")
      .eq("id", from)
      .maybeSingle();

    if (data) {
      fromOrganizer = data.organizer_name;
      draft = {
        title: data.organizer_name,
        description: data.event_description,
        event_date: data.proposed_date,
        max_slots: data.expected_attendance ?? 30,
        ticket_price: 0,
        is_cafe_hosted: false,
        is_published: false,
        venue_request_id: data.id,
      };
    }
  }

  return (
    <div>
      <ButtonLink
        href="/admin/events"
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 rounded-full"
      >
        Back to events
      </ButtonLink>
      <AdminPageHeader
        title="New event"
        description={
          fromOrganizer
            ? `Prefilling from ${fromOrganizer}'s venue request. This starts as an unpublished fan-hosted draft — confirm details with them before you publish.`
            : "Title, schedule, drinks, and kits. Unpublished drafts stay off the public calendar."
        }
        error={error}
      />
      <div className="mt-8">
        <EventBuilder event={draft} />
      </div>
    </div>
  );
}
