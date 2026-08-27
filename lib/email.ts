import { Resend } from "resend";
import type { ReactElement } from "react";

import {
  RegistrationReceivedEmail,
  RegistrationStatusEmail,
  VenueRequestReceivedEmail,
} from "@/emails/templates";
import { isResendConfigured, SITE_URL } from "@/lib/constants";
import { siteConfig } from "@/lib/config/site-config";
import { formatPeso } from "@/lib/format";

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

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to,
    subject,
    react,
  });

  if (error) {
    console.error("Resend error", error);
  }
}

export async function sendRegistrationReceivedEmail(input: {
  email: string;
  name: string;
  eventTitle: string;
  referenceCode: string;
  totalAmount: number;
}) {
  await send(
    input.email,
    `You're registered — ${input.referenceCode}`,
    RegistrationReceivedEmail({
      name: input.name,
      eventTitle: input.eventTitle,
      referenceCode: input.referenceCode,
      totalAmount: formatPeso(input.totalAmount),
      lookupUrl: `${SITE_URL}/lookup?q=${encodeURIComponent(input.referenceCode)}`,
    }),
  );
}

export async function sendRegistrationStatusEmail(input: {
  email: string;
  name: string;
  eventTitle: string;
  referenceCode: string;
  status: "APPROVED" | "REJECTED";
}) {
  await send(
    input.email,
    input.status === "APPROVED"
      ? `Approved — ${input.referenceCode}`
      : `Update on ${input.referenceCode}`,
    RegistrationStatusEmail({
      name: input.name,
      eventTitle: input.eventTitle,
      referenceCode: input.referenceCode,
      status: input.status,
      lookupUrl: `${SITE_URL}/lookup?q=${encodeURIComponent(input.referenceCode)}`,
    }),
  );
}

export async function sendVenueRequestReceivedEmail(input: {
  email: string;
  organizerName: string;
  proposedDate: string;
}) {
  await send(
    input.email,
    `${siteConfig.cafe.name} received your venue inquiry`,
    VenueRequestReceivedEmail({
      organizerName: input.organizerName,
      proposedDate: input.proposedDate,
    }),
  );
}
