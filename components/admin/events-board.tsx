"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CalendarPlus } from "lucide-react";

import { AdminEventTile } from "@/components/admin/admin-event-tile";
import { ButtonLink } from "@/components/ui/button-link";
import type { EventListing } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "upcoming" | "drafts" | "past";

export function EventsBoard({
  events,
  attendeeCounts,
  today,
}: {
  events: EventListing[];
  attendeeCounts: Record<string, number>;
  today: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const buckets = useMemo(() => {
    const upcoming: EventListing[] = [];
    const drafts: EventListing[] = [];
    const past: EventListing[] = [];

    for (const event of events) {
      const cancelled = Boolean(event.cancelled_at);
      const isPast = event.event_date < today || cancelled;
      if (!event.is_published && !cancelled) drafts.push(event);
      if (isPast) past.push(event);
      else upcoming.push(event);
    }

    return { upcoming, drafts, past };
  }, [events, today]);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: events.length },
    { id: "upcoming", label: "Upcoming", count: buckets.upcoming.length },
    { id: "drafts", label: "Drafts", count: buckets.drafts.length },
    { id: "past", label: "Past", count: buckets.past.length },
  ];

  const openSlots = buckets.upcoming.reduce(
    (sum, event) => sum + (event.remaining_slots ?? 0),
    0,
  );

  const showUpcoming = filter === "all" || filter === "upcoming";
  const showDrafts = filter === "drafts";
  const showPast = filter === "all" || filter === "past";
  const upcoming = showUpcoming ? buckets.upcoming : [];
  const drafts = showDrafts ? buckets.drafts : [];
  const past = showPast ? buckets.past : [];
  const empty =
    upcoming.length === 0 && drafts.length === 0 && past.length === 0;

  return (
    <div className="mt-8 grid gap-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Upcoming nights" value={buckets.upcoming.length} />
        <StatTile label="Open slots" value={openSlots} />
        <StatTile label="Drafts" value={buckets.drafts.length} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition-colors",
              filter === item.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
            <span className="ml-1.5 tabular-nums opacity-70">{item.count}</span>
          </button>
        ))}
      </div>

      {empty ? (
        <div className="liquid-glass flex flex-col items-center rounded-[1.75rem] px-6 py-16 text-center">
          <CalendarPlus className="size-8 text-primary" />
          <p className="mt-4 font-heading text-xl">No nights in this view</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Publish a cafe night or turn an approved venue request into a draft.
          </p>
          <ButtonLink href="/admin/events/new" className="mt-5 rounded-full">
            New event
          </ButtonLink>
        </div>
      ) : null}

      {upcoming.length ? (
        <section className="grid gap-3">
          {filter === "all" ? <SectionLabel>Upcoming</SectionLabel> : null}
          <EventGrid events={upcoming} attendeeCounts={attendeeCounts} />
        </section>
      ) : null}

      {drafts.length ? (
        <section className="grid gap-3">
          <SectionLabel>Drafts</SectionLabel>
          <EventGrid events={drafts} attendeeCounts={attendeeCounts} />
        </section>
      ) : null}

      {past.length ? (
        <section className="grid gap-3">
          {filter === "all" ? (
            <SectionLabel>Past & cancelled</SectionLabel>
          ) : null}
          <EventGrid events={past} attendeeCounts={attendeeCounts} />
        </section>
      ) : null}
    </div>
  );
}

function EventGrid({
  events,
  attendeeCounts,
}: {
  events: EventListing[];
  attendeeCounts: Record<string, number>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <AdminEventTile
          key={event.id}
          event={event}
          approvedCount={attendeeCounts[event.id] ?? 0}
        />
      ))}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-2xl px-4 py-4">
      <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
      {children}
    </h2>
  );
}
