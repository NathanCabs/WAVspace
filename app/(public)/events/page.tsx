import { EventBentoCard } from "@/components/home/event-bento-card";
import { getPublishedEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.22em] text-primary">Calendar</p>
      <h1 className="font-heading text-4xl font-semibold">Upcoming events</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Register with your email, pick a drink and kit, then send a receipt. No
        account required.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <EventBentoCard key={event.id} event={event} featured />
        ))}
      </div>
    </div>
  );
}
