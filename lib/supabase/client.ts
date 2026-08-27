import { createBrowserClient } from "@supabase/ssr";

import { isSupabaseConfigured } from "@/lib/constants";
import type { Database } from "@/lib/types";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
