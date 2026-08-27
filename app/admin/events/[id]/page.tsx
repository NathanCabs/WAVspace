import { notFound } from "next/navigation";

import { EventBuilder } from "@/components/admin/event-builder";
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
      <h1 className="mb-6 font-heading text-3xl font-semibold">Edit event</h1>
      <EventBuilder
        event={event}
        consumables={consumables ?? []}
        kits={kits ?? []}
        error={error}
      />
    </div>
  );
}
