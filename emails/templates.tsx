import type { CSSProperties, ReactElement, ReactNode } from "react";

import { siteConfig } from "@/lib/config/site-config";

const { hex } = siteConfig.theme;

type EmailShellProps = {
  preview: string;
  children: ReactNode;
};

function EmailShell({ preview, children }: EmailShellProps) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          backgroundColor: hex.background,
          color: hex.cream,
          fontFamily:
            "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "none" }}>{preview}</div>
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: hex.background, padding: "32px 16px" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  width="560"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    backgroundColor: hex.card,
                    border: `1px solid ${hex.primary}33`,
                    borderRadius: 24,
                    padding: 32,
                  }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <p
                          style={{
                            margin: 0,
                            letterSpacing: "0.2em",
                            fontSize: 12,
                            color: hex.primary,
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          {siteConfig.product.name.toUpperCase()}
                        </p>
                        {children}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

const bodyText: CSSProperties = {
  fontFamily: "Arial, sans-serif",
  lineHeight: 1.6,
  color: hex.muted,
};

function CafeContactFooter({ homepageUrl }: { homepageUrl: string }) {
  const { cafe, contact } = siteConfig;
  return (
    <>
      <p style={{ ...bodyText, margin: "20px 0 8px" }}>
        {cafe.name}
        <br />
        {contact.address}
        <br />
        <a href={`mailto:${contact.email}`} style={{ color: hex.primary }}>
          {contact.email}
        </a>
        {contact.phone ? (
          <>
            <br />
            {contact.phone}
          </>
        ) : null}
      </p>
      <p style={{ fontFamily: "Arial, sans-serif" }}>
        <a href={homepageUrl} style={{ color: hex.primary }}>
          Visit {cafe.name}
        </a>
      </p>
    </>
  );
}

type RegistrationEmailDetails = {
  name: string;
  email: string;
  phone?: string | null;
  eventTitle: string;
  eventWhen: string;
  venueName: string;
  venueAddress: string;
  kitName: string;
  kitItems?: string[];
  consumableName?: string | null;
  totalAmount: string;
  referenceCode: string;
};

function DetailLine({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <p style={{ ...bodyText, margin: "0 0 6px", color: hex.cream }}>
      <strong>{label}:</strong> {children}
    </p>
  );
}

function RegistrationSummary({
  name,
  email,
  phone,
  eventTitle,
  eventWhen,
  venueName,
  venueAddress,
  kitName,
  kitItems,
  consumableName,
  totalAmount,
  referenceCode,
}: RegistrationEmailDetails) {
  return (
    <div
      style={{
        margin: "20px 0",
        padding: "16px 18px",
        backgroundColor: `${hex.primary}14`,
        border: `1px solid ${hex.primary}33`,
        borderRadius: 16,
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontFamily: "Arial, sans-serif",
          fontSize: 12,
          letterSpacing: "0.16em",
          color: hex.primary,
        }}
      >
        YOUR BOOKING
      </p>
      <DetailLine label="Reference">{referenceCode}</DetailLine>
      <DetailLine label="Attendee">{name}</DetailLine>
      <DetailLine label="Email">{email}</DetailLine>
      {phone ? <DetailLine label="Phone">{phone}</DetailLine> : null}
      <DetailLine label="Event">{eventTitle}</DetailLine>
      <DetailLine label="When">{eventWhen}</DetailLine>
      <DetailLine label="Where">
        {venueName}, {venueAddress}
      </DetailLine>
      <DetailLine label="Kit">
        {kitName}
        {kitItems?.length ? ` (${kitItems.join(", ")})` : ""}
      </DetailLine>
      {consumableName ? (
        <DetailLine label="Drink / food">{consumableName}</DetailLine>
      ) : null}
      <DetailLine label="Amount sent">{totalAmount}</DetailLine>
    </div>
  );
}

function ReferenceBlock({ code }: { code: string }) {
  return (
    <>
      <p
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 14,
          letterSpacing: "0.16em",
          color: hex.primary,
        }}
      >
        REFERENCE
      </p>
      <p style={{ fontSize: 32, margin: "0 0 16px" }}>{code}</p>
    </>
  );
}

export function RegistrationReceivedEmail({
  name,
  email,
  phone,
  eventTitle,
  eventWhen,
  venueName,
  venueAddress,
  kitName,
  kitItems,
  consumableName,
  totalAmount,
  referenceCode,
  lookupUrl,
  eventUrl,
  homepageUrl,
}: RegistrationEmailDetails & {
  lookupUrl: string;
  eventUrl: string;
  homepageUrl: string;
}): ReactElement {
  return (
    <EmailShell preview={`Your ${eventTitle} reference is ${referenceCode}`}>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>
        We received your registration.
      </h1>
      <p style={bodyText}>
        Hi {name}, your registration for <strong>{eventTitle}</strong> is in
        the queue. {siteConfig.cafe.name} will review your receipt and email
        you at this address. Your slot is held until then. Keep this code for
        lookup and door check-in.
      </p>
      <ReferenceBlock code={referenceCode} />
      <RegistrationSummary
        name={name}
        email={email}
        phone={phone}
        eventTitle={eventTitle}
        eventWhen={eventWhen}
        venueName={venueName}
        venueAddress={venueAddress}
        kitName={kitName}
        kitItems={kitItems}
        consumableName={consumableName}
        totalAmount={totalAmount}
        referenceCode={referenceCode}
      />
      <p style={{ fontFamily: "Arial, sans-serif" }}>
        <a href={lookupUrl} style={{ color: hex.primary }}>
          Check your status
        </a>
        {" · "}
        <a href={eventUrl} style={{ color: hex.primary }}>
          Event page
        </a>
      </p>
      <CafeContactFooter homepageUrl={homepageUrl} />
    </EmailShell>
  );
}

export function RegistrationStatusEmail({
  name,
  email,
  phone,
  eventTitle,
  eventWhen,
  venueName,
  venueAddress,
  kitName,
  kitItems,
  consumableName,
  totalAmount,
  referenceCode,
  status,
  adminNotes,
  lookupUrl,
  eventUrl,
  homepageUrl,
}: RegistrationEmailDetails & {
  status: "APPROVED" | "REJECTED";
  adminNotes?: string | null;
  lookupUrl: string;
  eventUrl: string;
  homepageUrl: string;
}): ReactElement {
  const approved = status === "APPROVED";
  return (
    <EmailShell preview={`${referenceCode} is ${status.toLowerCase()}`}>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>
        {approved ? "You are in." : "Receipt needs another look."}
      </h1>
      <p style={bodyText}>
        Hi {name}, your registration for <strong>{eventTitle}</strong> (
        {referenceCode}) was {approved ? "approved" : "not approved"}.
        {approved
          ? " Bring this code to the door — a screenshot of this email or the Lookup page is enough."
          : " This code no longer holds a slot, and Lookup will not show it."}
      </p>
      {adminNotes ? (
        <p style={bodyText}>
          <strong style={{ color: hex.cream }}>Note from the cafe:</strong>
          <br />
          {adminNotes}
        </p>
      ) : null}
      <ReferenceBlock code={referenceCode} />
      <RegistrationSummary
        name={name}
        email={email}
        phone={phone}
        eventTitle={eventTitle}
        eventWhen={eventWhen}
        venueName={venueName}
        venueAddress={venueAddress}
        kitName={kitName}
        kitItems={kitItems}
        consumableName={consumableName}
        totalAmount={totalAmount}
        referenceCode={referenceCode}
      />
      {approved ? (
        <p style={{ fontFamily: "Arial, sans-serif" }}>
          <a href={lookupUrl} style={{ color: hex.primary }}>
            View status
          </a>
          {" · "}
          <a href={eventUrl} style={{ color: hex.primary }}>
            Event page
          </a>
        </p>
      ) : (
        <p style={bodyText}>
          If you still want to attend, register again on the event page with a
          clearer receipt. Questions? Write {siteConfig.contact.email}.
          <br />
          <a href={eventUrl} style={{ color: hex.primary }}>
            Register again
          </a>
        </p>
      )}
      <CafeContactFooter homepageUrl={homepageUrl} />
    </EmailShell>
  );
}

type VenueInquiryDetails = {
  organizerName: string;
  proposedDate: string;
  expectedAttendance?: number | null;
  eventDescription: string;
  contactEmail?: string;
  contactPhone?: string | null;
};

function VenueInquirySummary({
  organizerName,
  proposedDate,
  expectedAttendance,
  eventDescription,
  contactEmail,
  contactPhone,
}: VenueInquiryDetails) {
  return (
    <div
      style={{
        margin: "20px 0",
        padding: "16px 18px",
        backgroundColor: `${hex.primary}14`,
        border: `1px solid ${hex.primary}33`,
        borderRadius: 16,
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontFamily: "Arial, sans-serif",
          fontSize: 12,
          letterSpacing: "0.16em",
          color: hex.primary,
        }}
      >
        YOUR INQUIRY
      </p>
      <p style={{ ...bodyText, margin: "0 0 6px", color: hex.cream }}>
        <strong>Organizer:</strong> {organizerName}
      </p>
      {contactEmail ? (
        <p style={{ ...bodyText, margin: "0 0 6px", color: hex.cream }}>
          <strong>Email:</strong> {contactEmail}
        </p>
      ) : null}
      {contactPhone ? (
        <p style={{ ...bodyText, margin: "0 0 6px", color: hex.cream }}>
          <strong>Phone:</strong> {contactPhone}
        </p>
      ) : null}
      <p style={{ ...bodyText, margin: "0 0 6px", color: hex.cream }}>
        <strong>Proposed date:</strong> {proposedDate}
      </p>
      {expectedAttendance ? (
        <p style={{ ...bodyText, margin: "0 0 6px", color: hex.cream }}>
          <strong>Expected attendance:</strong> ~{expectedAttendance} guests
        </p>
      ) : null}
      <p style={{ ...bodyText, margin: "12px 0 4px", color: hex.cream }}>
        <strong>Event description</strong>
      </p>
      <p style={{ ...bodyText, margin: 0, whiteSpace: "pre-wrap", color: hex.cream }}>
        {eventDescription}
      </p>
    </div>
  );
}

export function VenueRequestReceivedEmail({
  organizerName,
  proposedDate,
  expectedAttendance,
  eventDescription,
  contactEmail,
  contactPhone,
  homepageUrl,
}: VenueInquiryDetails & { homepageUrl: string }): ReactElement {
  return (
    <EmailShell preview={`${siteConfig.cafe.name} received your venue inquiry`}>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>Inquiry received</h1>
      <p style={bodyText}>
        Hi {organizerName}, {siteConfig.cafe.name} has your request to host on{" "}
        {proposedDate}. Keep this email as your copy. Staff will review it and
        email you at this address with a decision.
      </p>
      <VenueInquirySummary
        organizerName={organizerName}
        proposedDate={proposedDate}
        expectedAttendance={expectedAttendance}
        eventDescription={eventDescription}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      />
      <p style={bodyText}>
        This is not a booking yet. Date, layout, guest count, and the public
        listing are confirmed after we talk.
      </p>
      <CafeContactFooter homepageUrl={homepageUrl} />
    </EmailShell>
  );
}

export function VenueRequestStatusEmail({
  organizerName,
  proposedDate,
  expectedAttendance,
  eventDescription,
  contactEmail,
  contactPhone,
  status,
  adminNotes,
  homepageUrl,
}: VenueInquiryDetails & {
  status: "APPROVED" | "DECLINED";
  adminNotes?: string | null;
  homepageUrl: string;
}): ReactElement {
  const approved = status === "APPROVED";
  return (
    <EmailShell
      preview={
        approved
          ? `${siteConfig.cafe.name} approved your venue inquiry`
          : `Update on your ${siteConfig.cafe.name} venue inquiry`
      }
    >
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>
        {approved ? "Your inquiry is approved." : "We cannot host this inquiry."}
      </h1>
      <p style={bodyText}>
        Hi {organizerName}, {siteConfig.cafe.name} reviewed your request to host
        on {proposedDate}.{" "}
        {approved
          ? "We can take this forward. A coordinator will email you next to lock timing, floor layout, guest count, and listing copy. The night is not on the public calendar until those details are set."
          : "We are not able to host this inquiry as submitted."}
      </p>
      {adminNotes ? (
        <p style={bodyText}>
          <strong style={{ color: hex.cream }}>Note from the cafe:</strong>
          <br />
          {adminNotes}
        </p>
      ) : null}
      <VenueInquirySummary
        organizerName={organizerName}
        proposedDate={proposedDate}
        expectedAttendance={expectedAttendance}
        eventDescription={eventDescription}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      />
      <p style={bodyText}>
        {approved
          ? `Reply to this email or write ${siteConfig.contact.email} if you have not heard from us.`
          : `Questions? Write ${siteConfig.contact.email}.`}
      </p>
      <CafeContactFooter homepageUrl={homepageUrl} />
    </EmailShell>
  );
}

export function EventCancelledAttendeeEmail({
  name,
  email,
  phone,
  eventTitle,
  eventWhen,
  venueName,
  venueAddress,
  kitName,
  kitItems,
  consumableName,
  totalAmount,
  referenceCode,
  reason,
  homepageUrl,
}: RegistrationEmailDetails & {
  reason: string;
  homepageUrl: string;
}): ReactElement {
  const { cafe, contact } = siteConfig;
  return (
    <EmailShell preview={`${eventTitle} has been cancelled`}>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>
        {eventTitle} is cancelled.
      </h1>
      <p style={bodyText}>
        Hi {name}, {cafe.name} will not open this night. Your registration (
        {referenceCode}) no longer has a door slot, and the event is off the
        public calendar. Keep this email as your record.
      </p>
      <p style={bodyText}>
        <strong style={{ color: hex.cream }}>Why it was cancelled:</strong>
        <br />
        {reason}
      </p>
      <ReferenceBlock code={referenceCode} />
      <RegistrationSummary
        name={name}
        email={email}
        phone={phone}
        eventTitle={eventTitle}
        eventWhen={eventWhen}
        venueName={venueName}
        venueAddress={venueAddress}
        kitName={kitName}
        kitItems={kitItems}
        consumableName={consumableName}
        totalAmount={totalAmount}
        referenceCode={referenceCode}
      />
      <p style={bodyText}>
        {cafe.name} will follow up about a refund of {totalAmount} to the same
        GCash, Maya, or bank account used for this booking. Reply to this email
        or write {contact.email}
        {contact.phone ? ` / ${contact.phone}` : ""} if you have not heard from
        us about the return.
      </p>
      <CafeContactFooter homepageUrl={homepageUrl} />
    </EmailShell>
  );
}

export function EventCancelledOrganizerEmail({
  organizerName,
  proposedDate,
  expectedAttendance,
  eventDescription,
  contactEmail,
  contactPhone,
  eventTitle,
  registeredCount,
  guestsNotified,
  reason,
  homepageUrl,
}: VenueInquiryDetails & {
  eventTitle?: string | null;
  registeredCount: number;
  guestsNotified: boolean;
  reason: string;
  homepageUrl: string;
}): ReactElement {
  const { cafe, contact } = siteConfig;
  return (
    <EmailShell preview={`Your night at ${cafe.name} was cancelled`}>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>
        This night will not happen.
      </h1>
      <p style={bodyText}>
        Hi {organizerName}, {cafe.name} has cancelled
        {eventTitle ? (
          <>
            {" "}
            <strong>{eventTitle}</strong>
          </>
        ) : (
          " your booking"
        )}{" "}
        on {proposedDate}. The listing is off the public calendar.
      </p>
      <p style={bodyText}>
        <strong style={{ color: hex.cream }}>Why it was cancelled:</strong>
        <br />
        {reason}
      </p>
      {eventTitle ? (
        <p style={{ ...bodyText, color: hex.cream }}>
          <strong>Event title:</strong> {eventTitle}
        </p>
      ) : null}
      <p style={{ ...bodyText, color: hex.cream }}>
        <strong>Guests already registered:</strong> {registeredCount}
      </p>
      <p style={bodyText}>
        {guestsNotified
          ? "Every pending and approved guest has been emailed with the same reason, their booking details, and refund next steps."
          : "No guests had registered yet, so only you are receiving this notice."}
      </p>
      <VenueInquirySummary
        organizerName={organizerName}
        proposedDate={proposedDate}
        expectedAttendance={expectedAttendance}
        eventDescription={eventDescription}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      />
      <p style={bodyText}>
        Questions? Write {contact.email}
        {contact.phone ? ` or call ${contact.phone}` : ""}.
      </p>
      <CafeContactFooter homepageUrl={homepageUrl} />
    </EmailShell>
  );
}
