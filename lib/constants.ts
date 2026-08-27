export const PAYMENT_PROOF_BUCKET = "payment-proofs";
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
export const RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

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
