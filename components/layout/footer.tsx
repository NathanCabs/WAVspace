import Link from "next/link";

import { siteConfig } from "@/lib/config/site-config";

const socialLinks = [
  { label: "Instagram", href: siteConfig.social.instagram },
  { label: "Facebook", href: siteConfig.social.facebook },
  { label: "TikTok", href: siteConfig.social.tiktok },
].filter((item) => item.href);

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border sm:mt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-10">
        <div>
          <p className="font-heading text-2xl font-bold tracking-tight">
            <span className="text-primary">{siteConfig.product.wordmark[0]}</span>
            {siteConfig.product.wordmark[1]}
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {siteConfig.cafe.name} booking portal — events, freebie kits, and
            manual payment verification for local hosts.
          </p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            {siteConfig.contact.address ? <p>{siteConfig.contact.address}</p> : null}
            {siteConfig.contact.email ? (
              <p>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-foreground"
                >
                  {siteConfig.contact.email}
                </a>
              </p>
            ) : null}
            {siteConfig.contact.phone ? <p>{siteConfig.contact.phone}</p> : null}
          </div>
        </div>
        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:items-end">
          <div className="flex gap-5">
            <Link href="/events" className="hover:text-foreground">
              Events
            </Link>
            <Link href="/lookup" className="hover:text-foreground">
              Lookup
            </Link>
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
          </div>
          {socialLinks.length > 0 ? (
            <div className="flex gap-5">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
