"use server";

import { isSupabaseConfigured } from "@/lib/constants";
import { lookupRegistrations } from "@/lib/data";
import type { LookupResult } from "@/lib/types";
import { lookupSchema } from "@/lib/validations";

export type LookupState = {
  ok: boolean;
  message: string;
  results: LookupResult[];
};

export async function searchRegistration(
  _prev: LookupState | undefined,
  formData: FormData,
): Promise<LookupState> {
  const parsed = lookupSchema.safeParse({
    query: formData.get("query"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Enter a search value.",
      results: [],
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Connect Supabase to look up live registrations.",
      results: [],
    };
  }

  try {
    const results = await lookupRegistrations(parsed.data.query);
    return {
      ok: true,
      message: results.length
        ? `Found ${results.length} registration${results.length === 1 ? "" : "s"}.`
        : "No registration matched that email or code.",
      results,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Lookup failed.",
      results: [],
    };
  }
}
