"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HostEventModal } from "@/components/home/host-event-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/config/site-config";
import { cn } from "@/lib/utils";

const links = [
  { href: "/events", label: "Events" },
  { href: "/lookup", label: "Lookup" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link href="/" className="flex min-w-0 items-baseline gap-2">
          <span className="font-heading text-lg font-extrabold tracking-tight text-primary">
            {siteConfig.product.wordmark[0]}
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            {siteConfig.product.wordmark[1]}
          </span>
          <span className="hidden truncate text-xs uppercase tracking-[0.22em] text-muted-foreground sm:inline">
            {siteConfig.cafe.name}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  pathname === link.href && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            <HostEventModal>
              <Button variant="ghost" className="rounded-full">
                Host
              </Button>
            </HostEventModal>
          </nav>
          <ThemeToggle />
          <ButtonLink
            href="/admin"
            variant="outline"
            className="ml-1 hidden rounded-full border-primary/30 md:inline-flex"
          >
            Admin
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
