export const PAYMENT_PROOF_BUCKET = "payment-proofs";
export const EVENT_BANNER_BUCKET = "event-banners";
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
export const MAX_BANNER_BYTES = 5 * 1024 * 1024;
export const RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
export const BANNER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const EVENT_CATEGORIES = [
  { value: "cse", label: "Cupsleeve / CSE" },
  { value: "acoustic", label: "Acoustic" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  cse: "CSE",
  acoustic: "Acoustic",
  workshop: "Workshop",
  other: "Event",
};

export function eventCategoryLabel(
  category: string,
  customCategory?: string | null,
) {
  if (category === "other") {
    const custom = customCategory?.trim();
    if (custom) return custom;
  }
  return CATEGORY_LABELS[category] ?? category;
}

export type CategoryChip = {
  category: string;
  custom?: string;
  label: string;
};

export function eventCategoryHref(chip: CategoryChip) {
  const params = new URLSearchParams({ category: chip.category });
  if (chip.custom) params.set("custom", chip.custom);
  return `/events?${params.toString()}`;
}

export function eventMatchesCategory(
  event: { category: string; custom_category?: string | null },
  category?: string,
  custom?: string,
) {
  if (!category) return true;
  if (event.category !== category) return false;
  if (category === "other" && custom?.trim()) {
    return (
      (event.custom_category ?? "").trim().toLowerCase() ===
      custom.trim().toLowerCase()
    );
  }
  return true;
}

export function uniqueEventCategories(
  events: Array<{ category: string; custom_category?: string | null }>,
): CategoryChip[] {
  const chips: CategoryChip[] = [];
  const seen = new Set<string>();

  function push(category: string, custom?: string) {
    const key = custom ? `other:${custom.toLowerCase()}` : category;
    if (seen.has(key)) return;
    seen.add(key);
    chips.push({
      category,
      custom,
      label: eventCategoryLabel(category, custom),
    });
  }

  for (const preset of EVENT_CATEGORIES) {
    if (preset.value === "other") continue;
    if (events.some((event) => event.category === preset.value)) {
      push(preset.value);
    }
  }

  for (const event of events) {
    if (event.category === "other") {
      const custom = event.custom_category?.trim();
      push("other", custom || undefined);
    }
  }

  return chips;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}
