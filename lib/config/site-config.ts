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
  cafe: {
    name: "WAV Cafe",
    tagline: "Pour-over, playlists, and packed cupsleeve nights.",
    description:
      "WAV Cafe is a neighborhood espresso bar that opens its floor to community hosts — K-pop cupsleeve events, acoustic sets, and small-batch workshops.",
    logoUrl: null as string | null,
  },
  theme: {
    primary: "oklch(0.82 0.12 78)",
    primaryForeground: "oklch(0.18 0.03 55)",
    background: "oklch(0.145 0.02 55)",
    gold: "oklch(0.82 0.12 78)",
    cream: "oklch(0.95 0.02 90)",
    /** Hex fallbacks for emails, favicon, and OG images (no CSS variables). */
    hex: {
      primary: "#f5c578",
      background: "#1a1410",
      cream: "#f6efe4",
      muted: "#d8cbb8",
      card: "#241c16",
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
  "--primary": siteConfig.theme.primary,
  "--primary-foreground": siteConfig.theme.primaryForeground,
  "--ring": siteConfig.theme.primary,
  "--gold": siteConfig.theme.gold,
  "--background": siteConfig.theme.background,
  "--cream": siteConfig.theme.cream,
  "--sidebar-primary": siteConfig.theme.primary,
  "--sidebar-ring": siteConfig.theme.primary,
  "--chart-1": siteConfig.theme.primary,
} as CSSProperties;
