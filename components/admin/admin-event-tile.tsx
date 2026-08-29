import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SlotFill } from "@/components/admin/slot-fill";
import { Badge } from "@/components/ui/badge";
import { eventCategoryLabel } from "@/lib/constants";
import {
  formatEventDayParts,
  formatPeso,
  formatTime,
} from "@/lib/format";
import type { EventListing } from "@/lib/types";
import { cn } from "@/lib/utils";

function EventStatusBadge({ event }: { event: EventListing }) {
  if (event.cancelled_at) {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  return (
    <Badge variant={event.is_published ? "default" : "secondary"}>
      {event.is_published ? "Published" : "Draft"}
    </Badge>
  );
}

export function AdminEventTile({
  event,
  approvedCount,
}: {
  event: EventListing;
  approvedCount: number;
}) {
  const taken = Math.max(0, event.max_slots - (event.remaining_slots ?? 0));
  const cancelled = Boolean(event.cancelled_at);
  const parts = formatEventDayParts(event.event_date);

  return (
    <Link
      href={`/admin/events/${event.id}`}
      className={cn(
        "group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl ring-1 ring-foreground/10 transition hover:-translate-y-0.5",
        cancelled && "opacity-80",
      )}
    >
      {event.banner_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
          style={{ backgroundImage: `url(${event.banner_url})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-background to-background" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-background/10" />

      <div className="relative z-10 flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col items-center rounded-2xl bg-background/80 px-2.5 py-2 shadow-lg ring-1 ring-foreground/8 backdrop-blur-xl">
          <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {parts.month}
          </span>
          <span className="font-heading text-xl leading-none font-bold">
            {parts.day}
          </span>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <EventStatusBadge event={event} />
          <Badge variant="secondary" className="bg-background/70 backdrop-blur-md">
            {event.is_cafe_hosted ? "Cafe" : "Fan"}
          </Badge>
        </div>
      </div>

      <div className="liquid-glass relative z-10 mx-3 mb-3 mt-auto rounded-2xl p-4">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          {eventCategoryLabel(event.category, event.custom_category)}
          {" · "}
          {formatTime(event.start_time)}–{formatTime(event.end_time)}
        </p>
        <h2 className="mt-1.5 line-clamp-2 font-heading text-lg font-semibold leading-tight">
          {event.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          from {formatPeso(event.ticket_price)}
          {" · "}
          {approvedCount} approved
        </p>
        {cancelled ? null : (
          <div className="mt-3">
            <SlotFill taken={taken} max={event.max_slots} />
          </div>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
          View
          <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
