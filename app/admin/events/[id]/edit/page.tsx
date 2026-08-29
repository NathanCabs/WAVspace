import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EventBuilder } from "@/components/admin/event-builder";
import { ButtonLink } from "@/components/ui/button-link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

  if (!event) {
    notFound();
  }

  const [{ data: consumables }, { data: kits }] = await Promise.all([
    supabase
      .from("consumable_options")
      .select("*")
      .eq("event_id", id)
      .order("sort_order"),
    supabase.from("freebie_kits").select("*").eq("event_id", id).order("sort_order"),
  ]);

  return (
    <div>
      <ButtonLink
        href={`/admin/events/${id}`}
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 rounded-full"
      >
        Back to {event.title}
      </ButtonLink>
      <AdminPageHeader
        title="Edit event"
        description={event.title}
        error={error}
      />
      <div className="mt-8">
        <EventBuilder
          event={event}
          consumables={consumables ?? []}
          kits={kits ?? []}
        />
      </div>
    </div>
  );
}
