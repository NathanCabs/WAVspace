import { z } from "zod";

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
  proposed_date: z.string().min(1, "Pick a proposed date."),
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

export const eventFormSchema = z.object({
  title: z.string().trim().min(3, "Enter an event title."),
  description: z.string().trim().min(10, "Add a short description."),
  event_date: z.string().min(1, "Pick a date."),
  start_time: z.string().min(1, "Set a start time."),
  end_time: z.string().min(1, "Set an end time."),
  banner_url: z.string().trim().optional(),
  max_slots: z.coerce.number().int().positive(),
  ticket_price: z.coerce.number().min(0),
  is_cafe_hosted: z.boolean(),
  category: z.enum(["cse", "acoustic", "workshop", "other"]),
  is_published: z.boolean(),
});

export type VenueRequestInput = z.infer<typeof venueRequestSchema>;
export type EventFormInput = z.infer<typeof eventFormSchema>;
