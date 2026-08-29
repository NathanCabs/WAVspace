import { BentoGrid } from "@/components/home/bento-grid";
import { Hero } from "@/components/home/hero";
import { uniqueEventCategories } from "@/lib/constants";
import { getPublishedEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getPublishedEvents("upcoming");

  return (
    <div>
      <Hero
        upcomingCount={events.length}
        categories={uniqueEventCategories(events)}
      />
      <section id="events" className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">
            On the board
          </p>
          <h2 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Upcoming events
          </h2>
        </div>
        <BentoGrid events={events} />
      </section>
    </div>
  );
}
