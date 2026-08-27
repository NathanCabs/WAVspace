import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, Users } from "lucide-react";

import { RegistrationWizard } from "@/components/events/registration-wizard";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS } from "@/lib/constants";
import { getCafeSettings, getEventDetail } from "@/lib/data";
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

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] sm:px-6">
      <article>
        <div className="relative mb-6 overflow-hidden rounded-3xl">
          {event.banner_url ? (
            <Image
              src={event.banner_url}
              alt={event.title}
              width={1400}
              height={800}
              className="h-64 w-full object-cover sm:h-80"
            />
          ) : (
            <div className="h-64 bg-linear-to-br from-primary/20 to-background sm:h-80" />
          )}
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge>{CATEGORY_LABELS[event.category]}</Badge>
          <Badge variant="secondary">
            {event.is_cafe_hosted ? "Cafe hosted" : "Fan hosted"}
          </Badge>
        </div>
        <h1 className="font-heading text-4xl font-semibold">{event.title}</h1>
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
        <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
          {event.description}
        </p>
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Freebie preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {event.freebie_kits.flatMap((kit) => kitItems(kit.items)).filter((item, index, all) => all.indexOf(item) === index).map((item) => (
              <span key={item} className="rounded-full bg-white/5 px-3 py-1 text-sm">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Tickets from {formatPeso(event.ticket_price)}
          </p>
        </div>
      </article>
      <RegistrationWizard event={event} settings={settings} />
    </div>
  );
}
