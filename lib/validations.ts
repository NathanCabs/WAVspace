import { z } from "zod";

import { localToday } from "@/lib/dates";

const dateValueSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");

const emailSchema = z
  .string()
  .trim()
  .min(3, "Enter an email address.")
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: "Enter a valid email address.",
  });

export const venueRequestSchema = z.object({
  organizer_name: z.string().trim().min(2, "Enter the organizer name."),
  contact_email: emailSchema,
  contact_phone: z.string().trim().optional(),
  proposed_date: dateValueSchema.refine(
    (value) => value >= localToday(),
    { message: "Pick today or a future date." },
  ),
  expected_attendance: z.coerce.number().int().positive().optional(),
  event_description: z
    .string()
    .trim()
    .min(20, "Tell us a little more about the event."),
});

export const lookupSchema = z.object({
  query: z.string().trim().min(3, "Enter an email or WAV-XXXX code."),
});

export const attendeeSchema = z.object({
  attendee_name: z.string().trim().min(2, "Enter the attendee name."),
  email: emailSchema,
  phone: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirm: z.string().min(6, "Confirm the new password."),
  })
  .refine((value) => value.password === value.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Enter your current password."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirm: z.string().min(6, "Confirm the new password."),
  })
  .refine((value) => value.password === value.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export const displayNameSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Enter a display name.")
    .max(80, "Keep the display name under 80 characters."),
});

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(3, "Enter an event title."),
    slug: z.string().trim().optional(),
    description: z.string().trim(),
    event_date: dateValueSchema,
    start_time: z.string().min(1, "Set a start time."),
    end_time: z.string().min(1, "Set an end time."),
    banner_url: z.string().trim().optional(),
    max_slots: z.coerce.number().int().positive(),
    ticket_price: z.coerce.number().min(0),
    is_cafe_hosted: z.boolean(),
    category: z.enum(["cse", "acoustic", "workshop", "other"]),
    custom_category: z.string().trim().optional(),
    is_published: z.boolean(),
  })
  .refine(
    (value) =>
      value.category !== "other" || (value.custom_category?.length ?? 0) >= 2,
    { message: "Name this category.", path: ["custom_category"] },
  );

export type VenueRequestInput = z.infer<typeof venueRequestSchema>;
export type EventFormInput = z.infer<typeof eventFormSchema>;
