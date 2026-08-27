import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/constants";
import { DEMO_EVENT_DETAILS, DEMO_EVENTS, DEMO_SETTINGS } from "@/lib/demo-data";
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

export async function getPublishedEvents(): Promise<EventListing[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_EVENTS;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_listings")
      .select("*")
      .eq("is_published", true)
      .order("event_date", { ascending: true });

    if (error || !data) {
      return DEMO_EVENTS;
    }

    return data;
  } catch {
    return DEMO_EVENTS;
  }
}

export async function getEventDetail(id: string): Promise<EventDetail | null> {
  if (!isSupabaseConfigured()) {
    return DEMO_EVENT_DETAILS.find((event) => event.id === id) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data: event, error } = await supabase
      .from("event_listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !event) {
      return DEMO_EVENT_DETAILS.find((item) => item.id === id) ?? null;
    }

    const [{ data: consumables }, { data: kits }] = await Promise.all([
      supabase
        .from("consumable_options")
        .select("*")
        .eq("event_id", id)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("freebie_kits")
        .select("*")
        .eq("event_id", id)
        .order("sort_order"),
    ]);

    return {
      ...event,
      consumable_options: consumables ?? [],
      freebie_kits: kits ?? [],
    };
  } catch {
    return DEMO_EVENT_DETAILS.find((event) => event.id === id) ?? null;
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
