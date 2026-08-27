import Link from "next/link";
import { CalendarDays, ClipboardList, Hourglass, Tent } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [registrations, pending, upcoming, venue] = await Promise.all([
    supabase.from("registrations").select("id", { count: "exact", head: true }),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("event_date", today),
    supabase
      .from("venue_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING"),
  ]);

  const cards = [
    {
      label: "Total registrations",
      value: registrations.count ?? 0,
      icon: ClipboardList,
      href: "/admin/registrations",
    },
    {
      label: "Pending receipts",
      value: pending.count ?? 0,
      icon: Hourglass,
      href: "/admin/registrations",
    },
    {
      label: "Upcoming events",
      value: upcoming.count ?? 0,
      icon: CalendarDays,
      href: "/admin/events",
    },
    {
      label: "Venue requests",
      value: venue.count ?? 0,
      icon: Tent,
      href: "/admin/venue-requests",
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Verify receipts, publish nights, and answer host inquiries.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="glass-card rounded-3xl p-5">
            <card.icon className="size-5 text-primary" />
            <p className="mt-4 font-heading text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/admin/events/new" className="rounded-full">
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
    </div>
  );
}
