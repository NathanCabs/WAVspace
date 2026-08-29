import Link from "next/link";
import { ArrowUpRight, CalendarDays, ClipboardList, Hourglass, Tent } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SlotFill } from "@/components/admin/slot-fill";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { localToday } from "@/lib/dates";
import { formatEventDate, formatPeso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const today = localToday();

  const [
    registrations,
    pending,
    upcoming,
    venue,
    pendingReceipts,
    pendingVenues,
    upcomingEvents,
  ] = await Promise.all([
    supabase.from("registrations").select("id", { count: "exact", head: true }),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("event_date", today)
      .is("cancelled_at", null),
    supabase
      .from("venue_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("registrations")
      .select("id, attendee_name, total_amount, events(title)")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("venue_requests")
      .select("id, organizer_name, proposed_date, expected_attendance")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("event_listings")
      .select("*")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(6),
  ]);

  const cards = [
    {
      label: "Total registrations",
      value: registrations.count ?? 0,
      icon: ClipboardList,
      href: "/admin/all-registrations",
      alert: false,
    },
    {
      label: "Pending receipts",
      value: pending.count ?? 0,
      icon: Hourglass,
      href: "/admin/registrations",
      alert: (pending.count ?? 0) > 0,
    },
    {
      label: "Upcoming events",
      value: upcoming.count ?? 0,
      icon: CalendarDays,
      href: "/admin/events",
      alert: false,
    },
    {
      label: "Venue requests",
      value: venue.count ?? 0,
      icon: Tent,
      href: "/admin/venue-requests",
      alert: (venue.count ?? 0) > 0,
    },
  ];

  const receiptRows = pendingReceipts.data ?? [];
  const venueRows = pendingVenues.data ?? [];
  const nightRows = upcomingEvents.data ?? [];
  const attentionClear = receiptRows.length === 0 && venueRows.length === 0;

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Verify receipts, publish nights, and answer host inquiries."
      >
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/events/new" className="rounded-full px-5">
            New event
          </ButtonLink>
          <ButtonLink
            href="/admin/registrations"
            variant="outline"
            className="rounded-full"
          >
            Review payments
          </ButtonLink>
        </div>
      </AdminPageHeader>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              "glass-card group rounded-3xl p-5 transition hover:-translate-y-0.5",
              card.alert && "ring-1 ring-primary/35",
            )}
          >
            <div className="flex items-start justify-between">
              <card.icon className="size-4 text-primary" />
              <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-5 font-heading text-3xl font-bold tabular-nums">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="glass-card rounded-3xl p-5">
          <h2 className="font-heading text-lg">Needs attention</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Receipts and host inquiries still waiting on a decision.
          </p>
          {attentionClear ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Nothing waiting — receipts and host inquiries are clear.
            </p>
          ) : (
            <div className="mt-5 grid gap-5">
              {receiptRows.length ? (
                <div>
                  <p className="text-[11px] font-medium tracking-[0.16em] text-primary uppercase">
                    Pending receipts
                  </p>
                  <ul className="mt-2 grid gap-1.5">
                    {receiptRows.map((row) => {
                      const eventTitle = Array.isArray(row.events)
                        ? row.events[0]?.title
                        : row.events?.title;
                      return (
                        <li key={row.id}>
                          <Link
                            href="/admin/registrations"
                            className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-muted/50"
                          >
                            <span>
                              <span className="block text-sm font-medium">
                                {row.attendee_name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {eventTitle ?? "Event"}
                              </span>
                            </span>
                            <span className="text-sm tabular-nums">
                              {formatPeso(row.total_amount)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
              {venueRows.length ? (
                <div>
                  <p className="text-[11px] font-medium tracking-[0.16em] text-primary uppercase">
                    Pending venue inquiries
                  </p>
                  <ul className="mt-2 grid gap-1.5">
                    {venueRows.map((row) => (
                      <li key={row.id}>
                        <Link
                          href="/admin/venue-requests"
                          className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-muted/50"
                        >
                          <span>
                            <span className="block text-sm font-medium">
                              {row.organizer_name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {formatEventDate(row.proposed_date)}
                              {row.expected_attendance
                                ? ` · ~${row.expected_attendance} guests`
                                : ""}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </section>

        <section className="glass-card rounded-3xl p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg">Upcoming nights</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Slot fill for the next dates on the calendar.
              </p>
            </div>
            <ButtonLink href="/admin/events" variant="ghost" size="sm" className="rounded-full">
              All events
            </ButtonLink>
          </div>
          {nightRows.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No upcoming nights yet. Create an event to fill this list.
            </p>
          ) : (
            <ul className="mt-5 grid gap-2">
              {nightRows.map((event) => {
                const taken = Math.max(
                  0,
                  event.max_slots - (event.remaining_slots ?? 0),
                );
                return (
                  <li key={event.id}>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="flex items-start gap-3 rounded-2xl px-3 py-3 transition hover:bg-muted/50"
                    >
                      {event.banner_url ? (
                        <div
                          className="size-12 shrink-0 rounded-xl bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${event.banner_url})`,
                          }}
                        />
                      ) : (
                        <div className="size-12 shrink-0 rounded-xl bg-primary/15" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-heading text-base">
                            {event.title}
                          </p>
                          {event.cancelled_at ? (
                            <Badge variant="destructive">Cancelled</Badge>
                          ) : (
                            <Badge
                              variant={
                                event.is_published ? "default" : "secondary"
                              }
                            >
                              {event.is_published ? "Published" : "Draft"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatEventDate(event.event_date)}
                        </p>
                        {event.cancelled_at ? null : (
                          <div className="mt-2">
                            <SlotFill taken={taken} max={event.max_slots} />
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
