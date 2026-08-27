"use client";

import { ArrowUpRight, Coffee, Mic2 } from "lucide-react";
import { motion } from "motion/react";

import { EventBentoCard } from "@/components/home/event-bento-card";
import { HostEventModal } from "@/components/home/host-event-modal";
import { ButtonLink } from "@/components/ui/button-link";
import type { EventListing } from "@/lib/types";

export function BentoGrid({ events }: { events: EventListing[] }) {
  const [featured, ...rest] = events;
  const nextEvents = rest.slice(0, 2);
  const remainingTotal = events.reduce(
    (sum, event) => sum + (event.remaining_slots ?? 0),
    0,
  );
  const cafeHosted = events.filter((event) => event.is_cafe_hosted).length;

  if (!featured) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
        No published events yet. Check back soon, or host your own night.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="grid gap-4 md:grid-cols-12"
    >
      <div className="md:col-span-7">
        <EventBentoCard event={featured} featured />
      </div>

      <div className="grid gap-4 md:col-span-5">
        {nextEvents.length ? (
          nextEvents.map((event) => (
            <EventBentoCard key={event.id} event={event} />
          ))
        ) : (
          <div className="glass-card flex min-h-[200px] items-center justify-center rounded-3xl p-6 text-sm text-muted-foreground">
            More nights land here as they are published.
          </div>
        )}
      </div>

      <div className="glass-card rounded-3xl p-6 md:col-span-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Floor capacity
        </p>
        <p className="mt-3 font-heading text-4xl font-bold">{remainingTotal}</p>
        <p className="text-sm text-muted-foreground">
          open slots across upcoming events
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs">
            <Coffee className="size-3.5 text-primary" />
            {cafeHosted} cafe-hosted
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs">
            <Mic2 className="size-3.5 text-primary" />
            {events.length - cafeHosted} fan-hosted
          </span>
        </div>
      </div>

      <HostEventModal>
        <button
          type="button"
          className="glass-card gold-glow group flex min-h-[180px] w-full flex-col items-start justify-between rounded-3xl p-6 text-left md:col-span-7"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            External hosts
          </p>
          <div>
            <p className="font-heading text-3xl font-semibold">
              Host your event here
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Cupsleeve collectives and workshop leads can request a date, share
              expected attendance, and wait for cafe confirmation.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
            Open inquiry
            <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </button>
      </HostEventModal>

      {rest.length > 2 ? (
        <div className="md:col-span-12">
          <ButtonLink href="/events" variant="outline" className="rounded-full">
            View all events
          </ButtonLink>
        </div>
      ) : null}
    </motion.div>
  );
}
