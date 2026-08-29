import { notFound } from "next/navigation";
import { Calendar, Clock, ExternalLink, Users } from "lucide-react";

import { EventDetailActions } from "@/components/admin/event-detail-actions";
import { SlotFill } from "@/components/admin/slot-fill";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { eventCategoryLabel } from "@/lib/constants";
import {
  formatEventDate,
  formatEventDayParts,
  formatPeso,
  formatTime,
  kitItems,
} from "@/lib/format";
import { eventPath } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatApprovedAt(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [
    { data: event },
    { data: consumables },
    { data: kits },
    { data: attendees },
    pending,
  ] = await Promise.all([
    supabase.from("event_listings").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("consumable_options")
      .select("*")
      .eq("event_id", id)
      .order("sort_order"),
    supabase.from("freebie_kits").select("*").eq("event_id", id).order("sort_order"),
    supabase
      .from("registrations")
      .select(
        "id, attendee_name, email, phone, reference_code, total_amount, created_at, freebie_kits(name)",
      )
      .eq("event_id", id)
      .eq("status", "APPROVED")
      .order("attendee_name", { ascending: true }),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id)
      .eq("status", "PENDING"),
  ]);

  if (!event) {
    notFound();
  }

  const rows = attendees ?? [];
  const pendingCount = pending.count ?? 0;
  const taken = Math.max(0, event.max_slots - (event.remaining_slots ?? 0));
  const cancelled = Boolean(event.cancelled_at);
  const dateParts = formatEventDayParts(event.event_date);

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

      {error ? (
        <p className="mb-4 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <article className="relative overflow-hidden rounded-[1.75rem] ring-1 ring-foreground/10">
        {event.banner_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${event.banner_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-background to-background" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-background/15" />

        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col items-center rounded-2xl bg-background/80 px-3.5 py-2.5 shadow-lg ring-1 ring-foreground/8 backdrop-blur-xl">
              <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {dateParts.month}
              </span>
              <span className="font-heading text-3xl leading-none font-bold">
                {dateParts.day}
              </span>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {cancelled ? (
                <Badge variant="destructive">Cancelled</Badge>
              ) : (
                <Badge variant={event.is_published ? "default" : "secondary"}>
                  {event.is_published ? "Published" : "Draft"}
                </Badge>
              )}
              <Badge variant="secondary" className="bg-background/70 backdrop-blur-md">
                {event.is_cafe_hosted ? "Cafe hosted" : "Fan hosted"}
              </Badge>
              <Badge variant="secondary" className="bg-background/70 backdrop-blur-md">
                {eventCategoryLabel(event.category, event.custom_category)}
              </Badge>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl p-5 sm:p-6">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {event.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatEventDate(event.event_date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatTime(event.start_time)}–{formatTime(event.end_time)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" />
                {rows.length} approved
                {pendingCount ? ` · ${pendingCount} pending` : ""}
              </span>
            </div>
            {cancelled ? (
              <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
                This night is cancelled
                {event.cancellation_reason
                  ? `: ${event.cancellation_reason}`
                  : "."}{" "}
                Approved guests stay on this list as a record.
              </p>
            ) : (
              <div className="mt-5 max-w-md">
                <SlotFill taken={taken} max={event.max_slots} />
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <EventDetailActions
                id={event.id}
                title={event.title}
                cancelled={cancelled}
              />
              {event.is_published && !cancelled ? (
                <ButtonLink
                  href={eventPath(event)}
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  Public page
                  <ExternalLink className="size-3.5" />
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="glass-card rounded-3xl p-5 lg:col-span-2">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Details
          </p>
          <h2 className="mt-1 font-heading text-lg">About this night</h2>
          {event.description ? (
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No description yet.
            </p>
          )}
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">From price</dt>
              <dd className="mt-0.5 font-medium">{formatPeso(event.ticket_price)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Slots</dt>
              <dd className="mt-0.5 font-medium">
                {taken}/{event.max_slots} filled
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Public URL</dt>
              <dd className="mt-0.5 font-medium">/events/{event.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Host</dt>
              <dd className="mt-0.5 font-medium">
                {event.is_cafe_hosted ? "Cafe hosted" : "Fan hosted"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="glass-card grid gap-5 rounded-3xl p-5">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Consumables
            </p>
            {(consumables ?? []).length ? (
              <ul className="mt-3 grid gap-2 text-sm">
                {(consumables ?? []).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <span>
                      {item.name}
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {item.category}
                      </span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.extra_price ? `+${formatPeso(item.extra_price)}` : "Included"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">None listed.</p>
            )}
          </div>
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Kits
            </p>
            {(kits ?? []).length ? (
              <ul className="mt-3 grid gap-3">
                {(kits ?? []).map((kit) => (
                  <li key={kit.id} className="text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">
                        {kit.name}
                        {kit.is_default ? (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            default
                          </span>
                        ) : null}
                      </span>
                      <span className="tabular-nums">{formatPeso(kit.price)}</span>
                    </div>
                    {kitItems(kit.items).length ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {kitItems(kit.items).join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">None listed.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Guests
            </p>
            <h2 className="font-heading text-lg">Approved attendees</h2>
          </div>
          {pendingCount ? (
            <ButtonLink
              href="/admin/registrations"
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              {pendingCount} pending on Payments
            </ButtonLink>
          ) : null}
        </div>
        {rows.length === 0 ? (
          <p className="glass-card rounded-3xl px-5 py-10 text-center text-sm text-muted-foreground">
            No approved attendees yet. Pending receipts stay on Payments until
            you approve them.
          </p>
        ) : (
          <div className="glass-card overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Attendee</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Kit</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const kitName = Array.isArray(row.freebie_kits)
                      ? row.freebie_kits[0]?.name
                      : row.freebie_kits?.name;
                    return (
                      <tr
                        key={row.id}
                        className="border-t border-border/70 transition-colors hover:bg-muted/35"
                      >
                        <td className="px-4 py-3.5 font-medium tabular-nums">
                          {row.reference_code}
                        </td>
                        <td className="px-4 py-3.5">
                          <div>{row.attendee_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.email}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">{row.phone || "—"}</td>
                        <td className="px-4 py-3.5">{kitName ?? "—"}</td>
                        <td className="px-4 py-3.5 tabular-nums">
                          {formatPeso(row.total_amount)}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {formatApprovedAt(row.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
