import { isSupabaseConfigured } from "@/lib/constants";
import { localToday } from "@/lib/dates";
import { DEMO_EVENT_DETAILS, DEMO_EVENTS, DEMO_SETTINGS } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import type {
  CafeSettings,
  EventDetail,
  EventListing,
  LookupResult,
} from "@/lib/types";

export async function getCafeSettings(): Promise<CafeSettings> {
  if (!isSupabaseConfigured()) {
    return DEMO_SETTINGS;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cafe_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEMO_SETTINGS;
    }

    return data;
  } catch {
    return DEMO_SETTINGS;
  }
}

export type PublishedEventScope = "upcoming" | "past" | "all";

function filterDemoEvents(scope: PublishedEventScope) {
  const today = localToday();
  const published = DEMO_EVENTS.filter(
    (event) => event.is_published && !event.cancelled_at,
  );
  if (scope === "upcoming") {
    return published.filter((event) => event.event_date >= today);
  }
  if (scope === "past") {
    return published
      .filter((event) => event.event_date < today)
      .sort((a, b) => b.event_date.localeCompare(a.event_date));
  }
  return published;
}

export async function getPublishedEvents(
  scope: PublishedEventScope = "upcoming",
): Promise<EventListing[]> {
  if (!isSupabaseConfigured()) {
    return filterDemoEvents(scope);
  }

  try {
    const supabase = await createClient();
    const today = localToday();
    let query = supabase
      .from("event_listings")
      .select("*")
      .eq("is_published", true)
      .is("cancelled_at", null);

    if (scope === "upcoming") {
      query = query
        .gte("event_date", today)
        .order("event_date", { ascending: true });
    } else if (scope === "past") {
      query = query
        .lt("event_date", today)
        .order("event_date", { ascending: false });
    } else {
      query = query.order("event_date", { ascending: true });
    }

    const { data, error } = await query;

    if (error || !data) {
      return filterDemoEvents(scope);
    }

    return attachSlugs(supabase, data);
  } catch {
    return filterDemoEvents(scope);
  }
}

async function attachSlugs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listings: EventListing[],
): Promise<EventListing[]> {
  if (!listings.length || listings.every((item) => item.slug)) {
    return listings;
  }

  const { data } = await supabase
    .from("events")
    .select("id, slug")
    .in(
      "id",
      listings.map((item) => item.id),
    );

  const slugs = new Map((data ?? []).map((row) => [row.id, row.slug]));
  return listings.map((item) => ({
    ...item,
    slug: item.slug || slugs.get(item.id) || item.id,
  }));
}

function findDemoEvent(idOrSlug: string) {
  return (
    DEMO_EVENT_DETAILS.find(
      (event) => event.slug === idOrSlug || event.id === idOrSlug,
    ) ?? null
  );
}

export async function getEventDetail(id: string): Promise<EventDetail | null> {
  if (!isSupabaseConfigured()) {
    return findDemoEvent(id);
  }

  try {
    const supabase = await createClient();
    const bySlug = await supabase
      .from("events")
      .select("id")
      .eq("slug", id)
      .maybeSingle();

    const eventId = bySlug.data?.id ?? id;

    const { data: event } = await supabase
      .from("event_listings")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (!event) {
      return findDemoEvent(id);
    }

    if (event.cancelled_at) {
      return null;
    }

    const [withSlug] = await attachSlugs(supabase, [event]);

    const [{ data: consumables }, { data: kits }] = await Promise.all([
      supabase
        .from("consumable_options")
        .select("*")
        .eq("event_id", withSlug.id)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("freebie_kits")
        .select("*")
        .eq("event_id", withSlug.id)
        .order("sort_order"),
    ]);

    return {
      ...withSlug,
      consumable_options: consumables ?? [],
      freebie_kits: kits ?? [],
    };
  } catch {
    return findDemoEvent(id);
  }
}

export async function lookupRegistrations(query: string): Promise<LookupResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_registrations", {
    p_query: query,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LookupResult[];
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, supabase };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile, supabase };
}
