import { render } from "@react-email/render";
import { Resend } from "resend";
import type { ReactElement } from "react";

import {
  EventCancelledAttendeeEmail,
  EventCancelledOrganizerEmail,
  RegistrationReceivedEmail,
  RegistrationStatusEmail,
  VenueRequestReceivedEmail,
  VenueRequestStatusEmail,
} from "@/emails/templates";
import { isResendConfigured, SITE_URL } from "@/lib/constants";
import { siteConfig } from "@/lib/config/site-config";
import { formatEventDate, formatEventWindow, formatPeso, kitItems } from "@/lib/format";

function getResend() {
  if (!isResendConfigured()) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? `${siteConfig.cafe.name} <onboarding@resend.dev>`;
}

async function send(to: string, subject: string, react: ReactElement) {
  const resend = getResend();
  if (!resend) {
    console.info(`[email skipped] ${subject} -> ${to}`);
    return;
  }

  try {
    const html = await render(react);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error", error);
    }
  } catch (error) {
    console.error("Resend error", error);
  }
}

type RegistrationEmailInput = {
  email: string;
  name: string;
  phone?: string | null;
  eventTitle: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventSlug?: string | null;
  eventId: string;
  kitName: string;
  kitItems?: unknown;
  consumableName?: string | null;
  totalAmount: number;
  referenceCode: string;
};

function registrationEmailProps(input: RegistrationEmailInput) {
  const eventPath = input.eventSlug || input.eventId;
  return {
    name: input.name,
    email: input.email,
    phone: input.phone,
    eventTitle: input.eventTitle,
    eventWhen: input.eventDate
      ? formatEventWindow(input.eventDate, input.startTime, input.endTime)
      : "Date to be confirmed",
    venueName: siteConfig.cafe.name,
    venueAddress: siteConfig.contact.address,
    kitName: input.kitName,
    kitItems: kitItems(input.kitItems),
    consumableName: input.consumableName,
    totalAmount: formatPeso(input.totalAmount),
    referenceCode: input.referenceCode,
    lookupUrl: `${SITE_URL}/lookup?q=${encodeURIComponent(input.referenceCode)}`,
    eventUrl: `${SITE_URL}/events/${eventPath}`,
    homepageUrl: SITE_URL,
  };
}

export async function sendRegistrationReceivedEmail(
  input: RegistrationEmailInput,
) {
  await send(
    input.email,
    `You're registered — ${input.referenceCode}`,
    RegistrationReceivedEmail(registrationEmailProps(input)),
  );
}

export async function sendRegistrationStatusEmail(
  input: RegistrationEmailInput & {
    status: "APPROVED" | "REJECTED";
    adminNotes?: string | null;
  },
) {
  await send(
    input.email,
    input.status === "APPROVED"
      ? `Approved — ${input.referenceCode}`
      : `Update on ${input.referenceCode}`,
    RegistrationStatusEmail({
      ...registrationEmailProps(input),
      status: input.status,
      adminNotes: input.adminNotes,
    }),
  );
}

type VenueInquiryEmailInput = {
  email: string;
  organizerName: string;
  proposedDate: string;
  expectedAttendance?: number | null;
  eventDescription: string;
  contactPhone?: string | null;
};

export async function sendVenueRequestReceivedEmail(
  input: VenueInquiryEmailInput,
) {
  await send(
    input.email,
    `${siteConfig.cafe.name} received your venue inquiry`,
    VenueRequestReceivedEmail({
      organizerName: input.organizerName,
      proposedDate: formatEventDate(input.proposedDate),
      expectedAttendance: input.expectedAttendance,
      eventDescription: input.eventDescription,
      contactEmail: input.email,
      contactPhone: input.contactPhone,
      homepageUrl: SITE_URL,
    }),
  );
}

export async function sendVenueRequestStatusEmail(
  input: VenueInquiryEmailInput & {
    status: "APPROVED" | "DECLINED";
    adminNotes?: string | null;
  },
) {
  await send(
    input.email,
    input.status === "APPROVED"
      ? `Your venue inquiry was approved — ${siteConfig.cafe.name}`
      : `Update on your ${siteConfig.cafe.name} venue inquiry`,
    VenueRequestStatusEmail({
      organizerName: input.organizerName,
      proposedDate: formatEventDate(input.proposedDate),
      expectedAttendance: input.expectedAttendance,
      eventDescription: input.eventDescription,
      contactEmail: input.email,
      contactPhone: input.contactPhone,
      status: input.status,
      adminNotes: input.adminNotes,
      homepageUrl: SITE_URL,
    }),
  );
}

export async function sendEventCancelledAttendeeEmail(
  input: RegistrationEmailInput & { reason: string },
) {
  await send(
    input.email,
    `Cancelled — ${input.eventTitle}`,
    EventCancelledAttendeeEmail({
      ...registrationEmailProps(input),
      reason: input.reason,
    }),
  );
}

export async function sendEventCancelledOrganizerEmail(
  input: VenueInquiryEmailInput & {
    reason: string;
    eventTitle?: string | null;
    eventDate?: string;
    registeredCount: number;
    guestsNotified: boolean;
  },
) {
  const when = input.eventDate || input.proposedDate;
  await send(
    input.email,
    `Your night at ${siteConfig.cafe.name} was cancelled`,
    EventCancelledOrganizerEmail({
      organizerName: input.organizerName,
      proposedDate: formatEventDate(when),
      expectedAttendance: input.expectedAttendance,
      eventDescription: input.eventDescription,
      contactEmail: input.email,
      contactPhone: input.contactPhone,
      eventTitle: input.eventTitle,
      registeredCount: input.registeredCount,
      guestsNotified: input.guestsNotified,
      reason: input.reason,
      homepageUrl: SITE_URL,
    }),
  );
}
