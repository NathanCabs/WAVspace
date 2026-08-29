import Link from "next/link";
import { Calendar, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { eventCategoryLabel } from "@/lib/constants";
import { formatEventDate, formatPeso, formatTime } from "@/lib/format";
import { eventPath } from "@/lib/slug";
import type { EventListing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EventBentoCard({
  event,
  featured = false,
}: {
  event: EventListing;
  featured?: boolean;
}) {
  const remaining = event.remaining_slots ?? event.max_slots;

  return (
    <Link
      href={eventPath(event)}
      className={cn(
        "group relative flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-muted/30",
        featured ? "min-h-[340px] sm:min-h-[420px]" : "min-h-[200px]",
      )}
    >
      {event.banner_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${event.banner_url})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-background" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-transparent" />
      <div className="relative mt-auto flex flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-primary text-primary-foreground">
            {eventCategoryLabel(event.category, event.custom_category)}
          </Badge>
          <Badge variant="secondary">
            {event.is_cafe_hosted ? "Cafe hosted" : "Fan hosted"}
          </Badge>
        </div>
        <h3
          className={cn(
            "font-heading font-semibold leading-tight",
            featured ? "text-3xl sm:text-4xl" : "text-xl",
          )}
        >
          {event.title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatEventDate(event.event_date)} · {formatTime(event.start_time)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {remaining} / {event.max_slots} slots
          </span>
          <span className="font-medium text-primary">
            from {formatPeso(event.ticket_price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
