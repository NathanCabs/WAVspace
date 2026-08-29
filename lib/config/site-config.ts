import type { CSSProperties } from "react";

/**
 * White-label rebrand file.
 * Clone this repo, edit the values below, then deploy.
 * Chrome (navbar, footer, metadata, emails) always reads this object.
 * Live payment QR / bank details still prefer the `cafe_settings` row in
 * Supabase when one exists; these payment fields are the fallback.
 */
export const siteConfig = {
  product: {
    name: "WAVspace",
    title: "WAV Space",
    wordmark: ["WAV", "space"] as const,
  },
  timezone: "Asia/Manila",
  cafe: {
    name: "WAV Cafe",
    tagline: "Pour-over, playlists, and packed cupsleeve nights.",
    description:
      "WAV Cafe is a neighborhood espresso bar that opens its floor to community hosts — K-pop cupsleeve events, acoustic sets, and small-batch workshops.",
    logoUrl: null as string | null,
  },
  theme: {
    primary: "oklch(0.78 0.09 75)",
    primaryForeground: "oklch(0.18 0.03 50)",
    background: "oklch(0.16 0.015 50)",
    gold: "oklch(0.78 0.09 75)",
    cream: "oklch(0.94 0.015 85)",
    /** Hex fallbacks for emails, favicon, and OG images (no CSS variables). */
    hex: {
      primary: "#d4b07a",
      background: "#1c1814",
      cream: "#f3ece1",
      muted: "#cbbba8",
      card: "#27211c",
    },
  },
  payments: {
    gcashQr: "/payments/gcash.svg",
    mayaQr: "/payments/maya.svg",
    bankName: "BDO Unibank",
    bankAccountName: "WAV Cafe Co.",
    bankAccountNumber: "0045-8012-3388",
    ewalletName: "GCash",
    ewalletNumber: "0917 555 0142",
  },
  contact: {
    email: "hello@wav.cafe",
    phone: "+63 917 555 0142",
    address: "Makati, Metro Manila",
  },
  social: {
    instagram: "https://instagram.com/wavcafe",
    facebook: "https://facebook.com/wavcafe",
    tiktok: "",
  },
} as const;

export const themeStyle = {
  "--gold": siteConfig.theme.gold,
} as CSSProperties;
