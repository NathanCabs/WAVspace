"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  BANNER_MIME_TYPES,
  EVENT_BANNER_BUCKET,
  isSupabaseConfigured,
  MAX_BANNER_BYTES,
  PAYMENT_PROOF_BUCKET,
  SITE_URL,
} from "@/lib/constants";
import { siteConfig } from "@/lib/config/site-config";
import { requireAdmin } from "@/lib/data";
import { isAllowedEventDate } from "@/lib/dates";
import {
  sendEventCancelledAttendeeEmail,
  sendEventCancelledOrganizerEmail,
  sendRegistrationStatusEmail,
  sendVenueRequestStatusEmail,
} from "@/lib/email";
import { slugify, uniqueSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  changePasswordSchema,
  displayNameSchema,
  eventFormSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/lib/validations";

export async function loginAdmin(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=Connect%20Supabase%20to%20sign%20in.");
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?error=Check your email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login/forgot?error=Connect%20Supabase%20to%20reset%20a%20password.");
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect("/login/forgot?error=Enter%20a%20valid%20email%20address.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/login/forgot?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login/forgot?sent=1");
}

export async function completePasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=Connect%20Supabase%20to%20reset%20a%20password.");
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    redirect(
      `/reset-password?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Check the new password.",
      )}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=This%20reset%20link%20has%20expired.%20Request%20a%20new%20one.");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function updateDisplayName(formData: FormData) {
  const { user } = await assertAdmin();
  const parsed = displayNameSchema.safeParse({
    display_name: formData.get("display_name"),
  });

  if (!parsed.success) {
    redirect(
      `/admin/profile?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Check the display name.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.display_name })
    .eq("id", user.id);

  if (error) {
    redirect(`/admin/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/profile");
  redirect("/admin/profile?saved=name");
}

export async function changePassword(formData: FormData) {
  const { user } = await assertAdmin();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    redirect(
      `/admin/profile?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Check the password fields.",
      )}`,
    );
  }

  if (!user.email) {
    redirect("/admin/profile?error=This%20account%20has%20no%20email.");
  }

  const supabase = await createClient();
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (reauthError) {
    redirect("/admin/profile?error=Current%20password%20is%20incorrect.");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    redirect(`/admin/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/profile?saved=password");
}

async function assertAdmin() {
  const { user, profile } = await requireAdmin();
  if (!user || profile?.role !== "admin") {
    redirect("/login");
  }
  return { user, profile };
}

export async function updateRegistrationStatus(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "APPROVED"
    | "REJECTED";
  const adminNotes = String(formData.get("admin_notes") ?? "").trim() || null;

  if (!id || (status !== "APPROVED" && status !== "REJECTED")) {
    return;
  }

  const { data: current } = await supabase
    .from("registrations")
    .select(
      "*, events(title, event_date, start_time, end_time, slug), freebie_kits(name, items)",
    )
    .eq("id", id)
    .single();

  if (!current || current.status !== "PENDING") {
    return;
  }

  const { error } = await supabase
    .from("registrations")
    .update({ status, admin_notes: adminNotes })
    .eq("id", id)
    .eq("status", "PENDING");

  if (!error && current) {
    const eventRow = current.events as {
      title: string;
      event_date: string;
      start_time: string;
      end_time: string;
      slug: string | null;
    } | null;
    const kitRow = current.freebie_kits as {
      name: string;
      items: unknown;
    } | null;

    const { data: chosen } = await supabase
      .from("registration_consumables")
      .select("consumable_option_id")
      .eq("registration_id", id);
    const optionIds = (chosen ?? []).map((row) => row.consumable_option_id);
    let consumableName: string | null = null;
    if (optionIds.length) {
      const { data: options } = await supabase
        .from("consumable_options")
        .select("name")
        .in("id", optionIds);
      consumableName =
        options?.map((option) => option.name).join(", ") || null;
    }

    await sendRegistrationStatusEmail({
      email: current.email,
      name: current.attendee_name,
      phone: current.phone,
      eventTitle: eventRow?.title ?? `${siteConfig.cafe.name} event`,
      eventDate: eventRow?.event_date ?? "",
      startTime: eventRow?.start_time ?? "00:00",
      endTime: eventRow?.end_time ?? "00:00",
      eventSlug: eventRow?.slug,
      eventId: current.event_id,
      kitName: kitRow?.name ?? "No kit",
      kitItems: kitRow?.items,
      consumableName,
      totalAmount: Number(current.total_amount),
      referenceCode: current.reference_code,
      status,
      adminNotes,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/all-registrations");
  revalidatePath("/admin/events", "layout");
  revalidatePath("/lookup");
}

export async function deleteRejectedRegistration(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: row } = await supabase
    .from("registrations")
    .select("id, status, payment_proof_url")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.status !== "REJECTED") {
    redirect(
      "/admin/registrations?error=Only rejected registrations can be deleted.",
    );
  }

  await removePaymentProofs(
    row.payment_proof_url ? [row.payment_proof_url] : [],
  );

  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", id)
    .eq("status", "REJECTED");

  if (error) {
    redirect(
      `/admin/registrations?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/all-registrations");
  revalidatePath("/lookup");
}

export async function updateVenueRequestStatus(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as "APPROVED" | "DECLINED";
  const adminNotes = String(formData.get("admin_notes") ?? "").trim() || null;

  if (!id || (status !== "APPROVED" && status !== "DECLINED")) {
    return;
  }

  const { data: current } = await supabase
    .from("venue_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!current || current.status !== "PENDING") {
    return;
  }

  const { error } = await supabase
    .from("venue_requests")
    .update({ status, admin_notes: adminNotes })
    .eq("id", id)
    .eq("status", "PENDING");

  if (!error && current) {
    await sendVenueRequestStatusEmail({
      email: current.contact_email,
      organizerName: current.organizer_name,
      proposedDate: current.proposed_date,
      expectedAttendance: current.expected_attendance,
      eventDescription: current.event_description,
      contactPhone: current.contact_phone,
      status,
      adminNotes,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/venue-requests");
}

export async function deleteDeclinedVenueRequest(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: row } = await supabase
    .from("venue_requests")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.status !== "DECLINED") {
    redirect(
      "/admin/venue-requests?error=Only declined venue requests can be deleted.",
    );
  }

  const { error } = await supabase
    .from("venue_requests")
    .delete()
    .eq("id", id)
    .eq("status", "DECLINED");

  if (error) {
    redirect(
      `/admin/venue-requests?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/venue-requests");
}

export async function getSignedReceiptUrl(path: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(PAYMENT_PROOF_BUCKET)
    .createSignedUrl(path, 60 * 30);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

type KitPayload = {
  name: string;
  description: string;
  price: number;
  items: string[];
  is_default: boolean;
};

type ConsumablePayload = {
  name: string;
  category: "drink" | "food";
  extra_price: number;
};

export async function saveEvent(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const eventId = String(formData.get("id") ?? "") || undefined;

  const parsed = eventFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") ?? "",
    event_date: formData.get("event_date"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    banner_url: formData.get("banner_url") || undefined,
    max_slots: formData.get("max_slots"),
    ticket_price: formData.get("ticket_price"),
    is_cafe_hosted: formData.get("is_cafe_hosted") === "on",
    category: formData.get("category"),
    custom_category: formData.get("custom_category") || undefined,
    is_published: formData.get("is_published") === "on",
  });

  if (!parsed.success) {
    redirect(
      `${eventFormPath(eventId)}?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Check the event form.",
      )}`,
    );
  }

  const kits = JSON.parse(String(formData.get("kits") ?? "[]")) as KitPayload[];
  const consumables = JSON.parse(
    String(formData.get("consumables") ?? "[]"),
  ) as ConsumablePayload[];

  let previousBanner: string | null = null;
  let alreadyCancelled = false;
  let existingDate: string | null = null;
  if (eventId) {
    const { data: currentEvent } = await supabase
      .from("events")
      .select("banner_url, cancelled_at, event_date")
      .eq("id", eventId)
      .maybeSingle();
    previousBanner = currentEvent?.banner_url ?? null;
    alreadyCancelled = Boolean(currentEvent?.cancelled_at);
    existingDate = currentEvent?.event_date ?? null;
  }

  if (!isAllowedEventDate(parsed.data.event_date, existingDate)) {
    redirect(
      `${eventFormPath(eventId)}?error=${encodeURIComponent(
        "Pick today or a future date.",
      )}`,
    );
  }

  const { slug: requestedSlug, description, custom_category, ...eventFields } =
    parsed.data;
  const slug = await resolveEventSlug(
    supabase,
    requestedSlug,
    eventFields.title,
    eventId,
  );

  const banner = await resolveBannerFromForm(formData, eventId);
  const venueRequestId = String(formData.get("venue_request_id") ?? "").trim();

  const eventPayload = {
    ...eventFields,
    slug,
    description: description || null,
    custom_category:
      eventFields.category === "other" ? custom_category || null : null,
    banner_url: banner.url,
    is_published: alreadyCancelled ? false : eventFields.is_published,
    ...(eventId || !venueRequestId ? {} : { venue_request_id: venueRequestId }),
  };

  let savedId = eventId;

  if (eventId) {
    const { error } = await supabase
      .from("events")
      .update(eventPayload)
      .eq("id", eventId);
    if (error) {
      if (banner.uploadedPath) {
        await removeEventBanners([banner.uploadedPath]);
      }
      redirect(
        `/admin/events/${eventId}/edit?error=${encodeURIComponent(error.message)}`,
      );
    }
    const { count } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId);

    if ((count ?? 0) === 0) {
      await supabase.from("consumable_options").delete().eq("event_id", eventId);
      await supabase.from("freebie_kits").delete().eq("event_id", eventId);
    } else {
      if (previousBanner && previousBanner !== banner.url) {
        await removeStoredEventBanner(previousBanner);
      }
      revalidatePath("/");
      revalidatePath("/events");
      revalidatePath("/admin/events");
      redirect(`/admin/events/${eventId}`);
    }
  } else {
    const { data, error } = await supabase
      .from("events")
      .insert(eventPayload)
      .select("id")
      .single();
    if (error || !data) {
      if (banner.uploadedPath) {
        await removeEventBanners([banner.uploadedPath]);
      }
      redirect(
        `/admin/events/new?error=${encodeURIComponent(error?.message ?? "Could not create event.")}`,
      );
    }
    savedId = data.id;
  }

  if (previousBanner && previousBanner !== banner.url) {
    await removeStoredEventBanner(previousBanner);
  }

  if (consumables.length) {
    await supabase.from("consumable_options").insert(
      consumables.map((item, index) => ({
        event_id: savedId!,
        name: item.name,
        category: item.category,
        extra_price: item.extra_price,
        sort_order: index + 1,
      })),
    );
  }

  if (kits.length) {
    await supabase.from("freebie_kits").insert(
      kits.map((item, index) => ({
        event_id: savedId!,
        name: item.name,
        description: item.description,
        price: item.price,
        items: item.items,
        is_default: item.is_default,
        sort_order: index + 1,
      })),
    );
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");
  redirect(`/admin/events/${savedId}`);
}

export async function deleteEvent(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const confirmTitle = String(formData.get("confirm_title") ?? "").trim();
  if (!id) return;

  const { data: event } = await supabase
    .from("events")
    .select("id, title, banner_url")
    .eq("id", id)
    .maybeSingle();

  if (!event || confirmTitle !== event.title) {
    redirect("/admin/events?error=Type the event title to confirm delete.");
  }

  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, payment_proof_url")
    .eq("event_id", id);

  await removePaymentProofs(
    (registrations ?? [])
      .map((row) => row.payment_proof_url)
      .filter((path): path is string => Boolean(path)),
  );
  await removePaymentProofFolder(id);

  const { error: registrationError } = await supabase
    .from("registrations")
    .delete()
    .eq("event_id", id);

  if (registrationError) {
    redirect(
      `/admin/events?error=${encodeURIComponent(registrationError.message)}`,
    );
  }

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    redirect(`/admin/events?error=${encodeURIComponent(error.message)}`);
  }

  await removeStoredEventBanner(event.banner_url);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/all-registrations");
}

type AdminClient = Awaited<ReturnType<typeof createClient>>;

type CancellableEvent = {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  slug: string | null;
  cancelled_at: string | null;
  venue_request_id: string | null;
};

async function notifyCancelledAttendees(
  supabase: AdminClient,
  event: CancellableEvent,
  reason: string,
) {
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, freebie_kits(name, items)")
    .eq("event_id", event.id)
    .in("status", ["PENDING", "APPROVED"]);

  const rows = registrations ?? [];
  const consumableNames = new Map<string, string>();

  if (rows.length) {
    const { data: chosen } = await supabase
      .from("registration_consumables")
      .select("registration_id, consumable_option_id")
      .in(
        "registration_id",
        rows.map((row) => row.id),
      );

    const optionIds = [
      ...new Set((chosen ?? []).map((row) => row.consumable_option_id)),
    ];
    const optionNames = new Map<string, string>();
    if (optionIds.length) {
      const { data: options } = await supabase
        .from("consumable_options")
        .select("id, name")
        .in("id", optionIds);
      for (const option of options ?? []) {
        optionNames.set(option.id, option.name);
      }
    }

    const grouped = new Map<string, string[]>();
    for (const row of chosen ?? []) {
      const name = optionNames.get(row.consumable_option_id);
      if (!name) continue;
      const list = grouped.get(row.registration_id) ?? [];
      list.push(name);
      grouped.set(row.registration_id, list);
    }
    for (const [registrationId, names] of grouped) {
      consumableNames.set(registrationId, names.join(", "));
    }
  }

  for (const row of rows) {
    const kitRow = row.freebie_kits as { name: string; items: unknown } | null;
    await sendEventCancelledAttendeeEmail({
      email: row.email,
      name: row.attendee_name,
      phone: row.phone,
      eventTitle: event.title,
      eventDate: event.event_date,
      startTime: event.start_time,
      endTime: event.end_time,
      eventSlug: event.slug,
      eventId: event.id,
      kitName: kitRow?.name ?? "No kit",
      kitItems: kitRow?.items,
      consumableName: consumableNames.get(row.id) ?? null,
      totalAmount: Number(row.total_amount),
      referenceCode: row.reference_code,
      reason,
    });
  }

  return rows.length;
}

async function cancelLinkedVenueRequest(
  supabase: AdminClient,
  requestId: string,
  reason: string,
  eventTitle: string | null,
  eventDate: string | undefined,
  registeredCount: number,
) {
  const { data: request } = await supabase
    .from("venue_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (!request || request.status === "CANCELLED") {
    return;
  }

  await supabase
    .from("venue_requests")
    .update({ status: "CANCELLED", admin_notes: reason })
    .eq("id", requestId);

  await sendEventCancelledOrganizerEmail({
    email: request.contact_email,
    organizerName: request.organizer_name,
    proposedDate: request.proposed_date,
    expectedAttendance: request.expected_attendance,
    eventDescription: request.event_description,
    contactPhone: request.contact_phone,
    reason,
    eventTitle,
    eventDate,
    registeredCount,
    guestsNotified: registeredCount > 0,
  });
}

async function cancelEventRecord(
  supabase: AdminClient,
  eventId: string,
  reason: string,
) {
  const { data: event } = await supabase
    .from("events")
    .select(
      "id, title, event_date, start_time, end_time, slug, cancelled_at, venue_request_id",
    )
    .eq("id", eventId)
    .maybeSingle();

  if (!event) {
    return { error: "Event not found." };
  }
  if (event.cancelled_at) {
    return { error: "This event is already cancelled." };
  }

  const { error } = await supabase
    .from("events")
    .update({
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      is_published: false,
    })
    .eq("id", eventId)
    .is("cancelled_at", null);

  if (error) {
    return { error: error.message };
  }

  const registeredCount = await notifyCancelledAttendees(
    supabase,
    event,
    reason,
  );

  if (event.venue_request_id) {
    await cancelLinkedVenueRequest(
      supabase,
      event.venue_request_id,
      reason,
      event.title,
      event.event_date,
      registeredCount,
    );
  }

  return { error: null };
}

function revalidateAfterCancel() {
  revalidatePath("/");
  revalidatePath("/events", "layout");
  revalidatePath("/lookup");
  revalidatePath("/admin");
  revalidatePath("/admin/events", "layout");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/all-registrations");
  revalidatePath("/admin/venue-requests");
}

export async function cancelEvent(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const confirmTitle = String(formData.get("confirm_title") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return;

  if (reason.length < 8) {
    redirect(
      `/admin/events/${id}?error=Add a cancellation reason guests can understand.`,
    );
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (!event || confirmTitle !== event.title) {
    redirect(
      `/admin/events/${id}?error=Type the event title to confirm cancellation.`,
    );
  }

  const result = await cancelEventRecord(supabase, id, reason);
  if (result.error) {
    redirect(`/admin/events/${id}?error=${encodeURIComponent(result.error)}`);
  }

  revalidateAfterCancel();
  redirect(`/admin/events/${id}`);
}

export async function cancelVenueRequest(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const confirmName = String(formData.get("confirm_name") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return;

  if (reason.length < 8) {
    redirect(
      "/admin/venue-requests?error=Add a cancellation reason the organizer can understand.",
    );
  }

  const { data: request } = await supabase
    .from("venue_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!request || request.status !== "APPROVED") {
    redirect(
      "/admin/venue-requests?error=Only approved venue requests can be cancelled.",
    );
  }

  if (confirmName !== request.organizer_name) {
    redirect(
      "/admin/venue-requests?error=Type the organizer name to confirm cancellation.",
    );
  }

  const { data: linkedEvent } = await supabase
    .from("events")
    .select("id, cancelled_at")
    .eq("venue_request_id", id)
    .maybeSingle();

  if (linkedEvent && !linkedEvent.cancelled_at) {
    const result = await cancelEventRecord(supabase, linkedEvent.id, reason);
    if (result.error) {
      redirect(
        `/admin/venue-requests?error=${encodeURIComponent(result.error)}`,
      );
    }
  } else {
    await supabase
      .from("venue_requests")
      .update({ status: "CANCELLED", admin_notes: reason })
      .eq("id", id);

    await sendEventCancelledOrganizerEmail({
      email: request.contact_email,
      organizerName: request.organizer_name,
      proposedDate: request.proposed_date,
      expectedAttendance: request.expected_attendance,
      eventDescription: request.event_description,
      contactPhone: request.contact_phone,
      reason,
      eventTitle: null,
      registeredCount: 0,
      guestsNotified: false,
    });
  }

  revalidateAfterCancel();
}

export async function resetOperationalData(formData: FormData) {
  await assertAdmin();
  const confirm = String(formData.get("confirm") ?? "").trim();
  const acknowledged = formData.get("acknowledged") === "on";

  if (confirm !== "RESET" || !acknowledged) {
    redirect(
      "/admin/profile?error=Type RESET and confirm that you understand this cannot be undone.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_operational_data");

  if (error) {
    redirect(`/admin/profile?error=${encodeURIComponent(error.message)}`);
  }

  await emptyPaymentProofBucket();
  await emptyStorageBucket(EVENT_BANNER_BUCKET);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/lookup");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/all-registrations");
  revalidatePath("/admin/venue-requests");
  redirect("/admin/profile?saved=reset");
}

async function resolveEventSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestedSlug: string | undefined,
  title: string,
  excludeId?: string,
) {
  let desired = requestedSlug;

  if (!desired && excludeId) {
    const { data: current } = await supabase
      .from("events")
      .select("slug")
      .eq("id", excludeId)
      .maybeSingle();
    desired = current?.slug ?? undefined;
  }

  const base = slugify(desired || title);
  const { data } = await supabase.from("events").select("id, slug");
  const taken = (data ?? [])
    .filter((row) => row.id !== excludeId)
    .map((row) => row.slug);
  return uniqueSlug(base, taken);
}

function eventFormPath(eventId: string | undefined) {
  return eventId ? `/admin/events/${eventId}/edit` : "/admin/events/new";
}

function redirectEventError(eventId: string | undefined, message: string): never {
  redirect(
    `${eventFormPath(eventId)}?error=${encodeURIComponent(message)}`,
  );
}

async function resolveBannerFromForm(
  formData: FormData,
  eventId?: string,
): Promise<{ url: string | null; uploadedPath: string | null }> {
  const pasted = String(formData.get("banner_url") ?? "").trim() || null;
  const file = formData.get("banner_file");

  if (!(file instanceof File) || file.size === 0) {
    return { url: pasted, uploadedPath: null };
  }

  if (file.size > MAX_BANNER_BYTES) {
    redirectEventError(eventId, "Banner must be 5MB or smaller.");
  }

  if (!BANNER_MIME_TYPES.includes(file.type)) {
    redirectEventError(eventId, "Upload a JPG, PNG, or WebP banner.");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    redirectEventError(
      eventId,
      "Connect Supabase storage to upload a banner, or paste a URL.",
    );
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await admin.storage.from(EVENT_BANNER_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    redirectEventError(eventId, error.message);
  }

  const { data } = admin.storage.from(EVENT_BANNER_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, uploadedPath: path };
}

function eventBannerStoragePath(url: string | null | undefined) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${EVENT_BANNER_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

async function removeStoredEventBanner(url: string | null | undefined) {
  const path = eventBannerStoragePath(url);
  if (path) await removeEventBanners([path]);
}

async function removeEventBanners(paths: string[]) {
  if (!paths.length) return;
  try {
    const admin = createAdminClient();
    await admin.storage.from(EVENT_BANNER_BUCKET).remove(paths);
  } catch {
    // Service role is optional for local/demo; table rows still save.
  }
}

async function removePaymentProofs(paths: string[]) {
  if (!paths.length) return;
  try {
    const admin = createAdminClient();
    await admin.storage.from(PAYMENT_PROOF_BUCKET).remove(paths);
  } catch {
    // Service role is optional for local/demo; table rows still delete.
  }
}

async function removePaymentProofFolder(eventId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin.storage
      .from(PAYMENT_PROOF_BUCKET)
      .list(eventId, { limit: 1000 });
    const paths = (data ?? []).map((file) => `${eventId}/${file.name}`);
    if (paths.length) {
      await admin.storage.from(PAYMENT_PROOF_BUCKET).remove(paths);
    }
  } catch {
    // Ignore storage cleanup failures.
  }
}

async function emptyPaymentProofBucket() {
  await emptyStorageBucket(PAYMENT_PROOF_BUCKET);
}

async function emptyStorageBucket(bucket: string) {
  try {
    const admin = createAdminClient();
    const { data: entries } = await admin.storage
      .from(bucket)
      .list("", { limit: 1000 });

    for (const entry of entries ?? []) {
      if (entry.id) {
        await admin.storage.from(bucket).remove([entry.name]);
        continue;
      }

      const { data: files } = await admin.storage
        .from(bucket)
        .list(entry.name, { limit: 1000 });
      const paths = (files ?? []).map((file) => `${entry.name}/${file.name}`);
      if (paths.length) {
        await admin.storage.from(bucket).remove(paths);
      }
    }
  } catch {
    // Ignore storage cleanup failures.
  }
}
