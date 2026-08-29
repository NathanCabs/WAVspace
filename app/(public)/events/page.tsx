import { CategoryPills } from "@/components/events/category-pills";
import { EventBentoCard } from "@/components/home/event-bento-card";
import { PublicPageHeader } from "@/components/layout/public-page-header";
import { eventMatchesCategory, uniqueEventCategories } from "@/lib/constants";
import { getPublishedEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; custom?: string }>;
}) {
  const { category, custom } = await searchParams;
  const [upcoming, past] = await Promise.all([
    getPublishedEvents("upcoming"),
    getPublishedEvents("past"),
  ]);

  const categories = uniqueEventCategories(upcoming);
  const filteredUpcoming = upcoming.filter((event) =>
    eventMatchesCategory(event, category, custom),
  );
  const filteredPast = past.filter((event) =>
    eventMatchesCategory(event, category, custom),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <PublicPageHeader
        eyebrow="Calendar"
        title="Upcoming events"
        description="Register with your email, pick a drink and kit, then send a receipt. No account required."
      />

      {categories.length ? (
        <div className="mb-6">
          <CategoryPills
            categories={categories}
            activeCategory={category}
            activeCustom={custom}
            showAll
          />
        </div>
      ) : null}

      {filteredUpcoming.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredUpcoming.map((event) => (
            <EventBentoCard key={event.id} event={event} featured />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-8 text-sm text-muted-foreground">
          {category
            ? "No upcoming nights in this category. Try another filter, or check past events below."
            : "No upcoming nights yet. Check back soon, or host your own."}
        </div>
      )}

      {filteredPast.length ? (
        <section className="mt-14">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Archive
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            Past events
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            These nights have already wrapped. Registration is closed.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {filteredPast.map((event) => (
              <EventBentoCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
