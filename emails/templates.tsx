import type { ReactElement } from "react";

import { siteConfig } from "@/lib/config/site-config";

const { hex } = siteConfig.theme;

type EmailShellProps = {
  preview: string;
  children: React.ReactNode;
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

export function RegistrationReceivedEmail({
  name,
  eventTitle,
  referenceCode,
  lookupUrl,
  totalAmount,
}: {
  name: string;
  eventTitle: string;
  referenceCode: string;
  lookupUrl: string;
  totalAmount: string;
}): ReactElement {
  return (
    <EmailShell preview={`Your ${eventTitle} reference is ${referenceCode}`}>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>We received you.</h1>
      <p style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6, color: hex.muted }}>
        Hi {name}, your registration for <strong>{eventTitle}</strong> is in
        the queue. The cafe will review your receipt and confirm your slot.
      </p>
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
      <p style={{ fontSize: 32, margin: "0 0 16px" }}>{referenceCode}</p>
      <p style={{ fontFamily: "Arial, sans-serif", color: hex.muted }}>
        Amount sent: {totalAmount}
      </p>
      <p style={{ fontFamily: "Arial, sans-serif" }}>
        <a href={lookupUrl} style={{ color: hex.primary }}>
          Check your status
        </a>
      </p>
    </EmailShell>
  );
}

export function RegistrationStatusEmail({
  name,
  eventTitle,
  referenceCode,
  status,
  lookupUrl,
}: {
  name: string;
  eventTitle: string;
  referenceCode: string;
  status: "APPROVED" | "REJECTED";
  lookupUrl: string;
}): ReactElement {
  const approved = status === "APPROVED";
  return (
    <EmailShell preview={`${referenceCode} is ${status.toLowerCase()}`}>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>
        {approved ? "You are in." : "Receipt needs another look."}
      </h1>
      <p style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6, color: hex.muted }}>
        Hi {name}, your registration for <strong>{eventTitle}</strong> (
        {referenceCode}) was {approved ? "approved" : "not approved"}.
      </p>
      <p style={{ fontFamily: "Arial, sans-serif" }}>
        <a href={lookupUrl} style={{ color: hex.primary }}>
          View status
        </a>
      </p>
    </EmailShell>
  );
}

export function VenueRequestReceivedEmail({
  organizerName,
  proposedDate,
}: {
  organizerName: string;
  proposedDate: string;
}): ReactElement {
  return (
    <EmailShell preview={`${siteConfig.cafe.name} received your venue inquiry`}>
      <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>Inquiry received</h1>
      <p style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6, color: hex.muted }}>
        Hi {organizerName}, {siteConfig.cafe.name} has your request to host on {proposedDate}.
        A coordinator will reply by email.
      </p>
    </EmailShell>
  );
}
