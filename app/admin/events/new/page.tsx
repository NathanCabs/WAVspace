import { EventBuilder } from "@/components/admin/event-builder";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl font-semibold">New event</h1>
      <EventBuilder error={error} />
    </div>
  );
}
