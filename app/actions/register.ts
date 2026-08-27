"use server";

import { redirect } from "next/navigation";

import {
  isSupabaseConfigured,
  MAX_RECEIPT_BYTES,
  PAYMENT_PROOF_BUCKET,
  RECEIPT_MIME_TYPES,
} from "@/lib/constants";
import { getEventDetail } from "@/lib/data";
import { sendRegistrationReceivedEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { attendeeSchema } from "@/lib/validations";

export type RegisterState = {
  ok: boolean;
  message: string;
};

export async function submitRegistration(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Connect Supabase to complete a live registration.",
    };
  }

  const parsed = attendeeSchema.safeParse({
    attendee_name: formData.get("attendee_name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check attendee details.",
    };
  }

  const eventId = String(formData.get("event_id") ?? "");
  const kitId = String(formData.get("kit_id") ?? "");
  const consumableId = String(formData.get("consumable_id") ?? "");
  const receipt = formData.get("payment_proof");

  const event = await getEventDetail(eventId);
  if (!event) {
    return { ok: false, message: "Event not found." };
  }

  if ((event.remaining_slots ?? 0) <= 0) {
    return { ok: false, message: "This event is fully booked." };
  }

  const kit = event.freebie_kits.find((item) => item.id === kitId);
  if (!kit) {
    return { ok: false, message: "Choose a freebie kit." };
  }

  const consumable = event.consumable_options.find(
    (item) => item.id === consumableId,
  );
  if (event.consumable_options.length > 0 && !consumable) {
    return { ok: false, message: "Choose a drink or food option." };
  }

  const total =
    Number(kit.price) + Number(consumable?.extra_price ?? 0);

  if (!(receipt instanceof File) || receipt.size === 0) {
    return { ok: false, message: "Upload a payment receipt screenshot." };
  }

  if (receipt.size > MAX_RECEIPT_BYTES) {
    return { ok: false, message: "Receipt must be 5MB or smaller." };
  }

  if (!RECEIPT_MIME_TYPES.includes(receipt.type)) {
    return { ok: false, message: "Upload a JPG, PNG, or WebP screenshot." };
  }

  const admin = createAdminClient();
  const extension = receipt.name.split(".").pop() || "jpg";
  const path = `${eventId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(path, receipt, {
      contentType: receipt.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, message: uploadError.message };
  }

  const { data, error } = await admin.rpc("create_registration", {
    p_event_id: eventId,
    p_kit_id: kitId,
    p_attendee_name: parsed.data.attendee_name,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone ?? null,
    p_consumable_ids: consumable ? [consumable.id] : [],
    p_payment_proof_path: path,
    p_total_amount: total,
  });

  if (error) {
    await admin.storage.from(PAYMENT_PROOF_BUCKET).remove([path]);
    return { ok: false, message: error.message };
  }

  const result = data as { reference_code?: string } | null;
  const referenceCode = result?.reference_code;

  if (!referenceCode) {
    return { ok: false, message: "Registration saved but no reference was returned." };
  }

  await sendRegistrationReceivedEmail({
    email: parsed.data.email,
    name: parsed.data.attendee_name,
    eventTitle: event.title,
    referenceCode,
    totalAmount: total,
  });

  redirect(`/register/success?ref=${encodeURIComponent(referenceCode)}`);
}
