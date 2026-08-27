import { BentoGrid } from "@/components/home/bento-grid";
import { Hero } from "@/components/home/hero";
import { getPublishedEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getPublishedEvents();

  return (
    <div>
      <Hero upcomingCount={events.length} />
      <section id="events" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">
              On the board
            </p>
            <h2 className="font-heading text-3xl font-semibold">Upcoming events</h2>
          </div>
        </div>
        <BentoGrid events={events} />
      </section>
    </div>
  );
}
