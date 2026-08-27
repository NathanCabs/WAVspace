"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isSupabaseConfigured, PAYMENT_PROOF_BUCKET } from "@/lib/constants";
import { siteConfig } from "@/lib/config/site-config";
import { requireAdmin } from "@/lib/data";
import { sendRegistrationStatusEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { eventFormSchema, loginSchema } from "@/lib/validations";

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
  redirect("/login");
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
  const adminNotes = String(formData.get("admin_notes") ?? "") || null;

  if (!id || (status !== "APPROVED" && status !== "REJECTED")) {
    return;
  }

  const { data: current } = await supabase
    .from("registrations")
    .select("*, events(title)")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("registrations")
    .update({ status, admin_notes: adminNotes })
    .eq("id", id);

  if (!error && current) {
    const eventTitle =
      (current as { events?: { title?: string } }).events?.title ??
      `${siteConfig.cafe.name} event`;
    await sendRegistrationStatusEmail({
      email: current.email,
      name: current.attendee_name,
      eventTitle,
      referenceCode: current.reference_code,
      status,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/registrations");
}

export async function updateVenueRequestStatus(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as "APPROVED" | "DECLINED";
  const adminNotes = String(formData.get("admin_notes") ?? "") || null;

  if (!id || (status !== "APPROVED" && status !== "DECLINED")) {
    return;
  }

  await supabase
    .from("venue_requests")
    .update({ status, admin_notes: adminNotes })
    .eq("id", id);

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
    description: formData.get("description"),
    event_date: formData.get("event_date"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    banner_url: formData.get("banner_url") || undefined,
    max_slots: formData.get("max_slots"),
    ticket_price: formData.get("ticket_price"),
    is_cafe_hosted: formData.get("is_cafe_hosted") === "on",
    category: formData.get("category"),
    is_published: formData.get("is_published") === "on",
  });

  if (!parsed.success) {
    redirect(
      `/admin/events/${eventId ?? "new"}?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Check the event form.",
      )}`,
    );
  }

  const kits = JSON.parse(String(formData.get("kits") ?? "[]")) as KitPayload[];
  const consumables = JSON.parse(
    String(formData.get("consumables") ?? "[]"),
  ) as ConsumablePayload[];

  const eventPayload = {
    ...parsed.data,
    banner_url: parsed.data.banner_url || null,
  };

  let savedId = eventId;

  if (eventId) {
    const { error } = await supabase
      .from("events")
      .update(eventPayload)
      .eq("id", eventId);
    if (error) {
      redirect(
        `/admin/events/${eventId}?error=${encodeURIComponent(error.message)}`,
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
      revalidatePath("/");
      revalidatePath("/events");
      revalidatePath("/admin/events");
      redirect("/admin/events");
    }
  } else {
    const { data, error } = await supabase
      .from("events")
      .insert(eventPayload)
      .select("id")
      .single();
    if (error || !data) {
      redirect(
        `/admin/events/new?error=${encodeURIComponent(error?.message ?? "Could not create event.")}`,
      );
    }
    savedId = data.id;
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
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { count } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id);

  if ((count ?? 0) > 0) {
    redirect("/admin/events?error=Cannot delete an event with registrations.");
  }

  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/events");
}
