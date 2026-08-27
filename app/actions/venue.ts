"use server";

import { isSupabaseConfigured } from "@/lib/constants";
import { sendVenueRequestReceivedEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { venueRequestSchema } from "@/lib/validations";

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function submitVenueRequest(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = venueRequestSchema.safeParse({
    organizer_name: formData.get("organizer_name"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone") || undefined,
    proposed_date: formData.get("proposed_date"),
    expected_attendance: formData.get("expected_attendance") || undefined,
    event_description: formData.get("event_description"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Connect Supabase to send venue inquiries.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("venue_requests").insert({
    organizer_name: parsed.data.organizer_name,
    contact_email: parsed.data.contact_email.toLowerCase(),
    contact_phone: parsed.data.contact_phone || null,
    proposed_date: parsed.data.proposed_date,
    expected_attendance: parsed.data.expected_attendance ?? null,
    event_description: parsed.data.event_description,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await sendVenueRequestReceivedEmail({
    email: parsed.data.contact_email,
    organizerName: parsed.data.organizer_name,
    proposedDate: parsed.data.proposed_date,
  });

  return {
    ok: true,
    message: "Inquiry sent. We will email you after the cafe reviews it.",
  };
}
