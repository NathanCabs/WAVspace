import { deleteEvent } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { formatEventDate, formatPeso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_listings")
    .select("*")
    .order("event_date", { ascending: true });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Publish nights, set slots, and attach kits.
          </p>
        </div>
        <ButtonLink href="/admin/events/new" className="rounded-full">
          New event
        </ButtonLink>
      </div>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      <div className="mt-6 grid gap-3">
        {(data ?? []).map((event) => (
          <div
            key={event.id}
            className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-3xl p-4"
          >
            <div>
              <div className="flex flex-wrap gap-2">
                <h2 className="font-heading text-lg">{event.title}</h2>
                <Badge variant={event.is_published ? "default" : "secondary"}>
                  {event.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatEventDate(event.event_date)} · {event.remaining_slots}/
                {event.max_slots} open · from {formatPeso(event.ticket_price)}
              </p>
            </div>
            <div className="flex gap-2">
              <ButtonLink
                href={`/admin/events/${event.id}`}
                variant="outline"
                size="sm"
              >
                Edit
              </ButtonLink>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={event.id} />
                <Button type="submit" size="sm" variant="destructive">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
