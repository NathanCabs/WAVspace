import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, Users } from "lucide-react";

import { RegistrationWizard } from "@/components/events/registration-wizard";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { eventCategoryLabel } from "@/lib/constants";
import { getCafeSettings, getEventDetail } from "@/lib/data";
import { isPastEventDate } from "@/lib/dates";
import { formatEventDate, formatPeso, formatTime, kitItems } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, settings] = await Promise.all([
    getEventDetail(id),
    getCafeSettings(),
  ]);

  if (!event) {
    notFound();
  }

  const remaining = event.remaining_slots ?? event.max_slots;
  const ended = isPastEventDate(event.event_date);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] sm:px-6 sm:py-10">
      <article className="min-w-0">
        <div className="relative mb-6 overflow-hidden rounded-3xl">
          {event.banner_url ? (
            <Image
              src={event.banner_url}
              alt={event.title}
              width={1400}
              height={800}
              className="h-52 w-full object-cover sm:h-80"
            />
          ) : (
            <div className="h-52 bg-linear-to-br from-primary/20 to-background sm:h-80" />
          )}
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge>{eventCategoryLabel(event.category, event.custom_category)}</Badge>
          <Badge variant="secondary">
            {event.is_cafe_hosted ? "Cafe hosted" : "Fan hosted"}
          </Badge>
          {ended ? <Badge variant="outline">Ended</Badge> : null}
        </div>
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
            {remaining} of {event.max_slots} slots left
          </span>
        </div>
        {event.description ? (
          <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        ) : null}
        <div className="mt-8">
          {event.freebie_kits.length > 0 ? (
            <>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                Freebie preview
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.freebie_kits
                  .flatMap((kit) => kitItems(kit.items))
                  .filter((item, index, all) => all.indexOf(item) === index)
                  .map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-muted/60 px-3 py-1 text-sm"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </>
          ) : null}
          <p className={event.freebie_kits.length > 0 ? "mt-4 text-sm text-muted-foreground" : "text-sm text-muted-foreground"}>
            Tickets from {formatPeso(event.ticket_price)}
          </p>
        </div>
      </article>
      {ended ? (
        <div className="glass-card flex h-fit flex-col gap-4 rounded-3xl p-6">
          <p className="font-heading text-xl font-semibold">This night has ended</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Registration is closed. Look up an existing booking, or browse nights
            that are still coming up.
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/events" className="rounded-full">
              Upcoming events
            </ButtonLink>
            <ButtonLink href="/lookup" variant="outline" className="rounded-full">
              Lookup
            </ButtonLink>
          </div>
        </div>
      ) : (
        <RegistrationWizard event={event} settings={settings} />
      )}
    </div>
  );
}
